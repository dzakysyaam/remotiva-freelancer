import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Send, X } from 'lucide-react'
import { api, session } from '../../lib/api'
import IconAsset from '../ui/IconAsset'
import { customerService } from '../../data/uiCopy'

let globalSetIsOpen = null

export const CustomerServiceButton = forwardRef(function CustomerServiceButton(props, ref) {
  const [isOpen, setIsOpen] = useState(false)

  // Register global open function
  useEffect(() => {
    globalSetIsOpen = setIsOpen
    window.openCustomerService = () => setIsOpen(true)
  }, [])

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }))

  return (
    <>
      <button
        className="cs-float-btn"
        onClick={() => setIsOpen(true)}
        aria-label={customerService.title}
      >
        <IconAsset name="headset" alt={customerService.title} size={28} />
      </button>
      {isOpen && <CustomerServicePopup onClose={() => setIsOpen(false)} />}
    </>
  )
})

function CustomerServicePopup({ onClose }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentUser = session.user

  useEffect(() => {
    // Show welcome message if no messages
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        sender_role: 'admin',
        sender_name: 'CS Remotiva',
        message: customerService.welcomeMessage,
        created_at: new Date().toISOString(),
        isWelcome: true
      }])
    }
  }, [])

  useEffect(() => {
    // Listen for global open event
    const handleOpen = () => {}
    window.addEventListener('open-customer-service', handleOpen)
    return () => window.removeEventListener('open-customer-service', handleOpen)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input when popup opens
    inputRef.current?.focus()
  }, [])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!inputValue.trim() || sending) return

    const messageText = inputValue.trim()
    setInputValue('')
    setSending(true)

    // Add user message immediately to UI
    const userMsg = {
      id: 'temp-' + Date.now(),
      sender_role: 'buyer',
      sender_name: currentUser?.name || 'Anda',
      message: messageText,
      created_at: new Date().toISOString(),
      isUser: true
    }
    setMessages(prev => [...prev, userMsg])

    try {
      // If no thread exists, create one first
      if (!threadId) {
        const subject = messageText.substring(0, 40) + (messageText.length > 40 ? '...' : '')
        const thread = await api.createCsThread({ subject })
        setThreadId(thread.id)
      }

      // Send the message
      await api.sendCsMessage(threadId, { message: messageText })

      // Reload messages to get proper IDs from backend
      if (threadId) {
        const updatedMessages = await api.getCsThreadMessages(threadId)
        // Replace temp messages with real ones, keep welcome message
        setMessages(prev => {
          const welcome = prev.find(m => m.isWelcome)
          const userMsgs = updatedMessages.filter(m => m.sender_role === 'buyer')
          return welcome ? [welcome, ...userMsgs] : updatedMessages
        })
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      // Keep the message visible even if send failed
    } finally {
      setSending(false)
    }
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="cs-popup-overlay" onClick={onClose}>
      <div className="customer-chat" onClick={e => e.stopPropagation()}>
        <header className="customer-chat-header">
          <div>
            <div className="customer-chat-title">
              <IconAsset name="headset" alt={customerService.title} size={20} />
              <strong>{customerService.title}</strong>
            </div>
            <span>{customerService.subtitle}</span>
          </div>
          <button className="customer-chat-close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="customer-chat-body">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-message ${msg.isWelcome || msg.sender_role === 'admin' ? 'chat-message-support' : 'chat-message-user'}`}
            >
              <p>{msg.message}</p>
              {!msg.isWelcome && (
                <span className="chat-message-time">{formatTime(msg.created_at)}</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="customer-chat-footer" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            placeholder={customerService.typeMessage}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={!inputValue.trim() || sending}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default CustomerServiceButton
