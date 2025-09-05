import { useState, useEffect } from 'react'

export default function PasswordProtect({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const correctPassword = 'cocoads2025'

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('cocoads_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === correctPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('cocoads_auth', 'true')
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return children
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#111',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #333',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '1.5rem' }}>
          🥥 Coco Wraps 3D
        </h2>
        <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '1.5rem' }}>
          This content is password protected
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: '1px solid #444',
                borderRadius: '4px',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>
          
          {error && (
            <p style={{ 
              color: '#ff6b6b', 
              fontSize: '14px', 
              marginBottom: '1rem',
              textAlign: 'center' 
            }}>
              {error}
            </p>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0070f3',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051a5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            Access Site
          </button>
        </form>
        
        <p style={{ 
          color: '#666', 
          fontSize: '12px', 
          textAlign: 'center', 
          marginTop: '1.5rem' 
        }}>
          Interactive 3D Product Showcase
        </p>
      </div>
    </div>
  )
}