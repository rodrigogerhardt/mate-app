import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Profile from './Profile'
import Swipe from './Swipe'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import ProfileView from './ProfileView'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [view, setView] = useState('swipe')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [viewingProfile, setViewingProfile] = useState(false)

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div>Cargando...</div>
  if (!session) return <Auth />
  if (!userProfile?.full_name) return <Profile session={session} onProfileComplete={() => fetchUserProfile(session.user.id)} />
  
  return (
    <div>
      <div style={{textAlign: 'center', padding: '1rem', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
        <button onClick={() => { setView('swipe'); setViewingProfile(false) }} style={{marginRight: '10px', padding: '8px 15px', background: view === 'swipe' && !viewingProfile ? '#2D5016' : '#ddd', color: view === 'swipe' && !viewingProfile ? 'white' : '#333'}}>Swipe</button>
        <button onClick={() => { setView('chat'); setSelectedMatch(null); setViewingProfile(false) }} style={{marginRight: '10px', padding: '8px 15px', background: view === 'chat' && !viewingProfile ? '#2D5016' : '#ddd', color: view === 'chat' && !viewingProfile ? 'white' : '#333'}}>Chat</button>
        <button onClick={() => setViewingProfile(true)} style={{marginRight: '10px', padding: '8px 15px', background: viewingProfile ? '#2D5016' : '#ddd', color: viewingProfile ? 'white' : '#333'}}>Mi Perfil</button>
        <button onClick={handleLogout} style={{marginLeft: '10px', padding: '8px 15px', background: '#d32f2f', color: 'white'}}>Logout</button>
      </div>
      
      {!viewingProfile && view === 'swipe' && <Swipe />}
      {!viewingProfile && view === 'chat' && !selectedMatch && <ChatList session={session} onSelectMatch={(match) => { setSelectedMatch(match); setView('chat-window') }} />}
      {!viewingProfile && view === 'chat-window' && selectedMatch && <ChatWindow session={session} selectedMatch={selectedMatch} onBack={() => {setSelectedMatch(null); setView('chat') }} />}
      {viewingProfile && <ProfileView session={session} onBack={() => setViewingProfile(false)} />}
    </div>
  )
}
