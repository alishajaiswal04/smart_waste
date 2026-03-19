const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({

  driver: String,
  truck: String,
  cluster: Number,

  bins: [
    {
      binId: String,
      latitude: Number,
      longitude: Number
    }
  ],

  totalWaste: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Route", routeSchema);