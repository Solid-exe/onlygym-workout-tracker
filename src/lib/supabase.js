import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

// ⚙️ CONFIGURAZIONE SUPABASE
// Dopo aver creato il progetto su https://supabase.com
// Vai su: Project Settings → API
// Copia questi valori:

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kmuovijjgivwupluuruh.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdW92aWpqZ2l2d3VwbHV1cnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzIwODAsImV4cCI6MjA4NjMwODA4MH0.81BtKuXTM15XuoE5PzWjwCzIwL5WbjQtqhWkMd3t_b4'

// Custom Storage Adapter implementation for robust mobile support
const SafeStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('LocalStorage unavailable:', e);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('LocalStorage write failed:', e);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage remove failed:', e);
        }
    }
};

// Crea client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Su native Capacitor i token arrivano via deep link (@capacitor/app),
        // mentre su Web window.location contiene i parametri del redirect
        detectSessionInUrl: !Capacitor.isNativePlatform(),
        storage: SafeStorage,
        // Bypassa navigator.locks per prevenire deadlock/freeze all'infinito su Android WebView e Chromium
        lock: async (_name, _acquireTimeout, fn) => await fn()
    }
})

// Helper per debug (solo in development)
if (import.meta.env.DEV) console.log('🔌 Supabase client inizializzato:', SUPABASE_URL)

// Export URL per compatibilità con vecchio codice
export const API_URL = SUPABASE_URL
export const getApiUrl = () => SUPABASE_URL
