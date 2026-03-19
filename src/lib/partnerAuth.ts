import { supabase } from './supabase';
import { Partner } from '../types/index';

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Generate a random session token
const generateSessionToken = (): string => {
  return crypto.randomUUID() + '-' + Date.now();
};

// Store session in localStorage
const setPartnerSession = (token: string, partner: Partner) => {
  localStorage.setItem('partner_session_token', token);
  localStorage.setItem('current_partner', JSON.stringify(partner));
};

// Get session from localStorage
const getPartnerSession = (): { token: string; partner: Partner } | null => {
  const token = localStorage.getItem('partner_session_token');
  const partnerStr = localStorage.getItem('current_partner');
  
  if (!token || !partnerStr) return null;
  
  try {
    const partner = JSON.parse(partnerStr);
    return { token, partner };
  } catch {
    return null;
  }
};

// Clear session
const clearPartnerSession = () => {
  localStorage.removeItem('partner_session_token');
  localStorage.removeItem('current_partner');
};

export const partnerAuth = {
  // Sign up a new partner
  signUp: async (username: string, password: string, partnerType: 'ironing' | 'delivery' | 'both'): Promise<{ partner: Partner; error?: string }> => {
    try {
      const passwordHash = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('partners')
        .insert({
          username,
          password_hash: passwordHash,
          partner_type: partnerType,
          full_name: null,
          email: null,
          phone: null,
          society_id: null,
          tower_id: null,
          identity_type: 'aadhar',
          identity_number: '',
          identity_document_url: null,
          working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          holiday_day: 'sunday',
          status: 'approved'
        })
        .select(`
          *,
          societies(name),
          towers(name)
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { partner: {} as Partner, error: 'Username already exists' };
        }
        throw error;
      }

      const partner: Partner = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        partner_type: data.partner_type,
        society_id: data.society_id,
        tower_id: data.tower_id,
        identity_type: data.identity_type,
        identity_number: data.identity_number,
        identity_document_url: data.identity_document_url,
        working_days: data.working_days,
        holiday_day: data.holiday_day,
        status: data.status,
        created_at: data.created_at,
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
      };

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await supabase
        .from('partner_sessions')
        .insert({
          partner_id: partner.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      setPartnerSession(sessionToken, partner);
      return { partner };
    } catch (error: any) {
      return { partner: {} as Partner, error: error.message };
    }
  },

  // Sign in an existing partner
  signIn: async (username: string, password: string): Promise<{ partner: Partner; error?: string }> => {
    try {
      const passwordHash = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          societies(name),
          towers(name)
        `)
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (error || !data) {
        return { partner: {} as Partner, error: 'Invalid username or password' };
      }

      const partner: Partner = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        partner_type: data.partner_type,
        society_id: data.society_id,
        tower_id: data.tower_id,
        identity_type: data.identity_type,
        identity_number: data.identity_number,
        identity_document_url: data.identity_document_url,
        working_days: data.working_days,
        holiday_day: data.holiday_day,
        status: data.status,
        created_at: data.created_at,
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
      };

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await supabase
        .from('partner_sessions')
        .insert({
          partner_id: partner.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      setPartnerSession(sessionToken, partner);
      return { partner };
    } catch (error: any) {
      return { partner: {} as Partner, error: error.message };
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const session = getPartnerSession();
    if (session) {
      try {
        // Remove session from database
        await supabase
          .from('partner_sessions')
          .delete()
          .eq('session_token', session.token);
      } catch (error) {
        console.error('Error removing partner session from database:', error);
      }
    }
    clearPartnerSession();
  },

  // Get current partner
  getCurrentPartner: async (): Promise<Partner | null> => {
    const session = getPartnerSession();
    if (!session) return null;

    // Verify session is still valid
    const { data } = await supabase
      .from('partner_sessions')
      .select('expires_at')
      .eq('session_token', session.token)
      .maybeSingle();

    if (!data || new Date(data.expires_at) < new Date()) {
      clearPartnerSession();
      return null;
    }

    return session.partner;
  },

  // Reset function to clear all session data
  resetSession: () => {
    clearPartnerSession();
    console.log('Partner session reset - all local data cleared');
  }
};