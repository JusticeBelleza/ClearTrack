-- Add the courier_id column to the documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS courier_id UUID REFERENCES public.user_profiles(id);

-- Add destination_office_id so the courier knows where they are going
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS destination_office_id UUID REFERENCES public.offices(id);

-- Update RLS (Row Level Security) to allow users to see documents they are couriering
CREATE POLICY "Couriers can view documents in their custody" ON documents
  FOR SELECT USING (auth.uid() = courier_id);