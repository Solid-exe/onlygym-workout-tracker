import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { loginFromServer } = useStore();
    const [status, setStatus] = useState("Completamento accesso...");

    useEffect(() => {
        let isMounted = true;

        // Timeout di sicurezza globale: se dopo 8 secondi nulla si è risolto, rimanda al login
        const globalTimer = setTimeout(() => {
            if (isMounted) {
                console.warn("[AuthCallback] Timeout globale raggiunto.");
                setStatus("Tempo scaduto per l'accesso. Reindirizzamento al login...");
                setTimeout(() => { if (isMounted) navigate("/login"); }, 1500);
            }
        }, 8000);

        const handleCallback = async () => {
            try {
                if (typeof window !== "undefined") {
                    const searchParams = new URLSearchParams(window.location.search);
                    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

                    // Controllo errori restituiti da Google o Supabase
                    const errorDesc = searchParams.get('error_description') || searchParams.get('error') || hashParams.get('error_description') || hashParams.get('error');
                    if (errorDesc) {
                        const cleanMsg = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
                        console.warn("[AuthCallback] Errore da provider:", cleanMsg);
                        if (isMounted) setStatus(`Errore autenticazione: ${cleanMsg}`);
                        clearTimeout(globalTimer);
                        setTimeout(() => { if (isMounted) navigate("/login"); }, 2500);
                        return;
                    }

                    // 1. Controllo fragment (#access_token=...&refresh_token=...)
                    if (window.location.hash && window.location.hash.includes("access_token")) {
                        const accessToken = hashParams.get("access_token");
                        const refreshToken = hashParams.get("refresh_token");
                        if (accessToken && refreshToken) {
                            try {
                                await supabase.auth.setSession({
                                    access_token: accessToken,
                                    refresh_token: refreshToken
                                });
                            } catch (e) {
                                console.warn("[AuthCallback] setSession fragment error:", e);
                            }
                        }
                    }

                    // 2. Controllo codice PKCE (?code=...)
                    const code = searchParams.get("code");
                    if (code) {
                        try {
                            await supabase.auth.exchangeCodeForSession(code);
                        } catch (e) {
                            // Se già scambiato da DeepLinkHandler o listener gotrue, procedi normalmente
                            console.warn("[AuthCallback] exchangeCodeForSession info:", e?.message);
                        }
                    }
                }

                // 3. Recupero sessione con timeout su ciascun tentativo
                let session = null;
                for (let attempt = 0; attempt < 4; attempt++) {
                    try {
                        const sessionPromise = supabase.auth.getSession();
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('timeout')), 2000)
                        );
                        const { data, error: sessionErr } = await Promise.race([sessionPromise, timeoutPromise]);
                        if (data?.session) {
                            session = data.session;
                            break;
                        }
                        if (sessionErr) console.warn(`[AuthCallback] Tentativo ${attempt + 1}:`, sessionErr);
                    } catch (e) {
                        console.warn(`[AuthCallback] Tentativo ${attempt + 1} timeout o errore:`, e);
                    }
                    await new Promise(r => setTimeout(r, 400));
                }

                if (!session) {
                    console.error("[AuthCallback] Nessuna sessione valida trovata.");
                    clearTimeout(globalTimer);
                    if (isMounted) setStatus("Accesso non riuscito. Reindirizzamento...");
                    setTimeout(() => { if (isMounted) navigate("/login"); }, 2000);
                    return;
                }

                const user = session.user;
                if (isMounted) setStatus("Verifica profilo in corso...");

                // 4. Controlla se il profilo esiste già su Supabase DB
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                const isNewUser = profileError?.code === 'PGRST116' || !profile;
                clearTimeout(globalTimer);

                if (!isNewUser && profile) {
                    // Utente esistente: popola lo store e vai alla home
                    loginFromServer({
                        access_token: session.access_token,
                        user: {
                            name: profile.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente',
                            email: user.email,
                            phone: profile.phone || '',
                            avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
                            role: profile.role || 'client',
                            training_days_goal: profile.training_days_goal || 3,
                            streak: profile.streak || 0,
                            workouts_completed: profile.workouts_completed || 0,
                            certificate_uploaded: profile.certificate_uploaded || false,
                            certificate_filename: profile.certificate_filename || null,
                            certificate_expires_at: profile.certificate_expires_at || null
                        }
                    });
                    if (isMounted) navigate("/");
                } else {
                    // Nuovo utente Google: salva i dati temporanei e vai al completamento con codice palestra
                    const pendingData = {
                        access_token: session.access_token,
                        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente',
                        email: user.email,
                        avatar_url: user.user_metadata?.avatar_url || null,
                        user_id: user.id
                    };
                    sessionStorage.setItem('google_auth_pending', JSON.stringify(pendingData));
                    localStorage.setItem('google_auth_pending', JSON.stringify(pendingData));
                    if (isMounted) navigate("/gym-code");
                }
            } catch (err) {
                console.error("[AuthCallback] Errore imprevisto callback:", err);
                clearTimeout(globalTimer);
                if (isMounted) setStatus("Errore durante l'accesso. Reindirizzamento al login...");
                setTimeout(() => { if (isMounted) navigate("/login"); }, 2000);
            }
        };

        handleCallback();

        return () => {
            isMounted = false;
            clearTimeout(globalTimer);
        };
    }, [navigate, loginFromServer]);

    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6">
            {/* Logo */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-8">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                <span
                    className="relative z-10 material-symbols-outlined text-primary select-none"
                    style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                >
                    exercise
                </span>
            </div>

            {/* Spinner e Status */}
            <div className="flex flex-col items-center gap-4 text-center max-w-xs">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-semibold">{status}</p>

                {/* Pulsante di salvataggio per evitare qualsiasi blocco visivo */}
                <button
                    onClick={() => navigate("/login")}
                    className="mt-6 text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                >
                    Se il caricamento si prolunga, torna al Login
                </button>
            </div>
        </div>
    );
}

