export const TOOLTIPS = {
  programType: {
    title: 'Program Type',
    body: 'Choose the pricing model to show the merchant. Dual Pricing raises card price only. Supplemental Fee adds a post-tax fee to card and cash.'
  },
  monthlyCardVolume: {
    title: 'Monthly Card Volume (Gross)',
    body: 'v1.0.1: Total gross card sales including all taxes and tips. This is the full amount customers pay on cards. Example: $30,000.'
  },
  monthlyCashVolume: {
    title: 'Monthly Cash Volume',
    body: 'Total cash sales for a typical month. In Supplemental Fee mode, cash customers also pay the fee. Example: $5,000.'
  },
  currentRate: {
    title: 'Current Processing Rate',
    body: 'What the merchant pays today on card sales. Example: Current Cost = Base Volume × 2.5% = $400.00.'
  },
  taxRate: {
    title: 'Tax Rate',
    body: 'Sales tax percentage. Used to derive the pre-tax base from gross card volume. Example: 10% tax rate.'
  },
  tipRate: {
    title: 'Tip Rate',
    body: 'Average tip percentage customers add. Used in calculations based on tip timing. Example: 20%.'
  },
  feeTiming: {
    title: 'Fee Timing',
    body: 'v1.0.1: Controls when the fee is applied in the calculation chain. Before Tip: fee added before tip calculation. After Tip: fee added after tip calculation.'
  },
  feeTaxBasis: {
    title: 'Fee Tax Basis',
    body: 'v1.0.1: Determines if the fee is applied to the pre-tax amount or post-tax amount. Affects the fee base calculation.'
  },
  tipTiming: {
    title: 'Tip Timing',
    body: 'v1.0.1: Controls when tips are calculated. Before Tip: tip calculated before fee. After Tip: tip calculated after fee.'
  },
  supplementalFee: {
    title: 'Supplemental Fee',
    body: 'Fee percentage shown to customers; collected on both card and cash transactions. Example: 4% fee.'
  },
  flatRate: {
    title: 'Flat Rate % (Bank Mapping)',
    body: 'Calculated as Fee ÷ (1+Fee), rounded to 2-dp percent and used in all calculations. Editable; click Reset to auto to restore.'
  },
  // v1.0.1 Derived Panels
  baseVolumePreTaxPreTip: {
    title: 'Pre-Tax Base (from Gross)',
    body: 'v1.0.1: The pre-tax, pre-tip base volume derived from the gross card amount using combo-based calculations.'
  },
  feeBaseCards: {
    title: 'Fee-Eligible Volume (Cards)',
    body: 'Dollar volume of card sales that the supplemental fee is applied to, based on your fee/tip timing.'
  },
  cardFeeCollected: {
    title: 'Supplemental Fee Collected — Cards',
    body: 'Fee is applied to the Fee Base for the selected options.'
  },
  tipBase: {
    title: 'Tip-Eligible Volume (Cards)',
    body: 'Dollar volume of card sales that the tip is applied to, based on your fee/tax/tip timing.'
  },
  tipAmount: {
    title: 'Tip Amount',
    body: 'Tip is calculated on the Tip Base shown.'
  },
  cardProcessedTotal: {
    title: 'Card Processed Total',
    body: 'Amount the processor charges on (after fee and after tip).'
  },
  processed: {
    title: 'Card Processed Total',
    body: 'Price-Adjusted Base × (1 + Tax + Tip). Dual Pricing does not tax the tip.'
  },
  processorChargeOnCards: {
    title: 'Processor Charge on Cards',
    body: 'v1.0.1: Your card processing cost calculated as Card Processed Total × Flat Rate %.'
  },
  recovery: {
    title: 'Card Under/Over-Recovery',
    body: 'Under/Over = Supplemental Fee (Cards) − Processor Charge.'
  },
  coveragePct: {
    title: 'Coverage %',
    body: 'v1.0.1: Percentage of processor charges covered by supplemental fee collected on cards. 100% = full coverage.'
  },
  currentCost: {
    title: 'Current Processing Cost (Today)',
    body: 'v1.0.1: What the merchant pays today for card processing using their current rate and base volume.'
  },
  savingsCardsOnly: {
    title: 'Processing Cost Savings (Cards Only)',
    body: 'Savings (Cards Only) = Current Cost − (Processor Charge − Fee on Cards).'
  },
  procSavingsPct: {
    title: 'Processing Cost Savings %',
    body: 'Savings % = Savings (Cards Only) ÷ Current Cost.'
  },
  supplementalFeeCash: {
    title: 'Supplemental Fee Collected — Cash',
    body: 'v1.0.1: Fee collected from cash transactions. Pure additional revenue with no processing costs.'
  },
  totalNetGainRevenue: {
    title: 'Total Net Gain (Monthly)',
    body: 'v1.0.1: Combined savings from card processing cost reduction plus supplemental fee collected on cash transactions.'
  },
  annualNetGainRevenue: {
    title: 'Annual Net Gain',
    body: 'v1.0.1: Total Net Gain (Monthly) × 12 months. Shows the full-year financial impact.'
  },
  grossProfit: {
    title: 'Gross Profit (Cards)',
    body: 'v1.0.1: Internal monthly gross profit calculation used for DMP profitability and bonus calculations.'
  },
  'flat-rate-pct': {
    title: 'Flat Rate % (Bank Mapping)',
    body: 'v1.0.1-patch: Processing rate applied to card processed total. Auto-calculated using Fee ÷ (1+Fee) formula with HALF_UP rounding to 2 decimals. The rounded value is used in all calculations.'
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