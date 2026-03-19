import { supabase } from './supabase';
import { User } from '../types/index';

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
const setSession = (token: string, user: User) => {
  localStorage.setItem('session_token', token);
  localStorage.setItem('current_user', JSON.stringify(user));
};

// Get session from localStorage
const getSession = (): { token: string; user: User } | null => {
  const token = localStorage.getItem('session_token');
  const userStr = localStorage.getItem('current_user');
  
  if (!token || !userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch {
    return null;
  }
};

// Clear session
const clearSession = () => {
  localStorage.removeItem('session_token');
  localStorage.removeItem('current_user');
};

export const auth = {
  // Sign up a new user
  signUp: async (username: string, password: string): Promise<{ user: User; error?: string }> => {
    try {
      const passwordHash = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username,
          full_name: null,
          email: null,
          password_hash: passwordHash,
          phone: null,
          society_id: null,
          tower_id: null,
          flat_id: null,
          adults: 2,
          kids: 0,
          pickup_slot: 'morning',
          delivery_slot: 'evening'
        })
        .select(`
          *,
          societies(name),
          towers(name),
          flats(number)
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { user: {} as User, error: 'Username already exists' };
        }
        throw error;
      }

      const user: User = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        society_id: data.society_id,
        tower_id: data.tower_id,
        flat_id: data.flat_id,
        adults: data.adults,
        kids: data.kids,
        pickup_slot: data.pickup_slot as 'morning' | 'evening',
        delivery_slot: data.delivery_slot as 'morning' | 'evening',
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
        flat_number: data.flats?.number,
      };

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      setSession(sessionToken, user);
      return { user };
    } catch (error: any) {
      return { user: {} as User, error: error.message };
    }
  },

  // Sign in an existing user
  signIn: async (username: string, password: string): Promise<{ user: User; error?: string }> => {
    try {
      const passwordHash = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          societies(name),
          towers(name),
          flats(number)
        `)
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (error || !data) {
        return { user: {} as User, error: 'Invalid username or password' };
      }

      const user: User = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        society_id: data.society_id,
        tower_id: data.tower_id,
        flat_id: data.flat_id,
        adults: data.adults,
        kids: data.kids,
        pickup_slot: data.pickup_slot as 'morning' | 'evening',
        delivery_slot: data.delivery_slot as 'morning' | 'evening',
        society_name: data.societies?.name,
        tower_name: data.towers?.name,
        flat_number: data.flats?.number,
      };

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        });

      setSession(sessionToken, user);
      return { user };
    } catch (error: any) {
      return { user: {} as User, error: error.message };
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const session = getSession();
    if (session) {
      try {
        // Remove session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', session.token);
      } catch (error) {
        console.error('Error removing session from database:', error);
      }
    }
    clearSession();
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const session = getSession();
    if (!session) return null;

    // Verify session is still valid
    const { data } = await supabase
      .from('user_sessions')
      .select('expires_at')
      .eq('session_token', session.token)
      .maybeSingle();

    if (!data || new Date(data.expires_at) < new Date()) {
      clearSession();
      return null;
    }

    return session.user;
  },

  // Validate session token
  validateSession: async (token: string): Promise<User | null> => {
    const { data } = await supabase
      .from('user_sessions')
      .select(`
        user_id,
        expires_at,
        users!inner(
          *,
          societies(name),
          towers(name),
          flats(number)
        )
      `)
      .eq('session_token', token)
      .maybeSingle();

    if (!data || new Date(data.expires_at) < new Date()) {
      return null;
    }

    const userData = data.users;
    return {
      id: userData.id,
      full_name: userData.full_name,
      email: userData.email,
      username: userData.username,
      phone: userData.phone,
      society_id: userData.society_id,
      tower_id: userData.tower_id,
      flat_id: userData.flat_id,
      adults: userData.adults,
      kids: userData.kids,
      pickup_slot: userData.pickup_slot as 'morning' | 'evening',
      delivery_slot: userData.delivery_slot as 'morning' | 'evening',
      society_name: userData.societies?.name,
      tower_name: userData.towers?.name,
      flat_number: userData.flats?.number,
    };
  },

  // Reset function to clear all session data
  resetSession: () => {
    clearSession();
    console.log('Session reset - all local data cleared');
  }
};