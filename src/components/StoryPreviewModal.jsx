import { useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function StoryPreviewModal({ open, onClose, workoutData, chartData }) {
    const storyRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    if (!open) return null;

    const handleShare = async () => {
        if (!storyRef.current) return;
        setIsGenerating(true);

        try {
            // Genera l'immagine dal Div (ignorando font non caricati ecc)
            const canvas = await html2canvas(storyRef.current, {
                scale: 3, // Alta risoluzione per le storie Instagram
                useCORS: true,
                backgroundColor: "#020617", // slate-950 come sfondo per non avere bordi bianchi
            });

            // Convert in blob
            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error("Errore nella generazione dell'immagine");

                const file = new File([blob], `ONLYGYM-Story-${Date.now()}.jpg`, { type: "image/jpeg" });

                // Prova a usare l'API nativa di condivisione (funziona su iOS/Android PWA)
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'ONLYGYM Workout',
                            text: 'Guarda il mio ultimo allenamento su ONLYGYM! 🔥'
                        });
                    } catch (e) {
                        console.log("Condivisione annullata o non supportata in questo browser:", e);
                        forceDownload(canvas.toDataURL("image/jpeg", 0.9));
                    }
                } else {
                    // Fallback per Desktop: Scarica l'immagine
                    forceDownload(canvas.toDataURL("image/jpeg", 0.9));
                }
                setIsGenerating(false);
            }, "image/jpeg", 0.9);

        } catch (err) {
            console.error(err);
            alert("Si è verificato un errore durante la generazione dell'immagine.");
            setIsGenerating(false);
        }
    };

    const forceDownload = (dataUrl) => {
        const link = document.createElement('a');
        link.download = `ONLYGYM-Story-${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
    };

    // Formatter del tempo
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m} min`;
    };

    return (
        <div className="fixed inset-0 z-[500] flex flex-col bg-black/85 backdrop-blur-md p-4 safe-area-pt">
            {/* Header / Azioni */}
            <div className="flex justify-between items-center mb-6 pt-4">
                <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors" disabled={isGenerating}>
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleShare}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] px-6 py-2.5 rounded-full font-black text-white uppercase tracking-widest text-xs flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-pink-500/30 disabled:opacity-50"
                    >
                        {isGenerating ? 'Generazione...' : (
                            <>
                                <span className="material-symbols-outlined text-[16px]">ios_share</span> Condividi
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Area di Anteprima (Scrollable se schermo piccolo) */}
            <div className="flex-1 overflow-y-auto flex justify-center items-center pb-8">
                {/* 
                  IL DIV "STORY"
                  Usa aspect-ratio 9/16, scale in modo da entrare sempre nello schermo,
                  ma quando renderizzato dall'html2canvas manterrà i suoi Pixel interni.
                  Risoluzione base: 1080x1920 (scalata visivamente con W-full max-w-[340px])
                */}
                <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden rounded-3xl ring-2 ring-white/20" style={{ width: "340px", height: "604.44px" }}>
                    
                    {/* Questo è il nodo renderizzato */}
                    <div
                        ref={storyRef}
                        className="absolute inset-0 flex flex-col p-8 overflow-hidden select-none"
                        style={{
                            width: "1080px",
                            height: "1920px",
                            backgroundColor: "#080c15",
                            color: "#ffffff",
                            transformOrigin: "top left",
                            transform: "scale(0.3148)"
                        }}
                    >
                        {/* Decorazioni Sfondo */}
                        <div
                            className="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] rounded-full blur-[150px]"
                            style={{ backgroundColor: "rgba(13, 242, 137, 0.22)" }}
                        />
                        <div
                            className="absolute -bottom-[200px] -left-[200px] w-[800px] h-[800px] rounded-full blur-[150px]"
                            style={{ backgroundColor: "rgba(99, 102, 241, 0.25)" }}
                        />

                        {/* Top / App Logo */}
                        <div className="flex items-center gap-4 mt-12 z-10 w-full relative">
                            <span className="material-symbols-outlined text-[64px]" style={{ color: "#0df289" }}>fitness_center</span>
                            <span className="font-black text-[48px] uppercase tracking-wider" style={{ color: "#ffffff" }}>
                                ONLY<span style={{ color: "#0df289" }}>GYM</span>
                            </span>
                        </div>

                        {/* Contenuto Centrale Dinamico */}
                        <div className="flex-1 flex flex-col justify-center gap-16 z-10">
                            {workoutData ? (
                                // LAYOUT: WORKOUT FINITO
                                <div className="text-center w-full">
                                    <div
                                        className="inline-flex flex-col items-center justify-center p-12 rounded-[4rem] mb-12 shadow-2xl"
                                        style={{
                                            backgroundColor: "#0f172a",
                                            border: "6px solid rgba(13, 242, 137, 0.45)",
                                            boxShadow: "0 20px 70px rgba(0, 0, 0, 0.9)"
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined text-[140px] mb-6"
                                            style={{
                                                color: "#0df289",
                                                fontVariationSettings: "'FILL' 1",
                                                filter: "drop-shadow(0 0 30px rgba(13, 242, 137, 0.6))"
                                            }}
                                        >
                                            local_fire_department
                                        </span>
                                        <h2
                                            className="text-[100px] font-black italic tracking-tighter uppercase leading-none"
                                            style={{ color: "#ffffff", textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)" }}
                                        >
                                            {workoutData.name}
                                        </h2>
                                        <div
                                            className="text-[42px] font-black mt-6 uppercase tracking-widest px-10 py-4 rounded-full"
                                            style={{
                                                backgroundColor: "#0df289",
                                                color: "#080b11",
                                                boxShadow: "0 0 25px rgba(13, 242, 137, 0.6)"
                                            }}
                                        >
                                            Workout Completato ✓
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 px-8">
                                        <div
                                            className="p-10 rounded-[3.5rem] text-center"
                                            style={{
                                                backgroundColor: "#0f172a",
                                                border: "5px solid rgba(56, 189, 248, 0.4)",
                                                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
                                            }}
                                        >
                                            <p className="text-[34px] font-black uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>Durata</p>
                                            <p className="text-[72px] font-black" style={{ color: "#ffffff" }}>{formatTime(workoutData.duration)}</p>
                                        </div>
                                        <div
                                            className="p-10 rounded-[3.5rem] text-center"
                                            style={{
                                                backgroundColor: "#0f172a",
                                                border: "5px solid rgba(13, 242, 137, 0.4)",
                                                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
                                            }}
                                        >
                                            <p className="text-[34px] font-black uppercase tracking-widest mb-2" style={{ color: "#6ee7b7" }}>Volume</p>
                                            <p className="text-[72px] font-black" style={{ color: "#0df289" }}>{workoutData.totalVolume} <span className="text-[36px]" style={{ color: "#94a3b8" }}>kg</span></p>
                                        </div>
                                    </div>

                                    {workoutData.prCount > 0 && (
                                        <div
                                            className="mt-10 p-8 rounded-[3rem] text-center flex items-center justify-center gap-4"
                                            style={{
                                                backgroundColor: "rgba(245, 158, 11, 0.2)",
                                                border: "4px solid rgba(245, 158, 11, 0.5)",
                                                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
                                            }}
                                        >
                                            <span className="text-[64px]">🏆</span>
                                            <p className="text-[48px] font-black uppercase tracking-tight" style={{ color: "#fbbf24" }}>
                                                {workoutData.prCount} Record Infranti
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : chartData ? (
                                // LAYOUT: PROGRESSO CARTA
                                <div className="text-center w-full">
                                    <h2 className="text-[80px] font-black italic tracking-tighter uppercase leading-tight px-12 mb-4" style={{ color: "#ffffff" }}>
                                        {chartData.exerciseName}
                                    </h2>
                                    <div className="text-[38px] font-black mb-10 uppercase tracking-widest flex justify-center items-center gap-4" style={{ color: "#0df289" }}>
                                        <span className="material-symbols-outlined text-[48px]">trending_up</span> Nuovo Record Personale
                                    </div>

                                    <div
                                        className="p-14 rounded-[4rem] text-center relative overflow-hidden"
                                        style={{
                                            backgroundColor: "#0f172a",
                                            border: "6px solid rgba(13, 242, 137, 0.45)",
                                            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.9)"
                                        }}
                                    >
                                        <p className="text-[40px] font-black uppercase tracking-widest mb-4" style={{ color: "#94a3b8" }}>
                                            {chartData.metric === 'weight' ? 'Carico Max' : 'Volume Totale'}
                                        </p>
                                        <p className="text-[200px] leading-none font-black italic drop-shadow-2xl" style={{ color: "#ffffff" }}>
                                            {chartData.maxValue} <span className="text-[60px] not-italic" style={{ color: "#0df289" }}>kg</span>
                                        </p>
                                        <p
                                            className="text-[42px] font-black mt-8 py-4 px-10 rounded-full inline-block truncate max-w-full"
                                            style={{
                                                backgroundColor: "#0df289",
                                                color: "#080b11",
                                                boxShadow: "0 0 25px rgba(13, 242, 137, 0.6)"
                                            }}
                                        >
                                            +{chartData.growth}% dalla prima volta
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer Story */}
                        <div className="mt-auto z-10 w-full text-center pb-12 flex flex-col items-center">
                            <div
                                className="px-10 py-5 rounded-full flex items-center gap-4"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                                    border: "2px solid rgba(255, 255, 255, 0.25)",
                                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
                                }}
                            >
                                <span className="material-symbols-outlined text-[40px]" style={{ color: "#0df289" }}>bolt</span>
                                <span className="text-[32px] font-black tracking-widest uppercase" style={{ color: "#ffffff" }}>OnlyGym App</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Spiegazione in basso */}
            <p className="text-white/60 text-center text-[11px] font-bold uppercase tracking-widest pb-8">Anteprima Storia 9:16</p>
        </div>
    );
}
