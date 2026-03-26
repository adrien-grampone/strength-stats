-- STANDARDIZE MUSCLE CATEGORIES
UPDATE public.exercises SET target_muscle = 'Pectoraux' WHERE target_muscle LIKE '%Pectoraux%';
UPDATE public.exercises SET target_muscle = 'Dos' WHERE target_muscle LIKE '%Dos%';
UPDATE public.exercises SET target_muscle = 'Jambes' WHERE target_muscle LIKE '%Jambes%';
UPDATE public.exercises SET target_muscle = 'Épaules' WHERE target_muscle LIKE '%Épaules%';
UPDATE public.exercises SET target_muscle = 'Bras' WHERE target_muscle LIKE '%Bras%' OR target_muscle LIKE '%Triceps%';

-- Add some Ab Exercises
INSERT INTO public.exercises (name, target_muscle, description) VALUES
  ('Crunch', 'Abdos', 'Couché, enrouler le buste vers les genoux.'),
  ('Gainage', 'Abdos', 'Maintenir une position de planche sur les coudes.'),
  ('Relevé de jambe', 'Abdos', 'Suspendu ou couché, lever les jambes vers le buste.')
ON CONFLICT (id) DO NOTHING;
