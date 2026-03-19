import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '../../types'
import { Users, Search } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface UserWithDetails extends User {
  societies?: { name: string } | null
  towers?: { name: string } | null
  flats?: { number: string } | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('users')
      .select('*, societies(name), towers(name), flats(number)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setUsers(data as UserWithDetails[])
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Users</h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>Manage registered customers</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                  {['Name', 'Phone', 'Email', 'Society', 'Tower/Flat', 'Registered'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--neutral-400)' }}>
                      <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                      No users found
                    </td>
                  </tr>
                ) : filtered.map((user, i) => (
                  <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--neutral-100)' : undefined }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--neutral-800)', fontSize: 14 }}>{user.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>{user.phone || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>{user.email || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>
                      {(user as UserWithDetails).societies?.name || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>
                      {(user as UserWithDetails).towers?.name || '—'} / {(user as UserWithDetails).flats?.number || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-500)' }}>
                      {formatDate(user.created_at)}
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
