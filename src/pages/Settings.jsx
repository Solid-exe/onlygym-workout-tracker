import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import ChangelogModal, { APP_VERSION } from "../components/ChangelogModal";

export default function Settings() {
    const navigate = useNavigate();
    const { userProfile, setTrainingDays, resetStats, isDarkMode, toggleDarkMode } = useStore();
    const [days, setDays] = useState(userProfile.trainingDaysGoal);
    const [showChangelog, setShowChangelog] = useState(false);

    const handleSave = () => { setTrainingDays(days); alert("Impostazioni salvate!"); navigate("/profile"); };

    const handleReset = async () => {
        if (confirm("SEI SICURO? Questo cancellerà tutti i record, lo storico e lo streak. Non puoi annullare.")) {
            await resetStats(); alert("Dati azzerati. L'app verrà riavviata."); window.location.reload();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-white p-4">

            <div className="flex items-center gap-4 mb-8 pt-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold uppercase text-white tracking-tight">Impostazioni</h1>
            </div>

            <div className="space-y-8">
                {userProfile?.role === 'client' && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-primary">Obiettivi</h2>
                        <div className="bg-[#111726] border border-slate-800 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between mb-4">
                                <span className="font-bold text-white text-sm">Giorni a settimana</span>
                                <span className="font-mono text-primary font-bold text-lg">{days}</span>
                            </div>
                            <input type="range" min="1" max="7" value={days}
                                onChange={async (e) => { const newDays = parseInt(e.target.value); setDays(newDays); await setTrainingDays(newDays); }}
                                className="w-full accent-primary h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2">
                                <span>Relax</span><span>Beast Mode</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-slate-700">Aspetto</h2>
                    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                            <span className="font-bold text-white text-sm">Tema Scuro</span>
                        </div>
                        <button onClick={toggleDarkMode}
                            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isDarkMode ? 'bg-primary' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 bg-slate-950 rounded-full mx-1 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-slate-700">Informazioni & Novità</h2>
                    <div className="bg-[#111726] border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 shadow-sm">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400">info</span>
                                <span className="text-sm font-bold text-slate-300">Versione App</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">v{APP_VERSION}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowChangelog(true)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                <span className="text-sm font-bold text-white">Novità dell&apos;Aggiornamento</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>

                {userProfile?.role === 'client' && (
                    <div className="pt-8 border-t border-slate-800 space-y-3">
                        <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Area Pericolosa</h2>
                        <button onClick={handleReset}
                            className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                            <span className="material-symbols-outlined text-lg">delete_forever</span> Azzera Streak & Stats
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-auto pb-6">
                <button onClick={handleSave}
                    className="w-full py-4 bg-primary text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">save</span> Salva Modifiche
                </button>
            </div>

            {/* Changelog Modal */}
            <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
        </div>
    );
}
