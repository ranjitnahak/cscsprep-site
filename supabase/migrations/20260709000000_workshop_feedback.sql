-- Workshop feedback form: workshop_leads, contacts, storage bucket, and anon insert policies

CREATE TABLE IF NOT EXISTS public.workshop_leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  text NOT NULL,
  last_name   text NOT NULL,
  email       text NOT NULL,
  phone       text NOT NULL,
  profession  text NOT NULL,
  workplace   text NOT NULL,
  city        text NOT NULL,
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback    text,
  photo_path  text,
  workshop    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workshop_leads_email_idx
  ON public.workshop_leads (email);

CREATE INDEX IF NOT EXISTS workshop_leads_created_at_idx
  ON public.workshop_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS workshop_leads_workshop_idx
  ON public.workshop_leads (workshop);

CREATE TABLE IF NOT EXISTS public.contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  full_name   text NOT NULL,
  phone       text,
  source      text NOT NULL DEFAULT 'workshop',
  tags        text[] NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'lead',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_email_idx
  ON public.contacts (email);

CREATE INDEX IF NOT EXISTS contacts_created_at_idx
  ON public.contacts (created_at DESC);

CREATE INDEX IF NOT EXISTS contacts_source_idx
  ON public.contacts (source);

ALTER TABLE public.workshop_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_workshop_leads"
  ON public.workshop_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_insert_contacts"
  ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workshop-photos',
  'workshop-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_upload_workshop_photos"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'workshop-photos');
