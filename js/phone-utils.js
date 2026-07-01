// ============================================================
// EMUNÁ · Utilitário de telefone (WhatsApp)
// ============================================================
// Links wa.me exigem o número só com dígitos e com o DDI (código do
// país) na frente — ex: 5521999999999. Como as pessoas digitam o
// telefone de formas diferentes (com parênteses, traço, com ou sem
// o "55"), esta função tenta normalizar isso automaticamente para
// números brasileiros.
// ============================================================

export function toWhatsAppNumber(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  // já tem DDI do Brasil (55) e DDD + número (10 ou 11 dígitos) = 12 ou 13 no total
  if (digits.length >= 12 && digits.startsWith("55")) return digits;
  // só DDD + número (10 ou 11 dígitos) — adiciona o 55 na frente
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}
