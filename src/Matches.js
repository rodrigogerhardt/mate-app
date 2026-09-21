import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Matches({ session }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('matched_user_id, users!matches_matched_user_id_fkey(full_name, city, how_they_drink)')
      .eq('user_id', session.user.id)
    
    setMatches(data || [])
    setLoading(false)
  }

  if (loading) return <div style={{padding: '2rem'}}>Cargando matches...</div>
  if (!matches.length) return <div style={{padding: '2rem'}}>Sin matches aún</div>

  return (
    <div style={{padding: '2rem'}}>
      <h1>Tus matches 🎉</h1>
      {matches.map((match) => (
        <div key={match.matched_user_id} style={{background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '8px'}}>
          >{match.users.full_name}</h3>
          <p>📍 {match.users.city}</p>
          <p>Mate: {match.users.how_they_drink}</p>
        </div>
      ))}
    </div>
  )
}
