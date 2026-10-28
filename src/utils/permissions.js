// Elenco email autorizzate per il Coach / Amministratore (Vittorio)
export const COACH_EMAILS = [
    'admin@onlygym.com',
    'vittorio@onlygym.app',
    'vittoriodisarno99@gmail.com'
];

/**
 * Controlla se l'utente corrente è il Coach / Admin (Vittorio).
 * Solo il coach ha il permesso di creare e assegnare schede agli atleti.
 */
export function isCoachOrAdmin(userProfile) {
    if (!userProfile) return false;
    
    // Controllo per email (garantisce sempre l'accesso a Vittorio indipendentemente dal DB)
    const email = (userProfile.email || '').toLowerCase().trim();
    if (COACH_EMAILS.some(e => e.toLowerCase() === email)) return true;

    // Controllo per ruolo
    const role = (userProfile.role || '').toLowerCase();
    if (['admin', 'trainer', 'coach'].includes(role)) return true;

    return false;
}

