import { supabase } from './supabase'
import type { LibraryItem, PracticeTrack, SessionMode, SessionRecord, SyllabusItem } from '../types/domain'

const SESSION_KEY = 'aii_sessions'
const LIB_KEY = 'aii_library'
const DAILY_KEY = 'aii_daily'

const SYLLABUS_SEED: SyllabusItem[] = [
  {
    id: 'google-frontend',
    company: 'google',
    role: 'Frontend Engineer',
    title: 'Google Frontend Syllabus',
    bullet_points: ['JS fundamentals and async patterns', 'React performance and rendering', 'System design for UI scale'],
  },
  {
    id: 'amazon-sde',
    company: 'amazon',
    role: 'SDE',
    title: 'Amazon SDE Syllabus',
    bullet_points: ['Leadership Principles mapping', 'Data structures and complexity', 'Design tradeoff articulation'],
  },
]

const FULL_SYLLABUS: Record<string, { basics: string[]; intermediate: string[]; advanced: string[]; resources: string[] }> = {
  google: {
    basics: ['Big-O and DS fundamentals', 'Core JavaScript and browser APIs', 'HTML/CSS foundations'],
    intermediate: ['React state architecture', 'Testing with Jest/RTL', 'REST APIs and caching patterns'],
    advanced: ['Frontend system design', 'Performance budgets and profiling', 'Scalable architecture and observability'],
    resources: ['Cracking the Coding Interview', 'System Design Primer', 'React docs + web.dev performance'],
  },
  amazon: {
    basics: ['Arrays, strings, hash maps', 'OOP and clean coding', 'Communication using STAR'],
    intermediate: ['Leadership principles stories', 'Trees/graphs and recursion', 'Concurrency basics'],
    advanced: ['Distributed systems tradeoffs', 'High availability design', 'Behavioral depth and metrics'],
    resources: ['Amazon LP guide', 'Grokking system design', 'LeetCode curated sets'],
  },
}

const IMPORTANT_QUESTIONS: Record<string, string[]> = {
  Google: ['Design a rate limiter for API traffic.', 'How does React reconciliation work?', 'Find median of two sorted arrays.'],
  Amazon: ['Tell me about a time you disagreed with a decision.', 'Design an order tracking system.', 'Implement LRU cache.'],
  Meta: ['How would you optimize a slow feed page?', 'Design a messaging backend.', 'Detect cycle in directed graph.'],
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

export async function createSession(input: {
  userId: string
  company: string
  role: string
  mode: SessionMode
  track: PracticeTrack
}): Promise<string> {
  const id = uid()
  const row: SessionRecord = {
    id,
    user_id: input.userId,
    company: input.company,
    role: input.role,
    mode: input.mode,
    track: input.track,
    score: 0,
    verdict: 'In Progress',
    transcript: [],
    strengths: [],
    improvements: [],
    created_at: new Date().toISOString(),
  }
  try {
    const { error } = await supabase.from('interview_sessions').insert(row)
    if (error) throw error
  } catch {
    const all = readLocal<SessionRecord>(SESSION_KEY)
    writeLocal(SESSION_KEY, [row, ...all])
  }
  return id
}

export async function saveSessionResult(id: string, patch: Partial<SessionRecord>): Promise<void> {
  try {
    const { error } = await supabase.from('interview_sessions').update(patch).eq('id', id)
    if (error) throw error
  } catch {
    const all = readLocal<SessionRecord>(SESSION_KEY)
    writeLocal(
      SESSION_KEY,
      all.map((s) => (s.id === id ? { ...s, ...patch } : s))
    )
  }
}

export async function getSessions(userId: string): Promise<SessionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as SessionRecord[]) || []
  } catch {
    return readLocal<SessionRecord>(SESSION_KEY).filter((s) => s.user_id === userId)
  }
}

export async function getSessionById(id: string): Promise<SessionRecord | null> {
  try {
    const { data, error } = await supabase.from('interview_sessions').select('*').eq('id', id).single()
    if (error) throw error
    return data as SessionRecord
  } catch {
    return readLocal<SessionRecord>(SESSION_KEY).find((s) => s.id === id) || null
  }
}

export async function getDashboardSummary(userId: string): Promise<{ total: number; avg: number; streak: number; sessions: SessionRecord[] }> {
  const sessions = await getSessions(userId)
  const total = sessions.length
  const avg = total ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / total) : 0
  return { total, avg, streak: Math.min(total, 7), sessions: sessions.slice(0, 5) }
}

