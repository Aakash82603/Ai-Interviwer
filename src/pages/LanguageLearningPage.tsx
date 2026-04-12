import { Link, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { getLanguageContent } from '../lib/data'

export default function LanguageLearningPage() {
  const { language = '' } = useParams()
  const content = getLanguageContent(language)

  if (!content) {
    return (
      <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold">Language Not Found</h1>
          <Link to="/dashboard" className="text-primary font-bold mt-4 inline-block">Back to Dashboard</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">{content.language} Learning Hub</h1>
            <p className="text-[#8c909f] mt-1">Market Demand: {content.marketDemand}</p>
          </div>
          <Link to="/dashboard" className="text-primary font-bold">Back</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-surface-1 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">Syllabus</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {content.syllabus.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-surface-1 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">Full Notes</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {content.notes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="bg-surface-1 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">Practice Questions</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {content.practiceQuestions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>

        <Link to={`/practice?track=technical&topic=${encodeURIComponent(content.language)}`} className="inline-block px-6 py-3 bg-primary rounded-xl font-bold">
          Start {content.language} Practice
        </Link>
      </main>
    </div>
  )
}
