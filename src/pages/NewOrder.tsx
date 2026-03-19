import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ClothingType } from '../types'
import { Plus, Minus, ShoppingCart } from 'lucide-react'

interface CartItem {
  clothing_type_id: string
  name: string
  quantity: number
  rate: number
  subtotal: number
}

export default function NewOrder() {
  const { session, user } = useAuth()
  const navigate = useNavigate()

  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
  const [serviceType, setServiceType] = useState<'normal' | 'priority' | 'express'>('normal')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupSlot, setPickupSlot] = useState<'morning' | 'evening'>(user?.pickup_slot || 'morning')
  const [cart, setCart] = useState<CartItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('clothing_types').select('*').order('name').then(({ data }) => {
      if (data) {
        const unique = data.filter((item, idx, arr) =>
          arr.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase()) === idx
        )
        setClothingTypes(unique)
      }
    })
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setPickupDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const getRate = (item: ClothingType) => {
    if (serviceType === 'priority') return item.priority_rate
    if (serviceType === 'express') return item.express_rate
    return item.normal_rate
  }

  const addToCart = (item: ClothingType) => {
    setCart(prev => {
      const existing = prev.find(c => c.clothing_type_id === item.id)
      const rate = getRate(item)
      if (existing) {
        return prev.map(c => c.clothing_type_id === item.id
          ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * rate }
          : c
        )
      }
      return [...prev, { clothing_type_id: item.id, name: item.name, quantity: 1, rate, subtotal: rate }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.clothing_type_id === id)
      if (!existing) return prev
      if (existing.quantity <= 1) return prev.filter(c => c.clothing_type_id !== id)
      return prev.map(c => c.clothing_type_id === id
        ? { ...c, quantity: c.quantity - 1, subtotal: (c.quantity - 1) * c.rate }
        : c
      )
    })
  }

  useEffect(() => {
    setCart(prev => prev.map(c => {
      const type = clothingTypes.find(t => t.id === c.clothing_type_id)
      if (!type) return c
      const rate = getRate(type)
      return { ...c, rate, subtotal: c.quantity * rate }
    }))
  }, [serviceType])

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const estimatedDelivery = () => {
    if (!pickupDate) return ''
    const d = new Date(pickupDate)
    const days = serviceType === 'express' ? 0 : serviceType === 'priority' ? 1 : 2
    d.setDate(d.getDate() + days)
    d.setHours(pickupSlot === 'morning' ? 20 : 10)
    return d.toISOString()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (cart.length === 0) { setError('Please add at least one item'); return }
    if (!session?.userId) { setError('Please login first'); return }
    setLoading(true)
    try {
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .insert({
          user_id: session.userId,
          pickup_date: pickupDate,
          pickup_slot: pickupSlot,
          service_type: serviceType,
          total_amount: total,
          estimated_delivery: estimatedDelivery(),
          status: 'pending',
        })
        .select()
        .single()

      if (oErr) throw new Error(oErr.message)

      const items = cart.map(c => ({
        order_id: order.id,
        clothing_type_id: c.clothing_type_id,
        quantity: c.quantity,
        rate: c.rate,
        subtotal: c.subtotal,
      }))

      const { error: iErr } = await supabase.from('order_items').insert(items)
      if (iErr) throw new Error(iErr.message)

      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const getQty = (id: string) => cart.find(c => c.clothing_type_id === id)?.quantity || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>New Order</h1>
        <p style={{ color: 'var(--neutral-500)', marginBottom: 32 }}>Select your clothing items and service type</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Service Type</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {(['normal', 'priority', 'express'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      style={{
                        padding: '12px 8px', borderRadius: 8, border: '2px solid',
                        borderColor: serviceType === type
                          ? (type === 'express' ? 'var(--error-500)' : type === 'priority' ? 'var(--accent-500)' : 'var(--primary-500)')
                          : 'var(--neutral-200)',
                        background: serviceType === type
                          ? (type === 'express' ? 'var(--error-50)' : type === 'priority' ? 'var(--accent-50)' : 'var(--primary-50)')
                          : 'white',
                        textAlign: 'center', cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-800)', textTransform: 'capitalize' }}>{type}</div>
                      <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 2 }}>
                        {type === 'normal' ? '2–3 days' : type === 'priority' ? 'Next day' : 'Same day'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Pickup Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Pickup Date</label>
                    <input className="input" type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Pickup Slot</label>
                    <select className="input" value={pickupSlot} onChange={e => setPickupSlot(e.target.value as 'morning' | 'evening')}>
                      <option value="morning">Morning (7am–11am)</option>
                      <option value="evening">Evening (6pm–9pm)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20 }}>Select Items</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {clothingTypes.map(item => {
                    const qty = getQty(item.id)
                    const rate = getRate(item)
                    return (
                      <div key={item.id} className="card" style={{ padding: 16, border: qty > 0 ? '2px solid var(--primary-400)' : undefined }}>
                        <div style={{ fontWeight: 500, color: 'var(--neutral-800)', marginBottom: 4 }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--neutral-500)', marginBottom: 12 }}>₹{rate} each</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            disabled={qty === 0}
                            style={{
                              width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--neutral-200)',
                              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: qty === 0 ? 'not-allowed' : 'pointer', opacity: qty === 0 ? 0.4 : 1,
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center', color: 'var(--neutral-800)' }}>{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            style={{
                              width: 30, height: 30, borderRadius: '50%', border: 'none',
                              background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: 'white',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ position: 'sticky', top: 84 }}>
              <div className="card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={18} /> Order Summary
                </h2>
                {cart.length === 0 ? (
                  <p style={{ color: 'var(--neutral-400)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                    No items added yet
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                      {cart.map(c => (
                        <div key={c.clothing_type_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                          <span style={{ color: 'var(--neutral-600)' }}>{c.name} × {c.quantity}</span>
                          <span style={{ fontWeight: 500 }}>₹{c.subtotal}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--primary-700)' }}>₹{total}</span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 20 }}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? <span className="spinner" /> : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
