const Challenge = require("../models/Challenge");
const { callAI } = require("../config/aiClient");

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

exports.getTodayChallenge = async (req, res, next) => {
  try {
    const { grade = "5-10", subject = "general" } = req.query;
    const key = `${todayKey()}-${grade}-${subject}`;

    let challenge = await Challenge.findOne({ dateKey: key });
    if (!challenge) {
      const system = `You create a short, fun daily challenge for grade ${grade} ${subject}.
Return JSON: {title, description, questions:[{q, options, answer}]}`;
      const aiOutput = await callAI(system, "Generate today's challenge");

      challenge = await Challenge.create({
        grade,
        subject,
        dateKey: key,
        content: aiOutput,
      });
    }

    res.json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
};
