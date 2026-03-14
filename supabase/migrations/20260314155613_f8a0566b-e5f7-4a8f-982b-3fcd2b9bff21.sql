
-- Create enum types
CREATE TYPE public.application_stage AS ENUM (
  'wishlist', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'archived'
);

CREATE TYPE public.employment_type AS ENUM (
  'full_time', 'part_time', 'contract', 'freelance', 'internship'
);

CREATE TYPE public.work_mode AS ENUM (
  'remote', 'hybrid', 'onsite'
);

CREATE TYPE public.note_type AS ENUM (
  'note', 'status_change', 'follow_up'
);

CREATE TYPE public.reminder_status AS ENUM (
  'pending', 'done', 'dismissed'
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Resume versions table
CREATE TABLE public.resume_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  file_url TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own resumes" ON public.resume_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own resumes" ON public.resume_versions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resume_versions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resume_versions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_resume_versions_updated_at BEFORE UPDATE ON public.resume_versions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  work_mode public.work_mode NOT NULL DEFAULT 'remote',
  source TEXT NOT NULL DEFAULT '',
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_stage public.application_stage NOT NULL DEFAULT 'wishlist',
  job_url TEXT,
  company_website TEXT,
  notes_summary TEXT,
  resume_version_id UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_stage ON public.applications(user_id, current_stage);
CREATE INDEX idx_applications_applied_date ON public.applications(user_id, applied_date DESC);
CREATE INDEX idx_applications_company ON public.applications(user_id, company_name);

-- Application notes table
CREATE TABLE public.application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_type public.note_type NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notes" ON public.application_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.application_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.application_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.application_notes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_notes_application ON public.application_notes(application_id, created_at DESC);

-- Follow-up reminders table
CREATE TABLE public.follow_up_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status public.reminder_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reminders" ON public.follow_up_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reminders" ON public.follow_up_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.follow_up_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.follow_up_reminders FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_reminders_user_due ON public.follow_up_reminders(user_id, due_date) WHERE status = 'pending';
CREATE INDEX idx_reminders_application ON public.follow_up_reminders(application_id);
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.follow_up_reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
CREATE POLICY "Users can view own resume files" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own resume files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own resume files" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
