export interface CalculatorInputs {
  monthlyVolume: number;
  monthlyCashVolume: number;
  currentRate: number;
  interchangeCost: number;
  flatRate: number;
  taxRate: number;
  tipRate: number;
  priceDifferential: number;
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
  | 'tax-rate'
  | 'tip-rate'
  | 'price-differential'
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
  | 'skytab-bonus-rep';
