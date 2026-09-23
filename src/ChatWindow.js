import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ChatWindow({ session, selectedMatch, onBack }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const receiverId = selectedMatch.id

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', receiverId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setLoading(false)
    }
    fetchMessages()
  }, [matchId])

  const sendMessage = async () => {
    if (!text.trim()) return
    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: receiverId,
      text: text
    })
    setText('')
  }

  if (loading) return <div style={{padding: '2rem'}}>Cargando chat...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
      <button onClick={onBack} style={{marginBottom: '1rem', padding: '8px 15px'}}>Volver</button>
      <h2>{selectedMatch.full_name}</h2>
      <div style={{background: '#f0f0f0', padding: '1rem', borderRadius: '8px', height: '400px', overflowY: 'auto', marginBottom: '1rem'}}>
        {messages.map((msg) => (
          <div key={msg.id} style={{marginBottom: '1rem', textAlign: msg.sender_id === session.user.id ? 'right' : 'left'}}>
            <div style={{background: msg.sender_id === session.user.id ? '#007AFF' : '#E5E5EA', color: msg.sender_id === session.user.id ? 'white' : 'black', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-block', maxWidth: '80%'}}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: '10px'}}>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Escribe un mensaje..." style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
        <button onClick={sendMessage} style={{padding: '10px 20px', cursor: 'pointer'}}>Enviar</button>
      </div>
    </div>
  )
}
