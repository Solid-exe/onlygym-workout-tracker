// Mappa di alternative biomeccaniche con coefficienti di conversione
// ratio: moltiplicatore per il peso (es. 0.4 significa Peso * 0.4)
// nota: per esercizi con due manubri, il ratio si intende PER MANUBRIO se l'esercizio originale era bilanciere.

export const smartSwapRules = {
    // === PETTO ===
    "panca piana bilanciere": [
        { name: "Spinte Manubri Piana", ratio: 0.4 },
        { name: "Chest Press", ratio: 0.85 },
        { name: "Push Ups Zavorrati", ratio: 0.6 }
    ],
    "panca piana": [
        { name: "Spinte Manubri Piana", ratio: 0.4 },
        { name: "Chest Press", ratio: 0.85 }
    ],
    "panca piana con bilanciere": [
        { name: "Spinte Manubri Piana", ratio: 0.4 },
        { name: "Chest Press", ratio: 0.85 }
    ],
    "spinte panca piana": [
        { name: "Panca Piana Bilanciere", ratio: 2.2 },
        { name: "Chest Press", ratio: 2.0 }
    ],
    "spinte panca piana manubri": [
        { name: "Panca Piana Bilanciere", ratio: 2.2 },
        { name: "Chest Press", ratio: 2.0 }
    ],
    "spinte con manubri": [
        { name: "Panca Piana Bilanciere", ratio: 2.2 },
        { name: "Chest Press", ratio: 2.0 }
    ],
    "panca inclinata manubri": [
        { name: "Panca Inclinata Bilanciere", ratio: 2.2 },
        { name: "Incline Chest Press", ratio: 2.0 }
    ],
    "panca inclinata bilanciere": [
        { name: "Panca Inclinata Manubri", ratio: 0.4 },
        { name: "Incline Chest Press", ratio: 0.85 }
    ],
    "croci manubri": [
        { name: "Pectoral Machine", ratio: 1.2 },
        { name: "Cavi Incrociati (Crossover)", ratio: 1.0 }
    ],
    "croci manubri panca piana": [
        { name: "Pectoral Machine", ratio: 1.2 },
        { name: "Cavi Incrociati (Crossover)", ratio: 1.0 }
    ],
    "crocifissi con funi": [
        { name: "Croci Manubri", ratio: 0.8 },
        { name: "Pectoral Machine", ratio: 1.0 }
    ],
    "pectoral machine": [
        { name: "Croci Manubri", ratio: 0.8 },
        { name: "Crossover", ratio: 0.85 }
    ],
    "chest press": [
        { name: "Panca Piana Bilanciere", ratio: 1.1 },
        { name: "Spinte Manubri", ratio: 0.5 }
    ],
    "dip parallele": [
        { name: "Panca Piana Stretta", ratio: 0.8 },
        { name: "Push Down (Tricipiti)", ratio: 0.6 }
    ],
    "crossover": [
        { name: "Croci Manubri", ratio: 1.0 },
        { name: "Pectoral Machine", ratio: 1.1 }
    ],
    "crossover ai cavi": [
        { name: "Croci Manubri", ratio: 1.0 },
        { name: "Pectoral Machine", ratio: 1.1 }
    ],

    // === DORSO ===
    "trazioni alla sbarra": [
        { name: "Lat Machine Avanti", ratio: 1.0 },
        { name: "Lat Machine Presa Inversa", ratio: 0.9 }
    ],
    "trazioni con bilanciere": [
        { name: "Rematore Bilanciere", ratio: 1.0 },
        { name: "Lat Machine Avanti", ratio: 0.9 }
    ],
    "lat machine avanti": [
        { name: "Trazioni Assistite", ratio: 1.0 },
        { name: "Pull Down Braccia Tese", ratio: 0.6 }
    ],
    "lat machine dietro": [
        { name: "Lat Machine Avanti", ratio: 1.0 },
        { name: "Trazioni alla Sbarra", ratio: 1.0 }
    ],
    "rematore bilanciere": [
        { name: "Rematore Manubrio", ratio: 0.45 },
        { name: "Pulley Basso", ratio: 0.8 },
        { name: "Vertical Row", ratio: 0.85 }
    ],
    "rematore con bilanciere": [
        { name: "Rematore Manubrio", ratio: 0.45 },
        { name: "Pulley Basso", ratio: 0.8 }
    ],
    "remi con manubri": [
        { name: "Rematore Bilanciere", ratio: 2.1 },
        { name: "Pulley Basso", ratio: 0.9 }
    ],
    "rematore manubrio": [
        { name: "Rematore Bilanciere", ratio: 2.1 },
        { name: "Pulley Basso (Unilaterale)", ratio: 0.9 }
    ],
    "pulley basso": [
        { name: "Rematore Bilanciere", ratio: 1.2 },
        { name: "Vertical Row", ratio: 1.0 }
    ],
    "vertical row": [
        { name: "Rematore Bilanciere", ratio: 1.1 },
        { name: "Pulley Basso", ratio: 1.0 }
    ],
    "pull down braccia tese": [
        { name: "Lat Machine Avanti", ratio: 1.4 },
        { name: "Pull Over Manubrio", ratio: 0.8 }
    ],
    "pull-apart con funo": [
        { name: "Face Pull", ratio: 1.0 },
        { name: "Alzate Posteriori 90°", ratio: 0.8 }
    ],

    // === GAMBE ===
    "squat bilanciere": [
        { name: "Leg Press 45°", ratio: 2.5 },
        { name: "Goblet Squat", ratio: 0.4 },
        { name: "Smith Machine Squat", ratio: 1.1 }
    ],
    "squat con bilanciere": [
        { name: "Leg Press 45°", ratio: 2.5 },
        { name: "Goblet Squat", ratio: 0.4 }
    ],
    "leg press 45°": [
        { name: "Squat Bilanciere", ratio: 0.4 },
        { name: "Hack Squat", ratio: 0.5 }
    ],
    "leg press": [
        { name: "Squat Bilanciere", ratio: 0.4 },
        { name: "Leg Extension", ratio: 0.3 }
    ],
    "leg press con manubri": [
        { name: "Squat con Bilanciere", ratio: 0.4 },
        { name: "Affondi Manubri", ratio: 0.9 }
    ],
    "affondi manubri": [
        { name: "Squat Bulgaro", ratio: 0.9 },
        { name: "Leg Extension", ratio: 1.2 }
    ],
    "affondi con bilanciere": [
        { name: "Affondi Manubri", ratio: 0.45 },
        { name: "Squat Bulgaro", ratio: 0.45 }
    ],
    "leg extension": [
        { name: "Sissy Squat", ratio: 0.0 },
        { name: "Affondi", ratio: 0.8 }
    ],
    "estensioni gambe con macchina": [
        { name: "Leg Extension", ratio: 1.0 },
        { name: "Squat Bulgaro", ratio: 0.4 }
    ],
    "leg curl": [
        { name: "Stacco Rumeno", ratio: 1.2 },
        { name: "Stacco Gambe Tese", ratio: 1.1 }
    ],
    "leg curl sdraiato": [
        { name: "Leg Curl Seduto", ratio: 1.0 },
        { name: "Stacco Rumeno", ratio: 1.2 }
    ],
    "leg curl seduto": [
        { name: "Leg Curl Sdraiato", ratio: 1.0 },
        { name: "Stacco Rumeno", ratio: 1.2 }
    ],
    "curl con manubri per gambe": [
        { name: "Leg Curl Sdraiato", ratio: 1.2 },
        { name: "Stacco Rumeno", ratio: 1.5 }
    ],
    "stacco da terra": [
        { name: "Stacco Rumeno", ratio: 0.8 },
        { name: "Hyperextension Zavorrata", ratio: 0.3 }
    ],
    "stacco da terra (deadlift)": [
        { name: "Stacco Rumeno", ratio: 0.8 },
        { name: "Hyperextension Zavorrata", ratio: 0.3 }
    ],
    "calf machine": [
        { name: "Calf alla Pressa", ratio: 1.0 },
        { name: "Calf Manubrio in Piedi", ratio: 0.5 }
    ],
    "calf raise in piedi": [
        { name: "Calf Machine", ratio: 1.0 },
        { name: "Calf alla Pressa", ratio: 1.0 }
    ],
    "squat bulgaro": [
        { name: "Affondi Manubri", ratio: 1.1 },
        { name: "Leg Press Unilaterale", ratio: 1.5 }
    ],

    // === SPALLE ===
    "military press": [
        { name: "Lento Avanti Manubri", ratio: 0.4 },
        { name: "Shoulder Press Machine", ratio: 0.9 }
    ],
    "lento avanti manubri": [
        { name: "Military Press", ratio: 2.2 },
        { name: "Arnold Press", ratio: 0.9 }
    ],
    "alzate laterali": [
        { name: "Alzate Laterali Cavo", ratio: 0.8 },
        { name: "Alzate Laterali Macchina", ratio: 1.0 }
    ],
    "alzate frontali": [
        { name: "Military Press", ratio: 1.5 },
        { name: "Alzate Frontali Cavo", ratio: 0.9 }
    ],
    "alzate posteriori 90°": [
        { name: "Face Pull", ratio: 1.0 },
        { name: "Rear Delt Machine", ratio: 1.2 }
    ],
    "face pull": [
        { name: "Alzate 90°", ratio: 0.6 },
        { name: "Rear Delt Machine", ratio: 1.0 }
    ],
    "tirate al mento": [
        { name: "Alzate Laterali", ratio: 0.5 },
        { name: "Face Pull", ratio: 0.8 }
    ],

    // === BRACCIA ===
    "curl bilanciere": [
        { name: "Curl Manubri Alternato", ratio: 0.45 },
        { name: "Curl Cavi Bassi", ratio: 0.9 }
    ],
    "curl con bilanciere": [
        { name: "Curl Manubri Alternato", ratio: 0.45 },
        { name: "Hammer Curl", ratio: 0.45 }
    ],
    "curl bilanciere in piedi": [
        { name: "Curl Manubri Alternato", ratio: 0.45 },
        { name: "Preacher Curl (Panca Scott)", ratio: 0.8 }
    ],
    "curl manubri": [
        { name: "Curl Bilanciere", ratio: 2.1 },
        { name: "Hammer Curl", ratio: 1.0 }
    ],
    "curl con manubri": [
        { name: "Curl Bilanciere", ratio: 2.1 },
        { name: "Hammer Curl", ratio: 1.0 }
    ],
    "curl manubri alternato": [
        { name: "Curl Bilanciere in Piedi", ratio: 2.1 },
        { name: "Hammer Curl", ratio: 1.0 }
    ],
    "hammer curl": [
        { name: "Curl Manubri", ratio: 1.0 },
        { name: "Curl Cavo Fune", ratio: 0.9 }
    ],
    "preacher curl (panca scott)": [
        { name: "Curl Manubri su Inclinata", ratio: 0.5 },
        { name: "Curl Cavi Bassi", ratio: 1.0 }
    ],
    "french press": [
        { name: "Push Down Cavi", ratio: 1.1 },
        { name: "Estensioni Dietro Nuca", ratio: 0.8 }
    ],
    "french press bilanciere": [
        { name: "Push Down Cavi", ratio: 1.1 },
        { name: "Estensioni Dietro Nuca", ratio: 0.8 }
    ],
    "push down cavi": [
        { name: "French Press", ratio: 0.9 },
        { name: "Dip tra Panche", ratio: 0.0 }
    ],
    "push down": [
        { name: "French Press", ratio: 0.9 },
        { name: "Estensioni Dietro Nuca", ratio: 0.5 }
    ],
    "estensioni con bilanciere": [
        { name: "French Press", ratio: 1.0 },
        { name: "Push Down Cavi", ratio: 1.1 }
    ],
    "estensioni dietro nuca": [
        { name: "Push Down Cavi", ratio: 1.2 },
        { name: "French Press", ratio: 1.1 }
    ],
    "dip panche": [
        { name: "Push Down", ratio: 0.7 },
        { name: "Kickback", ratio: 0.3 }
    ],
    "dip tra panche": [
        { name: "Push Down Cavi", ratio: 0.7 },
        { name: "Kickback Manubrio", ratio: 0.3 }
    ],

    // === ADDOME ===
    "crunch": [
        { name: "Crunch Machine", ratio: 1.0 },
        { name: "Plank", ratio: 0.0 }
    ],
    "crunch a terra": [
        { name: "Plank", ratio: 0.0 },
        { name: "Leg Raise", ratio: 0.0 }
    ],
    "plank": [
        { name: "Crunch", ratio: 0.0 },
        { name: "Ab Roller", ratio: 0.0 }
    ],
    "leg raise": [
        { name: "Crunch Inverso", ratio: 0.0 },
        { name: "Plank", ratio: 0.0 }
    ],
    "russian twist": [
        { name: "Crunch Obliqui", ratio: 0.0 },
        { name: "Plank Laterale", ratio: 0.0 }
    ],
    "ab roller": [
        { name: "Plank", ratio: 0.0 },
        { name: "Crunch a Terra", ratio: 0.0 }
    ]
};

