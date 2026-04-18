import { useState, useRef, useEffect } from 'react';
import { Mic, Video, MonitorUp, Settings, Send, Mic2, Brain, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { generateResponse, evaluateInterview, type Message } from '../lib/gemini';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSession, saveSessionResult } from '../lib/data';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
      `🎯 TECHNICAL INTERVIEW MODE\nHi! Great to meet you. I see you're interviewing for ${role}. Before we dive into technical questions, tell me about yourself - your background, experience, current projects you've worked on?`
    ],
    aptitude: [
      `📊 APTITUDE TEST MODE\nWelcome to the Aptitude Test! This tests your math, logic, and reasoning skills. You'll get 10 questions at varying difficulty levels. Each question is timed. Ready?`
    ],
    'group-discussion': [
      `🎤 GROUP DISCUSSION MODE\nWelcome to Group Discussion Practice! I'll give you a random topic. You need to speak for AT LEAST 4-5 minutes continuously. Think before you speak, organize your thoughts, and try to cover different angles of the topic.\n\nHere's your topic:\nArtificial Intelligence: Boon or Bane?\n\nYou have 30 seconds to organize your thoughts. Then speak!`
    ],
  };
  const greetingList = greetingTemplates[selectedTrack] || greetingTemplates.technical;
  const greeting = greetingList[0];

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const resumeContext = localStorage.getItem('resume_context_summary') || '';

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAISpeakingRef = useRef(false);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  // Initial greeting speech
  useEffect(() => {
    speakMessage(messages[0].content);
    // Cleanup
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const setup = async () => {
      if (!user) return;
      const id = await createSession({
        userId: user.id,
        company,
        role: 'Software Engineer',
        mode: 'live',
        track: selectedTrack,
      });
      setSessionId(id);
    };
    void setup();
  }, [user, company, selectedTrack]);

  // Initialize Camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Toggle Video
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (audioTrack.enabled && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        } else if (!audioTrack.enabled && recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        if (isAISpeakingRef.current) return;
        
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            handleUserMessage(transcriptPart);
            currentTranscript = '';
          } else {
            currentTranscript += transcriptPart;
          }
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        if (isAudioEnabled && streamRef.current?.getAudioTracks()[0]?.enabled && !isAISpeakingRef.current) {
          try { recognition.start(); } catch(e) {}
        }
      };

      // Only restart if speech synthesis is NOT speaking to avoid recording AI's voice
      const interval = setInterval(() => {
          if (isAudioEnabled && !isAISpeakingRef.current && recognitionRef.current) {
             try { recognitionRef.current.start(); } catch(e) {}
          } else if (isAISpeakingRef.current && recognitionRef.current) {
             try { recognitionRef.current.stop(); } catch(e) {}
          }
      }, 1000);

      recognitionRef.current = recognition;
      if (isAudioEnabled && !isAISpeakingRef.current) {
        try { recognition.start(); } catch(e) {}
      }

      return () => {
          clearInterval(interval);
      }
    }
  }, [isAudioEnabled]);

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const targetGenderHint = interviewer === 'male' ? /(david|mark|male|guy|man)/i : /(zira|samantha|female|woman|aria|google us english)/i;
      const preferred = voices.find((v) => targetGenderHint.test(v.name)) || voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.volume = 0.75; // soft
      utterance.rate = voiceStyle === 'clear' ? 0.9 : 1.0;
      utterance.pitch = voiceStyle === 'clear' ? 1.0 : 1.05;
      utterance.onstart = () => {
        isAISpeakingRef.current = true;
        if (recognitionRef.current) {
           try { recognitionRef.current.stop(); } catch(e) {}
        }
      };
      
      utterance.onend = () => {
        isAISpeakingRef.current = false;
      };

      utterance.onerror = () => {
        isAISpeakingRef.current = false;
      };

      isAISpeakingRef.current = true;
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e) {} // Stop immediately
      }
      window.speechSynthesis.speak(utterance);
    }
  }

  const handleUserMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const newUserMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setTranscript('');
    setIsProcessing(true);

    // const trackInstruction =
    //   selectedTrack === 'aptitude'
    //     ? 'Focus on quantitative reasoning, logical puzzles, analytical thinking, and problem-solving speed.'
    //     : selectedTrack === 'group-discussion'
    //       ? 'Focus on communication quality, argument structure, collaboration language, and persuasive clarity.'
    //       : 'Focus on technical depth: implementation details, trade-offs, debugging, and system design thinking.';

    const systemPrompt = `You are the Antigravity AI Interviewer - a multi-mode interview platform.

=== ACTIVE MODE ===
${selectedTrack === 'technical' ? 'MODE 1: TECHNICAL INTERVIEW' : selectedTrack === 'aptitude' ? 'MODE 2: APTITUDE TEST (Math & Logic)' : 'MODE 3: GROUP DISCUSSION (GD - Speaking Skills)'}

Target Role: ${role}
Seniority: ${seniority}
Target Company: ${company}
Resume context: ${resumeContext || 'none provided'}

=== UNIFIED CONVERSATION RULES ===
✅ ALWAYS:
- Acknowledge user's choice
- Give clear instructions
- Evaluate honestly
- Provide constructive feedback
- Encourage practice

❌ NEVER:
- Mix modes (if doing aptitude, don't ask technical)
- Skip instructions
- Be vague about scoring
- Rush evaluations
- Ignore user preferences
- Show timers, countdowns, or "time remaining" messages

=== RESPONSE FORMAT ===
Keep responses clean, natural, and simple. Do NOT print the MODE INDICATOR in your messages.
Do NOT include any timer, countdown, or "time remaining" in your responses.

=== IF MODE 1: TECHNICAL INTERVIEW ===
- Start by asking them to introduce themselves (if first message).
- Ask ${qCount} questions total.
- YOU MUST follow a STRICT progressive difficulty order from BASIC to ADVANCED:
  • Questions 1-${Math.ceil(qCount * 0.3)}: BASIC / WARM-UP level (fundamental concepts, definitions, simple examples)
  • Questions ${Math.ceil(qCount * 0.3) + 1}-${Math.ceil(qCount * 0.65)}: INTERMEDIATE / FOUNDATION level (applied knowledge, trade-offs, implementation details)
  • Questions ${Math.ceil(qCount * 0.65) + 1}-${qCount}: ADVANCED / CHALLENGE level (system design, edge cases, deep architecture, debugging complex issues)
- NEVER skip levels or ask an advanced question before finishing basic questions.
- AFTER the user answers a question, YOU MUST FIRST evaluate if the answer is right or wrong AND THEN ask the next question.
- Use this EXACT format when responding to an answer:
  ✅ CORRECT PARTS: [What they got right]
  ❌ MISSING / WRONG PARTS: [What they missed or got wrong]
  📚 COMPLETE ANSWER: [Briefly explain the best answer]
  ➡️ NEXT: [Ask your next question]

=== IF MODE 2: APTITUDE TEST ===
- Ask Math, Logic, and Reasoning problems. NOT in sentence format. Pure MATH/LOGIC format.
- Follow STRICT progressive difficulty: start with easy arithmetic/logic, then medium, then hard problems.
- Example: "Find: 15% of 320" or "If x+5=12, what is x?"
- Do NOT use sentences or fluff.
- Track speed and give Quick Feedback: "✅ CORRECT!..." or "❌ INCORRECT. Correct answer: X."
- Do NOT show any timer or time remaining.

=== IF MODE 3: GROUP DISCUSSION ===
- Provide a RANDOM topic (e.g. Artificial Intelligence, Crypto, Remote Work, etc.).
- Tell the user to speak for 4-5 minutes continuously. 
- Wait for the user to submit their long response.
- Provide a GD SCORING CRITERIA Breakdown: Communication (/25), Content (/25), Logical Thinking (/20), Confidence (/15), Time Management (/15).
- Give overall score out of 10, Strengths, and Improvements.

Follow the active mode exactly. Be concise where necessary.`;
    
    const allMessages = [...messages, newUserMessage];
    const aiResponseText = await generateResponse(allMessages, systemPrompt);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    speakMessage(aiResponseText);
    setIsProcessing(false);
  };

  const handleEndInterview = async () => {
    if (isEnding) return;
    setIsEnding(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const evaluation = await evaluateInterview(messages);
    const transcriptForDb = messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content, feedback: undefined as string | undefined }));
    
    // Inject feedback into the user's answers
    let userMsgIndex = 0;
    transcriptForDb.forEach((msg) => {
      if (msg.role === 'user') {
        msg.feedback = evaluation.userFeedback[userMsgIndex] || "No specific feedback generated.";
        userMsgIndex++;
      }
    });

    if (sessionId) {
      void saveSessionResult(sessionId, {
        score: evaluation.score,
        verdict: evaluation.verdict,
        transcript: transcriptForDb,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      });
      navigate(`/results/${sessionId}`);
      return;
    }
    navigate('/results/latest');
  };

  return (
    <div className="bg-background text-onSurface font-sans selection:bg-primary/30 h-screen flex flex-col overflow-hidden relative">
      <header className="bg-surface-1/80 backdrop-blur-xl border-b border-white/5 w-full z-50 shadow-2xl flex justify-between items-center px-4 md:px-8 h-16 shrink-0">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-xl md:text-2xl font-extrabold tracking-tighter text-blue-400">AI Interviewer</span>
          <div className="hidden md:block h-6 w-px bg-[#424754]"></div>
          <div className="flex flex-col">
            <span className="font-sans text-xs md:text-sm font-bold text-onSurface line-clamp-1">{role} — {selectedTrack === 'technical' ? 'Technical' : selectedTrack === 'aptitude' ? 'Aptitude' : 'Group Discussion'} Interview</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span className="text-[10px] md:text-xs font-mono text-[#c2c6d6] tracking-wider uppercase">Active</span>
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
        {/* LEFT CONTENT (60%) */}
        <section className="md:col-span-6 p-4 md:p-8 flex flex-col gap-6 overflow-hidden">
          {/* Camera Feed Box */}
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
                    <div className="w-[3px] bg-primary rounded-sm h-[12px] animate-pulse"></div>
                    <div className="w-[3px] bg-primary rounded-sm h-[20px] animate-pulse delay-75"></div>
                    <div className="w-[3px] bg-primary rounded-sm h-[16px] animate-pulse delay-150"></div>
                    <div className="w-[3px] bg-primary rounded-sm h-[24px] animate-pulse delay-300"></div>
                  </>
                ) : (
                  <MicOff className="w-4 h-4 mb-1" />
                )}
              </div>
              <span className={`text-xs font-bold font-sans uppercase tracking-widest ${isAudioEnabled ? 'text-primary' : 'text-error'}`}>
                 {isAudioEnabled ? (transcript ? 'Hearing...' : 'Listening...') : 'Mic Off'}
              </span>
            </div>
            
            <div className="absolute top-6 right-6 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-lg z-10">
              <span className="text-primary text-[10px] font-black uppercase tracking-tighter">HD CONNECTION</span>
            </div>
          </div>
          
          {/* Controls */}
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

        {/* RIGHT CONTENT (40%) */}
        <section className="md:col-span-4 bg-surface-1/50 border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-full overflow-hidden">
          {/* AI Interviewer Card */}
          <div className="p-4 md:p-6 bg-surface-1/50 backdrop-blur-sm border-b border-white/5 shrink-0 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30 flex items-center justify-center bg-background">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-[#ffb786] rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 className="font-sans font-bold text-onSurface">AI Interviewer</h3>
                <p className="text-[10px] md:text-xs text-[#c2c6d6] font-sans uppercase tracking-widest mt-1">Active Analysis Mode</p>
              </div>
            </div>
          </div>
          
          {/* Scrollable Transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 custom-scrollbar pb-10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : ''}`}>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${msg.role === 'assistant' ? 'text-primary ml-1' : 'text-[#c2c6d6] mr-1'}`}>
                  {msg.role === 'assistant' ? 'AI INTERVIEWER' : 'YOU'}
                </span>
                <div className={`p-4 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-surface-2 rounded-xl rounded-tl-none text-onSurface' : 'bg-primary/20 border border-primary/30 rounded-xl rounded-tr-none text-blue-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 bg-[#ffb786] rounded-full animate-pulse"></div>
                <span className="text-[10px] italic text-[#8c909f]">AI is processing your response...</span>
              </div>
            )}
          </div>
          
          {/* Text Input Fallback */}
          <div className="p-4 border-t border-white/5 bg-surface-1 shrink-0">
            <div className="relative group flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserMessage(inputValue)}
                className="w-full bg-background border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-[#8c909f] transition-all outline-none" 
                placeholder="Type a response if mic fails..." 
              />
              <button onClick={() => handleUserMessage(inputValue)} disabled={isProcessing || !inputValue.trim()} className="absolute right-3 text-primary hover:text-white transition-colors disabled:opacity-50">
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM BAR: Live Transcription */}
      <footer className="absolute bottom-0 w-full h-20 bg-surface-1 border-t border-white/5 flex flex-col md:flex-row items-center px-4 md:px-8 gap-2 md:gap-6 z-50 shrink-0 justify-center md:justify-start">
        <div className="flex-shrink-0 flex items-center gap-3 hidden md:flex">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
             <Mic2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-black text-[#8c909f] uppercase tracking-tighter w-16">LIVE FEED</span>
        </div>
        <div className="flex-1 overflow-hidden w-full text-center md:text-left">
          <p className="text-onSurface text-sm md:text-lg font-medium italic opacity-90 truncate leading-relaxed">
            {transcript || (isAudioEnabled ? "Listening to your voice..." : "Microphone disabled.")}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 hidden md:flex">
          <div className="flex gap-3 mr-4">
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Vol: <span className="text-white">80%</span></span>
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Noise: <span className="text-white">5%</span></span>
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Clarity: <span className="text-[#00ff9d]">92%</span></span>
            <span className="text-[10px] text-[#8c909f] font-mono tracking-wider">Lat: <span className="text-white">32ms</span></span>
          </div>
          <div className="px-3 py-1 bg-[#ffb786]/20 border border-[#ffb786]/30 rounded-full">
            <span className="text-[10px] text-[#ffb786] font-bold uppercase tracking-widest">Accuracy 98%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
