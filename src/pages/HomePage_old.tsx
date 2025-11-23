import { useState } from 'react'
// Generation now uses server proxy at /api/generate
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { FileText, Loader2, Download } from 'lucide-react'

// client-side `ai` removed; we'll call the server proxy instead

function HomePage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Form state
  const [subject, setSubject] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [topic, setTopic] = useState('')
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  // Output state
  const [worksheet, setWorksheet] = useState('')

  const generateWorksheet = async () => {
    // Validation
    if (!subject || !classLevel || !difficulty || !topic) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in subject, class, difficulty, and topic',
        variant: 'destructive',
      })
      return
    }

    // Authentication removed: no login required to generate worksheets

    setLoading(true)
    setWorksheet('')

    try {
      const systemPrompt = `You are an Instant Worksheet Generator AI.

Your job is to generate high-quality academic worksheets for classes 3–12 in simple text format.
You support four question types:
1. MCQ (Multiple Choice Questions)
2. Fill in the Blanks
3. Short Answer Questions
4. Match the Pairs

CONTENT RULES:
• Questions must be original, curriculum-aligned, accurate, and age-appropriate.
• Difficulty must strictly follow user choice:
    - EASY → direct knowledge recall
    - MEDIUM → reasoning, application
    - HARD → analytical, multi-step logic
• Questions must NOT repeat.
• Questions must be concept-based, not memory-based.
• MCQ should always have:
       - 1 correct answer
       - 3 wrong but realistic distractors

OUTPUT FORMAT:
Always output in this exact format:

[SUBJECT]: ${subject}
[CLASS]: ${classLevel}
[DIFFICULTY]: ${difficulty}
[TOPIC]: ${topic}

---------------------------------------
SECTION A – MCQs (5 questions)
---------------------------------------

Q1. [Question]
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

Q2. [Question]
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

[Continue Q3-Q5]

---------------------------------------
SECTION B – Fill in the Blanks (5 questions)
---------------------------------------

1. [Sentence with _________]
2. [Sentence with _________]
[Continue 3-5]

---------------------------------------
SECTION C – Short Questions (5 questions)
---------------------------------------

1. [Question]
2. [Question]
[Continue 3-5]

---------------------------------------
SECTION D – Match the Pairs (5 items)
---------------------------------------

Column A          Column B
1. [Item 1]       a. [Match a]
2. [Item 2]       b. [Match b]
3. [Item 3]       c. [Match c]
4. [Item 4]       d. [Match d]
5. [Item 5]       e. [Match e]

---------------------------------------

Generate the worksheet following ALL rules above. Output ONLY the worksheet text, no extra commentary.`

      const userPrompt = `Generate a worksheet for:
Subject: ${subject}
Class: ${classLevel}
Difficulty: ${difficulty}
Topic: ${topic}
${additionalInstructions ? `\nAdditional Instructions: ${additionalInstructions}` : ''}`

      // POST to server proxy which holds the API key
      const proxyBase = import.meta.env.DEV ? 'http://localhost:5174' : ''
      const resp = await fetch(`${proxyBase}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 3000,
          temperature: 0.7,
          stream: true,
        }),
      })
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(`API error ${resp.status}: ${text}`)
      }

      // If the response is a streaming body, read it progressively
      if (resp.body && (resp.body as any).getReader) {
        const reader = (resp.body as any).getReader()
        const decoder = new TextDecoder()
        let done = false
        let full = ''
        while (!done) {
          // eslint-disable-next-line no-await-in-loop
          const { value, done: d } = await reader.read()
          done = d
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            full += chunk
            setWorksheet(full)
          }
        }
      } else {
        const resultText = await resp.text()
        setWorksheet(resultText)
      }

      toast({ title: 'Worksheet generated successfully!' })
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadAsPDF = () => {
    if (!worksheet) {
      toast({ title: 'No worksheet to download', variant: 'destructive' })
      return
    }

    // Create a blob and download as text file (PDF generation would require additional library)
    const blob = new Blob([worksheet], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `worksheet_${subject}_class${classLevel}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({ title: 'Worksheet downloaded!' })
  }

  // Authentication removed: logout handler no longer needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Worksheet Generator AI</h1>
              <p className="text-xs text-muted-foreground">Instant academic worksheets for classes 3-12</p>
            </div>
          </div>
          
          {/* Authentication removed: simple header without login controls */}
          <div />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Worksheet Details</CardTitle>
              <CardDescription>
                Fill in the details to generate a custom worksheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics, Science, English"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class Level *</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 3).map((cls) => (
                      <SelectItem key={cls} value={cls.toString()}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy - Direct knowledge recall</SelectItem>
                    <SelectItem value="Medium">Medium - Reasoning & application</SelectItem>
                    <SelectItem value="Hard">Hard - Analytical & multi-step</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Fractions, Grammar"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific requirements or preferences..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={generateWorksheet}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Worksheet...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Worksheet</CardTitle>
                  <CardDescription>
                    Your worksheet will appear here
                  </CardDescription>
                </div>
                {worksheet && (
                  <Button onClick={downloadAsPDF} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      AI is generating your worksheet...
                    </p>
                  </div>
                </div>
              ) : worksheet ? (
                <div className="border rounded-lg p-6 bg-white dark:bg-gray-950 max-h-[600px] overflow-y-auto">
                  <pre className="worksheet-output">{worksheet}</pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <FileText className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Fill in the form and click "Generate Worksheet" to create your custom worksheet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          {[
            { title: 'MCQs', desc: '5 multiple choice questions with realistic distractors' },
            { title: 'Fill in Blanks', desc: '5 carefully crafted fill-in-the-blank questions' },
            { title: 'Short Questions', desc: '5 concept-based short answer questions' },
            { title: 'Match Pairs', desc: '5 matching items to test connections' },
          ].map((feature, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* AuthDialog removed */}
    </div>
  )
}

export default HomePage
