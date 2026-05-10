import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const phoneRegex = /^[\d\s()+\-.]{8,32}$/;

const schema = z.object({
  full_name: z.string().trim().min(2, 'Informe seu nome').max(255),
  phone: z.string().trim().regex(phoneRegex, 'Telefone inválido').max(32),
  company_name: z.string().trim().min(1, 'Informe a empresa').max(255),
  linkedin_url: z
    .string().trim().max(500).url('URL inválida')
    .optional().or(z.literal('').transform(() => undefined)),
  has_product_openings: z.boolean().default(false),
  rating: z
    .union([z.string(), z.number()]).optional()
    .transform(v => (v === '' || v === undefined ? undefined : Number(v)))
    .refine(v => v === undefined || (v >= 1 && v <= 10), 'Nota entre 1 e 10'),
  feedback: z.string().trim().max(1000).optional().or(z.literal('').transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  userId: string;
  onDismiss: () => void;
}

export default function ProfileCompleteCard({ userId, onDismiss }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { has_product_openings: false },
  });
  const hasOpenings = watch('has_product_openings');

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const email = userRes.user?.email ?? null;
      if (!email) throw new Error('Não foi possível detectar seu email. Faça login novamente.');

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        full_name: values.full_name.trim(),
        phone: values.phone.trim(),
        company_name: values.company_name.trim(),
        linkedin_url: values.linkedin_url || null,
        has_product_openings: !!values.has_product_openings,
        rating: values.rating ?? null,
        feedback: values.feedback || null,
      });
      if (error) throw error;
      localStorage.removeItem('cq.pendingProfileCompletion');
      toast({ title: 'Perfil completo! 🎉', description: 'Seus dados foram arquivados no RH digital.' });
      onDismiss();
    } catch (e: any) {
      const description =
        e?.code === '23502'
          ? 'Campos obrigatórios ausentes. Confira e tente novamente.'
          : (e?.message ?? 'Tente novamente.');
      toast({ title: 'Erro ao salvar', description, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-primary/20 rounded-lg p-4 md:p-6 space-y-4"
    >
      <div className="space-y-1 text-center">
        <h3 className="text-xs md:text-sm font-pixel text-primary">👔 Complete seu perfil corporativo</h3>
        <p className="text-xs md:text-sm text-muted-foreground italic">
          Seu progresso está salvo! Para finalizar o cadastro, precisamos de mais alguns dados.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Nome completo *</Label>
          <Input {...register('full_name')} placeholder="Maria da Silva" />
          {errors.full_name && <p className="text-[11px] text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Telefone *</Label>
            <Input {...register('phone')} placeholder="(11) 99999-9999" />
            {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Empresa *</Label>
            <Input {...register('company_name')} placeholder="Iniciativa Sinergia Disruptiva S.A." />
            {errors.company_name && <p className="text-[11px] text-destructive">{errors.company_name.message}</p>}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border/60 p-3 bg-muted/20">
          <Checkbox
            id="has_product_openings"
            checked={hasOpenings}
            onCheckedChange={v => setValue('has_product_openings', v === true, { shouldValidate: false })}
          />
          <Label htmlFor="has_product_openings" className="text-xs leading-snug cursor-pointer">
            ✅ Minha empresa tem vagas de <strong>Produto</strong> e quero conversar com os criadores dessa plataforma.
          </Label>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">LinkedIn (opcional)</Label>
          <Input {...register('linkedin_url')} placeholder="https://linkedin.com/in/seu-perfil" />
          {errors.linkedin_url && <p className="text-[11px] text-destructive">{errors.linkedin_url.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nota 1-10 (opcional)</Label>
            <Input type="number" min={1} max={10} {...register('rating')} placeholder="8" />
            {errors.rating && <p className="text-[11px] text-destructive">{errors.rating.message as string}</p>}
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs">Feedback (opcional)</Label>
            <Textarea rows={2} {...register('feedback')} placeholder="O que melhorar, bug, sugestão..." />
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-2 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onDismiss} disabled={submitting}>
            Agora não
          </Button>
          <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Completar perfil
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
