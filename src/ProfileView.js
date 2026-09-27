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
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        city: city,
        how_they_drink: howTheyDrink,
        mood: mood.join(',')
      })
      .eq('id', session.user.id)
    
    if (!error) {
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) return <div style={{padding: '2rem'}}>Cargando...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
      <button onClick={onBack} style={{marginBottom: '1rem', padding: '8px 15px'}}>← Volver</button>
      
      {!editing && (
        <div>
          <h1>Mi Perfil</h1>
          {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', margiottom: '1rem'}} />}
          <p><strong>Nombre:</strong> {fullName}</p>
          <p><strong>Ciudad:</strong> {city}</p>
          <p><strong>Mate:</strong> {howTheyDrink}</p>
          <p><strong>Vibe:</strong> {mood.join(', ')}</p>
          <button onClick={() => setEditing(true)} style={{marginTop: '1rem', padding: '10px 20px', cursor: 'pointer'}}>Editar</button>
        </div>
      )}

      {editing && (
        <div>
          <h1>Editar Perfil</h1>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre" style={{width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc'}} />
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" style={{width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc'}} />
          <select value={howTheyDrink} onChange={(e) => setHowTheyDrink(e.target.value)} style={{width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc'}}>
            <option value="tereré">Tereré</option>
            <option value="lavado">Lavado</option>
            <option value="amargo">Amargo</option>
            <option value="dulce">Dulce</option>
            <option value="con yuyos">Con yuyos</option>
          </select>
          <div style={{marginBottom: '1rem'}}>
            {['charla_profunda', 'risas', 'silencio', 'debate'].map(v => (
              <label key={v} style={{display: 'block', marginBottom: '0.5rem'}}>
                <input type="checkbox" checked={mood.includes(v)} onChange={() => handleMoodToggle(v)} />
                {v === 'charla_profunda' ? 'Charla profunda' : v === 'risas' ? 'Risas' : v === 'silencio' ? 'Silencio cómodo' : 'Debate'}
              </label>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} style={{padding: '10px 20px', marginRight: '10px', cursor: 'pointer', background: '#007AFF', co: 'white', borderRadius: '8px', border: 'none'}}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)} style={{padding: '10px 20px', cursor: 'pointer'}}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
