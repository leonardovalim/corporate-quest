-- Fix ambiguous 'id' column reference in JOIN clause by qualifying all references
CREATE OR REPLACE FUNCTION public.get_all_profiles_for_admin(p_password text)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  company_name text,
  linkedin_url text,
  has_product_openings boolean,
  rating smallint,
  feedback text,
  character_snapshot jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_stored text;
BEGIN
  SELECT admin_password INTO v_stored FROM public.admin_config WHERE id = 1;
  IF p_password IS DISTINCT FROM v_stored THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT
      p.id, p.full_name, p.email, p.phone, p.company_name, p.linkedin_url,
      p.has_product_openings, p.rating, p.feedback, p.character_snapshot,
      p.created_at, p.updated_at, u.last_sign_in_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON (u.id = p.id)
    ORDER BY p.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_all_profiles_for_admin(text) TO anon, authenticated;
