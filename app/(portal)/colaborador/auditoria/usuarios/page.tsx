"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { guardAdmin } from "@/src/lib/accessGuard";
import { getSession, normalizeCpf, clearSession } from "@/src/lib/auth";
import { COLABORADORES } from "@/src/data/colaboradores";

export default function UsuariosPerfisPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const g = guardAdmin(router);
    if (!g.ok) return;
    setReady(true);
  }, [router]);

  const rows = useMemo(() => {
    const query = q.toLowerCase();

    return COLABORADORES.filter((c) => {
      return (
        c.nome.toLowerCase().includes(query) ||
        normalizeCpf(c.cpf).includes(query)
      );
    });
  }, [q]);

  if (!ready) return <div>Carregando...</div>;

  return (
    <main>
      <h1>Usuários</h1>

      <input value={q} onChange={(e) => setQ(e.target.value)} />

      {rows.map((r) => (
        <div key={r.id}>
          {r.nome} - {normalizeCpf(r.cpf)}
        </div>
      ))}

      <Link href="/colaborador">Voltar</Link>
    </main>
  );
}