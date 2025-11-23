function scoreReading(passage, transcript) {
  const origWords = passage.trim().split(/\s+/);
  const saidWords = transcript.trim().split(/\s+/);

  let correct = 0;
  origWords.forEach((w, i) => {
    if (saidWords[i] && saidWords[i].toLowerCase() === w.toLowerCase()) {
      correct++;
    }
  });

  const accuracy = (correct / origWords.length) * 100;

  return {
    wordsCorrect: correct,
    accuracy: Math.round(accuracy),
    pauses: 0, // audio integration ke baad change karna
    wpm: 0,
    score: Math.round(accuracy),
  };
}

module.exports = { scoreReading };
