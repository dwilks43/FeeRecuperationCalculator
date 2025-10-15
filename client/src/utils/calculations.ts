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
 * HALF_UP rounding function (v1.0.1-patch-roundedFlatRate)
 */
export function roundHalfUp(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate auto flat rate with HALF_UP rounding to 4 decimals (updated spec)
 * Capped at 4.00% maximum
 */
export function calculateAutoFlatRate(fee: number): number {
  if (fee <= 0) return 0;
  const calculated = fee / (1 + fee);
  const capped = Math.min(calculated, 0.04); // Cap at 4%
  return roundHalfUp(capped, 4);
}

/**
 * Calculate all results from inputs
 */
export function calculateResults(inputs: CalculatorInputs): CalculatorResults {
  if (inputs.programType === 'SUPPLEMENTAL_FEE') {
    return calculateSupplementalFeeResults(inputs);
  } else if (inputs.programType === 'CASH_DISCOUNTING') {
    return calculateCashDiscountingResults(inputs);
  }
  return calculateDualPricingResults(inputs);
}

function calculateSupplementalFeeResults(inputs: CalculatorInputs): CalculatorResults {
  // v1.0.1 - New input model with Gross Cards and combo-based calculations
  const grossCards = inputs.monthlyVolume || 0;  // Monthly Card Volume (Gross)
  const cashVol = inputs.monthlyCashVolume || 0;
  const currRate = (inputs.currentRate || 0) / 100;
  const interchange = (inputs.interchangeCost || 0) / 100;
  const tax = (inputs.taxRate || 0) / 100;
  const tip = (inputs.tipRate || 0) / 100;
  const fee = (inputs.priceDifferential || 0) / 100;  // Supplemental Fee %
  
  // Flat Rate logic with auto-calculation and override support (v1.0.1-patch-roundedFlatRate)
  const flatRateAuto = calculateAutoFlatRate(fee);
  const flatRate = inputs.flatRateOverride !== undefined ? 
    inputs.flatRateOverride / 100 : 
    (inputs.flatRatePct !== undefined ? inputs.flatRatePct / 100 : flatRateAuto);

  // New v1.0.1 timing approach - map legacy to new types
  const tipTiming = inputs.tipTiming || 
    (inputs.feeTiming === 'FEE_BEFORE_TIP' ? 'BEFORE_TIP' : 'AFTER_TIP');
  const feeTaxBasis = inputs.feeTaxBasis || 'POST_TAX';

  // Build combo key for formula selection
  const comboKey = `${tipTiming}__${feeTaxBasis}`;

  // Order of operations display text
  const orderOfOperationsMap: Record<string, string> = {
    'BEFORE_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Supplemental Fee → +Tip',
    'BEFORE_TIP__PRE_TAX': 'Pre-Tax Base → +Supplemental Fee → +Tax → +Tip',
    'AFTER_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Tip → +Supplemental Fee',
    'AFTER_TIP__PRE_TAX': 'Pre-Tax Base → +Tip → +Fee → +Tax'
  };

  // Shared pre-calculations (always Gross input model)
  const base = grossCards / (1 + tax + tip);
  const postTaxPreTip = base * (1 + tax);

  // Combo-specific calculations
  let feeBaseCards: number;
  let supplementalFeeCards: number;
  let tipBase: number;
  let tipAmount: number;
  let cardsProcessed: number;

  switch (comboKey) {
    case 'BEFORE_TIP__POST_TAX':
      feeBaseCards = postTaxPreTip;
      supplementalFeeCards = feeBaseCards * fee;
      tipBase = postTaxPreTip * (1 + fee);
      tipAmount = tipBase * tip;
      cardsProcessed = postTaxPreTip * (1 + fee) * (1 + tip);
      break;

    case 'BEFORE_TIP__PRE_TAX':
      feeBaseCards = base;
      supplementalFeeCards = feeBaseCards * fee;
      tipBase = base * (1 + fee) * (1 + tax);
      tipAmount = tipBase * tip;
      cardsProcessed = base * (1 + fee) * (1 + tax) * (1 + tip);
      break;

    case 'AFTER_TIP__POST_TAX':
      feeBaseCards = postTaxPreTip * (1 + tip);
      supplementalFeeCards = feeBaseCards * fee;
      tipBase = postTaxPreTip;
      tipAmount = tipBase * tip;
      cardsProcessed = postTaxPreTip * (1 + tip) * (1 + fee);
      break;

    case 'AFTER_TIP__PRE_TAX':
      feeBaseCards = base * (1 + tip);
      supplementalFeeCards = feeBaseCards * fee;
      tipBase = base;
      tipAmount = tipBase * tip;
      cardsProcessed = base * (1 + tax) * (1 + tip) * (1 + fee);
      break;

    default:
      // Fallback to BEFORE_TIP__POST_TAX
      feeBaseCards = postTaxPreTip;
      supplementalFeeCards = feeBaseCards * fee;
      tipBase = postTaxPreTip * (1 + fee);
      tipAmount = tipBase * tip;
      cardsProcessed = postTaxPreTip * (1 + fee) * (1 + tip);
  }

  // Processor charges and recovery
  const procCharge = cardsProcessed * flatRate;
  const recovery = supplementalFeeCards - procCharge;
  const coveragePct = procCharge === 0 ? 0 : supplementalFeeCards / procCharge;

  // New calculations per specification
  const netChangeCards = procCharge - supplementalFeeCards;
  
  // Savings calculations
  const currentCost = grossCards * currRate;
  const savingsCardsOnly = currentCost - netChangeCards;
  const procSavingsPct = currentCost === 0 ? 0 : savingsCardsOnly / currentCost;
  const supplementalFeeCash = cashVol * fee;
  const netMonthly = savingsCardsOnly + supplementalFeeCash;
  const netAnnual = netMonthly * 12;

  // Gross profit calculation
  const grossProfit = (flatRate - interchange) * cardsProcessed;

  // Skytab bonus calculations
  const skytabBonusGross = Math.min(grossProfit * SKYTAB_BONUS_MULT * SKYTAB_BONUS_SPLIT, SKYTAB_BONUS_CAP);
  const skytabBonusRep = skytabBonusGross * SKYTAB_REP_SPLIT;

  // Legacy field compatibility
  const collectedValue = supplementalFeeCards + supplementalFeeCash;
  const processingCostSavingsOnly = savingsCardsOnly;
  const processingCostSavingsPct = currentCost > 0 ? processingCostSavingsOnly / currentCost : 0;
  
  return {
    // Legacy compatibility fields
    baseVolume: base,
    markedUpVolume: base,
    adjustedVolume: base,
    markupCollected: collectedValue,
    processingFees: procCharge,
    currentCost,
    newCost: Math.max(procCharge - supplementalFeeCards, 0),
    processingSavings: processingCostSavingsOnly,
    extraRevenueCash: supplementalFeeCash,
    monthlySavings: netMonthly,
    annualSavings: netAnnual,
    annualVolume: (base + cashVol) * 12,
    dmpProfit: 0,
    skytabBonus: 0,
    skytabBonusRep,
    collectedLabel: 'Supplemental Fee Collected',
    collectedValue,
    derivedFlatRate: flatRateAuto,
    tipAssumptionNote: tipTiming === 'AFTER_TIP' ? 'Tip at Time of Sale' : 'Tip Handwritten – Post Sale',
    
    // Display fields
    cardFeeCollected: supplementalFeeCards,
    cashFeeCollected: supplementalFeeCash,
    cardProcessedTotal: cardsProcessed,
    processorChargeOnCards: procCharge,
    netCostForProcessingCards: recovery,
    baseVolumePreTaxPreTip: base,
    baseVolumeTaxedPreTip: postTaxPreTip,
    processingCostSavingsOnly,
    processingCostSavingsPct,
    totalNetGainRevenue: netMonthly,
    annualNetGainRevenue: netAnnual,
    grossProfit,
    skytabBonusGross,
    
    // Canonical fields
    programCardFees: procCharge,
    feeCollectedOnCards: supplementalFeeCards,
    feeCollectedOnCash: supplementalFeeCash,
    
    // v1.0.1 new fields
    feeBaseCards,
    tipBase,
    tipAmount,
    recovery,
    coveragePct,
    savingsCardsOnly,
    procSavingsPct,
    supplementalFeeCash,
    netChangeCards,
    comboKey,
    orderOfOperations: orderOfOperationsMap[comboKey] || '',
    
    // Legacy residual/overage handling
    residualCardCost: Math.max(procCharge - supplementalFeeCards, 0),
    cardProgramProfit: Math.max(supplementalFeeCards - procCharge, 0),
    tipAdjustmentResidual: 0
  };
}

function calculateDualPricingResults(inputs: CalculatorInputs): CalculatorResults {
  // Read inputs
  const cc   = inputs.monthlyVolume || 0;           // monthly card volume (current world)
  const tax  = (inputs.taxRate || 0) / 100;
  const tip  = (inputs.tipRate || 0) / 100;
  const pd   = (inputs.priceDifferential || 0) / 100;
  // Use flatRatePct (Bank Mapping) field, with fallback for legacy
  const fr = inputs.flatRatePct !== undefined ? 
    inputs.flatRatePct / 100 : 
    (inputs.flatRate || 0) / 100;     // what DMP charges merchant under DP
  const curr = (inputs.currentRate || 0) / 100;

  // 1) Base Card Volume (pre-tax, pre-tip) - v1.5.0 aligned terminology
  const base = cc / (1 + tax + tip);

  // 2) v1.5.0: Price-Adjusted Base (pre-tax, pre-tip) = Base × (1 + Price Differential) 
  const priceAdjustedBase = base * (1 + pd);

  // 3) v1.5.2: Card Processed Total = Price-Adjusted Base × (1 + Tax) × (1 + Tip) - handwritten after tax
  const processed = priceAdjustedBase * (1 + tax) * (1 + tip);
  const adjustedCardVolume = processed; // legacy alias

  // 4) Processor Charge on Cards = Card Processed Total × Flat Rate
  const procCharge = processed * fr;
  const programCardFees = procCharge; // legacy alias

  // 5) v1.5.0: Card Price Increase Collected = Base × Price Differential
  const markupCollected = base * pd;
  const cardPriceIncreaseCollected = markupCollected; // legacy alias

  // 6) Current Processing Cost (Today)
  const currentCost = cc * curr;

  // 7) v1.5.0: Processing Cost after Price Differential
  const recovery = markupCollected - procCharge; // can be negative
  const netCostForProcessingCards = -recovery; // legacy alias (sign flipped)

  // 8) v1.5.0: Net Change in Card Processing = Processor Charge − Markup
  const netChangeCards = procCharge - markupCollected;

  // 9) v1.5.1: Processing Cost Savings (Cards Only) - with proper rounding
  const savingsCardsOnlyRaw = currentCost - netChangeCards;
  const savingsCardsOnly = roundHalfUp(savingsCardsOnlyRaw, 2);

  // 10) v1.5.0: Processing Cost Savings % = Savings ÷ Current Cost
  const procSavingsPct = currentCost === 0 ? 0 : savingsCardsOnly / currentCost;

  // 11) v1.5.0: Coverage % = Markup ÷ Processor Charge
  const coveragePct = procCharge === 0 ? 0 : markupCollected / procCharge;

  // 12) v1.5.1: Total Net Gain - use raw for annual calculation, then round
  const netMonthly = savingsCardsOnly; 
  const netAnnual = roundHalfUp(savingsCardsOnlyRaw * 12, 2);
  const monthlySavings = netMonthly; // legacy alias
  const annualSavings = netAnnual; // legacy alias
  
  const feeCollectedOnCash = 0; // DP/CD has no cash fee

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
    // v1.5.1: New DP-aligned field structure with proper rounding
    base,                         // Base Card Volume (pre-tax, pre-tip)
    priceAdjustedBase,           // Price-Adjusted Base (pre-tax, pre-tip) 
    processed,                   // Card Processed Total
    procCharge,                  // Processor Charge on Cards
    markupCollected,            // Card Price Increase Collected (Cards)
    recovery,                    // Processing Cost after Price Differential
    coveragePct,                // Coverage %
    currentCost,                // Current Processing Cost (Today)
    netChangeCards,             // Net Change in Card Processing
    savingsCardsOnlyRaw,        // Processing Cost Savings (Raw, unrounded)
    savingsCardsOnly,           // Processing Cost Savings (Cards Only)
    procSavingsPct,             // Processing Cost Savings %
    netMonthly,                 // Total Net Gain (Monthly)
    netAnnual,                  // Annual Net Gain
    derivedFlatRate: fr,        // Flat Rate % used in calculations
    
    // Legacy aliases for backward compatibility
    baseVolume: base,
    adjustedVolume: processed,
    adjustedCardVolume: processed,
    cardPriceIncreaseCollected: markupCollected,
    processingFees: procCharge,
    programCardFees: procCharge,
    newCost: procCharge,
    monthlySavings: netMonthly,
    annualSavings: netAnnual,
    markedUpVolume: base + markupCollected,
    netCostForProcessingCards,
    feeCollectedOnCards: markupCollected,
    feeCollectedOnCash,
    
    // Labels and display
    collectedLabel: 'Card Price Increase Collected',
    collectedValue: markupCollected,
    
    // Gross Profit and Skytab calculations
    grossProfit,
    skytabBonus: skytabBonusGross,
    skytabBonusGross,
    skytabBonusRep,
    
    // Legacy fields
    annualVolume,
    dmpProfit: recovery,
    residualAfterMarkup,
    overageRetained
  };
}

