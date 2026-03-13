// === Socket.IO real-time connection ===
const socket = typeof io !== "undefined" ? io() : null;

if (socket) {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("bin-update", (bin) => {
    console.log("Live bin update received:", bin);

    // If dashboard loader exists, refresh data
    if (typeof loadDashboard === "function") {
      loadDashboard();
    }
  });
}

// === Load dashboard data from backend ===
async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard");
    const data = await res.json();

    // Update KPI cards if they exist
    const totalBinsEl = document.getElementById("kpi-total-bins");
    const alertsEl = document.getElementById("kpi-active-alerts");
    const tripsEl = document.getElementById("kpi-trips");
    const avgFillEl = document.getElementById("kpi-avg-fill");

    if (data.kpis) {
      if (totalBinsEl) totalBinsEl.textContent = data.kpis.totalBins;
      if (alertsEl) alertsEl.textContent = data.kpis.activeAlerts;
      if (tripsEl) tripsEl.textContent = data.kpis.tripsToday;
      if (avgFillEl) avgFillEl.textContent = data.kpis.avgFill + "%";
    }

    // Update critical bins table
    const tableBody = document.querySelector("#critical-bins-table tbody");
    if (tableBody && data.criticalBins) {
      tableBody.innerHTML = "";

      data.criticalBins.forEach(bin => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${bin.binId}</td>
          <td>${bin.location}</td>
          <td>${bin.fillLevel}%</td>
          <td>${new Date(bin.lastCollected).toLocaleString()}</td>
          <td><span class="status-pill status-critical">${bin.status}</span></td>
        `;
        tableBody.appendChild(tr);
      });
    }

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// Initial load
loadDashboard();

// === Topbar date ===
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

// === particles.js config ===
particlesJS("particles-js", {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 900 } },
    color: { value: ["#22c55e", "#0ea5e9", "#a3e635"] },
    shape: { type: "circle" },
    opacity: { value: 0.4, random: false },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 130,
      color: "#a5b4fc",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 1.3,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: false },
      resize: true
    },
    modes: {
      grab: { distance: 150, line_linked: { opacity: 0.6 } }
    }
  },
  retina_detect: true
});

// === anime.js animations ===
window.addEventListener("load", () => {
  anime({
    targets: ".kpi-card",
    translateY: [40, 0],
    opacity: [0, 1],
    delay: anime.stagger(90),
    easing: "easeOutQuad",
    duration: 700
  });

  anime({
    targets: ".card",
    translateY: [30, 0],
    opacity: [0, 1],
    delay: anime.stagger(80, { start: 350 }),
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


console.log("app.js loaded");  // TEST

/// === three.js low-poly smart city background ===
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

  console.log("Three.js city background initialising...");

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
  renderer.setClearColor(0x000000, 0); // transparent over your UI
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(20, 40, 20);
  dirLight.castShadow = false;
  scene.add(dirLight);

  // City group
  const city = new THREE.Group();
  scene.add(city);

  // Ground plane
  const groundGeom = new THREE.PlaneGeometry(120, 120);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0xe0f7fa,
    flatShading: true
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  city.add(ground);

  // Road grid (simple lines)
  const roadMat = new THREE.LineBasicMaterial({ color: 0xb0bec5, linewidth: 1 });
  const roadGroup = new THREE.Group();
  const gridSize = 120;
  const step = 10;
  for (let i = -gridSize / 2; i <= gridSize / 2; i += step) {
    const geomH = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-gridSize / 2, 0.01, i),
      new THREE.Vector3(gridSize / 2, 0.01, i)
    ]);
    const lineH = new THREE.Line(geomH, roadMat);
    roadGroup.add(lineH);

    const geomV = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, 0.01, -gridSize / 2),
      new THREE.Vector3(i, 0.01, gridSize / 2)
    ]);
    const lineV = new THREE.Line(geomV, roadMat);
    roadGroup.add(lineV);
  }
  city.add(roadGroup);

  // Helper to make a building
  function createBuilding(x, z, w, d, h, color) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({
      color,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, h / 2, z);
    return mesh;
  }

  // Generate low-poly buildings in blocks (leave some roads empty)
  const buildingColors = [0x22c55e, 0x0ea5e9, 0x4ade80, 0x0f766e];
  for (let x = -40; x <= 40; x += 10) {
    for (let z = -40; z <= 40; z += 10) {
      // Skip some tiles so it doesn't look too dense
      if ((Math.abs(x) < 5 && Math.abs(z) < 5) || Math.random() < 0.25) continue;

      const w = 5 + Math.random() * 2;
      const d = 5 + Math.random() * 2;
      const h = 6 + Math.random() * 12;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const building = createBuilding(x, z, w, d, h, color);
      city.add(building);
    }
  }

  // Tiny "smart waste trucks" moving on roads
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

  // Mouse-based orbit/parallax
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

    // Gentle city rotation based on mouse
    const targetRotY = mouse.x * 0.25 + t * 0.08;
    const targetRotX = -0.4 + mouse.y * 0.15;
    city.rotation.y += (targetRotY - city.rotation.y) * 0.04;
    city.rotation.x += (targetRotX - city.rotation.x) * 0.04;

    // Move trucks along straight roads
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
const map = L.map('map').setView([19.9975, 73.7898], 13); // Nashik

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// === Live Truck Tracking (Socket.io + Leaflet) ===
let truckMarkers = {};

if (socket) {
  socket.on("truck-location", (truck) => {

    const lat = truck.latitude;
    const lng = truck.longitude;

    if (!lat || !lng) return;

    // Create marker if truck not yet on map
    if (!truckMarkers[truck.truckId]) {

      truckMarkers[truck.truckId] = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995506.png",
          iconSize: [32, 32]
        })
      }).addTo(map);

      truckMarkers[truck.truckId].bindPopup(
        `<b>${truck.truckId}</b><br>Driver: ${truck.driver || "Unknown"}`
      );

    } else {

      // Move truck marker to new GPS location
      truckMarkers[truck.truckId].setLatLng([lat, lng]);

    }

  });
}

let markers = [];

function updateMap(bins){
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  bins.forEach(bin => {

    let color = "green";
    if(bin.fillLevel > 90) color = "red";
    else if(bin.fillLevel > 70) color = "orange";

    const marker = L.circleMarker(
      [19.99 + Math.random()*0.02, 73.78 + Math.random()*0.02],
      {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
      }
    ).addTo(map);

    marker.bindPopup(
      `<b>${bin.binId}</b><br>
      ${bin.location}<br>
      Fill: ${bin.fillLevel}%`
    );

    markers.push(marker);
  });
}