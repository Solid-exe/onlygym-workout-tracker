import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0df289",
                    foreground: "#080b11",
                },
                white: "#ffffff",
                background: "var(--c-bg)",
                foreground: "var(--c-foreground)",
                card: {
                    DEFAULT: "var(--c-card)",
                    foreground: "var(--c-foreground)",
                },
                muted: {
                    DEFAULT: "var(--c-muted)",
                    foreground: "var(--c-muted-foreground)",
                },
                border: "var(--c-border)",
                input: "var(--c-border)",
                ring: "#0df289",
                destructive: {
                    DEFAULT: "#ef4444",
                    foreground: "#fef2f2",
                },
                accent: {
                    DEFAULT: "var(--c-accent)",
                    foreground: "var(--c-accent-foreground)",
                },
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                lg: "1rem",
                xl: "1.5rem",
                "2xl": "2rem",
                full: "9999px",
            },
            fontFamily: {
                display: ["Outfit", "sans-serif"],
                sans: ["Plus Jakarta Sans", "Outfit", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [tailwindcssAnimate],
}
