import { Link, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getFullSyllabus, getImportantQuestionsByCompany } from '../lib/data'

export default function PreparePage() {
  const { company = 'google' } = useParams()
  const syllabus = getFullSyllabus(company)
  const key = company.charAt(0).toUpperCase() + company.slice(1).toLowerCase()
  const questions = getImportantQuestionsByCompany()[key] || []

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <h1 className="text-3xl font-bold">Prepare for {key} Interview</h1>
        <p className="text-[#8c909f]">Study complete syllabus, then start focused practice.</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Basics</h3><ul className="list-disc pl-5 text-sm">{syllabus.basics.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Intermediate</h3><ul className="list-disc pl-5 text-sm">{syllabus.intermediate.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="bg-surface-1 rounded-xl p-5"><h3 className="font-bold mb-2">Advanced</h3><ul className="list-disc pl-5 text-sm">{syllabus.advanced.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className="bg-surface-1 rounded-xl p-5">
          <h3 className="font-bold mb-2">Most Important Questions</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">{questions.map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
        <div className="flex gap-3">
          <Link to={`/syllabus/${company}`} className="px-4 py-2 bg-surface-2 rounded-lg">View Full Syllabus</Link>
          <Link to="/mode-selector" className="px-4 py-2 bg-primary rounded-lg font-bold">Start Practicing</Link>
        </div>
      </main>
    </div>
  )
}
