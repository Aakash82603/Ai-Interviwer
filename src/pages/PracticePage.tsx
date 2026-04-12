import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { evaluateAnswer, generateQuestions } from '../lib/gemini'
import type { PracticeTrack } from '../types/domain'

const TITLES: Record<PracticeTrack, string> = {
  technical: 'Technical Practice',
  aptitude: 'Aptitude Practice',
  'group-discussion': 'Group Discussion Practice',
}

export default function PracticePage() {
  const [params] = useSearchParams()
  const track = (params.get('track') || 'technical') as PracticeTrack
  const topic = params.get('topic') || 'General interview'
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const resumeContext = localStorage.getItem('resume_context_summary') || ''

  const title = useMemo(() => TITLES[track] || TITLES.technical, [track])
  const trackInstruction = useMemo(() => {
    if (track === 'aptitude') return 'Focus on aptitude (quant, logical reasoning, and problem-solving).'
    if (track === 'group-discussion') return 'Focus on communication, collaboration, and concise argumentation for group discussion.'
    return 'Focus on technical depth, implementation detail, and reasoning.'
  }, [track])

  const loadQuestion = async () => {
    setLoading(true)
    const prompt = await generateQuestions(`${title}. ${trackInstruction} Topic: ${topic}. Resume context: ${resumeContext || 'none'}. Generate one interview question only.`)
    setQuestion(prompt)
    setLoading(false)
  }

  const evaluate = async () => {
    setLoading(true)
    const resp = await evaluateAnswer(question, answer)
    setFeedback(resp)
    setLoading(false)
  }

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <Link to="/mode-selector" className="text-primary font-bold">Change Mode</Link>
        </div>
        <p className="text-[#8c909f]">Topic: {topic}</p>
        <div className="bg-surface-1 rounded-xl p-6 space-y-4">
          <button onClick={loadQuestion} className="px-5 py-2 bg-primary rounded-lg font-bold">
            {loading ? 'Loading...' : 'Generate Question'}
          </button>
          {question && <p className="text-lg">{question}</p>}
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full min-h-32 bg-surface-2 rounded-lg p-3" placeholder="Write your answer..." />
          <button onClick={evaluate} disabled={!question || !answer || loading} className="px-5 py-2 bg-surface-2 rounded-lg font-bold disabled:opacity-50">Evaluate Answer</button>
          {feedback && <div className="bg-background rounded-lg p-4 text-[#c2c6d6] whitespace-pre-wrap">{feedback}</div>}
        </div>
      </main>
    </div>
  )
}
