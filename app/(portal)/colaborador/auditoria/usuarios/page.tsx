"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { getSession, normalizeCpf } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";

type UsuarioRow = {
  id: string;
  nome: string;
  cpf: string;
  empresa: string;
  perfil: string;
  perfilAuditoria: string;
  status: string;
  certificacao: string;
  senha: string;
};

type CertStatus = "VÁLIDA" | "VENCIDA" | "NÃO INFORMADO";

type CertificacoesUsuario = {
  consignado: CertStatus;
  lgpd: CertStatus;
  pldf: CertStatus;
};

function maskCpf(cpf: string) {
  const d = normalizeCpf(cpf);
  if (d.length !== 11) return cpf || "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
}

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

function isJonas(u: { nome: string; cpf: string; id: string }) {
  const nome = String(u.nome || "").toLowerCase();
  const cpf = normalizeCpf(u.cpf || "");
  const id = String(u.id || "").toLowerCase();

  return cpf === "00598282343" || id.includes("antonio-jonas") || nome.includes("antonio jonas");
}

function statusInicialCertificacao(texto: string, tipo: "consignado" | "lgpd" | "pldf"): CertStatus {
  const t = String(texto || "").toUpperCase();

  if (tipo === "consignado" && !t.includes("CONSIGNADO")) return "NÃO INFORMADO";
  if (tipo === "lgpd" && !t.includes("LGPD")) return "NÃO INFORMADO";
  if (tipo === "pldf" && !t.includes("PLDF") && !t.includes("PLD")) return "NÃO INFORMADO";

  if (t.includes("VENCIDA") || t.includes("EXPIRADA")) return "VENCIDA";
  return "VÁLIDA";
}

function classeCert(status: CertStatus) {
  if (status === "VÁLIDA") return "valid";
  if (status === "VENCIDA") return "expired";
  return "unknown";
}

