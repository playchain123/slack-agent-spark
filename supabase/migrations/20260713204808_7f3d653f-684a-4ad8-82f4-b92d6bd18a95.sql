ALTER TABLE public.commitments
  DROP CONSTRAINT IF EXISTS commitments_status_check;

ALTER TABLE public.commitments
  ADD CONSTRAINT commitments_status_check
  CHECK (status = ANY (ARRAY['suggested'::text, 'pending'::text, 'done'::text, 'snoozed'::text, 'cancelled'::text]));