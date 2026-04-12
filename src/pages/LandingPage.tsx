import { motion } from 'framer-motion';
import { Video, Building2, FileText, Zap, LineChart, Play, ChevronRight, Bell, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-8 h-16 sticky top-0 z-40 bg-surface-1/80 backdrop-blur-xl border-b border-white/5">
        <div className="text-xl font-bold text-onSurface tracking-tighter flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" fill="currentColor" />
          Interview AI
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/mode-selector" className="text-primary border-b-2 border-primary pb-1 font-sans text-sm font-medium">Practice</Link>
          <Link to="/history" className="text-onSurfaceVariant font-sans text-sm hover:text-primary transition-colors">History</Link>
          <a className="text-onSurfaceVariant font-sans text-sm hover:text-primary transition-colors" href="#">Resources</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-onSurfaceVariant hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/profile" className="text-onSurfaceVariant hover:text-primary transition-colors">
            <UserCircle className="w-6 h-6" />
          </Link>
          <Link to="/login" className="bg-primary hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105">
            Login / Signup
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 hero-gradient">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-white/10 text-xs uppercase tracking-widest text-primary font-bold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Next-Gen AI Practice
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tighter text-onSurface leading-tight">
              Land Your Dream Job with AI 💼
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-onSurfaceVariant max-w-2xl mx-auto font-sans">
              Practice real interviews with an AI interviewer, get instant feedback, and walk into every interview with full confidence.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:scale-105 w-full sm:w-auto">
                Start Practicing Free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-outlineVariant text-onSurface text-lg font-bold rounded-xl hover:bg-surface-2 transition-all w-full sm:w-auto">
                <Play className="w-5 h-5" fill="currentColor" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 max-w-5xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#ffb786] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative glass-card overflow-hidden">
              <img alt="Professional Interface" className="w-full h-auto object-cover opacity-90 border-b border-white/5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc_Z7YDZcThptSyaWsJDyFGsEf99JR0XNCj5EqZLoOw-zQWcMeOHODspk9Hq8NBXYcx_aPKTkdT_qjkPRTG7dxgs5AiVSdN939WravO1-YJBKyAq2_SkMjhmP0MjpM3FhUgJ_-eYkfGhImNPv3Q_bpWV-oRttdH0dKNiEyC-dEj9Qe2qgVF3iktWDtvlbop1gDs_Dxv3jqz4Kq2mDhBMuubtGcg8rdljmb7y9WdHGSZpeSfUZk-3rUjGI3K7WC5fuEmXbs3l4llrQ" />
            </div>
          </motion.div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-12 bg-surface-1">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs text-outline font-bold uppercase tracking-[0.2em] mb-10">Trusted by students and freshers from</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-2xl font-black text-onSurface tracking-tighter">IIT</span>
              <span className="text-2xl font-black text-onSurface tracking-tighter">NIT</span>
              <span className="text-2xl font-black text-onSurface tracking-tighter">Infosys</span>
              <span className="text-2xl font-black text-onSurface tracking-tighter">TCS</span>
              <span className="text-2xl font-black text-onSurface tracking-tighter">Wipro</span>
              <span className="text-2xl font-black text-onSurface tracking-tighter">Accenture</span>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-32 px-6 max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-4"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="md:col-span-3 glass-card p-8 flex flex-col justify-between group hover:bg-surface-2 transition-all">
              <div>
                <Video className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-3 text-onSurface">Live AI Interview</h3>
                <p className="text-onSurfaceVariant">Immersive mic and camera experience mimicking real video interview scenarios with real-time feedback.</p>
              </div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="md:col-span-3 glass-card p-8 flex flex-col justify-between group hover:bg-surface-2 transition-all">
              <div>
                <Building2 className="w-10 h-10 text-[#ffb786] mb-6" />
                <h3 className="text-2xl font-bold mb-3 text-onSurface">Company Mock Tests</h3>
                <p className="text-onSurfaceVariant">Curated question banks for tech giants like Google, Amazon, and service giants like TCS & Infosys.</p>
              </div>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-8 group hover:bg-surface-2 transition-all">
              <FileText className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-2 text-onSurface">Resume Based</h3>
              <p className="text-onSurfaceVariant text-sm">AI scans your specific projects and skills to tailor highly personalized questions.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-8 group hover:bg-surface-2 transition-all">
              <Zap className="w-8 h-8 text-[#ffb786] mb-6" />
              <h3 className="text-xl font-bold mb-2 text-onSurface">Daily Challenge</h3>
              <p className="text-onSurfaceVariant text-sm">Sharpen your skills every morning with a fresh new algorithm or logic challenge to build streaks.</p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-8 group hover:bg-surface-2 transition-all">
              <LineChart className="w-8 h-8 text-success mb-6" />
              <h3 className="text-xl font-bold mb-2 text-onSurface">Instant Feedback</h3>
              <p className="text-onSurfaceVariant text-sm">Real-time scores for communication, eye-contact, confidence, and technical accuracy.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 bg-surface-1">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center text-onSurface mb-20 tracking-tight">Three Steps to Mastery</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-outlineVariant/50 to-transparent"></div>
              
              {[
                { step: '1', title: 'Upload Resume', desc: 'Simply upload your PDF resume or select your target job role manually.' },
                { step: '2', title: 'Practice with AI', desc: 'Engage in a live conversation with voice and camera analysis enabled.' },
                { step: '3', title: 'Detailed Feedback', desc: 'Get a comprehensive breakdown of your performance with actionable tips.' }
              ].map((item, i) => (
                <div key={i} className="relative z-10 text-center space-y-6">
                  <div className="w-14 h-14 bg-surface-3/50 backdrop-blur-sm border border-primary/30 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
                    <span className="relative z-10">{item.step}</span>
                  </div>
                  <h4 className="text-xl font-bold text-onSurface">{item.title}</h4>
                  <p className="text-onSurfaceVariant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1b3464] to-background p-12 md:p-20 rounded-[2rem] text-center space-y-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffb786]/10 rounded-full blur-3xl mix-blend-screen"></div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight relative z-10">
              Your Dream Job is One Interview Away
            </h2>
            <p className="text-white/80 text-xl font-medium relative z-10 max-w-2xl mx-auto">
              Join thousands of students already preparing smarter with Artificial Intelligence.
            </p>
            <div className="pt-4 relative z-10">
              <Link to="/login" className="inline-block px-10 py-5 bg-primary text-white text-lg font-black rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                Start Free Today
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-1 border-t border-white/5 pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-onSurfaceVariant">
            <p>© 2024 Interview AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
