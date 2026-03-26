-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. EXERCISES LIBRARY
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_muscle TEXT,
  description TEXT,
  gif_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercises are viewable by everyone." ON public.exercises
  FOR SELECT USING (true);

-- 3. WORKOUT SESSIONS
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'completed', -- 'in_progress', 'completed', 'cancelled'
  notes TEXT
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are viewable by the owner." ON public.workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions." ON public.workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. SESSION EXERCISES (Mapping exercises to sessions)
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  order_index INTEGER NOT NULL
);

ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session exercises are viewable by session owner." ON public.session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- 5. SETS (Reps and Weight)
CREATE TABLE IF NOT EXISTS public.sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE NOT NULL,
  reps INTEGER,
  weight NUMERIC,
  rpe INTEGER,
  order_index INTEGER NOT NULL
);

ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sets are viewable by session owner." ON public.sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id AND ws.user_id = auth.uid()
    )
  );

-- 6. TRIGGER FOR NEW USER PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
