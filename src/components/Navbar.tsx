import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Bell, Menu, X, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { session, user, partner, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--neutral-200)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={20} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-700)' }}>
            Society<span style={{ color: 'var(--accent-500)' }}>Xpress</span>
          </span>
        </Link>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, marginLeft: 16 }}>
          {!session && (
            <>
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <NavLink to="/pricing" active={isActive('/pricing')}>Pricing</NavLink>
            </>
          )}
          {session?.role === 'user' && (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to="/order/new" active={isActive('/order/new')}>New Order</NavLink>
              <NavLink to="/orders" active={isActive('/orders')}>My Orders</NavLink>
            </>
          )}
          {session?.role === 'partner' && (
            <>
              <NavLink to="/partner/dashboard" active={isActive('/partner/dashboard')}>Dashboard</NavLink>
              <NavLink to="/partner/orders" active={isActive('/partner/orders')}>Orders</NavLink>
            </>
          )}
          {session?.role === 'admin' && (
            <>
              <NavLink to="/admin" active={isActive('/admin')}>Overview</NavLink>
              <NavLink to="/admin/orders" active={isActive('/admin/orders')}>Orders</NavLink>
              <NavLink to="/admin/users" active={isActive('/admin/users')}>Users</NavLink>
              <NavLink to="/admin/partners" active={isActive('/admin/partners')}>Partners</NavLink>
              <NavLink to="/admin/pricing" active={isActive('/admin/pricing')}>Pricing</NavLink>
            </>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {!session ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
              {session.role === 'user' && (
                <Link to="/notifications" style={{ padding: 8, display: 'inline-flex', color: 'var(--neutral-500)' }}>
                  <Bell size={20} />
                </Link>
              )}
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--neutral-200)',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--neutral-700)',
                }}
              >
                <User size={16} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.full_name || partner?.full_name || 'Admin'}
                </span>
                <ChevronDown size={14} />
              </button>
              {dropOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'white', border: '1px solid var(--neutral-200)',
                  borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                  minWidth: 160, zIndex: 200, overflow: 'hidden',
                }}>
                  {session.role === 'user' && (
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--neutral-700)' }}
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 16px',
                      fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                      color: 'var(--error-600)', cursor: 'pointer', background: 'none', border: 'none',
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: 8, color: 'var(--neutral-600)', display: 'none' }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--neutral-200)',
          background: 'white',
          padding: '12px 24px',
        }}>
          {!session && (
            <>
              <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</MobileNavLink>
            </>
          )}
          {session?.role === 'user' && (
            <>
              <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink to="/order/new" onClick={() => setMenuOpen(false)}>New Order</MobileNavLink>
              <MobileNavLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</MobileNavLink>
              <MobileNavLink to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</MobileNavLink>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        color: active ? 'var(--primary-600)' : 'var(--neutral-600)',
        background: active ? 'var(--primary-50)' : 'transparent',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'block', padding: '10px 0', fontSize: 15,
        color: 'var(--neutral-700)', borderBottom: '1px solid var(--neutral-100)',
      }}
    >
      {children}
    </Link>
  )
}
