import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import { CalculatorResults, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";

interface DualPricingBreakdownProps {
  results: CalculatorResults;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE';
}

export default function DualPricingBreakdown({ results, onTooltip, programType }: DualPricingBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Dynamic captions based on combo key
  const getDynamicCaption = (field: 'feeBaseCards' | 'tipBase'): string => {
    const comboKey = results.comboKey || 'BEFORE_TIP__POST_TAX';
    const captionMap: Record<string, Record<string, string>> = {
      'BEFORE_TIP__POST_TAX': { feeBaseCards: 'post-tax, pre-tip', tipBase: 'post-tax + fee' },
      'BEFORE_TIP__PRE_TAX':  { feeBaseCards: 'pre-tax', tipBase: 'base card + fee + tax' },
      'AFTER_TIP__POST_TAX':  { feeBaseCards: 'post-tax + tip', tipBase: 'post-tax' },
      'AFTER_TIP__PRE_TAX':   { feeBaseCards: 'pre-tax + tip', tipBase: 'pre-tax, pre-fee' }
    };
    return captionMap[comboKey]?.[field] || '';
  };
  
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {programType === 'SUPPLEMENTAL_FEE' ? 'Live Calculations' : 'Live Volume Breakdown'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programType === 'SUPPLEMENTAL_FEE' ? (
          // v1.0.1 Derived Panels Structure
          <>
            {/* Order of Operations Ribbon */}
            {results.orderOfOperations && (
              <div className="mb-4 p-3 bg-gradient-to-r from-dmp-blue-50 to-blue-100 rounded-lg border border-dmp-blue-200">
                <div className="text-xs font-medium text-dmp-blue-700 mb-1">Order of Operations</div>
                <div className="text-sm text-dmp-blue-600 font-mono">
                  {results.orderOfOperations}
                </div>
              </div>
            )}

            {/* Panel 1: Derived Bases & Totals */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Derived Bases & Totals</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Card Volume (pre-tax, pre-tip)</span>
                  <span className="font-medium">{formatCurrency(results.baseVolumePreTaxPreTip || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Fee-Eligible Volume (Cards)</span>
                    <span className="text-xs text-gray-400 italic">({getDynamicCaption('feeBaseCards')})</span>
                  </div>
                  <span className="font-medium">{formatCurrency(results.feeBaseCards || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supplemental Fee Collected — Cards</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.cardFeeCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Tip-Eligible Volume (Cards)</span>
                    <span className="text-xs text-gray-400 italic">({getDynamicCaption('tipBase')})</span>
                  </div>
                  <span className="font-medium">{formatCurrency(results.tipBase || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tip Amount</span>
                  <span className="font-medium">{formatCurrency(results.tipAmount || 0)}</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Processing on Cards (New Program) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing on Cards (New Program)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Card Processed Total (after fee, tip, & tax)</span>
                  <span className="font-bold">{formatCurrency(results.cardProcessedTotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Processor Charge</span>
                    <span className="text-xs text-gray-400 italic">Processor Charge = Card Processed Total × Flat Rate</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.processorChargeOnCards || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supplemental Fee (Cards)</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.cardFeeCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Under/Over-Recovery</span>
                    <span className="text-xs text-gray-400 italic">Under/Over-Recovery = Fee (Cards) − Processor</span>
                  </div>
                  <span className={`font-medium ${(results.recovery || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.recovery || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Coverage %</span>
                    <span className="text-xs text-gray-400 italic">Coverage % = Fee (Cards) ÷ Processor</span>
                  </div>
                  <span className="font-bold">{((results.coveragePct || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Savings vs Today */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings vs Today</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Processing Cost (Today)</span>
                  <span className="font-medium text-red-600">{formatCurrency(results.currentCost || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Net Change in Card Processing</span>
                    <span className="text-xs text-gray-400 italic">Net Change in Card Processing = Processor Charge − Fee (Cards)</span>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.netChangeCards || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <span className="text-xs text-gray-400 italic">Savings (Cards Only) = Current Cost − Net Change</span>
                  </div>
                  <span className="font-medium text-blue-600">{formatCurrency(results.savingsCardsOnly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supplemental Fee Collected — Cash</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.supplementalFeeCash || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Net Monthly</span>
                  <span className="font-bold text-green-700">{formatCurrency(results.totalNetGainRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Annual</span>
                  <span className="font-bold text-green-600">{formatCurrency(results.annualNetGainRevenue || 0)}</span>
                </div>
              </div>
            </div>

          </>
        ) : (
          // Dual Pricing - structured panels per v1.3.1 specification
          <>
            {/* Panel 1: Processing on Cards (New Program) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing on Cards (New Program)</h3>
              <div className="space-y-2">
                {/* 1. processed - Card Processed Total */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Card Processed Total</span>
                  <span className="font-bold">{formatCurrency(results.adjustedCardVolume || results.adjustedVolume || 0)}</span>
                </div>
                {/* 2. flatRate - Flat Rate % */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                {/* 3. procCharge - Processor Charge */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Processor Charge</span>
                    <span className="text-xs text-gray-400 italic">Processor Charge = Card Processed Total × Flat Rate</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.processingFees || 0)}</span>
                </div>
                {/* 4. markupCollected - Markup Collected */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Markup (Cards)</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.markupCollected || 0)}</span>
                </div>
                {/* 5. recovery - Under/Over-Recovery */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Under/Over-Recovery</span>
                    <span className="text-xs text-gray-400 italic">Under/Over-Recovery = Markup (Cards) − Processor</span>
                  </div>
                  <span className={`font-medium ${((results.markupCollected || 0) - (results.processingFees || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency((results.markupCollected || 0) - (results.processingFees || 0))}
                  </span>
                </div>
                {/* 6. coveragePct - Coverage % */}
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Coverage %</span>
                    <span className="text-xs text-gray-400 italic">Coverage % = Markup (Cards) ÷ Processor</span>
                  </div>
                  <span className="font-bold">
                    {results.processingFees && results.processingFees > 0 
                      ? ((results.markupCollected || 0) / results.processingFees * 100).toFixed(1) 
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2: Savings vs Today */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings vs Today</h3>
              <div className="space-y-2">
                {/* 1. currentCost - Current Processing Cost */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Processing Cost</span>
                  <span className="font-medium text-red-600">{formatCurrency(results.currentCost || 0)}</span>
                </div>
                {/* 2. netChangeCards - Net Change in Card Processing */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Net Change in Card Processing</span>
                    <span className="text-xs text-gray-400 italic">Net Change in Card Processing = Processor Charge − Markup (Cards)</span>
                  </div>
                  <span className={`font-medium ${((results.processingFees || 0) - (results.markupCollected || 0)) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency((results.processingFees || 0) - (results.markupCollected || 0))}
                  </span>
                </div>
                {/* 3. savingsCardsOnly - Savings (Cards Only) */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Savings (Cards Only)</span>
                    <span className="text-xs text-gray-400 italic">Savings (Cards Only) = Current Cost − Net Change</span>
                  </div>
                  <span className="font-medium text-blue-600">
                    {formatCurrency((results.currentCost || 0) - ((results.processingFees || 0) - (results.markupCollected || 0)))}
                  </span>
                </div>
                {/* 4. netMonthly - Net Monthly */}
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Net Monthly</span>
                  <span className="font-bold text-green-700">{formatCurrency(results.monthlySavings || 0)}</span>
                </div>
                {/* 5. netAnnual - Net Annual */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Net Annual</span>
                  <span className="font-bold text-green-600">{formatCurrency(results.annualSavings || 0)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
