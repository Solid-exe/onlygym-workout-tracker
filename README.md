# 🏋️ OnlyGym - Ultimate Workout Tracker & Gamified Fitness Web/Mobile App

**OnlyGym** is a modern, high-performance Progressive Web Application (PWA) and mobile-ready workout tracker built with React 18, Vite, Tailwind CSS, Zustand, and Supabase. 

Engineered for athletes, fitness enthusiasts, and gym studios looking for a stealth-themed, frictionless workout tracking experience with gamification mechanics (Battle Pass, XP, Badges, Streaks).

---

## 🌟 Key Features

### 1. Smart Workout Tracking
- **Interactive Session Tracker**: Log exercises, sets, weights (kg), reps, RPE, and notes in real-time.
- **Dynamic Rest Timer**: Integrated recovery countdown timer between sets with visual/sound alerts.
- **Feeling & Session Summary**: Post-workout feedback rating (Facile / Giusto / Estremo) and historical logging.

### 2. Workout Plan Builder
- **Custom Plan Creator**: Build and edit multi-day split routines (e.g., Push/Pull/Legs, Upper/Lower).
- **Target Exercise Setup**: Configurable target sets, repetitions, and rest times.
- **PDF Export**: Instant, high-resolution client-ready PDF generation for any workout routine.
- **CSV Data Export**: One-click complete CSV export of training history for external analysis.

### 3. Gamification & Retention Engine
- **Battle Pass (Engage)**: Seasonal progression with tiers, levels, and reward unlocks.
- **Achievement & Badges**: Automatic recognition system with unlock celebration modals.
- **Streaks & Consistency Tracking**: Weekly workout goal tracking and consecutive session streaks.

### 4. Biometrics & Health Integration
- **Health Dashboard**: Integrates sleep recovery scores, active burned calories, and daily step counters.
- **Advanced Analytics**: Visual progression charts and personal records (PRs) per muscle group and exercise.

### 5. Mobile & Offline Experience (PWA)
- **Installable Web App**: Works natively on iOS (Add to Home Screen) and Android with standalone fullscreen display.
- **Offline Capable**: Workbox service workers cache assets and app shell for instant startup.
- **Capacitor Support**: Includes native project configurations (`/android` and `/ios`) for direct Google Play & Apple App Store packaging.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide / Google Material Symbols.
- **State Management**: Zustand with persistent storage.
- **Backend / Database**: Supabase (PostgreSQL 15, Auth, Row-Level Security, Realtime, Storage).
- **Routing**: React Router v6.
- **Exporting**: jsPDF, html2canvas, FileSaver.
- **Mobile Packaging**: `@vite-pwa`, Capacitor (iOS/Android).

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended).
- A free [Supabase](https://supabase.com/) account.

### 2. Installation
```bash
# Clone or extract repository
cd OnlyGym

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be live at `http://localhost:5173` (or the port specified by Vite).

### 5. Production Build
```bash
npm run build
npm run preview
```
Production assets are generated in `/dist`.

---

## 📦 Deployment (Vercel)

This repository is pre-configured for one-click deployment on [Vercel](https://vercel.com/):

```bash
# Deploy to production
npx vercel --prod
```

---

## 📄 License & Ownership
Full intellectual property, source code, database architecture, and branding assets are transferred upon purchase. Suitable for white-label re-branding, direct commercial exploitation, or SaaS subscription launching.

