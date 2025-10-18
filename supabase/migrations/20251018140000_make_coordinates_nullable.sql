-- Make latitude and longitude nullable since we're using text address input
ALTER TABLE public.pickup_requests 
ALTER COLUMN latitude DROP NOT NULL;

ALTER TABLE public.pickup_requests 
ALTER COLUMN longitude DROP NOT NULL;