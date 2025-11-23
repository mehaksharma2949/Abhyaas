// src/config/aiClient.js

async function callAI(systemPrompt, userPrompt) {
  console.log("AI called with:", { systemPrompt, userPrompt });

  // Text Simplifier
  if (systemPrompt.includes("simplify")) {
    return "Simplified: " + userPrompt.slice(0, 120);
  }

  // Daily Challenge
  if (systemPrompt.includes("daily challenge") || systemPrompt.includes("daily challenge")) {
    return {
      title: "Demo Challenge",
      description: "Solve these quick questions!",
      questions: [
        { q: "2 + 3 = ?", options: ["4", "5", "6"], answer: "5" },
        { q: "Largest planet?", options: ["Earth", "Jupiter", "Mars"], answer: "Jupiter" }
      ]
    };
  }

  // Default – AI tutor, translate, etc.
  return "Demo AI answer: " + userPrompt;
}

module.exports = { callAI };
