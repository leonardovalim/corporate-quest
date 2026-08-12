import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PROVIDER_OPTIONS, loadAIConfig, testConnection } from '@/game/aiConfig';
import type { AIConfig, AIProvider } from '@/game/aiConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Auth ──────────────────────────────────────────────────────────────────────

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USERNAME = 'admin';

function isLoggedIn() {
  return !!sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function getStoredToken(): string {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? '';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username !== ADMIN_USERNAME) {
      setError('Credenciais inválidas');
      return;
    }
    const { data: token, error: rpcErr } = await supabase.rpc('create_admin_session', { p_password: password });
    if (rpcErr || !token) {
      setError('Credenciais inválidas');
      return;
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border rounded-lg bg-card shadow-lg">
        <h1 className="text-2xl font-bold text-center">Admin</h1>
        <div className="space-y-2">
          <Label htmlFor="username">Usuário</Label>
          <Input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </div>
  );
}

// ── AI Config Tab ─────────────────────────────────────────────────────────────

function AIConfigTab() {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig());
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    supabase.from('admin_config').select('ai_config').eq('id', 1).maybeSingle()
      .then(({ data }) => {
        if (data?.ai_config && typeof data.ai_config === 'object' && !Array.isArray(data.ai_config)) {
          const cfg = data.ai_config as Record<string, unknown>;
          if (cfg.provider) setConfig({ apiKey: '', baseUrl: '', ...cfg } as AIConfig);
        }
      });
  }, []);

  const provider = PROVIDER_OPTIONS.find(p => p.id === config.provider)!;

  const handleProviderChange = (id: AIProvider) => {
    const opt = PROVIDER_OPTIONS.find(p => p.id === id)!;
    setConfig({ provider: id, apiKey: '', model: opt.defaultModel, baseUrl: opt.baseUrl });
    setStatusMsg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    // A chave NUNCA vai para o config global: admin_config é de leitura pública
    // e, mesmo que não fosse, o cliente usa a chave direto do navegador. Cada
    // jogador informa a sua em Configurações de IA. O servidor também descarta
    // este campo (migration 0006) — aqui é só para não enviá-lo de saída.
    const { apiKey: _discarded, ...globalConfig } = config;
    const { error } = await supabase.rpc('update_admin_ai_config', {
      p_token: getStoredToken(),
      p_config: globalConfig as any,
    });
    setSaving(false);
    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'success', text: 'Configuração salva! Usuários online receberão na próxima mensagem.' });
    }
  };

  const handleClearOverride = async () => {
    setSaving(true);
    setStatusMsg(null);
    const { error } = await supabase.rpc('update_admin_ai_config', {
      p_token: getStoredToken(),
      p_config: {},
    });
    setSaving(false);
    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'info', text: 'Override removido. Usuários voltarão a usar suas configurações individuais.' });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    const result = await testConnection(config);
    setTesting(false);
    setStatusMsg({ type: result.ok ? 'success' : 'error', text: result.message });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-sm text-muted-foreground">
          Esta configuração sobrescreve a de <strong>todos os jogadores</strong>. Mudanças propagam em tempo real para usuários ativos.
        </p>
      </div>

      {/* Provider grid */}
      <div className="space-y-2">
        <Label>Provider</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleProviderChange(opt.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                config.provider === opt.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium text-sm">{opt.name}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label>Modelo</Label>
        {provider.models.length > 0 ? (
          <Select value={config.model} onValueChange={m => setConfig(c => ({ ...c, model: m }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {provider.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={config.model}
            onChange={e => setConfig(c => ({ ...c, model: e.target.value }))}
            placeholder="Nome do modelo..."
          />
        )}
      </div>

      {/* API Key — só para o teste de conexão abaixo; nunca é salva no config global */}
      {provider.needsKey && (
        <div className="space-y-2">
          <Label>API Key <span className="opacity-60">(não é salva)</span></Label>
          <Input
            type="password"
            value={config.apiKey}
            onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
            placeholder="sk-..."
          />
          <p className="text-xs opacity-70">
            Usada apenas para o teste de conexão nesta tela. A configuração global
            guarda somente provedor e modelo — uma chave global ficaria visível
            para qualquer visitante, já que o navegador chama o provedor direto.
            Cada jogador informa a sua em <strong>Configurações de IA</strong>.
          </p>
        </div>
      )}

      {/* Base URL */}
      {(config.provider === 'ollama' || config.provider === 'custom') && (
        <div className="space-y-2">
          <Label>Base URL</Label>
          <Input
            value={config.baseUrl}
            onChange={e => setConfig(c => ({ ...c, baseUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Status */}
      {statusMsg && (
        <p className={`text-sm ${
          statusMsg.type === 'success' ? 'text-green-600'
          : statusMsg.type === 'error' ? 'text-destructive'
          : 'text-muted-foreground'
        }`}>
          {statusMsg.text}
        </p>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleTest} variant="outline" disabled={testing || saving}>
          {testing ? 'Testando...' : 'Testar conexão'}
        </Button>
        <Button onClick={handleSave} disabled={saving || testing}>
          {saving ? 'Salvando...' : 'Salvar para todos'}
        </Button>
        <Button onClick={handleClearOverride} variant="ghost" disabled={saving || testing}>
          Remover override
        </Button>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  linkedin_url: string | null;
  has_product_openings: boolean;
  rating: number | null;
  feedback: string | null;
  character_snapshot: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
};

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc('get_all_profiles_for_admin', { p_token: getStoredToken() })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); }
        else { setUsers((data ?? []) as UserRow[]); }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error) return <p className="text-destructive">Erro: {error}</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">{users.length} usuário(s) cadastrado(s)</p>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nome</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Empresa</TableHead>
              <TableHead className="whitespace-nowrap">Cadastrado em</TableHead>
              <TableHead className="whitespace-nowrap">Último login</TableHead>
              <TableHead className="whitespace-nowrap">Personagem</TableHead>
              <TableHead className="whitespace-nowrap">Classe</TableHead>
              <TableHead className="whitespace-nowrap">Background</TableHead>
              <TableHead className="whitespace-nowrap">Alinhamento</TableHead>
              <TableHead className="whitespace-nowrap">Tendência</TableHead>
              <TableHead className="whitespace-nowrap">Level</TableHead>
              <TableHead className="whitespace-nowrap">XP</TableHead>
              <TableHead className="whitespace-nowrap">EXE</TableHead>
              <TableHead className="whitespace-nowrap">INF</TableHead>
              <TableHead className="whitespace-nowrap">TEC</TableHead>
              <TableHead className="whitespace-nowrap">RES</TableHead>
              <TableHead className="whitespace-nowrap">CRE</TableHead>
              <TableHead className="whitespace-nowrap">AWA</TableHead>
              <TableHead className="whitespace-nowrap">Feat</TableHead>
              <TableHead className="whitespace-nowrap">Vagas?</TableHead>
              <TableHead className="whitespace-nowrap">Rating</TableHead>
              <TableHead className="whitespace-nowrap">Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => {
              const char = u.character_snapshot?.character;
              const attrs = char?.attributes ?? {};
              return (
                <TableRow key={u.id}>
                  <TableCell className="whitespace-nowrap font-medium">{u.full_name}</TableCell>
                  <TableCell className="whitespace-nowrap">{u.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{u.company_name}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(u.created_at)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{fmt(u.last_sign_in_at ?? u.updated_at)}</TableCell>
                  <TableCell className="whitespace-nowrap">{char?.name ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">{char?.className ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">{char?.background ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{char?.alignment ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {char?.tendency
                      ? <Badge variant="outline">{char.tendency}</Badge>
                      : '—'}
                  </TableCell>
                  <TableCell className="text-center">{char?.level ?? '—'}</TableCell>
                  <TableCell className="text-center">{char?.resources?.xp ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.EXE ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.INF ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.TEC ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.RES ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.CRE ?? '—'}</TableCell>
                  <TableCell className="text-center">{attrs.AWA ?? '—'}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{char?.feats?.[0]?.name ?? '—'}</TableCell>
                  <TableCell className="text-center">{u.has_product_openings ? 'Sim' : 'Não'}</TableCell>
                  <TableCell className="text-center">{u.rating != null ? `${u.rating}/10` : '—'}</TableCell>
                  <TableCell className="max-w-[200px] text-xs text-muted-foreground truncate">{u.feedback ?? '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────

type LogRow = {
  id: string;
  created_at: string;
  session_id: string;
  provider: string | null;
  model: string | null;
  event: string;
  encounter: string | null;
  phase: number | null;
  data: Record<string, unknown>;
};

const EVENT_COLORS: Record<string, string> = {
  llm_response: 'text-green-400',
  llm_retry:    'text-yellow-400',
  llm_error:    'text-red-400',
};

function exportLogs(logs: LogRow[]) {
  const rows = [
    ['created_at', 'session_id', 'provider', 'model', 'event', 'encounter', 'phase', 'data'],
    ...logs.map(l => [
      l.created_at,
      l.session_id,
      l.provider ?? '',
      l.model ?? '',
      l.event,
      l.encounter ?? '',
      l.phase ?? '',
      JSON.stringify(l.data),
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cq-logs-${new Date().toISOString().slice(0, 16).replace('T', '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LogsTab() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc('get_game_logs_for_admin', {
      p_token: getStoredToken(),
      p_limit: 200,
      p_event: filter === 'all' ? null : filter,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setLogs((data ?? []) as LogRow[]);
  };

  useEffect(() => { load(); }, [filter]);

  if (error) return <p className="text-destructive">Erro: {error}</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Todos os eventos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="llm_response">llm_response</SelectItem>
            <SelectItem value="llm_retry">llm_retry</SelectItem>
            <SelectItem value="llm_error">llm_error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportLogs(logs)} disabled={logs.length === 0}>
          Exportar CSV
        </Button>
        <span className="text-sm text-muted-foreground">{logs.length} entradas</span>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Data/hora</TableHead>
              <TableHead className="whitespace-nowrap">Sessão</TableHead>
              <TableHead className="whitespace-nowrap">Provider · Modelo</TableHead>
              <TableHead className="whitespace-nowrap">Encontro · Fase</TableHead>
              <TableHead className="whitespace-nowrap">Evento</TableHead>
              <TableHead>Dados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id} className="cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                <TableCell className="whitespace-nowrap text-xs">{fmt(log.created_at)}</TableCell>
                <TableCell className="text-xs font-mono">{log.session_id.slice(-8)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{log.provider ?? '—'} · {log.model ?? '—'}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{log.encounter ?? '—'} {log.phase != null ? `· f${log.phase}` : ''}</TableCell>
                <TableCell className={`text-xs font-mono whitespace-nowrap ${EVENT_COLORS[log.event] ?? ''}`}>{log.event}</TableCell>
                <TableCell className="text-xs max-w-xs">
                  {expanded === log.id
                    ? <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(log.data, null, 2)}</pre>
                    : <span className="truncate block max-w-xs text-muted-foreground">{JSON.stringify(log.data).slice(0, 80)}</span>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Database Tab ──────────────────────────────────────────────────────────────

const EXPECTED_TABLES = [
  'profiles',
  'admin_config',
  'game_logs',
  'game_saves',
  'email_send_log',
  'email_send_state',
  'suppressed_emails',
  'email_unsubscribe_tokens',
] as const;

type TableStatus = { name: string; ok: boolean; rows?: number; error?: string };

function DatabaseTab() {
  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const projectId = url?.split('//')[1]?.split('.')[0] ?? '—';
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const check = async () => {
    setChecking(true);
    const results = await Promise.all(
      EXPECTED_TABLES.map(async (name) => {
        const { count, error } = await (supabase as any)
          .from(name)
          .select('*', { count: 'exact', head: true });
        return error
          ? { name, ok: false, error: error.message }
          : { name, ok: true, rows: count ?? 0 };
      })
    );
    setTables(results);
    setCheckedAt(new Date());
    setChecking(false);
  };

  useEffect(() => { check(); }, []);

  const allOk = tables.length > 0 && tables.every(t => t.ok);

  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Projeto</span>
          <span className="font-mono text-sm">{projectId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">URL</span>
          <span className="font-mono text-xs text-muted-foreground">{url}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status geral</span>
          {tables.length === 0
            ? <Badge variant="outline">Verificando...</Badge>
            : allOk
              ? <Badge className="bg-green-600 text-white">Íntegro</Badge>
              : <Badge variant="destructive">Com erros</Badge>
          }
        </div>
        {checkedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Verificado em</span>
            <span className="text-xs text-muted-foreground">{checkedAt.toLocaleTimeString('pt-BR')}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Tabelas</span>
          <Button variant="outline" size="sm" onClick={check} disabled={checking}>
            {checking ? 'Verificando...' : 'Reverificar'}
          </Button>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabela</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Linhas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXPECTED_TABLES.map(name => {
                const t = tables.find(x => x.name === name);
                return (
                  <TableRow key={name}>
                    <TableCell className="font-mono text-sm">{name}</TableCell>
                    <TableCell className="text-center">
                      {!t
                        ? <Badge variant="outline">—</Badge>
                        : t.ok
                          ? <Badge className="bg-green-600 text-white">OK</Badge>
                          : <Badge variant="destructive">Erro</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {t?.ok ? t.rows : t?.error
                        ? <span className="text-destructive text-xs">{t.error}</span>
                        : '—'
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { setMsg({ type: 'error', text: 'Nova senha e confirmação não coincidem' }); return; }
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.rpc('change_admin_password', {
      p_current_password: current,
      p_new_password: next,
    });
    setSaving(false);
    if (error) {
      setMsg({ type: 'error', text: error.message });
    } else {
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrent(''); setNext(''); setConfirm('');
    }
  };

  return (
    <div className="space-y-6 max-w-sm">
      <p className="text-sm text-muted-foreground">
        Troque a senha do painel admin. Senha padrão após instalação: <code className="bg-muted px-1 rounded">admin</code>.
      </p>
      <form onSubmit={handleChange} className="space-y-4">
        <div className="space-y-2">
          <Label>Senha atual</Label>
          <Input type="password" value={current} onChange={e => setCurrent(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Nova senha</Label>
          <Input type="password" value={next} onChange={e => setNext(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Confirmar nova senha</Label>
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        {msg && (
          <p className={`text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
            {msg.text}
          </p>
        )}
        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Alterar senha'}</Button>
      </form>
    </div>
  );
}

// ── AdminDashboard ────────────────────────────────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Corporate Quest — Admin</h1>
        <Button variant="outline" size="sm" onClick={onLogout}>Sair</Button>
      </header>
      <main className="p-6">
        <Tabs defaultValue="ai-config">
          <TabsList className="mb-6">
            <TabsTrigger value="ai-config">Configuração de IA</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="database">Banco de Dados</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
          <TabsContent value="ai-config"><AIConfigTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="logs"><LogsTab /></TabsContent>
          <TabsContent value="database"><DatabaseTab /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ── AdminPage ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setLoggedIn(false);
  };

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
