import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Order } from '../types'
import { Package, Clock, CheckCircle, PlusCircle, ArrowRight } from 'lucide-react'
import { statusBadge, formatDate } from '../lib/utils'

export default function Dashboard() {
  const { session, user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.userId) return
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setOrders(data)
        setLoading(false)
      })
  }, [session])

  const active = orders.filter(o => o.status !== 'delivered')
  const delivered = orders.filter(o => o.status === 'delivered')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 15 }}>Here's an overview of your ironing orders.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Orders" value={orders.length} icon={Package} color="var(--primary-600)" />
          <StatCard label="Active Orders" value={active.length} icon={Clock} color="var(--accent-500)" />
          <StatCard label="Delivered" value={delivered.length} icon={CheckCircle} color="var(--success-600)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--neutral-800)' }}>Recent Orders</h2>
          <Link to="/order/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> New Order
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👔</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: 'var(--neutral-500)', marginBottom: 24 }}>Place your first ironing order today!</p>
            <Link to="/order/new" className="btn btn-primary">
              Place First Order <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => {
              const { label, className } = statusBadge(order.status)
              return (
                <Link key={order.id} to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s', cursor: 'pointer' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: 14 }}>
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`badge ${className}`}>{label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--neutral-500)' }}>
                        {formatDate(order.pickup_date)} · {order.service_type} · ₹{order.total_amount}
                      </p>
                    </div>
                    <ArrowRight size={16} color="var(--neutral-400)" />
                  </div>
                </Link>
              )
            })}
            {orders.length >= 5 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Link to="/orders" className="btn btn-secondary btn-sm">View All Orders</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)' }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{label}</div>
        </div>
      </div>
    </div>
  )
}