/**
 * Calculate results for Cash Discounting program
 */
function calculateCashDiscountingResults(inputs: CalculatorInputs): CalculatorResults {
  // Read inputs
  const cc = inputs.monthlyVolume || 0;           // monthly card volume (gross)
  const cashVol = inputs.monthlyCashVolume || 0;  // monthly cash volume
  const tax = (inputs.taxRate || 0) / 100;
  const tip = (inputs.tipRate || 0) / 100;
  const pd = (inputs.priceDifferential || 0) / 100;  // menu markup %
  const cd = (inputs.cashDiscount || 0) / 100;       // cash discount %
  const fr = inputs.flatRatePct !== undefined ? 
    inputs.flatRatePct / 100 : 
    (inputs.flatRate || 0) / 100;
  const curr = (inputs.currentRate || 0) / 100;

  // CARDS CALCULATIONS
  // 1) Base Card Volume (pre-tax, pre-tip)
  const base = cc / (1 + tax + tip);

  // 2) Price-Adjusted Base (menu price for cards)
  const priceAdjustedBase = base * (1 + pd);

  // 3) Card Processed Total = Price-Adjusted Base × (1 + Tax) × (1 + Tip)
  const processed = priceAdjustedBase * (1 + tax) * (1 + tip);

  // 4) Processor Charge on Cards
  const procCharge = processed * fr;

  // 5) Card Price Increase Collected = Base × Price Differential
  const markupCollected = base * pd;

  // CASH CALCULATIONS
  // 6) Base Cash Volume (pre-tax, pre-tip)
  const baseCashVolume = cashVol / (1 + tax + tip);

  // 7) Menu-Priced Cash Base (cash sees menu price too)
  const menuPricedCashBase = baseCashVolume * (1 + pd);

  // 8) Cash Discount Given (applied to menu-priced amount)
  const cashDiscountGiven = menuPricedCashBase * cd;

  // 9) Net Cash Base (after discount)
  const netCashBase = menuPricedCashBase - cashDiscountGiven;
  // Or: baseCashVolume × (1 + pd) × (1 - cd)

  // 10) Cash Processed Total (with tax and tip on net amount)
  const cashProcessedTotal = netCashBase * (1 + tax) * (1 + tip);

  // 11) Extra Revenue from Cash (the differential kept by merchant)
  // This is the actual markup collected minus the discount given
  const menuMarkupOnCash = baseCashVolume * pd;  // What merchant adds to cash prices
  const extraCashRevenue = menuMarkupOnCash - cashDiscountGiven;  // Net revenue after giving discount
  // This can be negative if discount exceeds markup!

  // PROCESSING COST CALCULATIONS
  // 12) Current Processing Cost
  const currentCost = cc * curr;

  // 13) Processing Cost after Price Differential (cards)
  const recovery = markupCollected - procCharge;
  const netChangeCards = procCharge - markupCollected;

  // 14) Processing Cost Savings (Cards Only)
  const savingsCardsOnlyRaw = currentCost - netChangeCards;
  const savingsCardsOnly = roundHalfUp(savingsCardsOnlyRaw, 2);

  // 15) Total Net Gain (includes cash revenue)
  const netMonthly = savingsCardsOnly + extraCashRevenue;
  const netAnnual = roundHalfUp((savingsCardsOnlyRaw + extraCashRevenue) * 12, 2);

  // 16) Coverage % = Markup ÷ Processor Charge
  const coveragePct = procCharge === 0 ? 0 : markupCollected / procCharge;

  // 17) Processing Savings %
  const procSavingsPct = currentCost === 0 ? 0 : savingsCardsOnly / currentCost;

  // Gross Profit calculation
  const interchangeRate = (inputs.interchangeCost || 0) / 100;
  const grossProfit = (fr - interchangeRate) * processed;
  
  // Skytab bonus calculations
  const skytabBonusGross = Math.min(grossProfit * SKYTAB_BONUS_MULT * SKYTAB_BONUS_SPLIT, SKYTAB_BONUS_CAP);
  const skytabBonusRep = skytabBonusGross * SKYTAB_REP_SPLIT;

  // Legacy compatibility fields
  const annualVolume = cc * 12;
  const residualAfterMarkup = Math.max(procCharge - markupCollected, 0);
  const overageRetained = Math.max(markupCollected - procCharge, 0);

  return {
    // Core Card fields (matching Dual Pricing)
    base,
    priceAdjustedBase,
    processed,
    procCharge,
    markupCollected,
    recovery,
    coveragePct,
    currentCost,
    netChangeCards,
    savingsCardsOnlyRaw,
    savingsCardsOnly,
    procSavingsPct,
    netMonthly,
    netAnnual,
    derivedFlatRate: fr,
    
    // Cash Discounting specific fields
    baseCashVolume,
    menuPricedCashBase,
    cashDiscountGiven,
    netCashBase,
    cashProcessedTotal,
    extraCashRevenue,
    
    // Legacy aliases for compatibility
    baseVolume: base,
    adjustedVolume: processed,
    adjustedCardVolume: processed,
    cardPriceIncreaseCollected: markupCollected,
    processingFees: procCharge,
    programCardFees: procCharge,
    newCost: procCharge,
    monthlySavings: netMonthly,
    annualSavings: netAnnual,
    markedUpVolume: base + markupCollected,
    netCostForProcessingCards: -recovery,
    feeCollectedOnCards: markupCollected,
    feeCollectedOnCash: extraCashRevenue,
    
    // Labels and display
    collectedLabel: 'Revenue Collected',
    collectedValue: markupCollected + extraCashRevenue,
    
    // Gross Profit and Skytab
    grossProfit,
    skytabBonus: skytabBonusGross,
    skytabBonusGross,
    skytabBonusRep,
    
    // Legacy fields
    annualVolume,
    dmpProfit: recovery,
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
