const express = require("express");
const { simplifyText, translateText } = require("../controllers/textController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/simplify", protect, simplifyText);
router.post("/translate", protect, translateText);

module.exports = router;
