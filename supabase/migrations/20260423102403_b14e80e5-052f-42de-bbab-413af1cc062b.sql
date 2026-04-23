CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fanpage TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('LED', 'Photoframe', 'Gift', 'Cafe Event', 'Freebies', 'Other')),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  specific_address TEXT NOT NULL,
  ward_commune TEXT,
  district TEXT NOT NULL,
  member TEXT NOT NULL CHECK (member IN ('Chanyeol', 'EXO', 'Suho', 'Sehun', 'Kai', 'D.O.')),
  link TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_member ON public.events (member);
CREATE INDEX idx_events_event_date_time ON public.events (event_date, event_time);
CREATE INDEX idx_events_created_at ON public.events (created_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create events"
ON public.events
FOR INSERT
WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Public can upload event images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event-images');