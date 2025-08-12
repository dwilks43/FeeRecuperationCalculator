export interface CalculatorInputs {
  monthlyVolume: number;
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
  currentCost: number;
  newCost: number;
  monthlySavings: number;
  annualSavings: number;
  annualVolume: number;
  dmpProfit: number;
}

export interface TooltipContent {
  title: string;
  content: string;
}

export type TooltipKey = 
  | 'monthly-volume'
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
  | 'current-cost'
  | 'new-cost'
  | 'monthly-savings'
  | 'dmp-profit';
