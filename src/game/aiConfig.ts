export type AIProvider = 'lovable' | 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  model?: string;
  latencyMs?: number;
}

export const PROVIDER_OPTIONS: { id: AIProvider; name: string; models: string[]; defaultModel: string; baseUrl: string; needsKey: boolean; description: string }[] = [
  {
    // id mantido como 'lovable' para não invalidar configs já salvas em
    // localStorage e no admin_config. O que ele significa hoje é "o proxy do
    // servidor": a edge function decide o destino pelo nome do modelo e usa a
    // chave que está nos secrets — nenhuma chave passa pelo navegador.
    id: 'lovable',
    name: 'Servidor do jogo (padrão)',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'google/gemini-3-flash-preview',
      'google/gemini-2.5-flash',
      'google/gemini-2.5-pro',
      'openai/gpt-5',
      'openai/gpt-5-mini',
    ],
    defaultModel: 'gpt-4o-mini',
    baseUrl: '',
    needsKey: false,
    description: 'Sem configuração — a chave fica no servidor',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    defaultModel: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    needsKey: true,
    description: 'GPT-4o, o1, etc.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-sonnet-4-20250514',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    needsKey: true,
    description: 'Claude Sonnet, Opus',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-flash-latest', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-flash-latest',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    needsKey: true,
    description: '2.0 Flash Preview · 1.5 Pro · 1.5 Flash',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [],
    defaultModel: 'gemma4',
    baseUrl: 'http://localhost:11434',
    needsKey: false,
    description: 'LLM local, sem API key',
  },
  {
    id: 'custom',
    name: 'Custom (Qualquer LLM)',
    models: [],
    defaultModel: '',
    baseUrl: '',
    needsKey: false,
    description: 'OpenAI-compatible endpoint',
  },
];

const STORAGE_KEY = 'corporate-quest-ai-config';

export function loadAIConfig(): AIConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { provider: 'lovable', apiKey: '', model: 'gpt-4o-mini', baseUrl: '' };
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Combina a configuração global (painel admin) com a do jogador.
 *
 * A regra que não se quebra: **a chave nunca vem do servidor**. A config global
 * é lida de uma tabela de leitura pública e, mesmo que não fosse, o cliente usa
 * a chave para chamar o provedor direto do navegador — qualquer chave global
 * apareceria no DevTools de todo jogador. Então o admin escolhe provider/model
 * e cada jogador traz a própria chave.
 */
export function resolveAIConfig(adminConfig: AIConfig | null): AIConfig {
  const local = loadAIConfig();
  if (!adminConfig) return local;
  return {
    ...adminConfig,
    apiKey: local.apiKey ?? '',
    baseUrl: adminConfig.baseUrl || local.baseUrl,
  };
}

/** Provedores que não funcionam sem chave — usado para dar erro acionável. */
export function requiresApiKey(provider: AIProvider): boolean {
  return PROVIDER_OPTIONS.find(p => p.id === provider)?.needsKey ?? false;
}

/**
 * Tests connectivity to the configured LLM endpoint.
 * Agnostic: works with any provider — Ollama, OpenAI, Anthropic, custom, etc.
 */
export async function testConnection(config: AIConfig): Promise<ConnectionTestResult> {
  const start = Date.now();

  // Lovable uses Supabase edge function — always "connected"
  if (config.provider === 'lovable') {
    return { ok: true, message: 'Lovable AI configurado (edge function)', latencyMs: 0 };
  }

  try {
    if (config.provider === 'ollama') {
      // Ollama native API: POST /api/generate
      const resp = await fetch(`${config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: config.model, prompt: 'Oi', stream: false }),
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status}: ${errText || resp.statusText}`);
      }
      const data = await resp.json();
      const latency = Date.now() - start;
      return {
        ok: true,
        message: `Conectado! Modelo "${data.model || config.model}" respondeu em ${latency}ms`,
        model: data.model || config.model,
        latencyMs: latency,
      };
    }

    if (config.provider === 'openai' || config.provider === 'custom') {
      // OpenAI-compatible: POST to chat/completions
      const url = config.provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : config.baseUrl;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: 'Oi' }],
          max_tokens: 5,
          stream: false,
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: { message: resp.statusText } }));
        throw new Error(errData.error?.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const latency = Date.now() - start;
      const modelUsed = data.model || config.model;
      return {
        ok: true,
        message: `Conectado! Modelo "${modelUsed}" respondeu em ${latency}ms`,
        model: modelUsed,
        latencyMs: latency,
      };
    }

    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': config.apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Oi' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: { message: resp.statusText } }));
        throw new Error(errData.error?.message || `HTTP ${resp.status}`);
      }
      const latency = Date.now() - start;
      return {
        ok: true,
        message: `Conectado! Modelo "${config.model}" respondeu em ${latency}ms`,
        model: config.model,
        latencyMs: latency,
      };
    }

    if (config.provider === 'anthropic') {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Oi' }],
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: { message: resp.statusText } }));
        throw new Error(errData.error?.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const latency = Date.now() - start;
      return {
        ok: true,
        message: `Conectado! Modelo "${data.model || config.model}" respondeu em ${latency}ms`,
        model: data.model || config.model,
        latencyMs: latency,
      };
    }

    return { ok: false, message: 'Provider não reconhecido' };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || 'Erro desconhecido ao testar conexão',
      latencyMs: Date.now() - start,
    };
  }
}
