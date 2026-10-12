// Gestione ricompense e personalizzazioni digitali per OnlyGym Battle Pass

export const BATTLEPASS_REWARDS = [
    {
        level: 1,
        type: "title",
        title: "Novizio della Ghisa",
        description: "Il primo passo nel tempio del ferro.",
        icon: "military_tech",
        color: "text-slate-300",
        badgeBg: "bg-slate-800/80",
        value: "Novizio della Ghisa"
    },
    {
        level: 3,
        type: "sound",
        title: "Beep Sci-Fi",
        description: "Effetto sonoro sintetico per il rest timer.",
        icon: "volume_up",
        color: "text-cyan-400",
        badgeBg: "bg-cyan-950/80",
        value: "scifi"
    },
    {
        level: 5,
        type: "theme",
        title: "Emerald Beast",
        description: "Tema ad alto contrasto verde smeraldo & nero profondo.",
        icon: "palette",
        color: "text-emerald-400",
        badgeBg: "bg-emerald-950/80",
        value: "emerald"
    },
    {
        level: 8,
        type: "title",
        title: "Panca Addict",
        description: "Per chi non salta mai il lunedì sul bilanciere.",
        icon: "fitness_center",
        color: "text-amber-400",
        badgeBg: "bg-amber-950/80",
        value: "Panca Addict"
    },
    {
        level: 10,
        type: "frame",
        title: "Acciaio Spazzolato",
        description: "Cornice metallica rinforzata per il tuo avatar.",
        icon: "shield",
        color: "text-slate-200",
        badgeBg: "bg-slate-800/80",
        value: "steel"
    },
    {
        level: 15,
        type: "theme",
        title: "Cyberpunk Neon",
        description: "Tema elettrico viola synthwave e ciano neon.",
        icon: "palette",
        color: "text-purple-400",
        badgeBg: "bg-purple-950/80",
        value: "cyberpunk"
    },
    {
        level: 18,
        type: "sound",
        title: "Campana da Boxe",
        description: "Il classico rintocco da ring a fine recupero.",
        icon: "notifications_active",
        color: "text-amber-300",
        badgeBg: "bg-amber-950/80",
        value: "boxing"
    },
    {
        level: 20,
        type: "frame",
        title: "Neon Glow Pulsante",
        description: "Bordo luminescente ad anello neon attorno all'avatar.",
        icon: "flare",
        color: "text-cyan-300",
        badgeBg: "bg-cyan-950/80",
        value: "neon"
    },
    {
        level: 25,
        type: "theme",
        title: "Crimson Titan",
        description: "Rosso rubino feroce e nero fibra di carbonio.",
        icon: "palette",
        color: "text-rose-500",
        badgeBg: "bg-rose-950/80",
        value: "crimson"
    },
    {
        level: 30,
        type: "title",
        title: "Macchina da Guerra",
        description: "Nessun cedimento, solo pura determinazione.",
        icon: "bolt",
        color: "text-orange-400",
        badgeBg: "bg-orange-950/80",
        value: "Macchina da Guerra"
    },
    {
        level: 35,
        type: "frame",
        title: "Fiamma Ardente",
        description: "Bordo con alone infuocato per atleti inarrestabili.",
        icon: "local_fire_department",
        color: "text-orange-500",
        badgeBg: "bg-orange-950/80",
        value: "flame"
    },
    {
        level: 40,
        type: "theme",
        title: "Stealth AMOLED",
        description: "Nero assoluto ultra-minimal con dettagli titanio.",
        icon: "palette",
        color: "text-slate-400",
        badgeBg: "bg-zinc-900",
        value: "stealth"
    },
    {
        level: 45,
        type: "sound",
        title: "Gong dei Campioni",
        description: "Rintocco profondo di gong solenne per ripartire.",
        icon: "graphic_eq",
        color: "text-yellow-400",
        badgeBg: "bg-yellow-950/80",
        value: "gong"
    },
    {
        level: 50,
        type: "theme",
        title: "Gold Olympus",
        description: "Il massimo status: sfumature oro puro 24k e aura leggendaria.",
        icon: "workspace_premium",
        color: "text-yellow-300",
        badgeBg: "bg-yellow-950/90",
        value: "gold"
    }
];

export const THEME_COLORS = {
    default: "#0df289",
    emerald: "#10b981",
    cyberpunk: "#a855f7",
    crimson: "#f43f5e",
    stealth: "#94a3b8",
    gold: "#eab308"
};

// Recupera personalizzazioni equipaggiate
export function getEquippedCustomizations() {
    try {
        return {
            title: localStorage.getItem("onlygym_equipped_title") || "Novizio della Ghisa",
            theme: localStorage.getItem("onlygym_equipped_theme") || "default",
            frame: localStorage.getItem("onlygym_equipped_frame") || "default",
            sound: localStorage.getItem("onlygym_equipped_sound") || "default"
        };
    } catch {
        return { title: "Novizio della Ghisa", theme: "default", frame: "default", sound: "default" };
    }
}

// Equipaggia una personalizzazione
export function equipCustomization(type, value) {
    try {
        if (type === "title") localStorage.setItem("onlygym_equipped_title", value);
        if (type === "theme") {
            localStorage.setItem("onlygym_equipped_theme", value);
            applyEquippedTheme(value);
        }
        if (type === "frame") localStorage.setItem("onlygym_equipped_frame", value);
        if (type === "sound") localStorage.setItem("onlygym_equipped_sound", value);
        
        window.dispatchEvent(new CustomEvent("onlygym:customization-changed", { detail: { type, value } }));
    } catch (e) {
        console.error("Errore salvataggio personalizzazione:", e);
    }
}

// Applica colore del tema su document.documentElement
export function applyEquippedTheme(themeName) {
    const theme = themeName || getEquippedCustomizations().theme;
    const color = THEME_COLORS[theme] || THEME_COLORS.default;
    if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--c-primary", color);
    }
}

// Classe CSS per la cornice dell'avatar
export function getAvatarFrameClass(frameType) {
    switch (frameType) {
        case "steel":
            return "border-4 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.6)]";
        case "neon":
            return "border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse";
        case "flame":
            return "border-4 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.9)]";
        case "gold":
            return "border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)]";
        default:
            return "border-2 border-primary";
    }
}

// Riproduce il suono del timer o dell'anteprima
export function playRewardSound(soundType) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const playTone = (freq, type, duration, delay = 0, peakGain = 0.3) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(peakGain, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        };

        if (soundType === "scifi") {
            playTone(550, "sine", 0.08, 0, 0.25);
            playTone(880, "sine", 0.08, 0.08, 0.25);
            playTone(1320, "sine", 0.25, 0.16, 0.3);
        } else if (soundType === "boxing") {
            playTone(980, "triangle", 0.25, 0, 0.4);
            playTone(980, "triangle", 0.35, 0.22, 0.4);
        } else if (soundType === "gong") {
            playTone(180, "sine", 1.8, 0, 0.45);
            playTone(270, "sine", 1.4, 0.05, 0.25);
            playTone(360, "sine", 1.0, 0.1, 0.15);
        } else {
            // Default beep
            playTone(880, "sine", 0.4, 0, 0.3);
        }
    } catch (e) {
        console.debug("Web Audio non disponibile:", e);
    }
}

