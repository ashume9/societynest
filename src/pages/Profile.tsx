import { useState, FormEvent, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Society, Tower, Flat } from '../types'

export default function Profile() {
  const { session, user, login } = useAuth()
  const [societies, setSocieties] = useState<Society[]>([])
  const [towers, setTowers] = useState<Tower[]>([])
  const [flats, setFlats] = useState<Flat[]>([])

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    adults: user?.adults || 2,
    kids: user?.kids || 0,
    pickup_slot: user?.pickup_slot || 'morning',
    delivery_slot: user?.delivery_slot || 'evening',
    society_id: user?.society_id || '',
    tower_id: user?.tower_id || '',
    flat_id: user?.flat_id || '',
  })

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('societies').select('*').order('name').then(({ data }) => { if (data) setSocieties(data) })
  }, [])

  useEffect(() => {
    if (!form.society_id) return
    supabase.from('towers').select('*').eq('society_id', form.society_id).order('name').then(({ data }) => { if (data) setTowers(data) })
  }, [form.society_id])

  useEffect(() => {
    if (!form.tower_id) return
    supabase.from('flats').select('*').eq('tower_id', form.tower_id).order('number').then(({ data }) => { if (data) setFlats(data) })
  }, [form.tower_id])

  const set = (field: string, value: string | number) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('users')
        .update(form)
        .eq('id', session!.userId)
        .select()
        .single()

      if (err) throw new Error(err.message)
      login({ ...session!, userData: data })
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: 640 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Profile</h1>
        <p style={{ color: 'var(--neutral-500)', marginBottom: 32 }}>Manage your account details</p>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Personal Info</h2>
            {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
            {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Full Name</label>
                <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Adults</label>
                <input className="input" type="number" min={1} max={10} value={form.adults} onChange={e => set('adults', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Kids</label>
                <input className="input" type="number" min={0} max={10} value={form.kids} onChange={e => set('kids', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Default Pickup Slot</label>
                <select className="input" value={form.pickup_slot} onChange={e => set('pickup_slot', e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Default Delivery Slot</label>
                <select className="input" value={form.delivery_slot} onChange={e => set('delivery_slot', e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="label">Society</label>
                <select className="input" value={form.society_id} onChange={e => set('society_id', e.target.value)}>
                  <option value="">Select</option>
                  {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Tower</label>
                <select className="input" value={form.tower_id} onChange={e => set('tower_id', e.target.value)} disabled={!form.society_id}>
                  <option value="">Select</option>
                  {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Flat</label>
                <select className="input" value={form.flat_id} onChange={e => set('flat_id', e.target.value)} disabled={!form.tower_id}>
                  <option value="">Select</option>
                  {flats.map(f => <option key={f.id} value={f.id}>{f.number}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
