import { Code2, MonitorSmartphone, Play, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useProPlan } from '../hooks/useProPlan';

const COMPANIES = [
  { name: 'Google', difficulty: 'Hard', diffColor: 'text-error bg-error/10', desc: 'Focus on DSA & System Design', tags: ['SDE', 'PM', 'ML'], icon: <div className="text-xl font-black text-blue-500">G</div> },
  { name: 'Amazon', difficulty: 'Med', diffColor: 'text-warning bg-warning/10', desc: 'Leadership Principles focus', tags: ['SDE II', 'AWS', 'OPS'], icon: <span className="text-black font-black text-xl">A</span> },
  { name: 'Meta', difficulty: 'Hard', diffColor: 'text-error bg-error/10', desc: 'Front-end & Product Logic', tags: ['Frontend', 'Data Eng'], icon: <MonitorSmartphone className="text-blue-500" /> },
  { name: 'Microsoft', difficulty: 'Med', diffColor: 'text-warning bg-warning/10', desc: 'Software Craftsmanship', tags: ['Fullstack', 'Azure'], icon: <div className="grid grid-cols-2 gap-0.5 w-6 h-6"><div className="bg-[#F25022]"></div><div className="bg-[#7FBA00]"></div><div className="bg-[#00A4EF]"></div><div className="bg-[#FFB900]"></div></div> },
  { name: 'Apple', difficulty: 'Hard', diffColor: 'text-error bg-error/10', desc: 'System Engineering & Design', tags: ['iOS', 'C++'], icon: <Code2 className="text-slate-800" /> },
  { name: 'Netflix', difficulty: 'Hard', diffColor: 'text-error bg-error/10', desc: 'Distributed Systems scale', tags: ['SRE', 'Backend'], icon: <div className="text-red-500 font-bold text-xl">N</div> },
  { name: 'Flipkart', difficulty: 'Med', diffColor: 'text-warning bg-warning/10', desc: 'High-concurrency logic', tags: ['SDE', 'SDET'], icon: <div className="text-blue-600 font-bold text-xl italic">f</div> },
  { name: 'TCS', difficulty: 'Easy', diffColor: 'text-success bg-success/10', desc: 'Consulting & Core logic', tags: ['Digital', 'Ninja'], icon: <div className="text-blue-900 font-bold text-sm">TCS</div> },
  { name: 'Infosys', difficulty: 'Easy', diffColor: 'text-success bg-success/10', desc: 'Service-based technicals', tags: ['SE', 'PP'], icon: <div className="text-blue-700 font-black text-sm">Infy</div> },
  { name: 'Wipro', difficulty: 'Easy', diffColor: 'text-success bg-success/10', desc: 'Process-oriented tech rounds', tags: ['Elite', 'Turbo'], icon: <div className="text-blue-800 font-bold text-sm">WIPRO</div> }
];

export default function CompanyMocks() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('All')
  const { isPro } = useProPlan()

  const startMock = (companyName: string) => {
    navigate(`/room/${companyName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const filtered = useMemo(() => {
    if (difficulty === 'All') return COMPANIES
    if (difficulty === 'Medium') return COMPANIES.filter((c) => c.difficulty === 'Med')
    return COMPANIES.filter((c) => c.difficulty === difficulty)
  }, [difficulty])

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        {/* TopNavBar */}
        <header className="w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-10 hidden sm:block">
          <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
            <div className="flex gap-8 items-center">
              <span className="font-sans text-sm font-medium tracking-tight text-primary border-b-2 border-primary pb-1">Mocks</span>
              <Link to="/library" className="font-sans text-sm font-medium tracking-tight text-slate-400 hover:text-white">Library</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-surface-2 ring-2 ring-primary/20">
                <img alt="User Avatar" src="https://ui-avatars.com/api/?name=User&background=4d8eff&color=fff" />
              </Link>
            </div>
          </nav>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Filters Sidebar */}
          <aside className="w-64 border-r border-white/5 bg-surface-1/30 flex flex-col p-6 gap-8 overflow-y-auto hidden lg:flex">
            <section>
              <h3 className="font-sans text-xs uppercase font-bold tracking-widest text-[#8c909f] mb-6 flex items-center gap-2"><Filter className="w-4 h-4"/> Industry</h3>
              <div className="flex flex-col gap-3">
                {['Tech', 'Finance', 'Retail', 'Healthcare'].map((ind, i) => (
                  <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked={i===0} className="w-4 h-4 rounded-sm bg-background border-white/10 text-primary focus:ring-primary/20" />
                    <span className={`text-sm font-medium transition-colors ${i===0 ? 'text-primary' : 'text-[#8c909f] group-hover:text-white'}`}>{ind}</span>
                  </label>
                ))}
              </div>
            </section>
            <section>
              <h3 className="font-sans text-xs uppercase font-bold tracking-widest text-[#8c909f] mb-6">Difficulty</h3>
              <div className="flex flex-col gap-3">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff, i) => (
                  <label key={diff} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="difficulty" checked={difficulty === diff} onChange={() => setDifficulty(diff)} className="w-4 h-4 bg-background border-white/10 text-primary focus:ring-primary/20" />
                    <span className={`text-sm font-medium transition-colors ${i===0 ? 'text-primary' : 'text-[#8c909f] group-hover:text-white'}`}>{diff}</span>
                  </label>
                ))}
              </div>
            </section>
          </aside>

          {/* Content Area */}
          <section className="flex-grow p-8 bg-surface-1/10 overflow-y-auto">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="font-sans text-3xl font-extrabold tracking-tight text-onSurface mb-2">Company Mocks</h1>
                <p className="text-[#c2c6d6] font-sans max-w-2xl">Simulate real-world technical interviews with specialized AI models trained on specific company cultures, question patterns, and leadership principles.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startMock('google')}
                  className="py-2.5 px-6 bg-primary text-white font-bold rounded-xl text-sm transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                >
                  <Play className="w-4 h-4" fill="currentColor"/> Quick Start
                </button>
                <button onClick={() => navigate('/prepare/google')} className="py-2.5 px-6 bg-surface-2 text-primary font-bold rounded-xl text-sm">Prepare for Next Job</button>
              </div>
            </header>
            {!isPro && <div className="mb-6 text-sm text-[#ffb786]">Premium required for full prep workflows. Upgrade in Profile.</div>}

            {/* Bento Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filtered.map((company, i) => (
                <div key={i} className="glass-card p-6 flex flex-col gap-4 group hover:bg-surface-3 transition-all duration-300 cursor-pointer" onClick={() => startMock(company.name)}>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-inner">
                      {company.icon}
                    </div>
                    <span className={`${company.diffColor} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter`}>
                      {company.difficulty}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-onSurface">{company.name}</h2>
                    <p className="text-xs text-[#c2c6d6]">{company.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {company.tags.map(tag => (
                      <span key={tag} className="bg-surface-3 text-[10px] px-2 py-1 rounded-md text-blue-300 font-bold border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Hover action */}
                  <div className="pt-4 border-t border-white/5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                    <div className="flex gap-2">
                      <button className="flex-1 text-center text-sm font-bold text-primary hover:text-white transition-colors">
                        Start {company.name} Mock →
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/syllabus/${company.name.toLowerCase()}`); }} className="text-xs px-2 py-1 rounded bg-surface-2 text-[#c2c6d6]">
                        Syllabus
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/prepare/${company.name.toLowerCase()}`); }} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                        Prepare
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
