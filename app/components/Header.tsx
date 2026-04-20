import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">

        {/* LOGO COMPLETA */}
        <div className="brand">
          <Image
            src="/maisbb-logo.png"
            alt="Correspondente Autorizado MaisBB"
            width={260}
            height={70}
            priority
          />
        </div>

        {/* MENU */}
        <nav className="nav">
          <Link href="/" className="navlink">Início</Link>
          <Link href="/quem-somos" className="navlink">Quem Somos</Link>
          <Link href="/produtos" className="navlink">Serviços</Link>
          <Link href="/privacidade-lgpd" className="navlink">LGPD</Link>
          <Link href="/contato" className="navlink">Contato</Link>
        </nav>

        {/* AÇÕES */}
        <div className="right-actions">
          <select className="select">
            <option>Selecionar empresa</option>
            <option>CONCEITO NEGÓCIOS</option>
            <option>MELO NEGÓCIOS</option>
            <option>GERA AÇÃO</option>
            <option>MC NEGÓCIOS</option>
            <option>MELO ESTRELA</option>
          </select>

          <Link href="/colaborador/login" className="btn btn-ghost small">
            Área do Colaborador
          </Link>
        </div>

      </div>
    </header>
  );
}