export async function listLibrary(userId: string): Promise<LibraryItem[]> {
  try {
    const { data, error } = await supabase.from('question_library').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data as LibraryItem[]) || []
  } catch {
    return readLocal<LibraryItem>(LIB_KEY).filter((i) => i.user_id === userId)
  }
}

export async function addLibraryItem(item: Omit<LibraryItem, 'id' | 'created_at'>): Promise<void> {
  const row: LibraryItem = { ...item, id: uid(), created_at: new Date().toISOString() }
  try {
    const { error } = await supabase.from('question_library').insert(row)
    if (error) throw error
  } catch {
    const all = readLocal<LibraryItem>(LIB_KEY)
    writeLocal(LIB_KEY, [row, ...all])
  }
}

export async function removeLibraryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('question_library').delete().eq('id', id)
    if (error) throw error
  } catch {
    const all = readLocal<LibraryItem>(LIB_KEY)
    writeLocal(LIB_KEY, all.filter((i) => i.id !== id))
  }
}

export function getSyllabus(company: string): SyllabusItem[] {
  return SYLLABUS_SEED.filter((s) => s.company === company.toLowerCase())
}

export function getFullSyllabus(company: string): { basics: string[]; intermediate: string[]; advanced: string[]; resources: string[] } {
  return FULL_SYLLABUS[company.toLowerCase()] || {
    basics: ['Problem solving basics', 'Communication basics', 'Role fundamentals'],
    intermediate: ['Mock interviews', 'Project storytelling', 'Applied practice sets'],
    advanced: ['System design and architecture', 'Leadership scenarios', 'Cross-functional strategy'],
    resources: ['Official docs', 'Top interview prep sheets', 'Practice repositories'],
  }
}

export function getImportantQuestionsByCompany(): Record<string, string[]> {
  return IMPORTANT_QUESTIONS
}

export async function getOrCreateDailyChallenge(topic: string): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const cached = JSON.parse(localStorage.getItem(DAILY_KEY) || '{}') as { date?: string; topic?: string; content?: string }
    if (cached.date === today && cached.topic === topic && cached.content) return cached.content
  } catch {
    // no-op
  }
  return null
}

export function saveDailyChallenge(topic: string, content: string): void {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, topic, content }))
}

export interface LanguageLearningContent {
  language: string
  marketDemand: 'High' | 'Very High'
  syllabus: string[]
  notes: string[]
  practiceQuestions: string[]
}

