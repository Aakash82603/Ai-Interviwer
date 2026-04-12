import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getProPlanForUser, isProUser, setProPlanForUser } from '../lib/subscription'

export function useProPlan() {
  const { user } = useAuth()
  const [isPro, setIsPro] = useState<boolean>(isProUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setIsPro(isProUser())
        return
      }
      setLoading(true)
      setIsPro(await getProPlanForUser(user.id))
      setLoading(false)
    }
    void load()
  }, [user])

  const toggle = async () => {
    if (!user) return
    setLoading(true)
    const next = await setProPlanForUser(user.id, !isPro)
    setIsPro(next)
    setLoading(false)
  }

  return { isPro, loading, toggle }
}
