const express = require("express");
const { analyzeReading, myReadingHistory } =
  require("../controllers/readingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/analyze", protect, analyzeReading);
router.get("/history", protect, myReadingHistory);

module.exports = router;
