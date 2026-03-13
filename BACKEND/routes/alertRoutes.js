const express = require("express");
const router = express.Router();
const Alert = require("../models/alert");

// GET all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching alerts" });
  }
});

module.exports = router;