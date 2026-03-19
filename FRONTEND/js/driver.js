window.onload = async function() {

  // =============================
  // AUTH CHECK
  // =============================
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/landing.html";
    return;
  }

  // =============================
  // DATE
  // =============================
  const dateEl = document.getElementById("topbar-date");
  if (dateEl) dateEl.innerText = new Date().toLocaleString();

  // =============================
  // PARTICLES
  // =============================
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

  try {

    // =============================
    // LOAD DRIVER ROUTE FROM BACKEND
    // =============================
    const driver = localStorage.getItem("driver");

    const routeRes = await fetch(`/api/driver/route/${driver}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const routeData = await routeRes.json();

    // backend already returns only bins assigned to this driver
    const bins = (routeData.bins || []).map(b => ({
      ...b,
      fillLevel: typeof b.fillLevel === "number" ? b.fillLevel : 0,
      location: b.location ?? b.binId ?? "Bin"
    }));


    // driver alerts are derived from assigned bins
    const alerts = bins
      .filter(b => b.fillLevel >= 90)
      .map(b => ({
        message: `Critical bin ${b.binId}`
      }));


    // =============================
    // KPI CALCULATIONS
    // =============================
    const totalBins = bins.length;
    const totalAlerts = bins.filter(b => b.fillLevel >= 90).length;

    // A bin is considered collected when it is empty
    const collectedBins = bins.filter(b => b.fillLevel === 0).length;

    const remainingBins = totalBins - collectedBins;

    document.getElementById("totalBins").innerText = totalBins;
    document.getElementById("alertBins").innerText = totalAlerts;
    document.getElementById("collectedBins").innerText = collectedBins;
    document.getElementById("remainingBins").innerText = remainingBins;


    // =============================
    // ALERT PANEL
    // =============================
    const alertsPanel = document.getElementById("alertsPanel");
    alertsPanel.innerHTML = "";

    alerts.slice(0,5).forEach(alert => {
      const li = document.createElement("li");
      li.innerText = alert.message || "Critical bin alert";
      alertsPanel.appendChild(li);
    });


    // =============================
    // PIE CHART
    // =============================
    const normalBins = bins.filter(b => b.fillLevel < 70).length;
    const warningBins = bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 90).length;
    const criticalBins = bins.filter(b => b.fillLevel >= 90).length;

    const pieCtx = document.getElementById("pieChart").getContext("2d");

    new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Normal", "Warning", "Critical"],
        datasets: [{
          data: [normalBins, warningBins, criticalBins]
        }]
      },
      options: { responsive: true }
    });


    // =============================
    // BAR CHART (BIN FILL LEVEL)
    // =============================
    const locations = bins.map(b => b.location);
    const fillLevels = bins.map(b => b.fillLevel);

    const barCtx = document.getElementById("barChart").getContext("2d");

    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: locations,
        datasets: [{
          label: "Fill Level %",
          data: fillLevels
        }]
      },
      options: { responsive: true }
    });


    // =============================
    // MAP WITH BIN LOCATIONS
    // =============================
    const map = L.map("dashboardMap").setView([22.5726, 88.3639], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);

    const bounds = [];

    bins.forEach(bin => {

      if (!bin.latitude || !bin.longitude) return;

      const level = typeof bin.fillLevel === "number" ? bin.fillLevel : 0;

      let color = "green";
      if (level >= 90) color = "red";
      else if (level >= 70) color = "orange";

      const marker = L.circleMarker([
        bin.latitude,
        bin.longitude
      ], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`
        <b>${bin.binId}</b><br>
        ${bin.location}<br>
        Fill: ${bin.fillLevel}%
      `);

      bounds.push([bin.latitude, bin.longitude]);

    });

    if (bounds.length) map.fitBounds(bounds);


  } catch (err) {
    console.error("Driver dashboard load error:", err);
  }

  // =============================
  // AUTO REFRESH DRIVER DATA
  // =============================
  setInterval(async () => {
    try {

      const token = localStorage.getItem("token");
      const driver = localStorage.getItem("driver");

      if (!token || !driver) return;

      const routeRes = await fetch(`/api/driver/route/${driver}`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const routeData = await routeRes.json();

      // reload page if route changed
      if (routeData && routeData.bins) {
        location.reload();
      }

    } catch (err) {
      console.error("Auto refresh error:", err);
    }

  }, 30000); // 30 seconds
};