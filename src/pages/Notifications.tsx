import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Notification } from '../types'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDateTime } from '../lib/utils'

export default function Notifications() {
  const { session } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.userId) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data)
        setLoading(false)
      })
  }, [session])

  const markAllRead = async () => {
    if (!session?.userId) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.userId)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neutral-50)' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--neutral-800)', marginBottom: 4 }}>Notifications</h1>
            {unread > 0 && <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ padding: 64, textAlign: 'center' }}>
            <Bell size={48} color="var(--neutral-300)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--neutral-600)', marginBottom: 8 }}>No notifications</h3>
            <p style={{ color: 'var(--neutral-400)' }}>You'll see order updates here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  background: notif.read ? 'white' : 'var(--primary-50)',
                  borderColor: notif.read ? 'var(--neutral-200)' : 'var(--primary-200)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: notif.read ? 'var(--neutral-100)' : 'var(--primary-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={16} color={notif.read ? 'var(--neutral-400)' : 'var(--primary-600)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: 'var(--neutral-800)', marginBottom: 4 }}>{notif.message}</p>
                  <p style={{ fontSize: 12, color: 'var(--neutral-400)' }}>{formatDateTime(notif.created_at)}</p>
                </div>
                {!notif.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
