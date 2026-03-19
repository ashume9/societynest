import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Order } from '../types'
import { Package, CheckCircle, Clock, Truck } from 'lucide-react'
import { statusBadge, formatDate } from '../lib/utils'

export default function PartnerDashboard() {
  const { session, partner } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const isIroning = partner?.partner_type === 'ironing' || partner?.partner_type === 'both'
  const isDelivery = partner?.partner_type === 'delivery' || partner?.partner_type === 'both'

  useEffect(() => {
    if (!session?.userId) return
    const query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20)

    if (isIroning && !isDelivery) {
      query.eq('assigned_ironing_partner_id', session.userId)
    } else if (isDelivery && !isIroning) {
      query.eq('assigned_delivery_partner_id', session.userId)
    } else {
      query.or(`assigned_ironing_partner_id.eq.${session.userId},assigned_delivery_partner_id.eq.${session.userId}`)
    }

    query.then(({ data }) => {
      if (data) setOrders(data)
      setLoading(false)
    })
  }, [session])

  const pending = orders.filter(o => ['pending', 'picked_up'].includes(o.status))
  const inProgress = orders.filter(o => ['in_progress', 'ready'].includes(o.status))
  const done = orders.filter(o => o.status === 'delivered')

  const updateStatus = async (orderId: string, status: string) => {
    const updates: Record<string, unknown> = { status }
    const now = new Date().toISOString()

    if (status === 'picked_up') updates.pickup_date = now
    if (status === 'in_progress') updates.ironing_started_at = now
    if (status === 'ready') updates.ironing_completed_at = now
    if (status === 'delivered') { updates.delivery_started_at = now; updates.delivery_completed_at = now }

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates, status: status as Order['status'] } : o))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>
            Partner Dashboard
          </h1>
          <p style={{ color: 'var(--neutral-500)' }}>
            {partner?.full_name} · {partner?.partner_type} partner
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Pending" value={pending.length} icon={Clock} color="var(--warning-500)" />
          <StatCard label="In Progress" value={inProgress.length} icon={Package} color="var(--accent-500)" />
          <StatCard label="Completed" value={done.length} icon={CheckCircle} color="var(--success-600)" />
          <StatCard label="Total" value={orders.length} icon={Truck} color="var(--primary-600)" />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ padding: 64, textAlign: 'center' }}>
            <Package size={48} color="var(--neutral-300)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-600)' }}>No orders assigned</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(order => {
              const { label, className } = statusBadge(order.status)
              const nextStatus = getNextStatus(order.status, partner?.partner_type || 'both')
              return (
                <div key={order.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: 14 }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className={`badge ${className}`}>{label}</span>
                      <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{order.service_type}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--neutral-500)' }}>
                      Pickup: {formatDate(order.pickup_date)} · ₹{order.total_amount}
                    </p>
                  </div>
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(order.id, nextStatus.value)}
                      className="btn btn-primary btn-sm"
                    >
                      {nextStatus.label}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getNextStatus(current: string, type: string): { label: string; value: string } | null {
  if (current === 'pending') return { label: 'Mark Picked Up', value: 'picked_up' }
  if (current === 'picked_up' && (type === 'ironing' || type === 'both')) return { label: 'Start Ironing', value: 'in_progress' }
  if (current === 'in_progress') return { label: 'Mark Ready', value: 'ready' }
  if (current === 'ready' && (type === 'delivery' || type === 'both')) return { label: 'Mark Delivered', value: 'delivered' }
  return null
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
