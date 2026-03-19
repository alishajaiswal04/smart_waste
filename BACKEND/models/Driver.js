const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  truckId: String,
  cluster: Number
});

module.exports = mongoose.model("Driver", driverSchema);