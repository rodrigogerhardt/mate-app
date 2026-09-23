import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Matches({ session }) {
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

  if (loading) return <div style={{padding: '2rem'}}>Cargando matches...</div>
  if (!matches.length) return <div style={{padding: '2rem'}}>Sin matches aún</div>

  return (
    <div style={{padding: '2rem'}}>
      <h1>Tus matches 🎉</h1>
      {matches.map((user) => (
        <div key={user.id} style={{background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '8px'}}>
          <h3>{user.full_name}</h3>
          <p>📍 {user.city}</p>
          <p>Mate: {user.how_they_drink}</p>
        </div>
      ))}
    </div>
  )
}
