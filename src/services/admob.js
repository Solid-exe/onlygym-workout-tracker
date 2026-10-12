import { Capacitor } from '@capacitor/core';

// Test Ad Unit IDs ufficiali forniti da Google per Android
// Sostituire con i propri Ad Unit ID di AdMob prima della pubblicazione definitiva
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const NO_ADS_STORAGE_KEY = 'onlygym_ad_free_status';

class AdMobService {
    constructor() {
        this.initialized = false;
        this.isAdFree = false;
        this.bannerShowing = false;
        this.loadAdFreeStatus();
    }

    loadAdFreeStatus() {
        try {
            const saved = localStorage.getItem(NO_ADS_STORAGE_KEY);
            this.isAdFree = saved === 'true';
        } catch (e) {
            this.isAdFree = false;
        }
    }

    setAdFreeStatus(status) {
        this.isAdFree = Boolean(status);
        try {
            localStorage.setItem(NO_ADS_STORAGE_KEY, this.isAdFree ? 'true' : 'false');
        } catch (e) {
            console.error('Failed to save ad-free status', e);
        }

        if (this.isAdFree && this.bannerShowing) {
            this.hideBanner();
        }

        // Notifica i componenti React
        try {
            window.dispatchEvent(new CustomEvent('onlygym:ad-free-changed', { detail: { isAdFree: this.isAdFree } }));
        } catch (e) {
            console.debug('CustomEvent dispatch error', e);
        }
    }

    isUserAdFree() {
        return this.isAdFree;
    }

    async initialize() {
        if (!Capacitor.isNativePlatform()) {
            // Su browser web (incluso Safari su iPhone) AdMob è completamente disattivato
            return;
        }

        if (this.initialized) return;

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.initialize({
                initializeForTesting: true,
            });
            this.initialized = true;
            console.log('[AdMob] Inizializzato con successo');

            // Se l'utente non ha rimosso gli annunci, mostriamo il banner
            if (!this.isAdFree) {
                await this.showBanner();
            }
        } catch (error) {
            console.warn('[AdMob] Errore inizializzazione:', error);
        }
    }

    async showBanner() {
        if (!Capacitor.isNativePlatform() || this.isAdFree) return;

        try {
            const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
            await AdMob.showBanner({
                adId: TEST_BANNER_ID,
                adSize: BannerAdSize.BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 56, // posizionato sopra il footer
                isTesting: true,
            });
            this.bannerShowing = true;
            console.log('[AdMob] Banner mostrato con successo');
        } catch (error) {
            console.error('[AdMob] Errore caricamento banner:', error);
            try {
                const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
                await AdMob.showBanner({
                    adId: TEST_BANNER_ID,
                    adSize: BannerAdSize.BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    isTesting: true,
                });
                this.bannerShowing = true;
            } catch (err2) {
                console.error('[AdMob] Fallback banner fallito:', err2);
            }
        }
    }

    async hideBanner() {
        if (!Capacitor.isNativePlatform() || !this.bannerShowing) return;

        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.hideBanner();
            await AdMob.removeBanner();
            this.bannerShowing = false;
        } catch (error) {
            console.warn('[AdMob] Errore rimozione banner:', error);
        }
    }
}

export const admobService = new AdMobService();
