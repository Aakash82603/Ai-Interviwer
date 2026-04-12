// Groq API — OpenAI-compatible endpoint
// Drop-in replacement for the previous implementations.
// All exported function signatures are unchanged.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'llama-3.3-70b-versatile' // Fast and highly capable

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface McqQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function groqChat(
  messages: { role: string; content: string }[],
  maxTokens = 600,
): Promise<string> {
  if (!GROQ_API_KEY) {
    return 'Authentication failed — VITE_GROQ_API_KEY is not set. Add it to your .env file and restart the dev server.'
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        if ((res.status === 429 || res.status === 503) && attempt < 2) {
          // Groq is fast, but rate limits can happen
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
          continue
        }
        return `Groq API error (${res.status}): ${errText.slice(0, 200)}`
      }

      const data = await res.json()
      return (data.choices?.[0]?.message?.content as string) || 'No response generated.'
    } catch (err) {
      if (attempt === 2) {
        const msg = err instanceof Error ? err.message : String(err)
        return `Network error calling Groq: ${msg}`
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  return 'Groq API is temporarily unavailable. Please try again in a moment.'
}

// ─── Prompt-only helper (for single-turn tasks) ──────────────────────────────

async function generateFromPrompt(prompt: string, maxTokens = 600): Promise<string> {
  return groqChat([{ role: 'user', content: prompt }], maxTokens)
}

// ─── Exported API (same signatures as the old gemini.ts) ─────────────────────

export async function generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
  const chatMessages: { role: string; content: string }[] = []

  if (systemPrompt) {
    chatMessages.push({ role: 'system', content: systemPrompt })
  }

  messages
    .filter((m) => m.role !== 'system')
    .forEach((m) => chatMessages.push({ role: m.role, content: m.content }))

  return groqChat(chatMessages, 600)
}

export async function generateQuestions(context: string): Promise<string> {
  return generateFromPrompt(
    `Generate relevant interview questions based on the following context:\n${context}`,
  )
}

export async function evaluateAnswer(question: string, answer: string): Promise<string> {
  return generateFromPrompt(
    `Evaluate this interview answer.\nQuestion: ${question}\nAnswer: ${answer}\n\nProvide concise feedback and a score out of 10.`,
  )
}

export async function liveInterviewChat(messages: Message[], systemPrompt?: string): Promise<string> {
  return generateResponse(messages, systemPrompt)
}

export async function parseResume(resumeText: string): Promise<string> {
  return generateFromPrompt(
    `Parse this resume into a structured summary with skills, experience, and education:\n${resumeText}`,
  )
}

export async function generateDailyChallenge(topic: string): Promise<string> {
  return generateFromPrompt(`Generate one concise daily interview challenge for: ${topic}`)
}

export async function generateDailyChallengeMcqs(
  topic: string,
  daySeed: string,
): Promise<McqQuestion[]> {
  const raw = await generateFromPrompt(
    `Create EXACTLY 5 multiple-choice interview questions for topic "${topic}".
Date seed: ${daySeed} (use this so questions differ by day).
Return STRICT JSON only with shape:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
No markdown, no extra text.`,
    800,
  )

  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean) as { questions: McqQuestion[] }
    if (!parsed.questions || parsed.questions.length !== 5) throw new Error('Invalid length')
    return parsed.questions.map((q) => ({
      question: q.question,
      options: q.options.slice(0, 4),
      correctIndex: Math.max(0, Math.min(3, q.correctIndex)),
      explanation: q.explanation || 'Review the core concept and retry.',
    }))
  } catch {
    return [
      { question: `What best describes ${topic}?`, options: ['A core interview concept', 'A database vendor', 'A CSS unit', 'A browser setting'], correctIndex: 0, explanation: `${topic} is a key interview topic.` },
      { question: 'Which is most useful for structured answers?', options: ['STAR method', 'Random brainstorming', 'Skipping context', 'Only buzzwords'], correctIndex: 0, explanation: 'STAR keeps responses clear and evidence-based.' },
      { question: 'What improves technical answer quality?', options: ['Concrete examples', 'Very long monologue', 'Avoiding details', 'Guessing'], correctIndex: 0, explanation: 'Specific examples increase credibility.' },
      { question: 'Best way to handle uncertainty?', options: ['State assumptions clearly', 'Pretend certainty', 'Ignore constraints', 'Change topic'], correctIndex: 0, explanation: 'Clear assumptions demonstrate structured thinking.' },
      { question: 'How to improve over time?', options: ['Review feedback daily', 'Never revisit answers', 'Memorize only', 'Avoid mocks'], correctIndex: 0, explanation: 'Iteration with feedback drives growth.' },
    ]
  }
}

export interface InterviewEvaluation {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  userFeedback: string[];
}

export async function evaluateInterview(transcript: Message[]): Promise<InterviewEvaluation> {
  const formattedTranscript = transcript
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const raw = await generateFromPrompt(
    `You are an expert technical interviewer evaluating an interview transcript.
Analyze the transcript and provide a final evaluation.
Transcript:
${formattedTranscript}

Return STRICT JSON only with this shape (no markdown around it):
{
  "score": <number 0-100>,
  "verdict": "<Hire | Strong Hire | Needs Improvement>",
  "strengths": ["<point 1>", "<point 2>"],
  "improvements": ["<point 1>", "<point 2>"],
  "userFeedback": [
    "<specific feedback and score (e.g. ❌ 3/10 You missed...) for the USER's 1st answer>",
    "<specific feedback for USER's 2nd answer>",
    ...must have EXACTLY the same number of items as the USER spoke in the transcript!
  ]
}
No markdown, no extra text.`,
    1500
  );

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as InterviewEvaluation;
  } catch (err) {
    return {
      score: 65,
      verdict: "Needs Improvement",
      strengths: ["Completed the interview"],
      improvements: ["Could not completely parse final AI evaluation"],
      userFeedback: transcript.filter(m => m.role === 'user').map(() => "Feedback unavailable for this response.")
    };
  }
}
