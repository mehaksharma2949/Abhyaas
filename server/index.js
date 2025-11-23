import express from 'express'
import fetch from 'node-fetch'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { generateDemoWorksheet } from './demo-worksheet.js'

// Load environment variables from a local .env file (do NOT commit .env)
dotenv.config()

// Server-side proxy for Google Gemini API requests.
// Reads API key from process.env.GEMINI_API_KEY (do NOT commit your key).

const app = express()
app.use(bodyParser.json({ limit: '10mb' }))

// Allow CORS from the dev server (so browser can call the proxy)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Gemini API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY not set. Use /api/generate/demo for testing without a key.')
}

// Google Gemini API endpoint - using gemini-2.0-flash (latest available model)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Helper to send a prompt to Gemini and return the generated text (or null on failure)
async function callGemini(prompt, { maxOutputTokens = 3000, temperature = 0.7 } = {}) {
  if (!GEMINI_API_KEY) return null

  const geminiRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens,
      temperature,
    },
  }

  const urlWithKey = `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`
  const response = await fetch(urlWithKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiRequest),
  })

  if (response.status >= 400) {
    try {
      const errText = await response.text()
      console.error('[proxy] Gemini error body:', errText)
    } catch (e) {
      console.error('[proxy] failed to read error body:', e)
    }
    return null
  }

  const responseJson = await response.json()
  if (responseJson.candidates && responseJson.candidates.length > 0) {
    const candidate = responseJson.candidates[0]
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts[0].text
    }
  }
  return null
}

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body || {}
    console.log('[proxy] ===== INCOMING REQUEST =====')
    console.log('[proxy] incoming /api/generate request. body keys:', Object.keys(body))
    console.log('[proxy] API key present:', !!GEMINI_API_KEY)

    if (!GEMINI_API_KEY) {
      console.warn('[proxy] no GEMINI_API_KEY set; falling back to demo')
      const demo = generateDemoWorksheet('Science', '9', 'Medium', 'Waves')
      res.type('text/plain').send(demo)
      return
    }

    // Extract messages from the request (OpenAI format)
    const messages = body.messages || []
    
    // Combine system and user messages into a single prompt for Gemini
    let prompt = ''
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += msg.content + '\n\n'
      } else if (msg.role === 'user') {
        prompt += msg.content
      }
    }

    console.log('[proxy] forwarding to Gemini API URL:', GEMINI_API_URL)
    
    // Call Gemini via helper
    const max_tokens = body.max_tokens || 3000
    const temperature = body.temperature || 0.7
    const generatedText = await callGemini(prompt, { maxOutputTokens: max_tokens, temperature })

    if (!generatedText) {
      console.warn('[proxy] Gemini returned empty/failed response; falling back to demo')
      const demo = generateDemoWorksheet('Science', '9', 'Medium', 'Waves')
      res.type('text/plain').send(demo)
      return
    }

    console.log('[proxy] Gemini returned', generatedText.length, 'characters')
    res.type('text/plain').send(generatedText)
  } catch (err) {
    console.error('Proxy error:', err)
    // On any error, fall back to demo
    const demo = generateDemoWorksheet('Science', '9', 'Medium', 'Waves')
    res.type('text/plain').send(demo)
  }
})

// Topic-wise generation endpoint (real-time, accepts JSON with subject/classLevel/difficulty/topic)
app.post('/api/generate/topic', async (req, res) => {
  try {
    const body = req.body || {}
    const subject = body.subject || body.subject?.trim() || 'Science'
    const classLevel = body.classLevel || body.class || '9'
    const difficulty = body.difficulty || 'Medium'
    const topic = body.topic || 'Waves'

    if (!GEMINI_API_KEY) {
      console.warn('[proxy] no GEMINI_API_KEY set; returning demo worksheet')
      const demo = generateDemoWorksheet(subject, classLevel, difficulty, topic)
      res.type('text/plain').send(demo)
      return
    }

    const prompt = `You are an expert teacher. Create a worksheet for subject: ${subject}, class: ${classLevel}, difficulty: ${difficulty}, topic: ${topic}. ` +
      'Include a brief introduction, 8-12 questions of varying types (MCQ, short-answer, and one long-answer), and provide answers or marking guidance after the questions. Keep the language clear and suitable for school students.'

    const generated = await callGemini(prompt, { maxOutputTokens: body.max_tokens || 1500, temperature: body.temperature || 0.6 })
    if (!generated) {
      console.warn('[proxy] Gemini failed; falling back to demo')
      const demo = generateDemoWorksheet(subject, classLevel, difficulty, topic)
      res.type('text/plain').send(demo)
      return
    }

    res.type('text/plain').send(generated)
  } catch (err) {
    console.error('Topic endpoint error:', err)
    res.status(500).json({ error: String(err) })
  }
})

// Demo endpoint for testing without API credits
app.post('/api/generate/demo', (req, res) => {
  try {
    const body = req.body || {}
    // Extract subject, class, difficulty, topic from messages if present
    let subject = 'Science'
    let classLevel = '9'
    let difficulty = 'Medium'
    let topic = 'Waves'
    
    if (body.messages && Array.isArray(body.messages)) {
      const userMsg = body.messages.find(m => m.role === 'user')
      if (userMsg && userMsg.content) {
        const content = userMsg.content.toLowerCase()
        if (content.includes('subject:')) {
          const match = content.match(/subject:\s*(\w+)/)
          if (match) subject = match[1]
        }
        if (content.includes('class:')) {
          const match = content.match(/class:\s*(\d+)/)
          if (match) classLevel = match[1]
        }
        if (content.includes('difficulty:')) {
          const match = content.match(/difficulty:\s*(\w+)/)
          if (match) difficulty = match[1]
        }
        if (content.includes('topic:')) {
          const match = content.match(/topic:\s*([^\n]+)/)
          if (match) topic = match[1].trim()
        }
      }
    }
    
    const worksheet = generateDemoWorksheet(subject, classLevel, difficulty, topic)
    res.type('text/plain').send(worksheet)
    console.log('[proxy] sent demo worksheet for', { subject, classLevel, difficulty, topic })
  } catch (err) {
    console.error('Demo error:', err)
    res.status(500).json({ error: String(err) })
  }
})

// Helpful GET handler so visiting the endpoint in a browser shows instructions
app.get('/api/generate', (req, res) => {
  res.type('text/plain').send(
    'This endpoint accepts POST requests with the generation payload.\n' +
      'Do not open this URL in a browser; instead POST JSON to /api/generate.\n' +
      'Example (curl):\n' +
      "curl -X POST http://localhost:3001/api/generate -H 'Content-Type: application/json' -d '{\"model\":\"gemini-pro\",\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]}'\n\n" +
      'For testing without API credits, use /api/generate/demo instead (POST same payload).'
  )
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Google Gemini proxy listening on http://localhost:${PORT}`)
  console.log(`  POST /api/generate → forwards to Gemini API (requires GEMINI_API_KEY)`)
  console.log(`  POST /api/generate/demo → returns sample worksheet (no API key needed)`)
})
