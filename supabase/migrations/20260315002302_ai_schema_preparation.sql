
-- Migration: AI Schema Preparation
-- Adds job_description to applications, parsed_content to resume_versions,
-- and creates the new ai_analyses table for storing AI-generated results.

-- 1. Add job_description to applications
--    Stores raw job posting text for AI analysis (match scoring, interview prep).
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS job_description TEXT;

-- 2. Add parsed_content to resume_versions
--    Stores plain text extracted from uploaded PDF/DOCX files.
--    Populated server-side (e.g., Edge Function) after file upload.
ALTER TABLE public.resume_versions
  ADD COLUMN IF NOT EXISTS parsed_content TEXT;

-- 3. Create ai_analyses table
--    Central store for all AI-generated analysis results:
--    - resume_review:   feedback on a resume version
--    - job_match_score: match between a resume and a job description
--    - interview_prep:  generated practice questions and talking points
--    - followup_draft:  AI-drafted follow-up email copy

CREATE TYPE public.analysis_type AS ENUM (
  'resume_review',
  'job_match_score',
  'interview_prep',
  'followup_draft'
);

CREATE TABLE public.ai_analyses (
  id               UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id   UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  resume_id        UUID REFERENCES public.resume_versions(id) ON DELETE SET NULL,
  analysis_type    public.analysis_type NOT NULL,
  result_json      JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: users can only see and manage their own analyses
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.ai_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
  ON public.ai_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.ai_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for common query patterns
CREATE INDEX idx_ai_analyses_user_id      ON public.ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_application  ON public.ai_analyses(application_id) WHERE application_id IS NOT NULL;
CREATE INDEX idx_ai_analyses_resume       ON public.ai_analyses(resume_id) WHERE resume_id IS NOT NULL;
CREATE INDEX idx_ai_analyses_type         ON public.ai_analyses(user_id, analysis_type);
