"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isAdmin } from "@/src/lib/rbac";

type DocumentoInterno = {
  titulo: string;
  descricao: string;
  arquivo: string;
  versao: string;
  data: string;
};

export default function DocumentosInternosPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const session = getSession();
    if (!session?.cpf) {
      router.replace("/colaborador/login");
      return;
    }

    if (!isAdmin(session)) {
      router.replace("/colaborador");
      return;
    }
  }, [router]);

  if (!mounted) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando…</p>
      </main>
    );
  }

  const documentos: DocumentoInterno[] = [
    {
      titulo: "Governança de Acessos e Perfis Administrativos",
      descricao:
        "Documento interno de governança que define perfis administrativos, segregação de funções e controles de acesso no Portal do Colaborador.",
      arquivo:
        "/documentos-internos/Governanca_Acessos_e_Perfis_Administrativos_Portal_do_Colaborador_v1_0.pdf",
      versao: "1.0",
      data: "27/01/2026",
    },
  ];

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Auditoria — Documentos Internos
        </h1>
        <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 760 }}>
          Área restrita para documentos institucionais de governança, auditoria
          interna, compliance e controles administrativos. Conteúdo não público,
          de uso exclusivo da administração.
        </p>

        <div style={{ marginTop: 10 }}>
          <Link
            href="/colaborador/auditoria"
            style={{ fontSize: 13, textDecoration: "none" }}
          >
            ← Voltar para Auditoria
          </Link>
        </div>
      </header>

      <section>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <th style={th}>Documento</th>
              <th style={th}>Versão</th>
              <th style={th}>Data</th>
              <th style={th}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc, i) => (
              <tr key={i}>
                <td style={td}>
                  <strong>{doc.titulo}</strong>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {doc.descricao}
                  </div>
                </td>
                <td style={td}>{doc.versao}</td>
                <td style={td}>{doc.data}</td>
                <td style={td}>
                  <a
                    href={doc.arquivo}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    Abrir PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        Uso interno restrito. Documentos utilizados como evidência de auditoria,
        governança e compliance.
      </footer>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(0,0,0,0.1)",
};

const td: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};
