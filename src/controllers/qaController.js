const Question = require("../models/Question");
const { callAI } = require("../config/aiClient");

exports.askAI = async (req, res, next) => {
  try {
    const { question, grade, subject, language } = req.body;
    if (!question) return res.status(400).json({ message: "question required" });

    const system = `You are a friendly tutor for Indian school students.
Answer in ${language || "English"} in 3-5 simple sentences.
Subject: ${subject || "general"}, Grade: ${grade || "5-10"}.`;

    const aiAnswer = await callAI(system, question);

    const doc = await Question.create({
      userId: req.user.id,
      question,
      answer: aiAnswer,
      grade,
      subject,
      language,
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// transparent mode stats for teacher dashboard
exports.getRecentQuestions = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
};
