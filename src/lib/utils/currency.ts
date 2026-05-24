// Currency configuration and utilities

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "ZMW", symbol: "K", name: "Zambian Kwacha" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export const DEFAULT_CURRENCY = "USD";

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? code;
}

/**
 * Format salary with currency symbol
 * Examples: $80,000 | €65,000 | K18,000
 */
export function formatSalary(amount: number | null, currencyCode: string | null): string {
  if (!amount) return "—";
  
  const code = currencyCode || DEFAULT_CURRENCY;
  const symbol = getCurrencySymbol(code);
  const formattedAmount = amount.toLocaleString();
  
  return `${symbol}${formattedAmount}`;
}
