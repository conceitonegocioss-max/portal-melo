"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type EvidenciaItem = {
  treinamentoId: string;
  status: "concluido" | "pendente";
  dataISO?: string | null;
};

type Evidencia = {
  id: string;
  cpf: string;
  colaborador: string;
  empresa?: string | null;
  emitidoEmISO: string;
  emitidoPor?: string | null;
  concluidos: number;
  total: number;
  itens: EvidenciaItem[];

  // opcionais (se já existirem)
  categoria?: string;
  tipo?: string;
  nivel?: "BAIXO" | "MEDIO" | "ALTO";
  meta?: any;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function mascararCpf(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function fmt(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return String(iso);
  }
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function normalizeIdForCompare(s: string) {
  // remove espaços e tenta “desencodar”
  const a = (s || "").trim();
  const b = safeDecode(a).trim();

  // também tenta tirar sequências estranhas se existirem
  // (não mexe no conteúdo real, só para comparar)
  const c = b.replace(/\s+/g, " ");
  return { raw: a, decoded: b, cleaned: c };
}

export default function EvidenciaDetalhePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idParam = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ev, setEv] = useState<Evidencia | null>(null);

  useEffect(() => {
    (async () => {
      const s: any = getSession();
      if (!s?.cpf) {
        router.replace("/colaborador/login");
        return;
      }
      if (!isAdmin(s)) {
        router.replace("/colaborador");
        return;
      }

      try {
        setLoading(true);
        setErro(null);

        const res = await fetch("/api/evidencias", { cache: "no-store" });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || "Não foi possível carregar o registro de evidências.");

        const items = (json.items || []) as Evidencia[];

        const pid = normalizeIdForCompare(idParam);

        // ✅ busca tolerante
        const found =
          items.find((x) => String(x.id) === pid.raw) ||
          items.find((x) => safeDecode(String(x.id)) === pid.decoded) ||
          items.find((x) => normalizeIdForCompare(String(x.id)).cleaned === pid.cleaned);

        if (!found) {
          setErro(
            "Registro não localizado. Motivos comuns: link inválido, evidência removida/atualizada ou erro ao gerar o ID. Volte ao Mapa de Evidências e tente abrir novamente."
          );
          setEv(null);
        } else {
          setEv(found);
        }
      } catch (e: any) {
        setErro(e?.message || "Falha ao carregar o registro.");
      } finally {
        setLoading(false);
      }
    })();
  }, [idParam, router]);

  const progresso = useMemo(() => {
    if (!ev) return "—";
    return `${ev.concluidos}/${ev.total}`;
  }, [ev]);

  const progressoPct = useMemo(() => {
    if (!ev || !ev.total) return 0;
    const pct = Math.round((ev.concluidos / ev.total) * 100);
    return Number.isFinite(pct) ? pct : 0;
  }, [ev]);

  return (
    <main className="section gray">
      <div className="container">
        <div className="card" style={{ padding: 16, borderRadius: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "baseline",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>📌 Evidência — Detalhamento do Registro</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Documento interno • Auditoria/Compliance • Controles e rastreabilidade
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-outline" href="/colaborador/auditoria/evidencias">
                ← Voltar ao Mapa
              </Link>
              <Link className="btn btn-outline" href="/colaborador/auditoria">
                Central de Auditoria
              </Link>
            </div>
          </div>

          <hr style={{ margin: "14px 0", border: 0, borderTop: "1px solid #e6e8ee" }} />

          {loading && <p style={{ opacity: 0.8 }}>Carregando registro…</p>}

          {!loading && erro && (
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(210,30,30,0.25)",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 900 }}>Não foi possível exibir esta evidência</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{erro}</div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                <strong>ID informado na URL:</strong> {safeDecode(idParam)}
              </div>
            </div>
          )}

          {!loading && !erro && ev && (
            <div style={{ display: "grid", gap: 12 }}>
              {/* Bloco: Identificação */}
              <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                <div style={{ fontWeight: 900, marginBottom: 2 }}>Identificação do registro</div>

                <div>
                  <strong>ID do registro:</strong> {ev.id}
                </div>
                <div>
                  <strong>Colaborador:</strong> {ev.colaborador}
                </div>
                <div>
                  <strong>Empresa:</strong> {ev.empresa || "—"}
                </div>
                <div>
                  <strong>CPF (mascarado):</strong> {mascararCpf(ev.cpf)}
                </div>
                <div>
                  <strong>Data de emissão:</strong> {fmt(ev.emitidoEmISO)}
                </div>
                <div>
                  <strong>Emitido por:</strong> {ev.emitidoPor || "ADMIN"}
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Conformidade (progresso):</strong> {progresso}{" "}
                  <span style={{ opacity: 0.75 }}>({progressoPct}%)</span>
                </div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  Observação: este registro consolida evidências de treinamento/itens vinculados ao colaborador para fins
                  de verificação interna.
                </div>
              </div>

              {/* Bloco: Itens */}
              <div style={{ borderTop: "1px dashed rgba(10,42,106,0.18)", paddingTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Itens de evidência</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                  A lista abaixo indica o status de cada item associado ao registro (concluído/pendente) e a respectiva
                  data, quando disponível.
                </div>

                {ev.itens?.length ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
                      <thead>
                        <tr>
                          {["Item / Treinamento", "Situação", "Data do registro"].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "10px 8px",
                                borderBottom: "1px solid rgba(0,0,0,0.10)",
                                background: "rgba(247,249,255,0.7)",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ev.itens.map((it, idx) => (
                          <tr key={`${it.treinamentoId}-${idx}`}>
                            <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                              {it.treinamentoId}
                            </td>
                            <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                              {it.status === "concluido" ? "✅ Concluído" : "⏳ Pendente"}
                            </td>
                            <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                              {fmt(it.dataISO || null)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Nenhum item vinculado a esta evidência no momento.
                  </div>
                )}
              </div>

              {/* Rodapé: Nota LGPD */}
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Nota de proteção de dados: utilize este registro apenas para finalidade interna de auditoria e controle.
                Evite inserir dados pessoais sensíveis além do necessário.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
