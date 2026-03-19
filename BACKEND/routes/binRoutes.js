const express = require("express");
const router = express.Router();

const binController = require("../controllers/binController");

router.get("/", async (req, res) => {
  try {
    const Bin = require("../models/Bin");

    // fetch all bins including coordinates and status
    const bins = await Bin.find().lean();

    res.json(bins);

  } catch (error) {
    console.error("Error fetching bins:", error);
    res.status(500).json({ message: "Failed to fetch bins" });
  }
});

router.post("/update", binController.updateBinStatus);

router.post("/add", async (req, res) => {
  try {
    const Bin = require("../models/Bin");

    const { binId, location, latitude, longitude, capacity_kg } = req.body;

    if (!binId || !latitude || !longitude) {
      return res.status(400).json({ message: "binId, latitude and longitude are required" });
    }

    const newBin = new Bin({
      binId,
      location,
      latitude,
      longitude,
      capacity_kg,
      fillLevel: 0,
      status: "Normal"
    });

    await newBin.save();

    res.json({ message: "Bin added successfully", bin: newBin });

  } catch (error) {
    console.error("Error adding bin:", error);
    res.status(500).json({ message: "Failed to add bin" });
  }
});

module.exports = router;