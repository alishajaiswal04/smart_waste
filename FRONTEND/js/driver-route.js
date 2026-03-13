document.addEventListener("DOMContentLoaded", () => {
// PARTICLES
particlesJS("particles-js", {
  particles: {
    number: { value: 80 },
    color: { value: "#22c55e" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: { enable: true, distance: 150, color: "#22c55e", opacity: 0.4, width: 1 },
    move: { enable: true, speed: 2 }
  }
});

// CREATE MAP
const map = L.map("routeMap").setView([20.0, 73.79], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// Assuming loadRoute function exists and bins data is available
function loadRoute(bins) {
  const routePoints = [];
  const bounds = [];

  bins.forEach(bin => {

    if (!bin.latitude || !bin.longitude) return;

    const point = [bin.latitude, bin.longitude];

    bounds.push(point);

    // marker color based on fill level
    let color = "green";
    if (bin.fillLevel >= 90) color = "red";
    else if (bin.fillLevel >= 70) color = "orange";

    const marker = L.circleMarker(point, {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindPopup(`<b>${bin.binId}</b><br>${bin.location}<br>Fill: ${bin.fillLevel}%`);

    // critical bins form the route
    if (bin.fillLevel >= 90) {
      routePoints.push(point);
    }

  });

  if (bounds.length) {
    map.fitBounds(bounds);
  }

  if (routePoints.length >= 2) {
    const routeLine = L.polyline(routePoints, { color: "green", weight: 4 }).addTo(map);
  }
}

// =============================
// LOAD BINS FROM BACKEND
// =============================
async function initRoute() {
  try {

    const token = localStorage.getItem("token");

    const res = await fetch("/api/bins", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const bins = await res.json();

    console.log("Bins received for route:", bins);

    loadRoute(bins);

  } catch (err) {
    console.error("Error loading route:", err);
  }
}

// run on page load
initRoute();

// Fix map rendering when container loads
setTimeout(() => {
  map.invalidateSize();
}, 300);

});