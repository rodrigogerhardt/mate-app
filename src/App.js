import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Profile from './Profile'
import Swipe from './Swipe'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchUserProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchUserProfile(session.user.id)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    setUserProfile(data)
  }

  if (loading) return <div>Cargando...</div>
  if (!session) return <Auth />
  if (!userProfile?.full_name) return <Profile session={session} onProfileComplete={() => fetchUserProfile(session.user.id)} />
  
  return <Swipe />
}
