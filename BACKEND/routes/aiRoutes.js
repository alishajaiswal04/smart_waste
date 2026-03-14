const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiControllers");

router.get("/cluster", aiController.clusterBins);

module.exports = router;