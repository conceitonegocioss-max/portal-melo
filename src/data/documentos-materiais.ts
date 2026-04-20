export type DocCategoria =
  | "politica"
  | "sgq"
  | "procedimento"
  | "institucional"
  | "termo";

export type DocStatus = "vigente" | "atualizar";

export type Documento = {
  id: string;
  titulo: string;
  categoria: DocCategoria;
  status: DocStatus;
  arquivoPdf: string;
  descricao: string;
  versao?: string;
  revisao?: string;
  responsavel?: string;
  restrito?: boolean;
  perfisPermitidos?: string[];
};

export const CATEGORIAS = {
  politica: { label: "Política", badgeClass: "badge badge-blue", icon: "📘" },
  sgq: { label: "SGQ", badgeClass: "badge badge-purple", icon: "🗂️" },
  procedimento: { label: "Procedimento", badgeClass: "badge badge-green", icon: "🧩" },
  institucional: { label: "Institucional", badgeClass: "badge badge-gray", icon: "🏛️" },
  termo: { label: "Termo", badgeClass: "badge badge-red", icon: "🔐" },
} as const;

export const STATUS: Record<DocStatus, { label: string; badgeClass: string }> = {
  vigente: { label: "Vigente", badgeClass: "badge badge-ok" },
  atualizar: { label: "Revisar", badgeClass: "badge badge-warn" },
};

