import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import { 
    BATTLEPASS_REWARDS, 
    THEME_COLORS, 
    getEquippedCustomizations, 
    equipCustomization, 
    getAvatarFrameClass, 
    playRewardSound 
} from "../services/customization";

export default function BattlePass() {
    const navigate = useNavigate();
    const { history, userProfile } = useStore();
    
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [gymInfo, setGymInfo] = useState({ name: "ONLYGYM ARENA", country: "IT", timezone: "Europe/Rome" });
    const [season, setSeason] = useState({ name: "Stagione 1: Titan Genesis" });
    
    // Gamification data
    const [progress, setProgress] = useState({
        totalPoints: 350,
        currentLevel: 1,
        currentLevelXp: 350,
        nextLevelXpNeeded: 650,
        percentProgress: 35
    });
    const [challenges, setChallenges] = useState([]);
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("rewards"); // rewards | challenges | leaderboard | badges
    
    // Personalizzazioni equipaggiate
    const [customizations, setCustomizations] = useState(getEquippedCustomizations());
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const DEMO_STORAGE_KEY = "onlygym_demo_battlepass";

    const getDefaultDemoData = () => ({
        gymInfo: { name: "ONLYGYM ARENA", country: "IT", timezone: "Europe/Rome" },
        season: { name: "Stagione 1: Titan Genesis" },
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
            { user_id: "u_me", name: userProfile?.name || "Tu (Atleta)", avatar_url: userProfile?.avatar_url || null, total_points: 350, level: 1 },
            { user_id: "u4", name: "Luca V.", avatar_url: null, total_points: 200, level: 1 }
        ]
    });

    useEffect(() => {
        fetchEngageData();
    }, [history?.length, userProfile?.streak]);

    const fetchEngageData = async () => {
        setLoading(true);
        try {
            const workoutCount = history?.length || 0;
            const streakDays = userProfile?.streak || 0;
            const workoutXp = workoutCount * 250;
            const streakXp = streakDays * 50;
            const basePoints = Math.max(350, workoutXp + streakXp);

            const level = Math.floor(basePoints / 1000) + 1;
            const xp = basePoints % 1000;
            const needed = 1000 - xp;

            const calcProgress = {
                totalPoints: basePoints,
                currentLevel: level,
                currentLevelXp: xp,
                nextLevelXpNeeded: needed,
                percentProgress: (xp / 1000.0) * 100
            };

            const demo = getDefaultDemoData();
            // Aggiorna punteggio utente in classifica demo
            demo.leaderboard = demo.leaderboard.map(u => 
                u.user_id === "u_me" 
                    ? { ...u, name: userProfile?.name || "Tu (Atleta)", avatar_url: userProfile?.avatar_url, total_points: basePoints, level } 
                    : u
            ).sort((a, b) => b.total_points - a.total_points);

            setGymInfo(demo.gymInfo);
            setSeason(demo.season);
            setProgress(calcProgress);
            setChallenges(demo.challenges);
            setBadges(demo.badges);
            setLeaderboard(demo.leaderboard);

            // Prova comunque a interrogare Supabase se ci sono dati reali
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: memberships } = await supabase
                        .from("gym_members")
                        .select("gym_id, gyms(name, country, timezone)")
                        .eq("user_id", user.id)
                        .eq("status", "active")
                        .limit(1);

                    if (memberships && memberships.length > 0) {
                        const gymId = memberships[0].gym_id;
                        setGymInfo(memberships[0].gyms);

                        const { data: seasons } = await supabase
                            .from("seasons")
                            .select("*")
                            .eq("gym_id", gymId)
                            .eq("is_active", true)
                            .limit(1);
                        if (seasons && seasons.length > 0) setSeason(seasons[0]);
                    }
                }
            } catch (e) {
                console.debug("Supabase gym sync skipped:", e);
            }

        } catch (e) {
            console.error("Errore caricamento Battle Pass:", e);
        }
        setLoading(false);
    };

    const handleEquip = (type, value, title) => {
        equipCustomization(type, value);
        setCustomizations(getEquippedCustomizations());
        if (type === "sound") {
            playRewardSound(value);
        }
        setFeedbackMsg(`Equipaggiato: ${title}`);
        setTimeout(() => setFeedbackMsg(""), 2200);
    };

    const handleEnroll = (challengeId) => {
        setChallenges(prev => 
            prev.map(c => c.id === challengeId ? { ...c, enrolled: true, status: "enrolled", current_value: 0 } : c)
        );
        setFeedbackMsg("Iscritto alla sfida!");
        setTimeout(() => setFeedbackMsg(""), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4"></div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Caricamento Battle Pass...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 pb-24 font-display">
            
            {/* Toast Feedback */}
            {feedbackMsg && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-primary text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{feedbackMsg}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{gymInfo?.name}</span>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-white leading-tight">ONLYGYM BATTLE PASS</h1>
                    </div>
                </div>
                <div className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                </div>
            </div>

            {/* Banner Stagione & Barra Livello */}
            {season && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-5 shadow-2xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-9xl text-primary">trophy</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black tracking-widest text-primary uppercase">Stagione Attiva</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pass Liv. {progress.currentLevel} / 50</span>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white mb-4">{season.name}</h2>
                        
                        <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-4">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="text-xs text-white font-black uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-primary animate-pulse" /> Livello {progress.currentLevel}
                                </span>
                                <span className="text-[11px] text-slate-400 font-bold font-mono">{progress.currentLevelXp} / 1000 XP</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(13,242,137,0.6)]" style={{ width: `${progress.percentProgress}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                    Mancano <strong>{progress.nextLevelXpNeeded} XP</strong> al prossimo sblocco
                                </span>
                                <span className="font-mono text-[9px] text-slate-500">{progress.totalPoints} XP Totali</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Assetto Attivo (Equipped Loadout Bar) */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3.5 mb-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">
                    Il Tuo Assetto Equipaggiato
                </span>
                <div className="grid grid-cols-2 gap-2">
                    {/* Titolo */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-lg">military_tech</span>
                        <div className="overflow-hidden">
                            <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Titolo</p>
                            <p className="text-xs font-black text-white truncate">{customizations.title}</p>
                        </div>
                    </div>
                    {/* Tema */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                        <div className="size-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: THEME_COLORS[customizations.theme] || THEME_COLORS.default }} />
                        <div className="overflow-hidden">
                            <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Tema UI</p>
                            <p className="text-xs font-black text-white capitalize truncate">{customizations.theme}</p>
                        </div>
                    </div>
                    {/* Cornice */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
                        <div className={`size-5 rounded-full bg-slate-800 shrink-0 ${getAvatarFrameClass(customizations.frame)}`} />
                        <div className="overflow-hidden">
                            <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Cornice Avatar</p>
                            <p className="text-xs font-black text-white capitalize truncate">{customizations.frame}</p>
                        </div>
                    </div>
                    {/* Suono */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="material-symbols-outlined text-cyan-400 text-lg">volume_up</span>
                            <div className="overflow-hidden">
                                <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Suono Timer</p>
                                <p className="text-xs font-black text-white capitalize truncate">{customizations.sound}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => playRewardSound(customizations.sound)}
                            title="Ascolta anteprima"
                            className="size-6 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-4 bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-6 gap-1">
                <button 
                    onClick={() => setActiveTab("rewards")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex flex-col items-center justify-center gap-1
                        ${activeTab === "rewards" ? "bg-primary text-slate-950 font-black shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"}`}
                >
                    <span className="material-symbols-outlined text-lg leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                    <span>Premi</span>
                </button>
                <button 
                    onClick={() => setActiveTab("challenges")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex flex-col items-center justify-center gap-1
                        ${activeTab === "challenges" ? "bg-primary text-slate-950 font-black shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"}`}
                >
                    <span className="material-symbols-outlined text-lg leading-none">swords</span>
                    <span>Sfide</span>
                </button>
                <button 
                    onClick={() => setActiveTab("leaderboard")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex flex-col items-center justify-center gap-1
                        ${activeTab === "leaderboard" ? "bg-primary text-slate-950 font-black shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"}`}
                >
                    <span className="material-symbols-outlined text-lg leading-none">leaderboard</span>
                    <span>Classifica</span>
                </button>
                <button 
                    onClick={() => setActiveTab("badges")}
                    className={`py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all flex flex-col items-center justify-center gap-1
                        ${activeTab === "badges" ? "bg-primary text-slate-950 font-black shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"}`}
                >
                    <span className="material-symbols-outlined text-lg leading-none">award</span>
                    <span>Badge</span>
                </button>
            </div>

            {/* Tab: RICOMPENSE (Rewards Track) */}
            {activeTab === "rewards" && (
                <div className="space-y-3.5">
                    <div className="flex justify-between items-center px-1 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Percorso Ricompense Stagionali
                        </span>
                        <span className="text-[10px] font-bold text-primary">
                            {BATTLEPASS_REWARDS.filter(r => progress.currentLevel >= r.level).length} / {BATTLEPASS_REWARDS.length} Sbloccati
                        </span>
                    </div>

                    {BATTLEPASS_REWARDS.map(reward => {
                        const isUnlocked = progress.currentLevel >= reward.level;
                        const isEquipped = (
                            (reward.type === "title" && customizations.title === reward.value) ||
                            (reward.type === "theme" && customizations.theme === reward.value) ||
                            (reward.type === "frame" && customizations.frame === reward.value) ||
                            (reward.type === "sound" && customizations.sound === reward.value)
                        );

                        const typeLabel = 
                            reward.type === "theme" ? "Tema UI" :
                            reward.type === "frame" ? "Cornice Avatar" :
                            reward.type === "sound" ? "Suono Timer" : "Titolo Profilo";

                        return (
                            <div 
                                key={`${reward.type}-${reward.level}`}
                                className={`rounded-3xl p-4 border transition-all relative overflow-hidden flex items-center justify-between gap-3.5
                                    ${isUnlocked 
                                        ? "bg-slate-900/90 border-slate-700/80 shadow-lg" 
                                        : "bg-slate-950/60 border-slate-900 opacity-70"}`}
                            >
                                {/* Level Badge & Icon */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className={`size-12 rounded-2xl flex items-center justify-center border shadow-inner ${reward.badgeBg} border-white/10`}>
                                            <span className={`material-symbols-outlined text-2xl ${reward.color}`}>
                                                {reward.icon}
                                            </span>
                                        </div>
                                        <span className={`absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-md text-[8px] font-black font-mono border
                                            ${isUnlocked ? "bg-primary text-slate-950 border-primary" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                                            LV.{reward.level}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {typeLabel}
                                            </span>
                                            {reward.type === "theme" && (
                                                <span 
                                                    className="size-2.5 rounded-full border border-white/30" 
                                                    style={{ backgroundColor: THEME_COLORS[reward.value] || THEME_COLORS.default }}
                                                />
                                            )}
                                        </div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">
                                            {reward.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                            {reward.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions / Status */}
                                <div className="shrink-0 flex items-center gap-1.5">
                                    {reward.type === "sound" && (
                                        <button 
                                            onClick={() => playRewardSound(reward.value)}
                                            title="Ascolta anteprima"
                                            className="size-8 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        </button>
                                    )}

                                    {isUnlocked ? (
                                        isEquipped ? (
                                            <span className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black uppercase tracking-wider text-[10px] rounded-xl flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">check</span> In Uso
                                            </span>
                                        ) : (
                                            <button 
                                                onClick={() => handleEquip(reward.type, reward.value, reward.title)}
                                                className="px-3.5 py-2 bg-primary hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider text-[10px] rounded-xl shadow-md transition-all active:scale-95"
                                            >
                                                Equipaggia
                                            </button>
                                        )
                                    ) : (
                                        <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                            <span className="material-symbols-outlined text-slate-600 text-base block">lock</span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase block">Liv {reward.level}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tab: SFIDE */}
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
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-center shrink-0">
                                        <span className="text-[10px] text-primary font-bold block">+{c.points_reward} XP</span>
                                    </div>
                                </div>

                                {isEnrolled && (
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900">
                                        <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-bold">
                                            <span className="text-slate-400 uppercase tracking-wider">Progresso</span>
                                            <span className="text-slate-500">{curr} / {target} {c.unit}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {!isEnrolled ? (
                                    <button 
                                        onClick={() => handleEnroll(c.id)}
                                        className="w-full py-3 bg-primary hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-lg shadow-primary/20"
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

            {/* Tab: CLASSIFICA */}
            {activeTab === "leaderboard" && (
                <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-4 shadow-xl">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-4 px-2">Classifica Stagionale</h3>
                    <div className="divide-y divide-slate-800/60">
                        {leaderboard.map((user, i) => {
                            const isMe = user.user_id === "u_me";
                            return (
                                <div key={user.user_id} className={`flex items-center justify-between py-3.5 px-2 rounded-xl transition-colors ${isMe ? 'bg-primary/10 border border-primary/20' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-amber-400 font-black text-base' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
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
                                            <p className="text-sm font-bold text-white leading-none flex items-center gap-1.5">
                                                {user.name}
                                                {isMe && <span className="text-[9px] bg-primary text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">Tu</span>}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1 leading-none">Livello {user.level}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-primary font-mono">{user.total_points} XP</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tab: BADGE */}
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
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
                                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
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
