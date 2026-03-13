const Bin = require("../models/Bin");

async function updateBin(io, binId, fillLevel) {
  let status = "Normal";

  if (fillLevel >= 90) status = "Critical";
  else if (fillLevel >= 70) status = "Warning";

  const bin = await Bin.findOneAndUpdate(
    { binId },
    {
      fillLevel,
      status,
      lastCollected: new Date()
    },
    { new: true }
  );

  if (bin) {
    io.emit("bin-update", bin);
    console.log("Bin updated:", bin.binId, fillLevel);
  }

  return bin;
}

module.exports = { updateBin };