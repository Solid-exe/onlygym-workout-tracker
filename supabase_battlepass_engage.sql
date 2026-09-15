-- ==========================================================
-- ONLYGYM - BATTLE PASS & ENGAGE SYSTEM (DDL + RPC SEED)
-- Esegui questo script nel SQL Editor di Supabase:
-- https://supabase.com/dashboard/project/kmuovijjgivwupluuruh/sql
-- ==========================================================

-- 1. Tabella Palestre (Gyms)
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'OnlyGym Arena',
    country TEXT DEFAULT 'IT',
    timezone TEXT DEFAULT 'Europe/Rome',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Membri Palestra (Gym Members)
CREATE TABLE IF NOT EXISTS public.gym_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (gym_id, user_id)
);

-- 3. Stagioni di Allenamento (Seasons)
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now() + interval '90 days'),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Registro Punti XP (Points Ledger)
CREATE TABLE IF NOT EXISTS public.points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Sfide Stagionali (Challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    points_reward INTEGER DEFAULT 100,
    target_value NUMERIC DEFAULT 10,
    unit TEXT DEFAULT 'ripetizioni',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Iscrizioni alle Sfide (Challenge Enrollments)
CREATE TABLE IF NOT EXISTS public.challenge_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (challenge_id, member_user_id)
);

-- 7. Progresso Sfide (Challenge Progress)
CREATE TABLE IF NOT EXISTS public.challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL,
    current_value NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (challenge_id, member_user_id)
);

-- 8. Badge di Merito (Badges)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'military_tech',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Badge Assegnati (Member Badges)
CREATE TABLE IF NOT EXISTS public.member_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    member_user_id UUID NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (badge_id, member_user_id)
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_badges ENABLE ROW LEVEL SECURITY;

