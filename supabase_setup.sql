-- Run this entire script in your Supabase SQL Editor to fix the database matching the AI schema!

-- 1. Drop the existing incomplete table so we can recreate it fresh
DROP TABLE IF EXISTS invoices CASCADE;

-- 2. Create the invoices table with all required columns
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor TEXT NOT NULL,
    buyer_name TEXT,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC,
    currency TEXT DEFAULT 'USD',
    date TEXT,
    due_date TEXT,
    payment_status TEXT,
    invoice_number TEXT,
    gst_number TEXT,
    file_url TEXT,
    raw_text TEXT,
    confidence_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the invoices storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Storage Policies so anyone can upload and view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'invoices' );

DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'invoices' );

-- 4. Setup Database Policies (Disable RLS for public access or configure properly)
-- For this development phase, we'll just allow all operations
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- 5. Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
