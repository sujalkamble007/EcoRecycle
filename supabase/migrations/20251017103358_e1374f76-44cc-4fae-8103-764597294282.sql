-- Create e_waste_categories table
CREATE TABLE public.e_waste_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.e_waste_categories (name, description, icon) VALUES
  ('Cable', 'Power cables, USB cables, HDMI cables', 'Cable'),
  ('Battery', 'Rechargeable and non-rechargeable batteries', 'Battery'),
  ('TV', 'Televisions and monitors', 'Tv'),
  ('Mobile', 'Smartphones and mobile devices', 'Smartphone'),
  ('Laptop', 'Laptops and notebooks', 'Laptop'),
  ('Other', 'Other electronic waste items', 'Recycle');

-- Create pickup_requests table
CREATE TABLE public.pickup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  confidence_score DECIMAL(5, 2),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.e_waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for e_waste_categories (public read)
CREATE POLICY "Categories are viewable by everyone" 
  ON public.e_waste_categories 
  FOR SELECT 
  USING (true);

-- Create policies for pickup_requests (public can create)
CREATE POLICY "Anyone can create pickup requests" 
  ON public.pickup_requests 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own pickup requests" 
  ON public.pickup_requests 
  FOR SELECT 
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pickup_requests_updated_at
  BEFORE UPDATE ON public.pickup_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();