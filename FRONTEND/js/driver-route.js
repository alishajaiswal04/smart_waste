document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // CREATE MAP
  // =============================
  const map = L.map("routeMap").setView([22.5726, 88.3639], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  // =============================
  // LOAD DRIVER ROUTE FROM BACKEND
  // =============================
  async function initRoute() {
    try {

      const token = localStorage.getItem("token");
      const driver = localStorage.getItem("driver");

      const res = await fetch(`/api/driver/route/${driver}`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();

      console.log("Driver route data:", data);

      const bins = data.bins || [];

      loadRoute(bins);

    } catch (err) {
      console.error("Error loading route:", err);
    }
  }

  // =============================
  // DRAW ROUTE + MARKERS
  // =============================
  function loadRoute(bins) {

    const routePoints = [];
    const bounds = [];

    bins.forEach((bin, index) => {

      if (!bin.latitude || !bin.longitude) return;

      const point = [bin.latitude, bin.longitude];

      bounds.push(point);
      routePoints.push(point);

      const marker = L.marker(point).addTo(map);

      marker.bindPopup(
        `<b>Bin:</b> ${bin.binId}<br>
         <b>Location:</b> ${bin.latitude}, ${bin.longitude}`
      );

    });

    if (bounds.length) {
      map.fitBounds(bounds);
    }

    if (routePoints.length >= 2) {
      L.polyline(routePoints, { color: "green", weight: 4 }).addTo(map);
    }

  }

  // start loading route
  initRoute();

  // fix map rendering
  setTimeout(() => {
    map.invalidateSize();
  }, 300);

});