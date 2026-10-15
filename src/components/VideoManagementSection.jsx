import { sanitizeUrl } from "../utils/fileValidation";

export default function VideoManagementSection({
    exerciseVideos,
    handleDeleteVideo
}) {
    return (
        <div>
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 ml-1">
                    <span className="material-symbols-outlined text-[20px]">video_library</span>
                    Video Caricati ({exerciseVideos.length})
                </h3>

                {exerciseVideos.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 shadow-inner flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-5xl mb-3 text-slate-300">videocam_off</span>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                            Nessun video caricato al momento
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exerciseVideos.map(video => (
                            <div
                                key={video.id}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all shadow-sm group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">{video.exercise_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                                {new Date(video.created_at).toLocaleDateString('it-IT')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={sanitizeUrl(video.video_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-slate-400 rounded-xl transition-all shadow-sm"
                                            title="Guarda il video"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                        </a>
                                        <button
                                            onClick={() => handleDeleteVideo(video)}
                                            className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 hover:border-red-500/50 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-xl transition-all shadow-sm"
                                            title="Elimina video"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
