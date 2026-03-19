import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Package, Briefcase, Building } from 'lucide-react'

interface Stats {
  users: number
  orders: number
  partners: number
  societies: number
  pendingOrders: number
  deliveredOrders: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ users: 0, orders: 0, partners: 0, societies: 0, pendingOrders: 0, deliveredOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('partners').select('id', { count: 'exact', head: true }),
      supabase.from('societies').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
    ]).then(([u, o, p, s, po, del]) => {
      setStats({
        users: u.count || 0,
        orders: o.count || 0,
        partners: p.count || 0,
        societies: s.count || 0,
        pendingOrders: po.count || 0,
        deliveredOrders: del.count || 0,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 8 }}>Admin Overview</h1>
      <p style={{ color: 'var(--neutral-500)', marginBottom: 32 }}>Platform-wide metrics at a glance</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard label="Total Users" value={stats.users} icon={Users} color="var(--primary-600)" />
        <StatCard label="Total Orders" value={stats.orders} icon={Package} color="var(--accent-500)" />
        <StatCard label="Partners" value={stats.partners} icon={Briefcase} color="var(--success-600)" />
        <StatCard label="Societies" value={stats.societies} icon={Building} color="#8b5cf6" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Package} color="var(--warning-500)" />
        <StatCard label="Delivered" value={stats.deliveredOrders} icon={Package} color="var(--success-600)" />
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
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)' }}>{value}</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{label}</div>
        </div>
      </div>
    </div>
  )
}
