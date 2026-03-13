const Truck = require("../models/truck");

exports.getAllTrucks = async (req, res) => {
  try {

    const trucks = await Truck.find();

    res.json(trucks);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error fetching trucks" });

  }
};
exports.updateTruckLocation = async (req, res) => {

  try {

    const { truckId, latitude, longitude } = req.body || {};

    if (!truckId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "truckId, latitude and longitude are required"
      });
    }

    const truck = await Truck.findOneAndUpdate(
      { truckId },
      { latitude, longitude },
      { new: true }
    );

    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    const io = require("../socket").getIO();

    io.emit("truck-location", truck);

    res.json({ message: "Location updated", truck });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Error updating truck location" });

  }

};