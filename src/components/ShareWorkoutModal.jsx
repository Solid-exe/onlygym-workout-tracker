import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

export default function ShareWorkoutModal({ workout, onClose }) {
    const cardRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleShareOrDownload = async () => {
        setLoading(true);
        if (cardRef.current) {
            try {
                // Genera immagine in alta risoluzione (1080x1920) con sfondo solido scuro
                const canvas = await html2canvas(cardRef.current, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: "#080c15"
                });

                const image = canvas.toDataURL("image/jpeg", 0.95);

                // Prova Condivisione Nativa (mobile)
                if (navigator.share && navigator.canShare) {
                    try {
                        const blob = await (await fetch(image)).blob();
                        const file = new File([blob], `ONLYGYM-Workout-${Date.now()}.jpg`, { type: "image/jpeg" });

                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: 'ONLYGYM Workout',
                                text: 'Allenamento completato su ONLYGYM! 🔥'
                            });
                            setLoading(false);
                            return;
                        }
                    } catch (err) {
                        console.log("Condivisione nativa annullata o non disponibile:", err);
                    }
                }

                // Fallback Download Immagine
                const link = document.createElement('a');
                link.href = image;
                link.download = `ONLYGYM_Workout_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (e) {
                console.error("Screenshot error:", e);
                alert("Errore durante la generazione dell'immagine di riepilogo.");
            }
        }
        setLoading(false);
    };

    if (!workout) return null;

    const formattedDate = new Date(workout.completedAt || Date.now()).toLocaleDateString('it-IT', {
        day: 'numeric', month: 'short'
    });

    const duration = workout.duration ? Math.round(workout.duration) : 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

    const volume = workout.exercises ? workout.exercises.reduce((acc, ex) => {
        return acc + (ex.setsData || []).filter(s => s.done).reduce((sAcc, s) => sAcc + ((parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0)), 0);
    }, 0) : 0;

    const totalSets = workout.exercises ? workout.exercises.reduce((acc, ex) => {
        return acc + (ex.setsData || []).filter(s => s.done).length;
    }, 0) : 0;

    const totalExercises = workout.exercises ? workout.exercises.length : 0;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md p-4 animate-in fade-in pb-safe pt-safe" onClick={onClose}>

            {/* Header / Azioni */}
            <div className="flex justify-between items-center mb-4 pt-3 px-2" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
                    title="Chiudi"
                    disabled={loading}
                >
                    <span className="material-symbols-outlined text-[24px]" style={{ color: '#ffffff' }}>close</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1' }}
                        disabled={loading}
                    >
                        Salva ed Esci
                    </button>
                    <button
                        onClick={handleShareOrDownload}
                        disabled={loading}
                        className="bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/30 disabled:opacity-50"
                        style={{ color: '#ffffff' }}
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generazione...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[16px]" style={{ color: '#ffffff' }}>ios_share</span> Condividi
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Area di Anteprima (Scalata in formato 9:16) */}
            <div className="flex-1 overflow-hidden flex justify-center items-center py-2" onClick={e => e.stopPropagation()}>

                <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden w-[320px] h-[568px] ring-2 ring-white/20">

                    {/* Div renderizzato a 1080x1920 (Standard Instagram Story) */}
                    <div
                        ref={cardRef}
                        className="absolute top-0 left-0 flex flex-col p-10 overflow-hidden select-none"
                        style={{
                            width: "1080px",
                            height: "1920px",
                            backgroundColor: "#080c15",
                            color: "#ffffff",
                            transformOrigin: "top left",
                            transform: "scale(0.29629)" // 320 / 1080
                        }}
                    >
                        {/* Decorazioni Brand Sfondo */}
                        <div
                            className="absolute -top-[200px] -right-[200px] w-[900px] h-[900px] rounded-full blur-[180px]"
                            style={{ backgroundColor: "rgba(13, 242, 137, 0.22)" }}
                        />
                        <div
                            className="absolute -bottom-[200px] -left-[200px] w-[900px] h-[900px] rounded-full blur-[180px]"
                            style={{ backgroundColor: "rgba(99, 102, 241, 0.25)" }}
                        />

                        {/* Top: Branding */}
                        <div className="flex items-center gap-5 mt-16 z-10 w-full relative">
                            <span className="material-symbols-outlined text-[72px]" style={{ color: "#0df289" }}>fitness_center</span>
                            <span className="font-black text-[64px] uppercase tracking-wider" style={{ color: "#ffffff" }}>
                                ONLY<span style={{ color: "#0df289" }}>GYM</span>
                            </span>
                            <div
                                className="ml-auto text-[36px] font-black tracking-widest rounded-full px-8 py-3 uppercase"
                                style={{
                                    color: "#ffffff",
                                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                                    border: "2px solid rgba(255, 255, 255, 0.25)"
                                }}
                            >
                                {formattedDate}
                            </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="flex-1 flex flex-col justify-center items-center gap-14 z-10 w-full">

                            {/* Titolo Workout */}
                            <div className="text-center w-full relative">
                                <div
                                    className="inline-flex flex-col items-center justify-center p-14 rounded-[4.5rem] w-[92%]"
                                    style={{
                                        backgroundColor: "#0f172a",
                                        border: "6px solid rgba(13, 242, 137, 0.45)",
                                        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.9)"
                                    }}
                                >
                                    <span
                                        className="material-symbols-outlined text-[170px] mb-6"
                                        style={{
                                            color: "#0df289",
                                            fontVariationSettings: "'FILL' 1",
                                            filter: "drop-shadow(0 0 35px rgba(13, 242, 137, 0.6))"
                                        }}
                                    >
                                        local_fire_department
                                    </span>
                                    <h2
                                        className="text-[100px] font-black italic tracking-tighter uppercase leading-tight"
                                        style={{
                                            color: "#ffffff",
                                            textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)"
                                        }}
                                    >
                                        {workout.name || 'Giorno Workout'}
                                    </h2>
                                    <div
                                        className="text-[44px] font-black mt-8 uppercase tracking-widest px-12 py-5 rounded-full"
                                        style={{
                                            backgroundColor: "#0df289",
                                            color: "#080b11",
                                            boxShadow: "0 0 35px rgba(13, 242, 137, 0.6)"
                                        }}
                                    >
                                        Workout Completato ✓
                                    </div>
                                </div>
                            </div>

                            {/* Statistiche Card (Durata & Volume) */}
                            <div className="grid grid-cols-2 gap-10 px-10 w-full">
                                <div
                                    className="p-12 rounded-[4rem] text-center"
                                    style={{
                                        backgroundColor: "#0f172a",
                                        border: "5px solid rgba(56, 189, 248, 0.4)",
                                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[70px] mb-4" style={{ color: "#38bdf8" }}>timer</span>
                                    <p className="text-[34px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: "#94a3b8" }}>Durata</p>
                                    <p className="text-[84px] font-black italic tracking-tighter" style={{ color: "#ffffff" }}>{durationStr}</p>
                                </div>
                                <div
                                    className="p-12 rounded-[4rem] text-center"
                                    style={{
                                        backgroundColor: "#0f172a",
                                        border: "5px solid rgba(13, 242, 137, 0.4)",
                                        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
                                    }}
                                >
                                    <span className="material-symbols-outlined text-[70px] mb-4" style={{ color: "#0df289" }}>fitness_center</span>
                                    <p className="text-[34px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: "#6ee7b7" }}>Volume</p>
                                    <p className="text-[84px] font-black italic tracking-tighter" style={{ color: "#0df289" }}>
                                        {volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume} <span className="text-[44px] not-italic" style={{ color: "#94a3b8" }}>kg</span>
                                    </p>
                                </div>
                            </div>

                            {/* Statistiche Card (Esercizi e Serie) */}
                            <div
                                className="p-10 rounded-[3.5rem] text-center flex items-center justify-around w-[92%]"
                                style={{
                                    backgroundColor: "#0f172a",
                                    border: "5px solid rgba(255, 255, 255, 0.15)",
                                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
                                }}
                            >
                                <div className="flex items-center gap-5">
                                    <span className="material-symbols-outlined text-[64px]" style={{ color: "#0df289" }}>exercise</span>
                                    <div className="text-left">
                                        <p className="text-[30px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Esercizi</p>
                                        <p className="text-[64px] font-black italic leading-none" style={{ color: "#ffffff" }}>{totalExercises}</p>
                                    </div>
                                </div>
                                <div className="h-20 w-[3px]" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}></div>
                                <div className="flex items-center gap-5">
                                    <span className="material-symbols-outlined text-[64px]" style={{ color: "#38bdf8" }}>check_circle</span>
                                    <div className="text-left">
                                        <p className="text-[30px] font-black uppercase tracking-wider" style={{ color: "#94a3b8" }}>Serie Totali</p>
                                        <p className="text-[64px] font-black italic leading-none" style={{ color: "#ffffff" }}>{totalSets}</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Branding */}
                        <div className="mt-auto pb-16 z-10 w-full text-center flex justify-center">
                            <div
                                className="px-12 py-5 rounded-full flex items-center gap-5"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                                    border: "2px solid rgba(255, 255, 255, 0.25)",
                                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
                                }}
                            >
                                <span className="material-symbols-outlined text-[48px]" style={{ color: "#0df289" }}>bolt</span>
                                <span className="text-[36px] font-black tracking-widest uppercase" style={{ color: "#ffffff" }}>Tracciato su OnlyGym</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-2 pb-2 flex flex-col gap-2 max-w-sm mx-auto w-full" onClick={e => e.stopPropagation()}>
                <button
                    onClick={handleShareOrDownload}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-primary text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Condividi Storia (Instagram / WhatsApp)
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-white transition-colors text-center"
                >
                    Torna alla Home
                </button>
            </div>
        </div>
    );
}
