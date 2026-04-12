import { Brain, Mic2, Rocket, UploadCloud, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { parseResume } from '../lib/gemini';

export default function ModeSelector() {
  const [selectedMode, setSelectedMode] = useState<'practice' | 'live'>('live');
  const [track, setTrack] = useState<'technical' | 'aptitude' | 'group-discussion'>('technical');
  const [interviewerVoice, setInterviewerVoice] = useState<'female' | 'male'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'fluent' | 'clear'>('clear');
  const [seniority, setSeniority] = useState<'Fresher' | 'Mid-level' | 'Senior'>('Mid-level');
  const [qCount, setQCount] = useState(5);
  const [resumeName, setResumeName] = useState<string>('');
  const [resumeStatus, setResumeStatus] = useState<string>('No resume uploaded');
  const [resumeBusy, setResumeBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = async (file?: File) => {
    if (!file) return;
    setResumeBusy(true);
    setResumeName(file.name);
    try {
      const raw = await file.text();
      const summary = await parseResume(raw.slice(0, 12000));
      localStorage.setItem('resume_context_summary', summary);
      localStorage.setItem('resume_file_name', file.name);
      setResumeStatus('Resume analyzed and saved to context.');
    } catch {
      setResumeStatus('Could not parse this file. Try TXT/DOCX text export.');
    } finally {
      setResumeBusy(false);
    }
  };

  return (
    <div className="bg-background text-onSurface min-h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto w-full p-8 lg:p-12 max-w-7xl mx-auto">
        <header className="mb-12 mt-4">
          <span className="text-[10px] text-primary tracking-[0.2em] font-bold uppercase mb-2 block">Configuration</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-onSurface mb-4">Set Your Stage</h1>
          <p className="text-sm text-[#8c909f] max-w-2xl">Tailor your AI interaction to match your career goals. Choose your mode and define the parameters of your next session.</p>
        </header>

        {/* Mode Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Practice Mode Card */}
          <div 
            onClick={() => setSelectedMode('practice')}
            className={`group relative bg-surface-1 p-8 rounded-xl ring-1 transition-all duration-300 cursor-pointer overflow-hidden ${selectedMode === 'practice' ? 'ring-primary shadow-lg shadow-primary/10' : 'ring-white/10 hover:ring-primary/40'}`}
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-surface-3 rounded-lg flex items-center justify-center text-primary mb-6 ring-1 ring-white/5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Practice Mode</h3>
              <p className="text-sm text-[#8c909f] mb-6">Real-time feedback, hints enabled, and unlimited time to refine your responses. Perfect for skill building.</p>
              <div className={`flex items-center font-bold text-xs tracking-wider uppercase ${selectedMode === 'practice' ? 'text-primary' : 'text-[#8c909f] group-hover:text-primary'}`}>
                {selectedMode === 'practice' ? 'SELECTED' : 'SELECT MODE'}
              </div>
            </div>
            {selectedMode === 'practice' && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>}
          </div>

          {/* Live Interview Card */}
          <div 
             onClick={() => setSelectedMode('live')}
             className={`group relative bg-surface-2 p-8 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${selectedMode === 'live' ? 'ring-2 ring-primary shadow-2xl shadow-primary/10' : 'ring-1 ring-white/10 hover:ring-primary/40'}`}
          >
            {selectedMode === 'live' && <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#ffb786]/20 rounded-lg flex items-center justify-center text-[#ffb786]">
                   <Mic2 className="w-6 h-6" />
                </div>
                <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">Recommended</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Live Interview</h3>
              <p className="text-sm text-[#8c909f] mb-6">The true simulation. Timed responses, no hints, and a comprehensive final report with scoring.</p>
              <div className={`flex items-center font-bold text-xs tracking-wider uppercase ${selectedMode === 'live' ? 'text-primary' : 'text-[#8c909f] group-hover:text-primary'}`}>
                {selectedMode === 'live' ? 'SELECTED' : 'SELECT MODE'}
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Parameters Column */}
          <div className="xl:col-span-2 space-y-10">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-onSurface">Practice Track</h2>
              </div>
              <div className="flex gap-3 mb-8">
                {(['technical', 'aptitude', 'group-discussion'] as const).map((t) => (
                  <button key={t} onClick={() => setTrack(t)} className={`px-3 py-2 rounded-lg text-xs font-bold ${track === t ? 'bg-primary text-white' : 'bg-surface-1 text-[#8c909f]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-onSurface">AI Interviewer Voice</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setInterviewerVoice('female')} className={`p-3 rounded-xl text-sm font-bold ${interviewerVoice === 'female' ? 'bg-primary text-white' : 'bg-surface-1 text-[#8c909f]'}`}>
                  Female Voice
                </button>
                <button onClick={() => setInterviewerVoice('male')} className={`p-3 rounded-xl text-sm font-bold ${interviewerVoice === 'male' ? 'bg-primary text-white' : 'bg-surface-1 text-[#8c909f]'}`}>
                  Male Voice
                </button>
                <button onClick={() => setVoiceStyle('clear')} className={`p-3 rounded-xl text-sm font-bold ${voiceStyle === 'clear' ? 'bg-primary text-white' : 'bg-surface-1 text-[#8c909f]'}`}>
                  Clear
                </button>
                <button onClick={() => setVoiceStyle('fluent')} className={`p-3 rounded-xl text-sm font-bold ${voiceStyle === 'fluent' ? 'bg-primary text-white' : 'bg-surface-1 text-[#8c909f]'}`}>
                  Fluent
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-onSurface">Core Parameters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8c909f] uppercase tracking-wider">Target Role</label>
                  <div className="relative">
                    <select className="w-full bg-surface-1 border-none ring-1 ring-white/10 hover:ring-white/20 text-onSurface py-3 px-4 rounded-xl appearance-none focus:ring-primary/50 transition-all cursor-pointer text-sm outline-none">
                      <option>Software Engineer</option>
                      <option>Product Manager</option>
                      <option>UX Designer</option>
                      <option>Data Scientist</option>
                      <option>DevOps Architect</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8c909f] w-5 h-5"/>
                  </div>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#8c909f] uppercase tracking-wider">Seniority Level</label>
                  <div className="flex bg-surface-1 p-1 rounded-xl ring-1 ring-white/10">
                    {['Fresher', 'Mid-level', 'Senior'].map(level => (
                      <button 
                        key={level}
                        onClick={() => setSeniority(level as 'Fresher' | 'Mid-level' | 'Senior')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${seniority === level ? 'bg-primary text-white' : 'text-[#8c909f] hover:text-white'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h2 className="text-lg font-semibold text-onSurface">Session Length</h2>
              </div>
              <div className="flex gap-4">
                {[5, 10, 15].map(cnt => (
                  <label key={cnt} className="flex-1 cursor-pointer">
                    <input type="radio" checked={qCount === cnt} onChange={() => setQCount(cnt)} className="hidden peer" name="qcount"/>
                    <div className="bg-surface-1 ring-1 ring-white/10 peer-checked:ring-primary peer-checked:bg-primary/10 p-4 rounded-xl text-center transition-all hover:ring-white/20">
                      <div className="text-2xl font-bold mb-1">{cnt}</div>
                      <div className="text-[10px] font-bold text-[#8c909f] uppercase">Questions</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Resume Upload Column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#ffb786] rounded-full"></div>
              <h2 className="text-lg font-semibold text-onSurface">Context Engine</h2>
            </div>
            
            <div className="p-1 rounded-xl" style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%234D8EFFFF' stroke-width='2' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`}}>
              <input ref={fileRef} type="file" accept=".txt,.md,.doc,.docx,.pdf" className="hidden" onChange={(e) => void handleResumeUpload(e.target.files?.[0])} />
              <div onClick={() => fileRef.current?.click()} className="bg-surface-1 hover:bg-surface-2 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer aspect-square">
                <div className="w-16 h-16 bg-surface-3 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UploadCloud className="text-primary w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Upload Resume</h4>
                <p className="text-xs text-[#8c909f] mb-6 px-4 leading-relaxed">Let the AI analyze your background to tailor specific questions.</p>
                <span className="text-[10px] font-bold text-primary border-b border-primary/30 pb-0.5 uppercase tracking-wider">{resumeBusy ? 'Analyzing...' : 'PDF or DOCX (Max 5MB)'}</span>
                <span className="text-[10px] mt-3 text-[#c2c6d6]">{resumeName || resumeStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <footer className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-surface-1 rounded-2xl border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-2 h-2 bg-[#ffb786] rounded-full absolute -top-1 -right-1 animate-pulse"></div>
              <Brain className="text-[#8c909f] w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-onSurface">AI Interviewer Ready</div>
              <div className="text-xs text-[#8c909f] italic mt-0.5">Calibrating personality based on {seniority} role...</div>
            </div>
          </div>
          
          <Link to={selectedMode === 'live' ? `/room/new?track=${track}&interviewer=${interviewerVoice}&voiceStyle=${voiceStyle}` : `/practice?track=${track}&interviewer=${interviewerVoice}&voiceStyle=${voiceStyle}`} className="w-full sm:w-auto bg-primary text-white px-12 py-4 rounded-xl font-extrabold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
            Launch Interview <Rocket className="w-5 h-5"/>
          </Link>
        </footer>
      </main>
    </div>
  );
}
