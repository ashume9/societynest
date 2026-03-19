import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { registerUser } from '../lib/auth'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Society, Tower, Flat } from '../types'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [societies, setSocieties] = useState<Society[]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [flats, setFlats] = useState<Flat[]>([])

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    society_id: '',
    tower_id: '',
    flat_id: '',
    adults: 2,
    kids: 0,
    pickup_slot: 'morning' as 'morning' | 'evening',
    delivery_slot: 'evening' as 'morning' | 'evening',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('societies').select('*').order('name').then(({ data }) => {
      if (data) setSocieties(data)
    })
  }, [])

  useEffect(() => {
    if (!form.society_id) { setTowers([]); setFlats([]); return }
    supabase.from('towers').select('*').eq('society_id', form.society_id).order('name').then(({ data }) => {
      if (data) setTowers(data)
    })
    setForm(f => ({ ...f, tower_id: '', flat_id: '' }))
  }, [form.society_id])

  useEffect(() => {
    if (!form.tower_id) { setFlats([]); return }
    supabase.from('flats').select('*').eq('tower_id', form.tower_id).order('number').then(({ data }) => {
      if (data) setFlats(data)
    })
    setForm(f => ({ ...f, flat_id: '' }))
  }, [form.tower_id])

  const set = (field: string, value: string | number) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }
    if (!form.society_id || !form.tower_id || !form.flat_id) { setError('Please select your society, tower and flat'); return }
    setLoading(true)
    try {
      const { confirm_password: _, ...data } = form
      const session = await registerUser(data)
      login(session)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)', padding: '40px 24px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <ShoppingBag size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>Join SocietyXpress and start your first order</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Your full name" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Phone Number</label>
              <input className="input" type="tel" placeholder="10-digit phone" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} required />
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-700)', margin: '8px 0 16px' }}>Address Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="label">Society</label>
              <select className="input" value={form.society_id} onChange={e => set('society_id', e.target.value)} required>
                <option value="">Select society</option>
                {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Tower / Block</label>
              <select className="input" value={form.tower_id} onChange={e => set('tower_id', e.target.value)} required disabled={!form.society_id}>
                <option value="">Select tower</option>
                {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Flat No.</label>
              <select className="input" value={form.flat_id} onChange={e => set('flat_id', e.target.value)} required disabled={!form.tower_id}>
                <option value="">Select flat</option>
                {flats.map(f => <option key={f.id} value={f.id}>{f.number}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="label">Adults</label>
              <input className="input" type="number" min={1} max={10} value={form.adults} onChange={e => set('adults', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Kids</label>
              <input className="input" type="number" min={0} max={10} value={form.kids} onChange={e => set('kids', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Pickup Slot</label>
              <select className="input" value={form.pickup_slot} onChange={e => set('pickup_slot', e.target.value)}>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Delivery Slot</label>
              <select className="input" value={form.delivery_slot} onChange={e => set('delivery_slot', e.target.value)}>
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--neutral-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
