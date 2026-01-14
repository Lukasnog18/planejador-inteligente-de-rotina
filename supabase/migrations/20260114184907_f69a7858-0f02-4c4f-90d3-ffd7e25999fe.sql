-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Minha Rotina',
  start_time TIME NOT NULL DEFAULT '06:00',
  end_time TIME NOT NULL DEFAULT '22:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Routines policies
CREATE POLICY "Users can view own routines"
  ON public.routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
  ON public.routines FOR DELETE
  USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  is_fixed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Activities policies (check access via routine ownership)
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routines 
      WHERE routines.id = activities.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines 
      WHERE routines.id = activities.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.routines 
      WHERE routines.id = activities.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.routines 
      WHERE routines.id = activities.routine_id 
      AND routines.user_id = auth.uid()
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_routines_updated
  BEFORE UPDATE ON public.routines
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_routines_user_id ON public.routines(user_id);
CREATE INDEX idx_activities_routine_id ON public.activities(routine_id);
CREATE INDEX idx_activities_order ON public.activities(routine_id, order_index);