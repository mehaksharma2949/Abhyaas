const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  q: String,
  type: { type: String, default: "mcq" }, // mcq / short / truefalse
  options: [String],
  answer: String
});

const worksheetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grade: String,
    subject: String,
    topic: String,
    level: String, // easy/medium/hard
    language: String,
    questions: [questionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worksheet", worksheetSchema);
