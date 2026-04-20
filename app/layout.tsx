import "./globals.css";

export const metadata = {
  title: "Correspondente Autorizado MaisBB",
  description: "Portal institucional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
