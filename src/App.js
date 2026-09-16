import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) return <div>Cargando...</div>

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app-container">
      <h1>¡Bienvenido a Mate App!</h1>
      <p>Email: {session.user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>
        Salir
      </button>
    </div>
  )
}
