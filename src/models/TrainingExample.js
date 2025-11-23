const mongoose = require("mongoose");

const trainingExampleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grade: String,
    subject: String,
    concept: String,      // what they are teaching AI
    studentExplanation: String,
    aiFeedback: String,   // AI comment on their explanation
    rewardPoints: { type: Number, default: 10 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingExample", trainingExampleSchema);
