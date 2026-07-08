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

  return (
    <>
      {children}
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          position: 'fixed',
          top: 12,
          right: 16,
          zIndex: 1000,
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '999px',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </>
  )
}

export default AuthGate