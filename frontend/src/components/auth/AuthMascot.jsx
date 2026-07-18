import { useState, useEffect, useRef } from 'react'

export default function AuthMascot() {
  const [open, setOpen] = useState(false)
  const timerRef = useRef(null)

  const sayHi = () => {
    setOpen(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setOpen(false), 3000)
  }

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="auth-mascot-stage">
      <button
        type="button"
        className="auth-mascot-button"
        aria-label="Say hello"
        onClick={sayHi}
      >
        <img
          src="/assets/mascot_remotiva_transparent.png"
          alt="Remotiva Mascot"
          className="auth-mascot-image"
        />
      </button>

      {open && (
        <div className="auth-mascot-bubble">
          Hi, welcome to Remotiva!
        </div>
      )}
    </div>
  )
}