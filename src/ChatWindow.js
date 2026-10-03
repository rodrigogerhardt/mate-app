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
  }, [receiverId])

  const sendMessage = async () => {
    if (!text.trim()) return
    const messageText = text
    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: receiverId,
      text: messageText
    })
    const newMsg = { id: Date.now(), sender_id: session.user.id, receiver_id: receiverId, text: messageText, created_at: new Date() }
    setMessages([...messages, newMsg])
    setText('')
  }

  if (loading) return <div style={{padding: '2rem', textAlign: 'center'}}>Cargando chat...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, #6DB3D0 0%, #F5F5F5 100%)', minHeight: '100vh'}}>
      <button onClick={onBack} style={{marginBottom: '1rem', padding: '8px 15px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>← Volver</button>
      <h2 style={{color: '#2D5016', marginBottom: '1.5rem'}}>{selectedMatch.full_name}</h2>
      <div style={{background: '#f0f0f0', padding: '1rem', borderRadius: '12px', height: '400px', overflowY: 'auto', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
        {messages.map((msg) => (
          <div key={msg.id} style={{marginBottom: '1rem', textAlign: msg.sender_id === session.user.id ? 'right' : 'left'}}>
            <div style={{background: msg.sender_id === session.user.id ? '#2D5016' : 'white', color: msg.sender_id === session.user.id ? 'white' : '#333', padding: '0.75rem 1rem', borderRadius: '12px', display: 'inline-block', maxWidth: '80%', wordWrap: 'break-word', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: '10px'}}>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Escribe un mensaje..." style={{flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid #6DB3D0'}} />
        <button onClick={sendMessage} style={{padding: '12px 20px', background: '#2D5016', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Enviar</button>
      </div>
    </div>
  )
}
