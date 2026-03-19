import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Phone, Lock } from 'lucide-react'
import { loginUser } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = await loginUser(phone, password)
      login(session)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--neutral-50)', padding: 24,
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <ShoppingBag size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>Sign in to your SocietyXpress account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-group">
            <label className="label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--neutral-500)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>Register here</Link>
        </div>

        <div style={{
          marginTop: 24, paddingTop: 24,
          borderTop: '1px solid var(--neutral-200)',
          display: 'flex', gap: 16, justifyContent: 'center', fontSize: 13,
        }}>
          <Link to="/partner/login" style={{ color: 'var(--neutral-500)' }}>Partner Login</Link>
          <span style={{ color: 'var(--neutral-300)' }}>|</span>
          <Link to="/admin/login" style={{ color: 'var(--neutral-500)' }}>Admin Login</Link>
        </div>
      </div>
    </div>
  )
}
