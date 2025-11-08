import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a custom storage handler that checks both localStorage and sessionStorage
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    // First check sessionStorage (for non-persistent sessions)
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
    // Then check localStorage (for persistent sessions)
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    // Check if we should use sessionStorage (indicated by a flag)
    const useSessionStorage = window.sessionStorage.getItem('use-session-storage') === 'true';
    if (useSessionStorage) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          storage: customStorage,
          storageKey: `sb-${projectId}-auth-token`,
          autoRefreshToken: true,
          persistSession: true,
        }
      }
    );
  }
  return supabaseClient;
}

export function setSessionPersistence(persistent: boolean) {
  if (typeof window === 'undefined') return;
  if (persistent) {
    window.sessionStorage.removeItem('use-session-storage');
  } else {
    window.sessionStorage.setItem('use-session-storage', 'true');
  }
}
