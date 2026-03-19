import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Order, Partner } from '../../types'
import { statusBadge, formatDate } from '../../lib/utils'
import { Package } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('partners').select('*').eq('status', 'approved'),
    ]).then(([{ data: o }, { data: p }]) => {
      if (o) setOrders(o)
      if (p) setPartners(p)
      setLoading(false)
    })
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const assignPartner = async (orderId: string, partnerId: string, field: 'assigned_ironing_partner_id' | 'assigned_delivery_partner_id') => {
    const { error } = await supabase.from('orders').update({ [field]: partnerId }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: partnerId } : o))
    }
  }

  const ironingPartners = partners.filter(p => p.partner_type === 'ironing' || p.partner_type === 'both')
  const deliveryPartners = partners.filter(p => p.partner_type === 'delivery' || p.partner_type === 'both')

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Orders</h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>Manage and assign all orders</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'picked_up', 'in_progress', 'ready', 'delivered'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
            background: filter === s ? 'var(--primary-600)' : 'white',
            color: filter === s ? 'white' : 'var(--neutral-600)',
            border: '1px solid', borderColor: filter === s ? 'var(--primary-600)' : 'var(--neutral-200)',
            textTransform: 'capitalize',
          }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <Package size={48} color="var(--neutral-300)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-600)' }}>No orders</h3>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                  {['Order ID', 'Date', 'Service', 'Amount', 'Status', 'Ironing Partner', 'Delivery Partner'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const { label, className } = statusBadge(order.status)
                  return (
                    <tr key={order.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--neutral-100)' : undefined }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--neutral-600)' }}>{formatDate(order.pickup_date)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{order.service_type}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>₹{order.total_amount}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${className}`}>{label}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          className="input"
                          style={{ width: 160, fontSize: 12, padding: '4px 8px' }}
                          value={order.assigned_ironing_partner_id || ''}
                          onChange={e => assignPartner(order.id, e.target.value, 'assigned_ironing_partner_id')}
                        >
                          <option value="">Unassigned</option>
                          {ironingPartners.map(p => <option key={p.id} value={p.id}>{p.full_name || p.username}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          className="input"
                          style={{ width: 160, fontSize: 12, padding: '4px 8px' }}
                          value={order.assigned_delivery_partner_id || ''}
                          onChange={e => assignPartner(order.id, e.target.value, 'assigned_delivery_partner_id')}
                        >
                          <option value="">Unassigned</option>
                          {deliveryPartners.map(p => <option key={p.id} value={p.id}>{p.full_name || p.username}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
