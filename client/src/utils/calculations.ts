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
  const cc = inputs.monthlyVolume || 0;
  const cash = inputs.monthlyCashVolume || 0;
  const tax = (inputs.taxRate || 0) / 100;
  const tip = (inputs.tipRate || 0) / 100;
  const fee = (inputs.priceDifferential || 0) / 100;  // Supplemental Fee %
  const fr = ((inputs.flatRatePct ?? (fee/(1+fee)*100)) / 100); // Program flat rate %
  const feeTaxBasis = inputs.feeTaxBasis || 'POST_TAX';
  const feeTiming = inputs.feeTiming || 'FEE_BEFORE_TIP';

  // Common: total card amount that actually runs (always tax + tip + fee in some order)
  // 'Before tip' means fee is added before tip; 'After tip' means after tip.
  const taxedCard = cc * (1 + tax);
  const cardProcessedTotal = feeTiming === 'FEE_BEFORE_TIP'
    ? taxedCard * (1 + fee) * (1 + tip)   // Tip Handwritten – Post Sale
    : taxedCard * (1 + tip) * (1 + fee);  // Tip at Time of Sale

  // Fee collected on cards depends on BOTH feeTaxBasis and feeTiming:
  // Base for fee when POST_TAX includes tax; when PRE_TAX excludes tax.
  let feeBaseForCards: number;
  if (feeTiming === 'FEE_BEFORE_TIP') {
    // Fee before tip: tip is NOT part of fee base
    feeBaseForCards = (feeTaxBasis === 'POST_TAX') ? taxedCard : cc;
  } else {
    // Fee after tip: tip IS part of fee base
    feeBaseForCards = (feeTaxBasis === 'POST_TAX') ? (taxedCard * (1 + tip)) : (cc * (1 + tip));
  }
  const cardFeeCollected = feeBaseForCards * fee;

  // Fee collected on cash (always based on pre-tax cash volume)
  const cashFeeCollected = cash * fee;
  const suppFeeCollected = cardFeeCollected + cashFeeCollected;

  // Program cost on cards (flat rate on the full processed total)
  const processorChargeOnCards = cardProcessedTotal * fr;
  
  // Residuals/profit for savings math (unchanged logic)
  const residualCardCost = Math.max(processorChargeOnCards - cardFeeCollected, 0);
  const cardProgramProfit = Math.max(cardFeeCollected - processorChargeOnCards, 0);
  const currentCost = cc * ((inputs.currentRate || 0) / 100);
  const processingSavings = currentCost - residualCardCost;
  const monthlySavings = processingSavings + cashFeeCollected + cardProgramProfit;
  const annualSavings = monthlySavings * 12;

  // Keep 'Net Cost for Processing Cards (include tax + tips)' per your UI as fee_on_cards − program_cost (can be negative):
  const netCostForProcessingCards = cardFeeCollected - processorChargeOnCards;
  
  // Legacy fields for compatibility
  const extraRevenueCash = cashFeeCollected;
  const tipAdjustmentResidual = 0;
  // Canonical fields for unified savings calculation
  const programCardFees = processorChargeOnCards;
  const feeCollectedOnCash = cashFeeCollected;

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
    tipAssumptionNote: inputs.feeTiming === 'FEE_AFTER_TIP' ? 'Tip at Time of Sale' : 'Tip Handwritten – Post Sale',
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
  const fr   = (inputs.flatRate || 0) / 100;     // what DMP charges merchant under DP
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

  // Gross Profit calculation: (flat rate % - interchange cost %) × adjusted card volume
  const interchangeRate = (inputs.interchangeCost || 0) / 100;
  const grossProfit = (fr - interchangeRate) * adjustedCardVolume;
  
  // Apply Skytab bonus formula: Gross Profit × 18 × 60% capped at $10,000; Rep 50% based on capped amount
  const skytabBonusGross = Math.min(grossProfit * SKYTAB_BONUS_MULT * SKYTAB_BONUS_SPLIT, SKYTAB_BONUS_CAP);
  const skytabBonusRep = skytabBonusGross * SKYTAB_REP_SPLIT;

  // UX-specific derived fields for neutral row display
  const feesDP = programCardFees; // Total Processing Fees Charged
  const residualAfterMarkup = Math.max(feesDP - cardPriceIncreaseCollected, 0);
  const overageRetained = Math.max(cardPriceIncreaseCollected - feesDP, 0);

  // Legacy fields for compatibility
  const annualVolume = cc * 12;
  const dmpProfit = cardPriceIncreaseCollected - programCardFees;
  const skytabBonus = skytabBonusGross; // Use new calculation

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
    feeCollectedOnCash,
    // Gross Profit and Skytab bonus calculations
    grossProfit,
    skytabBonusGross,
    // UX-specific fields for neutral row display
    residualAfterMarkup,
    overageRetained
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
