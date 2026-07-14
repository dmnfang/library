import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './components/Login'

function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        color: 'var(--color-text-tertiary)',
      }}>
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return children
}

export default AuthGate