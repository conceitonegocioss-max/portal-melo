import { getSession } from "./auth";

type RegistroTreinamento = {
  status: "concluido";
  dataISO: string; // data/hora
};

type Progresso = Record<string, RegistroTreinamento>;

function getKey() {
  const session = getSession();
  const cpf = session?.cpf || "anon";
  return `portal_treinamentos_progress_v1_${cpf}`;
}

export function getProgresso(): Progresso {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(getKey());
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Progresso;
  } catch {
    return {};
  }
}

export function isConcluido(treinamentoId: string): boolean {
  const prog = getProgresso();
  return Boolean(prog[treinamentoId]);
}

export function marcarConcluido(treinamentoId: string) {
  const prog = getProgresso();
  prog[treinamentoId] = {
    status: "concluido",
    dataISO: new Date().toISOString(),
  };
  localStorage.setItem(getKey(), JSON.stringify(prog));
}

export function desmarcarConcluido(treinamentoId: string) {
  const prog = getProgresso();
  delete prog[treinamentoId];
  localStorage.setItem(getKey(), JSON.stringify(prog));
}

export function getDataConclusao(treinamentoId: string): string | null {
  const prog = getProgresso();
  return prog[treinamentoId]?.dataISO ?? null;
}
export function getProgressoPorCpf(cpf: string) {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(`portal_treinamentos_progress_v1_${cpf}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
