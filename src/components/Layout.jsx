import { Outlet, NavLink } from "react-router-dom";
import { useStore } from "../lib/store";

export default function Layout() {
    const { userProfile } = useStore();
    const isStaff = userProfile?.role === 'admin' || userProfile?.role === 'trainer';

    const navItems = [
        { to: "/", label: "Allenati", icon: "bolt" },
        ...(!isStaff ? [{ to: "/plans", label: "Schede", icon: "fitness_center" }] : []),
        ...(!isStaff ? [{ to: "/progress", label: "Progressi", icon: "monitoring" }] : []),
        { to: "/community", label: "Community", icon: "groups" },
        { to: "/profile", label: "Profilo", icon: "account_circle" },
    ];

    return (
        <div className="flex flex-col h-[100dvh] bg-background text-foreground antialiased font-sans selection:bg-primary selection:text-slate-900">
            {/* Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                <Outlet />
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-[#0d121e]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 px-3 py-2 pb-6 flex justify-around items-center z-50 transition-colors">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-2xl transition-all ${
                                isActive
                                    ? "text-primary dark:text-primary font-extrabold"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={`material-symbols-outlined text-[26px] transition-transform ${
                                        isActive ? "scale-110 drop-shadow-[0_0_10px_rgba(13,242,137,0.6)]" : ""
                                    }`}
                                    style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 500" }}
                                >
                                    {item.icon}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                                {isActive && (
                                    <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_#0df289]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
