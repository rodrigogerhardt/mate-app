import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ChatList({ session, onSelectMatch }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: matchIds } = await supabase
        .from('matches')
        .select('matched_user_id')
        .eq('user_id', session.user.id)
      
      if (!matchIds || matchIds.length === 0) {
        setLoading(false)
        return
      }

      const userIds = matchIds.map(m => m.matched_user_id)
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)
      
      setMatches(users || [])
      setLoading(false)
    }
    fetchMatches()
  }, [session.user.id])

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Cargando...</div>
  if (!matches.length) return <div style={{padding: '2rem', textAlign: 'center', color: '#2D5016'}}>Sin matches aún</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
      <h1 style={{color: '#2D5016', marginBottom: '2rem'}}>💬 Mis Chats</h1>
      {matches.map((user) => (
        <div key={user.id} onClick={() => onSelectMatch(user)} style={{background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s ease'}} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover'}} />
          ) : (
            <div style={{width: '50px', height: '50px', borderRadius: '50%', background: '#ddd', play: 'flex', alignItems: 'center', justifyContent: 'center'}}>😊</div>
          )}
          <div>
            <h3 style={{color: '#2D5016', margin: 0}}>{user.full_name}</h3>
            <p style={{color: '#666', margin: '0.25rem 0', fontSize: '14px'}}>📍 {user.city}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