export const TODOS_DOCUMENTOS: Documento[] = [
  {
    id: "termo-confidencialidade",
    titulo: "Termo de Confidencialidade",
    categoria: "termo",
    status: "vigente",
    arquivoPdf: "/materiais/termos/termo-confidencialidade-sgq.pdf",
    descricao: "Documento obrigatório para ciência e compromisso de sigilo e conformidade.",
    versao: "v3.0",
    revisao: "02/2027",
    responsavel: "Compliance",
  },

  {
    id: "politica-atendimento",
    titulo: "Política de Atendimento ao Cliente",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-atendimento-ao-cliente.pdf",
    descricao: "Diretrizes de atendimento, postura e relacionamento com clientes.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Qualidade e Compliance",
  },
  {
    id: "politica-concessao-acessos",
    titulo: "Política de Concessão de Acesso aos Sistemas e Aplicativos Internos",
    categoria: "politica",
    status: "vigente",
    arquivoPdf:
      "/materiais/politicas/politica-concessao-acesso-sistemas-aplicativos-internos.pdf",
    descricao: "Regras para concessão, manutenção e revogação de acessos internos.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Governança e TI",
  },
  {
    id: "politica-incidentes",
    titulo: "Política de Gestão de Incidentes",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-gestao-incidentes.pdf",
    descricao: "Fluxos e responsabilidades para identificação, tratamento e comunicação de incidentes.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Compliance",
  },
  {
    id: "politica-vulnerabilidades",
    titulo: "Política de Gestão de Vulnerabilidades",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-gestao-vulnerabilidades-ti.pdf",
    descricao: "Diretrizes de segurança para gestão de vulnerabilidades de sistemas e infraestrutura.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "TI e Segurança da Informação",
  },
  {
    id: "politica-governanca",
    titulo: "Política de Governança",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-governanca.pdf",
    descricao: "Princípios, responsabilidades e diretrizes de governança corporativa.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Governança",
  },
  {
    id: "politica-portabilidade-credito",
    titulo: "Política de Portabilidade de Crédito",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-portabilidade-credito.pdf",
    descricao: "Normas e controles aplicáveis ao processo de portabilidade de crédito.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Crédito e Compliance",
  },
  {
    id: "politica-prevencao-fraude",
    titulo: "Política de Prevenção à Fraude",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-prevencao-fraude.pdf",
    descricao: "Diretrizes de prevenção, detecção e resposta a fraudes.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Compliance",
  },
  {
    id: "politica-privacidade",
    titulo: "Política de Privacidade de Dados (LGPD)",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-privacidade-dados.pdf",
    descricao: "Regras de privacidade, tratamento e proteção de dados pessoais.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "LGPD / Compliance",
  },
  {
    id: "politica-rh",
    titulo: "Política de Recursos Humanos",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-recursos-humanos.pdf",
    descricao: "Diretrizes institucionais relacionadas à gestão de pessoas e conduta interna.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Recursos Humanos",
  },
  {
    id: "politica-seguranca-firewall",
    titulo: "Política de Segurança da Informação e Uso de Firewall",
    categoria: "politica",
    status: "vigente",
    arquivoPdf: "/materiais/politicas/politica-seguranca-informacao-firewall.pdf",
    descricao: "Controles e boas práticas de segurança da informação e uso de infraestrutura.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "TI e Segurança da Informação",
  },

  {
    id: "sgq-inventario-tratamento-dados",
    titulo: "Inventário de Tratamento de Dados",
    categoria: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-inventario-tratamento-dados.pdf",
    descricao: "Registro institucional de operações e fluxos de tratamento de dados.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "LGPD / Compliance",
  },
  {
    id: "sgq-manual-gestao-planejamento-fin",
    titulo: "Manual de Gestão e Planejamento Financeiro",
    categoria: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-manual-gestao-planejamento-financeiro.pdf",
    descricao: "Documento de referência para controles e organização financeira interna.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Financeiro",
  },
  {
    id: "sgq-manual-atendimento-etico",
    titulo: "Manual para um Atendimento Ético e Transparente",
    categoria: "sgq",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-manual-atendimento-etico-transparente.pdf",
    descricao: "Manual orientativo para conduta ética e transparência no atendimento.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Qualidade e Compliance",
  },

  {
    id: "proc-plano-anual-auditoria",
    titulo: "Plano Anual de Auditoria Interna",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/sgq/sgq-plano-anual-auditoria-interna.pdf",
    descricao: "Planejamento anual das atividades e frentes de auditoria interna.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Auditoria Interna",
  },
  {
    id: "proc-auditoria-interna",
    titulo: "Procedimento de Auditoria Interna",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-auditoria-interna.pdf",
    descricao: "Fluxo operacional para execução e registro de auditorias internas.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Auditoria Interna",
  },
  {
    id: "proc-prevencao-fraude",
    titulo: "Procedimento de Prevenção à Fraude",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-prevencao-fraude.pdf",
    descricao: "Procedimentos formais de apoio ao controle e prevenção de fraudes.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Compliance",
  },
  {
    id: "proc-concessao-acessos-sistemas",
    titulo: "Procedimento para Concessão de Acesso aos Sistemas",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-concessao-acesso-sistemas.pdf",
    descricao: "Fluxo operacional para concessão, alteração e revogação de acessos.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Governança e TI",
  },
  {
    id: "proc-contratacao-desenvolvimento",
    titulo: "Procedimento para Contratação e Desenvolvimento",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-contratacao-desenvolvimento.pdf",
    descricao: "Procedimento de contratação, integração e desenvolvimento de colaboradores e parceiros.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Recursos Humanos",
  },
  {
    id: "proc-tratamento-mailing",
    titulo: "Procedimento para Tratamento de Lista de Mailing",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/procedimentos/procedimento-tratamento-lista-mailing.pdf",
    descricao: "Procedimento restrito para uso, controle e tratamento de listas de mailing.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Compliance",
    restrito: true,
    perfisPermitidos: ["ADMIN", "SUPORTE OPERACIONAL", "SUPORTE_OPERACIONAL"],
  },
  {
    id: "proc-concessao-acessos-chavej-portal",
    titulo: "Concessão de Acessos (Chave J e Portal do Correspondente)",
    categoria: "procedimento",
    status: "vigente",
    arquivoPdf: "/materiais/concessao-acessos-chavej-portal.pdf",
    descricao: "Procedimento operacional para concessão de acessos a ambientes críticos.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Governança e Operações",
  },

  {
    id: "institucional-termo-adocao-sgq",
    titulo: "Termo de Adoção Institucional – SGQ",
    categoria: "institucional",
    status: "vigente",
    arquivoPdf: "/materiais/termos/termo-adocao-institucional-sgq.pdf",
    descricao: "Documento institucional de formalização e adesão ao Sistema de Gestão da Qualidade.",
    versao: "v2.0",
    revisao: "02/2027",
    responsavel: "Qualidade",
  },
];