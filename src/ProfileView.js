import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ProfileView({ session, onBack }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [howTheyDrink, setHowTheyDrink] = useState('tereré')
  const [mood, setMood] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setCity(data.city || '')
        setHowTheyDrink(data.how_they_drink || 'tereré')
        setMood(data.mood ? data.mood.split(',') : [])
        setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [session.user.id])

  const handleMoodToggle = (value) => {
    setMood(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('users')
      .update({
        full_name: fullName,
        city: city,
        how_they_drink: howTheyDrink,
        mood: mood.join(',')
      })
      .eq('id', session.user.id)
    
    setEditing(false)
    setSaving(false)
  }

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Cargando...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, #6DB3D0 0%, #F5F5F5 100%)', minHeight: '100vh'}}>
      <button onClick={onBack} style={{marginBottom: '1rem', padding: '8px 15px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>← Volver</button>
      
      {!editing && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
          <h1 style={{color: '#2D5016', marginBottom: '1.5rem', textAlign: 'center'}}>Mi Perfil</h1>
          {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem'}} />}
          <p style={{marginBottom: '1rem', color: '#333'}}><strong style={{color: '#2D5016'}}>Nombre:</strong> {fullName}</p>
          <p style={{marginBottom: '1rem', color: '#333'}}><strong style={{color: '#2D5016'}}>Ciudad:</strong> {city}</p>
          <p style={{marginBottom: '1rem', color: '#333'}}><strong style={{color: '#2D5016'}}>Mate:</strong> {howTheyDrink}</p>
          <p style={{marginBottom: '1.5rem', color: '#333'}}><strong style={{color: '#2D5016'}}>Vibe:</strong> {mood.join(', ')}</p>
          <button onClick={() => setEditing(true)} style={{width: '100%', padding: '12px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Editar Perfil</button>
        </div>
      )}

      {editing && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
          <h1 style={{color: '#2D5016', marginBottom: '1.5rem', textAlign: 'center'}}>Editar Perfil</h1>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre" style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}} />
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}} />
          <select value={howTheyDrink} onChange={(e) => setHowTheyDrink(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}}>
            <option value="tereré">Tereré</option>
            <option value="lavado">Lavado</option>
            <option value="amargo">Amargo</option>
            <option value="dulce">Dulce</option>
            <option value="con yuyos">Con yuyos</option>
          </select>
          <div style={{marginBottom: '1.5rem'}}>
            <p style={{color: '#2D5016', fontWeight: 'bold', marginBottom: '1rem'}}>¿Qué vibe buscas?</p>
            {['charla_profunda', 'risas', 'silencio', 'debate'].map(v => (
              <label key={v} style={{display: 'block', marginBottom: '0.75rem', color: '#333'}}>
                <input type="checkbox" checked={mood.includes(v)} onChange={() => handleMoodToggle(v)} style={{marginRight: '8px'}} />
                {v === 'charla_profunda' ? 'Charla profunda' : v === 'risas' ? 'Risas' : v === 'silencio' ? 'Silencio cómodo' : 'Debate'}
              </label>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} style={{width: '100%', padding: '12px', marginBottom: '1rem', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)} style={{width: '100%', padding: '12px', background: '#ddd', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
