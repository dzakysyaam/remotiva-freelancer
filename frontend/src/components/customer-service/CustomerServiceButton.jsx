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
  const [threads, setThreads] = useState([])
  const [showThreadList, setShowThreadList] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentUser = session.user
  const currentUserRole = currentUser?.role || 'buyer'

  // Load existing threads on mount
  useEffect(() => {
    loadThreads()
  }, [])

  async function loadThreads() {
    setIsLoading(true)
    try {
      const myThreads = await api.csThreads()
      setThreads(myThreads)
      if (myThreads.length > 0) {
        // Open the most recent thread
        const latestThread = myThreads[0]
        setThreadId(latestThread.id)
        await loadMessages(latestThread.id)
      } else {
        // No threads, show welcome
        setMessages([{
          id: 'welcome',
          sender_role: 'admin',
          sender_name: 'CS Remotiva',
          message: customerService.welcomeMessage,
          created_at: new Date().toISOString(),
          isWelcome: true
        }])
      }
    } catch (err) {
      console.error('Failed to load threads:', err)
      // Show welcome on error
      setMessages([{
        id: 'welcome',
        sender_role: 'admin',
        sender_name: 'CS Remotiva',
        message: customerService.welcomeMessage,
        created_at: new Date().toISOString(),
        isWelcome: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  async function loadMessages(tid) {
    try {
      const msgs = await api.getCsThreadMessages(tid)
      if (msgs.length === 0) {
        // Add welcome message if no messages
        setMessages([{
          id: 'welcome',
          sender_role: 'admin',
          sender_name: 'CS Remotiva',
          message: customerService.welcomeMessage,
          created_at: new Date().toISOString(),
          isWelcome: true
        }])
      } else {
        setMessages(msgs)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      setMessages([{
        id: 'welcome',
        sender_role: 'admin',
        sender_name: 'CS Remotiva',
        message: customerService.welcomeMessage,
        created_at: new Date().toISOString(),
        isWelcome: true
      }])
    }
  }

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

    try {
      let tid = threadId

      // If no thread exists, create one first
      if (!tid) {
        const subject = messageText.substring(0, 40) + (messageText.length > 40 ? '...' : '')
        const thread = await api.createCsThread({ subject })
        tid = thread.id
        setThreadId(tid)
        // Refresh threads list
        await loadThreads()
      }

      // Send the message
      await api.sendCsMessage(tid, { message: messageText })

      // Reload messages to get proper IDs from backend
      await loadMessages(tid)
    } catch (err) {
      console.error('Failed to send message:', err)
      // Restore message on error
      setInputValue(messageText)
    } finally {
      setSending(false)
    }
  }

  function handleSelectThread(tid) {
    setThreadId(tid)
    loadMessages(tid)
    setShowThreadList(false)
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
          <div className="cs-header-actions">
            {threads.length > 0 && (
              <button
                className="cs-thread-toggle"
                onClick={() => setShowThreadList(!showThreadList)}
                title="Lihat percakapan"
              >
                {threads.length} percakapan
              </button>
            )}
            <button className="customer-chat-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </header>

        {showThreadList && (
          <div className="cs-thread-selector">
            <div className="cs-thread-selector-header">
              <span>{customerService.allThreads}</span>
              <button onClick={loadThreads} className="cs-refresh-btn">↻</button>
            </div>
            <div className="cs-thread-list-popup">
              {threads.map(thread => (
                <div
                  key={thread.id}
                  className={`cs-thread-item ${threadId === thread.id ? 'active' : ''}`}
                  onClick={() => handleSelectThread(thread.id)}
                >
                  <div className="cs-thread-subject">{thread.subject}</div>
                  {thread.last_message && (
                    <div className="cs-thread-preview">{thread.last_message}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="customer-chat-body">
          {isLoading ? (
            <div className="cs-loading">Memuat...</div>
          ) : messages.map(msg => (
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
