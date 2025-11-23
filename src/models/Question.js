const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    question: String,
    answer: String,
    grade: String,
    subject: String,
    language: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
