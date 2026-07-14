import { useEffect, useState } from 'react'
import { MessageSquare, Clock } from 'lucide-react'
import { api } from '../lib/api'

export default function InboxPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.inbox()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="inbox-layout">
      <div className="inbox-header">
        <h1>Messages</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Stay connected with freelancers and clients</p>
      </div>

      <div className="conversations-list">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageSquare size={48} />
            </div>
            <h2>No messages yet</h2>
            <p>Start a conversation by placing an order or contacting a freelancer.</p>
          </div>
        ) : (
          messages.map(item => (
            <div key={item.id} className="conversation">
              <div className="conversation-avatar">
                {item.initial || item.sender_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="conversation-content">
                <div className="conversation-header">
                  <span className="conversation-name">{item.sender_name}</span>
                  <span className="conversation-time">{item.sent_at}</span>
                </div>
                <p className="conversation-preview">{item.last_message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}