import { Search, Bell, Briefcase, Building2, Layers, Calendar, Download, TrendingUp, TrendingDown, ArrowRight, ChevronLeft, ChevronRight, ArrowRightCircle, Sparkles, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { getSessions } from '../lib/data';
import type { SessionRecord } from '../types/domain';

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setSessions(await getSessions(user.id));
    };
    void load();
  }, [user]);
  const filtered = useMemo(() => sessions.filter((s) => `${s.company} ${s.role} ${s.track}`.toLowerCase().includes(query.toLowerCase())), [sessions, query]);
  const avg = filtered.length ? Math.round(filtered.reduce((a, b) => a + b.score, 0) / filtered.length) : 0;
  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-8 h-16 sticky top-0 z-40 bg-surface-1/80 backdrop-blur-xl shadow-2xl border-b border-white/5">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-white">History</span>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm text-[#8c909f] hover:text-white transition-colors cursor-pointer">Practice</span>
              <span className="text-sm text-primary border-b-2 border-primary pb-1 cursor-pointer">History</span>
              <span className="text-sm text-[#8c909f] hover:text-white transition-colors cursor-pointer">Resources</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c909f] w-4 h-4" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search sessions..." className="bg-background border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary/40 focus:border-primary/50 w-64 transition-all opacity-90 hover:opacity-100 outline-none text-white placeholder:text-[#8c909f]" />
            </div>
            <button className="text-[#8c909f] hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <Link to="/profile" className="h-8 w-8 rounded-full bg-primary/20 overflow-hidden ring-2 ring-primary/30 flex items-center justify-center">
               <img src="https://ui-avatars.com/api/?name=User&background=4d8eff&color=fff" alt="User" className="w-full h-full object-cover" />
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Page Header & Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="md:col-span-2 bg-surface-1 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden border border-white/5">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">Practice History</h2>
                <p className="text-[#8c909f] max-w-xs text-sm">Track your evolution across {sessions.length} completed simulation sessions.</p>
              </div>
              <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
            </div>
            
            <div className="bg-surface-1 p-6 rounded-xl border border-white/5">
              <span className="text-[10px] text-primary uppercase tracking-widest block mb-4 font-bold">Avg. Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{avg}</span>
                <span className="text-[#8c909f] text-sm">/ 100</span>
              </div>
              <div className="mt-4 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${avg}%` }}></div>
              </div>
            </div>
            
            <div className="bg-surface-1 p-6 rounded-xl border border-white/5">
              <span className="text-[10px] text-[#ffb786] uppercase tracking-widest block mb-4 font-bold">Focus Needed</span>
              <div className="text-xl font-semibold text-white">System Design</div>
              <p className="text-[#8c909f] text-xs mt-2">Based on your last 3 low-score segments.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-1 p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4 border border-white/5">
            {[
              { icon: Briefcase, options: ['All Roles', 'Product Manager', 'Software Engineer'] },
              { icon: Building2, options: ['All Companies', 'Google', 'Meta', 'Stripe'] },
              { icon: Layers, options: ['All Modes', 'Audio Only', 'Video Call', 'Text Chat'] },
            ].map((filter, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-white/5">
                <filter.icon className="w-4 h-4 text-primary" />
                <select className="bg-transparent border-none text-sm focus:ring-0 p-0 pr-6 cursor-pointer outline-none text-[#c2c6d6] appearance-none">
                  {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            
            <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-white/5">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-[#c2c6d6]">Last 30 Days</span>
            </div>
            
            <div className="ml-auto flex items-center gap-3">
              <button className="text-sm font-semibold text-primary hover:underline">Reset Filters</button>
              <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
              <button className="p-2 text-[#8c909f] hover:text-white hover:bg-surface-3 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main History Table */}
          <div className="bg-surface-1 rounded-xl overflow-hidden shadow-xl border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-2 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold">Date</th>
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold">Role</th>
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold">Company</th>
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold">Mode</th>
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold">Score</th>
                    <th className="px-6 py-4 text-[10px] text-[#8c909f] uppercase tracking-widest font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(session => (
                    <tr key={session.id} className="group hover:bg-surface-2 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-white">{new Date(session.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-[#8c909f] mt-1">{new Date(session.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-white">{session.role}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-white font-medium">{session.company}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary/20 text-blue-300">
                          {session.mode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${session.score >= 80 ? 'text-primary' : session.score >= 70 ? 'text-white' : 'text-error'}`}>
                            {session.score}
                          </span>
                          {session.score >= 80 ? <TrendingUp className="w-4 h-4 text-primary" /> : session.score >= 70 ? <ArrowRight className="w-4 h-4 text-[#8c909f]" /> : <TrendingDown className="w-4 h-4 text-error" />}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link to={`/results/${session.id}`} className="px-4 py-2 bg-surface-3 rounded-lg text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all">
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-surface-1 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 gap-4">
              <p className="text-xs text-[#8c909f]">Showing <span className="font-bold text-white">1-5</span> of <span className="font-bold text-white">24</span> sessions</p>
              <div className="flex items-center gap-1">
                <button className="p-2 text-[#8c909f] hover:bg-surface-3 rounded-lg disabled:opacity-50" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 text-white text-xs font-bold">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-3 text-white text-xs font-bold">3</button>
                <button className="p-2 text-[#8c909f] hover:bg-surface-3 rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Insight Tooltip Floating (Contextual) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            <div className="bg-surface-2 p-6 rounded-xl flex gap-4 items-start relative border border-white/5">
              <div className="bg-[#ffb786]/20 p-3 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-[#ffb786]" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-1 text-white">Weekly AI Recommendation</h4>
                <p className="text-sm text-[#8c909f] leading-relaxed">Your technical scoring is consistently high (88+), but your behavioral answers for 'Leadership' traits have dipped. Consider a dedicated session for the <strong className="text-white">Amazon Leadership Principles</strong>.</p>
              </div>
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#ffb786] animate-pulse"></div>
            </div>
            
            <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 flex gap-4 items-center">
              <div className="w-16 h-16 shrink-0 bg-primary/20 rounded-lg flex items-center justify-center">
                 <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-1 text-white">Ready for the real thing?</h4>
                <p className="text-sm text-[#8c909f] mb-2 leading-relaxed">Simulate a full 45-minute technical round with a Mock Interviewer.</p>
                <button className="text-sm font-bold text-primary flex items-center gap-1 group w-max">
                  Upgrade to Premium Pro
                  <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
