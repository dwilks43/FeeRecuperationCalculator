export interface CalculatorInputs {
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE';
  monthlyVolume: number;
  monthlyCashVolume: number;
  currentRate: number;
  interchangeCost: number;
  flatRate: number;
  taxRate: number;
  tipRate: number;
  priceDifferential: number;
  flatRatePct?: number;
  tipBasis?: 'fee_inclusive' | 'pre_fee';
  feeTiming?: 'FEE_BEFORE_TIP' | 'FEE_AFTER_TIP';
}

export interface CalculatorResults {
  baseVolume: number;
  markedUpVolume: number;
  adjustedVolume: number;
  markupCollected: number;
  processingFees: number;
  currentCost: number;
  newCost: number;
  monthlySavings: number;
  annualSavings: number;
  annualVolume: number;
  dmpProfit: number;
  skytabBonus: number;
  skytabBonusRep: number;
  derivedFlatRate?: number;
  cardProgramProfit?: number;
  residualCardCost?: number;
  extraRevenueCash?: number;
  collectedLabel: string;
  collectedValue: number;
  processingSavings?: number;
  tipAdjustmentResidual?: number;
  tipAssumptionNote?: string;
  // Additional fields for Supplemental Fee display
  cardFeeCollected?: number;
  cashFeeCollected?: number;
  cardProcessedTotal?: number;
  processorChargeOnCards?: number;
  netCostForProcessingCards?: number;
  // Gross Profit and Skytab bonus calculations
  grossProfit?: number;
  skytabBonusGross?: number;
  // Canonical fields for unified savings calculation
  programCardFees?: number;
  feeCollectedOnCards?: number;
  feeCollectedOnCash?: number;
}

export interface TooltipContent {
  title: string;
  content: string;
}

export interface CustomerInfo {
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  contactTitle?: string;
  contactEmail: string;
  salesRepName: string;
  salesRepEmail: string;
  salesRepPhone: string;
}

export type TooltipKey = 
  | 'monthly-volume'
  | 'monthly-cash-volume'
  | 'current-rate'
  | 'interchange-cost'
  | 'flat-rate'
  | 'flat-rate-pct'
  | 'tax-rate'
  | 'tip-rate'
  | 'price-differential'
  | 'supplemental-fee'
  | 'fee-timing'
  | 'fee-on-cards'
  | 'fee-on-cash'
  | 'total-fee-collected'
  | 'total-cards-processed'
  | 'total-processing-cost-new'
  | 'net-cost-for-processing-cards'
  | 'total-net-gain-rev'
  | 'current-processing-cost'
  | 'base-volume'
  | 'marked-up-volume'
  | 'adjusted-volume'
  | 'markup-collected'
  | 'processing-fees'
  | 'current-cost'
  | 'new-cost'
  | 'monthly-savings'
  | 'annual-savings'
  | 'annual-volume'
  | 'dmp-profit'
  | 'skytab-bonus'
  | 'skytab-bonus-rep'
  | 'gross-profit';
