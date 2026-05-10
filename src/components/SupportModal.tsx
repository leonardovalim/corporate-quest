import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import pixQr from '@/assets/pix-qr.jpeg';

const PIX_KEY = '00020126770014BR.GOV.BCB.PIX0136ea8692bf-7655-4d05-80e8-8f095459b0060215Corporate Quest520400005303986540510.005802BR5925LEONARDO VALIM CRAVEIRA C6009SAO PAULO62140510RRpYqUk2Ho63045B2E';
const GITHUB_URL = 'https://github.com/leonardovalim/corporate-quest';

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

type View = 'pix' | 'code';

export default function SupportModal({ open, onClose }: SupportModalProps) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<View>('pix');

  // Reset to default view whenever the modal is reopened
  useEffect(() => {
    if (open) setView('pix');
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      toast({ title: 'Chave Pix copiada!', description: 'Cole no seu app do banco para contribuir.' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Copie manualmente a chave Pix.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-5 gap-3">
        {view === 'pix' ? (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Curtindo a Corporate Quest?</DialogTitle>
              <DialogDescription className="text-sm text-foreground/80 pt-1 leading-relaxed text-justify">
                Esse projeto nasceu numa terça-feira improdutiva e virou um RPG de escritório open-source.
                Sem investidor anjo, sem rodada Series A — só café, bugs e bom humor.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-foreground/80 leading-relaxed text-justify w-full">
                Se o jogo te arrancou uma risada, uma contribuição de <strong className="text-primary">R$ 10</strong> ajuda
                a pagar os servidores, a IA do CEO vilão e a próxima expansão de encounters.{' '}
                <span className="text-foreground/70">Sua ajuda mantém o RH digital funcionando.</span>
              </p>
              <div className="bg-white rounded-md p-1.5 ring-1 ring-foreground/10">
                <img src={pixQr} alt="QR Code Pix para contribuição" width={128} height={128} className="block" />
              </div>
              <Button
                variant="default"
                onClick={handleCopy}
                size="sm"
                className="w-full font-mono text-xs"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar chave Pix'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setView('code')}
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 text-center w-full transition-colors"
            >
              Prefere contribuir com código? →
            </button>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} size="sm" className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl">Contribua com código</DialogTitle>
              <DialogDescription className="text-sm text-foreground/80 pt-1 leading-relaxed text-justify">
                Corporate Quest é 100% open-source. Abra uma issue, mande um PR, sugira uma nova classe ou um
                encounter absurdo — tudo conta como hora extra reconhecida.
              </DialogDescription>
            </DialogHeader>

            <p className="text-xs italic text-foreground/55 leading-relaxed text-justify">
              Pull requests são revisados pelo Comitê de Governança Fictícia (eu, sozinho, num domingo à noite).
            </p>

            <Button asChild variant="default" size="sm" className="w-full">
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <Code2 className="mr-2 h-4 w-4" />
                Ver no GitHub
              </a>
            </Button>

            <button
              type="button"
              onClick={() => setView('pix')}
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 text-center w-full transition-colors inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para contribuição via Pix
            </button>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} size="sm" className="w-full">
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
