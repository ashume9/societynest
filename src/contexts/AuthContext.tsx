import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthSession, User, Partner } from '../types'

interface AuthContextType {
  session: AuthSession | null
  user: User | null
  partner: Partner | null
  login: (session: AuthSession) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sx_session')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthSession
        setSession(parsed)
      } catch {
        localStorage.removeItem('sx_session')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (s: AuthSession) => {
    setSession(s)
    localStorage.setItem('sx_session', JSON.stringify(s))
  }

  const logout = () => {
    setSession(null)
    localStorage.removeItem('sx_session')
  }

  const user = session?.role === 'user' ? (session.userData as User) : null
  const partner = session?.role === 'partner' ? (session.userData as Partner) : null

  return (
    <AuthContext.Provider value={{ session, user, partner, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
