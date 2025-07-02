
-- Create a settings table for system configuration
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('system', 'general', 'branding')),
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, key)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Users can view their own settings" 
  ON public.settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" 
  ON public.settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
  ON public.settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert default settings for all existing users
INSERT INTO public.settings (user_id, category, key, value)
SELECT 
  id as user_id,
  'system' as category,
  'timezone' as key,
  'UTC' as value
FROM auth.users
ON CONFLICT (user_id, category, key) DO NOTHING;

INSERT INTO public.settings (user_id, category, key, value)
SELECT 
  id as user_id,
  'general' as category,
  'date_format' as key,
  'YYYY-MM-DD' as value
FROM auth.users
ON CONFLICT (user_id, category, key) DO NOTHING;

INSERT INTO public.settings (user_id, category, key, value)
SELECT 
  id as user_id,
  'branding' as category,
  'company_name' as key,
  'My Company' as value
FROM auth.users
ON CONFLICT (user_id, category, key) DO NOTHING;
