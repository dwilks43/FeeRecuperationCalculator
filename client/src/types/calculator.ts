export type FeeTiming = 'FEE_BEFORE_TIP' | 'FEE_AFTER_TIP';
export type FeeTaxBasis = 'POST_TAX' | 'PRE_TAX';
export type CardVolumeBasis = 'PRE_TAX' | 'GROSS';
export type TipTiming = 'BEFORE_TIP' | 'AFTER_TIP';

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
  feeTiming?: FeeTiming;
  feeTaxBasis?: FeeTaxBasis;
  cardVolumeBasis?: CardVolumeBasis;
  // New v1.0.1 fields
  tipTiming?: TipTiming;
  flatRateOverride?: number;
  isAutoFlatRate?: boolean;
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
  baseVolumePreTaxPreTip?: number;
  baseVolumeTaxedPreTip?: number;
  processingCostSavingsOnly?: number;
  processingCostSavingsPct?: number;
  totalNetGainRevenue?: number;
  annualNetGainRevenue?: number;
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
  // New dual pricing fields
  adjustedCardVolume?: number;
  cardPriceIncreaseCollected?: number;
  // UX-specific fields for neutral row display
  residualAfterMarkup?: number;
  overageRetained?: number;
  // v1.0.1 Supplemental Fee fields
  feeBaseCards?: number;
  tipBase?: number;
  tipAmount?: number;
  recovery?: number;
  coveragePct?: number;
  savingsCardsOnly?: number;
  procSavingsPct?: number;
  supplementalFeeCash?: number;
  netChangeCards?: number;
  comboKey?: string;
  orderOfOperations?: string;
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
  | 'gross-profit'
  | 'recovery'
  | 'savingsCardsOnly';
