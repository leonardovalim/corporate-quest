import { useState } from 'react';
import { AIConfig, PROVIDER_OPTIONS, loadAIConfig, saveAIConfig, testConnection, ConnectionTestResult } from '@/game/aiConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, Check, Plug, Loader2, CircleCheck, CircleX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onConfigChange?: (config: AIConfig) => void;
  triggerVariant?: 'icon' | 'button';
}

type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'error';

export default function AISettingsModal({ onConfigChange, triggerVariant = 'icon' }: Props) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>(loadAIConfig);
  const [showKey, setShowKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null);
  const { toast } = useToast();

  const providerData = PROVIDER_OPTIONS.find(p => p.id === config.provider);

  const handleProviderChange = (providerId: string) => {
    const prov = PROVIDER_OPTIONS.find(p => p.id === providerId)!;
    setConfig(prev => ({
      ...prev,
      provider: prov.id,
      model: prov.defaultModel || prev.model,
      baseUrl: prov.baseUrl || prev.baseUrl,
      apiKey: prov.needsKey ? prev.apiKey : '',
    }));
    // Reset connection status when switching providers
    setConnectionStatus('idle');
    setConnectionResult(null);
  };

  const handleTestConnection = async () => {
    // Validate before testing
    if (providerData?.needsKey && !config.apiKey.trim()) {
      toast({ title: 'API Key obrigatória', description: 'Informe sua API key antes de testar.', variant: 'destructive' });
      return;
    }
    if ((config.provider === 'custom' || config.provider === 'ollama') && !config.baseUrl.trim()) {
      toast({ title: 'URL obrigatória', description: 'Informe a URL do endpoint.', variant: 'destructive' });
      return;
    }

    setConnectionStatus('testing');
    setConnectionResult(null);

    const result = await testConnection(config);
    setConnectionResult(result);
    setConnectionStatus(result.ok ? 'connected' : 'error');
  };

  const handleSave = () => {
    if (providerData?.needsKey && !config.apiKey.trim()) {
      toast({ title: 'API Key obrigatória', description: 'Informe sua API key para usar este provider.', variant: 'destructive' });
      return;
    }
    if ((config.provider === 'custom' || config.provider === 'ollama') && !config.baseUrl.trim()) {
      toast({ title: 'URL obrigatória', description: 'Informe a URL base do endpoint.', variant: 'destructive' });
      return;
    }
    saveAIConfig(config);
    onConfigChange?.(config);
    setOpen(false);
    toast({ title: 'Configurações salvas ✅', description: `Provider: ${providerData?.name}` });
  };

  const needsUrl = config.provider === 'custom' || config.provider === 'ollama';

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setConnectionStatus('idle'); setConnectionResult(null); } }}>
      <DialogTrigger asChild>
        {triggerVariant === 'icon' ? (
          <Button size="icon" variant="ghost" className="rounded-full" title="Configurar IA">
            <Settings className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" /> Configurar IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Motor de IA</DialogTitle>
        </DialogHeader>

        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
          {/* Provider selection */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDER_OPTIONS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProviderChange(p.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleProviderChange(p.id); } }}
                  className={`p-3 rounded-lg border text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    config.provider === p.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium text-xs">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* API Key (only for providers that need it) */}
          {providerData?.needsKey && (
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={config.provider === 'openai' ? 'sk-...' : config.provider === 'anthropic' ? 'sk-ant-...' : 'Sua API key'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Sua chave é salva no localStorage do seu browser. Não use esta opção em computadores compartilhados.
              </p>
            </div>
          )}

          {/* Model */}
          <div className="space-y-2">
            <Label>Modelo</Label>
            {providerData && providerData.models.length > 0 ? (
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
              >
                {providerData.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <Input
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Nome do modelo (ex: gemma4, llama3, mistral, etc)"
              />
            )}
          </div>

          {/* Base URL (for Ollama and Custom) */}
          {needsUrl && (
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={config.baseUrl}
                onChange={e => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={config.provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8080/v1/chat/completions'}
              />
              {config.provider === 'ollama' && (
                <p className="text-[10px] text-muted-foreground">
                  Aponte para seu servidor Ollama (padrão: localhost:11434)
                </p>
              )}
              {config.provider === 'custom' && (
                <p className="text-[10px] text-muted-foreground">
                  Compatível com qualquer API OpenAI-compatible (LM Studio, vLLM, etc).
                </p>
              )}
            </div>
          )}

          {/* Connection Status Indicator */}
          {connectionStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
              connectionStatus === 'testing' ? 'border-border bg-muted/50' :
              connectionStatus === 'connected' ? 'border-green-500/50 bg-green-500/10' :
              'border-red-500/50 bg-red-500/10'
            }`}>
              {connectionStatus === 'testing' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Testando conexão...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <CircleCheck className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-green-400 text-xs">{connectionResult?.message}</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <CircleX className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-red-400 text-xs">{connectionResult?.message}</span>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleTestConnection}
              variant="outline"
              className="flex-1 gap-2"
              disabled={connectionStatus === 'testing'}
            >
              {connectionStatus === 'testing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              Testar Conexão
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Check className="h-4 w-4" /> Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
