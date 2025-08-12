import { CalculatorInputs, CalculatorResults } from '@/types/calculator';

/**
 * Calculate the original base amount from total volume (backing out tax and tip)
 */
export function calculateOriginalBaseAmount(
  monthlyVolume: number,
  taxPercent: number,
  tipPercent: number
): number {
  const divisor = 1 + (taxPercent + tipPercent) / 100;
  return monthlyVolume / divisor;
}

/**
 * Calculate new base amount after applying price differential
 */
export function calculateNewBaseAmount(
  originalBase: number,
  priceDifferential: number
): number {
  return originalBase * (1 + priceDifferential / 100);
}

/**
 * Calculate new total volume after markup (including tax and tip on new base)
 */
export function calculateNewTotalVolume(
  newBase: number,
  taxPercent: number,
  tipPercent: number
): number {
  return newBase * (1 + (taxPercent + tipPercent) / 100);
}

/**
 * Calculate markup collected (on original base amount only)
 */
export function calculateCorrectMarkupCollected(
  originalBase: number,
  priceDifferential: number
): number {
  return originalBase * (priceDifferential / 100);
}

/**
 * Calculate processing fees on the new total volume using flat rate processing
 */
export function calculateCorrectProcessingFees(
  newTotalVolume: number,
  flatRatePercent: number
): number {
  return newTotalVolume * (flatRatePercent / 100);
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a large number with appropriate suffix (K, M)
 */
export function formatLargeNumber(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Calculate all results from inputs
 */
export function calculateResults(inputs: CalculatorInputs): CalculatorResults {
  const {
    monthlyVolume,
    currentRate,
    interchangeCost,
    flatRate,
    taxRate,
    tipRate,
    priceDifferential
  } = inputs;

  // Step 1: Calculate base volume (backing out tax and tip)
  const baseVolume = calculateOriginalBaseAmount(monthlyVolume, taxRate, tipRate);

  // Step 2: Calculate marked up volume
  const markedUpVolume = calculateNewBaseAmount(baseVolume, priceDifferential);

  // Step 3: Calculate adjusted volume (adding back tax and tip to marked up base)
  const adjustedVolume = calculateNewTotalVolume(markedUpVolume, taxRate, tipRate);

  // Step 4: Calculate markup collected
  const markupCollected = calculateCorrectMarkupCollected(baseVolume, priceDifferential);

  // Step 5: Calculate processing costs
  const processingFees = calculateCorrectProcessingFees(adjustedVolume, flatRate);
  const currentCost = monthlyVolume * (currentRate / 100);
  const netCost = Math.max(0, processingFees - markupCollected);

  // Step 6: Calculate savings
  const monthlySavings = currentCost - netCost;
  const annualSavings = monthlySavings * 12;
  const annualVolume = monthlyVolume * 12;

  // Step 7: Calculate DMP profit
  const dmpProfit = markupCollected - netCost;

  return {
    baseVolume: Number(baseVolume.toFixed(2)),
    markedUpVolume: Number(markedUpVolume.toFixed(2)),
    adjustedVolume: Number(adjustedVolume.toFixed(2)),
    markupCollected: Number(markupCollected.toFixed(2)),
    processingFees: Number(processingFees.toFixed(2)),
    currentCost: Number(currentCost.toFixed(2)),
    newCost: Number(netCost.toFixed(2)),
    monthlySavings: Number(monthlySavings.toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
    annualVolume: Number(annualVolume.toFixed(2)),
    dmpProfit: Number(dmpProfit.toFixed(2))
  };
}

/**
 * Parse and validate numeric input
 */
export function parseNumericInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number input for display
 */
export function formatNumberInput(value: number): string {
  return value === 0 ? '' : value.toString();
}

/**
 * Debounce function for real-time calculations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
