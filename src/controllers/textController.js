const { callAI } = require("../config/aiClient");

exports.simplifyText = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ message: "text required" });

    const system = `You simplify difficult academic text for school students.
Return the explanation in ${language || "English"} using very easy words.`;
    const simplified = await callAI(system, text);

    res.json({ success: true, data: simplified });
  } catch (err) {
    next(err);
  }
};

exports.translateText = async (req, res, next) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "text & targetLanguage required" });
    }
    const system = `Translate this for Indian school kids into ${targetLanguage} with simple language.`;
    const translated = await callAI(system, text);
    res.json({ success: true, data: translated });
  } catch (err) {
    next(err);
  }
};
