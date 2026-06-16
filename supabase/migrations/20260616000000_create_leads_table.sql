CREATE TABLE IF NOT EXISTS public.leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  source     text NOT NULL DEFAULT 'enrol-form',
  metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
