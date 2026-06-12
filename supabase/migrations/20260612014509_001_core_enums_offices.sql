-- 1. Create strict Enums for Roles and Statuses to prevent typos
CREATE TYPE public.user_role AS ENUM ('system_admin', 'originator', 'signatory', 'deputy');

-- 2. Create the Offices Table (The Capitol Departments)
CREATE TABLE public.offices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,          
    code TEXT NOT NULL UNIQUE,   
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy
CREATE POLICY "Allow authenticated read access on offices"
    ON public.offices FOR SELECT
    TO authenticated
    USING (true);