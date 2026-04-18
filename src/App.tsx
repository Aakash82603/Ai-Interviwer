import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CompanyMocks = lazy(() => import('./pages/CompanyMocks'));
const LiveInterviewRoom = lazy(() => import('./pages/LiveInterviewRoom'));
const LoginSignup = lazy(() => import('./pages/LoginSignup'));
const ModeSelector = lazy(() => import('./pages/ModeSelector'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const SyllabusPage = lazy(() => import('./pages/SyllabusPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const PreparePage = lazy(() => import('./pages/PreparePage'));
const DailyChallengePage = lazy(() => import('./pages/DailyChallengePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const LanguageLearningPage = lazy(() => import('./pages/LanguageLearningPage'));
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter basename="/Ai-Interviwer/">
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          className: 'bg-surface-2 text-onSurface border border-white/10',
          style: {
            background: '#171f33',
            color: '#dae2fd',
          },
        }} />
        <Suspense fallback={<div className="min-h-screen bg-background text-onSurface flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mode-selector" element={<ProtectedRoute><ModeSelector /></ProtectedRoute>} />
            <Route path="/mocks" element={<ProtectedRoute><CompanyMocks /></ProtectedRoute>} />
            <Route path="/syllabus/:company" element={<ProtectedRoute><SyllabusPage /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
            <Route path="/prepare/:company" element={<ProtectedRoute><PreparePage /></ProtectedRoute>} />
            <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
            <Route path="/learn/:language" element={<ProtectedRoute><LanguageLearningPage /></ProtectedRoute>} />
            <Route path="/room/:id" element={<ProtectedRoute><LiveInterviewRoom /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
