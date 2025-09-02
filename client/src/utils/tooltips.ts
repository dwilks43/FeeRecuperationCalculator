export const TOOLTIPS = {
  programType: {
    title: 'Program Type',
    body: 'Choose the pricing model to show the merchant. Dual Pricing raises card price only. Supplemental Fee adds a post-tax fee to card and cash.'
  },
  monthlyCardVolume: {
    title: 'Monthly Credit Card Volume',
    body: 'Total pre-tax card sales for a typical month. Example: $20,000.'
  },
  monthlyCashVolume: {
    title: 'Monthly Cash Volume',
    body: 'Total pre-tax cash sales for a typical month. Example: $5,000.'
  },
  currentRate: {
    title: 'Current Processing Rate',
    body: 'What the merchant pays today on card sales. Example: Current Cost = $20,000 × 2% = $400.00.'
  },
  taxRate: {
    title: 'Tax Rate',
    body: 'Sales tax is applied before fee and tip. Example pre-tax→taxed: $20,000 × 1.10 = $22,000.'
  },
  tipRate: {
    title: 'Tip Rate',
    body: 'Average tip customers add. Example value: 20%.'
  },
  feeTiming: {
    title: 'Fee Timing',
    body: 'Controls whether the fee is added before or after tips. In "before tips": Card Processed = Card × (1+Tax) × (1+Fee) × (1+Tip). Example: $20,000 × 1.10 × 1.04 × 1.20 = $27,456.00.'
  },
  supplementalFee: {
    title: 'Supplemental Fee',
    body: 'Fee shown to customers; collected on card and cash. Example fee on cash: $5,000 × 4% = $200.00.'
  },
  flatRate: {
    title: 'Flat Rate Processing',
    body: 'Program\'s processing rate applied to fee-inclusive (and tip-inclusive) card totals. Example card cost: $27,456 × 3.85% = $1,057.06.'
  },
  // Live Calculations
  feeOnCards: {
    title: 'Fee Collected on Cards',
    body: 'Fee dollars collected from card sales. With fee-before-tips: $20,000 × 4% = $800.00.'
  },
  feeOnCash: {
    title: 'Fee Collected on Cash',
    body: 'Fee dollars collected from cash sales. Extra revenue; no processing cost. Example: $5,000 × 4% = $200.00.'
  },
  totalFeeCollected: {
    title: 'Total Fee Collected (Card + Cash)',
    body: 'Combined fee collected. Example: $800.00 + $200.00 = $1,000.00.'
  },
  totalCardsProcessed: {
    title: 'Total Cards Processed (incl fees & tips)',
    body: 'Amount that actually runs through the processor. Example: $27,456.00.'
  },
  totalProcessingCostNew: {
    title: 'Total Cost for Processing Cards (new)',
    body: 'Your card processing cost under this program. Example: $27,456 × 3.85% = $1,057.06.'
  },
  netCostForProcessingCards: {
    title: 'Net Cost for Processing Cards (include tax + tips)',
    body: 'Fee on cards minus your new card cost (can be negative or positive). Example: $800.00 − $1,057.06 = $(257.06).'
  },
  totalNetGainRev: {
    title: 'Total Net Gain Rev (include fee collected on cash)',
    body: 'Total fee collected minus processing costs. Example: $1,000.00 − $257.06 = $742.94.'
  },
  // Monthly Savings
  currentProcessingCost: {
    title: 'Current Processing Cost',
    body: 'What the merchant pays today: Card × Current Rate. Example: $20,000 × 2% = $400.00.'
  },
  savingsTotal: {
    title: 'Monthly Savings',
    body: 'Total fee collected minus processing costs. Example: $1,000.00 − $257.06 = $742.94.'
  },
  annualSavings: {
    title: 'Annual Savings',
    body: '12× monthly Savings. Example: $742.94 × 12 = $8,915.28.'
  },
  // Payout lines
  grossProfit: {
    title: 'Gross Profit',
    body: 'Internal monthly gross profit used for bonus math. Default basis here = Savings. Example: $742.94.'
  },
  skytabBonusGross: {
    title: 'Skytab Bonus Calculation (Gross)',
    body: 'Gross bonus estimate = Gross Profit × 18 months. Example: $742.94 × 18 = $13,372.92.'
  },
  skytabBonusRep: {
    title: 'Skytab Bonus Calculation (Rep 50%)',
    body: 'Rep share = Skytab Bonus (Gross) × 50%. Example: $13,372.92 × 50% = $6,686.46.'
  }
};