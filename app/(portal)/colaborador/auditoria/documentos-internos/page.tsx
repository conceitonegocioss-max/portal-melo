"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type DocItem = {
  title: string;
  version: string;
  description?: string;
  href: string;
  tag?: string;
};

export default function DocumentosInternosPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const s = getSession();
    if (!s?.cpf) {
      router.replace("/colaborador/login");
      return;
    }
    if (!isAdmin(s)) {
      router.replace("/colaborador");
      return;
    }
  }, [router]);

  const emitidoEm = useMemo(() => new Date().toLocaleString("pt-BR"), []);

  const docs: DocItem[] = useMemo(
    () => [
      {
        title:
          "Governança de Acessos e Perfis Administrativos — Portal do Colaborador",
        version: "v1.0",
        tag: "Governança / Auditoria",
        description:
          "Estabelece perfis administrativos, hierarquia funcional e segregação de responsabilidades, com referência a requisitos de auditoria interna, compliance, LGPD e PLDFT.",
        // ✅ arquivo deve estar em /public/documentos-internos/
        href: "/documentos-internos/Governanca_Acessos_e_Perfis_Administrativos_Portal_do_Colaborador_v1_0.pdf",
      },
      // Você pode adicionar outros PDFs aqui depois
      // { title: "...", version: "v1.0", href: "/documentos-internos/arquivo.pdf" },
    ],
    []
  );

  if (!mounted) {
    return (
      <main className="section gray">
        <div className="container">
          <div className="section-title">
            <h2>Documentos Internos</h2>
            <div className="bar" />
          </div>
          <p className="section-text">Carregando…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section gray">
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                📄 Documentos Internos (Admin)
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Uso interno • Somente leitura • Base formal para auditoria
                interna, compliance, LGPD/PLDFT e controles internos
              </div>
            </div>

            <div style={{ fontSize: 12, textAlign: "right", opacity: 0.9 }}>
              <div>
                <strong>Gerado em:</strong> {emitidoEm}
              </div>
            </div>
          </div>

          <hr
            style={{
              margin: "14px 0",
              border: 0,
              borderTop: "1px solid #e6e8ee",
            }}
          />

          {/* AÇÕES */}
          <div
            className="noPrint"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-outline" href="/colaborador/auditoria">
                ← Voltar para Auditoria
              </Link>
              <Link className="btn btn-outline" href="/colaborador">
                ← Voltar para Área do Colaborador
              </Link>
            </div>

            <button className="btn btn-outline" onClick={() => window.print()}>
              🖨️ Imprimir / Salvar como PDF (lista)
            </button>
          </div>

          {/* LISTA */}
          <div style={{ display: "grid", gap: 12 }}>
            {docs.length === 0 ? (
              <div style={{ opacity: 0.8, fontSize: 13 }}>
                Nenhum documento vigente foi publicado até o momento.
              </div>
            ) : (
              docs.map((d) => (
                <div
                  key={d.href}
                  style={{
                    border: "1px solid #e6e8ee",
                    borderRadius: 14,
                    padding: 14,
                    background: "#fff",
                    display: "flex",
                    gap: 12,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 280 }}>
                    <div style={{ fontWeight: 900, fontSize: 14 }}>{d.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                      Versão: <strong>{d.version}</strong>
                      {d.tag ? (
                        <>
                          {" "}
                          • <span style={{ fontWeight: 700 }}>{d.tag}</span>
                        </>
                      ) : null}
                    </div>
                    {d.description ? (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          opacity: 0.9,
                          maxWidth: 760,
                        }}
                      >
                        {d.description}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      className="btn btn-yellow"
                      href={d.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir PDF
                    </a>
                    <a className="btn btn-outline" href={d.href} download>
                      Baixar arquivo
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75 }}>
            Nota de auditoria: os documentos publicados nesta seção constituem
            “fonte formal” de governança e referência para verificação de
            conformidade. Atualizações devem seguir controle de versão e
            aprovação interna.
          </div>
        </div>
      </div>

      {/* ESTILO DE IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          header,
          footer,
          nav,
          .noPrint {
            display: none !important;
          }
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
          .card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </main>
  );
}
