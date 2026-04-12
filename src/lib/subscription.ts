import { supabase } from './supabase'

const PLAN_KEY = 'aii_plan'
const PROFILE_DONE_PREFIX = 'aii_profile_done_'

export function isProUser(): boolean {
  return localStorage.getItem(PLAN_KEY) === 'pro'
}

export function setProUser(enabled: boolean): void {
  localStorage.setItem(PLAN_KEY, enabled ? 'pro' : 'free')
}

export async function getProPlanForUser(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('user_profiles').select('plan').eq('user_id', userId).single()
    if (error) throw error
    const pro = (data?.plan || 'free') === 'pro'
    setProUser(pro)
    return pro
  } catch {
    return isProUser()
  }
}

export async function setProPlanForUser(userId: string, enabled: boolean): Promise<boolean> {
  const plan = enabled ? 'pro' : 'free'
  try {
    const { error } = await supabase.from('user_profiles').upsert({ user_id: userId, plan })
    if (error) throw error
  } catch {
    // Keep local fallback when DB is unavailable.
  }
  setProUser(enabled)
  return enabled
}

export interface UserProfileDetails {
  nickname: string
  goal: string
  target_role: string
  age: number | null
}

export async function getUserProfileDetails(userId: string): Promise<UserProfileDetails | null> {
  // 1. Try to get from Supabase Auth user_metadata directly (persists across devices reliably)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const meta = session?.user?.user_metadata
    if (meta && meta.nickname && meta.target_role) {
      return {
        nickname: meta.nickname,
        goal: meta.goal || meta.target_role,
        target_role: meta.target_role,
        age: meta.age || null,
      }
    }
  } catch (e) {}

  // 2. Try fast local storage cache
  const doneKey = `${PROFILE_DONE_PREFIX}${userId}`
  const cachedProfile = localStorage.getItem(`user_profile_${userId}`)
  if (localStorage.getItem(doneKey) === '1' && cachedProfile) {
    try { return JSON.parse(cachedProfile) as UserProfileDetails } catch {}
  }

  // 3. Try legacy user_profiles DB table
  try {
    const { data, error } = await supabase.from('user_profiles').select('nickname,goal,target_role,age').eq('user_id', userId).single()
    if (!error && data?.nickname && data?.target_role) {
      return { nickname: data.nickname, goal: data.goal || data.target_role, target_role: data.target_role, age: data.age ?? null }
    }
  } catch {}

  // 4. Ultimate fallback
  try {
    const raw = localStorage.getItem(`user_profile_${userId}`)
    if (raw) return JSON.parse(raw) as UserProfileDetails
  } catch {}
  
  return null
}

export async function setUserProfileDetails(userId: string, details: UserProfileDetails): Promise<void> {
  const doneKey = `${PROFILE_DONE_PREFIX}${userId}`
  localStorage.setItem(`user_profile_${userId}`, JSON.stringify(details))
  localStorage.setItem(doneKey, '1')
  
  // Save securely to cross-device Supabase User Metadata
  try {
    await supabase.auth.updateUser({
      data: {
        nickname: details.nickname,
        goal: details.goal,
        target_role: details.target_role,
        age: details.age,
      }
    })
  } catch {}

  // Legacy DB save
  try {
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      nickname: details.nickname,
      goal: details.goal,
      target_role: details.target_role,
      age: details.age,
    })
  } catch {}
}

export function isProfileCompleted(userId: string): boolean {
  return localStorage.getItem(`${PROFILE_DONE_PREFIX}${userId}`) === '1'
}
