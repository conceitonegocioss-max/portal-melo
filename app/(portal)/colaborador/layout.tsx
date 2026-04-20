"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import ColaboradorBadge from "@/src/components/ColaboradorBadge";

export default function ColaboradorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = useMemo(() => pathname === "/colaborador/login", [pathname]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!isLoginPage && !session) {
      router.replace("/colaborador/login");
      return;
    }

    setReady(true);
  }, [isLoginPage, router]);

  // ✅ Evita “piscar” conteúdo protegido antes do redirect
  if (!isLoginPage && !ready) {
    return (
      <div className="portalShell">
        <div className="portalContent">
          <main className="section gray">
            <div className="container">
              <p>Carregando…</p>
            </div>
          </main>
        </div>

        <style jsx global>{`
          .portalShell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            width: 100%;
            background: #f3f5f9;
          }
          .portalContent {
            flex: 1;
            width: 100%;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="portalShell">
      {!isLoginPage && <ColaboradorBadge />}

      <div className="portalContent">{children}</div>

      {!isLoginPage && (
        <footer className="portalFooter" role="contentinfo">
          <div className="portalFooterInner">
            <div>© 2026 — Portal do Colaborador</div>
            <div>Uso interno e restrito aos colaboradores</div>
            <div>Área de Qualidade e Compliance</div>
          </div>
        </footer>
      )}

      <style jsx global>{`
        .portalShell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          width: 100%;
          background: #f3f5f9;
        }

        .portalContent {
          flex: 1;
          width: 100%;
        }

        /* ✅ espaçamento padrão abaixo do header (sem mexer nas páginas) */
        .portalContent > .section.gray:first-child {
          padding-top: 18px;
        }

        .portalFooter {
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
        }

        .portalFooterInner {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
          padding: 14px 0 16px;
          text-align: center;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.55);
          line-height: 1.5;
          font-weight: 700;
        }

        @media (max-width: 760px) {
          .portalFooterInner {
            width: min(1180px, calc(100% - 28px));
            padding: 12px 0 14px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
