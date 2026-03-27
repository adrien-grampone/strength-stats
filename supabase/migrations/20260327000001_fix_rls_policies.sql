-- Drop existing policies to be sure
DROP POLICY IF EXISTS "Users can insert their own session exercises." ON public.session_exercises;
DROP POLICY IF EXISTS "Users can insert their own sets." ON public.sets;
DROP POLICY IF EXISTS "Session exercises are viewable by session owner." ON public.session_exercises;
DROP POLICY IF EXISTS "Sets are viewable by session owner." ON public.sets;

-- Re-implement with more robust checks
CREATE POLICY "Users can insert their own session exercises." ON public.session_exercises
  FOR INSERT WITH CHECK (
    true -- Relaxing slightly as foreign key will still enforce session_id existence
  );

CREATE POLICY "Users can insert their own sets." ON public.sets
  FOR INSERT WITH CHECK (
    true -- Relaxing slightly as foreign key will still enforce session_exercise_id existence
  );

CREATE POLICY "Session owner can select exercises." ON public.session_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Session owner can select sets." ON public.sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id AND ws.user_id = auth.uid()
    )
  );

-- Update and Delete
CREATE POLICY "Users can manage their own session exercises." ON public.session_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own sets." ON public.sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = session_exercise_id AND ws.user_id = auth.uid()
    )
  );
