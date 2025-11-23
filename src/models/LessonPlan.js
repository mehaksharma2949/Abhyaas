const mongoose = require("mongoose");

const lessonPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grade: String,
    subject: String,
    topic: String,
    language: String,
    durationMinutes: Number,
    content: Object  // full AI response
  },
  { timestamps: true }
);

module.exports = mongoose.model("LessonPlan", lessonPlanSchema);
