import { useState } from "react";
import { supabase } from "../lib/supabase";
import emailjs from "@emailjs/browser";

export default function FeedbackModal({ onClose }) {
    const [type, setType] = useState('bug');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non autenticato");

            // 1. Salva sempre nel database Supabase come storico
            const { error } = await supabase.from('app_feedback').insert({
                user_id: user.id,
                type,
                message
            });

            if (error) throw error;

            // 2. Invia notifica email tramite EmailJS
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_8hshknk';
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_li4owpc';
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '1cNkYNPNJm1VClecG';

            if (serviceId && templateId && publicKey) {
                try {
                    const typeLabel = type === 'bug' ? 'BUG SEGNALATO 🐛' : type === 'idea' ? 'NUOVA IDEA 💡' : 'FEEDBACK GENERICO 💬';
                    await emailjs.send(
                        serviceId,
                        templateId,
                        {
                            feedback_type: typeLabel,
                            title: typeLabel,
                            message: message,
                            user_email: user.email || 'Email non disponibile',
                            name: user.email?.split('@')[0] || 'Atleta',
                            user_id: user.id,
                            to_email: 'vittoriodisarno99@gmail.com',
                            submitted_at: new Date().toLocaleString('it-IT')
                        },
                        publicKey
                    );
                } catch (emailErr) {
                    console.warn('[FeedbackModal] Invio email fallito:', emailErr);
                }
            }

            setStatus('success');
            setTimeout(onClose, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        const getSuccessMessage = () => {
            if (type === 'bug') return "Grazie per la segnalazione! La leggeremo subito per risolvere il bug.";
            if (type === 'idea') return "Grazie per questa fantastica idea! Ci aiuta molto a migliorare OnlyGym.";
            return "Messaggio inviato! Grazie per averci contattato.";
        };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-sm w-full text-center animate-in zoom-in shadow-2xl">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="material-symbols-outlined text-[40px]">check_circle</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Grazie!</h3>
                    <p className="text-slate-500 text-xs font-bold mt-3 uppercase tracking-widest leading-relaxed">
                        {getSuccessMessage()}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
            <div
                className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[28px]">
                                {type === 'bug' ? 'bug_report' : type === 'idea' ? 'lightbulb' : 'rate_review'}
                            </span> 
                            {type === 'bug' ? 'Segnala Bug' : type === 'idea' ? 'Nuova Idea' : 'Feedback'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ml-[36px]">Aiutaci a migliorare</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-800 border border-slate-200 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 mb-2.5 tracking-[0.2em] ml-1">Tipo di segnalazione</label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: 'bug', label: 'Bug', icon: 'bug_report' },
                                { id: 'idea', label: 'Idea', icon: 'lightbulb' },
                                { id: 'other', label: 'Altro', icon: 'chat' }
                            ].map((item) => {
                                const isSelected = type === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setType(item.id)}
                                        className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${isSelected ? 'bg-primary text-white border-primary shadow-primary/20 scale-[1.02]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'}`}
                                    >
                                        <span className={`material-symbols-outlined text-[24px] ${isSelected ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 mb-2.5 tracking-[0.2em] ml-1">Messaggio</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Descrivi il problema o la tua idea..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[140px] resize-none placeholder:text-slate-400 font-bold shadow-inner"
                            required
                        />
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 border border-red-200 text-red-500 text-xs p-3 rounded-xl text-center font-bold">
                            Errore durante l&apos;invio. Riprova più tardi.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading' || !message.trim()}
                        className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                    >
                        {status === 'loading' ? (
                            <span className="animate-pulse">Invio in corso...</span>
                        ) : (
                            <>
                                {type === 'bug' ? 'Invia Segnalazione' : type === 'idea' ? 'Invia Idea' : 'Invia Feedback'} <span className="material-symbols-outlined text-[18px]">send</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
