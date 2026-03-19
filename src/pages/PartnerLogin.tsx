import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { loginPartner } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

export default function PartnerLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = await loginPartner(username, password)
      login(session)
      navigate('/partner/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)', padding: 24 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Briefcase size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>Partner Login</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>Access your partner dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="form-group">
            <label className="label">Username</label>
            <input className="input" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--neutral-500)' }}>
          <Link to="/login" style={{ color: 'var(--neutral-500)' }}>← Customer Login</Link>
        </div>
      </div>
    </div>
  )
}
