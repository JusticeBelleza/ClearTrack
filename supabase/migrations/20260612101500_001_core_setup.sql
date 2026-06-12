-- 1. Create Enums for strict Role and Status enforcement
CREATE TYPE public.user_role AS ENUM ('system_admin', 'originator', 'custodian', 'signatory', 'deputy');
CREATE TYPE public.document_status AS ENUM ('CREATED', 'IN_TRANSIT', 'RECEIVED', 'UNDER_PROCESSING', 'COMPLETED', 'RETURNED');

-- 2. Create Capitol Offices Table
CREATE TABLE public.offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE, -- e.g., 'PHO', 'GOV', 'SP'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create User Profiles (Links to Supabase Auth)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    designation TEXT, -- e.g., 'Nurse III', 'Provincial Administrator'
    role public.user_role DEFAULT 'custodian'::public.user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Auto-Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'custodian'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();