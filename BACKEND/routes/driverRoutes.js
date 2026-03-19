const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiControllers");

// get route assigned to driver
router.get("/route/:driver", aiController.getDriverRoute);

module.exports = router;