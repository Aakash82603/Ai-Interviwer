import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getFullSyllabus, getSyllabus } from '../lib/data'
import { useProPlan } from '../hooks/useProPlan'

export default function SyllabusPage() {
  const { company = 'google' } = useParams()
  const items = useMemo(() => getSyllabus(company), [company])
  const full = useMemo(() => getFullSyllabus(company), [company])
  const { isPro } = useProPlan()

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2 capitalize">{company} Syllabus</h1>
        <p className="text-[#8c909f] mb-8">Structured plan for your mock preparation.</p>
        {items.length === 0 ? (
          <div className="bg-surface-1 rounded-xl p-6">No syllabus found for this company yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-surface-1 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">{item.title}</h2>
                <ul className="list-disc pl-5 space-y-2 text-[#c2c6d6]">
                  {item.bullet_points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Basics</h3><ul className="list-disc pl-5 text-sm">{full.basics.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Intermediate</h3><ul className="list-disc pl-5 text-sm">{isPro ? full.intermediate.map((x) => <li key={x}>{x}</li>) : [<li key="locked">Upgrade to unlock intermediate track.</li>]}</ul></div>
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Advanced</h3><ul className="list-disc pl-5 text-sm">{isPro ? full.advanced.map((x) => <li key={x}>{x}</li>) : [<li key="locked2">Upgrade to unlock advanced track.</li>]}</ul></div>
        </div>
        <div className="bg-surface-1 rounded-xl p-5 mt-4">
          <h3 className="font-bold mb-2">Study Material</h3>
          <ul className="list-disc pl-5 text-sm">{full.resources.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <Link to="/mocks" className="inline-block mt-8 text-primary font-bold">Back to Mocks</Link>
      </main>
    </div>
  )
}
