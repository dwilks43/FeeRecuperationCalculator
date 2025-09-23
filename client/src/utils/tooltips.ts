// v1.6.1-tooltips-pro: Comprehensive tooltip system with enhanced explanations and UI micro formulas

export const UNIFIED_TOOLTIPS = {
  // Enhanced shared tooltips for common fields
  shared: {
    inputsBlock: {
      title: 'Inputs Block',
      body: 'Enter the merchant\'s real volumes and rates. Card volume should include tax & tip; we back out the base for the math.'
    },
    monthlyCardVolume: {
      title: 'Monthly Card Volume (Gross)',
      body: 'Total card sales per month (tax + tip included). We\'ll back out tax/tip to find the pre-tax base.'
    },
    monthlyCashVolume: {
      title: 'Monthly Cash Volume', 
      body: 'Total cash sales per month. Used for cash fee revenue in Supplemental Fee.'
    },
    currentRate: {
      title: 'Current Processing Rate',
      body: 'All-in rate with the current processor. Used to show today\'s processing cost for apples-to-apples savings.'
    },
    interchangeCost: {
      title: 'Interchange Cost',
      body: 'Estimated bank cost. Only used to show internal Gross Profit = (Flat Rate − Interchange) × Card Processed Total.'
    },
    taxRate: {
      title: 'Tax Rate',
      body: 'Sales tax rate used in the ticket math.'
    },
    tipRate: {
      title: 'Tip Rate', 
      body: 'Typical tip rate for this merchant.'
    },
    flatRate: {
      title: 'Flat Rate %',
      body: 'DMP processing rate. Auto-mapped from the differential/fee; you can override. Used for processor charge math.'
    },
    flatRateAutoBadge: {
      title: 'Auto Flat Rate',
      body: 'Auto-mapped from your differential/fee. Click to switch to Manual if underwriting requires a custom flat rate.'
    },
    flatRateManualBadge: {
      title: 'Manual Flat Rate',
      body: 'Manual override. Click "Reset to auto" to return to the mapped rate.'
    },
    grossProfit: {
      title: 'Gross Profit (Cards)',
      body: 'Internal only. Gross Profit (Cards) = (Flat Rate − Interchange) × Card Processed Total.'
    },
    processingCostSavingsPct: {
      title: 'Processing Cost Savings %',
      body: 'Processing Cost Savings % = Savings on Cards ÷ Current Processing Cost.'
    }
  },

  // Dual Pricing specific tooltips
  DUAL_PRICING: {
    orderOfOps: {
      title: 'Order of Operations',
      body: 'Order of Operations: Base Card Volume → +Price Differential → +Tax → +Tip (handwritten on presented total).'
    },
    derivedSection: {
      title: 'Derived Bases & Totals',
      body: 'Derived Bases & Totals: makes the ticket math transparent for the client.'
    },
    base: {
      title: 'Base Card Volume (pre-tax, pre-tip)',
      body: 'Base Card Volume (pre-tax, pre-tip) = Card Gross ÷ (1 + tax + tip). Why it matters: this is the real price before taxes/tips.'
    },
    priceAdjustedBase: {
      title: 'Price-Adjusted Base + Price Differential',
      body: 'Price-Adjusted Base + Price Differential = Base × (1 + price differential). This is the card price the customer sees before tax.'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Card Processed Total (incl. price differential, tax, and tip) = Price-Adjusted Base × (1 + tax) × (1 + tip). Example: $100 base, +4% diff → $104; +10% tax → $114.40; +20% tip → $137.28.'
    },
    processingSection: {
      title: 'Processing on Cards (New Program)',
      body: 'Processing on Cards (New Program): what the bank charges and what your markup covers.'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'Processor Charge on Cards = Card Processed Total × Flat Rate.'
    },
    markupCollected: {
      title: 'Card Price Increase Collected (Cards)',
      body: 'Card Price Increase Collected (Cards) = Base × price differential. This is the extra revenue you collect at the register.'
    },
    netChangeCards: {
      title: 'Processing Cost After Price Differential',
      body: 'Processing Cost After Price Differential = Processor Charge − Card Price Increase Collected. Think of it as "what\'s left to pay the processor."'
    },
    coveragePct: {
      title: 'Coverage %',
      body: 'Coverage % = Card Price Increase Collected ÷ Processor Charge. 100% means card price increase fully covers the processor charge.'
    },
    savingsSection: {
      title: 'Savings vs Today',
      body: 'Savings vs Today: side-by-side with the merchant\'s current costs.'
    },
    currentCost: {
      title: 'Current Processing Cost (Today)',
      body: 'Current Processing Cost (Today) = Card Gross × current rate.'
    },
    savingsCardsOnly: {
      title: 'Processing Cost Savings (Cards Only)',
      body: 'Processing Cost Savings (Cards Only) = Current Cost − Processing Cost After Price Differential.'
    },
    netMonthly: {
      title: 'Total Net Gain (Monthly)',
      body: 'Total Net Gain (Monthly). Same as savings on cards for Dual Pricing.'
    },
    netAnnual: {
      title: 'Annual Net Gain',
      body: 'Annual Net Gain = Monthly × 12.'
    },
    // Right rail specific tooltips
    rightRailCurrentCost: {
      title: 'Current Cost (Right Rail)',
      body: 'What the merchant pays today with their current processor.'
    },
    rightRailProcCharge: {
      title: 'Processor Charge (Right Rail)',
      body: 'Processor charge under the new Dual Pricing program.'
    },
    rightRailMarkupCollected: {
      title: 'Card Price Increase Collected (Right Rail)',
      body: 'Total card price increase collected from the price differential.'
    },
    rightRailNetChangeCards: {
      title: 'Net Change Cards (Right Rail)',
      body: 'Processor Cost After Price Differential: remaining processor cost after the markup offsets it.'
    },
    rightRailSavingsCardsOnly: {
      title: 'Savings Cards Only (Right Rail)',
      body: 'Savings on card processing compared to today.'
    },
    rightRailProcSavingsPct: {
      title: 'Proc Savings % (Right Rail)',
      body: 'Savings % vs today\'s processing cost.'
    },
    rightRailNetMonthly: {
      title: 'Net Monthly (Right Rail)',
      body: 'Total monthly impact.'
    },
    rightRailNetAnnual: {
      title: 'Net Annual (Right Rail)',
      body: 'Yearly impact at the same volumes.'
    }
  },

  // Supplemental Fee specific tooltips
  SUPPLEMENTAL_FEE: {
    modeIntro: {
      title: 'Supplemental Fee Mode',
      body: 'Supplemental Fee adds a line-item fee to all transactions (cards & cash). Timing/tax basis control the order of fee, tax, and tip.'
    },
    selectorsBlock: {
      title: 'Selectors Block',
      body: 'Choose how the merchant collects tips and where the fee applies for taxes.'
    },
    feeTiming: {
      title: 'Fee Timing',
      body: 'AFTER_TIP: Tip at time of sale: tip is part of the checkout total. BEFORE_TIP: Tip handwritten – post sale: tip is added after the card is processed.'
    },
    feeTimingAfterTip: {
      title: 'Fee Timing: After Tip',
      body: 'Tip at time of sale: tip is part of the checkout total.'
    },
    feeTimingBeforeTip: {
      title: 'Fee Timing: Before Tip',
      body: 'Tip handwritten – post sale: tip is added after the card is processed.'
    },
    feeTaxBasis: {
      title: 'Fee Tax Basis',
      body: 'POST_TAX: Apply fee to post-tax amount (fee is computed on the taxed amount). PRE_TAX: Apply fee to pre-tax amount (fee is computed before tax).'
    },
    feeTaxBasisPostTax: {
      title: 'Fee Tax Basis: Post Tax',
      body: 'Apply fee to post-tax amount (fee is computed on the taxed amount).'
    },
    feeTaxBasisPreTax: {
      title: 'Fee Tax Basis: Pre Tax',
      body: 'Apply fee to pre-tax amount (fee is computed before tax).'
    },
    // Combo captions for different timing/tax basis combinations
    comboAfterTipPostTax: {
      title: 'Order: After Tip + Post Tax',
      body: 'Order: Base → +Tax → +Tip → +Fee (fee on post-tax + tip). Example on $100 base, 10% tax, 20% tip, 4% fee → fee on $132.'
    },
    comboAfterTipPreTax: {
      title: 'Order: After Tip + Pre Tax',
      body: 'Order: Base → +Tip → +Fee (pre-tax) → +Tax (taxes the fee). Example fee on $120; tax then applies to the subtotal including fee.'
    },
    comboBeforeTipPostTax: {
      title: 'Order: Before Tip + Post Tax',
      body: 'Order: Base → +Tax → +Fee (post-tax) → +Tip. Fee is added before the handwritten tip.'
    },
    comboBeforeTipPreTax: {
      title: 'Order: Before Tip + Pre Tax',
      body: 'Order: Base → +Fee (pre-tax) → +Tax → +Tip. Fee is computed on the pre-tax amount.'
    },
    derivedSection: {
      title: 'Derived Bases & Totals',
      body: 'Derived Bases & Totals: shows the exact dollar bases for fee and tip given the selected timing & tax basis.'
    },
    base: {
      title: 'Base Card Volume (pre-tax, pre-tip)',
      body: 'Base Card Volume (pre-tax, pre-tip) = Card Gross ÷ (1 + tax + tip).'
    },
    feeEligibleVolumeCards: {
      title: 'Fee-Eligible Volume (Cards)',
      body: 'Fee-Eligible Volume (Cards): the dollar base the supplemental fee is applied to on cards (changes with timing/tax basis).'
    },
    tipEligibleVolumeCards: {
      title: 'Tip-Eligible Volume (Cards)',
      body: 'Tip-Eligible Volume (Cards): the dollar base the tip is applied to (changes with timing).'
    },
    supplementalFeeCards: {
      title: 'Supplemental Fee Collected — Cards',
      body: 'Supplemental Fee Collected — Cards = Fee-Eligible Volume (Cards) × fee %. This offsets the processor charge on card tickets.'
    },
    supplementalFeeCash: {
      title: 'Supplemental Fee Collected — Cash',
      body: 'Supplemental Fee Collected — Cash = Monthly Cash Volume × fee %. This is extra revenue from cash tickets.'
    },
    tipAmount: {
      title: 'Tip Amount',
      body: 'Tip Amount = Tip-Eligible Volume (Cards) × tip %. Shown to explain the card ticket math.'
    },
    processingSection: {
      title: 'Processing on Cards (New Program)',
      body: 'Processing on Cards (New Program): shows the new bank charge and how much the fee offsets.'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Card Processed Total (incl. fee, tax & tip). Built from the selected order of operations (see caption above).'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'Processor Charge on Cards = Card Processed Total × Flat Rate.'
    },
    netChangeCards: {
      title: 'Processing Cost After Price Differential',
      body: 'Processing Cost After Price Differential = Processor Charge − Fee Collected on Cards.'
    },
    coveragePct: {
      title: 'Coverage %',
      body: 'Coverage % = Fee Collected on Cards ÷ Processor Charge.'
    },
    savingsSection: {
      title: 'Savings vs Today',
      body: 'Savings vs Today: current cost versus the new program result.'
    },
    currentCost: {
      title: 'Current Processing Cost (Today)',
      body: 'Current Processing Cost (Today) = Card Gross × current rate.'
    },
    savingsCardsOnly: {
      title: 'Processing Cost Savings (Cards Only)',
      body: 'Processing Cost Savings (Cards Only) = Current Cost − Processing Cost After Price Differential.'
    },
    netMonthly: {
      title: 'Total Net Gain (Monthly)',
      body: 'Total Net Gain (Monthly) = Savings on cards + Fee collected on cash.'
    },
    netAnnual: {
      title: 'Annual Net Gain',
      body: 'Annual Net Gain = Monthly × 12.'
    },
    // Right rail specific tooltips
    rightRailCurrentCost: {
      title: 'Current Cost (Right Rail)',
      body: 'What the merchant pays today with their current processor.'
    },
    rightRailProcCharge: {
      title: 'Processor Charge (Right Rail)',
      body: 'Processor charge under the Supplemental Fee program.'
    },
    rightRailMarkupCollected: {
      title: 'Supplemental Fee Collected (Right Rail)',
      body: 'Supplemental fee collected on card tickets.'
    },
    rightRailRecovery: {
      title: 'Recovery (Right Rail)',
      body: 'Coverage Gap (info only) = Fee on Cards − Processor Charge.'
    },
    rightRailSavingsCardsOnly: {
      title: 'Savings Cards Only (Right Rail)',
      body: 'Savings on card processing compared to today.'
    },
    rightRailProcSavingsPct: {
      title: 'Proc Savings % (Right Rail)',
      body: 'Savings % vs today\'s processing cost.'
    },
    rightRailNetMonthly: {
      title: 'Net Monthly (Right Rail)',
      body: 'Total monthly impact (cards + cash fee).'
    },
    rightRailNetAnnual: {
      title: 'Net Annual (Right Rail)',
      body: 'Yearly impact at the same volumes.'
    }
  }
};

