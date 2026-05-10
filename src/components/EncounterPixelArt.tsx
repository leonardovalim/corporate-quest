import { motion, AnimatePresence } from 'framer-motion';
import { useEncounterPixelArt } from '@/hooks/useEncounterPixelArt';

interface Props {
  encounterName: string;
  phase: number;
  description?: string;
}

export default function EncounterPixelArt({ encounterName, phase, description }: Props) {
  const { imageUrl, loading } = useEncounterPixelArt(encounterName, phase, description);

  const hasScene = Boolean(description);

  return (
    <div
      className="relative w-full overflow-hidden rounded-md border border-border/40 bg-muted/20"
      style={{ height: '160px' }}
    >
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.img
            key={`${encounterName}|${phase}|${description ?? ''}`}
            src={imageUrl}
            alt={`Cena: ${encounterName} — fase ${phase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center px-3 text-center text-[10px] font-mono text-muted-foreground/60"
          >
            {hasScene
              ? (loading ? 'gerando cena...' : 'aguardando cena...')
              : 'a cena aparecerá ao fim da fase'}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
