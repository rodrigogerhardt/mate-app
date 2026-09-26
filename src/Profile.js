import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Profile.css'

export default function Profile({ session, onProfileComplete }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [howTheyDrink, setHowTheyDrink] = useState('tereré')
  const [mood, setMood] = useState([])
const [avatar, setAvatar] = useState(null)
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
    setUploading(true)
    const fileName = `${session.user.id}/${Date.now()}`
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, file)
    if (error) {
      setError(error.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    setAvatarUrl(publicUrl)
    setAvatar(file)
    setUploading(false)
  }
  const handleSave = async () => {
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

      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        disabled={uploading}
      />
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
