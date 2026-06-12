-- 1. Create User Profiles Table (Linked to Supabase Auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    -- Explicitly tell Postgres to look in the public schema for the Enum
    role public.user_role DEFAULT 'originator'::public.user_role NOT NULL,
    -- Explicitly define the public schema for the offices table
    office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Employees can view their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- System Admins can view all profiles
CREATE POLICY "System admins can view all profiles"
    ON user_profiles FOR SELECT
    TO authenticated
    USING ( (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'system_admin' );

-- 4. Automated Profile Creation Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();