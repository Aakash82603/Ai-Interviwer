import { Brain, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfileDetails } from '../lib/subscription';

export default function LoginSignup() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    const redirectIfUser = async () => {
      if (!user) return;
      const details = await getUserProfileDetails(user.id);
      navigate(details ? '/dashboard' : '/onboarding');
    };
    void redirectIfUser();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!isLogin && password.length < 8) {
      setErrorMessage('Password must be at least 8 characters for account security.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    console.log('[LoginSignup] Calling Supabase auth...');

    if (isLogin) {
      console.log('[LoginSignup] Attempting sign in with email:', email);
      const { error } = await signInWithEmail(normalizedEmail, password);
      if (error) {
        console.error('[LoginSignup] Sign in error:', error);
        setErrorMessage(error);
      } else {
        console.log('[LoginSignup] Sign in success! Auth state change will trigger redirect.');
      }
    } else {
      console.log('[LoginSignup] Attempting sign up with email:', email);
      const { error } = await signUpWithEmail(normalizedEmail, password);
      if (error) {
        console.error('[LoginSignup] Sign up error:', error);
        setErrorMessage(error);
      } else {
        console.log('[LoginSignup] Sign up success!');
        setSuccessMessage('Account created! Check your email to confirm your account, then log in.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-background text-onSurface flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* Ambient Intelligent Atmosphere Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ffb786]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Auth Container */}
      <main className="relative z-10 w-full max-w-md px-6 my-12">
        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
            <Brain className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-onSurface mb-2">AI Interviewer</h1>
          <p className="text-[#c2c6d6] font-sans font-medium text-sm text-center">Step into the future of interview mastery.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-1 rounded-xl shadow-2xl p-8 border border-white/5 relative overflow-hidden">
          {/* Subtle Tonal Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Header Tabs */}
            <div className="flex gap-8 mb-8 border-b border-white/10">
              <button 
                onClick={() => { setIsLogin(true); setErrorMessage(null); setSuccessMessage(null); }}
                className={`pb-3 text-sm font-bold tracking-tight transition-colors ${isLogin ? 'border-b-2 border-primary text-primary' : 'text-[#8c909f] hover:text-white'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setIsLogin(false); setErrorMessage(null); setSuccessMessage(null); }}
                className={`pb-3 text-sm font-bold tracking-tight transition-colors ${!isLogin ? 'border-b-2 border-primary text-primary' : 'text-[#8c909f] hover:text-white'}`}
              >
                Sign up
              </button>
            </div>

            {/* Google SSO */}
            <button 
              onClick={() => void signInWithGoogle()}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mb-8 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
              <span className="text-sm">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-[10px] font-bold text-[#8c909f] uppercase tracking-widest">Or continue with email</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            {/* Error / Success Messages */}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-sm font-medium">{successMessage}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8c909f] uppercase tracking-wider ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c909f] group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-background border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/40 rounded-xl py-3.5 pl-12 pr-4 text-onSurface placeholder:text-[#8c909f]/50 transition-all outline-none text-sm"
                    id="email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold text-[#8c909f] uppercase tracking-wider" htmlFor="password">Password</label>
                  {isLogin && <a className="text-[11px] font-bold text-primary hover:text-blue-400 transition-colors tracking-wider" href="#">Forgot?</a>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c909f] group-focus-within:text-primary transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-background border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/40 rounded-xl py-3.5 pl-12 pr-4 text-onSurface placeholder:text-[#8c909f]/50 transition-all outline-none text-sm"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-blue-600 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] text-sm tracking-tight mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  isLogin ? 'Sign In to AI Interviewer' : 'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Support/Footer Info */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[#8c909f] text-xs leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our <a className="text-onSurface font-semibold hover:underline" href="#">Terms of Service</a> and <a className="text-onSurface font-semibold hover:underline" href="#">Privacy Policy</a>.
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#8c909f] tracking-wider uppercase">Systems Operational</span>
            </div>
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-[#8c909f]" />
              <span className="text-[10px] font-bold text-[#8c909f] tracking-wider uppercase">AES-256 Encrypted</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none"></div>
    </div>
  );
}