// Fallback per categoria muscolare nel caso di esercizi non mappati direttamente
export const muscleGroupFallbacks = {
    petto: [
        { name: "Panca Piana Bilanciere", ratio: 1.0 },
        { name: "Chest Press", ratio: 0.85 },
        { name: "Spinte Manubri", ratio: 0.4 }
    ],
    dorso: [
        { name: "Lat Machine Avanti", ratio: 0.85 },
        { name: "Rematore Manubrio", ratio: 0.45 },
        { name: "Pulley Basso", ratio: 0.8 }
    ],
    gambe: [
        { name: "Squat Bilanciere", ratio: 1.0 },
        { name: "Leg Press 45°", ratio: 2.2 },
        { name: "Affondi Manubri", ratio: 0.35 }
    ],
    spalle: [
        { name: "Military Press", ratio: 1.0 },
        { name: "Alzate Laterali", ratio: 0.2 },
        { name: "Lento Avanti Manubri", ratio: 0.4 }
    ],
    braccia: [
        { name: "Curl Manubri Alternato", ratio: 0.45 },
        { name: "Push Down Cavi", ratio: 0.7 },
        { name: "Hammer Curl", ratio: 0.45 }
    ],
    addome: [
        { name: "Plank", ratio: 0.0 },
        { name: "Crunch a Terra", ratio: 0.0 },
        { name: "Leg Raise", ratio: 0.0 }
    ]
};

