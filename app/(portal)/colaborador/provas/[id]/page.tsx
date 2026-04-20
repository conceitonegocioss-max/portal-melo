"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type User = {
  nome: string;
  cpf: string;
  empresa?: string;
  perfil?: string;
};

type OptionKey = "A" | "B" | "C" | "D";

type Option = {
  key: OptionKey;
  text: string;
};

type Question = {
  id: string;
  question: string;
  options: Option[];
  correct: OptionKey;
};

type Exam = {
  title: string;
  passPercent: number;
  maxAttempts: number;
  questions: Question[];
};

const EXAMS: Record<string, Exam> = {
  "atendimento-ao-cliente": {
    title: "Prova — Atendimento ao Cliente",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Qual é o principal objetivo do empréstimo consignado?",
        options: [
          { key: "A", text: "Proporcionar crédito com taxas elevadas." },
          { key: "B", text: "Garantir pagamentos flexíveis ao cliente." },
          {
            key: "C",
            text: "Oferecer segurança e praticidade com descontos automáticos na folha de pagamento.",
          },
          { key: "D", text: "Facilitar o crédito apenas para trabalhadores autônomos." },
        ],
        correct: "C",
      },
      {
        id: "q2",
        question: "Quem é o público-alvo do empréstimo consignado?",
        options: [
          { key: "A", text: "Trabalhadores autônomos." },
          { key: "B", text: "Servidores públicos, aposentados e pensionistas." },
          { key: "C", text: "Jovens em busca de crédito educativo." },
          { key: "D", text: "Pequenos empresários." },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question: "Qual é um aspecto fundamental para oferecer um atendimento personalizado ao cliente?",
        options: [
          { key: "A", text: "Oferecer apenas produtos genéricos e padronizados." },
          { key: "B", text: "Evitar explicar os detalhes do produto para economizar tempo." },
          {
            key: "C",
            text: "Demonstrar empatia e compreender as necessidades específicas de cada cliente.",
          },
          { key: "D", text: "Focar em reduzir o tempo de atendimento ao máximo." },
        ],
        correct: "C",
      },
      {
        id: "q4",
        question: "O que é essencial em uma comunicação eficaz durante o atendimento ao cliente?",
        options: [
          { key: "A", text: "Usar linguagem técnica e complexa para mostrar conhecimento." },
          { key: "B", text: "Evitar perguntar sobre as necessidades do cliente." },
          { key: "C", text: "Ser clara, objetiva e demonstrar empatia." },
          { key: "D", text: "Adotar uma postura rígida para impor autoridade." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question: "Por que é importante conhecer profundamente o produto oferecido?",
        options: [
          { key: "A", text: "Para evitar que o cliente faça perguntas." },
          { key: "B", text: "Para oferecer informações claras, precisas e confiáveis." },
          { key: "C", text: "Para impressionar o cliente com detalhes técnicos." },
          { key: "D", text: "Para reduzir o tempo de interação com o cliente." },
        ],
        correct: "B",
      },
    ],
  },

  "codigo-de-etica": {
    title: "Prova — Código de Ética e Conduta",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Qual é o objetivo principal do Código de Ética e Conduta?",
        options: [
          { key: "A", text: "Garantir a transparência nas transações financeiras" },
          { key: "B", text: "Estabelecer as melhores práticas éticas para os correspondentes bancários" },
          { key: "C", text: "Aumentar o número de clientes atendidos" },
          { key: "D", text: "Facilitar a contratação de novos funcionários" },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "Qual dos seguintes princípios fundamentais de ética está relacionado a agir com honestidade e transparência nas interações com clientes e parceiros?",
        options: [
          { key: "A", text: "Conformidade" },
          { key: "B", text: "Responsabilidade" },
          { key: "C", text: "Integridade" },
          { key: "D", text: "Confidencialidade" },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question:
          "No atendimento ao cliente, qual é o passo seguinte após o acolhimento e a identificação das necessidades do cliente?",
        options: [
          { key: "A", text: "Encerrar o atendimento" },
          { key: "B", text: "Oferecer produtos e serviços adequados" },
          { key: "C", text: "Pedir documentos adicionais" },
          { key: "D", text: "Solicitar o pagamento" },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question: "O que os correspondentes bancários devem fazer quando identificam transações suspeitas?",
        options: [
          { key: "A", text: "Ignorar a transação e seguir com o atendimento" },
          { key: "B", text: "Notificar imediatamente a gerência sobre a atividade suspeita" },
          { key: "C", text: "Registrar a transação sem comentar" },
          { key: "D", text: "Completar a transação manualmente" },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question:
          "Qual das seguintes ações é necessária para prevenir fraudes e lavagem de dinheiro?",
        options: [
          { key: "A", text: "Ignorar documentos suspeitos" },
          { key: "B", text: "Verificar cuidadosamente todos os documentos necessários para as operações bancárias" },
          { key: "C", text: "Priorizar o atendimento rápido sem verificar documentos" },
          { key: "D", text: "Completar as transações sem questionar os clientes" },
        ],
        correct: "B",
      },
    ],
  },

  "credito-responsavel": {
    title: "Prova — Crédito Responsável",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "O que caracteriza a prática de Crédito Responsável?",
        options: [
          { key: "A", text: "Oferecer crédito sem avaliar a capacidade de pagamento do cliente." },
          {
            key: "B",
            text: "Fornecer todas as informações necessárias de forma transparente, garantindo que o cliente entenda os produtos financeiros que está contratando.",
          },
          { key: "C", text: "Vender produtos financeiros com base apenas na comissão do correspondente." },
          { key: "D", text: "Não prestar orientações detalhadas, deixando a responsabilidade para o cliente." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "Por que o Crédito Responsável é importante para a relação entre o Correspondente Bancário e o cliente?",
        options: [
          { key: "A", text: "Porque fortalece a confiança mútua e garante um atendimento ético e transparente." },
          { key: "B", text: "Porque aumenta as comissões dos correspondentes bancários." },
          { key: "C", text: "Porque permite que o banco faça mais vendas de produtos financeiros." },
          { key: "D", text: "Porque os clientes não precisam entender as condições dos produtos financeiros." },
        ],
        correct: "A",
      },
      {
        id: "q3",
        question:
          "Quais são os impactos positivos de um atendimento responsável e transparente no contexto de crédito?",
        options: [
          { key: "A", text: "Fidelização de clientes e aumento no número de reclamações." },
          { key: "B", text: "Minimização de contestações e reclamações, além de fortalecimento da confiança." },
          { key: "C", text: "Redução na quantidade de empréstimos aprovados." },
          { key: "D", text: "Diminuição na clareza das informações fornecidas aos clientes." },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question: "O que é essencial para garantir um atendimento de crédito responsável?",
        options: [
          { key: "A", text: "O cliente assinar o contrato sem entender as condições do crédito." },
          { key: "B", text: "O correspondente oferecer o máximo possível de produtos financeiros." },
          {
            key: "C",
            text: "A transparência nas informações sobre as condições de crédito e o respeito às necessidades do cliente.",
          },
          { key: "D", text: "O correspondente evitar que o cliente faça perguntas sobre os produtos." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "Como o Crédito Responsável pode ajudar a evitar riscos de contestação de uma operação?",
        options: [
          { key: "A", text: "Não fornecendo nenhuma explicação sobre o produto contratado." },
          {
            key: "B",
            text: "Garantindo que o cliente compreenda claramente todas as condições antes da assinatura do contrato.",
          },
          { key: "C", text: "Permitindo que o cliente assine o contrato sem analisar as condições." },
          { key: "D", text: "Oferecendo produtos financeiros sem levar em consideração a capacidade de pagamento do cliente." },
        ],
        correct: "B",
      },
    ],
  },

  "autorregulacao-consignado": {
    title: "Prova — Autorregulação do Consignado",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Qual é o objetivo principal da Resolução 4.935/21?",
        options: [
          { key: "A", text: "Facilitar a contratação de crédito consignado para os consumidores." },
          {
            key: "B",
            text: "Estabelecer novas regras para aumentar a segurança nas operações de crédito consignado.",
          },
          { key: "C", text: "Reduzir a exigência de certificação para correspondentes bancários." },
          { key: "D", text: "Implementar taxas fixas para todas as operações financeiras no mercado consignado." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question: "Quais são os três pilares principais da autorregulação do crédito consignado?",
        options: [
          { key: "A", text: "Transparência, controle de dados e redução de taxas." },
          { key: "B", text: "Ética, prevenção e publicidade clara." },
          { key: "C", text: "Transparência, ética e prevenção." },
          { key: "D", text: "Sustentabilidade, ética e marketing eficiente." },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question:
          "De acordo com o treinamento, o que é considerado uma boa prática na oferta de crédito consignado?",
        options: [
          { key: "A", text: "Pressionar o cliente para decidir rapidamente sobre a contratação do crédito." },
          { key: "B", text: "Fornecer informações claras sobre taxas, prazos e condições do crédito." },
          { key: "C", text: "Priorizar a aprovação de crédito sem análise do perfil financeiro do cliente." },
          { key: "D", text: "Solicitar dados adicionais do cliente sem necessidade específica." },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question:
          "O que a Resolução 4.935/21 exige dos correspondentes bancários em relação à capacitação?",
        options: [
          { key: "A", text: "Participação em treinamentos regulares para manter a certificação atualizada." },
          { key: "B", text: "A realização de auditorias anuais por empresas externas." },
          { key: "C", text: "Somente uma certificação inicial, sem necessidade de atualização." },
          { key: "D", text: "Cursos sobre análise de crédito para clientes específicos." },
        ],
        correct: "A",
      },
      {
        id: "q5",
        question:
          "Quais são as medidas recomendadas para a proteção de dados dos clientes no crédito consignado?",
        options: [
          { key: "A", text: "Recolher todos os dados possíveis e mantê-los armazenados por tempo indeterminado." },
          {
            key: "B",
            text: "Coletar somente os dados necessários, armazená-los em sistemas seguros e descartá-los de forma adequada quando não forem mais necessários.",
          },
          { key: "C", text: "Compartilhar informações com parceiros estratégicos para facilitar operações financeiras." },
          { key: "D", text: "Manter um backup físico de todos os documentos por tempo indefinido." },
        ],
        correct: "B",
      },
    ],
  },

  fraude: {
    title: "Prova — Prevenção à Fraude",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Quais são os três tipos comuns de fraudes bancárias mencionados no material?",
        options: [
          { key: "A", text: "Phishing, roubo de identidade e falsificação de documentos." },
          { key: "B", text: "Phishing, transações incomuns e evasão fiscal." },
          { key: "C", text: "Roubo de identidade, falsificação de assinaturas e pirataria de software." },
          { key: "D", text: "Documentação inconsistente, lavagem de dinheiro e fraude fiscal." },
        ],
        correct: "A",
      },
      {
        id: "q2",
        question:
          "Quais sinais de alerta podem indicar um comportamento suspeito em uma tentativa de fraude?",
        options: [
          { key: "A", text: "Cliente calmo, com documentação em ordem e solicitações de limite de crédito." },
          { key: "B", text: "Cliente nervoso, pressionando por aprovação rápida e evitando contato visual." },
          { key: "C", text: "Movimentações financeiras comuns e histórico impecável do cliente." },
          { key: "D", text: "Propostas de investimento vantajosas sem verificação documental." },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question:
          "Cite duas tecnologias antifraude mencionadas no documento e como elas contribuem para a segurança.",
        options: [
          { key: "A", text: "Biometria e blockchain: ambas utilizam tecnologia de reconhecimento facial." },
          { key: "B", text: "Inteligência Artificial e autenticação de dois fatores: ambas garantem operações manuais seguras." },
          { key: "C", text: "Blockchain e biometria: garantem rastreabilidade e identificação única." },
          {
            key: "D",
            text: "Inteligência Artificial e biometria: permitem padrões suspeitos em tempo real e características únicas para validação.",
          },
        ],
        correct: "D",
      },
      {
        id: "q4",
        question:
          "Quais são as estratégias recomendadas para a mitigação de riscos relacionados a fraudes?",
        options: [
          { key: "A", text: "Atualização tecnológica constante e tolerância zero para atrasos." },
          { key: "B", text: "Monitoramento de transações e incentivo a procedimentos rápidos." },
          {
            key: "C",
            text: "Treinamento contínuo, verificação rigorosa, monitoramento de transações e políticas de segurança.",
          },
          { key: "D", text: "Enfoque em melhorias tecnológicas e auditorias eventuais." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "Qual é uma ação eficaz para identificar e prevenir fraudes durante o atendimento bancário?",
        options: [
          { key: "A", text: "Realizar auditorias externas anuais para verificar inconsistências." },
          { key: "B", text: "Monitorar exclusivamente as transações de maior valor financeiro." },
          {
            key: "C",
            text: "Observar inconsistências em documentos apresentados e realizar verificações adicionais quando necessário.",
          },
          { key: "D", text: "Depender exclusivamente de sistemas automatizados para bloquear transações suspeitas." },
        ],
        correct: "C",
      },
    ],
  },

  lgpd: {
    title: "Prova — LGPD",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Quais medidas devem ser adotadas para garantir a conformidade dos correspondentes bancários com os princípios da LGPD relacionados à segurança dos dados?",
        options: [
          { key: "A", text: "Obter consentimento verbal dos clientes e realizar auditorias anuais." },
          { key: "B", text: "Implementar criptografia, controle de acesso e auditorias regulares." },
          { key: "C", text: "Compartilhar dados apenas com instituições financeiras parceiras sem documentação formal." },
          { key: "D", text: "Armazenar todos os dados coletados em servidores locais para evitar violações." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question: "De acordo com a LGPD, um correspondente bancário pode armazenar dados pessoais dos clientes:",
        options: [
          { key: "A", text: "Por tempo indeterminado, desde que seja em servidores criptografados." },
          { key: "B", text: "Pelo tempo necessário para atender à finalidade específica e dentro dos limites legais." },
          { key: "C", text: "Apenas enquanto o cliente mantiver uma conta ativa na instituição financeira." },
          { key: "D", text: "Somente se o titular dos dados solicitar explicitamente." },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question:
          "No caso de um ataque cibernético resultando no vazamento de dados, qual sequência de ações reflete as melhores práticas conforme a LGPD?",
        options: [
          { key: "A", text: "Negar o incidente, informar os clientes apenas após uma solução definitiva e arquivar relatórios internos." },
          {
            key: "B",
            text: "Informar imediatamente os titulares e a Autoridade Nacional de Proteção de Dados (ANPD), revisar os processos e implementar medidas preventivas.",
          },
          { key: "C", text: "Resolver o problema internamente, sem envolver a ANPD ou os clientes, para evitar impactos à reputação." },
          { key: "D", text: "Substituir a equipe de segurança da informação e manter o incidente confidencial." },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question: "Qual exemplo abaixo viola diretamente os princípios de transparência e necessidade da LGPD?",
        options: [
          { key: "A", text: "Coletar apenas dados essenciais para a prestação de serviços financeiros e informá-los ao cliente." },
          { key: "B", text: "Solicitar consentimento explícito para o tratamento de dados sensíveis, como renda e informações de crédito." },
          { key: "C", text: "Compartilhar dados de clientes com terceiros sem informar previamente os titulares." },
          { key: "D", text: "Realizar auditorias periódicas e manter o cliente informado sobre o uso de seus dados." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "Como os correspondentes bancários podem superar os desafios apresentados pela descentralização das operações e garantir conformidade com a LGPD?",
        options: [
          { key: "A", text: "Implementando políticas rígidas de proteção de dados e treinamento contínuo em toda a equipe." },
          { key: "B", text: "Centralizando todas as operações em uma única localidade física para reduzir riscos." },
          { key: "C", text: "Deixando a responsabilidade sobre proteção de dados exclusivamente para as instituições financeiras parceiras." },
          { key: "D", text: "Utilizando soluções tecnológicas locais e evitando a interação com plataformas de terceiros." },
        ],
        correct: "A",
      },
    ],
  },

  pldft: {
    title: "Prova — PLDFT",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Qual é o objetivo principal da Prevenção à Lavagem de Dinheiro e ao Financiamento do Terrorismo (PLDFT)?",
        options: [
          { key: "A", text: "Maximizar os lucros das instituições financeiras." },
          { key: "B", text: "Garantir a conformidade com regulamentações ambientais." },
          { key: "C", text: "Prevenir que recursos ilícitos sejam ocultados ou utilizados para financiar atividades terroristas." },
          { key: "D", text: "Facilitar a obtenção de empréstimos e financiamentos." },
        ],
        correct: "C",
      },
      {
        id: "q2",
        question: "Qual dos itens abaixo NÃO faz parte dos requisitos de qualidade em PLDFT?",
        options: [
          { key: "A", text: "Desenvolvimento de políticas internas robustas." },
          { key: "B", text: "Capacitação regular dos colaboradores." },
          { key: "C", text: "Uso de estratégias de marketing agressivas." },
          { key: "D", text: "Monitoramento eficiente de transações." },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question:
          "De acordo com o material, qual é o primeiro passo no processo de melhoria contínua em PLDFT?",
        options: [
          { key: "A", text: "Implementação de melhorias." },
          { key: "B", text: "Coleta de feedback e ajustes." },
          { key: "C", text: "Avaliação dos processos existentes." },
          { key: "D", text: "Identificação de gaps." },
        ],
        correct: "D",
      },
      {
        id: "q4",
        question:
          "O que os colaboradores devem fazer como parte das ações práticas em PLDFT?",
        options: [
          { key: "A", text: "Ignorar comportamentos suspeitos, confiando que o sistema detectará irregularidades." },
          { key: "B", text: "Participar de treinamentos e atualizações regularmente." },
          { key: "C", text: "Realizar auditorias externas na organização." },
          { key: "D", text: "Investir exclusivamente em tecnologia de inteligência artificial." },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question: "Qual é uma das medidas indicadas para mitigar riscos em PLDFT?",
        options: [
          { key: "A", text: "Evitar parcerias com outras instituições." },
          { key: "B", text: "Estimular a cultura de compliance em todos os níveis da organização." },
          { key: "C", text: "Focar apenas em transações de alto valor." },
          { key: "D", text: "Reduzir a frequência de auditorias internas." },
        ],
        correct: "B",
      },
    ],
  },

  "seguranca-informacao": {
    title: "Prova — Aperfeiçoamento em Segurança da Informação",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Por que é importante realizar backups regulares dos dados?",
        options: [
          { key: "A", text: "Para evitar ataques de phishing" },
          { key: "B", text: "Para garantir a recuperação dos dados em caso de falhas ou ataques" },
          { key: "C", text: "Para facilitar o compartilhamento de informações entre colaboradores" },
          { key: "D", text: "Para aumentar a velocidade da rede" },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question: "Qual das opções abaixo representa uma boa prática para o uso de senhas?",
        options: [
          { key: "A", text: "Utilizar a mesma senha para todas as contas" },
          { key: "B", text: "Criar senhas longas e complexas, combinando letras, números e símbolos" },
          { key: "C", text: "Compartilhar senhas com a equipe para agilizar processos" },
          { key: "D", text: "Anotar as senhas em um post-it e colá-lo no monitor" },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question:
          "O que deve ser feito ao receber um e-mail suspeito solicitando informações pessoais?",
        options: [
          { key: "A", text: "Responder com as informações solicitadas para evitar bloqueios" },
          { key: "B", text: "Clicar no link para verificar sua autenticidade" },
          { key: "C", text: "Excluir imediatamente o e-mail e não informar a equipe de TI" },
          { key: "D", text: "Verificar a autenticidade do remetente antes de tomar qualquer ação" },
        ],
        correct: "D",
      },
      {
        id: "q4",
        question: "Como o monitoramento de sistemas contribui para a segurança da informação?",
        options: [
          { key: "A", text: "Permitindo que qualquer colaborador visualize os logs de acesso" },
          { key: "B", text: "Detectando atividades suspeitas e prevenindo acessos não autorizados" },
          { key: "C", text: "Bloqueando automaticamente todos os acessos externos" },
          { key: "D", text: "Reduzindo o tempo de login dos usuários" },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question:
          "Quais medidas podem ser adotadas para evitar ataques cibernéticos em dispositivos móveis?",
        options: [
          { key: "A", text: "Manter o sistema operacional e os aplicativos sempre atualizados" },
          { key: "B", text: "Conectar-se a redes Wi-Fi públicas sempre que possível" },
          { key: "C", text: "Desativar todas as proteções de segurança para economizar bateria" },
          { key: "D", text: "Utilizar aplicativos de fontes desconhecidas para aumentar funcionalidades" },
        ],
        correct: "A",
      },
    ],
  },

  "publico-vulneravel": {
    title: "Prova — Atendimento Público Vulnerável",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Qual é uma prática recomendada ao atender pessoas idosas no mercado de consignado?",
        options: [
          { key: "A", text: "Utilizar termos técnicos para demonstrar conhecimento." },
          { key: "B", text: "Apressar o atendimento para otimizar o tempo." },
          { key: "C", text: "Adaptar o atendimento às necessidades específicas desse grupo." },
          { key: "D", text: "Presumir que todas as pessoas idosas possuem as mesmas dificuldades." },
        ],
        correct: "C",
      },
      {
        id: "q2",
        question:
          "O que é essencial para garantir acessibilidade e inclusão ao atender pessoas com deficiência?",
        options: [
          { key: "A", text: "Utilizar linguagem técnica e detalhada." },
          { key: "B", text: "Focar apenas nas limitações físicas dos clientes." },
          { key: "C", text: "Usar linguagem clara, respeitosa e considerar as necessidades individuais." },
          { key: "D", text: "Tratar todos os clientes com deficiência de forma padronizada." },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question:
          "Qual das práticas abaixo NÃO é indicada para construir relacionamentos de confiança com clientes vulneráveis?",
        options: [
          { key: "A", text: "Ser transparente sobre taxas e custos." },
          { key: "B", text: "Responder de forma apressada para concluir o atendimento rapidamente." },
          { key: "C", text: "Demonstrar paciência e tolerância com os clientes." },
          { key: "D", text: "Ouvir ativamente os anseios e preocupações dos clientes." },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question: "Quais são elementos essenciais para prevenir práticas abusivas no atendimento?",
        options: [
          { key: "A", text: "Cobranças indevidas, informações falsas e abuso de confiança." },
          { key: "B", text: "Transparência, ética e respeito ao cliente." },
          { key: "C", text: "Oferecer informações detalhadas sem foco na clareza." },
          { key: "D", text: "Simplificar os contratos para evitar explicações detalhadas." },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question:
          "Qual prática deve ser incentivada para otimizar o atendimento a públicos vulneráveis?",
        options: [
          { key: "A", text: "Evitar treinamentos, pois eles não são eficazes." },
          { key: "B", text: "Buscar feedback dos clientes para identificar áreas de melhoria." },
          { key: "C", text: "Centralizar os atendimentos em um único canal de comunicação." },
          { key: "D", text: "Adotar linguagem técnica para atender demandas específicas." },
        ],
        correct: "B",
      },
    ],
  },

  "resumo-contratual": {
    title: "Prova — Resumo Contratual",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "O que o resumo contratual deve assegurar? Assinale alternativa correta.",
        options: [
          { key: "A", text: "Informações superficiais e cláusulas mínimas da contratação" },
          { key: "B", text: "Dados do cliente e dados da instituição" },
          { key: "C", text: "Informações claras e precisas sobre as principais cláusula de um contrato de crédito" },
          { key: "D", text: "NDA" },
        ],
        correct: "C",
      },
      {
        id: "q2",
        question: "Assinale alternativa correta. Quais informações econômicas precisam constar na proposta?",
        options: [
          {
            key: "A",
            text: "Valor do empréstimo contratado, valor a ser recebido pelo consumidor, valor de tarifas e tributos",
          },
          { key: "B", text: "Telefone da instituição para solicitar as informações" },
          {
            key: "C",
            text: "Não existe informações mínimas, pois o cliente pode acionar a instituição financeira posteriormente",
          },
          { key: "D", text: "NDA" },
        ],
        correct: "A",
      },
      {
        id: "q3",
        question: "É de direito do cliente, quais informações? Assinale alternativa correta.",
        options: [
          { key: "A", text: "Ter apenas informação das parcelas, pois só isso que vai importa para o cliente" },
          { key: "B", text: "Tem que fazer um tutorial para o cliente entender tudo" },
          {
            key: "C",
            text: "Aos canais de atendimento disponíveis; a liquidação antecipada e portabilidade; a desistência da operação contratada",
          },
          { key: "D", text: "NDA" },
        ],
        correct: "C",
      },
      {
        id: "q4",
        question:
          "Assinar alternativa correta. O que deve ser feito para o cliente, quando contratado por telefone?",
        options: [
          { key: "A", text: "Não deve ser feito nada, pois o cliente já contratou" },
          { key: "B", text: "Leitura do resumo contratual para o consumidor, indagando-o sobre eventuais dúvidas" },
          { key: "C", text: "Deve ser enviado ao cliente a proposta, pois isso já basta" },
          { key: "D", text: "NDA" },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question:
          "Assinar alternativa correta. O que deve ser feito para o cliente, quando contratado pelo autoatendimento?",
        options: [
          { key: "A", text: "As informações devem constar no documento disponibilizado para impressão" },
          { key: "B", text: "Não deve informar nada ao cliente, pois ele já aprovou a operação com senha" },
          { key: "C", text: "Deve ser feito um contato com o cliente para confirmar a operação" },
          { key: "D", text: "NDA" },
        ],
        correct: "A",
      },
    ],
  },

  "produtos-consignado": {
    title: "Prova — Produtos Modalidades do Crédito Consignado",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Em relação ao consignado INSS, qual é a principal limitação em relação à margem consignável?",
        options: [
          { key: "A", text: "50% do benefício para empréstimos pessoais." },
          {
            key: "B",
            text: "35% do benefício, sendo 30% para empréstimos e 5% para cartão de crédito consignado.",
          },
          { key: "C", text: "40% do benefício para qualquer modalidade de crédito." },
          { key: "D", text: "10% do benefício para empréstimos e 25% para cartão de crédito." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "Qual das seguintes características é comum a todas as modalidades de crédito consignado (servidores públicos, INSS, privado)?",
        options: [
          { key: "A", text: "Desconto automático das parcelas na folha de pagamento ou benefício." },
          { key: "B", text: "Taxas de juros mais altas em relação a empréstimos pessoais convencionais." },
          { key: "C", text: "Possibilidade de parcelar em até 120 meses." },
          { key: "D", text: "Prazos de pagamento inferiores a 12 meses." },
        ],
        correct: "A",
      },
      {
        id: "q3",
        question:
          "No consignado privado, qual é uma prática recomendada para minimizar os riscos ao oferecer essa modalidade de crédito aos funcionários de empresas?",
        options: [
          { key: "A", text: "Oferecer condições de crédito padronizadas para todos os funcionários." },
          {
            key: "B",
            text: "Permitir que as parcelas sejam descontadas diretamente de contas bancárias pessoais dos funcionários.",
          },
          {
            key: "C",
            text: "Estabelecer convênios com empresas privadas e avaliar a estabilidade financeira da empregadora.",
          },
          { key: "D", text: "Liberar crédito sem análise prévia de risco de demissão." },
        ],
        correct: "C",
      },
      {
        id: "q4",
        question:
          "Qual é a principal vantagem do crédito consignado em relação a outros tipos de empréstimos pessoais?",
        options: [
          { key: "A", text: "Não há necessidade de comprovar renda." },
          { key: "B", text: "As taxas de juros são mais baixas devido ao desconto automático das parcelas." },
          { key: "C", text: "O prazo para pagamento é sempre inferior a 12 meses." },
          { key: "D", text: "O crédito é liberado sem consulta ao histórico de crédito do cliente." },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question:
          "Qual inovação no mercado de crédito consignado permite uma análise mais abrangente do perfil financeiro dos clientes, facilitando ofertas personalizadas?",
        options: [
          { key: "A", text: "Consignado Digital" },
          { key: "B", text: "Open Banking" },
          { key: "C", text: "Inteligência Artificial" },
          { key: "D", text: "Produtos Híbridos" },
        ],
        correct: "B",
      },
    ],
  },

  consorcio: {
    title: "Prova — Básico de Consórcio",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Qual das opções abaixo pode impedir um cliente de contratar um consórcio?",
        options: [
          { key: "A", text: "Cadastro atualizado e sem bloqueios" },
          { key: "B", text: "Anotação no Serasa superior a R$ 1.000,00" },
          { key: "C", text: "Comprovação de renda acima de R$ 10.000,00" },
          { key: "D", text: "Escolha do segmento desejado antes da contratação" },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "O Fundo de Reserva em um consórcio é utilizado para qual finalidade principal?",
        options: [
          { key: "A", text: "Pagamento de despesas administrativas do banco" },
          {
            key: "B",
            text: "Subsidiar despesas do grupo, incluindo cobertura de inadimplência e medidas judiciais",
          },
          { key: "C", text: "Redução da taxa de administração para clientes antigos" },
          { key: "D", text: "Aumento do valor do bem contratado pelo cliente" },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question: "A Taxa de Administração em um consórcio refere-se a:",
        options: [
          { key: "A", text: "Uma taxa opcional cobrada apenas na contratação inicial do consórcio" },
          {
            key: "B",
            text: "A remuneração da administradora pelos serviços prestados na formação e gestão do grupo",
          },
          { key: "C", text: "Um valor fixo cobrado mensalmente para cobrir despesas jurídicas do grupo" },
          { key: "D", text: "Uma porcentagem fixa aplicada ao valor do bem financiado pelo cliente" },
        ],
        correct: "B",
      },
      {
        id: "q4",
        question:
          "Qual das seguintes documentações não é necessária para a contratação de um consórcio por uma empresa (pessoa jurídica)?",
        options: [
          { key: "A", text: "Cartão do CNPJ" },
          { key: "B", text: "Comprovante de faturamento dos últimos 12 meses" },
          { key: "C", text: "RG e CPF do cliente responsável pelo pagamento" },
          { key: "D", text: "Identificação do dirigente da empresa" },
        ],
        correct: "A",
      },
      {
        id: "q5",
        question:
          "Quais são alguns dos canais de atendimento disponíveis para consorciados no BB Consórcios?",
        options: [
          {
            key: "A",
            text: "Mobile (App BB), internet banking, terminais de autoatendimento e Central de Relacionamento",
          },
          { key: "B", text: "Apenas atendimento presencial nas agências do BB" },
          { key: "C", text: "Exclusivamente via telefone e e-mail corporativo" },
          { key: "D", text: "Atendimento disponível apenas para correntistas do Banco do Brasil" },
        ],
        correct: "A",
      },
    ],
  },

  ourocap: {
    title: "Prova — Ourocap",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "O que é o Ourocap?",
        options: [
          { key: "A", text: "Um tipo de investimento em renda variável oferecido pelo Banco do Brasil" },
          {
            key: "B",
            text: "Um título de capitalização que permite ao cliente poupar e concorrer a prêmios",
          },
          { key: "C", text: "Um seguro de vida com benefícios adicionais para correntistas do Banco do Brasil" },
          { key: "D", text: "Um programa de fidelidade exclusivo para clientes com conta ativa" },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question: "Quem pode contratar o Ourocap?",
        options: [
          { key: "A", text: "Qualquer pessoa maior de 18 anos, independentemente de vínculo bancário" },
          { key: "B", text: "Apenas clientes do Banco do Brasil com conta ativa" },
          { key: "C", text: "Apenas empresas que possuem conta jurídica no Banco do Brasil" },
          { key: "D", text: "Qualquer pessoa física ou jurídica que apresente um documento de identidade" },
        ],
        correct: "B",
      },
      {
        id: "q3",
        question: "Sobre o resgate antecipado do Ourocap, é correto afirmar que:",
        options: [
          {
            key: "A",
            text: "O cliente recebe sempre 100% do valor investido, independentemente do tempo de resgate",
          },
          { key: "B", text: "Não é possível resgatar antes do vencimento do título" },
          { key: "C", text: "O resgate antecipado pode resultar em recebimento de um valor inferior ao total investido" },
          { key: "D", text: "O resgate antecipado garante o pagamento integral do valor corrigido pela inflação" },
        ],
        correct: "C",
      },
      {
        id: "q4",
        question:
          "Qual das alternativas abaixo representa uma boa prática na oferta do Ourocap?",
        options: [
          { key: "A", text: "Insistir para que o cliente contrate o produto, mesmo se ele demonstrar desinteresse" },
          { key: "B", text: "Destacar apenas os benefícios do título, omitindo possíveis riscos" },
          {
            key: "C",
            text: "Seguir as diretrizes de transparência, explicando valores, prazos e condições de resgate",
          },
          { key: "D", text: "Oferecer o produto apenas para clientes que já possuem outros produtos financeiros" },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "O que pode ocorrer caso um colaborador realize ofertas indevidas do Ourocap?",
        options: [
          { key: "A", text: "Ele pode ser promovido caso consiga um alto número de adesões" },
          { key: "B", text: "Pode sofrer sanções internas que afetam sua carreira" },
          { key: "C", text: "Apenas receberá um treinamento adicional sem outras consequências" },
          { key: "D", text: "Não há penalidades, pois a venda é livre para qualquer cliente interessado" },
        ],
        correct: "B",
      },
    ],
  },

  "abertura-conta": {
    title: "Prova — Abertura de Conta",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Na abertura de conta, o que é indispensável para seguir com segurança e conformidade?",
        options: [
          { key: "A", text: "Solicitar apenas o nome do cliente" },
          { key: "B", text: "Realizar a identificação completa e validação documental" },
          { key: "C", text: "Dispensar conferência se o cliente estiver com pressa" },
          { key: "D", text: "Aceitar qualquer informação verbal sem validação" },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question: "Uma boa prática na abertura de conta é:",
        options: [
          { key: "A", text: "Conferir os dados informados e esclarecer dúvidas do cliente" },
          { key: "B", text: "Pular etapas para agilizar o atendimento" },
          { key: "C", text: "Evitar explicar condições da conta" },
          { key: "D", text: "Registrar dados incompletos e corrigir depois" },
        ],
        correct: "A",
      },
    ],
  },

  seguridade: {
    title: "Prova — Seguridade",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question:
          "Qual é o principal objetivo do Seguro Prestamista e do Seguro Crédito Protegido?",
        options: [
          { key: "A", text: "Oferecer descontos em empréstimos bancários." },
          { key: "B", text: "Garantir a quitação total ou parcial da dívida em caso de eventos imprevistos." },
          { key: "C", text: "Aumentar o saldo disponível na conta do cliente." },
          { key: "D", text: "Reduzir a taxa de juros dos financiamentos." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "Qual das seguintes opções é uma característica do Seguro Crédito Protegido - SLIP?",
        options: [
          { key: "A", text: "Pode ser contratado independentemente de um empréstimo." },
          { key: "B", text: "Está disponível apenas para clientes acima de 60 anos." },
          { key: "C", text: "Garante a quitação de dívidas em caso de morte, invalidez ou perda de renda." },
          { key: "D", text: "Tem um prazo único e fixo de 60 meses." },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question:
          "O Seguro Crédito Protegido - Estoque oferece cobertura para quais situações?",
        options: [
          { key: "A", text: "Somente para perda involuntária de renda." },
          { key: "B", text: "Apenas para invalidez temporária." },
          { key: "C", text: "Exclusivamente para morte acidental." },
          { key: "D", text: "Para Morte Natural ou Acidental (MNA), com base no saldo devedor da operação." },
        ],
        correct: "D",
      },
      {
        id: "q4",
        question: "Qual dos seguintes benefícios NÃO está incluído nos seguros de crédito protegido?",
        options: [
          { key: "A", text: "Redução do impacto financeiro sobre a família em caso de falecimento." },
          { key: "B", text: "Indenização paga diretamente aos beneficiários, sem entrar no inventário." },
          { key: "C", text: "Aumento automático do valor segurado após 12 meses de contratação." },
          { key: "D", text: "Possibilidade de pagamento à vista ou financiamento do seguro na operação de crédito." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "Qual é a faixa etária permitida para contratar o Seguro Crédito Protegido - SLIP?",
        options: [
          { key: "A", text: "De 18 a 80 anos." },
          { key: "B", text: "De 21 a 70 anos." },
          { key: "C", text: "De 25 a 85 anos." },
          { key: "D", text: "Sem limite de idade." },
        ],
        correct: "A",
      },
    ],
  },

  portabilidade: {
    title: "Prova — Portabilidade de Crédito",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "O que é a Portabilidade de Crédito?",
        options: [
          { key: "A", text: "Um serviço que permite ao cliente renegociar a dívida dentro do mesmo banco." },
          {
            key: "B",
            text: "A possibilidade de transferir um contrato de crédito de uma instituição para outra.",
          },
          { key: "C", text: "Um financiamento concedido para clientes com crédito negativo." },
          { key: "D", text: "Uma modalidade de empréstimo com taxas fixas para todos os clientes." },
        ],
        correct: "B",
      },
      {
        id: "q2",
        question:
          "Qual dos seguintes princípios NÃO faz parte das boas práticas na oferta de Portabilidade de Crédito?",
        options: [
          { key: "A", text: "Clareza na apresentação das informações ao cliente." },
          { key: "B", text: "Comparação das condições do contrato atual com a nova proposta." },
          { key: "C", text: "Insistência na oferta para garantir a conversão da portabilidade." },
          { key: "D", text: "Respeito à decisão do cliente sem pressões indevidas." },
        ],
        correct: "C",
      },
      {
        id: "q3",
        question: "Quais são alguns dos principais benefícios da Portabilidade de Crédito?",
        options: [
          {
            key: "A",
            text: "Redução de taxas, melhores condições de pagamento e conveniência no processo.",
          },
          { key: "B", text: "Isenção total de juros e quitação automática da dívida anterior." },
          { key: "C", text: "Possibilidade de contratar um novo financiamento sem análise de crédito." },
          { key: "D", text: "Aumento obrigatório do prazo do contrato original." },
        ],
        correct: "A",
      },
      {
        id: "q4",
        question:
          "O que o Banco Central do Brasil exige para a realização da Portabilidade de Crédito?",
        options: [
          { key: "A", text: "Que o cliente aumente o saldo devedor ao transferir a dívida." },
          { key: "B", text: "Que a nova instituição altere todas as cláusulas do contrato original." },
          { key: "C", text: "Que a operação siga critérios rigorosos para garantir transparência e segurança." },
          { key: "D", text: "Que a portabilidade seja obrigatória para todos os contratos de crédito." },
        ],
        correct: "C",
      },
      {
        id: "q5",
        question:
          "Qual das alternativas descreve corretamente o papel do colaborador ao apresentar a Portabilidade de Crédito?",
        options: [
          { key: "A", text: "Pressionar o cliente para aceitar a nova proposta e garantir a conversão da venda." },
          {
            key: "B",
            text: "Fornecer informações claras, ajudar na comparação das condições e esclarecer dúvidas.",
          },
          { key: "C", text: "Evitar responder perguntas sobre os custos envolvidos para não desmotivar o cliente." },
          { key: "D", text: "Oferecer a portabilidade apenas para clientes com alto valor de crédito." },
        ],
        correct: "B",
      },
    ],
  },

  mailing: {
    title: "Prova — Tratamento e Uso da Lista de Mailing",
    passPercent: 70,
    maxAttempts: 3,
    questions: [
      {
        id: "q1",
        question: "Qual é o principal objetivo do mailing na empresa?",
        options: [
          { key: "A", text: "Captar novos clientes e gerar oportunidades de crédito." },
          { key: "B", text: "Compartilhar dados com terceiros para aumentar a base de contatos." },
          { key: "C", text: "Armazenar informações de clientes indefinidamente." },
          { key: "D", text: "Enviar ofertas para qualquer cliente, independentemente da lista recebida." },
        ],
        correct: "A",
      },
      {
        id: "q2",
        question: "Sobre segurança e conformidade, qual prática está correta?",
        options: [
          { key: "A", text: "Somente colaboradores autorizados podem acessar a lista de mailing." },
          { key: "B", text: "Os dados podem ser compartilhados com qualquer setor da empresa." },
          { key: "C", text: "Não há necessidade de seguir a LGPD para tratamento dos dados." },
          { key: "D", text: "O mailing pode ser utilizado além do prazo estipulado, sem restrições." },
        ],
        correct: "A",
      },
      {
        id: "q3",
        question:
          "Qual é o prazo máximo para tentar contato com os clientes e devolver os resultados da lista?",
        options: [
          { key: "A", text: "15 dias." },
          { key: "B", text: "30 dias." },
          { key: "C", text: "45 dias." },
          { key: "D", text: "60 dias." },
        ],
        correct: "D",
      },
      {
        id: "q4",
        question: "O que deve ser feito quando um cliente não é encontrado?",
        options: [
          { key: "A", text: "Deixar de tentar o contato e não registrar a tentativa." },
          { key: "B", text: "Tentar outras formas de contato e registrar corretamente o retorno." },
          { key: "C", text: "Compartilhar os dados com terceiros para localizar o cliente." },
          { key: "D", text: "Apenas registrar como “não localizado” na primeira tentativa." },
        ],
        correct: "B",
      },
      {
        id: "q5",
        question: "Qual das opções abaixo é considerada uma infração no uso do mailing?",
        options: [
          { key: "A", text: "Classificar corretamente cada tentativa de contato." },
          { key: "B", text: "Garantir que todos os contatos sejam realizados dentro do prazo." },
          { key: "C", text: "Não devolver os resultados dentro do prazo ou manipulá-los." },
          { key: "D", text: "Manter os registros e acessos de forma controlada e segura." },
        ],
        correct: "C",
      },
    ],
  },
};

function pushEvent(type: string, payload: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem("portal_events") || "[]";
    const events = JSON.parse(raw);
    events.push({ type, at: new Date().toISOString(), ...payload });
    localStorage.setItem("portal_events", JSON.stringify(events));
  } catch {}
}

export default function ProvaPage() {
  const params = useParams();
  const id = String(params.id || "");
  const exam = EXAMS[id];

  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionKey | "">>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedResult, setSavedResult] = useState<{
    nota: number;
    aprovado: boolean;
    tentativas: number;
  } | null>(null);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("portal_colaborador_session_v1") ||
        localStorage.getItem("portal_user");

      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user || !id) return;

    try {
      const raw = localStorage.getItem("portal_exam_results_v1") || "{}";
      const allResults = JSON.parse(raw);
      const byCpf = allResults[user.cpf] || {};
      const current = byCpf[id];

      if (current) {
        setSavedResult({
          nota: Number(current.nota || 0),
          aprovado: Boolean(current.aprovado),
          tentativas: Number(current.tentativas || 0),
        });
      }
    } catch {
      setSavedResult(null);
    }
  }, [user, id]);

  const score = useMemo(() => {
    if (!exam) return 0;

    let correctCount = 0;
    for (const q of exam.questions) {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    }

    return Math.round((correctCount / exam.questions.length) * 100);
  }, [answers, exam]);

  function marcar(questionId: string, optionKey: OptionKey) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }

  function salvarResultado(nota: number, aprovado: boolean) {
    if (!user || !exam) return;

    try {
      const raw = localStorage.getItem("portal_exam_results_v1") || "{}";
      const allResults = JSON.parse(raw);

      if (!allResults[user.cpf]) {
        allResults[user.cpf] = {};
      }

      const previousAttempts = Number(allResults[user.cpf][id]?.tentativas || 0);

      allResults[user.cpf][id] = {
        provaId: id,
        provaTitulo: exam.title,
        nota,
        aprovado,
        tentativas: previousAttempts + 1,
        respondidoEm: new Date().toISOString(),
        nome: user.nome,
        cpf: user.cpf,
        empresa: user.empresa || "",
      };

      localStorage.setItem("portal_exam_results_v1", JSON.stringify(allResults));

      pushEvent("PROVA_ENVIADA", {
        provaId: id,
        provaTitulo: exam.title,
        cpf: user.cpf,
        empresa: user.empresa || "",
        nome: user.nome,
        nota,
        aprovado: aprovado ? "SIM" : "NAO",
      });

      if (aprovado) {
        pushEvent("PROVA_APROVADA", {
          provaId: id,
          provaTitulo: exam.title,
          cpf: user.cpf,
          empresa: user.empresa || "",
          nome: user.nome,
          nota,
        });
      }
    } catch {}
  }

  function enviar() {
    if (!exam) return;

    for (const q of exam.questions) {
      if (!answers[q.id]) {
        alert("Responda todas as questões antes de enviar.");
        return;
      }
    }

    const aprovado = score >= exam.passPercent;
    salvarResultado(score, aprovado);
    setSavedResult((prev) => ({
      nota: score,
      aprovado,
      tentativas: (prev?.tentativas || 0) + 1,
    }));
    setSubmitted(true);
  }

  function tentarNovamente() {
    if (savedResult && savedResult.tentativas >= exam.maxAttempts) {
      alert("Você já atingiu o limite máximo de tentativas desta prova.");
      return;
    }

    setAnswers({});
    setSubmitted(false);

    if (user && exam) {
      pushEvent("PROVA_NOVA_TENTATIVA", {
        provaId: id,
        provaTitulo: exam.title,
        cpf: user.cpf,
        empresa: user.empresa || "",
        nome: user.nome,
      });
    }
  }

  if (!exam) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>Prova não encontrada</h1>
        <p style={{ marginTop: 16 }}>
          <Link href="/colaborador/provas">Voltar para provas</Link>
        </p>
      </main>
    );
  }

  const bloqueadoPorTentativas =
    !!savedResult && !savedResult.aprovado && savedResult.tentativas >= exam.maxAttempts && !submitted;

  return (
    <main
      style={{
        minHeight: "100%",
        background: "#f3f5f9",
        fontFamily: "Arial, sans-serif",
        color: "#0b2a6f",
        padding: "32px 24px 48px",
      }}
    >
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 38,
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          {exam.title}
        </h1>

        <p
          style={{
            marginTop: 14,
            fontSize: 16,
            color: "#42526b",
            fontWeight: 600,
          }}
        >
          Nota mínima: <strong>{exam.passPercent}%</strong> • até{" "}
          <strong>{exam.maxAttempts} tentativas</strong>
        </p>

        {savedResult && !submitted ? (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #d7deea",
              background: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              color: "#0b2a6f",
            }}
          >
            Último resultado salvo: <strong>{savedResult.nota}%</strong> —{" "}
            <strong>{savedResult.aprovado ? "APROVADO" : "REPROVADO"}</strong> • tentativas:{" "}
            <strong>{savedResult.tentativas}</strong>
          </div>
        ) : null}

        {bloqueadoPorTentativas ? (
          <div
            style={{
              marginTop: 18,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #f1c8c8",
              background: "#fff4f4",
              fontSize: 15,
              fontWeight: 700,
              color: "#a22b2b",
            }}
          >
            Limite máximo de tentativas atingido para esta prova.
          </div>
        ) : null}

        <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
          {exam.questions.map((q, index) => (
            <article
              key={q.id}
              style={{
                background: "#fff",
                border: "1px solid #dbe3f0",
                borderRadius: 20,
                padding: 22,
                boxShadow: "0 8px 24px rgba(15, 35, 95, 0.05)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.45,
                  fontWeight: 800,
                  color: "#0b2a6f",
                }}
              >
                {index + 1}. {q.question}
              </h2>

              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {q.options.map((option) => (
                  <label
                    key={option.key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 14px",
                      border: "1px solid #d7deea",
                      borderRadius: 14,
                      background: "#fff",
                      cursor: bloqueadoPorTentativas ? "not-allowed" : "pointer",
                      opacity: bloqueadoPorTentativas ? 0.7 : 1,
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === option.key}
                      onChange={() => marcar(q.id, option.key)}
                      style={{ marginTop: 2 }}
                      disabled={bloqueadoPorTentativas}
                    />
                    <span style={{ color: "#17326e", fontSize: 15, fontWeight: 600 }}>
                      <strong>{option.key})</strong> {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {!submitted ? (
            <button
              onClick={enviar}
              disabled={bloqueadoPorTentativas}
              style={{
                minWidth: 180,
                minHeight: 48,
                borderRadius: 999,
                border: "1px solid #e0b900",
                background: bloqueadoPorTentativas ? "#e7e7e7" : "#f4c400",
                color: "#0b2a6f",
                fontWeight: 800,
                fontSize: 15,
                cursor: bloqueadoPorTentativas ? "not-allowed" : "pointer",
              }}
            >
              Enviar prova
            </button>
          ) : (
            <>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: "1px solid #d7deea",
                  background: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0b2a6f",
                }}
              >
                Sua nota: <strong>{score}%</strong> —{" "}
                <strong>{score >= exam.passPercent ? "APROVADO" : "REPROVADO"}</strong>
              </div>

              {score < exam.passPercent && (savedResult?.tentativas || 0) < exam.maxAttempts ? (
                <button
                  onClick={tentarNovamente}
                  style={{
                    minWidth: 180,
                    minHeight: 48,
                    borderRadius: 999,
                    border: "1px solid #ccd6e6",
                    background: "#fff",
                    color: "#0b2a6f",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Tentar novamente
                </button>
              ) : (
                <Link
                  href="/colaborador/provas"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 180,
                    minHeight: 48,
                    borderRadius: 999,
                    border: "1px solid #ccd6e6",
                    background: "#fff",
                    color: "#0b2a6f",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  Voltar para provas
                </Link>
              )}
            </>
          )}

          <Link
            href="/colaborador/provas"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 180,
              minHeight: 48,
              borderRadius: 999,
              border: "1px solid #ccd6e6",
              background: "#fff",
              color: "#0b2a6f",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            ← Voltar
          </Link>
        </div>
      </section>
    </main>
  );
}