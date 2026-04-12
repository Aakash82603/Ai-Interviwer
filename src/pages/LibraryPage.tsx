import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../contexts/AuthContext'
import { addLibraryItem, getImportantQuestionsByCompany, listLibrary, removeLibraryItem } from '../lib/data'
import { generateDailyChallenge } from '../lib/gemini'
import type { LibraryItem } from '../types/domain'
import { useProPlan } from '../hooks/useProPlan'

export default function LibraryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState('Data Structures')
  const { isPro } = useProPlan()
  const companyQuestions = getImportantQuestionsByCompany()

  const load = async () => {
    if (!user) return
    setLoading(true)
    const data = await listLibrary(user.id)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [user])

  const createChallenge = async () => {
    if (!user) return
    const content = await generateDailyChallenge(topic)
    await addLibraryItem({
      user_id: user.id,
      title: `Daily Challenge: ${topic}`,
      topic,
      difficulty: 'Medium',
      content,
      ai_generated: true,
    })
    await load()
  }

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Question Library</h1>
        <div className="bg-surface-1 rounded-xl p-6 mb-6 flex gap-3">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-surface-2 rounded-lg px-3 py-2 flex-1" />
          <button onClick={createChallenge} disabled={!isPro} className="px-4 py-2 bg-primary rounded-lg font-bold disabled:opacity-50">{isPro ? 'Generate & Save' : 'Upgrade Required'}</button>
        </div>
        {!isPro && <div className="mb-6 text-sm text-[#ffb786]">Premium features are locked. Go to <Link to="/profile" className="text-primary font-bold">Profile</Link> and click Upgrade Plan.</div>}
        <div className="bg-surface-1 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Most Important Questions by Company</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(companyQuestions).map(([company, qs]) => (
              <div key={company} className="bg-surface-2 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{company}</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">{qs.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-surface-1 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">{item.title}</h3>
                  <button onClick={() => void removeLibraryItem(item.id).then(load)} className="text-error">Delete</button>
                </div>
                <p className="text-sm text-[#8c909f] mt-2">{item.content}</p>
              </div>
            ))}
            {!items.length && <div className="bg-surface-1 rounded-xl p-5">No library items yet.</div>}
          </div>
        )}
      </main>
    </div>
  )
}
