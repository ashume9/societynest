import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Order } from '../types'
import { ArrowRight, Package } from 'lucide-react'
import { statusBadge, formatDate } from '../lib/utils'

export default function Orders() {
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!session?.userId) return
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data)
        setLoading(false)
      })
  }, [session])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>My Orders</h1>
            <p style={{ color: 'var(--neutral-500)' }}>Track all your ironing orders</p>
          </div>
          <Link to="/order/new" className="btn btn-primary">New Order</Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'pending', 'picked_up', 'in_progress', 'ready', 'delivered'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="btn btn-sm"
              style={{
                background: filter === s ? 'var(--primary-600)' : 'white',
                color: filter === s ? 'white' : 'var(--neutral-600)',
                border: '1px solid',
                borderColor: filter === s ? 'var(--primary-600)' : 'var(--neutral-200)',
                textTransform: 'capitalize',
              }}
            >
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
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-600)', marginBottom: 8 }}>No orders found</h3>
            <p style={{ color: 'var(--neutral-400)', marginBottom: 24 }}>
              {filter === 'all' ? 'You haven\'t placed any orders yet.' : `No ${filter.replace('_', ' ')} orders.`}
            </p>
            {filter === 'all' && <Link to="/order/new" className="btn btn-primary">Place First Order</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(order => {
              const { label, className } = statusBadge(order.status)
              return (
                <Link key={order.id} to={`/orders/${order.id}`}>
                  <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'var(--primary-50)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Package size={20} color="var(--primary-600)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: 14 }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`badge ${className}`}>{label}</span>
                        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{order.service_type}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--neutral-500)' }}>
                        Pickup: {formatDate(order.pickup_date)} ({order.pickup_slot}) · ₹{order.total_amount}
                      </p>
                    </div>
                    <ArrowRight size={16} color="var(--neutral-400)" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