/**
 * Trova alternative suggerite per un dato esercizio.
 * Garantisce SEMPRE almeno un'opzione di scambio.
 * @param {string} exerciseName 
 * @returns {Array} Array di oggetti { name, ratio }
 */
export const getSmartSwaps = (exerciseName) => {
    if (!exerciseName) return muscleGroupFallbacks.petto;

    const normalized = exerciseName.trim().toLowerCase();

    // 1. Cerca match esatto nella mappa
    if (smartSwapRules[normalized] && smartSwapRules[normalized].length > 0) {
        return smartSwapRules[normalized];
    }

    // 2. Cerca match parziale
    const directMatch = Object.keys(smartSwapRules).find(k => k === normalized);
    if (directMatch && smartSwapRules[directMatch].length > 0) return smartSwapRules[directMatch];

    const partialMatch = Object.keys(smartSwapRules).find(k =>
        k.includes(normalized) || normalized.includes(k)
    );
    if (partialMatch && smartSwapRules[partialMatch].length > 0) {
        return smartSwapRules[partialMatch];
    }

    // 3. Match euristico per parole chiave biomeccaniche
    if (normalized.includes("panca") || normalized.includes("chest") || normalized.includes("petto") || normalized.includes("croci") || normalized.includes("spinte")) {
        return muscleGroupFallbacks.petto.filter(x => x.name.toLowerCase() !== normalized);
    }
    if (normalized.includes("lat") || normalized.includes("dorso") || normalized.includes("trazion") || normalized.includes("remat") || normalized.includes("pulley") || normalized.includes("row")) {
        return muscleGroupFallbacks.dorso.filter(x => x.name.toLowerCase() !== normalized);
    }
    if (normalized.includes("squat") || normalized.includes("press") || normalized.includes("gamb") || normalized.includes("affond") || normalized.includes("calf") || normalized.includes("curl") && normalized.includes("gamb")) {
        return muscleGroupFallbacks.gambe.filter(x => x.name.toLowerCase() !== normalized);
    }
    if (normalized.includes("spall") || normalized.includes("militar") || normalized.includes("lento") || normalized.includes("alzat") || normalized.includes("deltoid") || normalized.includes("pull")) {
        return muscleGroupFallbacks.spalle.filter(x => x.name.toLowerCase() !== normalized);
    }
    if (normalized.includes("curl") || normalized.includes("bicipit") || normalized.includes("tricipit") || normalized.includes("french") || normalized.includes("push down") || normalized.includes("bracc")) {
        return muscleGroupFallbacks.braccia.filter(x => x.name.toLowerCase() !== normalized);
    }
    if (normalized.includes("addom") || normalized.includes("crunch") || normalized.includes("plank") || normalized.includes("core") || normalized.includes("twist")) {
        return muscleGroupFallbacks.addome.filter(x => x.name.toLowerCase() !== normalized);
    }

    // 4. Fallback universale garantito: non lascia MAI la lista vuota
    return [
        { name: "Panca Piana Bilanciere", ratio: 1.0 },
        { name: "Lat Machine Avanti", ratio: 1.0 },
        { name: "Squat Bilanciere", ratio: 1.0 }
    ];
};
