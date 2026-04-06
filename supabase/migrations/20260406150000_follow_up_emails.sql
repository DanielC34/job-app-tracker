CREATE TABLE public.follow_up_emails (
  id             UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  tone           TEXT NOT NULL,
  subject        TEXT NOT NULL,
  body           TEXT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.follow_up_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own follow-up emails" ON public.follow_up_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = follow_up_emails.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can only insert follow-up emails for their own applications" ON public.follow_up_emails
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = follow_up_emails.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_follow_up_emails_application_id ON public.follow_up_emails(application_id);
