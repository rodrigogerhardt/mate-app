import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Profile.css'

export default function Profile({ session, onProfileComplete }) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [howTheyDrink, setHowTheyDrink] = useState('tereque')
  const [mood, setMood] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleMoodToggle = (value) => {
    setMood(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    )
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

      <select value={howTheyDrink} onChange={(e) => setHowTheyDrink(e.target.value)}>
        <option value="tereque">Tereque</option>
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