export default function UsuariosPerfisPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionNome, setSessionNome] = useState("");

  const [q, setQ] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("TODAS");
  const [perfilFiltro, setPerfilFiltro] = useState("TODOS");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [certOverrides, setCertOverrides] = useState<Record<string, CertificacoesUsuario>>({});

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;

    const session = getSession();
    setSessionNome(session?.nome || "");
    setReady(true);
  }, [router]);

  const usuariosBase = useMemo<UsuarioRow[]>(() => {
    return COLABORADORES.map((c: any) => ({
      id: String(c.id || normalizeCpf(c.cpf)),
      nome: String(c.nome || ""),
      cpf: normalizeCpf(String(c.cpf || "")),
      empresa: String(c.empresa || "SEM EMPRESA"),
      perfil: String(c.perfil || "COLABORADOR"),
      perfilAuditoria: String(c.perfilAuditoria || c.perfil || "COLABORADOR"),
      status: String(c.status || "ATIVO"),
      certificacao: String(c.certificacao || ""),
      senha: String(c.senha || ""),
    }))
      .filter((u) => !isJonas(u))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, []);

  const usuarios = useMemo<UsuarioRow[]>(() => {
    return usuariosBase.map((u) => ({
      ...u,
      status: statusOverrides[u.id] || u.status,
    }));
  }, [usuariosBase, statusOverrides]);

  function certsDoUsuario(u: UsuarioRow): CertificacoesUsuario {
    return (
      certOverrides[u.id] || {
        consignado: statusInicialCertificacao(u.certificacao, "consignado"),
        lgpd: statusInicialCertificacao(u.certificacao, "lgpd"),
        pldf: statusInicialCertificacao(u.certificacao, "pldf"),
      }
    );
  }

  function alterarCertificacao(id: string, campo: keyof CertificacoesUsuario, valor: CertStatus) {
    const usuario = usuariosBase.find((u) => u.id === id);
    if (!usuario) return;

    setCertOverrides((prev) => ({
      ...prev,
      [id]: {
        ...certsDoUsuario(usuario),
        ...(prev[id] || {}),
        [campo]: valor,
      },
    }));
  }

  const empresas = useMemo(() => {
    return ["TODAS", ...Array.from(new Set(usuarios.map((u) => u.empresa || "SEM EMPRESA"))).sort()];
  }, [usuarios]);

  const perfis = useMemo(() => {
    return ["TODOS", ...Array.from(new Set(usuarios.map((u) => u.perfil || "COLABORADOR"))).sort()];
  }, [usuarios]);

  const statusList = useMemo(() => {
    return ["TODOS", "ATIVO", "INATIVO"];
  }, []);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    return usuarios.filter((u) => {
      const certs = certsDoUsuario(u);

      if (empresaFiltro !== "TODAS" && u.empresa !== empresaFiltro) return false;
      if (perfilFiltro !== "TODOS" && u.perfil !== perfilFiltro) return false;
      if (statusFiltro !== "TODOS" && u.status !== statusFiltro) return false;

      if (!query) return true;

      const hay = [
        u.nome,
        u.cpf,
        maskCpf(u.cpf),
        u.empresa,
        u.perfil,
        u.perfilAuditoria,
        u.status,
        u.certificacao,
        certs.consignado,
        certs.lgpd,
        certs.pldf,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [usuarios, q, empresaFiltro, perfilFiltro, statusFiltro, certOverrides]);

  const resumo = useMemo(() => {
    const ativos = usuarios.filter((u) => u.status === "ATIVO").length;
    const inativos = usuarios.filter((u) => u.status !== "ATIVO").length;
    const admins = usuarios.filter((u) => String(u.perfil).includes("ADMIN")).length;
    const colaboradores = usuarios.length - admins;

    return { total: usuarios.length, ativos, inativos, admins, colaboradores, filtrados: rows.length };
  }, [usuarios, rows.length]);

  function exportarCsv() {
    const header = ["Nome", "CPF", "Empresa", "Perfil portal", "Perfil auditoria", "Status", "Consignado", "LGPD", "PLDF", "Senha inicial"];
    const lines = rows.map((u) => {
      const certs = certsDoUsuario(u);
      return [u.nome, u.cpf, u.empresa, u.perfil, u.perfilAuditoria, u.status, certs.consignado, certs.lgpd, certs.pldf, u.senha]
        .map(csvEscape)
        .join(";");
    });
    const csv = [header.map(csvEscape).join(";"), ...lines].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios-e-perfis-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!ready) {
    return (
      <main className="section gray">
        <div className="container">
          <p>Carregando usuários…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container usuariosPage">
        <div className="topActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">
            ← Voltar para Auditoria
          </Link>
          <Link href="/colaborador" className="btn btn-outline small">
            ← Área do Colaborador
          </Link>
        </div>

        <div className="section-title">
          <h2>Usuários & Perfis</h2>
          <div className="bar" />
        </div>

        <p className="section-text" style={{ maxWidth: 980 }}>
          Controle administrativo visual de usuários, perfis e certificações. Nesta etapa, as alterações de status feitas nos campos abaixo
          são apenas para conferência na tela; o salvamento definitivo será implementado posteriormente.
        </p>

        <div className="sessionBox noPrint">
          Sessão: <strong>{sessionNome || "Administrador"}</strong> • Perfil: <strong>ADMIN</strong>
        </div>

        <div className="summaryGrid">
          <div className="summaryCard">
            <span>Total na base</span>
            <strong>{resumo.total}</strong>
          </div>
          <div className="summaryCard">
            <span>Ativos</span>
            <strong>{resumo.ativos}</strong>
          </div>
          <div className="summaryCard">
            <span>Inativos</span>
            <strong>{resumo.inativos}</strong>
          </div>
          <div className="summaryCard">
            <span>Admins</span>
            <strong>{resumo.admins}</strong>
          </div>
          <div className="summaryCard">
            <span>Filtrados</span>
            <strong>{resumo.filtrados}</strong>
          </div>
        </div>

        <div className="tools noPrint">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, CPF, empresa, perfil ou certificação..."
          />

          <select className="select" value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)}>
            {empresas.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <select className="select" value={perfilFiltro} onChange={(e) => setPerfilFiltro(e.target.value)}>
            {perfis.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select className="select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            {statusList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button className="btn btn-yellow small" type="button" onClick={exportarCsv}>
            Exportar Excel/CSV
          </button>

          <button className="btn btn-outline small" type="button" onClick={() => window.print()}>
            Imprimir / Salvar PDF
          </button>
        </div>

        <div className="auditNote">
          Base atual: arquivo <strong>nomes para site.xlsx</strong>. A coluna Observação foi removida da visualização. O registro de Jonas foi retirado da listagem por solicitação administrativa.
        </div>

        <div className="tableWrap">
          <table className="usersTable">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Empresa</th>
                <th>Perfil Portal</th>
                <th>Perfil Auditoria</th>
                <th>Status</th>
                <th>Consignado</th>
                <th>LGPD</th>
                <th>PLDF</th>
                <th className="noPrint">Senha inicial</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const certs = certsDoUsuario(r);

                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.nome}</strong>
                      <div className="muted">ID: {r.id}</div>
                    </td>
                    <td className="mono">{maskCpf(r.cpf)}</td>
                    <td>{r.empresa}</td>
                    <td>
                      <span className={`pill ${r.perfil.includes("ADMIN") ? "admin" : "colab"}`}>{r.perfil}</span>
                    </td>
                    <td>
                      <span className="perfilAudit">{r.perfilAuditoria}</span>
                    </td>
                    <td>
                      <select
                        className={`statusSelect ${r.status === "ATIVO" ? "ativo" : "inativo"}`}
                        value={r.status}
                        onChange={(e) => setStatusOverrides((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      >
                        <option value="ATIVO">ATIVO</option>
                        <option value="INATIVO">INATIVO</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`certSelect ${classeCert(certs.consignado)}`}
                        value={certs.consignado}
                        onChange={(e) => alterarCertificacao(r.id, "consignado", e.target.value as CertStatus)}
                      >
                        <option value="VÁLIDA">VÁLIDA</option>
                        <option value="VENCIDA">VENCIDA</option>
                        <option value="NÃO INFORMADO">NÃO INFORMADO</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`certSelect ${classeCert(certs.lgpd)}`}
                        value={certs.lgpd}
                        onChange={(e) => alterarCertificacao(r.id, "lgpd", e.target.value as CertStatus)}
                      >
                        <option value="VÁLIDA">VÁLIDA</option>
                        <option value="VENCIDA">VENCIDA</option>
                        <option value="NÃO INFORMADO">NÃO INFORMADO</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`certSelect ${classeCert(certs.pldf)}`}
                        value={certs.pldf}
                        onChange={(e) => alterarCertificacao(r.id, "pldf", e.target.value as CertStatus)}
                      >
                        <option value="VÁLIDA">VÁLIDA</option>
                        <option value="VENCIDA">VENCIDA</option>
                        <option value="NÃO INFORMADO">NÃO INFORMADO</option>
                      </select>
                    </td>
                    <td className="mono noPrint">{r.senha || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? <div className="empty">Nenhum usuário encontrado para os filtros aplicados.</div> : null}

        <div className="bottomActions noPrint">
          <Link href="/colaborador/auditoria" className="btn btn-outline small">
            ← Voltar para Auditoria
          </Link>
        </div>

        <style jsx global>{`
          .usuariosPage {
            max-width: 1280px;
          }
          .topActions,
          .bottomActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 14px;
          }
          .bottomActions {
            margin-top: 16px;
          }
          .sessionBox,
          .auditNote {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.1);
            border-radius: 14px;
            padding: 10px 12px;
            font-size: 12px;
            font-weight: 800;
            color: rgba(0, 0, 0, 0.7);
            margin: 12px 0;
          }
          .auditNote {
            background: #fff9dd;
            border-color: rgba(244, 196, 0, 0.35);
          }
          .summaryGrid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 10px;
            margin: 14px 0;
          }
          .summaryCard {
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.1);
            border-radius: 16px;
            padding: 12px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
          }
          .summaryCard span {
            display: block;
            font-size: 12px;
            opacity: 0.7;
            font-weight: 800;
          }
          .summaryCard strong {
            display: block;
            font-size: 24px;
            color: #0a2a6a;
            margin-top: 3px;
          }
          .tools {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
            margin: 14px 0;
          }
          .input {
            flex: 1;
            min-width: 280px;
            border-radius: 999px;
            border: 1px solid rgba(10, 42, 106, 0.14);
            padding: 10px 12px;
            background: #fff;
            outline: none;
            font-weight: 700;
          }
          .select,
          .statusSelect,
          .certSelect {
            height: 38px;
            border-radius: 999px;
            border: 1px solid rgba(10, 42, 106, 0.14);
            background: #fff;
            padding: 0 10px;
            font-weight: 900;
            color: #0a2a6a;
            outline: none;
          }
          .statusSelect,
          .certSelect {
            width: 100%;
            min-width: 128px;
            font-size: 11px;
          }
          .statusSelect.ativo,
          .certSelect.valid {
            background: #eaf7ef;
            border-color: rgba(27, 122, 58, 0.22);
            color: #0f5132;
          }
          .statusSelect.inativo,
          .certSelect.expired {
            background: #fff1f1;
            border-color: rgba(180, 40, 40, 0.22);
            color: #8a1f1f;
          }
          .certSelect.unknown {
            background: #f7f9ff;
            border-color: rgba(10, 42, 106, 0.12);
            color: rgba(10, 42, 106, 0.72);
          }
          .tableWrap {
            width: 100%;
            overflow: auto;
            background: #fff;
            border: 1px solid rgba(10, 42, 106, 0.08);
            border-radius: 16px;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          }
          .usersTable {
            width: 100%;
            min-width: 1240px;
            border-collapse: collapse;
          }
          .usersTable th,
          .usersTable td {
            padding: 11px 12px;
            border-bottom: 1px solid rgba(10, 42, 106, 0.08);
            text-align: left;
            vertical-align: top;
            font-size: 12px;
            font-weight: 750;
          }
          .usersTable th {
            background: #f5f7fd;
            color: #0a2a6a;
            font-weight: 900;
            position: sticky;
            top: 0;
            z-index: 1;
          }
          .muted {
            margin-top: 3px;
            opacity: 0.55;
            font-size: 11px;
            font-weight: 700;
          }
          .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            color: #0a2a6a;
            font-weight: 900;
          }
          .pill {
            display: inline-flex;
            border-radius: 999px;
            padding: 5px 8px;
            font-size: 11px;
            font-weight: 900;
            border: 1px solid;
            white-space: nowrap;
          }
          .pill.admin {
            background: #e7efff;
            border-color: #cfe0ff;
            color: #0b3b8a;
          }
          .pill.colab {
            background: #f7f9ff;
            border-color: rgba(10, 42, 106, 0.12);
            color: #0a2a6a;
          }
          .perfilAudit {
            display: inline-flex;
            border-radius: 999px;
            padding: 5px 8px;
            font-size: 11px;
            font-weight: 900;
            background: #f7f9ff;
            border: 1px solid rgba(10, 42, 106, 0.12);
            color: #0a2a6a;
            white-space: nowrap;
          }
          .empty {
            margin-top: 12px;
            background: #fff;
            border-radius: 14px;
            padding: 14px;
            font-weight: 800;
            opacity: 0.75;
          }
          @media (max-width: 900px) {
            .summaryGrid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media print {
            .noPrint {
              display: none !important;
            }
            body {
              background: #fff !important;
            }
            .section.gray {
              background: #fff !important;
            }
            .container {
              max-width: 100% !important;
            }
            .tableWrap {
              box-shadow: none !important;
              border: 1px solid #ccd3e0 !important;
              overflow: visible !important;
            }
            .usersTable {
              min-width: 0 !important;
            }
            .usersTable th,
            .usersTable td {
              font-size: 10px !important;
              padding: 7px !important;
            }
            .statusSelect,
            .certSelect {
              border: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-width: 0 !important;
              appearance: none !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
