import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Gestione auto-guarigione cache PWA / chunk mancanti su aggiornamento
window.addEventListener('error', (event) => {
    const errorMsg = event.message || (event.error && event.error.message) || '';
    if (
        errorMsg.includes('dynamically imported module') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Failed to fetch')
    ) {
        if (!sessionStorage.getItem('onlygym_chunk_reloaded')) {
            sessionStorage.setItem('onlygym_chunk_reloaded', '1');
            // Pulisci le cache vecchie e ricarica
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                }).finally(() => {
                    window.location.reload();
                });
            } else {
                window.location.reload();
            }
        }
    }
});

try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error("Elemento #root non trovato");

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} catch (e) {
    console.error("Critical mount error:", e);
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#080b11;color:#ffffff;font-family:sans-serif;padding:24px;text-align:center;">
                <h1 style="font-size:20px;font-weight:bold;margin-bottom:8px;">OnlyGym sta aggiornando i dati...</h1>
                <p style="color:#94a3b8;font-size:13px;margin-bottom:20px;">Tocca il pulsante in basso per ricaricare la versione più recente.</p>
                <button onclick="if(window.__resetOnlyGym){window.__resetOnlyGym()}else{window.location.reload(true)}" style="background:#0df289;color:#080b11;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;cursor:pointer;">Ricarica App</button>
            </div>
        `;
    }
}
