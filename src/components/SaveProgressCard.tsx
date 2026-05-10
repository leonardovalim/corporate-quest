import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/game/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface Props {
  onDismiss: () => void;
  onGoHome?: () => void;
}

export default function SaveProgressCard({ onDismiss, onGoHome }: Props) {
  const { character, messages, encounter, recentEncounters, diceLog } = useGame();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const snapshot = character
        ? { character, messages: messages.slice(-100), encounter, recentEncounters, diceLog: diceLog.slice(0, 20), savedAt: new Date().toISOString() }
        : null;
      localStorage.setItem('pendingProfile', JSON.stringify({ email, character_snapshot: snapshot }));
      localStorage.setItem('cq.pendingProfileCompletion', '1');
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (otpError) throw otpError;
      setSubmitted(true);
      toast({ title: 'Cheque seu e-mail 📤', description: 'Clique no link mágico para salvar seu progresso.' });
    } catch (e: any) {
      setError(e?.message ?? 'Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-lg p-4 md:p-6 space-y-2 text-center"
      >
        <p className="text-sm md:text-base font-pixel text-primary">📤 Link enviado!</p>
        <p className="text-xs md:text-sm text-muted-foreground">
          Abra seu e-mail e clique no link mágico. Quando voltar, seu progresso será salvo automaticamente.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          {onGoHome && (
            <Button variant="ghost" size="sm" onClick={onGoHome}>
              Ir ao menu
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Continuar jogando
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-primary/20 rounded-lg p-4 md:p-6 space-y-4"
    >
      <div className="space-y-1 text-center">
        <h3 className="text-xs md:text-sm font-pixel text-primary">💾 Quer salvar essa carreira brilhante?</h3>
        <p className="text-xs md:text-sm text-muted-foreground italic">
          Sem cadastro, seu personagem some quando você fechar a aba — igual aquele documento que você esqueceu de salvar.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          disabled={submitting}
          autoFocus
        />
        {error && <p className="text-[11px] text-destructive">{error}</p>}
        <div className="flex flex-col-reverse md:flex-row gap-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onGoHome ?? onDismiss} disabled={submitting}>
            {onGoHome ? 'Sair sem salvar' : 'Agora não'}
          </Button>
          <Button type="submit" className="flex-1 gap-2" disabled={submitting || !email}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar progresso
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