-- Politiche di sicurezza RLS avanzate
DO $$ 
BEGIN
    -- Palestre: Lettura pubblica, modifica solo admin
    DROP POLICY IF EXISTS "Public gyms access" ON public.gyms;
    CREATE POLICY "Public gyms read" ON public.gyms FOR SELECT USING (true);
    CREATE POLICY "Admin gyms write" ON public.gyms FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Membri Palestra: Lettura autenticati, inserimento/modifica per se stessi o admin
    DROP POLICY IF EXISTS "Public gym_members access" ON public.gym_members;
    CREATE POLICY "Gym members read" ON public.gym_members FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Gym members insert" ON public.gym_members FOR INSERT TO authenticated WITH CHECK (
        user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );
    CREATE POLICY "Gym members update" ON public.gym_members FOR UPDATE TO authenticated USING (
        user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Stagioni: Lettura pubblica, scrittura solo admin/staff
    DROP POLICY IF EXISTS "Public seasons access" ON public.seasons;
    CREATE POLICY "Seasons read" ON public.seasons FOR SELECT USING (true);
    CREATE POLICY "Staff seasons write" ON public.seasons FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Registro Punti XP: Lettura autenticati, inserimento proprio o staff, NO UPDATE/DELETE (registro immutabile)
    DROP POLICY IF EXISTS "Public points_ledger access" ON public.points_ledger;
    CREATE POLICY "Points ledger read" ON public.points_ledger FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Points ledger insert" ON public.points_ledger FOR INSERT TO authenticated WITH CHECK (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Sfide: Lettura pubblica, gestione solo staff
    DROP POLICY IF EXISTS "Public challenges access" ON public.challenges;
    CREATE POLICY "Challenges read" ON public.challenges FOR SELECT USING (true);
    CREATE POLICY "Staff challenges write" ON public.challenges FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Iscrizioni alle Sfide: Utenti gestiscono solo le proprie iscrizioni
    DROP POLICY IF EXISTS "Public challenge_enrollments access" ON public.challenge_enrollments;
    CREATE POLICY "Enrollments read" ON public.challenge_enrollments FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Enrollments write" ON public.challenge_enrollments FOR ALL TO authenticated USING (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    ) WITH CHECK (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Progresso Sfide: Utenti aggiornano solo il proprio progresso
    DROP POLICY IF EXISTS "Public challenge_progress access" ON public.challenge_progress;
    CREATE POLICY "Progress read" ON public.challenge_progress FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Progress write" ON public.challenge_progress FOR ALL TO authenticated USING (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    ) WITH CHECK (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );

    -- Badge Definizioni: Lettura pubblica, gestione admin
    DROP POLICY IF EXISTS "Public badges access" ON public.badges;
    CREATE POLICY "Badges read" ON public.badges FOR SELECT USING (true);
    CREATE POLICY "Badges write" ON public.badges FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

    -- Badge Assegnati: Lettura pubblica, assegnazione per utente o staff
    DROP POLICY IF EXISTS "Public member_badges access" ON public.member_badges;
    CREATE POLICY "Member badges read" ON public.member_badges FOR SELECT USING (true);
    CREATE POLICY "Member badges insert" ON public.member_badges FOR INSERT TO authenticated WITH CHECK (
        member_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer'))
    );
END $$;

-- ==========================================================
-- RPC SEED FUNCTION (seed_user_engage_demo)
-- ==========================================================
CREATE OR REPLACE FUNCTION public.seed_user_engage_demo()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_gym_id UUID;
    v_season_id UUID;
    v_c1 UUID;
    v_c2 UUID;
    v_c3 UUID;
    v_c4 UUID;
    v_b1 UUID;
    v_b2 UUID;
    v_b3 UUID;
BEGIN
    -- Identifica utente attuale (o fallback al primo profilo)
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    END IF;

    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Nessun utente trovato');
    END IF;

    -- 1. Crea o recupera Palestra
    SELECT id INTO v_gym_id FROM public.gyms WHERE name = 'OnlyGym Arena' LIMIT 1;
    IF v_gym_id IS NULL THEN
        INSERT INTO public.gyms (name, country, timezone)
        VALUES ('OnlyGym Arena', 'IT', 'Europe/Rome')
        RETURNING id INTO v_gym_id;
    END IF;

    -- 2. Affiliazione utente attivo
    INSERT INTO public.gym_members (gym_id, user_id, status)
    VALUES (v_gym_id, v_user_id, 'active')
    ON CONFLICT (gym_id, user_id) DO UPDATE SET status = 'active';

    -- 3. Crea Stagione Attiva
    SELECT id INTO v_season_id FROM public.seasons WHERE gym_id = v_gym_id AND is_active = true LIMIT 1;
    IF v_season_id IS NULL THEN
        INSERT INTO public.seasons (gym_id, name, is_active, start_date, end_date)
        VALUES (v_gym_id, 'Stagione 1: Titan Genesis', true, now(), now() + interval '90 days')
        RETURNING id INTO v_season_id;
    END IF;

    -- 4. Rimuovi sfide demo precedenti per questo gym per evitare duplicati
    DELETE FROM public.challenges WHERE gym_id = v_gym_id;

    -- Inserisci Sfide Ufficiali
    INSERT INTO public.challenges (gym_id, title, description, points_reward, target_value, unit, is_active)
    VALUES 
        (v_gym_id, '10.000 KG Volume Warrior', 'Accumula un volume totale di 10.000 kg negli esercizi fondamentali.', 250, 10000, 'kg', true)
    RETURNING id INTO v_c1;

    INSERT INTO public.challenges (gym_id, title, description, points_reward, target_value, unit, is_active)
    VALUES 
        (v_gym_id, '5 Workout Completati', 'Porta a termine almeno 5 sessioni di allenamento registrate.', 300, 5, 'sessioni', true)
    RETURNING id INTO v_c2;

    INSERT INTO public.challenges (gym_id, title, description, points_reward, target_value, unit, is_active)
    VALUES 
        (v_gym_id, 'Century Bench Press', 'Raggiungi 100 kg di massimale o supera il tuo PR di panca.', 500, 100, 'kg', true)
    RETURNING id INTO v_c3;

    INSERT INTO public.challenges (gym_id, title, description, points_reward, target_value, unit, is_active)
    VALUES 
        (v_gym_id, 'Leg Day Dominator', 'Esegui almeno 12 serie pesanti tra squat e pressa.', 200, 12, 'serie', true)
    RETURNING id INTO v_c4;

    -- 5. Iscrizioni iniziali con progresso
    INSERT INTO public.challenge_enrollments (challenge_id, member_user_id, status)
    VALUES 
        (v_c1, v_user_id, 'enrolled'),
        (v_c2, v_user_id, 'enrolled'),
        (v_c4, v_user_id, 'completed')
    ON CONFLICT (challenge_id, member_user_id) DO UPDATE SET status = EXCLUDED.status;

    INSERT INTO public.challenge_progress (challenge_id, member_user_id, current_value)
    VALUES 
        (v_c1, v_user_id, 3250),
        (v_c2, v_user_id, 2),
        (v_c4, v_user_id, 12)
    ON CONFLICT (challenge_id, member_user_id) DO UPDATE SET current_value = EXCLUDED.current_value;

    -- 6. Inizializza Punti Ledger
    DELETE FROM public.points_ledger WHERE member_user_id = v_user_id AND gym_id = v_gym_id;
    INSERT INTO public.points_ledger (gym_id, member_user_id, points, reason)
    VALUES 
        (v_gym_id, v_user_id, 200, 'Completamento Leg Day Dominator'),
        (v_gym_id, v_user_id, 150, 'Bonus Primo Accesso OnlyGym Season');

    -- 7. Inserisci Badges
    SELECT id INTO v_b1 FROM public.badges WHERE name = 'Primo Passo' LIMIT 1;
    IF v_b1 IS NULL THEN
        INSERT INTO public.badges (name, description, icon)
        VALUES ('Primo Passo', 'Hai registrato il tuo primo allenamento su OnlyGym.', 'fitness_center')
        RETURNING id INTO v_b1;
    END IF;

    SELECT id INTO v_b2 FROM public.badges WHERE name = 'Centurione' LIMIT 1;
    IF v_b2 IS NULL THEN
        INSERT INTO public.badges (name, description, icon)
        VALUES ('Centurione', 'Superata la soglia di 100 ripetizioni complessive.', 'military_tech')
        RETURNING id INTO v_b2;
    END IF;

    SELECT id INTO v_b3 FROM public.badges WHERE name = 'Costanza di Ferro' LIMIT 1;
    IF v_b3 IS NULL THEN
        INSERT INTO public.badges (name, description, icon)
        VALUES ('Costanza di Ferro', '3 allenamenti completati nella stessa settimana.', 'bolt')
        RETURNING id INTO v_b3;
    END IF;

    INSERT INTO public.member_badges (badge_id, member_user_id, earned_at)
    VALUES 
        (v_b1, v_user_id, now() - interval '7 days'),
        (v_b2, v_user_id, now() - interval '2 days')
    ON CONFLICT (badge_id, member_user_id) DO NOTHING;

    RETURN json_build_object('success', true, 'message', 'Battle Pass Demo attivato con successo!');
END;
$$;

