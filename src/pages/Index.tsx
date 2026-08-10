import { useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/game/GameContext';
import HomeScreen from '@/components/HomeScreen';
import OnboardingWizard from '@/components/OnboardingWizard';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import SupportModal from '@/components/SupportModal';
import ProfileCompleteCard from '@/components/ProfileCompleteCard';
import NextAdventureScreen from '@/components/NextAdventureScreen';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSupportPrompt } from '@/hooks/useSupportPrompt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import { isRealUser } from '@/lib/session';
import { useGameAutosave } from '@/hooks/useGameAutosave';

function GameRouter() {
  const { screen } = useGame();
  switch (screen) {
    case 'home': return <HomeScreen />;
    case 'onboarding': return <OnboardingWizard />;
    case 'game': return <GameScreen />;
    case 'result': return <ResultScreen />;
    case 'adventure': return <NextAdventureScreen />;
  }
}

function SupportPromptHost() {
  const { open, close } = useSupportPrompt();
  return <SupportModal open={open} onClose={close} />;
}

function ProfileCompleteHost() {
  const { user } = useAuthSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem('cq.pendingProfileCompletion') === '1'
        && !sessionStorage.getItem('cq.profilePromptShown')) {
      sessionStorage.setItem('cq.profilePromptShown', '1');
      setShow(true);
    }
  }, [user]);

  if (!show || !user) return null;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Complete seu perfil</DialogTitle>
          <DialogDescription>Adicione suas informações para finalizar o cadastro</DialogDescription>
        </DialogHeader>
        <ProfileCompleteCard userId={user.id} onDismiss={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AutosaveHost() {
  const { user } = useAuthSession();
  useGameAutosave(user?.id ?? null);
  return null;
}

function ProfilePersistor() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // O anonymous sign-in também emite SIGNED_IN — ignorar, senão cada
      // visitante geraria uma linha em profiles e um toast de boas-vindas.
      if (event !== 'SIGNED_IN' || !isRealUser(session?.user)) return;
      const raw = localStorage.getItem('pendingProfile');

      // Defer Supabase call to avoid deadlock
      setTimeout(async () => {
        if (raw) {
          try {
            const data = JSON.parse(raw);
            // Only include fields that were actually collected (email-only Stage 1 skips name/phone/etc.)
            const upsertData: Record<string, any> = {
              id: session.user.id,
              email: data.email,
            };
            if (data.full_name != null) upsertData.full_name = data.full_name;
            if (data.phone != null) upsertData.phone = data.phone;
            if (data.company_name != null) upsertData.company_name = data.company_name;
            if (data.linkedin_url != null) upsertData.linkedin_url = data.linkedin_url;
            if (data.has_product_openings != null) upsertData.has_product_openings = !!data.has_product_openings;
            if (data.rating != null) upsertData.rating = data.rating;
            if (data.feedback != null) upsertData.feedback = data.feedback;
            const { error } = await supabase.from('profiles').upsert([upsertData] as never);
            if (error) throw error;
            if (data.character_snapshot?.character) {
              const char = data.character_snapshot.character;
              const { error: saveError } = await supabase.from('game_saves').insert({
                user_id: session.user.id,
                name: `${char.name} · Lv ${char.level}`,
                character_name: char.name,
                class_name: char.className,
                level: char.level,
                snapshot: data.character_snapshot,
              });
              if (saveError) throw saveError;
            }
            localStorage.removeItem('pendingProfile');
            toast({
              title: 'Progresso salvo! 🎉',
              description: 'Seu perfil corporativo está oficialmente arquivado no RH digital.',
            });
          } catch (e: any) {
            toast({
              title: 'Falhou ao salvar progresso',
              description: e?.message ?? 'Tente novamente mais tarde.',
              variant: 'destructive',
            });
          }
          return;
        }

        // Returning login (no pendingProfile): show welcome-back toast only once per user
        const welcomeKey = `cq.welcomeBack.${session.user.id}`;
        if (localStorage.getItem(welcomeKey)) return; // already shown
        try {
          const { data } = await supabase
            .from('game_saves')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);
          if ((data?.length ?? 0) > 0) {
            localStorage.setItem(welcomeKey, '1');
            toast({
              title: 'Bem-vindo de volta 👔',
              description: 'Sua carreira foi recuperada do arquivo morto do RH. Clique em CONTINUAR pra retomar.',
            });
          }
        } catch {
          /* silent */
        }
      }, 0);
    });

    supabase.auth.getSession();

    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}

export default function Index() {
  return (
    <GameProvider>
      <ProfilePersistor />
      <AutosaveHost />
      <ProfileCompleteHost />
      <GameRouter />
      <SupportPromptHost />
    </GameProvider>
  );
}
