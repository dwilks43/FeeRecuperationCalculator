// v1.6.0-tooltips-unified: New unified tooltip system supporting program-specific explanations

export const UNIFIED_TOOLTIPS = {
  // Shared tooltips for common fields
  shared: {
    monthlyCardVolume: {
      title: 'Monthly Card Volume (Gross)',
      body: 'Your total monthly card sales INCLUDING tax & tip.'
    },
    monthlyCashVolume: {
      title: 'Monthly Cash Volume', 
      body: 'Your total monthly cash sales. Used for cash fee math in Supplemental Fee.'
    },
    currentRate: {
      title: 'Current Processing Rate',
      body: 'What the current processor charges on card volume (all-in).'
    },
    interchangeCost: {
      title: 'Interchange Cost',
      body: 'Estimated bank cost. Used only to show Gross Profit = (Flat Rate − Interchange) × Card Processed Total.'
    },
    taxRate: {
      title: 'Tax Rate',
      body: 'Sales tax rate used in ticket math.'
    },
    tipRate: {
      title: 'Tip Rate', 
      body: 'Typical tip rate used in ticket math.'
    },
    flatRate: {
      title: 'Flat Rate %',
      body: 'Flat Rate % charged by DMP. Auto = mapping from Price Differential / Supplemental Fee. You can switch to Manual.'
    },
    flatRateAutoBadge: {
      title: 'Auto Flat Rate',
      body: 'Auto-calculated from your differential/fee. Click to override if needed.'
    },
    flatRateManualBadge: {
      title: 'Manual Flat Rate',
      body: 'You entered this rate manually. Click Reset to return to Auto.'
    },
    coveragePct: {
      title: 'Coverage %',
      body: 'How much the markup or fee covers of the processor charge: Coverage % = Markup ÷ Processor.'
    },
    grossProfit: {
      title: 'Gross Profit (Cards)',
      body: 'Gross Profit (Cards) = (Flat Rate − Interchange) × Card Processed Total.'
    },
    processingCostSavingsPct: {
      title: 'Processing Cost Savings %',
      body: 'Percent savings on processing cost vs today: Savings ÷ Current Cost.'
    }
  },

  // Dual Pricing specific tooltips
  DUAL_PRICING: {
    orderOfOps: {
      title: 'Order of Operations',
      body: 'Base Card Volume → +Price Differential → +Tax → +Tip (handwritten).'
    },
    base: {
      title: 'Base Card Volume (pre-tax, pre-tip)',
      body: 'Base Card Volume (pre-tax, pre-tip) = Card Gross ÷ (1 + tax + tip).'
    },
    priceAdjustedBase: {
      title: 'Base Card Volume + Price Differential',
      body: 'Price-Adjusted Base + Price Differential = Base × (1 + price diff).'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Card Processed Total (incl. price diff, tax & tip) = Price-Adjusted Base × (1 + tax) × (1 + tip).'
    },
    markupCollected: {
      title: 'Markup Collected — Cards (price differential)',
      body: 'Markup Collected — Cards (price differential) = Base × price diff.'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'Processor Charge on Cards = Card Processed Total × Flat Rate.'
    },
    netChangeCards: {
      title: 'Processing Cost After Price Differential',
      body: 'Processing Cost After Price Differential = Processor Charge − Markup Collected.'
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
    rightRailNote: {
      title: 'Right Panel Note',
      body: 'Right panel mirrors these numbers exactly—no extra math.'
    }
  },

  // Supplemental Fee specific tooltips
  SUPPLEMENTAL_FEE: {
    modeNote: {
      title: 'Supplemental Fee Mode',
      body: 'A supplemental fee is added to ALL transactions (cards & cash). Fee/tax/tip order depends on options below.'
    },
    feeTiming: {
      title: 'Fee Timing',
      body: 'AFTER_TIP: Tip at time of sale: tip is part of the ticket at checkout. BEFORE_TIP: Tip handwritten – post sale: tip is added after the card is processed.'
    },
    feeTaxBasis: {
      title: 'Fee Tax Basis',
      body: 'POST_TAX: Apply fee to post-tax amount. PRE_TAX: Apply fee to pre-tax amount.'
    },
    base: {
      title: 'Base Card Volume (pre-tax, pre-tip)',
      body: 'Base Card Volume (pre-tax, pre-tip) = Card Gross ÷ (1 + tax + tip).'
    },
    feeBaseCards: {
      title: 'Fee-Eligible Volume (Cards)',
      body: 'Fee-Eligible Volume (Cards): the dollar base the fee is applied to for cards (varies by timing/tax basis).'
    },
    tipBase: {
      title: 'Tip-Eligible Volume (Cards)',
      body: 'Tip-Eligible Volume (Cards): the dollar base the tip is applied to (varies by timing).'
    },
    cardFeeCollected: {
      title: 'Supplemental Fee — Cards',
      body: 'Supplemental Fee — Cards = Fee-Eligible Volume (Cards) × fee %.'
    },
    supplementalFeeCash: {
      title: 'Supplemental Fee — Cash',
      body: 'Supplemental Fee — Cash = Monthly Cash Volume × fee %.'
    },
    tipAmount: {
      title: 'Tip Amount',
      body: 'Tip Amount = Tip-Eligible Volume (Cards) × tip %.'
    },
    processed: {
      title: 'Card Processed Total',
      body: 'Card Processed Total (incl. fee, tax & tip): follows the selected order of operations.'
    },
    procCharge: {
      title: 'Processor Charge on Cards',
      body: 'Processor Charge on Cards = Card Processed Total × Flat Rate.'
    },
    netChangeCards: {
      title: 'Processing Cost After Price Differential',
      body: 'Processing Cost After Price Differential = Processor Charge − Fee Collected on Cards.'
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
      body: 'Total Net Gain (Monthly) = Savings on cards + Fee collected on cash (if any).'
    },
    netAnnual: {
      title: 'Annual Net Gain',
      body: 'Annual Net Gain = Monthly × 12.'
    },
    coverageCaption: {
      title: 'Coverage %',
      body: 'Coverage % = Fee Collected on Cards ÷ Processor Charge.'
    }
  }
};

// Helper function to get tooltip based on program type and key
export function getTooltip(key: string, programType?: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE') {
  // First check program-specific tooltips
  if (programType && UNIFIED_TOOLTIPS[programType] && UNIFIED_TOOLTIPS[programType][key]) {
    return UNIFIED_TOOLTIPS[programType][key];
  }
  
  // Then check shared tooltips
  if (UNIFIED_TOOLTIPS.shared[key]) {
    return UNIFIED_TOOLTIPS.shared[key];
  }
  
  // Legacy fallback for backward compatibility
  return LEGACY_TOOLTIPS[key] || null;
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
  coveragePct: UNIFIED_TOOLTIPS.shared.coveragePct,
  grossProfit: UNIFIED_TOOLTIPS.shared.grossProfit,
  processingCostSavingsPct: UNIFIED_TOOLTIPS.shared.processingCostSavingsPct
};