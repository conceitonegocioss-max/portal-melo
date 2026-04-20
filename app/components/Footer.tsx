import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">

        {/* 🔹 LINHA SUPERIOR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <small style={{ fontWeight: 600 }}>
            © {new Date().getFullYear()} • Correspondente Autorizado MaisBB
          </small>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="btn-secondary" href="/privacidade-lgpd">
              LGPD
            </Link>
            <Link className="btn-secondary" href="/privacidade-lgpd">
              Privacidade
            </Link>
            <Link className="btn-secondary" href="/encarregado">
              Encarregado
            </Link>
            <Link className="btn-primary" href="/contato">
              Contato
            </Link>
          </div>
        </div>

        {/* 🔹 DIVISÓRIA */}
        <div
          style={{
            margin: "20px 0 14px",
            height: "1px",
            background: "rgba(255,255,255,0.2)",
          }}
        />

        {/* 🔹 CERTIFICAÇÕES */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 800,
              marginBottom: "14px",
              letterSpacing: "0.6px",
            }}
          >
            Certificações e Qualidade
          </span>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "40px",
              flexWrap: "wrap",
            }}
          >
            {/* 🔵 PROMOTIVA */}
            <img
              src="/selos/selo-promotiva.png"
              alt="Selo de Qualidade Promotiva 2025"
              style={{
                height: "110px",
                objectFit: "contain",
              }}
            />

            {/* 🟡 FEBRABAN */}
            <img
              src="/selos/selo-febraban.png"
              alt="Certificação FEBRABAN Correspondente Consignado"
              style={{
                height: "110px",
                objectFit: "contain",
                borderRadius: "10px",
                background: "#d9ff00",
                padding: "6px",
              }}
            />
          </div>
        </div>

      </div>
    </footer>
  );
}