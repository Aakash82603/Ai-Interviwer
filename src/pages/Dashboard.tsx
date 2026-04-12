import { Bell, Flame, CalendarSync, ArrowRight, Zap, Target, Brain } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardSummary, getLanguageList } from '../lib/data';
import type { SessionRecord } from '../types/domain';
import { useProPlan } from '../hooks/useProPlan';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ total: 0, avg: 0, streak: 0 });
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [topic, setTopic] = useState('React Performance')
  const { isPro } = useProPlan()
  const languages = getLanguageList()

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getDashboardSummary(user.id);
      setSummary({ total: data.total, avg: data.avg, streak: data.streak });
      setSessions(data.sessions);
    };
    void load();
  }, [user]);

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* TopAppBar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-8 py-6 max-w-screen-2xl mx-auto sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-extrabold tracking-tighter text-blue-100">Performance Dashboard</h2>
            <p className="text-sm text-outline font-medium mt-1">Welcome back, your trajectory is looking sharp.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffb786] animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8c909f]">AI Engine: Online</span>
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#8c909f] hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                <img alt="User Avatar" src="https://ui-avatars.com/api/?name=User&background=4d8eff&color=fff" />
              </Link>
            </div>
          </div>
        </header>

        <div className="px-8 pb-12 max-w-screen-2xl mx-auto space-y-8">
          {/* Quick Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-1 p-6 rounded-xl group hover:bg-surface-2 transition-all duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Total Sessions</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-extrabold text-onSurface">{summary.total}</h3>
                <span className="text-xs text-primary font-bold">+12%</span>
              </div>
            </div>
            <div className="bg-surface-1 p-6 rounded-xl group hover:bg-surface-2 transition-all duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Avg Score</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-extrabold text-onSurface">{summary.avg}%</h3>
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${summary.avg}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-1 p-6 rounded-xl group hover:bg-surface-2 transition-all duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Streak 🔥</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-extrabold text-[#ffb786]">{summary.streak} days</h3>
                <Flame className="text-[#ffb786] w-6 h-6" fill="currentColor" />
              </div>
            </div>
            <div className="bg-surface-1 p-6 rounded-xl group hover:bg-surface-2 transition-all duration-300">
              <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">Daily Challenge</p>
              <div className="flex items-end justify-between">
                <h3 className="text-xs font-bold text-onSurface max-w-[160px] line-clamp-2">{topic}</h3>
                <Link to={`/daily-challenge?topic=${encodeURIComponent(topic)}`}><CalendarSync className="text-error w-6 h-6" /></Link>
              </div>
            </div>
          </section>

          {/* Main Layout Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Center/Main Section */}
            <div className="lg:col-span-8 space-y-8">
              {/* Daily Challenge Banner */}
              <div className="relative h-[240px] rounded-xl overflow-hidden bg-surface-3 group">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10"></div>
                  <img alt="Hero Background" className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 transition-transform duration-1000" src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" />
                </div>
                <div className="relative z-20 h-full p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="bg-white p-2 rounded-lg">
                       <Zap className="text-primary w-6 h-6" fill="currentColor" />
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="text-xs font-bold text-white tracking-widest tabular-nums">04h 12m 30s</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold text-onSurface tracking-tight">Google Frontend Interview Challenge</h3>
                    <p className="text-[#c2c6d6] mt-2 max-w-md">Pick a topic, then start practice to get questions and answer them.</p>
                    <div className="mt-4 max-w-md">
                      <label className="text-[10px] uppercase tracking-widest text-[#8c909f] font-bold">Topic</label>
                      <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Example: JavaScript closures"
                        className="mt-2 w-full bg-surface-1 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary/40"
                      />
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Link to={isPro ? `/practice?track=technical&topic=${encodeURIComponent(topic)}` : "/profile"} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm transition-transform hover:scale-105 duration-200">
                        Practice
                      </Link>
                      <Link to={`/daily-challenge?topic=${encodeURIComponent(topic)}`} className="px-6 py-2.5 bg-surface-1 text-[#ffb786] font-bold rounded-xl text-sm transition-transform hover:bg-surface-2 duration-200">
                        Daily 5 MCQ
                      </Link>
                      <Link to="/syllabus/google" className="px-6 py-2.5 bg-surface-1 text-primary font-bold rounded-xl text-sm transition-transform hover:bg-surface-2 duration-200">
                        View Syllabus
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions Table */}
              <div className="bg-surface-1 rounded-xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-semibold text-onSurface">Recent Sessions</h4>
                  <Link to="/history" className="text-sm font-bold text-primary hover:underline">View All History</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold tracking-widest text-[#8c909f]">
                        <th className="px-4 pb-2">Mode</th>
                        <th className="px-4 pb-2">Date</th>
                        <th className="px-4 pb-2">Score</th>
                        <th className="px-4 pb-2">Verdict</th>
                        <th className="px-4 pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                      {sessions.map((s) => (
                        <tr key={s.id} className="bg-surface-2 hover:bg-surface-3 transition-colors group cursor-pointer">
                          <td className="px-4 py-4 rounded-l-xl">
                            <span className="px-3 py-1 bg-[#ffb786]/20 text-[#ffb786] text-[10px] font-bold uppercase rounded-full">{s.mode}</span>
                          </td>
                          <td className="px-4 py-4 text-onSurfaceVariant">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-4 font-bold text-onSurface">{s.score}%</td>
                          <td className="px-4 py-4 text-primary">{s.verdict}</td>
                          <td className="px-4 py-4 rounded-r-xl">
                            <Link to={`/results/${s.id}`}><ArrowRight className="w-4 h-4 text-[#8c909f] group-hover:text-primary transition-colors" /></Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface-1 rounded-xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-onSurface">Top Market Languages</h4>
                  <span className="text-xs text-[#8c909f]">Choose any to study full syllabus + notes + practice</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {languages.map((lang) => {
                    const slug = lang.toLowerCase().replace('#', 'sharp').replace('++', 'pp')
                    return (
                      <Link
                        key={lang}
                        to={`/learn/${slug}`}
                        className="px-4 py-3 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm font-bold text-primary text-center"
                      >
                        {lang}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-surface-1 p-8 rounded-xl space-y-4">
                <h4 className="text-lg font-bold text-onSurface">Accelerate Growth</h4>
                <p className="text-sm text-[#8c909f] leading-relaxed">Choose your intensity level for today's session. Live interviews include real-time sentiment analysis.</p>
                <div className="space-y-3 pt-2">
                  <Link to="/mode-selector" className="w-full py-4 px-6 bg-primary/20 text-primary hover:bg-primary hover:text-white font-black rounded-xl flex items-center justify-between group transition-all duration-200">
                    <span>Start Live Interview</span>
                    <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/mocks" className="w-full py-4 px-6 bg-surface-2 text-primary font-bold rounded-xl flex items-center justify-between group hover:bg-surface-3 transition-colors duration-200">
                    <span>Practice Session</span>
                    <Target className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* AI Insights Card */}
              <div className="bg-gradient-to-br from-surface-1 to-[#060e20] p-8 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-[#ffb786]" />
                  <h4 className="text-sm font-bold uppercase tracking-widest text-onSurface">Cognitive Echo Insights</h4>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</div>
                    <div>
                      <p className="text-sm font-semibold text-onSurface">Communication Velocity</p>
                      <p className="text-xs text-[#8c909f] mt-1">You tend to speak 15% faster when discussing algorithm complexity.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</div>
                    <div>
                      <p className="text-sm font-semibold text-onSurface">Confidence Markers</p>
                      <p className="text-xs text-[#8c909f] mt-1">"Actually" and "Basically" are frequent filler words. Reducing these will increase perceived authority.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
