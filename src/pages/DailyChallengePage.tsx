import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { generateDailyChallengeMcqs, type McqQuestion } from '../lib/gemini'

function challengeKey(topic: string, day: string): string {
  return `daily_mcq_${topic}_${day}`
}

export default function DailyChallengePage() {
  const [params] = useSearchParams()
  const topic = params.get('topic') || 'Frontend System Design'
  const day = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [questions, setQuestions] = useState<McqQuestion[]>([])
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1, -1])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const key = challengeKey(topic, day)
      const cached = localStorage.getItem(key)
      if (cached) {
        setQuestions(JSON.parse(cached) as McqQuestion[])
        setLoading(false)
        return
      }
      const generated = await generateDailyChallengeMcqs(topic, day)
      localStorage.setItem(key, JSON.stringify(generated))
      setQuestions(generated)
      setLoading(false)
    }
    void load()
  }, [topic, day])

  const score = useMemo(() => questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0), [answers, questions])

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Daily Challenge</h1>
            <p className="text-[#8c909f]">Topic: {topic} | Date: {day}</p>
          </div>
          <Link to="/dashboard" className="text-primary font-bold">Back</Link>
        </div>
        {loading ? (
          <div className="bg-surface-1 rounded-xl p-6">Generating your 5 questions...</div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-surface-1 rounded-xl p-6">
                <h3 className="font-semibold mb-3">{idx + 1}. {q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        disabled={submitted}
                        checked={answers[idx] === optIdx}
                        onChange={() => {
                          const next = [...answers]
                          next[idx] = optIdx
                          setAnswers(next)
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {submitted && (
                  <div className={`mt-3 text-sm ${answers[idx] === q.correctIndex ? 'text-success' : 'text-error'}`}>
                    Your answer: {answers[idx] >= 0 ? q.options[answers[idx]] : 'Not answered'} | Correct: {q.options[q.correctIndex]}
                    <div className="text-[#c2c6d6] mt-1">{q.explanation}</div>
                  </div>
                )}
              </div>
            ))}
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={answers.some((a) => a < 0)}
                className="px-5 py-2 bg-primary rounded-lg font-bold disabled:opacity-50"
              >
                Submit Answers
              </button>
            ) : (
              <div className="bg-surface-1 rounded-xl p-6 text-lg font-bold">Score: {score} / 5</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
