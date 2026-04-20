export default function WhatsAppFloat() {
  const phone = "5584981417224";
  const message =
    "Olá! Gostaria de falar com um especialista e tirar algumas dúvidas.";

  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com atendimento no WhatsApp"
    >
      <span className="whatsapp-icon">💬</span>
      <span className="whatsapp-text">Fale com um especialista</span>
    </a>
  );
}
