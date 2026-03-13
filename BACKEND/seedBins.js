const mongoose = require("mongoose");
const Bin = require("./models/Bin");

mongoose.connect("mongodb://127.0.0.1:27017/smartwaste");

const bins = [
  {
    binId: "BIN-12",
    location: "Market Road",
    fillLevel: 95,
    status: "Critical"
  },
  {
    binId: "BIN-07",
    location: "Bus Stand",
    fillLevel: 82,
    status: "Warning"
  },
  {
    binId: "BIN-23",
    location: "Residential Area",
    fillLevel: 40,
    status: "Normal"
  },
  {
    binId: "BIN-31",
    location: "Vegetable Market",
    fillLevel: 91,
    status: "Critical"
  },
  {
    binId: "BIN-02",
    location: "Public Park",
    fillLevel: 60,
    status: "Normal"
  }
];

async function seed() {

  await Bin.deleteMany();

  await Bin.insertMany(bins);

  console.log("Bins inserted");

  process.exit();
}

seed();