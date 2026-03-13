const Bin = require("../models/Bin");
const Alert = require("../models/alert");

exports.updateBinStatus = async (req, res) => {
  try {

    const { binId, fillLevel } = req.body;

    // update database
    const bin = await Bin.findOneAndUpdate(
      { binId },
      { fillLevel, lastCollected: new Date() },
      { returnDocument: 'after' }
    );

    if (!bin) {
      return res.status(404).json({ message: "Bin not found" });
    }

    // determine status
    let status = "Normal";

    if (fillLevel >= 90) status = "Critical";
    else if (fillLevel >= 70) status = "Warning";

    bin.status = status;
    await bin.save();

    const io = require("../socket").getIO();

    // create alert if bin becomes critical
    if (status === "Critical") {
      const alertMessage = `${bin.binId} is critical (${bin.fillLevel}%)`;

      await Alert.create({
        binId: bin.binId,
        message: alertMessage,
        status: "active"
      });

      // emit realtime alert event
      io.emit("new-alert", {
        binId: bin.binId,
        message: alertMessage,
        fillLevel: bin.fillLevel
      });
    }

    // emit realtime update
    io.emit("bin-update", {
      binId: bin.binId,
      fillLevel: bin.fillLevel,
      status: bin.status
    });

    res.json({ message: "Bin updated", bin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating bin" });
  }
};