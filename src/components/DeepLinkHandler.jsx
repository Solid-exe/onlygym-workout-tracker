import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '../lib/supabase';

/**
 * Ascolta i deep link (es. com.onlygym.app://auth/callback) inviati dal sistema operativo
 * al completamento dell'autenticazione OAuth da browser esterno.
 */
export default function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let isSubscribed = true;

        const processUrl = async (url) => {
            if (!url) return;
            console.log('[DeepLinkHandler] App URL open event:', url);

            // Chiudi il browser in-app/custom tab se era aperto per il login
            try {
                await Browser.close();
            } catch {
                // Nessun browser aperto da chiudere
            }

            // Verifica se il deep link riguarda l'autenticazione
            if (
                url.includes('auth/callback') ||
                url.includes('access_token') ||
                url.includes('code=') ||
                url.includes('error=')
            ) {
                try {
                    // Gestione di errori restituiti dal provider OAuth
                    if (url.includes('error=')) {
                        const errorMatch = url.match(/[?&#]error_description=([^&#]*)/) || url.match(/[?&#]error=([^&#]*)/);
                        const errorMsg = errorMatch ? decodeURIComponent(errorMatch[1].replace(/\+/g, ' ')) : 'Autenticazione annullata o fallita';
                        console.warn('[DeepLinkHandler] OAuth error from provider:', errorMsg);
                        if (isSubscribed) {
                            navigate('/login', { replace: true, state: { authError: errorMsg } });
                        }
                        return;
                    }

                    const safePromise = (promise, ms = 4000) =>
                        Promise.race([
                            promise,
                            new Promise((_, reject) => setTimeout(() => reject(new Error('DeepLink timeout')), ms))
                        ]);

                    // Caso 1: Token restituito nel fragment (#access_token=...&refresh_token=...)
                    if (url.includes('#')) {
                        const hashPart = url.split('#')[1];
                        if (hashPart) {
                            const hashParams = new URLSearchParams(hashPart);
                            const accessToken = hashParams.get('access_token');
                            const refreshToken = hashParams.get('refresh_token');

                            if (accessToken && refreshToken) {
                                try {
                                    const { data, error } = await safePromise(supabase.auth.setSession({
                                        access_token: accessToken,
                                        refresh_token: refreshToken
                                    }));
                                    if (!error && data?.session) {
                                        if (isSubscribed) navigate('/auth/callback', { replace: true });
                                        return;
                                    }
                                } catch (e) {
                                    console.warn('[DeepLinkHandler] setSession error/timeout:', e);
                                }
                            }
                        }
                    }

                    // Caso 2: Codice PKCE (?code=...)
                    // Normalizziamo lo schema in modo che new URL() possa analizzarlo
                    const normalizedUrl = url.replace(/^[a-zA-Z0-9._-]+:\/\//, 'https://app/');
                    const parsed = new URL(normalizedUrl);
                    const code = parsed.searchParams.get('code');

                    if (code) {
                        try {
                            const { data, error } = await safePromise(supabase.auth.exchangeCodeForSession(code));
                            if (!error && data?.session) {
                                if (isSubscribed) navigate('/auth/callback', { replace: true });
                                return;
                            }
                        } catch (e) {
                            console.warn('[DeepLinkHandler] exchangeCodeForSession error/timeout:', e);
                        }
                    }

                    // Fallback: reindirizza alla callback per lasciare a Supabase la risoluzione
                    if (isSubscribed) navigate('/auth/callback', { replace: true });
                } catch (err) {
                    console.error('[DeepLinkHandler] Errore elaborazione deep link:', err);
                    if (isSubscribed) navigate('/auth/callback', { replace: true });
                }
            }
        };

        const setupListener = async () => {
            const listener = await CapApp.addListener('appUrlOpen', (event) => {
                processUrl(event.url);
            });

            // Se l'app è stata aperta direttamente (cold start) tramite deep link
            try {
                const launchUrl = await CapApp.getLaunchUrl();
                if (launchUrl?.url) {
                    processUrl(launchUrl.url);
                }
            } catch (e) {
                console.debug('[DeepLinkHandler] getLaunchUrl skipped:', e);
            }

            return listener;
        };

        const listenerPromise = setupListener();

        return () => {
            isSubscribed = false;
            listenerPromise.then(l => l && l.remove()).catch(() => {});
        };
    }, [navigate]);

    return null;
}
