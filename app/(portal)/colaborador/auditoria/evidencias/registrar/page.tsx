"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type EvidenciaCategoria =
  | "LGPD"
  | "PLDFT"
  | "CONTROLES_INTERNOS"
  | "TREINAMENTOS"
  | "GOVERNANCA"
  | "OUTROS";

type EvidenciaTipo =
  | "CIENCIA_TERMO"
  | "CONCLUSAO_TREINAMENTO"
  | "LEITURA_DOCUMENTO"
  | "CHECKLIST_CONTROLE"
  | "REGISTRO_AUDITORIA"
  | "OUTRO";

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export default function RegistrarEvidenciaPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [sessionNome, setSessionNome] = useState<string>("");

  // formulário
  const [cpf, setCpf] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [empresa, setEmpresa] = useState("");

  const [categoria, setCategoria] = useState<EvidenciaCategoria>("LGPD");
  const [tipo, setTipo] = useState<EvidenciaTipo>("REGISTRO_AUDITORIA");
  const [nivel, setNivel] = useState<"BAIXO" | "MEDIO" | "ALTO">("MEDIO");

  const [controleId, setControleId] = useState("");
  const [referencia, setReferencia] = useState("");
  const [tags, setTags] = useState("");
  const [observacao, setObservacao] = useState("");

  const [contemDadosSensiveis, setContemDadosSensiveis] = useState(false);
  const [retencaoAteISO, setRetencaoAteISO] = useState(""); // input date

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const s: any = getSession();
    if (!s?.cpf) {
      router.replace("/colaborador/login");
      return;
    }
    if (!isAdmin(s)) {
      router.replace("/colaborador");
      return;
    }
    setSessionNome(s.nome || "");
    setReady(true);
  }, [router]);

  const cpfLimpo = useMemo(() => onlyDigits(cpf), [cpf]);

  const retencaoIsoFinal = useMemo(() => {
    if (!retencaoAteISO) return null;
    // converte "YYYY-MM-DD" para ISO fim do dia (local) - bom para auditoria/retencao
    try {
      const d = new Date(`${retencaoAteISO}T23:59:59`);
      return d.toISOString();
    } catch {
      return null;
    }
  }, [retencaoAteISO]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSavedId(null);

    const cpf11 = cpfLimpo;
    if (cpf11.length !== 11) {
      setErro("CPF inválido. Informe 11 dígitos.");
      return;
    }
    if (!colaborador.trim()) {
      setErro("Informe o nome do colaborador.");
      return;
    }

    setSaving(true);
    try {
      const id = `${cpf11}_${Date.now()}`;

      const payload = {
        id,
        cpf: cpf11,
        colaborador: colaborador.trim(),
        empresa: empresa.trim() || null,
        emitidoEmISO: new Date().toISOString(),
        emitidoPor: sessionNome || "ADMIN",
        concluidos: 0,
        total: 0,
        itens: [],

        // novos campos (opcionais)
        categoria,
        tipo,
        nivel,
        meta: {
          controleId: controleId.trim() || null,
          referencia: referencia.trim() || null,
          observacao: observacao.trim() || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          origem: "Portal do Colaborador",
        },
        retencaoAteISO: retencaoIsoFinal,
        contemDadosSensiveis,
      };

      const res = await fetch("/api/evidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json?.ok) {
        throw new Error(json?.error || "Não foi possível registrar a evidência.");
      }

      setSavedId(id);
      // opcional: já filtra a lista por CPF para conferência
      // (não redireciono automaticamente pra você conseguir ver a confirmação)
    } catch (err: any) {
      setErro(err?.message || "Erro ao registrar evidência.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        <div className="regHead">
          <div className="section-title" style={{ marginTop: 0 }}>
            <h2>
              Registrar Evidência <span style={{ opacity: 0.65 }}>(Admin)</span>
            </h2>
            <div className="bar" />
          </div>
          <p className="section-text" style={{ maxWidth: 920 }}>
            Registre uma evidência administrativa com estrutura mínima para auditoria interna (LGPD/PLDFT e controles
            internos). Mantenha o conteúdo objetivo, verificável e estritamente necessário.
          </p>
        </div>

        <div className="card regCard">
          <div className="regTop">
            <div className="regTopLine">
              Sessão: <strong>{sessionNome || "—"}</strong>
            </div>
            <div className="regTopHint">Uso interno • Acesso restrito • Registro auditável</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="regGrid">
              <div className="field">
                <label>CPF do colaborador (11 dígitos)</label>
                <input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Somente números"
                  inputMode="numeric"
                />
                <div className="hint">
                  Para auditoria, o CPF é o identificador do colaborador no registro. Evite inserir informações extras.
                </div>
              </div>

              <div className="field">
                <label>Nome do colaborador</label>
                <input
                  value={colaborador}
                  onChange={(e) => setColaborador(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div className="field">
                <label>Empresa (opcional)</label>
                <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ex: Melo & Estrela" />
              </div>

              <div className="field">
                <label>Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value as EvidenciaCategoria)}>
                  <option value="LGPD">LGPD</option>
                  <option value="PLDFT">PLDFT</option>
                  <option value="CONTROLES_INTERNOS">Controles Internos</option>
                  <option value="TREINAMENTOS">Treinamentos</option>
                  <option value="GOVERNANCA">Governança</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div className="field">
                <label>Tipo de evidência</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as EvidenciaTipo)}>
                  <option value="REGISTRO_AUDITORIA">Registro de auditoria</option>
                  <option value="CIENCIA_TERMO">Ciência de termo</option>
                  <option value="LEITURA_DOCUMENTO">Leitura de documento</option>
                  <option value="CONCLUSAO_TREINAMENTO">Conclusão de treinamento</option>
                  <option value="CHECKLIST_CONTROLE">Checklist de controle</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="field">
                <label>Nível (força da evidência)</label>
                <select value={nivel} onChange={(e) => setNivel(e.target.value as any)}>
                  <option value="BAIXO">Baixo (informativo)</option>
                  <option value="MEDIO">Médio (com referência)</option>
                  <option value="ALTO">Alto (com arquivo/hash, quando aplicável)</option>
                </select>
              </div>

              <div className="field">
                <label>Controle / Obrigação (opcional)</label>
                <input
                  value={controleId}
                  onChange={(e) => setControleId(e.target.value)}
                  placeholder="Ex: LGPD-ACESSOS-001"
                />
                <div className="hint">Se existir um controle interno, informe o identificador para rastreabilidade.</div>
              </div>

              <div className="field">
                <label>Referência (opcional)</label>
                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ex: URL, ID do documento, nº chamado, nº ata"
                />
              </div>

              <div className="field">
                <label>Tags (opcional)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: acessos, perfis, termo (separe por vírgula)"
                />
              </div>

              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Observação objetiva (opcional)</label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Descreva de forma objetiva e verificável. Evite dados pessoais desnecessários."
                  rows={4}
                />
                <div className="hint">
                  LGPD: evite dados sensíveis. Registre apenas o necessário para comprovar o ato/controle.
                </div>
              </div>

              <div className="field">
                <label>Retenção até (opcional)</label>
                <input type="date" value={retencaoAteISO} onChange={(e) => setRetencaoAteISO(e.target.value)} />
              </div>

              <div className="field">
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={contemDadosSensiveis}
                    onChange={(e) => setContemDadosSensiveis(e.target.checked)}
                  />
                  Marcar como “contém dado sensível”
                </label>
                <div className="hint">
                  Use apenas se for inevitável. Se marcado, recomenda-se preencher “Referência” ou “Controle”.
                </div>
              </div>
            </div>

            {erro && <div className="regAlert err">❌ {erro}</div>}

            {savedId && (
              <div className="regAlert ok">
                ✅ Evidência registrada com sucesso. ID: <strong>{savedId}</strong>
                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="btn btn-outline" href={`/colaborador/auditoria/evidencias?cpf=${encodeURIComponent(cpfLimpo)}`}>
                    Ver na lista (filtrar por CPF)
                  </Link>
                  <Link className="btn btn-outline" href="/colaborador/auditoria">
                    Voltar para Auditoria
                  </Link>
                </div>
              </div>
            )}

            <div className="regActions">
              <button className="btn btn-yellow" type="submit" disabled={saving}>
                {saving ? "Registrando…" : "Registrar evidência"}
              </button>

              <Link className="btn btn-outline" href="/colaborador/auditoria/evidencias">
                ← Voltar para Evidências
              </Link>

              <Link className="btn btn-outline" href="/colaborador/auditoria">
                ← Voltar para Auditoria
              </Link>
            </div>
          </form>
        </div>

        <style jsx global>{`
          .regCard {
            padding: 16px !important;
            border-radius: 18px !important;
          }

          .regTop {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 12px;
          }

          .regTopLine {
            font-size: 12px;
            font-weight: 800;
            opacity: 0.85;
          }

          .regTopHint {
            font-size: 12px;
            font-weight: 800;
            opacity: 0.7;
          }

          .regGrid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          @media (max-width: 900px) {
            .regGrid {
              grid-template-columns: 1fr;
            }
          }

          .field label {
            display: block;
            font-size: 12px;
            font-weight: 900;
            margin-bottom: 6px;
            color: rgba(0, 0, 0, 0.75);
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #fff;
            padding: 10px 12px;
            outline: none;
            font-size: 13px;
          }

          .field textarea {
            resize: vertical;
          }

          .hint {
            margin-top: 6px;
            font-size: 12px;
            font-weight: 700;
            opacity: 0.7;
            line-height: 1.35;
          }

          .regActions {
            margin-top: 14px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
          }

          .regAlert {
            margin-top: 12px;
            border-radius: 14px;
            padding: 12px;
            font-size: 13px;
            font-weight: 800;
            border: 1px solid rgba(10, 42, 106, 0.12);
            background: #fff;
          }

          .regAlert.ok {
            border-color: rgba(20, 180, 90, 0.22);
            background: rgba(20, 180, 90, 0.08);
          }

          .regAlert.err {
            border-color: rgba(210, 30, 30, 0.25);
            background: rgba(210, 30, 30, 0.06);
          }
        `}</style>
      </div>
    </main>
  );
}
