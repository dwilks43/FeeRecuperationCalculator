import { CalculatorInputs, CalculatorResults } from '@/types/calculator';

// Configurable constants for gross profit and Skytab bonus calculations
const GP_BASIS: 'savings' | 'totalNetGainRev' | 'processingSavings' = 'savings';
const SKYTAB_BONUS_MULT = 18;      // 18 months
const SKYTAB_BONUS_SPLIT = 0.60;   // 60%
const SKYTAB_BONUS_CAP = 10000;    // $10k cap
const SKYTAB_REP_SPLIT = 0.50;     // 50%

// If your current grossProfit already includes the 60% share, set this to true to avoid double-counting.
// If grossProfit is pre-split, leave as false (default) to apply 60% here.
const GROSS_PROFIT_ALREADY_INCLUDES_60 = true;

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
    cardFeeCollected = cc * fee; // fee applied to base volume (pre-tax, pre-tip)
  }
  
  const cashFeeCollected = cash * fee; // keep as-is per current app
  const suppFeeCollected = cardFeeCollected + cashFeeCollected; // Total Fee Collected (Card + Cash)
  const processorChargeOnCards = cardProcessedTotal * fr; // Total Cost for Processing Cards (new)
  
  // Net Cost for Processing Cards (can be negative)
  const netCostForProcessingCards = cardFeeCollected - processorChargeOnCards;
  
  // Canonical fields for unified savings calculation
  const currentCost = cc * ((inputs.currentRate || 0) / 100);
  const programCardFees = processorChargeOnCards;
  const feeCollectedOnCash = cashFeeCollected;
  
  // Unified savings formula: Savings = Current Processing Cost + Net Cost for Processing Cards + Fee Collected on Cash
  const monthlySavings = currentCost + netCostForProcessingCards + feeCollectedOnCash;
  const annualSavings = monthlySavings * 12;
  
  // Legacy fields for compatibility
  const extraRevenueCash = cashFeeCollected;
  const residualCardCost = Math.max(processorChargeOnCards - cardFeeCollected, 0);
  const cardProgramProfit = Math.max(cardFeeCollected - processorChargeOnCards, 0);
  const processingSavings = currentCost - residualCardCost;
  const tipAdjustmentResidual = 0;

  // Gross Profit calculation: (flat rate % - interchange cost %) × total cards processed
  const interchangeRate = (inputs.interchangeCost || 0) / 100;
  const grossProfit = (fr - interchangeRate) * cardProcessedTotal;
  
  // Apply Skytab bonus formula: Gross Profit × 18 × 60% capped at $10,000; Rep 50% based on capped amount
  const skytabBonusGross = Math.min(grossProfit * SKYTAB_BONUS_MULT * SKYTAB_BONUS_SPLIT, SKYTAB_BONUS_CAP);
  const skytabBonusRep = skytabBonusGross * SKYTAB_REP_SPLIT;

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
    // Canonical fields
    programCardFees,
    feeCollectedOnCash,
    annualVolume: (cc + cash) * 12,
    dmpProfit: 0, // Not applicable for supplemental fee
    skytabBonus: 0,
    skytabBonusRep: skytabBonusRep,
    collectedLabel: 'Supplemental Fee Collected',
    collectedValue: suppFeeCollected,
    derivedFlatRate: Math.round((fee/(1+fee))*100 * 1000) / 1000,
    tipAssumptionNote: inputs.feeTiming === 'FEE_AFTER_TIP' ? 'Fee added after tips' : 'Fee added before tips',
    // Additional fields for UI display
    cardFeeCollected,
    cashFeeCollected,
    cardProcessedTotal,
    processorChargeOnCards,
    netCostForProcessingCards,
    // Gross Profit and Skytab bonus calculations
    grossProfit,
    skytabBonusGross
  };
}

function calculateDualPricingResults(inputs: CalculatorInputs): CalculatorResults {
  // Read inputs
  const cc   = inputs.monthlyVolume || 0;           // monthly card volume (current world)
  const tax  = (inputs.taxRate || 0) / 100;
  const tip  = (inputs.tipRate || 0) / 100;
  const pd   = (inputs.priceDifferential || 0) / 100;
  const fr   = (inputs.flatRatePct || 0) / 100;     // what DMP charges merchant under DP
  const curr = (inputs.currentRate || 0) / 100;

  // 1) Recover base (pre-tax, pre-tip) using the additive model used elsewhere in the app
  const base = cc / (1 + tax + tip);

  // 2) Adjusted Card Volume includes markup, tax, and tip (your requested definition)
  const adjustedCardVolume = base * (1 + pd) * (1 + tax) * (1 + tip);

  // 3) Program card fees (new cost)
  const programCardFees = adjustedCardVolume * fr;

  // 4) Markup collected on cards
  const cardPriceIncreaseCollected = base * pd;

  // 5) Baseline current processing cost
  const currentCost = cc * curr;

  // 6) Signed net on cards and Savings
  const netCostForProcessingCards = cardPriceIncreaseCollected - programCardFees; // can be negative
  const feeCollectedOnCash = 0; // DP/CD has no cash fee
  const monthlySavings = currentCost + netCostForProcessingCards + feeCollectedOnCash;
  const annualSavings  = monthlySavings * 12;

  // Legacy fields for compatibility
  const annualVolume = cc * 12;
  const dmpProfit = cardPriceIncreaseCollected - programCardFees;
  const skytabBonus = annualVolume >= 2000000 ? annualVolume * 0.0015 : 0;
  const skytabBonusRep = skytabBonus * 0.5;

  return {
    baseVolume: base,
    markedUpVolume: base + cardPriceIncreaseCollected,
    adjustedVolume: adjustedCardVolume,
    adjustedCardVolume,
    cardPriceIncreaseCollected,
    markupCollected: cardPriceIncreaseCollected, // legacy alias
    processingFees: programCardFees, // legacy alias
    currentCost,
    newCost: programCardFees, // legacy alias
    monthlySavings,
    annualSavings,
    annualVolume,
    dmpProfit,
    skytabBonus,
    skytabBonusRep,
    collectedLabel: 'Markup Collected',
    collectedValue: cardPriceIncreaseCollected,
    // Canonical fields
    programCardFees,
    feeCollectedOnCards: cardPriceIncreaseCollected,
    netCostForProcessingCards,
    feeCollectedOnCash
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
