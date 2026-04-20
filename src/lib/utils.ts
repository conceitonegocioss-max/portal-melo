export function normalizeCpf(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}