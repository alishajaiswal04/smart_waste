const Bin = require("../models/Bin");

exports.getDashboardData = async (req, res) => {
  try {

    const totalBins = await Bin.countDocuments();

    const criticalBins = await Bin.find({ status: "Critical" });

    const warningBins = await Bin.find({ status: "Warning" });

    const avgFill = await Bin.aggregate([
      {
        $group: {
          _id: null,
          avgFill: { $avg: "$fillLevel" }
        }
      }
    ]);

    res.json({
      kpis: {
        totalBins,
        activeAlerts: criticalBins.length,
        tripsToday: warningBins.length,
        avgFill: avgFill[0]?.avgFill?.toFixed(1) || 0
      },
      criticalBins
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard error" });
  }
};