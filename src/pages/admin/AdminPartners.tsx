import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Partner } from '../../types'
import { Briefcase, Search } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('partners').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPartners(data)
      setLoading(false)
    })
  }, [])

  const filtered = partners.filter(p => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('partners').update({ status }).eq('id', id)
    if (!error) setPartners(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const statusStyle = (status: string) => {
    if (status === 'approved') return 'badge-green'
    if (status === 'rejected') return 'badge-red'
    return 'badge-yellow'
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Partners</h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>Manage ironing and delivery partners</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
            background: filter === s ? 'var(--primary-600)' : 'white',
            color: filter === s ? 'white' : 'var(--neutral-600)',
            border: '1px solid', borderColor: filter === s ? 'var(--primary-600)' : 'var(--neutral-200)',
            textTransform: 'capitalize',
          }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                  {['Name', 'Username', 'Phone', 'Type', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--neutral-400)' }}>
                      <Briefcase size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                      No partners found
                    </td>
                  </tr>
                ) : filtered.map((partner, i) => (
                  <tr key={partner.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--neutral-100)' : undefined }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--neutral-800)', fontSize: 14 }}>{partner.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>{partner.username}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>{partner.phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{partner.partner_type}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${statusStyle(partner.status)}`} style={{ textTransform: 'capitalize' }}>{partner.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-500)' }}>{formatDate(partner.created_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {partner.status !== 'approved' && (
                          <button onClick={() => updateStatus(partner.id, 'approved')} className="btn btn-sm" style={{ background: 'var(--success-50)', color: 'var(--success-600)', border: '1px solid #bbf7d0' }}>
                            Approve
                          </button>
                        )}
                        {partner.status !== 'rejected' && (
                          <button onClick={() => updateStatus(partner.id, 'rejected')} className="btn btn-sm" style={{ background: 'var(--error-50)', color: 'var(--error-600)', border: '1px solid #fecaca' }}>
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
