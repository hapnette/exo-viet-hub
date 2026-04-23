DROP POLICY IF EXISTS "Anyone can create events" ON public.events;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;

CREATE POLICY "Public can create valid events"
ON public.events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(name)) > 0
  AND char_length(trim(fanpage)) > 0
  AND type = ANY (ARRAY['LED', 'Photoframe', 'Gift', 'Cafe Event', 'Freebies', 'Other'])
  AND event_date IS NOT NULL
  AND event_time IS NOT NULL
  AND char_length(trim(specific_address)) > 0
  AND char_length(trim(district)) > 0
  AND member = ANY (ARRAY['Chanyeol', 'EXO', 'Suho', 'Sehun', 'Kai', 'D.O.'])
  AND (link IS NULL OR link ~* '^https?://')
);

CREATE POLICY "Public can upload event images with files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND char_length(name) > 0
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])
);