import type { AIConfig } from './aiConfig';

type Msg = { role: string; content: string };

function parseSSE(
  buffer: string,
  onDelta: (text: string) => void
): { remaining: string; done: boolean } {
  let remaining = buffer;
  let done = false;
  let newlineIdx: number;

  while ((newlineIdx = remaining.indexOf('\n')) !== -1) {
    let line = remaining.slice(0, newlineIdx);
    remaining = remaining.slice(newlineIdx + 1);
    if (line.endsWith('\r')) line = line.slice(0, -1);
    if (line.startsWith(':') || line.trim() === '') continue;
    if (!line.startsWith('data: ')) continue;
    const json = line.slice(6).trim();
    if (json === '[DONE]') { done = true; break; }
    try {
      const parsed = JSON.parse(json);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) onDelta(content);
    } catch {
      remaining = line + '\n' + remaining;
      break;
    }
  }
  return { remaining, done };
}

function flushBuffer(buffer: string, onDelta: (text: string) => void) {
  if (!buffer.trim()) return;
  for (let raw of buffer.split('\n')) {
    if (!raw) continue;
    if (raw.endsWith('\r')) raw = raw.slice(0, -1);
    if (!raw.startsWith('data: ')) continue;
    const json = raw.slice(6).trim();
    if (json === '[DONE]') continue;
    try {
      const parsed = JSON.parse(json);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) onDelta(content);
    } catch {}
  }
}

async function readStream(body: ReadableStream<Uint8Array>, onDelta: (text: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });
    const result = parseSSE(buffer, onDelta);
    buffer = result.remaining;
    if (result.done) break;
  }
  flushBuffer(buffer, onDelta);
}

// --- Lovable AI (via edge function) with retry on transient network drops ---
function isTransientNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  // Safari/iOS: "Load failed", Chrome: "Failed to fetch", generic: "network error"
  return /load failed|failed to fetch|network|aborted|err_network|connection/i.test(msg);
}

async function streamLovableOnce(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const url = `${import.meta.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/corporate-quest-dm`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, model: aiConfig.model }),
  });
  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => 'Unknown error');
    if (resp.status === 429) throw new Error('Rate limit exceeded. Aguarde um momento.');
    if (resp.status === 402) throw new Error('Créditos esgotados. Adicione créditos no workspace.');
    throw new Error(`AI error: ${errText}`);
  }
  await readStream(resp.body, onDelta);
}

async function streamLovable(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
  let receivedAny = false;
  const wrappedDelta = (text: string) => { receivedAny = true; onDelta(text); };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await streamLovableOnce(messages, aiConfig, wrappedDelta);
      return;
    } catch (err) {
      lastErr = err;
      // Don't retry if we already started receiving content (would duplicate output)
      // or if it's a non-transient error (rate limit, auth, etc.)
      if (receivedAny || !isTransientNetworkError(err)) throw err;
      if (attempt === MAX_ATTEMPTS) break;
      const delay = 500 * attempt; // 500ms, 1000ms
      console.warn(`[StreamChat] Network drop (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${delay}ms...`, err);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error(
    `Conexão instável. Verifique sua internet e tente novamente. (${lastErr instanceof Error ? lastErr.message : 'erro desconhecido'})`
  );
}

// --- OpenAI Direct ---
async function streamOpenAI(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({ model: aiConfig.model, messages, stream: true }),
  });
  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI: ${err.error?.message || resp.statusText}`);
  }
  await readStream(resp.body, onDelta);
}

// --- Anthropic Direct ---
async function streamAnthropic(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  // Anthropic uses a different format: separate system from messages
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': aiConfig.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: aiConfig.model,
      max_tokens: 2048,
      system: systemMsg?.content || '',
      messages: chatMsgs,
      stream: true,
    }),
  });
  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Anthropic: ${err.error?.message || resp.statusText}`);
  }

  // Anthropic SSE format is different
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') return;
      try {
        const parsed = JSON.parse(json);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          onDelta(parsed.delta.text);
        }
      } catch {}
    }
  }
}

// --- Ollama Native (local LLM) ---
async function streamOllama(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const resp = await fetch(`${aiConfig.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: aiConfig.model, messages, stream: true }),
  });
  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => 'Unknown error');
    throw new Error(`Ollama error: ${errText}`);
  }
  // Ollama streams newline-delimited JSON (not SSE)
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          onDelta(parsed.message.content);
        }
        if (parsed.done) return;
      } catch {}
    }
  }
}

// --- Google Gemini ---
function mergeConsecutiveRoles(msgs: { role: string; parts: { text: string }[] }[]) {
  const out: typeof msgs = [];
  for (const msg of msgs) {
    if (out.length > 0 && out[out.length - 1].role === msg.role) {
      out[out.length - 1].parts.push(...msg.parts);
    } else {
      out.push({ role: msg.role, parts: [...msg.parts] });
    }
  }
  return out;
}

async function streamGemini(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs = mergeConsecutiveRoles(
    messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
  );

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:streamGenerateContent?alt=sse`;
  const body: Record<string, unknown> = {
    contents: chatMsgs,
    generationConfig: { maxOutputTokens: 2048 },
  };
  if (systemMsg?.content) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': aiConfig.apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Gemini: ${err.error?.message || resp.statusText}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') return;
      try {
        const parsed = JSON.parse(json);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onDelta(text);
      } catch {}
    }
  }
}

// --- Custom (OpenAI-compatible) ---
async function streamCustom(messages: Msg[], aiConfig: AIConfig, onDelta: (text: string) => void) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (aiConfig.apiKey) headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;

  const resp = await fetch(aiConfig.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: aiConfig.model, messages, stream: true }),
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`Custom API error: ${resp.statusText}`);
  }
  await readStream(resp.body, onDelta);
}

// --- Main export ---
export async function streamChat({
  messages,
  aiConfig,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  aiConfig: AIConfig;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const handlers: Record<string, typeof streamLovable> = {
    lovable: streamLovable,
    openai: streamOpenAI,
    anthropic: streamAnthropic,
    gemini: streamGemini,
    ollama: streamOllama,
    custom: streamCustom,
  };

  const handler = handlers[aiConfig.provider] || streamLovable;
  const startTime = Date.now();
  console.log(`[StreamChat] START provider=${aiConfig.provider} model=${aiConfig.model} msgs=${messages.length}`);
  try {
    await handler(messages, aiConfig, onDelta);
    console.log(`[StreamChat] DONE in ${Date.now() - startTime}ms`);
    onDone();
  } catch (err) {
    console.error(`[StreamChat] ERROR after ${Date.now() - startTime}ms:`, err);
    throw err;
  }
}
