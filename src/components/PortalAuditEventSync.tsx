"use client";

import { useEffect } from "react";

type PortalEvent = Record<string, any> & {
  type?: string;
  at?: string;
  provaId?: string;
  provaTitulo?: string;
  cpf?: string;
  nome?: string;
  empresa?: string;
};

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function eventKey(event: PortalEvent) {
  return [
    event.type || "",
    event.at || "",
    event.cpf || "",
    event.provaId || "",
    event.nota ?? "",
    event.tentativas ?? "",
  ].join("|");
}

async function sendPortalEvent(event: PortalEvent) {
  const type = String(event.type || "");
  if (!type.startsWith("PROVA_")) return;

  const key = `audit_sent_${eventKey(event)}`;
  if (sessionStorage.getItem(key) === "1") return;
  sessionStorage.setItem(key, "1");

  try {
    await fetch("/api/audit/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        module: "provas",
        entityId: String(event.provaId || ""),
        entityTitle: String(event.provaTitulo || "Prova"),
        cpf: onlyDigits(String(event.cpf || "")),
        nome: String(event.nome || ""),
        empresa: String(event.empresa || ""),
        atISO: String(event.at || new Date().toISOString()),
        obs: "Resultado/evento de prova registrado automaticamente pelo Portal do Colaborador.",
        meta: {
          ...event,
          cpf: onlyDigits(String(event.cpf || "")),
        },
      }),
    });
  } catch {
    sessionStorage.removeItem(key);
  }
}

export default function PortalAuditEventSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    window.localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);

      if (key !== "portal_events") return;

      try {
        const events = JSON.parse(value || "[]");
        const last = Array.isArray(events) ? events[events.length - 1] : null;
        if (last && typeof last === "object") {
          void sendPortalEvent(last as PortalEvent);
        }
      } catch {
        // não bloqueia o uso do portal
      }
    };

    try {
      const raw = window.localStorage.getItem("portal_events") || "[]";
      const events = JSON.parse(raw);
      if (Array.isArray(events)) {
        events.slice(-10).forEach((event) => {
          if (event && typeof event === "object") void sendPortalEvent(event as PortalEvent);
        });
      }
    } catch {
      // não bloqueia o uso do portal
    }

    return () => {
      window.localStorage.setItem = originalSetItem;
    };
  }, []);

  return null;
}
