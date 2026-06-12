-- 1. Workflow Templates (For dynamic routing)
CREATE TABLE public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., 'Project Proposal', 'Payroll Voucher'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    office_id UUID REFERENCES public.offices(id) ON DELETE CASCADE,
    step_sequence INTEGER NOT NULL,
    UNIQUE(template_id, step_sequence)
);

-- 2. Core Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT NOT NULL UNIQUE, -- The Barcode (e.g., DOC-2026-001)
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    originating_office_id UUID REFERENCES public.offices(id) NOT NULL,
    
    -- Chain of Custody Tracking
    current_office_id UUID REFERENCES public.offices(id),
    current_custodian_id UUID REFERENCES public.user_profiles(id), -- The employee currently holding it
    workflow_template_id UUID REFERENCES public.workflow_templates(id),
    current_step INTEGER DEFAULT 1,
    
    status public.document_status DEFAULT 'CREATED'::public.document_status NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Routing Logs (The Immutable Audit Trail)
CREATE TABLE public.routing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    performed_by_user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    from_office_id UUID REFERENCES public.offices(id),
    to_office_id UUID REFERENCES public.offices(id),
    
    action_taken TEXT NOT NULL, -- e.g., 'FORWARDED', 'RECEIVED', 'INTERNAL_TRANSFER'
    signature_proof_path TEXT,  -- Links to the Supabase Storage blob
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protect the Audit Trail (Immutability)
CREATE OR REPLACE FUNCTION public.prevent_routing_log_updates()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Routing logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER make_routing_logs_immutable
    BEFORE UPDATE OR DELETE ON public.routing_logs
    FOR EACH ROW EXECUTE PROCEDURE public.prevent_routing_log_updates();