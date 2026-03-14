const axios = require("axios");
const Bin = require("../models/Bin");
const Truck = require("../models/Truck");

exports.clusterBins = async (req, res) => {
  console.log("AI cluster route triggered");
  try {

    const binsFromDB = await Bin.find();
    console.log("MongoDB bins:", binsFromDB);
    if (!binsFromDB || binsFromDB.length === 0) {
      return res.json({ message: "No bins found in database", clusters: [] });
    }

    const bins = binsFromDB.map(b => ({
      bin_id: b.binId,
      latitude: b.latitude,
      longitude: b.longitude,
      waste_weight_kg: b.waste_weight_kg
    }));
    console.log("Transformed bins for AI:", bins);

    const response = await axios.post(
      "http://127.0.0.1:8000/cluster",
      bins,
      { timeout: 10000 }
    );

    console.log("AI response:", response.data);

    const clusters = response.data.clusters;
    const clusterWaste = response.data.cluster_waste;

    // group bins by cluster
    const grouped = {};
    clusters.forEach(bin => {
      if (bin.cluster === -1) return; // ignore outliers

      if (!grouped[bin.cluster]) {
        grouped[bin.cluster] = [];
      }

      grouped[bin.cluster].push(bin.bin_id);
    });

    // fetch trucks from database (exclude maintenance trucks)
    const trucksFromDB = await Truck.find({ status: { $ne: "maintenance" } });

    const trucks = trucksFromDB.map(t => ({
      id: t.truckId,
      capacity: t.capacity,
      driver: t.driver
    }));

    const dispatchPlan = Object.keys(grouped).map((clusterId, index) => {
      const truck = trucks[index % trucks.length] || {};

      return {
        cluster: Number(clusterId),
        truck: truck.id || "N/A",
        driver: truck.driver || "Unassigned",
        truck_capacity: truck.capacity || 0,
        total_waste: clusterWaste[clusterId] || 0,
        bins: grouped[clusterId]
      };
    });

    res.json({ dispatchPlan });

  } catch (error) {
    console.error("AI clustering error:", error.message);
    res.status(500).json({ message: "AI clustering failed", error: error.message });
  }
};