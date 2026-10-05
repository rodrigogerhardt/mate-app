import { useState } from 'react'
import { CIUDADES, filterCiudades } from './ciudades.js'
import { supabase } from './supabaseClient'
import './Profile.css'

export default function Profile({ session, onProfileComplete }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
const [suggestions, setSuggestions] = useState([])
  const [howTheyDrink, setHowTheyDrink] = useState('tereré')
  const [mood, setMood] = useState([])
const [avatarUrl, setAvatarUrl] = useState('')
const [uploading, setUploading] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleMoodToggle = (value) => {
    setMood(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
  }
const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validar tamaño (5MB máximo)
    const maxSizeInBytes = 5 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      setError(`Foto muy grande. Máximo 5MB (la tuya es ${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }
    
    setUploading(true)
    const fileName = `${session.user.id}/${Date.now()}`
    const { error } = await supabase.storage.from('Avatars').upload(fileName, file)
    if (error) {
      setError(error.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(fileName)
      console.log("Public URL:", publicUrl)
    setAvatarUrl(publicUrl)
    setError(null)
    setUploading(false)
  }
  const handleSave = async () => {
if (!fullName || !city || !avatarUrl) {
      setError('Completá todos los campos incluyendo foto')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          full_name: fullName,
          city: city,
          how_they_drink: howTheyDrink,
          mood: mood.join(','),
          avatar_url: avatarUrl,
        })
      
      if (error) throw error
      onProfileComplete()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <h1>Completá tu perfil</h1>
      
      <input
        type="text"
        placeholder="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        type="text"
        placeholder="¿En qué ciudad estás?"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <div style={{position: 'relative', marginBottom: '1rem'}}>
        <input
          type="text"
          placeholder="¿En qué ciudad estás?"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setSuggestions(filterCiudades(e.target.value))
          }}
          style={{width: '100%', padding: '12px', border: '2px solid #6DB3D0', borderRadius: '8px'}}
        />
        {suggestions.length > 0 && (
          <ul style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #6DB3D0', borderTop: 'none', borderRadius: '0 0 8px 8px', listStyle: 'none', margin: 0, padding: 0, zIndex: 10}}>
            {suggestions.map(c => (
              <li key={c} onClick={() => {setCity(c); setSuggestions([])}} style={{padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: '#333'}}>
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
      {avatarUrl && <img src={avatarUrl} alt="Avatar" style={{width: "100px", height: "100px", borderRadius: "50%", marginTop: "1rem"}} />}

      <select value={howTheyDrink} onChange={(e) => setHowTheyDrink(e.target.value)}>
        <option value="tereré">Tereré</option>
        <option value="lavado">Lavado</option>
        <option value="amargo">Amargo</option>
        <option value="dulce">Dulce</option>
        <option value="con yuyos">Con yuyos</option>
      </select>

      <p>¿Qué vibe buscas?</p>
      <label>
        <input
          type="checkbox"
          checked={mood.includes('charla_profunda')}
          onChange={() => handleMoodToggle('charla_profunda')}
        />
        Charla profunda
      </label>
      <label>
        <input
          type="checkbox"
          checked={mood.includes('risas')}
          onChange={() => handleMoodToggle('risas')}
        />
        Risas
      </label>
      <label>
        <input
          type="checkbox"
          checked={mood.includes('silencio')}
          onChange={() => handleMoodToggle('silencio')}
        />
        Silencio cómodo
      </label>
      <label>
        <input
          type="checkbox"
          checked={mood.includes('debate')}
          onChange={() => handleMoodToggle('debate')}
        />
        Debate
      </label>

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar perfil'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
