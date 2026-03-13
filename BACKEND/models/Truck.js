const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({

  truckId: String,

  driver: String,

  status: {
    type: String,
    default: "idle"
  },

  capacity: Number,

  latitude: Number,

  longitude: Number

});

module.exports = mongoose.model("Truck", truckSchema);