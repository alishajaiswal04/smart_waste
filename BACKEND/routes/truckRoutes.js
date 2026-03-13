const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { getAllTrucks, updateTruckLocation } = require("../controllers/truckController");

router.get("/", getAllTrucks);
router.post("/location", updateTruckLocation);

// =============================
// AI Truck Dispatch Plan Route
// =============================
router.get("/dispatch-plan", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/dispatch_plan.json");

    const rawData = fs.readFileSync(filePath);
    const dispatchPlan = JSON.parse(rawData);

    res.json(dispatchPlan);
  } catch (error) {
    console.error("Dispatch plan error:", error.message);
    res.status(500).json({ message: "Unable to load dispatch plan" });
  }
});

module.exports = router;