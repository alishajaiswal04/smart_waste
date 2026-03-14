// routes-trucks.js
// JS for routes-trucks.html (separated from HTML)

// Topbar date
(function setTopbarDate() {
  const el = document.getElementById("topbar-date");
  if (!el) return;
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

// Demo data
const kpiData = {
  activeRoutes: 7,
  trucksOnRoad: 5,
  kmNext6h: 138,
  fuelSavingPct: 19
};

const liveTrucks = [
  { id: "TRK-092", route: "R-101 – Market Cluster", lastPing: "00:41", load: "78%", eta: "24 mins", status: "On schedule" },
  { id: "TRK-075", route: "R-204 – Ward 3", lastPing: "00:39", load: "63%", eta: "41 mins", status: "Slight delay" },
  { id: "TRK-118", route: "R-305 – Park & Public Spaces", lastPing: "00:37", load: "52%", eta: "68 mins", status: "On schedule" },
  { id: "TRK-061", route: "R-406 – Residential Sweep", lastPing: "00:35", load: "34%", eta: "92 mins", status: "Low priority" },
  { id: "TRK-044", route: "R-509 – Hotel / Restaurant Strip", lastPing: "00:34", load: "86%", eta: "16 mins", status: "Overload risk" }
];

const plannerRoutes = [
  { start: "01:15 AM", route: "R-101 – Market Cluster", bins: "8 bins (3 critical)", distance: "26 km", truck: "TRK-092", priority: "High" },
  { start: "02:00 AM", route: "R-204 – Ward 3", bins: "6 bins (2 critical)", distance: "21 km", truck: "TRK-075", priority: "High" },
  { start: "03:10 AM", route: "R-305 – Park & Public Spaces", bins: "7 bins (1 warning)", distance: "24 km", truck: "TRK-118", priority: "Medium" },
  { start: "04:20 AM", route: "R-406 – Residential Sweep", bins: "10 bins", distance: "31 km", truck: "TRK-061", priority: "Low" },
  { start: "05:05 AM", route: "R-509 – Hotel / Restaurant Strip", bins: "5 bins (3 critical)", distance: "19 km", truck: "TRK-044", priority: "High" }
];

const fuelSummary = [
  { label: "Trips avoided vs fixed schedule", value: "4 trips", badge: "Rule-based bin threshold" },
  { label: "Km reduced (today)", value: "37 km", badge: "Skipped near-empty clusters" },
  { label: "Fuel saved (estimate)", value: "19%", badge: "Against 16-hr static baseline" },
  { label: "Average truck fill at depot", value: "81%", badge: "Better utilisation" }
];

// Populate KPIs
const setIfExists = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
};
setIfExists("kpi-active-routes", kpiData.activeRoutes);
setIfExists("kpi-trucks-road", kpiData.trucksOnRoad);
setIfExists("kpi-km-next", kpiData.kmNext6h + " km");
setIfExists("kpi-fuel-saving", kpiData.fuelSavingPct + "%");

// Populate tables & lists
(function populateTables() {
  const truckTableBody = document.querySelector("#truck-status-table tbody");
  if (truckTableBody) {
    liveTrucks.forEach((t) => {
      const tr = document.createElement("tr");

      let statusClass = "status-normal";
      const s = (t.status || "").toLowerCase();
      if (s.includes("delay") || s.includes("risk") || s.includes("overload")) {
        statusClass = "status-warning";
      }

      tr.innerHTML = `
        <td>${t.id}</td>
        <td class="route-cell">${t.route}</td>

        <td>${t.lastPing}</td>
        <td>${t.load}</td>
        <td>${t.eta}</td>
        <td><span class="status-pill ${statusClass}">${t.status}</span></td>
      `;
      truckTableBody.appendChild(tr);
    });
  }

  const plannerTableBody = document.querySelector("#route-planner-table tbody");
  if (plannerTableBody) {
    plannerRoutes.forEach((r) => {
      let priorityClass = "priority-med";
      if (r.priority === "High") priorityClass = "priority-high";
      if (r.priority === "Low") priorityClass = "priority-low";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.start}</td>
        <td class="route-cell">${r.route}</td>

        <td>${r.bins}</td>
        <td>${r.distance}</td>
        <td>${r.truck}</td>
        <td class="${priorityClass}">${r.priority}</td>
      `;
      plannerTableBody.appendChild(tr);
    });
  }

  const fuelList = document.getElementById("fuel-summary-list");
  if (fuelList) {
    fuelSummary.forEach((item) => {
      const li = document.createElement("li");
      li.className = "summary-item";
      li.innerHTML = `
        <div>
          <div class="summary-label">${item.label}</div>
          <div class="summary-value">${item.value}</div>
        </div>
        <div class="summary-badge">${item.badge}</div>
      `;
      fuelList.appendChild(li);
    });
  }
})();

// =============================
// LOAD AI TRUCK DISPATCH PLAN
// =============================

async function loadDispatchPlan() {
  try {
    const res = await fetch("/api/ai/cluster");
    const data = await res.json();
    const plans = data.dispatchPlan || [];

    const tableBody = document.querySelector("#dispatch-plan-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    plans.forEach((plan) => {
      const tr = document.createElement("tr");

      const bins = Array.isArray(plan.bins)
        ? plan.bins.join(", ")
        : "";

      tr.innerHTML = `
        <td>${plan.cluster}</td>
        <td>${plan.area}</td>
        <td>${plan.truck}</td>
        <td>${plan.truck_capacity}</td>
        <td>${plan.total_waste}</td>
        <td>${bins}</td>
      `;

      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed loading dispatch plan:", err);
  }
}

// run when page loads: load bins first, then dispatch plan
loadBins().then(() => {
  loadDispatchPlan();
  setInterval(loadDispatchPlan, 10000);
});

// =============================
// REAL-TIME TRUCK + BIN MAP
// =============================

if (typeof L !== "undefined") {

  const socket = io("http://localhost:8080");

  // Initialize map
  let map;

  if (window.map) {
    map = window.map;
  } else {
    map = L.map("truckMap").setView([19.9975, 73.7898], 13);
    window.map = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);
  }

  const truckMarkers = {};
  const binMarkers = {};

  // Waste depot marker
  const depot = [19.995, 73.785];
  L.marker(depot).addTo(map).bindPopup("Waste Depot");

  // Load bins from backend
  async function loadBins() {
    try {
      const res = await fetch("/api/bins");
      const bins = await res.json();

      bins.forEach(bin => {

        if (!bin.latitude || !bin.longitude) return;

        const icon = L.icon({
          iconUrl:
            bin.fillLevel >= 90
              ? "https://cdn-icons-png.flaticon.com/512/565/565547.png"
              : "https://cdn-icons-png.flaticon.com/512/484/484662.png",
          iconSize: [26, 26]
        });

        binMarkers[bin.binId] = L.marker(
          [bin.latitude, bin.longitude],
          { icon }
        )
          .addTo(map)
          .bindPopup(`<b>${bin.binId}</b><br>Fill: ${bin.fillLevel}%`);

      });
      return bins;
    } catch (err) {
      console.error("Failed loading bins:", err);
    }
  }

  // loadBins(); // Now called on page load above, before dispatch plan

  // Listen for truck GPS updates
  socket.on("truck-location", (truck) => {

    if (!truck.latitude || !truck.longitude) return;

    const pos = [truck.latitude, truck.longitude];

    if (!truckMarkers[truck.truckId]) {

      const icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995506.png",
        iconSize: [34, 34]
      });

      truckMarkers[truck.truckId] = L.marker(pos, { icon })
        .addTo(map)
        .bindPopup(`<b>${truck.truckId}</b><br>Driver: ${truck.driver}`);

    } else {

      truckMarkers[truck.truckId].setLatLng(pos);

    }

  });

}

// particles.js config
if (typeof particlesJS !== "undefined") {
  try {
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
  } catch (err) {
    console.warn("particles.js init failed:", err);
  }
}

// anime.js entrance animations
window.addEventListener("load", () => {
  if (typeof anime !== "undefined") {
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
  }
});

// Sidebar collapse / expand
(function sidebarToggleSetup() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-collapsed");
    });
  }
})();

// three.js low-poly city background
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
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  const city = new THREE.Group();
  scene.add(city);

  const groundGeom = new THREE.PlaneGeometry(120, 120);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0xe0f7fa,
    flatShading: true
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  city.add(ground);

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