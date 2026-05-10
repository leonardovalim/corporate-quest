-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_net      SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;

-- Queues (idempotent)
DO $$ BEGIN PERFORM pgmq.create('auth_emails');              EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails');     EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq');          EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ── Email send log ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      text,
  template_name   text        NOT NULL,
  recipient_email text        NOT NULL,
  status          text        NOT NULL CHECK (status IN ('pending','sent','suppressed','failed','bounced','complained','dlq')),
  error_message   text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read send log"   ON public.email_send_log FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert send log" ON public.email_send_log FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can update send log" ON public.email_send_log FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_email_send_log_created      ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient    ON public.email_send_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_send_log_message      ON public.email_send_log(message_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique ON public.email_send_log(message_id) WHERE status = 'sent';

-- ── Email send state ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id                              int         PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until               timestamptz,
  batch_size                      integer     NOT NULL DEFAULT 10,
  send_delay_ms                   integer     NOT NULL DEFAULT 200,
  auth_email_ttl_minutes          integer     NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes integer     NOT NULL DEFAULT 60,
  updated_at                      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage send state" ON public.email_send_state FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ── Suppressed emails ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  reason     text        NOT NULL CHECK (reason IN ('unsubscribe','bounce','complaint')),
  metadata   jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read suppressed emails"   ON public.suppressed_emails FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

-- ── Unsubscribe tokens ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token      text        NOT NULL UNIQUE,
  email      text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at    timestamptz
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read tokens"          ON public.email_unsubscribe_tokens FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role can insert tokens"        ON public.email_unsubscribe_tokens FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role can mark tokens as used"  ON public.email_unsubscribe_tokens FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

-- ── Queue RPC wrappers (service_role only) ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size int, vt int)
RETURNS TABLE(msg_id bigint, read_ct int, message jsonb)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name); RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_id bigint;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN PERFORM pgmq.create(dlq_name); EXCEPTION WHEN OTHERS THEN NULL; END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN PERFORM pgmq.delete(source_queue, message_id); EXCEPTION WHEN undefined_table THEN NULL; END;
  RETURN new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, int, int)      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)             TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, int, int)       TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint)             TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
