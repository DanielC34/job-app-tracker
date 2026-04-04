BEGIN;

-- 1. Create Parent Table
CREATE TABLE public.resumes (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add Foreign Key to versions
ALTER TABLE public.resume_versions 
  ADD COLUMN resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE;

-- 3. Idempotent Migration: Create ONE resume per User
INSERT INTO public.resumes (user_id, title)
SELECT DISTINCT rv.user_id, 'Default Resume'
FROM public.resume_versions rv
WHERE NOT EXISTS (
  SELECT 1 FROM public.resumes r WHERE r.user_id = rv.user_id
);

-- 4. Linkage: Map all versions to the single User Parent
UPDATE public.resume_versions rv
SET resume_id = r.id
FROM public.resumes r
WHERE rv.user_id = r.user_id AND r.title = 'Default Resume';

-- 5. Enforce Integrity
ALTER TABLE public.resume_versions ALTER COLUMN resume_id SET NOT NULL;

-- 6. Rename AI Analysis Column
ALTER TABLE public.ai_analyses RENAME COLUMN resume_id TO resume_version_id;

-- 7. Create Interview Questions Table
CREATE TABLE public.interview_questions (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  ai_analysis_id  UUID REFERENCES public.ai_analyses(id) ON DELETE SET NULL,
  question_text   TEXT NOT NULL,
  category        TEXT,
  tips            TEXT,
  is_practiced    BOOLEAN NOT NULL DEFAULT false,
  user_notes      TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Performance Indexes
CREATE INDEX idx_resume_versions_resume_id ON public.resume_versions(resume_id);
CREATE INDEX idx_ai_analyses_resume_version_id ON public.ai_analyses(resume_version_id);
CREATE INDEX idx_interview_questions_application_id ON public.interview_questions(application_id);

-- 9. Strict RLS Policies
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own questions" ON public.interview_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = interview_questions.application_id 
      AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = interview_questions.application_id 
      AND applications.user_id = auth.uid()
    )
  );

COMMIT;
