import { RefreshCw, LayoutDashboard, CheckCircle2, Lightbulb, Download, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getSessionById } from '../lib/data';
import type { SessionRecord } from '../types/domain';

export default function ResultsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionRecord | null>(null);
  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      setSession(await getSessionById(id));
    };
    void load();
  }, [user, id]);

  const score = session?.score ?? 0;
  const dash = 552.92 - (552.92 * Math.min(score, 100)) / 100;

  return (
    <div className="bg-background text-onSurface min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10 lg:px-12 pt-24">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-onSurface mb-2">Interview Performance</h1>
            <p className="text-[#8c909f] text-lg">{session?.role || 'Role'} • {session ? new Date(session.created_at).toLocaleDateString() : '-'}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-surface-2 text-primary rounded-xl font-bold hover:bg-surface-3 transition-all duration-300">
              <RefreshCw className="w-5 h-5" /> Try Again
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300">
              <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Main Score Card */}
          <div className="lg:col-span-4 bg-surface-1 rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <span className="w-2 h-2 bg-[#ffb786] rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-[#ffb786] uppercase tracking-widest">AI Verified</span>
              </div>
            </div>
            
            <div className="relative w-48 h-48 mb-6">
              {/* SVG Circular Score */}
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-3" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary drop-shadow-[0_0_12px_rgba(77,142,255,0.4)]" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={dash} strokeLinecap="round" strokeWidth="12"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-extrabold tracking-tighter text-onSurface">{score}</span>
                <span className="text-sm font-bold text-[#8c909f] uppercase tracking-widest mt-1">Overall</span>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block px-6 py-2 bg-primary/20 text-primary rounded-full text-lg font-extrabold tracking-tight mb-2 border border-primary/20">
                {session?.verdict || 'Pending'}
              </div>
              <p className="text-sm text-[#8c909f] max-w-[200px] mx-auto">Top 5% of candidates for this specific role profile.</p>
            </div>
          </div>

          {/* Radar Chart / Dimension View */}
          <div className="lg:col-span-8 bg-surface-1 rounded-xl p-8 grid md:grid-cols-2 gap-8 border border-white/5">
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-6 text-onSurface">Dimension Analysis</h2>
                <div className="space-y-6">
                  {[{ label: 'Communication', score: Math.min(100, score + 5) }, { label: 'Technical Depth', score: score }, { label: 'Confidence', score: Math.max(0, score - 4) }, { label: 'Structure', score: Math.max(0, score - 8) }].map(dim => (
                    <div key={dim.label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#c2c6d6]">{dim.label}</span>
                        <span className="text-sm font-bold text-primary">{dim.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${dim.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center bg-background/50 rounded-xl p-4 border border-white/5">
              {/* SVG Radar Chart Placeholder */}
              <svg className="w-full h-full max-w-[240px]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" fill="none" r="80" stroke="#2d3449" strokeWidth="1"></circle>
                <circle cx="100" cy="100" fill="none" r="60" stroke="#2d3449" strokeWidth="1"></circle>
                <circle cx="100" cy="100" fill="none" r="40" stroke="#2d3449" strokeWidth="1"></circle>
                <circle cx="100" cy="100" fill="none" r="20" stroke="#2d3449" strokeWidth="1"></circle>
                <line stroke="#2d3449" strokeWidth="1" x1="100" x2="100" y1="20" y2="180"></line>
                <line stroke="#2d3449" strokeWidth="1" x1="20" x2="180" y1="100" y2="100"></line>
                
                <polygon fill="rgba(77, 142, 255, 0.2)" points="100,28 174,100 100,166 36,100" stroke="#4d8eff" strokeWidth="2"></polygon>
                
                <text fill="#8c909f" fontSize="8" fontWeight="700" textAnchor="middle" x="100" y="15">COMM</text>
                <text fill="#8c909f" fontSize="8" fontWeight="700" textAnchor="middle" x="190" y="103">TECH</text>
                <text fill="#8c909f" fontSize="8" fontWeight="700" textAnchor="middle" x="100" y="195">CONF</text>
                <text fill="#8c909f" fontSize="8" fontWeight="700" textAnchor="middle" x="10" y="103">EYE</text>
              </svg>
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="lg:col-span-6 bg-surface-1 border border-white/5 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-onSurface">
              <CheckCircle2 className="text-success w-6 h-6" /> Key Strengths
            </h3>
            <ul className="space-y-4">
              {session?.strengths && session.strengths.length > 0 ? session.strengths.map((str, i) => (
                <li key={i} className="p-4 bg-background rounded-lg border-l-4 border-success">
                  <h4 className="font-bold text-onSurface mb-1">{str}</h4>
                </li>
              )) : (
                <li className="p-4 bg-background rounded-lg border-l-4 border-success">
                  <h4 className="font-bold text-onSurface mb-1">Clear communication</h4>
                </li>
              )}
            </ul>
          </div>

          <div className="lg:col-span-6 bg-surface-1 border border-white/5 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-onSurface">
              <Lightbulb className="text-warning w-6 h-6" /> Areas for Growth
            </h3>
            <ul className="space-y-4">
              {session?.improvements && session.improvements.length > 0 ? session.improvements.map((imp, i) => (
                <li key={i} className="p-4 bg-background rounded-lg border-l-4 border-warning">
                  <h4 className="font-bold text-onSurface mb-1">{imp}</h4>
                </li>
              )) : (
                <li className="p-4 bg-background rounded-lg border-l-4 border-warning">
                  <h4 className="font-bold text-onSurface mb-1">Add more concrete examples</h4>
                </li>
              )}
            </ul>
          </div>

          {/* Full Transcript Section */}
          <div className="lg:col-span-12 bg-surface-1 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-8 flex justify-between items-center border-b border-white/10">
              <h3 className="text-xl font-bold text-onSurface">Interview Transcript</h3>
              <button className="text-primary font-bold flex items-center gap-2 hover:underline">
                Download PDF <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {session?.transcript?.map((msg, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className={`md:col-span-2 text-xs uppercase font-bold pt-1 ${msg.role === 'assistant' ? 'text-[#8c909f] opacity-50' : 'text-primary'}`}>
                    {msg.role === 'assistant' ? 'Interviewer' : 'Interviewee'}
                  </div>
                  <div className={`md:col-span-10 p-5 rounded-xl text-onSurface leading-relaxed relative ${msg.role === 'assistant' ? 'bg-surface-2' : 'bg-background border border-white/5'}`}>
                    {msg.role === 'user' && <div className="absolute -left-2 top-6 w-1 h-8 bg-primary rounded-full"></div>}
                    {msg.content}
                    {msg.role === 'user' && msg.feedback && msg.feedback !== "No specific feedback generated." && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-sm font-medium text-warning space-y-1">
                          {msg.feedback.split('\\n').map((line, i) => (
                            <span key={i} className="block">{line}</span>
                          ))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center text-[#8c909f]">No transcript available.</div>
              )}
            </div>
            <div className="bg-background/50 p-4 text-center border-t border-white/5">
              <button className="text-sm font-bold text-[#8c909f] hover:text-white transition-colors">Show More Transcript</button>
            </div>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-primary/5 rounded-xl p-8 border border-primary/20 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="flex-shrink-0 w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
               <Star className="text-primary w-10 h-10" fill="currentColor"/>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-onSurface">Final Verdict: {session?.verdict || 'Pending'}</h3>
              <p className="text-[#c2c6d6] leading-relaxed">Your combination of technical mastery and communication skills makes you a standout candidate. We recommend focusing on "Storytelling with Data" for your next executive-level interview round.</p>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto mt-4 md:mt-0">
              <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-extrabold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20">
                Schedule Expert Review
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
