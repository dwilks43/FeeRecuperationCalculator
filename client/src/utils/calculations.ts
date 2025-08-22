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
  const cc = inputs.monthlyVolume || 0; // card purchase volume (pre-fee)
  const cash = inputs.monthlyCashVolume || 0; // cash purchase volume (pre-fee)
  const fee = (inputs.priceDifferential || 0) / 100; // supplemental fee %
  const fr = (inputs.flatRatePct != null ? inputs.flatRatePct : (fee/(1+fee))*100) / 100; // flat rate %
  const tipRate = (inputs.tipRate || 0) / 100; // tip %
  
  // Fee collected
  const cardFeeCollected = cc * fee;
  const cashFeeCollected = cash * fee;
  const suppFeeCollected = cardFeeCollected + cashFeeCollected;
  const extraRevenueCash = cashFeeCollected;
  
  // Tip math based on tip basis assumption
  const tipBasis = inputs.tipBasis || 'fee_inclusive';
  const cardProcessedTotal = tipBasis === 'fee_inclusive'
    ? cc * (1 + fee) * (1 + tipRate) // Tips applied on fee-inclusive amount
    : cc * (1 + fee) + cc * tipRate; // Tips applied on pre-fee amount
  
  // Processor charges flat rate on the processed card total
  const processorChargeOnCards = cardProcessedTotal * fr;
  
  // Net burden on cards after fee collected on cards
  const cardNet = processorChargeOnCards - cardFeeCollected;
  const residualCardCost = Math.max(cardNet, 0);
  const cardProgramProfit = Math.max(-cardNet, 0);
  
  // Record the portion attributable to tips as a 'tip adjustment' residual
  const tipPortion = tipBasis === 'fee_inclusive'
    ? (cc * (1 + fee) * tipRate) // Tip portion of fee-inclusive amount
    : (cc * tipRate); // Tip portion of pre-fee amount
  const tipAdjustmentResidual = Math.max(tipPortion * fr, 0);
  
  // Savings math
  const currentCost = cc * ((inputs.currentRate || 0) / 100);
  const processingSavings = currentCost - residualCardCost; // if profit exists, it's reported separately
  const monthlySavings = processingSavings + extraRevenueCash + cardProgramProfit;
  const annualSavings = monthlySavings * 12;
  
  const tipAssumptionNote = tipBasis === 'fee_inclusive' 
    ? 'Tip % applied on fee-inclusive amount' 
    : 'Tip % applied on pre-fee amount';

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
    derivedFlatRate: (fee/(1+fee))*100,
    tipAssumptionNote
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
