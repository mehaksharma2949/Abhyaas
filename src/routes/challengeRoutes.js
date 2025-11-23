const express = require("express");
const { getTodayChallenge } = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/today", protect, getTodayChallenge);

module.exports = router;
