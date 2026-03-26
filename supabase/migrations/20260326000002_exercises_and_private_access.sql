-- 1. ADD user_id COLUMN TO EXERCISES
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. UPDATE RLS POLICIES FOR EXERCISES
-- Drop old policy
DROP POLICY IF EXISTS "Exercises are viewable by everyone." ON public.exercises;

-- New policy: Viewable if user_id is NULL (global) OR user_id matches auth.uid()
CREATE POLICY "Exercises are viewable by everyone if global, or by owner if private."
  ON public.exercises
  FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Policy to allow users to insert their own exercises
CREATE POLICY "Users can insert their own exercises."
  ON public.exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. SEED INITIAL COMMON EXERCISES (Global)
INSERT INTO public.exercises (name, target_muscle, description) VALUES
  ('Développé Couché (Barre)', 'Pectoraux', 'Couché sur un banc, descendre la barre au milieu de la poitrine et remonter.'),
  ('Développé Couché (Haltères)', 'Pectoraux', 'Variante avec haltères pour une plus grande amplitude.'),
  ('Squat (Barre)', 'Jambes', 'Barre sur les trapèzes, descendre les fessiers parallèlement au sol.'),
  ('Soulevé de Terre', 'Dos', 'Soulever la barre du sol jusqu''à une extension complète du corps.'),
  ('Tractions', 'Dos', 'Se hisser à une barre fixe jusqu''à ce que le menton dépasse la barre.'),
  ('Rowing Barre', 'Dos', 'Tronc incliné, tirer la barre vers le nombril.'),
  ('Développé Militaire', 'Épaules', 'Pousser la barre au-dessus de la tête à partir des clavicules.'),
  ('Élévations Latérales', 'Épaules', 'Lever les haltères sur les côtés jusqu''à l''horizontale.'),
  ('Curl Haltères', 'Bras', 'Flexion du bras avec haltère, paume vers le haut.'),
  ('Barre au Front', 'Bras', 'Couché, descendre la barre vers le front et remonter.'),
  ('Presse à cuisses', 'Jambes', 'Pousser la plateforme de la machine avec les jambes.'),
  ('Dips', 'Triceps/Pectoraux', 'Flexion/Extension des bras sur des barres parallèles.')
ON CONFLICT (id) DO NOTHING;
