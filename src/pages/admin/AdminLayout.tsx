import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Users, Briefcase, DollarSign, ShoppingBag } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()

  const links = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/orders', label: 'Orders', icon: Package },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/partners', label: 'Partners', icon: Briefcase },
    { to: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  ]

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <aside style={{
        width: 240, background: 'var(--neutral-900)', flexShrink: 0,
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>SocietyXpress</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {links.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                  color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  fontSize: 14, fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px 32px', maxWidth: 1200 }}>
        <Outlet />
      </main>
    </div>
  )
}
