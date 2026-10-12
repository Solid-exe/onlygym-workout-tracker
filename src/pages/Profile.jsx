import { saveAs } from 'file-saver';
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import { admobService } from "../services/admob";
import { getEquippedCustomizations, getAvatarFrameClass } from "../services/customization";

export default function Profile() {
    const navigate = useNavigate();
    const { userProfile, logout, updateProfile, badges, history } = useStore();
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(userProfile.name);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isAdFree, setIsAdFree] = useState(admobService.isUserAdFree());
    const [customizations, setCustomizations] = useState(getEquippedCustomizations());
    const fileInputRef = useRef(null);

    useEffect(() => {
        const handleCustomization = () => setCustomizations(getEquippedCustomizations());
        window.addEventListener('onlygym:customization-changed', handleCustomization);
        return () => window.removeEventListener('onlygym:customization-changed', handleCustomization);
    }, []);

    useEffect(() => {
        const handleAdFreeChange = (e) => {
            setIsAdFree(e.detail.isAdFree);
        };
        window.addEventListener('onlygym:ad-free-changed', handleAdFreeChange);
        return () => window.removeEventListener('onlygym:ad-free-changed', handleAdFreeChange);
    }, []);

    const handleExport = () => {
        try {
            if (!history || history.length === 0) return alert("Nessun dato da esportare.");
            const headers = ["Data", "Workout", "Esercizio", "Set", "KG", "Reps"];
            const rows = [];
            history.forEach(w => {
                if (w.exercises) {
                    w.exercises.forEach(ex => {
                        if (ex.setsData) {
                            ex.setsData.forEach((s, idx) => {
                                if (s.done) {
                                    rows.push([new Date(w.completedAt || w.startedAt).toLocaleDateString(), w.name, ex.name, idx + 1, s.kg || 0, s.reps || 0].join(","));
                                }
                            });
                        }
                    });
                }
            });
            const csvContent = [headers.join(","), ...rows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
            saveAs(blob, `onlygym_history_export_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (e) { console.error("Export error", e); alert("Errore durante l'export"); }
    };

    const handleSaveName = () => { if (!newName.trim()) return; updateProfile({ name: newName.trim() }); setIsEditingName(false); };
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert("Seleziona un'immagine valida."); return; }
        if (file.size > 5 * 1024 * 1024) { alert("Immagine troppo grande (max 5MB)."); return; }
        setUploadingAvatar(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non autenticato");
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            await updateProfile({ avatar_url: publicUrl });
        } catch (error) { console.error("Avatar upload error:", error); alert("Errore caricamento foto profilo."); }
        finally { setUploadingAvatar(false); }
    };

    const handleLogout = () => {
        if (confirm("Davvero vuoi uscire? Potrai rifare login quando vuoi.")) { logout(); navigate("/login"); }
    };

    const menuItems = [
        { icon: 'settings', label: "Impostazioni Generali", to: "/settings" },
        { icon: 'shield', label: "Privacy & Sicurezza", to: "/privacy" },
        { icon: 'calendar_month', label: "Storico Allenamenti", to: "/history" },
        { icon: 'trending_up', label: "Progressione", to: "/progress" },
        { icon: 'emoji_events', label: "Badge & Traguardi", to: "/badges", badge: badges.length > 0 ? badges.length : null },
    ];

    return (
        <div className="p-4 pt-12 pb-24 max-w-md mx-auto min-h-screen">

            {/* Header Profile */}
            <div className="flex flex-col items-center mb-8">
                <div className={`w-24 h-24 rounded-full bg-white mb-4 relative overflow-hidden flex items-center justify-center shadow-lg shadow-primary/10 group cursor-pointer transition-all ${getAvatarFrameClass(customizations.frame)}`}
                    onClick={handleAvatarClick}>
                    {uploadingAvatar ? (
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (userProfile.avatar_url || userProfile.avatarUrl) ? (
                        <img src={userProfile.avatar_url || userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black text-primary">{userProfile.name?.substring(0, 2).toUpperCase() || "?"}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                        <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                    </div>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                {isEditingName ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
                            className="bg-[#151d2e] border border-primary rounded-lg px-4 py-2 text-xl font-bold text-white text-center focus:outline-none w-48 shadow-sm" />
                        <button onClick={handleSaveName} className="p-2 bg-primary text-slate-950 rounded-lg font-bold"><span className="material-symbols-outlined text-lg">check</span></button>
                        <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-800 text-slate-400 rounded-lg"><span className="material-symbols-outlined text-lg">close</span></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{userProfile.name || "Utente"}</h2>
                        <button onClick={() => setIsEditingName(true)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                    </div>
                )}
                {userProfile.email && <p className="text-xs text-slate-400 mt-0.5">{userProfile.email}</p>}
                
                <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> {customizations.title}
                    </span>
                    <button 
                        onClick={() => navigate('/battlepass')}
                        className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[12px]">trophy</span> Battle Pass
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#111726] border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-white">{userProfile.workoutsCompleted}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Workout</span>
                </div>
                <div className="bg-[#111726] border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <span className="text-2xl font-black text-white">{userProfile.trainingDaysGoal}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Giorni/Sett</span>
                </div>
            </div>

            {/* Banner Monetizzazione: Rimuovi Pubblicità */}
            <div className="mb-8">
                {isAdFree ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500 text-2xl">verified</span>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">Versione Senza Pubblicità</h4>
                                <p className="text-xs text-slate-500">Grazie per aver sostenuto OnlyGym!</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full">Attivo</span>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-4 rounded-2xl shadow-lg border border-white/10 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">block</span>
                                <span className="text-xs font-black uppercase tracking-wider text-primary">Zero Interruzioni</span>
                            </div>
                            <span className="text-xs font-black bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">1,99 € una tantum</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Rimuovi Pubblicità per Sempre</h4>
                            <p className="text-xs text-slate-300 mt-0.5">Naviga e allenati senza annunci pubblicitari e supporta lo sviluppo dell'app.</p>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => {
                                    // Simulazione acquisto e attivazione stato No-Ads
                                    // Quando collegato al Play Store Billing, qui viene richiamata la query di acquisto
                                    const confirmPurchase = window.confirm("Desideri sbloccare OnlyGym Senza Pubblicità per 1,99 €?");
                                    if (confirmPurchase) {
                                        admobService.setAdFreeStatus(true);
                                        alert("Grazie! Le pubblicità sono state rimosse per sempre.");
                                    }
                                }}
                                className="flex-1 bg-primary hover:bg-primary-hover text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-center"
                            >
                                Sblocca No-Ads (1,99 €)
                            </button>
                            <button
                                onClick={() => {
                                    // Ripristina acquisti
                                    admobService.setAdFreeStatus(true);
                                    alert("Acquisto ripristinato con successo!");
                                }}
                                className="px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 rounded-xl transition-all text-center"
                            >
                                Ripristina
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats & Data */}
            <div className="space-y-1 mb-6">
                <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Statistiche & Dati</h3>
                    <button onClick={() => navigate('/analysis')} className="w-full bg-[#111726] border border-slate-800 hover:border-primary/40 p-4 rounded-xl flex items-center justify-between transition-all group shadow-sm">
                        <div className="flex items-center gap-3 text-slate-200 group-hover:text-white">
                            <span className="text-blue-400 bg-blue-500/20 border border-blue-500/30 p-2 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-lg">pie_chart</span></span>
                            <span className="text-sm font-bold">Analisi Avanzata</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-lg">chevron_right</span>
                    </button>
                    <button onClick={handleExport} className="w-full bg-[#111726] border border-slate-800 hover:border-primary/40 p-4 rounded-xl flex items-center justify-between transition-all group shadow-sm mt-2">
                        <div className="flex items-center gap-3 text-slate-200 group-hover:text-white">
                            <span className="text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 p-2 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-lg">download</span></span>
                            <span className="text-sm font-bold">Esporta CSV</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-lg">chevron_right</span>
                    </button>
                </div>

            {/* Menu Items */}
            <div className="space-y-1 mb-6">
                <h3 className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account</h3>
                {menuItems.map((item, i) => (
                    <button key={i} onClick={() => navigate(item.to)}
                        className="w-full bg-[#111726] border border-slate-800 hover:border-primary/40 p-4 rounded-xl flex items-center justify-between transition-all group shadow-sm">
                        <div className="flex items-center gap-3 text-slate-200 group-hover:text-white transition-colors">
                            <span className="text-slate-400 group-hover:text-primary transition-colors relative flex items-center justify-center">
                                <span className="material-symbols-outlined">{item.icon}</span>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center">{item.badge}</span>
                                )}
                            </span>
                            <span className="text-sm font-bold">{item.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">chevron_right</span>
                    </button>
                ))}
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 active:scale-[0.98] transition-all text-sm font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-lg">logout</span> Logout
            </button>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-400 font-mono">ONLYGYM v3.0.0</p>
            </div>
        </div>
    );
}
