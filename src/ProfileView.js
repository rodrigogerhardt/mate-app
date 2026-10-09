import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ProfileView({ session, onBack }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [howTheyDrink, setHowTheyDrink] = useState('tereré')
  const [mood, setMood] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState([])
  const [photos, setPhotos] = useState([])
  const [lookingForMateToday, setLookingForMateToday] = useState(false)  
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
        setAge(data.age || '')
        setBio(data.bio || '')
        setLanguages(data.languages ? data.languages.split(',') : [])
        setPhotos(data.photos || [])
        setLookingForMateToday(data.looking_for_mate_today || false)        
setAvatarUrl(data.avatar_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [session.user.id])

  const handleMoodToggle = (value) => {
    setMood(prev => prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value])
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fileName = `${session.user.id}/${Date.now()}`
    const { error } = await supabase.storage.from('Avatars').upload(fileName, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(fileName)
      setAvatarUrl(publicUrl)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('users').update({
      full_name: fullName,
      city: city,
      how_they_drink: howTheyDrink,
      mood: mood.join(','),
      avatar_url: avatarUrl,
          age: parseInt(age),
          bio: bio,
          languages: languages.join(','),
          photos: photos,
          looking_for_mate_today: lookingForMateToday,    
}).eq('id', session.user.id)
    setEditing(false)
    setSaving(false)
  }

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Cargando...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, #6DB3D0 0%, #F5F5F5 100%)', minHeight: '100vh'}}>
      <button onClick={onBack} style={{marginBottom: '1rem', padding: '8px 15px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px'}}>← Volver</button>
      {!editing && (
        <div style={{background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
          <h1 style={{color: '#2D5016', marginBottom: '1.5rem', textAlign: 'center'}}>Mi Perfil</h1>
          {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', display: 'block', margin: '0 auto'}} />}
          <p style={{marginBottom: '1rem'}}><strong style={{color: '#2D5016'}}>Nombre:</strong> {fullName}</p>
          <p style={{marginBottom: '1rem'}}><strong style={{color: '#2D5016'}}>Ciudad:</strong> {city}</p>
          <p style={{marginBottom: '1rem'}}><strong style={{color: '#2D5016'}}>Mate:</strong> {howTheyDrink}</p>
          <p style={{marginBottom: '1.5rem'}}><strong style={{color: '#2D5016'}}>Vibe:</strong> {mood.join(', ')}</p>
          <button onClick={() => setEditing(true)} style={{width: '100%', padding: '12px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Editar</button>
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
          <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e)} style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}} />
          <input type="number" placeholder="Edad" value={age} onChange={(e) => setAge(e.target.value)} min="18" max="120" style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}} />
          <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px', minHeight: '80px'}} maxLength="300" />
          <p style={{color: '#2D5016', fontWeight: 'bold', marginBottom: '0.5rem'}}>Idiomas:</p>
          {['Español', 'Inglés', 'Italiano', 'Francés', 'Portugués', 'Alemán'].map(lang => (<label key={lang} style={{display: 'block', marginBottom: '0.5rem'}}><input type="checkbox" checked={languages.includes(lang)} onChange={() => setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])} /> {lang}</label>))}
          <label style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}><input type="checkbox" checked={lookingForMateToday} onChange={(e) => setLookingForMateToday(e.target.checked)} style={{marginRight: '8px'}} /> <span>Estoy para unos mates hoy</span></label>
          <p style={{color: '#2D5016', fontWeight: 'bold', marginBottom: '1rem'}}>Vibe:</p>
          {['charla_profunda', 'risas', 'silencio', 'debate'].map(v => (
<label key={v} style={{display: 'block', marginBottom: '0.75rem'}}>
              <input type="checkbox" checked={mood.includes(v)} onChange={() => handleMoodToggle(v)} style={{marginRight: '8px'}} />
              {v === 'charla_profunda' ? 'Charla profunda' : v === 'risas' ? 'Risas' : v === 'silencio' ? 'Silencio cómodo' : 'Debate'}
            </label>
          ))}
          <button onClick={handleSave} disabled={saving} style={{width: '100%', padding: '12px', marginTop: '1rem', marginBottom: '0.5rem', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)} style={{width: '100%', padding: '12px', background: '#ddd', color: '#333', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
