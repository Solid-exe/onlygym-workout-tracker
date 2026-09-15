export const APP_VERSION = "3.1.0";

export const CHANGELOG_DATA = {
    version: APP_VERSION,
    title: "App Aggiornata!",
    summary: "Benvenuto in OnlyGym: il tuo compagno d'allenamento completo per tutti i tuoi workout, ovunque ti alleni.",
    features: [
        {
            icon: "bolt",
            title: "Rebranding OnlyGym & Volt Kinetic Design",
            desc: "Nuovo layout ad alto contrasto, tipografia fluida e palette Volt per massima concentrazione durante ogni serie."
        },
        {
            icon: "fitness_center",
            title: "Tracker Aperto a Tutti",
            desc: "Traccia i tuoi workout liberamente come atleta indipendente, a casa, in palestra o all'aperto."
        },
        {
            icon: "calculate",
            title: "Calcolo Massimale 1RM Automatico",
            desc: "Stima in tempo reale il tuo massimale 1RM e calcola le percentuali di carico ideali per i tuoi sollevamenti."
        },
        {
            icon: "swap_horiz",
            title: "Smart Swap Potenziato",
            desc: "Scambio biomeccanico intelligente degli esercizi con alternative sempre disponibili anche a corpo libero o con manubri."
        },
        {
            icon: "share",
            title: "Condivisione Social & Stories",
            desc: "Condividi i tuoi workout e badge su Instagram con un design ad alto contrasto e statistiche visibili."
        },
        {
            icon: "picture_as_pdf",
            title: "Esportazione Schede in PDF",
            desc: "Scarica e stampa le tue schede d'allenamento in formato PDF pulito e professionale."
        }
    ]
};

export default function ChangelogModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden text-slate-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close X button */}
                <button 
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                    aria-label="Chiudi"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                        <span className="material-symbols-outlined text-2xl animate-bounce">auto_awesome</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            Versione {CHANGELOG_DATA.version}
                        </span>
                        <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-900 dark:text-white leading-tight mt-1">
                            {CHANGELOG_DATA.title}
                        </h3>
                    </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {CHANGELOG_DATA.summary}
                </p>

                {/* Features list */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {CHANGELOG_DATA.features.map((feature, idx) => (
                        <div 
                            key={idx}
                            className="flex gap-3 items-start p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl"
                        >
                            <div className="size-8 rounded-xl bg-white dark:bg-slate-700 text-primary flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-lg">{feature.icon}</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{feature.title}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Action Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black uppercase tracking-widest text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-primary/25 active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>Ho Capito! Prova Ora</span>
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                </button>
            </div>
        </div>
    );
}

