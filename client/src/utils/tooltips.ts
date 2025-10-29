// v1.6.1-tooltips-pro: Comprehensive tooltip system with enhanced explanations and UI micro formulas

export const UNIFIED_TOOLTIPS = {
  // Enhanced shared tooltips for common fields
  shared: {
    inputsBlock: {
      title: 'Inputs Block',
      body: 'Enter the merchant\'s real volumes and rates. Card volume should include tax & tip; we back out the base for the math.'
    },
    monthlyCardVolume: {
      title: 'Monthly Credit Card Volume',
      body: 'Total amount processed through credit/debit cards each month.'
    },
    monthlyCashVolume: {
      title: 'Monthly Cash Volume', 
      body: 'Total cash payments received monthly. This affects revenue calculations in Cash Discounting and Supplemental Fee modes.'
    },
    currentRate: {
      title: 'Current Processing Rate',
      body: 'The effective rate percentage you currently pay for card processing. Example: Current Processing Rate = Total Fees ÷ Total Monthly Credit Card Volume. If you process $50,000 monthly in credit/debit cards and pay $1,250 in total fees, your Current Processing rate is 2.50% or Current Processing Rate = $1,250 ÷ $50,000'
    },
    interchangeCost: {
      title: 'Interchange Cost',
      body: 'The wholesale rate charged by card networks (Visa/Mastercard/Discover/Amex). This is your processor\'s base cost. Typically, 1.5-2.25%. Use the Interchange Calculator below to get an estimate based on industry type. See DMP staff for training on how to use this tool.'
    },
    taxRate: {
      title: 'Tax Rate',
      body: 'Sales tax percentage paid by merchant. This should be inclusive of ALL sales tax (ie. State, Local, Municipal).'
    },
    tipRate: {
      title: 'Average Tip %', 
      body: 'Average tip percentage customers leave over time.'
    },
    flatRate: {
      title: 'Flat Rate %',
      body: 'Your new processing rate under the Fee Recuperation Program. Auto-calculated or manually entered. The auto-calculation is required for Shift4/SkyTab. For all other providers, this can be manually changed on a case-by-case.'
    },
    flatRateAutoBadge: {
      title: 'Auto (Flat Rate toggle)',
      body: 'Automatically calculates optimal flat rate. Turn off to enter a custom rate.'
    },
    flatRateManualBadge: {
      title: 'Manual Flat Rate',
      body: 'Manual override. Click "Reset to auto" to return to the mapped rate.'
    },
    businessType: {
      title: 'Business Type',
      body: 'Restaurant/QSR includes tip calculations. Retail excludes tips from all calculations.'
    },
    viewHideCalculationDetails: {
      title: 'View/Hide (Calculation Details)',
      body: 'Expand to see complete mathematical breakdown of all calculations.'
    },
    grossProfit: {
      title: 'Gross Profit (Cards)',
      body: 'Monthly gross profit to processor. Formula: Card Total × (Flat Rate % − Interchange %)'
    },
    processingCostSavingsPct: {
      title: 'Cost Reduction %',
      body: 'Percentage of current costs eliminated for this category. Over 100% means you\'re profiting from the program.'
    }
  },

  // Dual Pricing specific tooltips
  DUAL_PRICING: {
    priceDifferential: {
      title: 'Price Differential',
      body: 'Percentage added to card transactions only. Example: 3.5% means a $100 purchase becomes $103.50 for card users.'
    },
    orderOfOps: {
      title: 'Order of Operations',
      body: 'The mathematical sequence of how prices, fees, taxes, and tips are calculated'
    },
    derivedSection: {
      title: 'Derived Bases & Totals',
      body: 'Derived Bases & Totals: makes the ticket math transparent for the client.'
    },
    base: {
      title: 'Base Card Volume',
      body: 'Your actual card sales before tax, tip, and any fees. This is the foundation for all calculations.'
    },
    priceAdjustedBase: {
      title: 'Base Card Volume + Price Differential',
      body: 'Menu price shown to card users. Formula: Base Card Volume × (1 + Price Differential %)'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Final amount processed including all increases. Formula: Base Card Volume + Price Differential × (1 + Tax %) × (1 + Tip %)'
    },
    processingSection: {
      title: 'Processing on Cards (New Program)',
      body: 'Processing on Cards (New Program): what the bank charges and what your markup covers.'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'What your processor charges under new program. Formula: Card Processed Total × Flat Rate %'
    },
    markupCollected: {
      title: 'Card Price Increase Collected (Dual Pricing)',
      body: 'Revenue collected from the price differential on card transactions. Formula: Base Volume × Price Differential %'
    },
    netChangeCards: {
      title: 'Processing Cost after Price Differential',
      body: 'Net cost after collecting price differential. Negative = profit. Formula: Processor Charge − Card Price Increase Collected'
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
      title: 'Processing Cost Savings',
      body: 'Monthly savings on card processing. Formula: Current Processing Cost − Processing Cost after Price Differential'
    },
    netMonthly: {
      title: 'Total Net Monthly Gain',
      body: 'Complete monthly benefit including processing savings and additional revenue from fees.'
    },
    netAnnual: {
      title: 'Annual Impact',
      body: 'Your total yearly savings. Simply your monthly gain × 12.'
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

  // Cash Discounting specific tooltips 
  CASH_DISCOUNTING: {
    orderOfOps: {
      title: 'Order of Operations',
      body: 'The mathematical sequence of how prices, fees, taxes, and tips are calculated'
    },
    cashDiscount: {
      title: 'Cash Discount %',
      body: 'Discount given to cash-paying customers off the marked-up price. Example: 3% discount on a $10.40 menu price = $10.09 final price.'
    },
    menuMarkup: {
      title: 'Menu Markup %',
      body: 'Percentage added to all displayed prices. Example: 4% markup means a $10 item shows as $10.40 on the menu. This increase is applied to ALL tenders including card AND cash.'
    },
    baseCardVolumeMarkup: {
      title: 'Base Card Volume + Menu Markup',
      body: 'Base Card Volume × (1 + Menu Markup %)'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Final card amount processed including menu markup, tax, and tip. Formula: (Base Card Volume + Menu Markup) × (1 + Tax %) × (1 + Tip %)'
    },
    extraCashRevenue: {
      title: 'Revenue from Cash Differential',
      body: 'Net revenue from cash pricing strategy. Formula: Base Cash Volume × (Menu Markup % − Cash Discount %)'
    },
    netMonthly: {
      title: 'Total Net Gain (Monthly)',
      body: 'Complete monthly benefit. Formula: Processing Cost Savings + Revenue from Cash Differential'
    },
    // Cash Discounting Calculation Details tooltips
    processingAfterMarkup: {
      title: 'Processing Cost After Menu Markup',
      body: 'Processor Charge − Card Price Increase Collected'
    },
    savingsCardsOnlyCash: {
      title: 'Processing Cost Savings (Cards Only)',
      body: 'Current Cost − Net Change Cards'
    },
    cashRevenueDiff: {
      title: 'Revenue from Cash Differential',
      body: 'Cash Base × (Price Differential − Cash Discount %)'
    },
    totalNetGainCash: {
      title: 'Total Net Gain (Monthly)',
      body: 'Processing Cost Savings + Revenue from Cash'
    },
    annualNetGainCash: {
      title: 'Annual Net Gain',
      body: 'Total Monthly Gain × 12'
    },
    totalCostReductionCash: {
      title: 'Total Cost Reduction %',
      body: 'Total Savings (incl. Cash) ÷ Current Cost'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'What your processor charges under new program. Formula: Card Processed Total × Flat Rate %'
    },
    currentCost: {
      title: 'Current Processing Cost (Today)',
      body: 'Current Processing Cost (Today) = Card Gross × current rate.'
    },
    markupOnCash: {
      title: 'Base Cash Volume + Menu Markup',
      body: 'The cash volume after applying the menu markup to the menu prices. Cash customers see marked-up prices but receive a discount at the register.'
    },
    cashDiscountApplied: {
      title: 'Cash Discount Applied',
      body: 'The total dollar amount of discounts given to cash customers. Calculated as the cash discount percentage multiplied by the marked-up cash volume.'
    },
    netCashBase: {
      title: 'Net Cash Base (after discount)',
      body: 'The actual cash amount collected after applying the cash discount. This is what cash customers actually pay after receiving their discount.'
    },
    cashProcessedTotal: {
      title: 'Cash Processed Total',
      body: 'The total cash amount including the net base after discount, plus any applicable taxes and tips. This is the final amount collected from cash transactions.'
    },
    markupCollected: {
      title: 'Card Menu Markup Collected',
      body: 'The additional revenue collected from card transactions due to menu markup. Calculated as Card Volume × Menu Markup %.'
    },
    recovery: {
      title: 'Processing Cost after Menu Markup',
      body: 'The remaining processing cost after the menu markup offsets some of it. Calculated as Processor Charge − Card Menu Markup Collected.'
    },
    processingCostSavingsPct: {
      title: 'Total Cost Reduction %',
      body: 'Percentage of current processing costs eliminated through the menu markup strategy. Can exceed 100% when markup collection exceeds processing costs.'
    },
    netChangeCards: {
      title: 'Processing After Menu Markup',
      body: 'The processing cost remaining after menu markup revenue offsets it. When negative (shown in green), you\'re profiting from the markup. Calculated as Processor Charge − Card Menu Markup Collected.'
    }
  },

  // Supplemental Fee specific tooltips
  SUPPLEMENTAL_FEE: {
    supplementalFee: {
      title: 'Supplemental Fee %',
      body: 'Fee charged on ALL transactions, disclosed at checkout, and cannot be waived/removed based on tender type. Example: 3.75% fee on a $100 purchase adds $3.75.'
    },
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
      body: 'When the fee is applied relative to tips. Before Tip: Customer tips on amount including fee. After Tip: Fee added after tip calculation.'
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
      title: 'Tax Basis',
      body: 'When the fee is applied relative to sales tax. Pre-tax: Fee added before tax calculation. Post-tax: Fee added after tax.'
    },
    feeTaxBasisPostTax: {
      title: 'Fee Tax Basis: Post Tax',
      body: 'Apply fee to post-tax amount (fee is computed on the taxed amount).'
    },
    feeTaxBasisPreTax: {
      title: 'Fee Tax Basis: Pre Tax',
      body: 'Apply fee to pre-tax amount (fee is computed before tax).'
    },
    totalNetGainRevenue: {
      title: 'Net Monthly',
      body: 'Total monthly gain from supplemental fee program. Includes both savings on card processing costs and revenue from fees collected on cash transactions.'
    },
    annualNetGainRevenue: {
      title: 'Net Annual',
      body: 'Total yearly gain from supplemental fee program. Calculated as Net Monthly × 12.'
    },
    totalCostReduction: {
      title: 'Total Cost Reduction %',
      body: 'Percentage of current processing costs eliminated through the supplemental fee program. Can exceed 100% when the program generates profit beyond cost coverage.'
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
      body: 'Amount of card volume the fee applies to, varies by settings. Changes based on tax/tip timing selections.'
    },
    tipEligibleVolumeCards: {
      title: 'Tip-Eligible Volume (Cards)',
      body: 'Amount of card volume that tips are calculated on. Varies based on fee timing setting.'
    },
    supplementalFeeCards: {
      title: 'Supplemental Fee Collected',
      body: 'Total fees collected from both card and cash transactions at your set percentage.'
    },
    supplementalFeeCash: {
      title: 'Supplemental Fee Collected — Cash',
      body: 'Total fees collected from both card and cash transactions at your set percentage.'
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
      title: 'Processor Charge',
      body: 'Processing fees on cards. Formula: Card Processed Total (after fee, tip, & tax)× Flat Rate %'
    },
    netChangeCards: {
      title: 'Processing Cost after Supplemental Fee',
      body: 'Net position after fee collection. Negative = profit. Formula: Processor Charge − Fee Collected'
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
      body: 'Card savings vs current rate. Formula: Current Processing Cost − Processing Cost after Supplemental Fee'
    },
    netMonthly: {
      title: 'Total Net Monthly Gain',
      body: 'Complete monthly benefit including processing savings and additional revenue from fees.'
    },
    netAnnual: {
      title: 'Annual Impact',
      body: 'Your total yearly savings. Simply your monthly gain × 12.'
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
  },
  CASH_DISCOUNTING: {
    derived: [
      'Base = Card Gross ÷ (1 + tax + tip)',
      'Menu Markup applies to all prices',
      'Cash Discount offered at register'
    ],
    processing: [
      'Processor = Processed × Flat Rate',
      'Markup (Cards) = Base × price differential',
      'After Price Differential = Processor − Markup (Cards)'
    ],
    savings: [
      'Current Cost = Card Gross × current rate',
      'Cash Revenue = Cash Base × (Menu Markup − Cash Discount)',
      'Net Monthly = Card Savings + Cash Revenue',
      'Annual = Monthly × 12'
    ]
  }
};

// Helper function to get tooltip based on program type and key
export function getTooltip(key: string, programType?: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE' | 'CASH_DISCOUNTING') {
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
    body: 'Choose your pricing strategy. Dual Pricing: Card price higher than cash. Cash Discounting: Menu prices elevated, cash gets discount. Supplemental Fee: Transparent fee added to all transactions.'
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
    title: 'Skytab Bonus (Gross)',
    body: 'Gross bonus for Skytab deals. Formula: Gross Profit × 18 months × 60%, max $10,000'
  },
  skytabBonusRep: {
    title: 'Rep Share',
    body: 'Sales rep commission portion. Formula: Skytab Bonus × 50%'
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
  processingCostSavingsPct: UNIFIED_TOOLTIPS.shared.processingCostSavingsPct,
  'cash-discount': UNIFIED_TOOLTIPS.CASH_DISCOUNTING.cashDiscount
};