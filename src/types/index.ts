export interface Society {
  id: string
  name: string
  created_at: string
}

export interface Tower {
  id: string
  society_id: string
  name: string
  created_at: string
}

export interface Flat {
  id: string
  tower_id: string
  number: string
  created_at: string
}

export interface User {
  id: string
  username: string | null
  phone: string | null
  society_id: string | null
  tower_id: string | null
  flat_id: string | null
  adults: number
  kids: number
  pickup_slot: 'morning' | 'evening'
  delivery_slot: 'morning' | 'evening'
  created_at: string
  full_name: string | null
  email: string | null
}

export interface Partner {
  id: string
  username: string
  full_name: string | null
  email: string | null
  phone: string | null
  partner_type: 'ironing' | 'delivery' | 'both'
  society_id: string | null
  tower_id: string | null
  identity_type: 'aadhar' | 'pan' | 'passport' | 'election_card'
  identity_number: string
  identity_document_url: string | null
  working_days: string[]
  holiday_day: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface ClothingType {
  id: string
  name: string
  normal_rate: number
  priority_rate: number
  express_rate: number
  created_at: string
}

export interface Order {
  id: string
  user_id: string | null
  pickup_date: string
  pickup_slot: 'morning' | 'evening'
  service_type: 'normal' | 'priority' | 'express'
  total_amount: number
  estimated_delivery: string
  status: 'pending' | 'picked_up' | 'in_progress' | 'ready' | 'delivered'
  created_at: string
  assigned_ironing_partner_id: string | null
  ironing_started_at: string | null
  ironing_completed_at: string | null
  assigned_delivery_partner_id: string | null
  delivery_started_at: string | null
  delivery_completed_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string | null
  clothing_type_id: string | null
  quantity: number
  rate: number
  subtotal: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  order_id: string | null
  message: string
  type: 'order_update' | 'general'
  read: boolean
  created_at: string
}

export interface AuthSession {
  userId: string
  token: string
  role: 'user' | 'partner' | 'admin'
  userData?: User | Partner
}
