// Reuse date logic
(function setTopbarDate() {
  const el = document.getElementById("topbar-date");
  const now = new Date();
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  el.textContent = now.toLocaleString(undefined, options);
})();

// Live bins dataset (loaded from backend)
let bins = [];

async function loadBins() {
  try {
    const res = await fetch("/api/bins");
    const data = await res.json();

    // determine map bounds dynamically from database coordinates
    const lats = data.map(b => b.latitude);
    const lons = data.map(b => b.longitude);

    const MIN_LAT = Math.min(...lats);
    const MAX_LAT = Math.max(...lats);
    const MIN_LON = Math.min(...lons);
    const MAX_LON = Math.max(...lons);

    // convert backend bins to frontend format
    bins = data.map((b, i) => {
      const latRatio = (b.latitude - MIN_LAT) / (MAX_LAT - MIN_LAT || 1);
      const lonRatio = (b.longitude - MIN_LON) / (MAX_LON - MIN_LON || 1);

      return {
        id: b.binId,
        area: "ward-" + ((i % 3) + 1),
        areaLabel: "Ward " + ((i % 3) + 1),
        type: "public",
        typeLabel: "Smart Bin",
        fill: b.fillLevel,
        status: b.status.toLowerCase(),
        coords: {
          left: (lonRatio * 70 + 20) + "%",
          top: (latRatio * 60 + 20) + "%"
        },
        lastCollected: new Date(b.lastCollected).toLocaleString(),
        avgDailyKg: 20 + (i * 5),
        sensorStatus: "Online",
        notes: b.location
      };
    });

    reRender();
  } catch (err) {
    console.error("Error loading bins:", err);
  }
}

const mapContainer = document.getElementById("bins-map");
const tableBody = document.querySelector("#bins-table tbody");
const selectedDetails = document.getElementById("selected-bin-details");
const selectedTag = document.getElementById("selected-bin-tag");

// Filters
const filterArea = document.getElementById("filter-area");
const filterStatus = document.getElementById("filter-status");
const filterType = document.getElementById("filter-type");
const filterSearch = document.getElementById("filter-search");

// === Render map dots ===
function renderDots(filteredBins) {
  // Clear old dots (keep fake label)
  [...mapContainer.querySelectorAll(".bin-dot")].forEach(el => el.remove());

  filteredBins.forEach(bin => {
    const statusClass =
      bin.status === "critical"
        ? "red"
        : bin.status === "warning"
        ? "yellow"
        : "green"; // normal

    const dot = document.createElement("div");
    dot.className = `bin-dot ${statusClass}`;
    dot.style.left = bin.coords.left;
    dot.style.top = bin.coords.top;
    dot.title = `${bin.id} – ${bin.fill}%`;
    dot.addEventListener("click", () => selectBin(bin));
    mapContainer.appendChild(dot);
  });
}


// === Render table ===
function renderTable(filteredBins) {
  tableBody.innerHTML = "";
  filteredBins.forEach(bin => {
    const tr = document.createElement("tr");
    const statusClass =
      bin.status === "critical"
        ? "status-critical"
        : bin.status === "warning"
        ? "status-warning"
        : "status-normal";

    tr.innerHTML = `
      <td>${bin.id}</td>
      <td>${bin.areaLabel}</td>
      <td>${bin.typeLabel}</td>
      <td>${bin.fill}%</td>
      <td><span class="status-pill ${statusClass}">${bin.status}</span></td>
    `;
    tr.addEventListener("click", () => selectBin(bin));
    tableBody.appendChild(tr);
  });
}

// === Select bin ===
function selectBin(bin) {
  selectedTag.textContent = bin.id;
  selectedDetails.innerHTML = `
    <div class="selected-bin-meta">
      <div>
        <div class="selected-bin-title">${bin.id}</div>
        <div class="selected-bin-sub">
          ${bin.areaLabel} • ${bin.typeLabel}
        </div>
      </div>
      <div class="selected-bin-fill">
        <div class="selected-bin-fill-value">${bin.fill}%</div>
        <div class="selected-bin-fill-label">Current fill level</div>
      </div>
    </div>

    <ul class="selected-bin-info">
      <li><span>Last Collected:</span> ${bin.lastCollected}</li>
      <li><span>Average Daily Waste:</span> ${bin.avgDailyKg} kg</li>
      <li><span>Sensor Status:</span> ${bin.sensorStatus}</li>
      <li><span>System Notes:</span> ${bin.notes}</li>
    </ul>
  `;
}

// === Apply filters ===
function getFilteredBins() {
  const area = filterArea.value;
  const status = filterStatus.value;
  const type = filterType.value;
  const search = filterSearch.value.trim().toLowerCase();

  return bins.filter(bin => {
    if (area !== "all" && bin.area !== area) return false;
    if (status !== "all" && bin.status !== status) return false;
    if (type !== "all" && bin.type !== type) return false;
    if (search) {
      const composite =
        (bin.id + " " + bin.areaLabel + " " + bin.typeLabel).toLowerCase();
      if (!composite.includes(search)) return false;
    }
    return true;
  });
}

