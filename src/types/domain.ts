export type SessionMode = 'live' | 'practice'
export type PracticeTrack = 'technical' | 'aptitude' | 'group-discussion'

export interface SessionRecord {
  id: string
  user_id: string
  company: string
  role: string
  mode: SessionMode
  track: PracticeTrack
  score: number
  verdict: string
  transcript: { role: 'user' | 'assistant'; content: string; feedback?: string }[]
  strengths: string[]
  improvements: string[]
  created_at: string
}

export interface LibraryItem {
  id: string
  user_id: string
  title: string
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  content: string
  ai_generated: boolean
  created_at: string
}

export interface SyllabusItem {
  id: string
  company: string
  role: string
  title: string
  bullet_points: string[]
}
