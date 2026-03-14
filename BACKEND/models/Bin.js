const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({

  binId: {
    type: String,
    required: true,
    unique: true
  },

  location: {
    type: String,
    required: true
  },
  
  fillLevel: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["Normal", "Warning", "Critical"],
    default: "Normal"
  },

  lastCollected: {
    type: Date,
    default: Date.now
  },
  latitude: Number,

  longitude: Number,
  waste_weight_kg: Number,
  capacity_kg: Number,
});

module.exports = mongoose.model("Bin", binSchema);