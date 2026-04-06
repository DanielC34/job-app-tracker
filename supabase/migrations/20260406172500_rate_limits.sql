CREATE TABLE IF NOT EXISTS public.rate_limits (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_rate_limits_user_id_action_created_at ON public.rate_limits (user_id, action, created_at);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own rate logs"
ON public.rate_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own rate logs"
ON public.rate_limits FOR SELECT
USING (auth.uid() = user_id);