function reRender() {
  const filtered = getFilteredBins();
  renderDots(filtered);
  renderTable(filtered);
  if (!filtered.length) {
    selectedTag.textContent = "None selected";
    selectedDetails.innerHTML =
      "<p>No bins match the current filter selection.</p>";
  }
}

// Hook up filters
[filterArea, filterStatus, filterType].forEach(sel =>
  sel.addEventListener("change", reRender)
);
filterSearch.addEventListener("input", reRender);

// Load bins from backend then render
loadBins();

// realtime updates
if (typeof io !== "undefined") {
  const socket = io();

  socket.on("bin-update", () => {
    console.log("Realtime bin update received");
    loadBins();
  });
}


// === anime.js entrance animation ===
window.addEventListener("load", () => {
  anime({
    targets: ".card",
    translateY: [30, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    easing: "easeOutQuad",
    duration: 650
  });
});
// === Sidebar collapse / expand on logo click ===
const sidebarToggle = document.getElementById("sidebarToggle");
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });
}

// // === Theme toggle (light / dark) ===
// const themeToggleBtn = document.getElementById("theme-toggle");

// // apply saved theme on load
// const savedTheme = localStorage.getItem("sw-theme");
// if (savedTheme === "dark") {
//   document.body.classList.add("theme-dark");
//   if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
// }

// if (themeToggleBtn) {
//   themeToggleBtn.addEventListener("click", () => {
//     document.body.classList.toggle("theme-dark");
//     const isDark = document.body.classList.contains("theme-dark");

//     themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
//     localStorage.setItem("sw-theme", isDark ? "dark" : "light");
//   });
// }


// === three.js low-poly smart city background (same as dashboard) ===
(function initThreeBackground() {
  const container = document.getElementById("three-bg");
  if (!container) {
    console.warn("three-bg container not found");
    return;
  }
  if (typeof THREE === "undefined") {
    console.warn("THREE.js not loaded");
    return;
  }

  console.log("Three.js city background initialising (bin monitoring)...");

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe0f2f1, 0.02);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(25, 30, 40);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // transparent
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  // City group
  const city = new THREE.Group();
  scene.add(city);

  // Ground
  const groundGeom = new THREE.PlaneGeometry(120, 120);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0xe0f7fa,
    flatShading: true
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  city.add(ground);

  // Road grid
  const roadMat = new THREE.LineBasicMaterial({ color: 0xb0bec5 });
  const roadGroup = new THREE.Group();
  const gridSize = 120;
  const step = 10;
  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    const geomH = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridSize / 2, 0.01, i),
      new THREE.Vector3(gridSize / 2, 0.01, i)
    ]);
    roadGroup.add(new THREE.Line(geomH, roadMat));

    const geomV = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, 0.01, -gridSize / 2),
      new THREE.Vector3(i, 0.01, gridSize / 2)
    ]);
    roadGroup.add(new THREE.Line(geomV, roadMat));
  }
  city.add(roadGroup);

  // Buildings
  function createBuilding(x, z, w, d, h, color) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({ color, flatShading: true });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, h / 2, z);
    return mesh;
  }

  const buildingColors = [0x22c55e, 0x0ea5e9, 0x4ade80, 0x0f766e];
  for (let x = -40; x <= 40; x += 10) {
    for (let z = -40; z <= 40; z += 10) {
      if ((Math.abs(x) < 5 && Math.abs(z) < 5) || Math.random() < 0.25) continue;
      const w = 5 + Math.random() * 2;
      const d = 5 + Math.random() * 2;
      const h = 6 + Math.random() * 12;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      city.add(createBuilding(x, z, w, d, h, color));
    }
  }

  // Tiny trucks
  const trucks = [];
  const truckGeom = new THREE.BoxGeometry(2.2, 1.2, 1.4);
  const truckMat = new THREE.MeshPhongMaterial({
    color: 0xff7043,
    flatShading: true
  });

  function addTruck(pathZ, direction) {
    const mesh = new THREE.Mesh(truckGeom, truckMat);
    mesh.position.set(-gridSize / 2, 0.7, pathZ);
    mesh.userData = {
      direction,
      speed: 0.08 + Math.random() * 0.04
    };
    trucks.push(mesh);
    city.add(mesh);
  }

  addTruck(-15, 1);
  addTruck(5, 1);
  addTruck(25, 1);

  // Mouse parallax
  const mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.x = x;
    mouse.y = y;
  });

  function animate() {
    requestAnimationFrame(animate);

    const t = performance.now() * 0.0003;
    const targetRotY = mouse.x * 0.25 + t * 0.08;
    const targetRotX = -0.4 + mouse.y * 0.15;
    city.rotation.y += (targetRotY - city.rotation.y) * 0.04;
    city.rotation.x += (targetRotX - city.rotation.x) * 0.04;

    trucks.forEach((truck) => {
      truck.position.x += truck.userData.speed * truck.userData.direction;
      if (truck.position.x > gridSize / 2) {
        truck.position.x = -gridSize / 2;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();