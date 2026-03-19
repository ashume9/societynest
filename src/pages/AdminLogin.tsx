import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { loginAdmin } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLogin() {
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
      const session = await loginAdmin(username, password)
      login(session)
      navigate('/admin')
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
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--neutral-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>Admin Login</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>Access admin control panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="form-group">
            <label className="label">Username</label>
            <input className="input" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: 8, background: 'var(--neutral-800)', color: 'white' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
          <Link to="/login" style={{ color: 'var(--neutral-500)' }}>← Customer Login</Link>
        </div>
      </div>
    </div>
  )
}
