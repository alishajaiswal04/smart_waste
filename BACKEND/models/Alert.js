const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({

  binId: String,

  message: String,

  status: {
    type: String,
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Alert", alertSchema);