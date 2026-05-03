'use client';

import { useCargoStore, formatCurrency, formatDZD, CURRENCIES, type CurrencyInfo } from './cargo-store';

/**
 * Hook to access the shared currency system.
 * Uses the Zustand store for the active currency,
 * and provides formatting functions that respect the user's currency choice.
 */
export function useCurrency() {
  const currency = useCargoStore((s) => s.currency);
  const setCurrency = useCargoStore((s) => s.setCurrency);

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.DZD;

  /**
   * Format an amount using the active currency.
   * Automatically converts from DZD (base) to the active currency.
   */
  const format = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  /**
   * Format an amount in a specific currency (overriding the active one).
   */
  const formatAs = (amount: number, code: string): string => {
    return formatCurrency(amount, code);
  };

  /**
   * Format an amount in DZD (always, regardless of active currency).
   */
  const formatBase = formatDZD;

  return {
    /** Active currency code (e.g., 'DZD', 'EUR', 'USD') */
    currency,
    /** Active currency info object */
    currencyInfo,
    /** Set the active currency */
    setCurrency,
    /** Format amount using active currency */
    format,
    /** Format amount in a specific currency */
    formatAs,
    /** Format amount in DZD (base currency) */
    formatBase,
    /** All available currencies */
    currencies: CURRENCIES,
    /** Currency symbol for the active currency */
    symbol: currencyInfo.symbol,
    /** Currency name for the active currency */
    name: currencyInfo.name,
  };
}

export { formatCurrency, formatDZD, CURRENCIES, type CurrencyInfo };
