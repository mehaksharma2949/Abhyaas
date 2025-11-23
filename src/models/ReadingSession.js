const mongoose = require("mongoose");

const readingSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    passage: String,
    transcript: String,
    wordsCorrect: Number,
    accuracy: Number,
    wpm: Number,
    pauses: Number,
    score: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingSession", readingSessionSchema);
