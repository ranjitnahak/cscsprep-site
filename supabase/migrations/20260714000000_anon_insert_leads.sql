-- Allow anonymous clients (workshop feedback, etc.) to insert into the shared leads inbox.
-- Edge Functions that use the service role already bypass RLS.

CREATE POLICY "anon_insert_leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
