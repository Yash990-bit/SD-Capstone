const express = require("express");
const protect = require("../middleware/authMiddleware");
const uploadSingle = require("../middleware/uploadMiddleware");
const RecordController = require("../controllers/recordController");

const router = express.Router();

router.post("/upload", protect, uploadSingle, RecordController.upload);
router.get("/", protect, RecordController.getRecords);

module.exports = router;
