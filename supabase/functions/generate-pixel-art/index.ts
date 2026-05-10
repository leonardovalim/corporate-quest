import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "pixel-art";
const OPENAI_URL = "https://api.openai.com/v1/images/generations";

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonOk(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildPrompt(encounterName: string, phase: number): string {
  const intensity =
    phase <= 1
      ? "calm but tense"
      : phase === 2
      ? "escalating stress, people visibly frustrated"
      : phase === 3
      ? "chaotic, arms raised, error screens, papers flying"
      : "full meltdown, total corporate chaos, red alerts";

  return [
    "Pixel art illustration, 16-bit retro game style, wide panoramic view (128x50 aspect),",
    "scene inside a modern corporate open-plan office with desks, monitors, whiteboards, fluorescent lights.",
    `Encounter: "${encounterName}". Mood: ${intensity}.`,
    "Limited palette, sharp pixels, no anti-aliasing, no blur, visible pixel grid,",
    "side-scroller perspective, dark cyberpunk-office vibe. Do NOT include any text or letters.",
  ].join(" ");
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid JSON body", 400);

    const { encounterName, phase } = body as {
      encounterName?: unknown;
      phase?: unknown;
    };

    if (typeof encounterName !== "string" || encounterName.length === 0) {
      return jsonError("`encounterName` required", 400);
    }
    if (typeof phase !== "number" || !Number.isFinite(phase)) {
      return jsonError("`phase` required", 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) return jsonError("Supabase env missing", 500);
    if (!OPENAI_API_KEY) return jsonError("OPENAI_API_KEY not configured", 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // 1. Check cache
    const { data: cached } = await supabase
      .from("pixel_art_cache")
      .select("image_url")
      .eq("encounter_name", encounterName)
      .eq("phase", phase)
      .maybeSingle();

    if (cached?.image_url) {
      return jsonOk({ imageUrl: cached.image_url, cached: true });
    }

    // 2. Generate via DALL-E 3
    const prompt = buildPrompt(encounterName, phase);
    const dalleRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
        quality: "standard",
      }),
    });

    if (!dalleRes.ok) {
      const errText = await dalleRes.text();
      return jsonError(`OpenAI error: ${errText}`, 502);
    }

    const dalleJson = await dalleRes.json();
    const b64: string | undefined = dalleJson?.data?.[0]?.b64_json;
    if (!b64) return jsonError("No image in OpenAI response", 502);

    // 3. Upload to Storage
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `${slug(encounterName)}/phase-${phase}-${Date.now()}.png`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/png", upsert: true });

    if (uploadErr) return jsonError(`Upload failed: ${uploadErr.message}`, 500);

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const imageUrl = publicData.publicUrl;

    // 4. Upsert cache
    await supabase.from("pixel_art_cache").upsert({
      encounter_name: encounterName,
      phase,
      image_url: imageUrl,
      storage_path: path,
    });

    return jsonOk({ imageUrl, cached: false });
  } catch (err) {
    return jsonError(`Unexpected: ${(err as Error).message}`, 500);
  }
});
