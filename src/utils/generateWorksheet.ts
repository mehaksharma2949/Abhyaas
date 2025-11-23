// Utility to generate worksheet via proxy, with fallback to demo if API has insufficient balance

export async function generateWorksheet(params: {
  subject: string
  classLevel: string
  difficulty: string
  topic: string
  additionalInstructions?: string
  systemPrompt: string
}) {
  const proxyBase = import.meta.env.DEV ? '' : ''
  const endpoint = `${proxyBase}/api/generate`

  const userPrompt = `Generate a worksheet for:
Subject: ${params.subject}
Class: ${params.classLevel}
Difficulty: ${params.difficulty}
Topic: ${params.topic}
${params.additionalInstructions ? `\nAdditional Instructions: ${params.additionalInstructions}` : ''}`

  const requestBody = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 3000,
    temperature: 0.7,
    stream: false,
  }

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    // If API has insufficient balance (402), fall back to demo
    if (resp.status === 402) {
      console.log('API insufficient balance; using demo endpoint instead')
      return generateDemoWorksheet(params)
    }

    if (!resp.ok) {
      const text = await resp.text()
      throw new Error(`API error ${resp.status}: ${text}`)
    }

    const resultText = await resp.text()
    return resultText
  } catch (err) {
    // Network error or other failure; fall back to demo
    console.error('Generation request failed; using demo:', err)
    return generateDemoWorksheet(params)
  }
}

function generateDemoWorksheet(params: {
  subject: string
  classLevel: string
  difficulty: string
  topic: string
}) {
  return `[SUBJECT]: ${params.subject}
[CLASS]: ${params.classLevel}
[DIFFICULTY]: ${params.difficulty}
[TOPIC]: ${params.topic}

---------------------------------------
SECTION A – MCQs (5 questions)
---------------------------------------

Q1. Which of the following is a characteristic of a transverse wave?
a) The particles of the medium vibrate parallel to the direction of wave propagation.
b) The particles of the medium vibrate perpendicular to the direction of wave propagation.
c) The wave requires a medium to travel.
d) It involves compressions and rarefactions.

Q2. The distance between two consecutive crests in a wave is called its:
a) Amplitude
b) Frequency
c) Wavelength
d) Period

Q3. Sound waves are examples of:
a) Transverse waves
b) Longitudinal waves
c) Electromagnetic waves
d) None of the above

Q4. The number of waves passing through a point in one second is called:
a) Wavelength
b) Frequency
c) Amplitude
d) Speed

Q5. Which of the following can travel through a vacuum?
a) Sound waves
b) Water waves
c) Light waves
d) All of the above

---------------------------------------
SECTION B – Fill in the Blanks (5 questions)
---------------------------------------

1. The SI unit of frequency is __________.
2. The speed of sound in air at 20°C is approximately __________ m/s.
3. A wave with a longer wavelength will have a __________ frequency.
4. __________ waves require a medium to propagate.
5. The maximum displacement of a particle from its mean position is called __________.

---------------------------------------
SECTION C – Short Questions (5 questions)
---------------------------------------

1. Explain the difference between transverse and longitudinal waves with examples.
2. What is the relationship between wavelength, frequency, and wave speed?
3. How does the amplitude of a wave affect the energy it carries?
4. Why can't sound waves travel through a vacuum?
5. What is the Doppler effect? Give a real-world example.

---------------------------------------
SECTION D – Match the Pairs (5 items)
---------------------------------------

Column A                          Column B
1. Amplitude                      a. Distance between consecutive crests
2. Wavelength                     b. Number of waves per second
3. Frequency                      c. Maximum displacement from mean position
4. Wave speed                     d. Wavelength × Frequency
5. Period                         e. Time taken for one complete oscillation

---------------------------------------

[Demo Worksheet - Replace with actual AI-generated content when DeepSeek account has credits]`
}
