import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import { exportPlanToPDF } from "../utils/pdfExport";
import { isCoachOrAdmin } from "../utils/permissions";

export default function Plans() {
    const navigate = useNavigate();
    const { plans, startWorkout, deletePlan, userProfile } = useStore();
    const isCoach = isCoachOrAdmin(userProfile);

    // Tab per il Coach: 'athletes' (gestione atleti) oppure 'myPlans' (le schede personali)
    const [coachTab, setCoachTab] = useState('athletes');

    // Dati Atleti per Coach
    const [athletes, setAthletes] = useState([]);
    const [loadingAthletes, setLoadingAthletes] = useState(false);
    const [athleteSearch, setAthleteSearch] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);

    // Modale Richiesta Scheda (per atleti)
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ coach_id: null, location: null, goal: 'ipertrofia', days: 3, injuries: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [selectedPlanForStart, setSelectedPlanForStart] = useState(null);
    const [coaches, setCoaches] = useState([]);

    // Carica lista Coach per la modale di richiesta degli atleti
    useEffect(() => {
        const fetchCoaches = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, name, email, avatar_url, role')
                .or('role.in.(trainer,coach,admin),email.in.(admin@onlygym.com,vittorio@onlygym.app,vittoriodisarno99@gmail.com)')
                .order('name');
            if (data && data.length > 0) {
                setCoaches(data);
                // Pre-seleziona il primo coach disponibile (Vittorio)
                setFormData(prev => ({ ...prev, coach_id: prev.coach_id || data[0].id }));
            }
        };
        fetchCoaches();
    }, []);

    // Carica Atleti e Richieste Coaching se l'utente è il Coach
    useEffect(() => {
        if (!isCoach) return;

        const fetchCoachData = async () => {
            setLoadingAthletes(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                // 1. Richieste in attesa
                const { data: requestsData } = await supabase
                    .from('coaching_requests')
                    .select('*, user:user_id(name, email)')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });
                setPendingRequests(requestsData || []);

                // 2. Tutti i profili atleti (escludendo se stesso)
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, name, email, role, avatar_url, workouts_completed, streak, created_at')
                    .order('name');

                // 3. Conteggio schede per atleta
                const { data: plansData } = await supabase
                    .from('workout_plans')
                    .select('id, user_id, name');

                const plansCountMap = {};
                (plansData || []).forEach(p => {
                    plansCountMap[p.user_id] = (plansCountMap[p.user_id] || 0) + 1;
                });

                if (profilesData) {
                    const athleteList = profilesData
                        .filter(p => !user || p.id !== user.id)
                        .map(p => ({
                            ...p,
                            plansCount: plansCountMap[p.id] || 0
                        }));
                    setAthletes(athleteList);
                }
            } catch (err) {
                console.error("Errore caricamento atleti:", err);
            } finally {
                setLoadingAthletes(false);
            }
        };

        fetchCoachData();
    }, [isCoach]);

    // Filtro atleti
    const filteredAthletes = useMemo(() => {
        if (!athleteSearch.trim()) return athletes;
        const q = athleteSearch.toLowerCase();
        return athletes.filter(a =>
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q)
        );
    }, [athletes, athleteSearch]);

    const handleLocationSelect = (loc) => { setFormData(prev => ({ ...prev, location: loc })); setStep(3); };

    const handleStart = (planId) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;
        const isSplit = plan.exercises?.length > 0 && plan.exercises[0].exercises && Array.isArray(plan.exercises[0].exercises);
        if (isSplit) setSelectedPlanForStart(plan);
        else { startWorkout(planId); navigate("/workout/active"); }
    };

    const handleExportPDF = (e, plan) => { e.stopPropagation(); exportPlanToPDF(plan); if (navigator.vibrate) navigator.vibrate(50); };

    const handleDelete = (e, planId, planName) => {
        e.stopPropagation();
        if (window.confirm(`Sei sicuro di voler eliminare la scheda "${planName}"?`)) { deletePlan(planId); if (navigator.vibrate) navigator.vibrate([50, 50]); }
    };

    const submitRequest = async () => {
        if (!formData.location) return;
        setSubmitting(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase.from('coaching_requests').insert({
                user_id: user.id, trainer_id: formData.coach_id, location: formData.location, status: 'pending', details: { ...formData }
            });
            if (error) { alert("Errore invio richiesta: " + error.message); }
            else { alert("✅ Richiesta inviata al Coach Vittorio! Riceverai una notifica non appena preparerà la tua scheda."); setShowRequestModal(false); setStep(1); setFormData({ coach_id: coaches[0]?.id || null, location: null, goal: 'ipertrofia', days: 3, injuries: '', notes: '' }); }
        }
        setSubmitting(false);
    };

    return (
        <div className="p-4 pt-12 pb-24 max-w-md mx-auto min-h-screen relative bg-background">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black italic text-white uppercase -skew-x-6 leading-none">
                        {isCoach ? 'Gestione' : 'Le tue'} <span className="text-primary not-italic">Schede</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                        {isCoach ? 'Assegna e monitora i workout degli atleti' : 'I tuoi programmi di allenamento'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/plans/new')}
                    className="h-11 px-4 rounded-xl bg-primary text-slate-950 flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95 font-black text-xs uppercase tracking-wider"
                    title="Nuova Scheda"
                >
                    <span className="material-symbols-outlined font-black text-lg">add</span>
                    <span>Nuova Scheda</span>
                </button>
            </div>

            {/* Coach Tabs: Atleti vs Mie Schede */}
            {isCoach && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#111726] border border-slate-800 rounded-2xl mb-6 shadow-sm">
                    <button
                        onClick={() => setCoachTab('athletes')}
                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            coachTab === 'athletes'
                                ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        <span>Atleti ({athletes.length})</span>
                    </button>
                    <button
                        onClick={() => setCoachTab('myPlans')}
                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            coachTab === 'myPlans'
                                ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                        <span>Mie Schede ({plans.length})</span>
                    </button>
                </div>
            )}

            {/* COACH VIEW: ATLETI E ASSEGNAZIONI */}
            {isCoach && coachTab === 'athletes' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Richieste in attesa */}
                    {pendingRequests.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-amber-500 text-xl">notification_important</span>
                                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">
                                    {pendingRequests.length} {pendingRequests.length === 1 ? 'Richiesta in attesa' : 'Richieste in attesa'}
                                </h3>
                            </div>
                            <div className="space-y-2.5">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="bg-[#111726] border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white truncate">{req.user?.name || req.user?.email || 'Atleta'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                {req.details?.goal || req.details?.location || 'Scheda richiesta'} • {req.details?.days || 3}gg/sett
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/plans/new?userId=${req.user_id}&requestId=${req.id}`)}
                                            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                            <span>Assegna</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Barra di ricerca */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                        <input
                            type="text"
                            value={athleteSearch}
                            onChange={(e) => setAthleteSearch(e.target.value)}
                            placeholder="Cerca atleta per nome o email..."
                            className="w-full bg-[#111726] border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Lista Atleti */}
                    {loadingAthletes ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-3xl animate-spin text-primary">sync</span>
                            Caricamento atleti...
                        </div>
                    ) : filteredAthletes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-[#111726]/40 p-6">
                            <span className="material-symbols-outlined text-slate-500 text-4xl mb-2">person_search</span>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nessun atleta trovato</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAthletes.map(athlete => (
                                <div
                                    key={athlete.id}
                                    className="bg-[#111726] border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition-all shadow-sm group"
                                >
                                    <div
                                        onClick={() => navigate(`/profile/${athlete.id}`)}
                                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary font-black text-lg overflow-hidden shrink-0 shadow-inner">
                                            {athlete.avatar_url ? (
                                                <img src={athlete.avatar_url} alt={athlete.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{athlete.name?.[0]?.toUpperCase() || '👤'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-white text-sm truncate uppercase tracking-tight group-hover:text-primary transition-colors">
                                                {athlete.name || 'Atleta senza nome'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">{athlete.email}</p>
                                            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                                <span className="text-primary flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[12px]">description</span>
                                                    {athlete.plansCount} {athlete.plansCount === 1 ? 'scheda' : 'schede'}
                                                </span>
                                                <span>•</span>
                                                <span>{athlete.workouts_completed || 0} workout</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => navigate(`/plans/new?userId=${athlete.id}`)}
                                            className="px-3 py-2 bg-primary hover:bg-primary/90 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-1 active:scale-95"
                                            title="Assegna nuova scheda a questo atleta"
                                        >
                                            <span className="material-symbols-outlined text-[14px] font-black">add</span>
                                            <span>Assegna</span>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/profile/${athlete.id}`)}
                                            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
                                            title="Vedi profilo atleta"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ATHLETE VIEW / COACH PERSONAL PLANS VIEW */}
            {(!isCoach || coachTab === 'myPlans') && (
                <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500">
                    {plans.length === 0 ? (
                        <div className="text-center py-12 px-6 border-2 border-dashed border-slate-800 rounded-3xl bg-[#111726]/50 shadow-sm">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-4xl">fitness_center</span>
                            </div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">
                                {isCoach ? 'Nessuna scheda personale' : 'Nessuna scheda assegnata'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mb-6 leading-relaxed">
                                {isCoach
                                    ? 'Crea una scheda personale per te stesso oppure assegnala a uno dei tuoi atleti.'
                                    : 'Le schede di allenamento vengono preparate su misura esclusivamente dal tuo Coach Vittorio.'}
                            </p>
                            <div className="flex flex-col gap-3 max-w-[220px] mx-auto">
                                {isCoach ? (
                                    <button
                                        onClick={() => navigate('/plans/new')}
                                        className="px-5 py-3.5 bg-primary text-slate-950 font-black uppercase text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm font-black">add</span>
                                        <span>Crea Scheda</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowRequestModal(true)}
                                        className="px-5 py-3.5 bg-primary text-slate-950 font-black uppercase text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm font-black">send</span>
                                        <span>Richiedi Scheda al Coach</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => handleStart(plan.id)}
                                className="group bg-[#111726] border border-slate-800 rounded-2xl p-5 active:scale-[0.98] transition-all cursor-pointer hover:border-primary/40 relative overflow-hidden shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-[#151d2e] border border-slate-700/60 text-[10px] font-black text-slate-300 px-2.5 py-1 rounded-md uppercase tracking-[0.2em]">
                                        {plan.days || '3gg'}
                                    </div>
                                    <div className="flex gap-2 -mr-2 -mt-2">
                                        {(isCoach || !plan.isAssigned) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/plans/new?editId=${plan.id}`); }}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 hover:scale-110 rounded-xl transition-all"
                                                title="Modifica Scheda"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleExportPDF(e, plan)}
                                            className="p-2 text-slate-400 hover:text-primary hover:scale-110 transition-all"
                                            title="Scarica PDF"
                                        >
                                            <span className="material-symbols-outlined text-xl">download</span>
                                        </button>
                                        {(isCoach || !plan.isAssigned) && (
                                            <button
                                                onClick={(e) => handleDelete(e, plan.id, plan.name)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:scale-110 rounded-xl transition-all"
                                                title="Elimina Scheda"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 pointer-events-none">
                                    <span className="material-symbols-outlined text-5xl text-primary/10">chevron_right</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors italic uppercase tracking-tighter w-[85%] truncate">
                                    {plan.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    <span className="flex items-center gap-1 text-slate-300">{plan.exercises?.length || 0} Ex</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="text-slate-400">{plan.duration_weeks || 4} Settimane</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="text-slate-400 truncate max-w-[80px]">Ultimo: {plan.lastPerformed ? new Date(plan.lastPerformed).toLocaleDateString() : 'Mai'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MODALE RICHIESTA SCHEDA */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in pt-16">
                    <div className="bg-[#111726] border border-slate-800 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
                        <button
                            onClick={() => { setShowRequestModal(false); setStep(1); setFormData({ ...formData, coach_id: coaches[0]?.id || null, location: null }); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-800/80 rounded-full p-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg block">close</span>
                        </button>
                        <h2 className="text-xl font-black text-white italic uppercase mb-2">Richiedi Scheda</h2>
                        
                        {step === 1 ? (
                            <>
                                <p className="text-slate-400 text-xs mb-4 leading-relaxed font-medium">Scegli il Coach che preparerà il tuo programma personalizzato.</p>
                                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                                    {coaches.map(coach => (
                                        <button
                                            key={coach.id}
                                            onClick={() => { setFormData(prev => ({ ...prev, coach_id: coach.id })); setStep(2); }}
                                            className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left shadow-sm ${
                                                formData.coach_id === coach.id
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-slate-800 bg-[#151d2e] hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary font-black text-lg flex-shrink-0 shadow-inner bg-slate-900 border border-slate-700">
                                                {coach.name?.[0] || 'V'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate">{coach.name || 'Coach Vittorio'}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{coach.email}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary">chevron_right</span>
                                        </button>
                                    ))}
                                    {coaches.length === 0 && (
                                        <div className="text-center py-6">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="w-full py-3 bg-primary text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl"
                                            >
                                                Continua con Coach Vittorio
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : step === 2 ? (
                            <>
                                <p className="text-slate-400 text-xs mb-4 leading-relaxed font-medium">Dove ti allenerai principalmente?</p>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button
                                        onClick={() => handleLocationSelect('home')}
                                        className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-2 shadow-sm ${
                                            formData.location === 'home'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-slate-800 bg-[#151d2e] text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-4xl">home</span>
                                        <span className="text-xs font-bold uppercase tracking-wider mt-1">A Casa</span>
                                    </button>
                                    <button
                                        onClick={() => handleLocationSelect('gym')}
                                        className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-2 shadow-sm ${
                                            formData.location === 'gym'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-slate-800 bg-[#151d2e] text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                                        <span className="text-xs font-bold uppercase tracking-wider mt-1">In Palestra</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div className="bg-[#151d2e] p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Obiettivo Principale</p>
                                    <select
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                        className="w-full bg-[#111726] text-white rounded-lg p-3 text-sm font-bold border border-slate-700 outline-none focus:border-primary appearance-none shadow-sm"
                                    >
                                        <option value="ipertrofia">💪 Ipertrofia (Massa)</option>
                                        <option value="dimagrimento">🔥 Dimagrimento</option>
                                        <option value="forza">🏋️ Forza Pura</option>
                                        <option value="tonificazione">✨ Tonificazione</option>
                                        <option value="resistenza">🏃 Resistenza / Cardio</option>
                                    </select>
                                </div>
                                <div className="bg-[#151d2e] p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex justify-between">
                                        Giorni a settimana: <span className="text-primary font-black text-sm">{formData.days}</span>
                                    </p>
                                    <input
                                        type="range"
                                        min="1"
                                        max="7"
                                        value={formData.days}
                                        onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                        className="w-full accent-primary h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2 uppercase">
                                        <span>1 Relax</span>
                                        <span>7 Beast</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Infortuni o Limitazioni</p>
                                    <textarea
                                        value={formData.injuries}
                                        onChange={(e) => setFormData({ ...formData, injuries: e.target.value })}
                                        placeholder="Es. Dolore alla spalla destra, problemi lombari..."
                                        className="w-full bg-[#151d2e] border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary min-h-[60px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Note per il Coach</p>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Es. Vorrei focalizzarmi su gambe e addome..."
                                        className="w-full bg-[#151d2e] border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary min-h-[80px]"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-4 py-3 bg-slate-800 text-slate-300 font-bold uppercase text-xs rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Indietro
                                    </button>
                                    <button
                                        disabled={submitting}
                                        onClick={submitRequest}
                                        className="flex-1 bg-primary text-slate-950 font-black uppercase py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {submitting ? 'Invio...' : <><span className="material-symbols-outlined text-lg">check</span> Invia al Coach</>}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SELETTORE GIORNO PER SPLIT ROUTINE */}
            {selectedPlanForStart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in pt-16">
                    <div className="bg-[#111726] border border-slate-800 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
                        <button
                            onClick={() => setSelectedPlanForStart(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-800/80 rounded-full p-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg block">close</span>
                        </button>
                        <h2 className="text-xl font-black text-white italic uppercase mb-2">Scegli Allenamento</h2>
                        <p className="text-slate-400 text-xs mb-6 font-medium">Quale giornata della scheda vuoi completare oggi?</p>
                        <div className="space-y-3">
                            {selectedPlanForStart.exercises.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => { startWorkout(selectedPlanForStart.id, index); navigate("/workout/active"); }}
                                    className="w-full bg-[#151d2e] hover:border-primary/50 active:scale-[0.98] border border-slate-800 p-4 rounded-xl flex items-center justify-between group transition-all shadow-sm"
                                >
                                    <div className="text-left">
                                        <h3 className="font-bold text-white uppercase group-hover:text-primary transition-colors">{day.name || `Giorno ${index + 1}`}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">{day.exercises?.length || 0} Esercizi • {Array.isArray(day.targetDays) ? day.targetDays.join(', ') : 'Libero'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
