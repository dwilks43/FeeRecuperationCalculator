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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
  if (inputs.programType === 'SUPPLEMENTAL_FEE') {
    return calculateSupplementalFeeResults(inputs);
  }
  return calculateDualPricingResults(inputs);
}

function calculateSupplementalFeeResults(inputs: CalculatorInputs): CalculatorResults {
  // Inputs
  const cc = inputs.monthlyVolume || 0; // pre-tax, pre-fee, pre-tip card volume
  const cash = inputs.monthlyCashVolume || 0;
  const tax = (inputs.taxRate || 0) / 100;
  const tip = (inputs.tipRate || 0) / 100;
  const fee = (inputs.priceDifferential || 0) / 100; // Supplemental Fee %
  const fr = ((inputs.flatRatePct ?? (fee/(1+fee)*100)) / 100); // Flat Rate %
  
  const taxed = cc * (1 + tax);
  let cardFeeCollected, cardProcessedTotal;
  
  if (inputs.feeTiming === 'FEE_AFTER_TIP') {
    // Fee is applied last → fee base includes tip
    cardProcessedTotal = taxed * (1 + tip) * (1 + fee);
    cardFeeCollected = taxed * (1 + tip) * fee;
  } else {
    // Fee is applied before tips (current/default)
    cardProcessedTotal = taxed * (1 + fee) * (1 + tip);
    cardFeeCollected = taxed * fee; // fee is post-tax, pre-tip
  }
  
  const cashFeeCollected = cash * fee; // keep as-is per current app
  const suppFeeCollected = cardFeeCollected + cashFeeCollected; // Total Fee Collected (Card + Cash)
  const processorChargeOnCards = cardProcessedTotal * fr; // Total Cost for Processing Cards (new)
  
  // Net Cost for Processing Cards (can be negative)
  const netCostForProcessingCards = cardFeeCollected - processorChargeOnCards;
  
  // For savings math (unchanged)
  const currentCost = cc * ((inputs.currentRate || 0) / 100);
  const residualCardCost = Math.max(processorChargeOnCards - cardFeeCollected, 0); // card fees left
  const cardProgramProfit = Math.max(cardFeeCollected - processorChargeOnCards, 0); // extra fee retained
  const processingSavings = currentCost - residualCardCost;
  const monthlySavings = processingSavings + cashFeeCollected + cardProgramProfit;
  const annualSavings = monthlySavings * 12;
  
  const extraRevenueCash = cashFeeCollected;
  const tipAdjustmentResidual = 0; // Not used in new calculation

  return {
    baseVolume: cc,
    markedUpVolume: cc,
    adjustedVolume: cc,
    markupCollected: suppFeeCollected,
    processingFees: processorChargeOnCards,
    currentCost,
    newCost: residualCardCost,
    processingSavings,
    extraRevenueCash,
    cardProgramProfit,
    residualCardCost,
    tipAdjustmentResidual,
    monthlySavings,
    annualSavings,
    annualVolume: (cc + cash) * 12,
    dmpProfit: 0, // Not applicable for supplemental fee
    skytabBonus: 0,
    skytabBonusRep: 0,
    collectedLabel: 'Supplemental Fee Collected',
    collectedValue: suppFeeCollected,
    derivedFlatRate: Math.round((fee/(1+fee))*100 * 1000) / 1000,
    tipAssumptionNote: inputs.feeTiming === 'FEE_AFTER_TIP' ? 'Fee added after tips' : 'Fee added before tips',
    // Additional fields for UI display
    cardFeeCollected,
    cashFeeCollected,
    cardProcessedTotal,
    processorChargeOnCards,
    netCostForProcessingCards
  };
}

function calculateDualPricingResults(inputs: CalculatorInputs): CalculatorResults {
  const {
    monthlyVolume,
    currentRate,
    interchangeCost,
    flatRate,
    taxRate,
    tipRate,
    priceDifferential
  } = inputs;

  // Original calculations for dual pricing
  const baseVolume = calculateOriginalBaseAmount(monthlyVolume, taxRate, tipRate);
  const adjustedVolume = calculateNewTotalVolume(baseVolume, taxRate, tipRate);
  
  const markupCollected = calculateCorrectMarkupCollected(baseVolume, priceDifferential);
  
  // Calculate processing fees on adjusted volume (volume that includes tip but not tax)
  const processingFees = calculateCorrectProcessingFees(adjustedVolume, interchangeCost);
  
  // Current cost calculation
  const currentCost = monthlyVolume * (currentRate / 100);
  
  // New cost = interchange fees on adjusted volume + flat rate fees on remaining volume
  const remainingVolume = monthlyVolume - adjustedVolume;
  const newCost = processingFees + (remainingVolume * (flatRate / 100));
  
  // Calculate savings
  const monthlySavings = currentCost - newCost;
  const annualSavings = monthlySavings * 12;
  
  // DMP profit calculations (from markup collected minus processing costs)
  const dmpProfit = markupCollected - processingFees;
  const annualVolume = monthlyVolume * 12;
  
  // Skytab bonus calculations
  const skytabBonus = annualVolume >= 2000000 ? annualVolume * 0.0015 : 0;
  const skytabBonusRep = skytabBonus * 0.5;

  return {
    baseVolume,
    markedUpVolume: baseVolume + markupCollected,
    adjustedVolume,
    markupCollected,
    processingFees,
    currentCost,
    newCost,
    monthlySavings,
    annualSavings,
    annualVolume,
    dmpProfit,
    skytabBonus,
    skytabBonusRep,
    collectedLabel: 'Markup Collected',
    collectedValue: markupCollected
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
