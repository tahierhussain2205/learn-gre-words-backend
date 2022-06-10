const express = require("express");
const router = express.Router();
const testController = require("../controllers/test");

router.post("/", testController.test);

module.exports = router;
