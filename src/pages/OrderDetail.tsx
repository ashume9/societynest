import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Order, OrderItem, ClothingType } from '../types'
import { statusBadge, formatDate, formatDateTime } from '../lib/utils'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'

interface OrderItemWithType extends OrderItem {
  clothing_types: ClothingType | null
}

const STATUS_STEPS = ['pending', 'picked_up', 'in_progress', 'ready', 'delivered']

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItemWithType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('orders').select('*').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('*, clothing_types(*)').eq('order_id', id),
    ]).then(([{ data: order }, { data: items }]) => {
      if (order) setOrder(order)
      if (items) setItems(items as OrderItemWithType[])
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--neutral-600)' }}>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Orders</Link>
      </div>
    </div>
  )

  const { label, className } = statusBadge(order.status)
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--neutral-500)', fontSize: 14, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--neutral-800)' }}>
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <span className={`badge ${className}`}>{label}</span>
            </div>
            <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 24 }}>Order Progress</h2>
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              const icons = [Clock, Package, Package, CheckCircle, Truck]
              const Icon = icons[i]
              return (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute', top: 20, left: '50%', right: '-50%',
                      height: 2, background: i < currentStep ? 'var(--primary-500)' : 'var(--neutral-200)',
                      zIndex: 0,
                    }} />
                  )}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: done ? 'var(--primary-600)' : 'white',
                    border: `2px solid ${done ? 'var(--primary-600)' : 'var(--neutral-300)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, position: 'relative',
                    boxShadow: active ? '0 0 0 4px rgba(59,130,246,0.2)' : undefined,
                  }}>
                    <Icon size={18} color={done ? 'white' : 'var(--neutral-400)'} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 500, textAlign: 'center', color: done ? 'var(--primary-700)' : 'var(--neutral-400)', textTransform: 'capitalize' }}>
                    {step.replace('_', ' ')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Order Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DetailRow label="Service Type" value={<span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{order.service_type}</span>} />
              <DetailRow label="Pickup Date" value={formatDate(order.pickup_date)} />
              <DetailRow label="Pickup Slot" value={<span style={{ textTransform: 'capitalize' }}>{order.pickup_slot}</span>} />
              <DetailRow label="Est. Delivery" value={formatDateTime(order.estimated_delivery)} />
              {order.ironing_started_at && <DetailRow label="Ironing Started" value={formatDateTime(order.ironing_started_at)} />}
              {order.ironing_completed_at && <DetailRow label="Ironing Done" value={formatDateTime(order.ironing_completed_at)} />}
              {order.delivery_started_at && <DetailRow label="Out for Delivery" value={formatDateTime(order.delivery_started_at)} />}
              {order.delivery_completed_at && <DetailRow label="Delivered At" value={formatDateTime(order.delivery_completed_at)} />}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--neutral-600)' }}>
                    {item.clothing_types?.name || 'Item'} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 500 }}>₹{item.subtotal}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary-700)' }}>₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--neutral-500)' }}>{label}</span>
      <span style={{ color: 'var(--neutral-800)' }}>{value}</span>
    </div>
  )
}
