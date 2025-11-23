const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    grade: String,
    subject: String,
    dateKey: String,
    content: Object, // { title, description, questions: [...] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
