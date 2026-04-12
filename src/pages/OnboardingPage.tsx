import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { setUserProfileDetails, getUserProfileDetails } from '../lib/subscription'

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [goal, setGoal] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [age, setAge] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  // If user already has a completed profile, skip onboarding entirely
  useEffect(() => {
    if (!user) return
    getUserProfileDetails(user.id).then((details) => {
      if (details?.nickname && details?.target_role) {
        navigate('/dashboard', { replace: true })
      } else {
        setChecking(false)
      }
    })
  }, [user, navigate])

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!nickname.trim() || !goal.trim() || !targetRole.trim()) return
    setSaving(true)
    await setUserProfileDetails(user.id, {
      nickname: nickname.trim(),
      goal: goal.trim(),
      target_role: targetRole.trim(),
      age: age ? Number(age) : null,
    })
    setSaving(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-onSurface flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-lg bg-surface-1 rounded-2xl p-8 space-y-5 border border-white/10">
        <h1 className="text-3xl font-extrabold">Welcome! Let us set your profile</h1>
        <p className="text-[#8c909f] text-sm">Tell us a few details so interviews are personalized.</p>
        <div>
          <label className="text-xs font-bold uppercase text-[#8c909f]">Nickname</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-2 w-full bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="e.g. Niraj" required />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#8c909f]">Goal (what you want to become)</label>
          <input value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-2 w-full bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="e.g. Crack MAANG frontend interviews" required />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#8c909f]">Target Post / Role</label>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="mt-2 w-full bg-background rounded-lg px-4 py-3 border border-white/10" placeholder="e.g. Frontend Engineer" required />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-[#8c909f]">Age</label>
          <input value={age} onChange={(e) => setAge(e.target.value)} className="mt-2 w-full bg-background rounded-lg px-4 py-3 border border-white/10" type="number" min="13" max="100" placeholder="e.g. 23" />
        </div>
        <button disabled={saving} className="w-full bg-primary py-3 rounded-lg font-bold disabled:opacity-60">
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
