// Approximate rates: 1 unit of currency = X SGD.
// Used as a common base; converting A→B = amount * RATES[A] / RATES[B].
// These are indicative only — suitable for a personal expense tracker.
const RATES_TO_SGD: Record<string, number> = {
  SGD: 1.00,
  USD: 1.35,
  EUR: 1.50,
  GBP: 1.73,
  JPY: 0.0091,
  AUD: 0.87,
  CNY: 0.19,
  MYR: 0.30,
  HKD: 0.17,
  KRW: 0.00097,
  THB: 0.040,
  INR: 0.016,
};

export const CURRENCIES = [
  { code: "SGD", label: "Singapore Dollar" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "MYR", label: "Malaysian Ringgit" },
  { code: "HKD", label: "Hong Kong Dollar" },
  { code: "KRW", label: "Korean Won" },
  { code: "THB", label: "Thai Baht" },
  { code: "INR", label: "Indian Rupee" },
];

export function convertCurrency(
  amountCents: number,
  fromCurrency: string,
  toCurrency: string,
): number {
  if (fromCurrency === toCurrency) return amountCents;
  const from = RATES_TO_SGD[fromCurrency] ?? 1;
  const to = RATES_TO_SGD[toCurrency] ?? 1;
  return Math.round(amountCents * from / to);
}
