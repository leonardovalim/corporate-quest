import { useGame } from '@/game/GameContext';
import { getModifier } from '@/game/dice';
import type { AttributeName } from '@/game/types';
import { ATTRIBUTE_NAMES } from '@/game/gameData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Dice6 } from 'lucide-react';

interface ActionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  suggestedAttribute: AttributeName;
  estimatedDC: number;
}

export default function ActionPreviewModal({
  open,
  onClose,
  onConfirm,
  action,
  suggestedAttribute,
  estimatedDC,
}: ActionPreviewModalProps) {
  const { character } = useGame();
  if (!character) return null;

  const attrValue = character.attributes[suggestedAttribute];
  const mod = getModifier(attrValue);
  const attrInfo = ATTRIBUTE_NAMES.find(a => a.key === suggestedAttribute);

  // Estimate success chance
  const needed = estimatedDC - mod;
  const chance = Math.min(100, Math.max(5, Math.round(((21 - Math.max(1, needed)) / 20) * 100)));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm md:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Dice6 className="h-4 w-4" /> Preview da Jogada
          </DialogTitle>
          <DialogDescription className="text-xs">
            Confira o que será rolado antes de confirmar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Action */}
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Sua ação:</p>
            <p className="text-sm font-medium">{action}</p>
          </div>

          {/* Check details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border rounded-md p-3 text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground">Atributo</p>
              <p className="text-lg md:text-xl font-bold">{suggestedAttribute}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{attrInfo?.name}</p>
            </div>
            <div className="bg-card border rounded-md p-3 text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground">Dificuldade</p>
              <p className="text-lg md:text-xl font-bold">DC {estimatedDC}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {estimatedDC <= 8 ? 'Fácil' : estimatedDC <= 12 ? 'Médio' : estimatedDC <= 15 ? 'Difícil' : 'Muito Difícil'}
              </p>
            </div>
          </div>

          {/* Modifier breakdown */}
          <div className="bg-card border rounded-md p-3">
            <div className="flex items-center justify-between text-sm">
              <span>d20 + modificador ({mod >= 0 ? '+' : ''}{mod})</span>
              <span className="text-xs text-muted-foreground">
                {suggestedAttribute} {attrValue} → mod {mod >= 0 ? '+' : ''}{mod}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${chance >= 60 ? 'bg-green-500' : chance >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${chance}%` }}
                />
              </div>
              <span className="text-xs font-mono">{chance}%</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            🎲 Rolar!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
