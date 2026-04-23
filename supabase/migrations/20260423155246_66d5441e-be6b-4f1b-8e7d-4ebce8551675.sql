CREATE POLICY "Public can update valid events"
ON public.events
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
  (char_length(TRIM(BOTH FROM name)) > 0)
  AND (char_length(TRIM(BOTH FROM fanpage)) > 0)
  AND (type = ANY (ARRAY['LED'::text, 'Photoframe'::text, 'Gift'::text, 'Cafe Event'::text, 'Freebies'::text, 'Other'::text]))
  AND (start_date IS NOT NULL)
  AND (start_time IS NOT NULL)
  AND (end_date IS NOT NULL)
  AND (end_time IS NOT NULL)
  AND (char_length(TRIM(BOTH FROM detailed_address)) > 0)
  AND (char_length(TRIM(BOTH FROM district)) > 0)
  AND (member = ANY (ARRAY['Chanyeol'::text, 'EXO'::text, 'Suho'::text, 'Sehun'::text, 'Kai'::text, 'D.O.'::text]))
  AND ((link IS NULL) OR (link ~* '^https?://'::text))
);