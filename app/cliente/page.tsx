"use client";

import Link from "next/link";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ClienteDashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex">
        {/* SIDEBAR CLIENTE */}
        <aside className="hidden md:flex w-72 flex-col border-r border-white/10 bg-white/5">
          <div className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/90 flex items-center justify-center font-bold">
              MB
            </div>
            <div className="leading-tight">
              <div className="font-semibold">MaisBB</div>
              <div className="text-xs text-white/60">Área do Cliente</div>
            </div>
          </div>

          <div className="px-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold">Bem-vindo 👋</div>
              <div className="text-xs text-white/60 mt-1">
                Acompanhe solicitações, documentos e status.
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 transition"
              onClick={() => (window.location.href = "/cliente")}
              type="button"
            >
              INICIAR
            </button>
          </div>

          <nav className="mt-5 px-3 text-sm">
            <Link
              href="/cliente"
              className={cx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-white/80 hover:bg-white/10 transition",
                "bg-white/10 text-white"
              )}
            >
              <span>📊</span> Dashboard
            </Link>

            <Link
              href="/privacidade-lgpd"
              className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-white/80 hover:bg-white/10 transition"
            >
              <span>🔒</span> Privacidade (LGPD)
            </Link>

            <Link
              href="/encarregado"
              className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-white/80 hover:bg-white/10 transition"
            >
              <span>👤</span> Encarregado (DPO)
            </Link>
          </nav>

          <div className="mt-auto p-4 text-xs text-white/50">
            © {new Date().getFullYear()} • MaisBB
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1">
          {/* TOPO */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Dashboard</div>
                <div className="text-sm text-white/60">
                  Área do Cliente • Atendimento e acompanhamento
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                  href="/"
                >
                  Portal
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* BANNER */}
            <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                  <div className="text-xl md:text-2xl font-semibold">
                    Fluxo de Análise
                  </div>
                  <p className="mt-2 text-white/70 max-w-2xl">
                    Acompanhe o andamento e confira o status das solicitações.
                    Tudo centralizado e transparente.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      className="inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 transition"
                      type="button"
                      onClick={() => alert("Em breve: detalhes do fluxo.")}
                    >
                      SABER MAIS
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="h-40 md:h-44 w-full rounded-2xl bg-gradient-to-r from-white/10 to-white/0 border border-white/10" />
                </div>
              </div>

              <div className="px-6 pb-5 flex items-center justify-center gap-2 opacity-70">
                <span className="h-2 w-8 rounded-full bg-white/70" />
                <span className="h-2 w-2 rounded-full bg-white/30" />
                <span className="h-2 w-2 rounded-full bg-white/30" />
              </div>
            </section>

            {/* CARDS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg">Solicitações</div>
                    <div className="text-xs text-white/60 mt-1">
                      Abertas e em acompanhamento
                    </div>
                  </div>
                  <div className="text-2xl">✅</div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <Row label="Em andamento" value="0" />
                  <Row label="Em análise" value="0" />
                  <Row label="Concluídas" value="0" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-lg">Planos de Ação</div>
                    <div className="text-xs text-white/60 mt-1">
                      Pendências e retornos
                    </div>
                  </div>
                  <div className="text-2xl">⚠️</div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <Row label="Atrasados" value="0" />
                  <Row label="Aguardando solução" value="0" />
                  <Row label="Concluídos" value="0" />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-white/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
