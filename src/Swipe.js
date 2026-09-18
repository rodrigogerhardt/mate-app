import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Swipe() {
  const [profiles, setProfiles] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    supabase.from('users').select('*').limit(20).then(({ data }) => {
      setProfiles(data || [])
      console.log("Profiles:", data)
    })
  }, [])

  const handleMatch = async (matchedUserId) => {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from("matches").insert({
      user_id: session.user.id,
      matched_user_id: matchedUserId
    })
    if (index < profiles.length - 1) setIndex(index + 1)
  }

  if (!profiles.length) return <div style={{padding: '2rem'}}>Cargando...</div>
  
  const profile = profiles[index]
  
  return (
    <div style={{padding: '3rem', textAlign: 'center'}}>
      <div style={{background: 'white', padding: '2rem', borderRadius: '10px', maxWidth: '400px', margin: '0 auto'}}>
        <h2>{profile.full_name || 'Anónimo'}</h2>
        <p>📍 {profile.city || 'Desconocida'}</p>
        <p>Mate: {profile.how_they_drink || '?'}</p>
        <div style={{marginTop: '2rem'}}>
          <button onClick={() => setIndex((index + 1) % profiles.length)} style={{padding: '10px 20px', margin: '5px', cursor: 'pointer'}}>❌ No</button>
          <button onClick={() => alert('Match con ' + profile.full_name)} style={{padding: '10px 20px', margin: '5px', cursor: 'pointer'}}>✅ Sí</button>
        </div>
      </div>
    </div>
  )
}
onClick={() => handleMatch(profile.id)}
