import fetch from 'node-fetch'

const url = 'http://localhost:3001/api/generate/topic'
const payload = {
  subject: 'Math',
  classLevel: '10',
  difficulty: 'Medium',
  topic: 'Quadratic Equations',
}

try {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const text = await resp.text()
  console.log('HTTP', resp.status)
  console.log('--- BEGIN GENERATED WORKSHEET ---')
  console.log(text)
  console.log('--- END GENERATED WORKSHEET ---')
} catch (err) {
  console.error('Request failed:', err)
  process.exit(1)
}
