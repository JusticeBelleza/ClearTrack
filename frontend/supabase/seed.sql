-- 1. Seed Capitol Offices
INSERT INTO public.offices (name, code) VALUES
('Provincial Governor''s Office', 'PGO'),
('Sangguniang Panlalawigan', 'SP'),
('Provincial Human Resource Management Office', 'PHRMO'),
('Provincial Accounting Office', 'PACCO'),
('Provincial Engineering Office', 'PEO'),
('Provincial Health Office', 'PHO');

-- 2. Seed Initial Workflow Templates (What kind of documents we track)
INSERT INTO public.workflow_templates (name) VALUES
('Payroll/Voucher Routing'),
('Provincial Ordinance Creation'),
('Leave Application Processing'),
('Purchase Request (PR)');