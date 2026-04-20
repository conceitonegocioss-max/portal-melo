// src/data/scripts.ts
export type ScriptItem = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "Operacional" | "Atendimento" | "Comercial" | "Compliance" | "Auditoria" | "TI";
  tags: string[];
  versao: string; // ex: "v3.0"
  publicadoEmISO: string; // ex: "2026-01-25T21:00:00.000Z"
  responsavel: string; // ex: "Qualidade & Compliance"
  validadeAteISO?: string; // opcional
  texto: string; // conteúdo do script (exibido e copiável)
  anexos?: Array<{ label: string; href: string }>; // se você tiver PDF/links
};

const PADRAO_REVISAO =
  "Documento para evidência de capacitação, padronização e conformidade.\n\n" +
  "⚠️ Substitua este texto pelo roteiro real do script.\n" +
  "Sugestão: inclua saudação, identificação do cliente, confirmação de dados, oferta, objeções, encerramento e registro.\n";

export const SCRIPTS: ScriptItem[] = [
  // -----------------------------
  // ✅ SEUS 7 SCRIPTS (print)
  // -----------------------------
  {
    id: "script-conta-corrente-pf-pj",
    titulo: "Script — Conta Corrente (PF/PJ)",
    descricao: "Roteiro padronizado para atendimento e oferta de Conta Corrente PF/PJ.",
    categoria: "Comercial",
    tags: ["script", "conta-corrente", "pf", "pj", "vigente"],
    versao: "v3.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — CONTA CORRENTE (PF/PJ)\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-consorcio",
    titulo: "Script — Consórcio",
    descricao: "Roteiro padronizado para abordagem, explicação e condução de Consórcio.",
    categoria: "Comercial",
    tags: ["script", "consorcio", "vigente"],
    versao: "v3.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — CONSÓRCIO\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-linhas-de-credito",
    titulo: "Script — Linhas de Crédito",
    descricao: "Roteiro padronizado para oferta e condução de Linhas de Crédito.",
    categoria: "Comercial",
    tags: ["script", "credito", "linhas", "vigente"],
    versao: "v3.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — LINHAS DE CRÉDITO\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-portabilidade",
    titulo: "Script — Linha de Crédito (Portabilidade)",
    descricao: "Roteiro padronizado para oferta e condução de Portabilidade.",
    categoria: "Comercial",
    tags: ["script", "portabilidade", "credito", "vigente"],
    versao: "v3.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — LINHA DE CRÉDITO (PORTABILIDADE)\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-ourocap",
    titulo: "Script — Ourocap",
    descricao: "Roteiro padronizado para oferta de Ourocap e explicação de condições.",
    categoria: "Comercial",
    tags: ["script", "ourocap", "vigente"],
    versao: "v3.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — OUROCAP\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-seguro-prestamista",
    titulo: "Script — Seguro Prestamista",
    descricao: "Roteiro padronizado para oferta e esclarecimentos do Seguro Prestamista.",
    categoria: "Comercial",
    tags: ["script", "seguro", "prestamista", "vigente"],
    versao: "v2.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — SEGURO PRESTAMISTA\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },
  {
    id: "script-oferta-mailing",
    titulo: "Script — Oferta Mailing",
    descricao: "Roteiro padronizado para abordagem via mailing (lista) e follow-up.",
    categoria: "Atendimento",
    tags: ["script", "mailing", "oferta", "vigente"],
    versao: "v2.0",
    publicadoEmISO: "2026-01-25T21:00:00.000Z",
    responsavel: "Qualidade & Compliance",
    texto:
      "SCRIPT — OFERTA MAILING\n" +
      "Status: Vigente\n" +
      "Data Revisão: Jan/2026 | Próx. Revisão: Jan/2027\n\n" +
      PADRAO_REVISAO,
  },

  // -----------------------------
  // ✅ OS 2 TEMPLATES (compliance/ti)
  // -----------------------------
  {
    id: "script-confirmacao-ciencia-politica-acessos",
    titulo: "Solicitação de Ciência — Política de Acessos (Chave J / Portal do Correspondente)",
    descricao:
      "Mensagem padrão para solicitar ciência do colaborador em políticas críticas (concessão, revisão periódica, revogação).",
    categoria: "Compliance",
    tags: ["ciencia", "acessos", "chave-j", "portal-correspondente", "politica"],
    versao: "v1.0",
    publicadoEmISO: "2026-01-26T00:00:00.000Z",
    responsavel: "Qualidade & Auditoria Interna",
    texto:
      `Olá! Tudo bem?\n\n` +
      `Conforme nossas diretrizes internas de segurança e auditoria, preciso registrar sua CIÊNCIA sobre a Política de Acessos ` +
      `(concessão, manutenção, revisão periódica e revogação) referente aos sistemas utilizados no exercício das atividades ` +
      `(ex.: Chave J e Portal do Correspondente).\n\n` +
      `✅ Por favor, responda esta mensagem confirmando: “CIENTE”.\n` +
      `📅 Data:\n` +
      `👤 Nome:\n` +
      `🏢 Unidade/Empresa:\n\n` +
      `Se tiver dúvidas, me chame.\n`,
  },
  {
    id: "script-abertura-chamado-ti-acesso",
    titulo: "Abertura de Chamado — Solicitação/Revogação de Acesso",
    descricao:
      "Template para padronizar pedido ao TI (ou responsável) com evidências mínimas: quem, sistema, perfil, motivo, data/urgência.",
    categoria: "TI",
    tags: ["acesso", "revogacao", "concessao", "auditoria", "evidencia"],
    versao: "v1.0",
    publicadoEmISO: "2026-01-26T00:00:00.000Z",
    responsavel: "Qualidade & Auditoria Interna",
    texto:
      `Assunto: [AÇÃO] Acesso — [SISTEMA] — [NOME/CPF]\n\n` +
      `Olá, time.\n\n` +
      `Solicito a [CONCESSÃO/ALTERAÇÃO/REVOGAÇÃO] de acesso conforme dados abaixo:\n\n` +
      `• Colaborador: [NOME]\n` +
      `• CPF: [CPF]\n` +
      `• Empresa/Unidade: [EMPRESA/UNIDADE]\n` +
      `• Sistema: [Chave J / Portal do Correspondente / Outro]\n` +
      `• Perfil/Permissões solicitadas: [DESCREVER]\n` +
      `• Justificativa (negócio/auditoria): [DESCREVER]\n` +
      `• Data/hora desejada: [DATA/HORA]\n` +
      `• Prazo/urgência: [NORMAL/ALTA]\n` +
      `• Responsável pela autorização: [NOME/CARGO]\n\n` +
      `Evidências anexas (se houver): [print/email/autorização]\n\n` +
      `Obrigado(a)!`,
  },
];
