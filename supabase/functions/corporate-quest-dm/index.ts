import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Allowlist of models the client may request through this proxy.
// Keep in sync with src/game/aiConfig.ts (provider 'lovable').
const ALLOWED_MODELS = new Set<string>([
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
]);
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 60_000;
const MAX_SINGLE_CHARS = 20_000;
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Exige um usuário autenticado para não deixar os créditos de LLM abertos ao
  // mundo. Jogadores sem cadastro entram via anonymous sign-in do Supabase — o
  // cliente cria a sessão antes de chamar aqui (ver src/lib/session.ts).
  //
  // Atenção: o Bearer precisa ser o access_token da sessão. A publishable key
  // NÃO é um JWT de usuário e cai no 401 abaixo.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonError("Missing Authorization header (envie o access_token da sessão)", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) {
    console.error("auth rejected:", authError?.message ?? "no user for token");
    return jsonError(
      "Sessão inválida ou expirada. Recarregue a página para obter uma nova.",
      401
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("Invalid JSON body", 400);
    }

    const { messages, model } = body as { messages?: unknown; model?: unknown };

    // --- Validate model ---
    const requestedModel = typeof model === "string" && model.length > 0 ? model : DEFAULT_MODEL;
    if (!ALLOWED_MODELS.has(requestedModel)) {
      return jsonError(`Model not allowed: ${requestedModel}`, 400);
    }

    // --- Validate messages ---
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonError("`messages` must be a non-empty array", 400);
    }
    if (messages.length > MAX_MESSAGES) {
      return jsonError(`Too many messages (max ${MAX_MESSAGES})`, 400);
    }

    let totalChars = 0;
    const sanitizedMessages: { role: string; content: string }[] = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return jsonError("Each message must be an object", 400);
      }
      const { role, content } = m as { role?: unknown; content?: unknown };
      if (typeof role !== "string" || !ALLOWED_ROLES.has(role)) {
        return jsonError("Invalid message role", 400);
      }
      if (typeof content !== "string") {
        return jsonError("Message content must be a string", 400);
      }
      if (content.length > MAX_SINGLE_CHARS) {
        return jsonError(`Message too long (max ${MAX_SINGLE_CHARS} chars)`, 400);
      }
      totalChars += content.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        return jsonError(`Payload too large (max ${MAX_TOTAL_CHARS} chars)`, 400);
      }
      sanitizedMessages.push({ role, content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Secret ausente derruba 100% dos turnos do DM. Responder explícito para
      // não parecer erro de rede ou de crédito no cliente.
      console.error("LOVABLE_API_KEY secret is missing on this project");
      return jsonError(
        "LOVABLE_API_KEY não está configurada nesta instância (Edge Functions → Secrets).",
        503
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: requestedModel,
          messages: sanitizedMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em breve." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonError("AI gateway error", 500);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("corporate-quest-dm error:", e);
    return jsonError(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
