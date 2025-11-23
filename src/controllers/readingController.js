const ReadingSession = require("../models/ReadingSession");
const { scoreReading } = require("../utils/readingScorer");

exports.analyzeReading = async (req, res, next) => {
  try {
    const { passage, transcript } = req.body;
    if (!passage || !transcript) {
      return res.status(400).json({ message: "passage & transcript required" });
    }

    const stats = scoreReading(passage, transcript);

    const session = await ReadingSession.create({
      userId: req.user.id,
      passage,
      transcript,
      ...stats,
    });

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.myReadingHistory = async (req, res, next) => {
  try {
    const sessions = await ReadingSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
};