const LANGUAGE_CONTENT: Record<string, LanguageLearningContent> = {
  cpp: {
    language: 'C++',
    marketDemand: 'High',
    syllabus: ['C++ syntax and STL', 'OOP and memory management', 'Templates, DSA, and optimization'],
    notes: ['Prefer RAII and smart pointers.', 'Use STL algorithms before writing custom loops.', 'Understand value vs reference semantics.'],
    practiceQuestions: ['Implement LRU cache in C++.', 'Difference between vector and list?', 'How does move semantics improve performance?'],
  },
  java: {
    language: 'Java',
    marketDemand: 'Very High',
    syllabus: ['Core Java and collections', 'JVM, multithreading', 'Spring Boot and REST APIs'],
    notes: ['Master collections and stream API.', 'Know thread safety and synchronization.', 'Focus on clean layered architecture in Spring.'],
    practiceQuestions: ['HashMap vs ConcurrentHashMap?', 'Explain Spring dependency injection.', 'Design a rate limiter service in Java.'],
  },
  python: {
    language: 'Python',
    marketDemand: 'Very High',
    syllabus: ['Python basics and data structures', 'OOP, iterators, decorators', 'APIs, data processing, and async basics'],
    notes: ['Write readable idiomatic Python.', 'Use list/dict comprehensions wisely.', 'Know when to use async IO.'],
    practiceQuestions: ['Generator vs list performance?', 'Implement decorator with arguments.', 'How does GIL affect concurrency?'],
  },
  html: { language: 'HTML', marketDemand: 'High', syllabus: ['Semantic HTML', 'Forms and validation', 'Accessibility basics'], notes: ['Use semantic tags.', 'Label all form controls.', 'Maintain heading hierarchy.'], practiceQuestions: ['Build accessible login form.', 'Difference between section and article?', 'How to improve SEO with HTML?'] },
  css: { language: 'CSS', marketDemand: 'High', syllabus: ['Selectors and specificity', 'Flexbox and Grid', 'Responsive design systems'], notes: ['Prefer layout systems over absolute positioning.', 'Design mobile-first.', 'Use utility and component patterns consistently.'], practiceQuestions: ['Center element in multiple ways.', 'Grid vs Flexbox use cases?', 'How to prevent layout shift?'] },
  javascript: { language: 'JavaScript', marketDemand: 'Very High', syllabus: ['ES6+ fundamentals', 'Async/event loop', 'Browser and Node runtime'], notes: ['Understand closures deeply.', 'Master promises and async/await.', 'Know event loop phases conceptually.'], practiceQuestions: ['Debounce vs throttle?', 'Explain event loop with microtasks.', 'Implement Promise.all polyfill.'] },
  typescript: { language: 'TypeScript', marketDemand: 'Very High', syllabus: ['Type system fundamentals', 'Generics and utility types', 'Type-safe app architecture'], notes: ['Avoid any in business logic.', 'Model domain with interfaces/types.', 'Use discriminated unions for robust flows.'], practiceQuestions: ['interface vs type?', 'Build generic repository type.', 'Narrow union with type guards.'] },
  go: { language: 'Go', marketDemand: 'High', syllabus: ['Go syntax and packages', 'Goroutines/channels', 'Concurrency-safe backend services'], notes: ['Keep functions small and explicit.', 'Use context for request lifecycle.', 'Be careful with shared state.'], practiceQuestions: ['Goroutine leak causes?', 'Buffered vs unbuffered channels?', 'Build worker pool in Go.'] },
  rust: { language: 'Rust', marketDemand: 'High', syllabus: ['Ownership and borrowing', 'Traits and lifetimes', 'Async Rust and performance'], notes: ['Think in ownership transfer.', 'Leverage Result and Option.', 'Prefer iterators and zero-cost abstractions.'], practiceQuestions: ['Borrow checker common errors?', 'Trait object vs generic?', 'How to avoid unnecessary cloning?'] },
  csharp: { language: 'C#', marketDemand: 'High', syllabus: ['C# and .NET fundamentals', 'LINQ and async', 'ASP.NET Core APIs'], notes: ['Use async APIs end-to-end.', 'Understand DI in ASP.NET.', 'Profile memory allocations in hot paths.'], practiceQuestions: ['IEnumerable vs IQueryable?', 'Task vs ValueTask?', 'Middleware pipeline flow?'] },
  kotlin: { language: 'Kotlin', marketDemand: 'High', syllabus: ['Kotlin basics and null safety', 'Coroutines', 'Android/backend use cases'], notes: ['Exploit null safety features.', 'Prefer immutable data classes.', 'Use structured concurrency.'], practiceQuestions: ['Coroutines vs threads?', 'What are sealed classes?', 'How does null safety prevent crashes?'] },
  swift: { language: 'Swift', marketDemand: 'High', syllabus: ['Swift language fundamentals', 'Protocol-oriented design', 'iOS app architecture'], notes: ['Use value types intentionally.', 'Follow MVVM or clean architecture.', 'Keep UI updates on main thread.'], practiceQuestions: ['Struct vs class?', 'Protocol extensions benefits?', 'How to handle async UI state?'] },
  php: { language: 'PHP', marketDemand: 'High', syllabus: ['PHP syntax and OOP', 'Laravel framework', 'API and DB integration'], notes: ['Use modern PHP features.', 'Validate/sanitize all user input.', 'Use migrations and Eloquent patterns cleanly.'], practiceQuestions: ['Composer role?', 'How does Laravel service container work?', 'Prevent SQL injection in PHP apps.'] },
  sql: { language: 'SQL', marketDemand: 'Very High', syllabus: ['Queries and joins', 'Indexing and performance', 'Transactions and consistency'], notes: ['Write explicit joins.', 'Index on query patterns.', 'Understand ACID and isolation levels.'], practiceQuestions: ['Window functions use case?', 'How to optimize slow query?', 'Inner join vs left join example.'] },
  r: { language: 'R', marketDemand: 'High', syllabus: ['R syntax and tidyverse', 'Statistical modeling', 'Data visualization'], notes: ['Use tidy data principles.', 'Document assumptions in analysis.', 'Keep reproducible scripts.'], practiceQuestions: ['dplyr pipeline example?', 'When to use ggplot facets?', 'How to validate model assumptions?'] },
}

export function getLanguageList(): string[] {
  return Object.values(LANGUAGE_CONTENT).map((x) => x.language)
}

export function getLanguageContent(languageSlug: string): LanguageLearningContent | null {
  return LANGUAGE_CONTENT[languageSlug.toLowerCase()] || null
}
