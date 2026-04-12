import { Search, Bell, MapPin, Upload, Star, CheckCircle, Lock, Brain, Mic2, MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useProPlan } from '../hooks/useProPlan';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfileDetails, setUserProfileDetails } from '../lib/subscription';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { isPro, loading, toggle } = useProPlan();
  const [nickname, setNickname] = useState('User');
  const [goal, setGoal] = useState('Career Growth');
  const [targetRole, setTargetRole] = useState('Interview Candidate');
  const [age, setAge] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const activity = useMemo(() => Array.from({ length: 126 }).map((_, i) => {
    const r = (i * 17 + 13) % 100;
    return r > 80 ? 'bg-primary' : r > 60 ? 'bg-primary/50' : r > 30 ? 'bg-primary/20' : 'bg-surface-3';
  }), []);
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const d = await getUserProfileDetails(user.id);
      if (!d) return;
      setNickname(d.nickname);
      setGoal(d.goal);
      setTargetRole(d.target_role);
      setAge(d.age);
    };
    void load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await setUserProfileDetails(user.id, {
      nickname: nickname.trim() || 'User',
      goal: goal.trim() || 'Career Growth',
      target_role: targetRole.trim() || 'Interview Candidate',
      age,
    });
    setSaving(false);
  };
  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full">
        {/* Top Header */}
        <header className="flex justify-between items-center px-8 h-16 sticky top-0 z-40 bg-surface-1/80 backdrop-blur-xl shadow-2xl border-b border-white/5">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-white">Interview AI</span>
            <nav className="hidden md:flex gap-6">
              <span className="text-sm text-[#8c909f] hover:text-blue-300 transition-colors cursor-pointer">Practice</span>
              <span className="text-sm text-[#8c909f] hover:text-blue-300 transition-colors cursor-pointer">History</span>
              <span className="text-sm text-[#8c909f] hover:text-blue-300 transition-colors cursor-pointer">Resources</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <input className="bg-background border border-white/10 rounded-full px-4 py-1.5 pl-4 pr-10 text-sm w-48 focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all text-onSurface outline-none placeholder:text-[#8c909f]" placeholder="Search insights..." type="text"/>
              <Search className="absolute right-3 top-1.5 text-[#8c909f] w-4 h-4"/>
            </div>
            <button onClick={() => void toggle()} disabled={loading} className="px-4 py-1.5 text-xs font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/10 transition-all disabled:opacity-60">{isPro ? 'Pro Active' : 'Upgrade Plan'}</button>
            <div className="flex gap-2 items-center">
              <button className="p-2 text-[#8c909f] hover:text-white transition-colors"><Bell className="w-5 h-5"/></button>
              <Link to="/profile" className="h-8 w-8 rounded-full overflow-hidden bg-primary/20 ring-2 ring-primary/30">
                <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=User&background=4d8eff&color=fff" alt="User Avatar" />
              </Link>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
          <section className="bg-surface-1 rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Manage Account</h3>
              <button onClick={() => void signOut()} className="px-4 py-2 bg-error/20 text-error rounded-lg font-bold">Logout</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="Nickname" />
              <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="Target Role" />
              <input value={goal} onChange={(e) => setGoal(e.target.value)} className="bg-background rounded-lg px-4 py-3 border border-white/10 md:col-span-2" placeholder="Goal" />
              <input value={age ?? ''} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : null)} type="number" className="bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="Age" />
            </div>
            <button onClick={() => void saveProfile()} disabled={saving} className="mt-4 px-5 py-2 bg-primary rounded-lg font-bold disabled:opacity-60">{saving ? 'Saving...' : 'Update Profile'}</button>
          </section>

          {/* Hero Profile Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 flex items-center gap-8">
              <div className="relative group shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-2 shadow-2xl bg-surface-1">
                  <img className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=0b1326&color=fff&size=128`} alt="Profile" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#ffb786] rounded-full flex items-center justify-center border-4 border-background ring-4 ring-[#ffb786]/10">
                  <span className="text-background font-bold text-xs">A</span>
                </div>
              </div>
              <div>
                <h2 className="text-[3.5rem] font-extrabold tracking-tighter leading-none text-white mb-2">{nickname}</h2>
                <div className="flex items-center gap-4 text-[#8c909f]">
                  <span className="flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> San Francisco, CA</span>
                  <span className="w-1 h-1 bg-[#8c909f] rounded-full"></span>
                  <span className="text-primary font-semibold text-sm">{targetRole}{age ? ` • ${age}` : ''}</span>
                </div>
                <p className="text-xs text-[#c2c6d6] mt-2">Goal: {goal}</p>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end gap-3 mt-4 lg:mt-0">
              <div className="text-left lg:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] mb-1">Current Streak</p>
                <div className="text-3xl font-extrabold text-[#ffb786]">14 Days</div>
              </div>
            </div>
          </section>

          {/* Bento Grid Stats & Badge Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
            {/* Stats Bento Item */}
            <div className="md:col-span-2 lg:col-span-3 bg-surface-1 p-6 rounded-xl flex flex-col justify-between border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f]">Total Practice</span>
              <div className="mt-4">
                <div className="text-4xl font-extrabold text-white">42.5<span className="text-lg text-[#8c909f] ml-1">hrs</span></div>
                <p className="text-xs text-primary mt-1 font-medium">+12% from last week</p>
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 bg-surface-1 p-6 rounded-xl flex flex-col justify-between border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f]">Interviews Completed</span>
              <div className="mt-4">
                <div className="text-4xl font-extrabold text-white">28</div>
                <p className="text-xs text-[#8c909f] mt-1">12 Mock • 16 Technical</p>
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 bg-surface-1 p-6 rounded-xl flex flex-col justify-between border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f]">Avg Confidence</span>
              <div className="mt-4">
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-extrabold text-white">84<span className="text-lg text-[#8c909f]">%</span></div>
                  <div className="flex mb-1.5 text-[#ffb786]">
                    <Star className="w-4 h-4 fill-current"/>
                    <Star className="w-4 h-4 fill-current"/>
                    <Star className="w-4 h-4 fill-current"/>
                    <Star className="w-4 h-4 fill-current"/>
                    <Star className="w-4 h-4 text-[#8c909f]"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Card */}
            <div className="md:col-span-2 lg:col-span-3 bg-primary/5 border border-primary/20 p-6 rounded-xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Resume Status</span>
                  <h3 className="text-lg font-semibold text-white mt-2">Rivera_UX_2024.pdf</h3>
                </div>
                <button className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-all mt-4 group-hover:scale-[1.02]">
                  <Upload className="w-4 h-4"/> Re-upload Resume
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Streak Calendar (GitHub Style) */}
            <div className="lg:col-span-8 bg-surface-1 p-8 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
                <div className="hidden sm:flex items-center gap-4 text-xs text-[#8c909f] font-bold uppercase tracking-widest">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-surface-3"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-primary/20"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-primary/50"></div>
                    <div className="w-3 h-3 rounded-[2px] bg-primary"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
              {/* 30 Day Grid Placeholder */}
              <div className="grid grid-flow-col grid-rows-7 gap-2 h-32 overflow-x-auto">
                {activity.map((color, i) => <div key={i} className={`${color} h-full w-4 rounded-[2px] min-w-[12px] shrink-0`}></div>)}
              </div>
              <p className="mt-4 text-xs text-[#8c909f] font-medium italic">Latest session: 4 hours ago for "System Design Advanced"</p>
            </div>

            {/* Milestone Badges */}
            <div className="lg:col-span-4 bg-surface-1 p-8 rounded-xl border border-white/5">
              <h3 className="text-lg font-semibold mb-6 text-white">Milestone Badges</h3>
              <div className="space-y-6">
                {/* 7 Day Badge */}
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-full bg-surface-2 border border-primary/30 flex items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                    <Star className="text-primary w-6 h-6 relative z-10" fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Consistency Kickstart</h4>
                    <p className="text-xs text-[#8c909f]">7 Day Streak Completed</p>
                  </div>
                  <CheckCircle className="ml-auto text-[#ffb786] w-5 h-5 shrink-0" />
                </div>
                {/* 30 Day Badge */}
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-full bg-surface-2 border border-primary/30 flex items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                    <Star className="text-primary w-6 h-6 relative z-10" fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">The Monthly Habit</h4>
                    <p className="text-xs text-[#8c909f]">30 Day Practice Streak</p>
                  </div>
                  <CheckCircle className="ml-auto text-[#ffb786] w-5 h-5 shrink-0" />
                </div>
                {/* 100 Day Badge (Locked) */}
                <div className="flex items-center gap-4 group opacity-50 grayscale">
                  <div className="w-14 h-14 rounded-full bg-background border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                    <Lock className="text-[#8c909f] w-5 h-5 relative z-10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Elite Interviewer</h4>
                    <p className="text-xs text-[#8c909f]">100 Day Mastery Streak</p>
                  </div>
                  <div className="ml-auto text-[10px] font-bold text-[#8c909f] uppercase">Locked</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analysis / Focus Areas */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold tracking-tight text-white">Focus Areas</h3>
              <button className="text-primary text-sm font-bold hover:underline">View Detailed Analytics</button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-surface-2 px-6 py-8 rounded-xl flex-1 min-w-[300px] border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <Brain className="text-primary w-8 h-8" />
                  <span className="text-2xl font-extrabold text-white">92%</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Technical Knowledge</h4>
                <p className="text-sm text-[#8c909f]">Your understanding of React architecture and state management is exceptional.</p>
                <div className="mt-6 w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[92%] rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-surface-2 px-6 py-8 rounded-xl flex-1 min-w-[300px] border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <Mic2 className="text-[#ffb786] w-8 h-8" />
                  <span className="text-2xl font-extrabold text-white">68%</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Communication Pace</h4>
                <p className="text-sm text-[#8c909f]">You tend to speak quickly when explaining complex logic. Slow down by 15%.</p>
                <div className="mt-6 w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div className="bg-[#ffb786] h-full w-[68%] rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-surface-2 px-6 py-8 rounded-xl flex-1 min-w-[300px] border border-white/5">
                <div className="flex justify-between items-start mb-8">
                  <MessageSquare className="text-primary w-8 h-8" />
                  <span className="text-2xl font-extrabold text-white">75%</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Behavioral Responses</h4>
                <p className="text-sm text-[#8c909f]">STAR method is consistently used, but conflict resolution stories need more depth.</p>
                <div className="mt-6 w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[75%] rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Visual AI Pulse (Contextual AI Indicator) */}
        <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-surface-2/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 shadow-2xl z-50">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb786] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb786]"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter text-white">AI Coach Online</span>
        </div>
      </main>
    </div>
  );
}