// UI Micro Formulas for quick reference
export const UI_MICRO_FORMULAS = {
  DUAL_PRICING: {
    derived: [
      'Base = Card Gross ÷ (1 + tax + tip)',
      'Price-Adjusted Base = Base × (1 + price differential)',
      'Processed = Price-Adjusted Base × (1 + tax) × (1 + tip)'
    ],
    processing: [
      'Processor = Processed × Flat Rate',
      'Markup (Cards) = Base × price differential',
      'After Price Differential = Processor − Markup (Cards)'
    ],
    savings: [
      'Current Cost = Card Gross × current rate',
      'Savings (Cards) = Current Cost − After Price Differential',
      'Annual = Monthly × 12'
    ]
  },
  SUPPLEMENTAL_FEE: {
    derived: [
      'Base = Card Gross ÷ (1 + tax + tip)',
      'Fee-Eligible/Tip-Eligible depend on timing & tax basis'
    ],
    processing: [
      'Processor = Processed × Flat Rate',
      'After Price Differential = Processor − Fee on Cards',
      'Coverage % = Fee on Cards ÷ Processor'
    ],
    savings: [
      'Current Cost = Card Gross × current rate',
      'Savings (Cards) = Current Cost − After Price Differential',
      'Net Monthly = Savings (Cards) + Fee on Cash',
      'Annual = Monthly × 12'
    ]
  }
};

