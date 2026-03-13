let liveTrucks = [];

async function populateTables() {
  try {
    const res = await fetch("/api/trucks");
    const trucksFromAPI = await res.json();

    liveTrucks = trucksFromAPI.map((t, i) => ({
      id: t.truckId,
      route: "Auto Route",
      lastPing: "Just now",
      load: Math.floor(Math.random()*90) + "%",
      eta: Math.floor(Math.random()*60) + " mins",
      status: t.status === "active" ? "On schedule" : "Idle"
    }));
  } catch(err) {
    console.error("Failed to load trucks", err);
  }

  // existing function code continues here...
}

populateTables();