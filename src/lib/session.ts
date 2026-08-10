import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * O jogo é jogável sem cadastro, mas a edge function do DM exige um usuário
 * autenticado (para não deixar os créditos de LLM abertos ao mundo). A ponte é
 * o anonymous sign-in do Supabase: todo visitante ganha um JWT real, sem
 * nenhuma fricção de login.
 *
 * Requer "Anonymous sign-ins" habilitado em Authentication → Sign In / Providers.
 */

/** Erro específico para o caso de o projeto estar sem anonymous sign-in ligado. */
export class AnonSessionError extends Error {
  constructor(cause: string) {
    super(
      `Não foi possível criar uma sessão de convidado (${cause}). ` +
      `Se você hospeda esta instância, habilite "Anonymous sign-ins" no painel do Supabase.`
    );
    this.name = 'AnonSessionError';
  }
}

/** Um usuário anônimo não é um cadastro — o funil de e-mail continua valendo para ele. */
export function isRealUser(user: User | null | undefined): boolean {
  return !!user && !user.is_anonymous;
}

/**
 * Sessão de um usuário DE VERDADE (cadastrado), ou null.
 *
 * Use esta em vez de supabase.auth.getSession() sempre que a pergunta for
 * "o jogador já se cadastrou?". Depois do anonymous sign-in todo visitante tem
 * sessão, então getSession() sozinho responde "sim" para todo mundo e derruba
 * os CTAs de salvar progresso.
 */
export async function getRealSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return isRealUser(session?.user) ? session : null;
}

// Chamadas simultâneas (init do encontro + autosave, por exemplo) devem compartilhar
// o mesmo sign-in, senão viram várias contas anônimas para o mesmo visitante.
let inFlight: Promise<Session> | null = null;

/**
 * Devolve a sessão atual, criando uma anônima se ainda não houver nenhuma.
 * @throws {AnonSessionError} se não houver sessão e o sign-in anônimo falhar.
 */
export async function ensureSession(): Promise<Session> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;

  if (!inFlight) {
    inFlight = (async () => {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.session) {
        throw new AnonSessionError(error?.message ?? 'sessão vazia');
      }
      return data.session;
    })().finally(() => { inFlight = null; });
  }

  return inFlight;
}
