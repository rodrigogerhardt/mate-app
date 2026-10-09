import { useState } from 'react'
import { filterCiudades } from './ciudades.js'
import { supabase } from './supabaseClient'
import './Profile.css'

export default function Profile({ session, onProfileComplete }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [howTheyDrink, setHowTheyDrink] = useState('tereré')
  const [mood, setMood] = useState([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState([])
  const [photos, setPhotos] = useState([])
  const [lookingForMateToday, setLookingForMateToday] = useState(false)  
// eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const handleLanguageToggle = (lang) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    )
  }

  const handlePhotoUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (photos.length + files.length > 5) {
      setError('Máximo 5 fotos')
      return
    }
    const newPhotos = [...photos]
    for (let file of files) {
      const fileName = `${session.user.id}/gallery/${Date.now()}-${Math.random()}`
      const { error: uploadError } = await supabase.storage.from('Avatars').upload(fileName, file)
      if (uploadError) {
        setError(uploadError.message)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(fileName)
      newPhotos.push(publicUrl)
    }
    setPhotos(newPhotos)
    setError(null)
  }

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }
  const handleMoodToggle = (value) => {
    setMood(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const maxSizeInBytes = 5 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      setError(`Foto muy grande. Máximo 5MB (la tuya es ${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      return
    }
    
    const fileName = `${session.user.id}/${Date.now()}`
    const { error: uploadError } = await supabase.storage.from('Avatars').upload(fileName, file)
    if (uploadError) {
      setError(uploadError.message)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(fileName)
    console.log("Public URL:", publicUrl)
    setAvatarUrl(publicUrl)
    setError(null)
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
          age: parseInt(age),
          bio: bio,
          languages: languages.join(','),
          photos: photos,
          looking_for_mate_today: lookingForMateToday,  
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
      <div className="profile-form">
        <h1>Completá tu perfil</h1>
      <input
        type="text"
        placeholder="Nombre completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Edad"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        min="18"
        max="120"
      />

      <textarea
        placeholder="Bio (cuéntanos sobre vos)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        style={{width: '100%', padding: '12px', border: '2px solid #6DB3D0', borderRadius: '8px', marginBottom: '1rem', minHeight: '80px', fontFamily: 'inherit', fontSize: '14px'}}
        maxLength="300"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleAvatarUpload(e)}
        style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}}
      />

      <div style={{position: 'relative', marginBottom: '1rem'}}>
        <input
          type="text"
          placeholder="¿En qué ciudad estás?"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            const sugg = filterCiudades(e.target.value)
            console.log("Sugerencias:", sugg)
            setSuggestions(sugg)
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
      <p style={{color: '#2D5016', fontWeight: 'bold', marginBottom: '0.5rem'}}>Idiomas:</p>
      {['Español', 'Inglés', 'Italiano', 'Francés', 'Portugués', 'Alemán'].map(lang => (
        <label key={lang} style={{display: 'block', marginBottom: '0.5rem'}}>
          <input
            type="checkbox"
            checked={languages.includes(lang)}
            onChange={() => handleLanguageToggle(lang)}
          />
          {lang}
        </label>
      ))}
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
          oge={() => handleMoodToggle('debate')}
        />
        Debate
      </label>
      <p style={{color: '#2D5016', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem'}}>Fotos (máx 5):</p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handlePhotoUpload(e)}
        style={{width: '100%', padding: '12px', marginBottom: '1rem', border: '2px solid #6DB3D0', borderRadius: '8px'}}
      />
      {photos.length > 0 && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '1rem'}}>
          {photos.map((photo, idx) => (
            <div key={idx} style={{position: 'relative'}}>
              <img src={photo} alt={`foto-${idx}`} style={{width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px'}} />
              <button onClick={() => removePhoto(idx)} style={{position: 'absolute', top: '0', right: '0', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '0 8px 0 0', padding: '4px 8px', cursor: 'pointer', fontSize: '12px'}}>✕</button>
            </div>
          ))}
        </div>
      )}

      <label style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
        <input
          type="checkbox"
          checked={lookingForMateToday}
          onChange={(e) => setLookingForMateToday(e.target.checked)}
          style={{marginRight: '8px', width: '18px', height: '18px'}}
        />
        <span style={{color: '#333'}}>Estoy para unos mates hoy</span>
      </label>
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar perfil'}
      </button>

      {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
