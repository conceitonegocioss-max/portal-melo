"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "../../../../../src/lib/auth";
import { COLABORADORES } from "../../../../../src/data/colaboradores";
import { getProgressoPorCpf } from "../../../../../src/lib/treinamentosProgress";

const TREINAMENTOS: Array<{ id: string; titulo: string }> = [
  { id: "atendimento-ao-cliente", titulo: "Atendimento ao Cliente" },
  { id: "codigo-de-etica-e-conduta", titulo: "Código de Ética e Conduta" },
  { id: "resumo-contratual", titulo: "Resumo Contratual" },
  { id: "credito-responsavel", titulo: "Crédito Responsável" },
  { id: "resolucao-autorregulacao", titulo: "Resolução e Autorregulação" },
  { id: "prevencao-a-fraude", titulo: "Prevenção à Fraude" },
  { id: "publico-vulneravel", titulo: "Público Vulnerável" },
  { id: "lgpd", titulo: "LGPD – Lei Geral de Proteção de Dados" },
  { id: "pld-ft", titulo: "PLDFT – Prevenção à Lavagem de Dinheiro" },
  { id: "seguranca-da-informacao", titulo: "Segurança da Informação" },
  { id: "produtos-modalidades-credito", titulo: "Produtos e Modalidades de Crédito" },
  { id: "basico-consorcio", titulo: "Básico de Consórcio" },
  { id: "ourocap", titulo: "Ourocap" },
  { id: "abertura-de-contas", titulo: "Abertura de Contas" },
  { id: "seguridade", titulo: "Seguridade" },
  { id: "lista-de-mailing", titulo: "Lista de Mailing" },
];

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function mascararCpf(cpfDigits: string) {
  const d = onlyDigits(cpfDigits);
  if (d.length !== 11) return cpfDigits;
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function formatarData(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

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
};

export default function DetalheColaboradorPage() {
  const router = useRouter();
  const params = useParams();

  const cpfParam = String(params?.cpf || "");
  const cpf = useMemo(() => onlyDigits(cpfParam), [cpfParam]);

  const [nomeAdmin, setNomeAdmin] = useState("");
  const [mounted, setMounted] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session) {
      router.replace("/colaborador/login");
      return;
    }
    if (session.perfil !== "ADMIN") {
      router.replace("/colaborador/treinamentos");
      return;
    }
    setNomeAdmin(session.nome || "");
  }, [router]);

  const colaborador = useMemo(() => {
    if (!cpf) return null;
    return COLABORADORES.find((c) => onlyDigits(c.cpf) === cpf) || null;
  }, [cpf]);

  const progresso = useMemo(() => {
    if (!mounted || !cpf) return {};
    return getProgressoPorCpf(cpf) as Record<string, { status: string; dataISO: string }>;
  }, [cpf, mounted]);

  const total = TREINAMENTOS.length;
  const concluidos = Object.keys(progresso || {}).length;
  const porcentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  const emitidoEm = useMemo(() => new Date().toLocaleString("pt-BR"), []);
  const emitidoEmISO = useMemo(() => new Date().toISOString(), []);

  async function gerarEvidencia() {
    if (!colaborador) return;

    try {
      setSalvando(true);

      const itens: EvidenciaItem[] = TREINAMENTOS.map((t) => {
        const item = (progresso as any)?.[t.id];
        const ok = Boolean(item);
        return {
          treinamentoId: t.id,
          status: ok ? "concluido" : "pendente",
          dataISO: ok ? item?.dataISO : null,
        };
      });

      // id único: cpf + data (para permitir gerar várias evidências)
      const id = `${cpf}_${new Date().toISOString()}`;

      const payload: Evidencia = {
        id,
        cpf,
        colaborador: colaborador.nome,
        empresa: colaborador.empresa || null,
        emitidoEmISO,
        emitidoPor: nomeAdmin || "ADMIN",
        concluidos,
        total,
        itens,
      };

      const res = await fetch("/api/evidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Falha ao salvar evidência.");
      }

      alert("✅ Evidência salva com sucesso!");

      // ✅ Melhor UX: já levar direto pra Central filtrada desse CPF
      router.push(`/colaborador/auditoria/evidencias?cpf=${encodeURIComponent(cpf)}`);

      // Se você NÃO quiser redirecionar automaticamente, comente a linha acima
      // e deixe só o botão "Ver evidências deste CPF" (abaixo).
    } catch (e: any) {
      alert(`❌ Não foi possível salvar a evidência.\n\n${e?.message || e}`);
    } finally {
      setSalvando(false);
    }
  }

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando…</p>
        </div>
      </main>
    );
  }

  if (!cpf) {
    return (
      <main className="section gray">
        <div className="container">
          <p>CPF inválido na URL.</p>
          <button className="btn btn-outline" onClick={() => router.back()}>
            Voltar
          </button>
        </div>
      </main>
    );
  }

  if (!colaborador) {
    return (
      <main className="section gray">
        <div className="container">
          <div className="card" style={{ padding: 16 }}>
            <p>
              <strong>CPF:</strong> {mascararCpf(cpf)}
            </p>
            <p>Colaborador não encontrado na base.</p>
            <button className="btn btn-outline" onClick={() => router.back()}>
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        {/* ÁREA QUE VAI PARA O PDF */}
        <div className="evidenciaPrint card" style={{ padding: 16 }}>
          {/* CABEÇALHO PDF */}
          <div
            className="printHeader"
            style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img src="/logo.png" alt="MaisBB" style={{ width: 46, height: "auto" }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>Correspondente Autorizado MaisBB</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Evidência Individual de Treinamentos</div>
              </div>
            </div>

            <div style={{ fontSize: 12, textAlign: "right" }}>
              <div>
                <strong>Emitido em:</strong> {emitidoEm}
              </div>
              <div>
                <strong>Emitido por:</strong> {nomeAdmin || "ADMIN"}
              </div>
            </div>
          </div>

          <hr style={{ margin: "14px 0", border: 0, borderTop: "1px solid #e6e8ee" }} />

          {/* DADOS */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0 }}>
                <strong>Colaborador:</strong> {colaborador.nome}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Empresa:</strong> {colaborador.empresa || "-"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>CPF:</strong> {mascararCpf(cpf)}
              </p>
            </div>

            <div style={{ minWidth: 280 }}>
              <p style={{ margin: 0 }}>
                <strong>Progresso:</strong> {concluidos}/{total} ({porcentagem}%)
              </p>

              <div style={{ marginTop: 8, background: "#e9edf5", borderRadius: 999, overflow: "hidden", height: 10 }}>
                <div style={{ width: `${porcentagem}%`, height: 10, background: "#0b3b8a" }} />
              </div>

              <small style={{ display: "block", marginTop: 6, opacity: 0.8 }}>
                Base: registro local por CPF (navegador).
              </small>
            </div>
          </div>

          {/* TABELA */}
          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e8ee" }}>Treinamento</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e8ee" }}>Status</th>
                  <th style={{ padding: "10px 8px", borderBottom: "1px solid #e6e8ee" }}>Data</th>
                </tr>
              </thead>

              <tbody>
                {TREINAMENTOS.map((t) => {
                  const item = (progresso as any)?.[t.id];
                  const ok = Boolean(item);

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f0f2f7" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 700 }}>{t.titulo}</td>
                      <td style={{ padding: "10px 8px" }}>
                        {ok ? (
                          <span style={{ fontWeight: 800, color: "#0f5132" }}>Concluído</span>
                        ) : (
                          <span style={{ fontWeight: 800, color: "#8a6d00" }}>Pendente</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 8px" }}>{ok ? formatarData(item?.dataISO) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="printFooter" style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            Documento gerado automaticamente pelo Portal MaisBB para fins de evidência de capacitação e conformidade.
          </div>
        </div>

        {/* BOTÕES (não vão para o PDF) */}
        <div className="noPrint" style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => window.print()}>
            🖨️ Imprimir / Salvar PDF
          </button>

          <button
            className="btn btn-yellow"
            onClick={gerarEvidencia}
            disabled={salvando}
            style={{ opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? "Salvando..." : "💾 Gerar evidência"}
          </button>

          {/* ✅ BOTÃO NOVO: VER EVIDÊNCIAS DESSE CPF */}
          <Link
            href={`/colaborador/auditoria/evidencias?cpf=${encodeURIComponent(cpf)}`}
            className="btn btn-outline"
            style={{ padding: "6px 12px", borderRadius: 999 }}
          >
            📁 Ver evidências deste CPF
          </Link>

          <button className="btn btn-outline" onClick={() => router.back()}>
            Voltar
          </button>
        </div>
      </div>

      {/* ESTILO DE IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          /* esconde navegação e botões */
          header,
          footer,
          nav,
          .noPrint {
            display: none !important;
          }

          /* só imprime a evidência */
          body {
            background: white !important;
          }
          .section.gray {
            background: white !important;
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .evidenciaPrint {
            box-shadow: none !important;
            border: none !important;
          }

          /* melhora layout em PDF */
          .printHeader {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </main>
  );
}
