import { useGame } from '@/game/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export default function ResultScreen() {
  const { character, encounter, setScreen } = useGame();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md md:max-w-lg w-full space-y-6 md:space-y-8 text-center">
        <div className="text-5xl md:text-7xl">🏆</div>
        <h1 className="text-3xl md:text-4xl font-bold">Encounter Completo!</h1>
        <p className="text-muted-foreground md:text-lg">{encounter?.name}</p>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-3 md:space-y-4">
            <p className="font-semibold md:text-lg">{character?.name} ({character?.className})</p>
            {encounter?.rewards && (
              <div className="space-y-1 md:space-y-2 text-sm md:text-base">
                <p>📈 XP ganho: <span className="font-bold text-primary">+{encounter.rewards.xp}</span></p>
                <p>🏛️ Political Capital: <span className="font-bold text-primary">+{encounter.rewards.pc}</span></p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button size="lg" onClick={() => window.location.reload()} className="gap-2 md:text-lg md:px-8 md:py-6">
          <RotateCcw className="h-4 w-4 md:h-5 md:w-5" /> Jogar Novamente
        </Button>
      </motion.div>
    </div>
  );
}
