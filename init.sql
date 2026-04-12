-- SQL Schema for AI Interviewer

-- Users Profile
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  university TEXT,
  target_role TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES users_profile(id) PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  flame_count INTEGER DEFAULT 0
);

-- Sessions (Interviews)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users_profile(id) NOT NULL,
  company_name TEXT,
  target_role TEXT,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed
  overall_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Questions & Results
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  expected_skills TEXT[],
  user_answer TEXT,
  feedback TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Conversations (For real-time streaming transcripts)
CREATE TABLE IF NOT EXISTS live_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT, -- user or ai
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  company TEXT
);

-- Challenge Completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users_profile(id),
  challenge_id UUID REFERENCES daily_challenges(id),
  score INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Add Row Level Security (RLS) policies 
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can edit their own profile" ON users_profile
  FOR ALL USING (auth.uid() = id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- More RLS policies to be added based on production requirements
