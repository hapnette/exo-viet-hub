ALTER TABLE public.events RENAME COLUMN event_date TO start_date;
ALTER TABLE public.events RENAME COLUMN event_time TO start_time;
ALTER TABLE public.events RENAME COLUMN specific_address TO detailed_address;

ALTER TABLE public.events ADD COLUMN end_date date;
ALTER TABLE public.events ADD COLUMN end_time time without time zone;

UPDATE public.events
SET end_date = start_date,
    end_time = start_time
WHERE end_date IS NULL OR end_time IS NULL;

ALTER TABLE public.events ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE public.events ALTER COLUMN end_time SET NOT NULL;

DROP POLICY IF EXISTS "Public can create valid events" ON public.events;

CREATE POLICY "Public can create valid events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(both from name)) > 0
  AND char_length(trim(both from fanpage)) > 0
  AND type = ANY (ARRAY['LED'::text, 'Photoframe'::text, 'Gift'::text, 'Cafe Event'::text, 'Freebies'::text, 'Other'::text])
  AND start_date IS NOT NULL
  AND start_time IS NOT NULL
  AND end_date IS NOT NULL
  AND end_time IS NOT NULL
  AND char_length(trim(both from detailed_address)) > 0
  AND char_length(trim(both from district)) > 0
  AND member = ANY (ARRAY['Chanyeol'::text, 'EXO'::text, 'Suho'::text, 'Sehun'::text, 'Kai'::text, 'D.O.'::text])
  AND ((link IS NULL) OR (link ~* '^https?://'))
);