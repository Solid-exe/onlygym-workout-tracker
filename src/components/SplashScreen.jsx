import { useEffect, useState, useRef } from "react";

export default function SplashScreen({ onFinish }) {
    const [animate, setAnimate] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const onFinishRef = useRef(onFinish);
    onFinishRef.current = onFinish;

    useEffect(() => {
        // Avvia animazione
        const animTimer = setTimeout(() => setAnimate(true), 40);
        // Sfuma dopo 350ms
        const fadeTimer = setTimeout(() => setOpacity(0), 350);
        // Chiudi completamente dopo 550ms
        const finishTimer = setTimeout(() => {
            if (onFinishRef.current) onFinishRef.current();
        }, 550);

        // Timer di sicurezza assoluto: entro 800ms deve sparire in ogni caso
        const safetyTimer = setTimeout(() => {
            if (onFinishRef.current) onFinishRef.current();
        }, 800);

        return () => {
            clearTimeout(animTimer);
            clearTimeout(fadeTimer);
            clearTimeout(finishTimer);
            clearTimeout(safetyTimer);
        };
    }, []);

    return (
        <div
            className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-300 ease-out ${opacity === 0 ? 'pointer-events-none' : ''}`}
            style={{ opacity }}
        >
            {/* Decorative Background Accent */}
            <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            </div>

            <div className={`transition-all duration-700 transform ${animate ? 'scale-100 opacity-100 blur-0' : 'scale-95 opacity-0 blur-sm'}`}>
                <div className="relative flex flex-col items-center max-w-md w-full px-6 space-y-6">
                    {/* Official OnlyGym Logo */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
                        <img 
                            src="/logo.png" 
                            alt="OnlyGym Logo" 
                            className="relative z-10 w-36 h-36 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                        />
                    </div>

                    {/* Typography */}
                    <div className="text-center space-y-2">
                        <h1 className="text-foreground tracking-wider text-4xl font-black uppercase leading-none">
                            ONLYGYM
                        </h1>
                        <h2 className="text-slate-400 text-xs font-bold tracking-[0.35em] uppercase">
                            WORKOUT &bull; TRACKER &bull; PERFORMANCE
                        </h2>
                    </div>
                </div>
            </div>

            {/* Bottom: Loading Bar + Version */}
            <div className="absolute bottom-12 w-full max-w-xs px-8 flex flex-col items-center gap-6">
                <div className="w-full space-y-3">
                    <div className="h-[2px] w-full bg-slate-700/40 rounded-full overflow-hidden">
                        <div className={`h-full bg-primary rounded-full shadow-[0_0_12px_rgba(13,242,137,0.8)] transition-all duration-700 ease-out ${animate ? 'w-full' : 'w-0'}`}></div>
                    </div>
                </div>
                <div className={`text-slate-400 text-[10px] font-medium tracking-widest uppercase transition-opacity duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                    ONLYGYM v3.0.0
                </div>
            </div>
        </div>
    );
}
