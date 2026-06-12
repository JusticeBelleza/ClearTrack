-- 1. Create Document Status Enum
CREATE TYPE public.document_status AS ENUM ('draft', 'in_transit', 'received', 'completed');

-- 2. Create Documents Table
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL, -- The QR code value
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status public.document_status DEFAULT 'draft'::public.document_status NOT NULL,
    originator_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    current_office_id UUID REFERENCES public.offices(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Routing Logs Table (The Audit Trail)
CREATE TABLE public.routing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    forwarding_office_id UUID REFERENCES public.offices(id),
    receiving_office_id UUID REFERENCES public.offices(id) NOT NULL,
    forwarded_by UUID REFERENCES public.user_profiles(id),
    received_by UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL, -- e.g., 'Released', 'Received'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (All logged-in Capitol employees can view the trails)
CREATE POLICY "Allow authenticated read on documents" 
    ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on routing_logs" 
    ON public.routing_logs FOR SELECT TO authenticated USING (true);