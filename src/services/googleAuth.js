import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from '../lib/supabase';

/**
 * Avvia il login o la registrazione con Google OAuth.
 * 
 * - Su Web: Reindirizza la finestra corrente a `${window.location.origin}/auth/callback`.
 * - Su App Nativa (Android / iOS):
 *   Usa come URL di ritorno il custom scheme registrato dall'app (`com.onlygym.app://auth/callback`),
 *   imposta `skipBrowserRedirect: true` per ottenere l'URL di autorizzazione da Supabase
 *   e apre il browser di sistema / Chrome Custom Tab via `@capacitor/browser`.
 */
export const startGoogleAuth = async () => {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative
        ? 'com.onlygym.app://auth/callback'
        : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
            skipBrowserRedirect: isNative,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        }
    });

    if (error) throw error;

    // Se siamo su app nativa, apri il browser di sistema con l'URL generato da Supabase
    if (isNative && data?.url) {
        await Browser.open({
            url: data.url,
            windowName: '_system'
        });
    }

    return data;
};
