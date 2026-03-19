import { supabase } from './supabase'
import { AuthSession } from '../types'

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(16)
}

function generateToken(): string {
  return crypto.randomUUID() + '-' + Date.now()
}

export async function loginUser(phone: string, password: string): Promise<AuthSession> {
  const passwordHash = hashPassword(password)
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .eq('password_hash', passwordHash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!user) throw new Error('Invalid phone number or password')

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('user_sessions').insert({
    user_id: user.id,
    session_token: token,
    expires_at: expiresAt,
  })

  return { userId: user.id, token, role: 'user', userData: user }
}

export async function registerUser(data: {
  full_name: string
  phone: string
  email: string
  password: string
  society_id: string
  tower_id: string
  flat_id: string
  adults: number
  kids: number
  pickup_slot: 'morning' | 'evening'
  delivery_slot: 'morning' | 'evening'
}): Promise<AuthSession> {
  const { password, ...rest } = data
  const password_hash = hashPassword(password)

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', data.phone)
    .maybeSingle()

  if (existing) throw new Error('Phone number already registered')

  const { data: user, error } = await supabase
    .from('users')
    .insert({ ...rest, password_hash })
    .select()
    .single()

  if (error) throw new Error(error.message)

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('user_sessions').insert({
    user_id: user.id,
    session_token: token,
    expires_at: expiresAt,
  })

  return { userId: user.id, token, role: 'user', userData: user }
}

export async function loginPartner(username: string, password: string): Promise<AuthSession> {
  const passwordHash = hashPassword(password)
  const { data: partner, error } = await supabase
    .from('partners')
    .select('*')
    .eq('username', username)
    .eq('password_hash', passwordHash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!partner) throw new Error('Invalid username or password')
  if (partner.status !== 'approved') throw new Error('Your account is pending approval')

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('partner_sessions').insert({
    partner_id: partner.id,
    session_token: token,
    expires_at: expiresAt,
  })

  return { userId: partner.id, token, role: 'partner', userData: partner }
}

export async function loginAdmin(username: string, password: string): Promise<AuthSession> {
  if (username === 'admin' && password === 'admin123') {
    return { userId: 'admin', token: 'admin-token', role: 'admin' }
  }
  throw new Error('Invalid admin credentials')
}
