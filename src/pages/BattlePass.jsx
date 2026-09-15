import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function BattlePass() {
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [hasMembership, setHasMembership] = useState(false);
    const [gymInfo, setGymInfo] = useState(null);
    const [season, setSeason] = useState(null);
    
    // Gamification data
    const [progress, setProgress] = useState({
        totalPoints: 0,
        currentLevel: 1,
        currentLevelXp: 0,
        nextLevelXpNeeded: 1000,
        percentProgress: 0
    });
    const [challenges, setChallenges] = useState([]);
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("challenges"); // challenges | leaderboard | badges

    useEffect(() => {
        fetchEngageData();
    }, []);

    const fetchEngageData = async () => {
        setLoading(true);
        try {
            // Se la demo è già stata attivata localmente, caricala subito
            try {
                const saved = localStorage.getItem(DEMO_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    applyDemoData(parsed);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.debug("LocalStorage demo load skipped:", e);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            // 1. Cerca affiliazione palestra attiva
            const { data: memberships, error: memError } = await supabase
                .from("gym_members")
                .select(`
                    gym_id,
                    gyms (name, country, timezone)
                `)
                .eq("user_id", user.id)
                .eq("status", "active")
                .limit(1);

            if (memError || !memberships || memberships.length === 0) {
                setHasMembership(false);
                setLoading(false);
                return;
            }

            setHasMembership(true);
            const gymId = memberships[0].gym_id;
            setGymInfo(memberships[0].gyms);

            // 2. Recupera stagione attiva
            const { data: seasons } = await supabase
                .from("seasons")
                .select("*")
                .eq("gym_id", gymId)
                .eq("is_active", true)
                .order("start_date", { ascending: false })
                .limit(1);

            if (seasons && seasons.length > 0) {
                setSeason(seasons[0]);
            }

            // 3. Calcola XP totali dal points_ledger
            const { data: ledger } = await supabase
                .from("points_ledger")
                .select("points")
                .eq("member_user_id", user.id)
                .eq("gym_id", gymId);

            const total = (ledger || []).reduce((acc, curr) => acc + curr.points, 0);
            const level = Math.floor(total / 1000) + 1;
            const xp = total % 1000;
            const needed = 1000 - xp;
            setProgress({
                totalPoints: total,
                currentLevel: level,
                currentLevelXp: xp,
                nextLevelXpNeeded: needed,
                percentProgress: (xp / 1000.0) * 100
            });

            // 4. Carica le challenge attive del socio
            const { data: challengesData } = await supabase
                .from("challenges")
                .select(`
                    *,
                    challenge_enrollments!left(*),
                    challenge_progress!left(*)
                `)
                .eq("gym_id", gymId)
                .eq("is_active", true);

            const processedChallenges = (challengesData || []).map(c => {
                const enrollment = (c.challenge_enrollments || []).find(e => e.member_user_id === user.id);
                const prog = (c.challenge_progress || []).find(p => p.member_user_id === user.id);
                return {
                    ...c,
                    enrolled: !!enrollment,
                    status: enrollment ? enrollment.status : "not_enrolled",
                    current_value: prog ? parseFloat(prog.current_value) : 0.0
                };
            });
            setChallenges(processedChallenges);

            // 5. Carica i badge sbloccati
            const { data: userBadges } = await supabase
                .from("member_badges")
                .select(`
                    earned_at,
                    badges (*)
                `)
                .eq("member_user_id", user.id);

            setBadges(userBadges || []);

            // 6. Genera classifica aggregando i punti del ledger
            const { data: ledgerPoints } = await supabase
                .from("points_ledger")
                .select(`
                    member_user_id,
                    points,
                    profiles (name, avatar_url)
                `)
                .eq("gym_id", gymId);

            const userPointsMap = {};
            (ledgerPoints || []).forEach(row => {
                const uid = row.member_user_id;
                const name = row.profiles?.name || "Utente";
                const avatar = row.profiles?.avatar_url || null;
                if (!userPointsMap[uid]) {
                    userPointsMap[uid] = { name, avatar_url: avatar, points: 0 };
                }
                userPointsMap[uid].points += row.points;
            });

            const sortedLeaderboard = Object.entries(userPointsMap)
                .map(([id, info]) => ({
                    user_id: id,
                    name: info.name,
                    avatar_url: info.avatar_url,
                    total_points: info.points,
                    level: Math.floor(info.points / 1000) + 1
                }))
                .sort((a, b) => b.total_points - a.total_points);

            setLeaderboard(sortedLeaderboard);

        } catch (e) {
            console.error("Errore nel caricamento del Battle Pass:", e);
        }
        setLoading(false);
    };

    const DEMO_STORAGE_KEY = "onlygym_demo_battlepass";

    const getDefaultDemoData = () => ({
        gymInfo: { name: "ONLYGYM ARENA", country: "IT", timezone: "Europe/Rome" },
        season: { name: "Stagione 1: Titan Genesis" },
        progress: {
            totalPoints: 350,
            currentLevel: 1,
            currentLevelXp: 350,
            nextLevelXpNeeded: 650,
            percentProgress: 35
        },
        challenges: [
            {
                id: "c1",
                title: "10.000 KG Volume Warrior",
                description: "Accumula un volume totale di 10.000 kg negli esercizi fondamentali.",
                points_reward: 250,
                target_value: 10000,
                current_value: 3250,
                unit: "kg",
                enrolled: true,
                status: "enrolled"
            },
            {
                id: "c2",
                title: "5 Workout Completati",
                description: "Porta a termine almeno 5 sessioni di allenamento registrate.",
                points_reward: 300,
                target_value: 5,
                current_value: 2,
                unit: "sessioni",
                enrolled: true,
                status: "enrolled"
            },
            {
                id: "c3",
                title: "Century Bench Press",
                description: "Raggiungi 100 kg di massimale o supera il tuo PR di panca.",
                points_reward: 500,
                target_value: 100,
                current_value: 85,
                unit: "kg",
                enrolled: false,
                status: "not_enrolled"
            },
            {
                id: "c4",
                title: "Leg Day Dominator",
                description: "Esegui almeno 12 serie pesanti tra squat e pressa.",
                points_reward: 200,
                target_value: 12,
                current_value: 12,
                unit: "serie",
                enrolled: true,
                status: "completed"
            }
        ],
        badges: [
            {
                earned_at: new Date(Date.now() - 7 * 86400000).toISOString(),
                badges: {
                    id: "b1",
                    name: "Primo Passo",
                    description: "Hai registrato il tuo primo allenamento su OnlyGym.",
                    icon: "fitness_center"
                }
            },
            {
                earned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
                badges: {
                    id: "b2",
                    name: "Centurione",
                    description: "Superata la soglia di 100 ripetizioni complessive.",
                    icon: "military_tech"
                }
            }
        ],
        leaderboard: [
            { user_id: "u1", name: "Marco 'Iron' R.", avatar_url: null, total_points: 4850, level: 5 },
            { user_id: "u2", name: "Sofia B.", avatar_url: null, total_points: 3420, level: 4 },
            { user_id: "u_me", name: "Tu (Atleta)", avatar_url: null, total_points: 350, level: 1 },
            { user_id: "u4", name: "Luca V.", avatar_url: null, total_points: 200, level: 1 }
        ]
    });

    const applyDemoData = (data = null) => {
        const d = data || getDefaultDemoData();
        setHasMembership(true);
        setGymInfo(d.gymInfo);
        setSeason(d.season);
        setProgress(d.progress);
        setChallenges(d.challenges);
        setBadges(d.badges);
        setLeaderboard(d.leaderboard);
        try {
            localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(d));
        } catch (e) {
            console.debug("LocalStorage demo save skipped:", e);
        }
    };

    const handleEnroll = async (challengeId) => {
        try {
            setChallenges(prev => {
                const next = prev.map(c => c.id === challengeId ? { ...c, enrolled: true, status: "enrolled", current_value: 0 } : c);
                try {
                    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        parsed.challenges = next;
                        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(parsed));
                    }
                } catch (e) {
                    console.debug("LocalStorage demo challenge update skipped:", e);
                }
                return next;
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("challenge_enrollments").insert({
                    challenge_id: challengeId,
                    member_user_id: user.id,
                    status: "enrolled"
                });
                await supabase.from("challenge_progress").insert({
                    challenge_id: challengeId,
                    member_user_id: user.id,
                    current_value: 0
                });
            }
        } catch (error) {
            console.error("Errore iscrizione challenge:", error);
        }
    };

    const handleSeedDemo = async () => {
        setSeeding(true);
        try {
            // Prova prima via RPC Supabase
            const { error } = await supabase.rpc("seed_user_engage_demo");
            if (!error) {
                await fetchEngageData();
            } else {
                console.warn("RPC Supabase non presente o non configurata, attivazione demo locale:", error.message);
                applyDemoData();
            }
        } catch (e) {
            console.warn("Attivazione fallback demo:", e);
            applyDemoData();
        }
        setSeeding(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-slate-400 mb-4"></div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Caricamento ONLYGYM Engage...</p>
            </div>
        );
    }

    // Boarding Screen se l'utente non ha una palestra configurata
    if (!hasMembership) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-900/50 rounded-3xl border border-slate-700/50 flex items-center justify-center text-slate-300 mb-6 shadow-2xl">
                    <span className="material-symbols-outlined text-4xl animate-pulse">trophy</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2">OnlyGym Engage</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Battle Pass & Gamification per palestre</p>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
                    Sfida i tuoi amici in palestra, sblocca obiettivi straordinari, scala la classifica e converti i tuoi allenamenti in premi reali.
                </p>
                <button
                    onClick={handleSeedDemo}
                    disabled={seeding}
                    className="w-full max-w-xs bg-white text-black font-black uppercase tracking-widest py-4 px-6 rounded-2xl shadow-lg hover:bg-slate-100 active:scale-95 transition-all text-xs disabled:opacity-50"
                >
                    {seeding ? "Attivazione..." : "Attiva Battle Pass Demo"}
                </button>
                <button onClick={() => navigate(-1)} className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-400 uppercase tracking-widest">
                    Torna Indietro
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 font-display">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{gymInfo?.name}</span>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-white leading-tight">ONLYGYM ENGAGE</h1>
                    </div>
                </div>
                <div className="bg-violet-950/40 text-violet-400 p-2 rounded-xl border border-violet-800/30">
                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
            </div>

            {/* Stagione Info & Livello */}
            {season && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-9xl text-violet-500">military_tech</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-[9px] font-black tracking-widest text-violet-400 uppercase">Stagione Attiva</span>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-white mb-4 mt-0.5">{season.name}</h2>
                        
                        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Livello {progress.currentLevel}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{progress.currentLevelXp} / 1000 XP</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress.percentProgress}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-amber-500">bolt</span>
                                Mancano <strong>{progress.nextLevelXpNeeded} XP</strong> al livello successivo.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex bg-slate-900 border border-slate-850 rounded-2xl p-1 mb-6">
                <button 
                    onClick={() => setActiveTab("challenges")}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
                        ${activeTab === "challenges" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-400"}`}
                >
                    <span className="material-symbols-outlined text-sm">swords</span> Sfide
                </button>
                <button 
                    onClick={() => setActiveTab("leaderboard")}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
                        ${activeTab === "leaderboard" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-400"}`}
                >
                    <span className="material-symbols-outlined text-sm">leaderboard</span> Classifica
                </button>
                <button 
                    onClick={() => setActiveTab("badges")}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5
                        ${activeTab === "badges" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-400"}`}
                >
                    <span className="material-symbols-outlined text-sm">award</span> Badge
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "challenges" && (
                <div className="space-y-4">
                    {challenges.map(c => {
                        const isEnrolled = c.enrolled;
                        const isCompleted = c.status === "completed";
                        const target = c.target_value;
                        const curr = c.current_value;
                        const percent = Math.min((curr / target) * 100, 100);

                        return (
                            <div key={c.id} className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 relative overflow-hidden flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white tracking-tight">{c.title}</h3>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.description}</p>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center shrink-0">
                                        <span className="text-[10px] text-violet-400 font-bold block">+{c.points_reward} XP</span>
                                    </div>
                                </div>

                                {isEnrolled && (
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900">
                                        <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase tracking-wider">Progresso</span>
                                            <span className="text-slate-500">{curr} / {target} {c.unit}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-violet-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {!isEnrolled ? (
                                    <button 
                                        onClick={() => handleEnroll(c.id)}
                                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-violet-500/10"
                                    >
                                        Iscriviti alla Sfida
                                    </button>
                                ) : isCompleted ? (
                                    <div className="w-full py-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Sfida Completata
                                    </div>
                                ) : (
                                    <div className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">run_circle</span> Sfida In Corso
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === "leaderboard" && (
                <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-4 shadow-xl">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4 px-2">Classifica Olympus</h3>
                    <div className="divide-y divide-slate-800/60">
                        {leaderboard.map((user, i) => {
                            const isMe = user.user_id === supabase.auth.getUser(); // simplificato per render
                            return (
                                <div key={user.user_id} className={`flex items-center justify-between py-3.5 px-2 ${isMe ? 'bg-violet-950/20' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-amber-400 font-black' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="size-9 rounded-full overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-400">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                user.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-none">Livello {user.level}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-violet-400">{user.total_points} XP</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "badges" && (
                <div className="grid grid-cols-2 gap-4">
                    {badges.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-slate-500 border border-slate-800 rounded-3xl bg-slate-900/30">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">award</span>
                            <p className="font-bold text-xs uppercase tracking-wider">Nessun badge sbloccato</p>
                            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Completa le sfide ed allenati per sbloccarli</p>
                        </div>
                    ) : (
                        badges.map(b => (
                            <div key={b.badges.id} className="bg-slate-900 border border-slate-800/80 rounded-3xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent"></div>
                                <div className="w-12 h-12 rounded-full bg-violet-950/40 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-1">
                                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {b.badges.icon || "military_tech"}
                                    </span>
                                </div>
                                <h4 className="text-xs font-black uppercase text-white leading-tight tracking-tight">{b.badges.name}</h4>
                                <p className="text-[9px] text-slate-400 leading-snug">{b.badges.description}</p>
                                <span className="text-[8px] text-slate-500 mt-1 font-semibold">{new Date(b.earned_at).toLocaleDateString()}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    );
}
