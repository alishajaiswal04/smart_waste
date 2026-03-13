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

module.exports = router;