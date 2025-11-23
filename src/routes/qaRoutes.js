const express = require("express");
const { askAI, getRecentQuestions } = require("../controllers/qaController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// student ask
router.post("/ask", protect, askAI);

// teacher transparent mode (only teachers)
router.get("/recent", protect, getRecentQuestions);

module.exports = router;
