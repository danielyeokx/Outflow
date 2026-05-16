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
  { code: "SGD", label: "Singapore Dollar", decimals: 2 },
  { code: "USD", label: "US Dollar",         decimals: 2 },
  { code: "EUR", label: "Euro",              decimals: 2 },
  { code: "GBP", label: "British Pound",     decimals: 2 },
  { code: "JPY", label: "Japanese Yen",      decimals: 0 },
  { code: "AUD", label: "Australian Dollar", decimals: 2 },
  { code: "CNY", label: "Chinese Yuan",      decimals: 2 },
  { code: "MYR", label: "Malaysian Ringgit", decimals: 2 },
  { code: "HKD", label: "Hong Kong Dollar",  decimals: 2 },
  { code: "KRW", label: "Korean Won",        decimals: 0 },
  { code: "THB", label: "Thai Baht",         decimals: 2 },
  { code: "INR", label: "Indian Rupee",      decimals: 2 },
];

export function getCurrencyDecimals(code: string): number {
  return CURRENCIES.find(c => c.code === code)?.decimals ?? 2;
}

export function convertCurrency(
  amountMinor: number,
  fromCurrency: string,
  toCurrency: string,
): number {
  if (fromCurrency === toCurrency) return amountMinor;
  const fromRate = RATES_TO_SGD[fromCurrency] ?? 1;
  const toRate   = RATES_TO_SGD[toCurrency]   ?? 1;
  // Scale by the difference in decimal places so minor units stay consistent
  const scale = Math.pow(10, getCurrencyDecimals(toCurrency) - getCurrencyDecimals(fromCurrency));
  return Math.round(amountMinor * fromRate / toRate * scale);
}
