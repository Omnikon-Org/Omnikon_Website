-- Omnikon 2.0 — Migration 0004: Firebase Auth Support & Foreign Key Decoupling
-- Description: Drop foreign key constraint on auth.users so Firebase Auth users can create Supabase profiles smoothly without requiring auth.users entries.

BEGIN;

-- 1. Safely drop foreign key constraint on profiles.id referencing auth.users(id)
ALTER TABLE IF EXISTS public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Ensure auth.admin_create_user_if_not_exists function handles external auth providers
CREATE OR REPLACE FUNCTION public.sync_external_auth_user(
    p_id UUID,
    p_email TEXT,
    p_raw_user_meta_data JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
    -- Ensure corresponding record in auth.users if auth.users table is accessible
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES (
            p_id,
            '00000000-0000-0000-0000-000000000000',
            p_email,
            '$2a$10$abcdefghijklmnopqrstuv', -- Dummy hash for external federated users
            NOW(),
            p_raw_user_meta_data,
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
