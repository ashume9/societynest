import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ClothingType } from '../types'
import { ArrowRight } from 'lucide-react'

export default function Pricing() {
  const [items, setItems] = useState<ClothingType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('clothing_types').select('*').order('name').then(({ data }) => {
      if (data) setItems(data)
      setLoading(false)
    })
  }, [])

  const uniqueItems = items.filter((item, idx, arr) =>
    arr.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase()) === idx
  )

  return (
    <div className="page">
      <section style={{ background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)', color: 'white', padding: '64px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>Simple, Transparent Pricing</h1>
          <p style={{ opacity: 0.85, fontSize: 18, maxWidth: 480, margin: '0 auto' }}>
            No hidden fees. Pay only for what you iron.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 64, maxWidth: 800, margin: '0 auto 64px' }}>
            {[
              { name: 'Normal', desc: '2–3 day turnaround', color: 'var(--primary-600)', bg: 'var(--primary-50)', highlight: false },
              { name: 'Priority', desc: 'Next day delivery', color: 'var(--accent-600)', bg: 'var(--accent-50)', highlight: true },
              { name: 'Express', desc: 'Same-day service', color: 'var(--error-600)', bg: 'var(--error-50)', highlight: false },
            ].map(({ name, desc, color, bg, highlight }) => (
              <div key={name} className="card" style={{
                padding: 24, textAlign: 'center',
                border: highlight ? `2px solid ${color}` : undefined,
                position: 'relative',
              }}>
                {highlight && (
                  <div className="badge" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: color, color: 'white', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: color }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>{name}</h3>
                <p style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{desc}</p>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', color: 'var(--neutral-800)', marginBottom: 32 }}>
            Per Item Rates (₹)
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--neutral-50)', borderBottom: '2px solid var(--neutral-200)' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--neutral-600)' }}>Item</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--primary-600)' }}>Normal</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent-600)' }}>Priority</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--error-600)' }}>Express</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueItems.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i < uniqueItems.length - 1 ? '1px solid var(--neutral-100)' : undefined }}>
                      <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--neutral-800)' }}>{item.name}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--primary-700)', fontWeight: 600 }}>₹{item.normal_rate}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--accent-600)', fontWeight: 600 }}>₹{item.priority_rate}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center', color: 'var(--error-600)', fontWeight: 600 }}>₹{item.express_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Ordering <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
