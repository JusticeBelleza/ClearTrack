-- 1. Create Enums for strict Role and Status enforcement
CREATE TYPE public.user_role AS ENUM ('system_admin', 'staff');
CREATE TYPE public.document_status AS ENUM ('CREATED', 'IN_TRANSIT', 'RECEIVED', 'UNDER_PROCESSING', 'COMPLETED', 'RETURNED');

-- 2. Create Capitol Offices Table
CREATE TABLE public.offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create User Profiles
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE,
    office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    designation TEXT,
    employment_status TEXT DEFAULT 'Regular',
    role public.user_role DEFAULT 'staff'::public.user_role NOT NULL, -- DEFAULT IS NOW STAFF
    signature_pin TEXT, 
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auto-Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, email, full_name, employee_id, contact_number, office_id, 
    designation, employment_status, role, signature_pin, is_approved
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
    new.raw_user_meta_data->>'employee_id',
    new.raw_user_meta_data->>'contact_number',
    NULLIF(new.raw_user_meta_data->>'office_id', '')::UUID,
    new.raw_user_meta_data->>'designation',
    COALESCE(new.raw_user_meta_data->>'employment_status', 'Regular'),
    'staff'::public.user_role, -- EVERYONE WHO REGISTERS IS AUTOMATICALLY STAFF
    new.raw_user_meta_data->>'signature_pin',
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();