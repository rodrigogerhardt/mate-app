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
<div style={{padding: '3rem', background: 'linear-gradient(135deg, #6DB3D0 0%, #F5F5F5 100%)', minHeight: '100vh'}}>
<div style={{background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name} style={{width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover'}} />
        ) : (
          <div style={{width: '120px', height: '120px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'}}>😊</div>
        )}
        <div style={{marginTop: '1rem'}} />
<h2 style={{color: '#2D5016', marginBottom: '1rem'}}>{profile.full_name || 'Anónimo'}</h2>
        <p>📍 {profile.city || 'Desconocida'}</p>
        <p>Mate: {profile.how_they_drink || '?'}</p>
        <div style={{marginTop: '2rem'}}>
style={{padding: '12px 20px', margin: '5px', cursor: 'pointer', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}
        </div>
      </div>
    </div>
  )
}
