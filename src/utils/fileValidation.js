/**
 * Utility di Sicurezza e Validazione File per OnlyGym
 * Protegge contro: Stored XSS, Path Traversal, Unrestricted File Upload, ReDoS, DoS da file sovradimensionati.
 */

export const ALLOWED_IMAGE_MIME = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export const ALLOWED_VIDEO_MIME = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
];

export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

/**
 * Pulisce una stringa da caratteri pericolosi per prevenire path traversal o injection nel file system
 */
export function sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') return 'file';
    // Rimuove qualsiasi prefisso di directory, path traversal '../' o '\'
    const base = filename.split(/[/\\]/).pop() || 'file';
    // Mantiene solo caratteri alfanumerici, trattini, underscore e punto
    const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Previene file nascosti o che iniziano con punto
    return clean.replace(/^\.+/, '') || 'file';
}

/**
 * Valida un file immagine
 * @param {File} file
 * @param {number} maxMb - Dimensione massima in Megabyte (default 5MB)
 * @returns {{ valid: boolean, error?: string, safeExtension?: string }}
 */
export function validateImageFile(file, maxMb = 5) {
    if (!file) return { valid: false, error: "Nessun file selezionato." };

    // Verifica dimensione
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, error: `L'immagine supera la dimensione massima consentita (${maxMb}MB).` };
    }

    if (file.size === 0) {
        return { valid: false, error: "Il file è vuoto o corrotto." };
    }

    // Verifica MIME type (esclude categoricamente image/svg+xml per prevenire XSS)
    if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
        return { 
            valid: false, 
            error: "Formato immagine non consentito. Formati supportati: JPG, PNG, WEBP (SVG non consentiti per motivi di sicurezza)." 
        };
    }

    // Verifica estensione
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        return { valid: false, error: "Estensione file non valida per un'immagine." };
    }

    return { valid: true, safeExtension: ext === 'jpeg' ? 'jpg' : ext };
}

/**
 * Valida un file video
 * @param {File} file
 * @param {number} maxMb - Dimensione massima in Megabyte (default 50MB)
 * @returns {{ valid: boolean, error?: string, safeExtension?: string }}
 */
export function validateVideoFile(file, maxMb = 50) {
    if (!file) return { valid: false, error: "Nessun file selezionato." };

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
        return { valid: false, error: `Il video supera la dimensione massima consentita (${maxMb}MB).` };
    }

    if (file.size === 0) {
        return { valid: false, error: "Il file è vuoto o corrotto." };
    }

    // Verifica MIME type
    if (!ALLOWED_VIDEO_MIME.includes(file.type)) {
        return { valid: false, error: "Formato video non consentito. Formati supportati: MP4, WebM, QuickTime (MOV)." };
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
        return { valid: false, error: "Estensione file video non riconosciuta o non sicura." };
    }

    return { valid: true, safeExtension: ext };
}

/**
 * Valida media generico (immagine o video)
 */
export function validateMediaFile(file, maxImageMb = 10, maxVideoMb = 50) {
    if (!file) return { valid: false, error: "Nessun file selezionato." };

    if (file.type.startsWith('video/')) {
        const result = validateVideoFile(file, maxVideoMb);
        return { ...result, mediaType: 'video' };
    } else if (file.type.startsWith('image/')) {
        const result = validateImageFile(file, maxImageMb);
        return { ...result, mediaType: 'image' };
    }

    return { valid: false, error: "Tipo di file non supportato. Seleziona un'immagine (JPG, PNG, WEBP) o un video (MP4, WEBM)." };
}

/**
 * Genera un nome file casuale e sicuro con crittografia nativa (crypto.randomUUID)
 */
export function generateSecureFileName(extension, prefix = '') {
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const safeExt = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return prefix ? `${prefix}_${uuid}.${safeExt}` : `${uuid}.${safeExt}`;
}

/**
 * Verifica che un URL sia sicuro (solo protocolli http: o https:, o path relativo)
 * Blocca protocolli pericolosi come javascript:, data:, vbscript:
 */
export function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Sanitizza un URL prima di passarlo a un tag <a href>
 * Ritorna '#' se l'URL non è sicuro
 */
export function sanitizeUrl(url, fallback = '#') {
    return isSafeUrl(url) ? url.trim() : fallback;
}
