import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { ClothingType } from '../../types'
import { Plus, Pencil, Check, X } from 'lucide-react'

export default function AdminPricing() {
  const [items, setItems] = useState<ClothingType[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ normal_rate: 0, priority_rate: 0, express_rate: 0 })
  const [newForm, setNewForm] = useState({ name: '', normal_rate: '', priority_rate: '', express_rate: '' })
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('clothing_types').select('*').order('name').then(({ data }) => {
      if (data) setItems(data)
      setLoading(false)
    })
  }, [])

  const startEdit = (item: ClothingType) => {
    setEditId(item.id)
    setEditForm({ normal_rate: item.normal_rate, priority_rate: item.priority_rate, express_rate: item.express_rate })
  }

  const saveEdit = async (id: string) => {
    const { error, data } = await supabase.from('clothing_types').update(editForm).eq('id', id).select().single()
    if (!error && data) {
      setItems(prev => prev.map(i => i.id === id ? data : i))
      setEditId(null)
    }
  }

  const addItem = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const payload = {
      name: newForm.name,
      normal_rate: +newForm.normal_rate,
      priority_rate: +newForm.priority_rate,
      express_rate: +newForm.express_rate,
    }
    const { data, error: err } = await supabase.from('clothing_types').insert(payload).select().single()
    if (err) { setError(err.message); return }
    if (data) setItems(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewForm({ name: '', normal_rate: '', priority_rate: '', express_rate: '' })
    setShowNew(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)' }}>Pricing</h1>
        <button onClick={() => setShowNew(!showNew)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Item
        </button>
      </div>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>Manage clothing item rates</p>

      {showNew && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add New Item</h2>
          {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
          <form onSubmit={addItem}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label className="label">Item Name</label>
                <input className="input" placeholder="e.g., Blazer" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Normal (₹)</label>
                <input className="input" type="number" min={1} value={newForm.normal_rate} onChange={e => setNewForm(f => ({ ...f, normal_rate: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Priority (₹)</label>
                <input className="input" type="number" min={1} value={newForm.priority_rate} onChange={e => setNewForm(f => ({ ...f, priority_rate: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Express (₹)</label>
                <input className="input" type="number" min={1} value={newForm.express_rate} onChange={e => setNewForm(f => ({ ...f, express_rate: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                {['Item', 'Normal (₹)', 'Priority (₹)', 'Express (₹)', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--neutral-100)' : undefined }}>
                  <td style={{ padding: '12px 20px', fontWeight: 500, color: 'var(--neutral-800)' }}>{item.name}</td>
                  {editId === item.id ? (
                    <>
                      <td style={{ padding: '8px 20px' }}>
                        <input className="input" type="number" style={{ width: 80 }} value={editForm.normal_rate} onChange={e => setEditForm(f => ({ ...f, normal_rate: +e.target.value }))} />
                      </td>
                      <td style={{ padding: '8px 20px' }}>
                        <input className="input" type="number" style={{ width: 80 }} value={editForm.priority_rate} onChange={e => setEditForm(f => ({ ...f, priority_rate: +e.target.value }))} />
                      </td>
                      <td style={{ padding: '8px 20px' }}>
                        <input className="input" type="number" style={{ width: 80 }} value={editForm.express_rate} onChange={e => setEditForm(f => ({ ...f, express_rate: +e.target.value }))} />
                      </td>
                      <td style={{ padding: '8px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => saveEdit(item.id)} className="btn btn-sm" style={{ background: 'var(--success-50)', color: 'var(--success-600)', border: '1px solid #bbf7d0' }}>
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditId(null)} className="btn btn-sm btn-secondary">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px 20px', color: 'var(--primary-700)', fontWeight: 600 }}>₹{item.normal_rate}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--accent-600)', fontWeight: 600 }}>₹{item.priority_rate}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--error-600)', fontWeight: 600 }}>₹{item.express_rate}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <button onClick={() => startEdit(item)} className="btn btn-sm btn-secondary">
                          <Pencil size={14} /> Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
