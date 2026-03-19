const axios = require("axios");
const Bin = require("../models/Bin");
const Truck = require("../models/Truck");
const Route = require("../models/Route");
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
      waste_weight_kg: b.waste_weight_kg || 0
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

      const binData = binsFromDB.find(b => b.binId === bin.bin_id);

      if (!binData) return;

      grouped[bin.cluster].push({
  binId: bin.bin_id,
  latitude: binData.latitude,
  longitude: binData.longitude,
  location: binData.location,
  fillLevel: binData.fillLevel,
  waste_weight_kg: binData.waste_weight_kg || 0
});

    });

    // fetch trucks from database (exclude maintenance trucks)
    const trucksFromDB = await Truck.find({ status: { $ne: "maintenance" } });

    const trucks = trucksFromDB.map(t => ({
      id: t.truckId,
      capacity: t.capacity,
      driver: t.driver
    }));

    // assign trucks to clusters without repeating the same truck every time
    const availableTrucks = [...trucks];
    const dispatchPlan = [];

    Object.keys(grouped).forEach((clusterId, index) => {

      const waste = clusterWaste[clusterId] || 0;

      // try to find a truck that can handle this waste
      let truckIndex = availableTrucks.findIndex(t => t.capacity >= waste);

      // if none fits, just rotate trucks
      if (truckIndex === -1) {
        truckIndex = availableTrucks.length > 0 ? 0 : -1;
      }

      // remove the chosen truck so it is not reused
      const truck =
        availableTrucks.length > 0
          ? availableTrucks.splice(truckIndex, 1)[0]
          : {};

      dispatchPlan.push({
  cluster: Number(clusterId),
  area: grouped[clusterId][0]?.location || "Unknown",
  truck: truck.id || "N/A",
  driver: truck.driver || "Unassigned",
  truck_capacity: truck.capacity || 0,
  total_waste: waste,
  bins: grouped[clusterId]
});

    });

    // clear old routes
    await Route.deleteMany({});

    // save new routes
    for (const plan of dispatchPlan) {
      await Route.create({
        driver: plan.driver,
        truck: plan.truck,
        cluster: plan.cluster,
        bins: plan.bins,
        totalWaste: plan.total_waste
      });
    }

    res.json({ dispatchPlan });

  } catch (error) {
    console.error("AI clustering error:", error.message);
    res.status(500).json({ message: "AI clustering failed", error: error.message });
  }
};

exports.getDriverRoute = async (req, res) => {
  try {

    const driverName = req.params.driver;

    if (!driverName) {
      return res.status(400).json({ message: "Driver name is required" });
    }

    const route = await Route.findOne({ driver: driverName }).lean();

    if (!route) {
      return res.json({
        driver: driverName,
        bins: []
      });
    }

    // return only the relevant route information
    res.json({
      driver: route.driver,
      truck: route.truck,
      cluster: route.cluster,
      bins: route.bins || [],
      totalWaste: route.totalWaste || 0
    });

  } catch (error) {
    console.error("Driver route fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch driver route" });
  }
};