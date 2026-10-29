// Groq API — OpenAI-compatible endpoint
// Drop-in replacement for the previous implementations.
// All exported function signatures are unchanged.

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'openai/gpt-oss-120b' // Fast and highly capable

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
  if (!answer.trim()) {
    return 'No answer provided. Please write or speak your response before requesting feedback.';
  }
  return generateFromPrompt(
    `Evaluate this interview answer based ONLY on what the candidate wrote. Do not assume unstated knowledge.

Question: ${question}
Answer: ${answer}

Provide:
1. Score: X/10
2. What was correct (quote their answer)
3. What was missing or wrong
4. A model answer summary
5. One specific improvement tip`,
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
  dimensions: {
    communication: number;
    technicalDepth: number;
    confidence: number;
    structure: number;
  };
  recommendation: string;
}

function parseEvaluationJson(raw: string): InterviewEvaluation | null {
  const clean = raw.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(clean.slice(start, end + 1)) as InterviewEvaluation;
  } catch {
    return null;
  }
}

export async function evaluateInterview(transcript: Message[]): Promise<InterviewEvaluation> {
  const userAnswers = transcript.filter((m) => m.role === 'user');
  const formattedTranscript = transcript
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  if (userAnswers.length === 0) {
    return {
      score: 0,
      verdict: 'Incomplete',
      strengths: [],
      improvements: ['No answers were recorded. Speak clearly into the microphone or type your responses.'],
      userFeedback: [],
      dimensions: { communication: 0, technicalDepth: 0, confidence: 0, structure: 0 },
      recommendation: 'Complete at least one interview question before ending the session.',
    };
  }

  const raw = await groqChat(
    [
      {
        role: 'system',
        content: `You are an expert interviewer. Score ONLY based on what the candidate actually said in the transcript.
Do NOT invent answers or assume knowledge the candidate did not demonstrate.
If an answer is empty, off-topic, or "I don't know", score it low and say so explicitly.
Each userFeedback item must quote or reference the candidate's actual words.`,
      },
      {
        role: 'user',
        content: `Evaluate this interview transcript. The candidate gave exactly ${userAnswers.length} answer(s).

Transcript:
${formattedTranscript}

Return STRICT JSON only (no markdown):
{
  "score": <number 0-100 based on actual performance>,
  "verdict": "<Strong Hire | Hire | Needs Improvement | Incomplete>",
  "strengths": ["<specific strength from transcript>", "<another if applicable>"],
  "improvements": ["<specific gap from transcript>", "<another if applicable>"],
  "dimensions": {
    "communication": <0-100>,
    "technicalDepth": <0-100>,
    "confidence": <0-100>,
    "structure": <0-100>
  },
  "recommendation": "<1-2 sentences of actionable advice based on this specific interview>",
  "userFeedback": [
    "<for answer 1: score X/10 + what was correct/wrong referencing their actual answer>",
    ...exactly ${userAnswers.length} items, one per candidate answer in order
  ]
}`,
      },
    ],
    1800,
  );

  const parsed = parseEvaluationJson(raw);
  if (parsed) {
    return {
      ...parsed,
      userFeedback: parsed.userFeedback?.slice(0, userAnswers.length) ?? [],
      dimensions: parsed.dimensions ?? {
        communication: parsed.score,
        technicalDepth: parsed.score,
        confidence: parsed.score,
        structure: parsed.score,
      },
      recommendation: parsed.recommendation || 'Review your transcript and practice weak areas.',
    };
  }

  return {
    score: 50,
    verdict: 'Needs Improvement',
    strengths: ['Participated in the interview'],
    improvements: ['Provide more detailed, structured answers with concrete examples'],
    userFeedback: userAnswers.map(
      (a, i) => `Answer ${i + 1}: Review your response "${a.content.slice(0, 80)}..." and add more depth.`,
    ),
    dimensions: { communication: 50, technicalDepth: 50, confidence: 50, structure: 50 },
    recommendation: 'Practice answering with the STAR method and include specific technical details.',
  };
}
