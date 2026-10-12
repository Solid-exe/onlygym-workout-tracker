import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile, authToken } = useStore();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            // Pagine pubbliche: nessun controllo necessario
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback', '/gym-code', '/privacy'];
            if (publicPaths.includes(location.pathname)) {
                if (isMounted) setChecking(false);
                return;
            }

            try {
                // Timeout di sicurezza (max 2 secondi) per non bloccare mai la schermata su mobile lento
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 2000));
                const res = await Promise.race([sessionPromise, timeoutPromise]);

                if (!isMounted) return;

                if (res && res.data && res.data.session) {
                    const session = res.data.session;
                    const isOAuthUser = session.user?.app_metadata?.provider !== 'email';
                    if (!isOAuthUser && userProfile.emailVerified === false) {
                        navigate('/verify-email');
                    }
                } else if (!res?.timeout) {
                    // Nessuna sessione attiva: reindirizza al login
                    navigate('/login');
                } else if (!authToken && !userProfile.email) {
                    // Timeout senza token salvato nello store locale
                    navigate('/login');
                }
            } catch (error) {
                console.warn("[AuthGuard] Errore verifica sessione, procedo con fallback locale:", error);
                if (!authToken && !userProfile.email) {
                    navigate('/login');
                }
            } finally {
                if (isMounted) setChecking(false);
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [location.pathname, navigate, userProfile.emailVerified, authToken, userProfile.email]);

    // Mostra indicatore pulito durante il check (massimo 2s)
    if (checking) return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
            <div className="w-10 h-10 rounded-full animate-spin border-[3px] border-slate-700 border-t-primary mb-3" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Caricamento...</p>
        </div>
    );

    return children;
}