// Helper function to get tooltip based on program type and key
export function getTooltip(key: string, programType?: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE') {
  // First check program-specific tooltips
  if (programType && UNIFIED_TOOLTIPS[programType]) {
    const programTooltips = UNIFIED_TOOLTIPS[programType] as Record<string, { title: string; body: string }>;
    if (programTooltips[key]) {
      return programTooltips[key];
    }
  }
  
  // Then check shared tooltips
  const sharedTooltips = UNIFIED_TOOLTIPS.shared as Record<string, { title: string; body: string }>;
  if (sharedTooltips[key]) {
    return sharedTooltips[key];
  }
  
  // Legacy fallback for backward compatibility
  const legacyTooltips = LEGACY_TOOLTIPS as Record<string, { title: string; body: string }>;
  return legacyTooltips[key] || null;
}

// Helper function to get micro formulas
export function getMicroFormulas(programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE', section?: 'derived' | 'processing' | 'savings') {
  const formulas = UI_MICRO_FORMULAS[programType];
  if (section && formulas[section]) {
    return formulas[section];
  }
  return formulas;
}

// Legacy tooltips for backward compatibility
const LEGACY_TOOLTIPS = {
  programType: {
    title: 'Program Type',
    body: 'Choose the pricing model to show the merchant. Dual Pricing raises card price only. Supplemental Fee adds a post-tax fee to card and cash.'
  },
  supplementalFee: {
    title: 'Supplemental Fee',
    body: 'Fee percentage shown to customers; collected on both card and cash transactions. Example: 4% fee.'
  },
  priceDifferential: {
    title: 'Price Differential',
    body: 'Customer-visible price increase for cards. Drives Auto flat-rate mapping.'
  },
  'flat-rate-pct': {
    title: 'Flat Rate % (Bank Mapping)',
    body: 'Processing rate applied to card processed total. Auto-calculated using Fee ÷ (1+Fee) formula with HALF_UP rounding to 2 decimals. The rounded value is used in all calculations.'
  },
  recovery: {
    title: 'Processing Cost after Price Differential',
    body: 'Coverage Gap = Markup − Processor (info only).'
  },
  skytabBonusGross: {
    title: 'Skytab Bonus Calculation (Gross)',
    body: 'Gross bonus estimate = Gross Profit × 18 months × 60%, capped at $10,000 maximum.'
  },
  skytabBonusRep: {
    title: 'Skytab Bonus Calculation (Rep 50%)',
    body: 'Rep share = Skytab Bonus (Gross) × 50%. Example: $10,000 × 50% = $5,000.'
  },
  'dmp-profit': {
    title: 'DMP Gross Profit',
    body: 'Monthly gross profit calculation used for internal DMP profitability analysis and bonus calculations.'
  }
};

// Export legacy TOOLTIPS object for backward compatibility
export const TOOLTIPS = {
  ...LEGACY_TOOLTIPS,
  // Map common fields to shared tooltips for compatibility
  monthlyCardVolume: UNIFIED_TOOLTIPS.shared.monthlyCardVolume,
  monthlyCashVolume: UNIFIED_TOOLTIPS.shared.monthlyCashVolume,
  currentRate: UNIFIED_TOOLTIPS.shared.currentRate,
  taxRate: UNIFIED_TOOLTIPS.shared.taxRate,
  tipRate: UNIFIED_TOOLTIPS.shared.tipRate,
  flatRate: UNIFIED_TOOLTIPS.shared.flatRate,
  grossProfit: UNIFIED_TOOLTIPS.shared.grossProfit,
  processingCostSavingsPct: UNIFIED_TOOLTIPS.shared.processingCostSavingsPct
};