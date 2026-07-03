import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Video, MonitorUp, Settings, Send, Mic2, Brain, MicOff, VideoOff, PhoneOff, AlertCircle } from 'lucide-react';
import { generateResponse, evaluateInterview, type Message } from '../lib/gemini';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSession, saveSessionResult } from '../lib/data';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';

export default function LiveInterviewRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const selectedTrack = (searchParams.get('track') || 'technical') as 'technical' | 'aptitude' | 'group-discussion';
  const interviewer = (searchParams.get('interviewer') || 'female') as 'female' | 'male';
  const voiceStyle = (searchParams.get('voiceStyle') || 'clear') as 'clear' | 'fluent';
  const role = searchParams.get('role') || 'Software Engineer';
  const seniority = searchParams.get('seniority') || 'Mid-level';
  const qCount = parseInt(searchParams.get('qCount') || '8', 10);
  const company = id ? id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General';
  
  const greetingTemplates: Record<'technical' | 'aptitude' | 'group-discussion', string[]> = {
    technical: [
      `Hi! Great to meet you. I see you're interviewing for ${role}. Before we dive into technical questions, tell me about yourself — your background, experience, and current projects you've worked on.`
    ],
    aptitude: [
      `Welcome to the Aptitude Test! This tests your math, logic, and reasoning skills. You'll get questions at varying difficulty levels. Ready? Here's your first question.`
    ],
    'group-discussion': [
      `Welcome to Group Discussion Practice! Here's your topic: "Remote Work vs Office Work — Which is Better?" Speak for at least 2-3 minutes covering different angles. When you're done, pause and I'll evaluate your response.`
    ],
  };
  const greetingList = greetingTemplates[selectedTrack] || greetingTemplates.technical;
  const greeting = greetingList[0];

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [responseLatencyMs, setResponseLatencyMs] = useState<number | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting }
  ]);
  const resumeContext = localStorage.getItem('resume_context_summary') || '';

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  const isProcessingRef = useRef(false);
  const isAISpeakingRef = useRef(false);
  const lastSentRef = useRef('');
  const voicesLoadedRef = useRef(false);

  messagesRef.current = messages;
  isProcessingRef.current = isProcessing;
  isAISpeakingRef.current = isAISpeaking;

  const audioMetrics = useAudioLevel(mediaStream, isAudioEnabled);

  const speakMessage = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const targetGenderHint = interviewer === 'male'
      ? /(david|mark|male|guy|man|google uk english male)/i
      : /(zira|samantha|female|woman|aria|google us english|jenny|michelle)/i;
    const preferred = voices.find((v) => targetGenderHint.test(v.name)) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.lang = 'en-US';
    utterance.volume = 0.85;
    utterance.rate = voiceStyle === 'clear' ? 0.92 : 1.05;
    utterance.pitch = voiceStyle === 'clear' ? 1.0 : 1.05;

    utterance.onstart = () => {
      isAISpeakingRef.current = true;
      setIsAISpeaking(true);
    };

    utterance.onend = () => {
      isAISpeakingRef.current = false;
      setIsAISpeaking(false);
    };

    utterance.onerror = () => {
      isAISpeakingRef.current = false;
      setIsAISpeaking(false);
    };

    isAISpeakingRef.current = true;
    setIsAISpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [interviewer, voiceStyle]);

  const buildSystemPrompt = useCallback(() => {
    return `You are the Antigravity AI Interviewer - a multi-mode interview platform.

=== ACTIVE MODE ===
${selectedTrack === 'technical' ? 'MODE 1: TECHNICAL INTERVIEW' : selectedTrack === 'aptitude' ? 'MODE 2: APTITUDE TEST (Math & Logic)' : 'MODE 3: GROUP DISCUSSION (GD - Speaking Skills)'}

Target Role: ${role}
Seniority: ${seniority}
Target Company: ${company}
Resume context: ${resumeContext || 'none provided'}

=== CRITICAL RULES ===
- Evaluate ONLY what the candidate actually said. Never invent or assume answers they did not give.
- If the candidate says nothing meaningful, says "I don't know", or gives a one-word answer, score it honestly as weak.
- Do NOT give praise for content the candidate did not mention.
- Acknowledge their actual words before evaluating.

=== RESPONSE FORMAT ===
Keep responses clean, natural, and simple. Do NOT print the MODE INDICATOR in your messages.

=== IF MODE 1: TECHNICAL INTERVIEW ===
- Ask ${qCount} questions total with progressive difficulty (basic → intermediate → advanced).
- AFTER each answer, evaluate using this EXACT format:
  ✅ CORRECT PARTS: [What they actually got right — quote their words]
  ❌ MISSING / WRONG PARTS: [What they missed — be specific]
  📚 COMPLETE ANSWER: [Brief model answer]
  ➡️ NEXT: [Your next question]

=== IF MODE 2: APTITUDE TEST ===
- Ask Math/Logic problems. Pure MATH/LOGIC format.
- Quick Feedback: "✅ CORRECT!..." or "❌ INCORRECT. Correct answer: X."

=== IF MODE 3: GROUP DISCUSSION ===
- Score: Communication (/25), Content (/25), Logical Thinking (/20), Confidence (/15), Time Management (/15).
- Give overall score out of 10, Strengths, and Improvements based on what they actually said.

Follow the active mode exactly.`;
  }, [selectedTrack, role, seniority, company, resumeContext, qCount]);

  const handleUserMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (isProcessingRef.current || isAISpeakingRef.current) return;
    if (trimmed === lastSentRef.current) return;

    lastSentRef.current = trimmed;
    const newUserMessage: Message = { role: 'user', content: trimmed };
    const allMessages = [...messagesRef.current, newUserMessage];

    messagesRef.current = allMessages;
    setMessages(allMessages);
    setInputValue('');
    setIsProcessing(true);
    isProcessingRef.current = true;

    const startTime = performance.now();

    try {
      const aiResponseText = await generateResponse(allMessages, buildSystemPrompt());
      const latency = Math.round(performance.now() - startTime);
      setResponseLatencyMs(latency);

      const withResponse = [...allMessages, { role: 'assistant' as const, content: aiResponseText }];
      messagesRef.current = withResponse;
      setMessages(withResponse);
      speakMessage(aiResponseText);
    } catch (err) {
      console.error('Failed to generate response:', err);
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
      setTimeout(() => {
        lastSentRef.current = '';
      }, 1500);
    }
  }, [buildSystemPrompt, speakMessage]);

  const onFinalTranscript = useCallback(
    (text: string, _confidence: number) => {
      void handleUserMessage(text);
    },
    [handleUserMessage],
  );

  const speech = useSpeechRecognition({
    enabled: isAudioEnabled,
    paused: isAISpeaking || isProcessing,
    onFinalTranscript,
  });

  // Load TTS voices (Chrome loads them asynchronously)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      voicesLoadedRef.current = true;
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, speech.interimTranscript]);

  // Initial greeting speech — delay mic until AI finishes speaking
  useEffect(() => {
    const timer = setTimeout(() => speakMessage(greeting), 500);
    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [greeting, speakMessage]);

  useEffect(() => {
    const setup = async () => {
      if (!user) return;
      const newId = await createSession({
        userId: user.id,
        company,
        role,
        mode: 'live',
        track: selectedTrack,
      });
      setSessionId(newId);
    };
    void setup();
  }, [user, company, role, selectedTrack]);

  // Initialize Camera & Microphone
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };
    void initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      speech.stop();
    };
  }, []);

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const next = !audioTrack.enabled;
        audioTrack.enabled = next;
        setIsAudioEnabled(next);
      }
    }
  };

  const handleEndInterview = async () => {
    if (isEnding) return;
    setIsEnding(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    speech.stop();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const finalMessages = messagesRef.current;
    const evaluation = await evaluateInterview(finalMessages);
    const transcriptForDb = finalMessages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, feedback: undefined as string | undefined }));

    let userMsgIndex = 0;
    transcriptForDb.forEach((msg) => {
      if (msg.role === 'user') {
        msg.feedback = evaluation.userFeedback[userMsgIndex] || 'No specific feedback generated.';
        userMsgIndex++;
      }
    });

    if (sessionId) {
      await saveSessionResult(sessionId, {
        score: evaluation.score,
        verdict: evaluation.verdict,
        transcript: transcriptForDb,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        dimensions: evaluation.dimensions,
        recommendation: evaluation.recommendation,
      });
      navigate(`/results/${sessionId}`);
      return;
    }

    navigate('/mode-selector');
  };

  const waveformHeights = [
    Math.max(4, Math.round(audioMetrics.volume * 0.12)),
    Math.max(6, Math.round(audioMetrics.volume * 0.2)),
    Math.max(5, Math.round(audioMetrics.volume * 0.16)),
    Math.max(8, Math.round(audioMetrics.volume * 0.24)),
  ];

  const liveFeedText = speech.interimTranscript
    || (isProcessing ? 'Processing your answer...'
    : isAISpeaking ? 'AI interviewer is speaking...'
    : isAudioEnabled ? (audioMetrics.isActive ? 'Hearing your voice...' : 'Listening — speak your answer...')
    : 'Microphone disabled.');

  const sttAccuracy = speech.lastConfidence > 0
    ? Math.round(speech.lastConfidence * 100)
    : speech.isListening ? null : 0;

  return (
    <div className="bg-background text-onSurface font-sans selection:bg-primary/30 h-screen flex flex-col overflow-hidden relative">
      {(speech.error || !speech.isSupported) && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center gap-2 text-sm text-warning shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{speech.error || 'Voice input unavailable — type your answers below.'}</span>
        </div>
      )}

      <header className="bg-surface-1/80 backdrop-blur-xl border-b border-white/5 w-full z-50 shadow-2xl flex justify-between items-center px-4 md:px-8 h-16 shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-blue-400">AI Interviewer</span>
          <div className="hidden md:block h-6 w-px bg-[#424754]"></div>
          <div className="flex flex-col">
            <span className="font-sans text-xs md:text-sm font-bold text-onSurface line-clamp-1">{role} — {selectedTrack === 'technical' ? 'Technical' : selectedTrack === 'aptitude' ? 'Aptitude' : 'Group Discussion'} Interview</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${speech.isListening && !isAISpeaking ? 'bg-success' : 'bg-error'}`}></span>
              <span className="text-[10px] md:text-xs font-mono text-[#c2c6d6] tracking-wider uppercase">
                {speech.isListening && !isAISpeaking ? 'Mic Active' : isAISpeaking ? 'AI Speaking' : 'Standby'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleEndInterview} disabled={isEnding} className="px-4 py-2 bg-error/10 text-error font-sans font-bold text-sm rounded-xl hover:bg-error hover:text-white transition-all active:scale-95 flex items-center gap-2 border border-error/20 disabled:opacity-50">
             <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">{isEnding ? 'Analyzing...' : 'End Interview'}</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-10 gap-0 overflow-hidden mb-20">
        <section className="md:col-span-6 p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
          <div className="relative flex-1 bg-surface-1 rounded-xl overflow-hidden shadow-2xl group border border-white/5 flex items-center justify-center">
            {isVideoEnabled ? (
               <video 
                 ref={videoRef}
                 autoPlay 
                 playsInline 
                 muted 
                 className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
               ></video>
            ) : (
               <div className="flex flex-col items-center justify-center text-[#8c909f]">
                 <VideoOff className="w-12 h-12 mb-4 opacity-50" />
                 <p className="font-mono text-sm">Camera Disabled</p>
               </div>
            )}
            
            <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-10 transition-opacity">
              <div className={`flex items-end gap-1 h-6 px-1 ${isAudioEnabled ? 'text-primary' : 'text-error'}`}>
                {isAudioEnabled ? (
                  <>
                    {waveformHeights.map((h, i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-primary rounded-sm transition-all duration-75"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </>
                ) : (
                  <MicOff className="w-4 h-4 mb-1" />
                )}
              </div>
              <span className={`text-xs font-bold font-sans uppercase tracking-widest ${isAudioEnabled ? 'text-primary' : 'text-error'}`}>
                 {isAudioEnabled ? (speech.interimTranscript ? 'Hearing...' : audioMetrics.isActive ? 'Voice Detected' : 'Listening...') : 'Mic Off'}
              </span>
            </div>
            
            <div className="absolute top-6 right-6 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-lg z-10">
              <span className="text-primary text-[10px] font-black uppercase tracking-tighter">LIVE</span>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 md:gap-6 shrink-0">
            <button 
              onClick={toggleAudio}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isAudioEnabled ? 'bg-surface-2 text-onSurface hover:bg-primary hover:text-white' : 'bg-error text-white hover:bg-red-600'}`}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button 
              onClick={toggleVideo}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isVideoEnabled ? 'bg-surface-2 text-onSurface hover:bg-primary hover:text-white' : 'bg-error text-white hover:bg-red-600'}`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <VideoOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface-2 text-[#8c909f] hover:text-onSurface flex items-center justify-center hover:bg-surface-3 transition-all duration-300 shadow-lg">
              <MonitorUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="w-px h-8 md:h-10 bg-white/10"></div>
            <button className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface-2 text-[#8c909f] hover:text-onSurface flex items-center justify-center hover:bg-surface-3 transition-all duration-300 shadow-lg">
              <Settings className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </section>

        <section className="md:col-span-4 bg-surface-1/50 border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-full overflow-hidden">
          <div className="p-4 md:p-6 bg-surface-1/50 backdrop-blur-sm border-b border-white/5 shrink-0 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center bg-background">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-warning animate-pulse' : 'bg-success'}`}></div>
                </div>
              </div>
              <div>
                <h3 className="font-sans font-bold text-onSurface">AI Interviewer</h3>
                <p className="text-[10px] md:text-xs text-[#c2c6d6] font-sans uppercase tracking-widest mt-1">
                  {isProcessing ? 'Evaluating Your Answer' : 'Real-time Analysis'}
                </p>
              </div>
            </div>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 custom-scrollbar pb-10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : ''}`}>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${msg.role === 'assistant' ? 'text-primary ml-1' : 'text-[#c2c6d6] mr-1'}`}>
                  {msg.role === 'assistant' ? 'AI INTERVIEWER' : 'YOU'}
                </span>
                <div className={`p-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-surface-2 rounded-xl rounded-tl-none text-onSurface' : 'bg-primary/20 border border-primary/30 rounded-xl rounded-tr-none text-blue-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-[#ffb786] rounded-full animate-pulse"></div>
                <span className="text-[10px] italic text-[#8c909f]">Analyzing your actual response...</span>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-surface-1 shrink-0">
            <div className="relative group flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserMessage(inputValue)}
                className="w-full bg-background border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-[#8c909f] transition-all outline-none" 
                placeholder="Type a response if mic fails..." 
                disabled={isProcessing || isAISpeaking}
              />
              <button onClick={() => handleUserMessage(inputValue)} disabled={isProcessing || isAISpeaking || !inputValue.trim()} className="absolute right-3 text-primary hover:text-white transition-colors disabled:opacity-50">
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-0 w-full h-20 bg-surface-1 border-t border-white/5 flex flex-col md:flex-row items-center px-4 md:px-8 gap-2 md:gap-6 z-50 shrink-0 justify-center md:justify-start">
        <div className="flex-shrink-0 flex items-center gap-3 hidden md:flex">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
             <Mic2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-black text-[#8c909f] uppercase tracking-tighter w-16">LIVE FEED</span>
        </div>
        <div className="flex-1 overflow-hidden w-full text-center md:text-left">
          <p className="text-onSurface text-sm md:text-lg font-medium italic opacity-90 truncate leading-relaxed">
            {liveFeedText}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 hidden md:flex">
          <div className="flex gap-3 mr-4">
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Vol: <span className="text-white">{audioMetrics.volume}%</span></span>
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Clarity: <span className={audioMetrics.clarity > 40 ? 'text-[#00ff9d]' : 'text-warning'}>{audioMetrics.clarity}%</span></span>
            {responseLatencyMs !== null && (
              <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">AI Lat: <span className="text-white">{responseLatencyMs}ms</span></span>
            )}
          </div>
          {sttAccuracy !== null && sttAccuracy > 0 && (
            <div className="px-3 py-1 bg-[#ffb786]/20 border border-[#ffb786]/30 rounded-full">
              <span className="text-[10px] text-[#ffb786] font-bold uppercase tracking-widest">STT {sttAccuracy}%</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
