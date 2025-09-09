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
                  <span className="text-sm text-gray-600">Markup Collected — Cards</span>
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
                    <span className="text-sm text-gray-600">Card Under/Over-Recovery</span>
                    <span className="text-xs text-gray-400 italic">Under/Over-Recovery = Markup Collected − Processor</span>
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
          // v1.5.2: Dual Pricing - handwritten after-tax tips
          <>
            {/* Order of Operations Ribbon */}
            <div className="mb-4 p-3 bg-gradient-to-r from-dmp-blue-50 to-blue-100 rounded-lg border border-dmp-blue-200">
              <div className="text-xs font-medium text-dmp-blue-700 mb-1">Order of Operations</div>
              <div className="text-sm text-dmp-blue-600 font-mono">
                Pre-Tax Base → +Price Differential → +Tax → +Tip (handwritten)
              </div>
            </div>
            {/* Panel 1: Derived Bases & Totals */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Derived Bases & Totals</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Card Volume (pre-tax, pre-tip)</span>
                  <span className="font-medium">{formatCurrency(results.base || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Price-Adjusted Base + Price Differential</span>
                    <span className="text-xs text-gray-400 italic">Base × (1 + Price Differential)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(results.priceAdjustedBase || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Card Processed Total (incl. price differential, tax, and tip)</span>
                    <span className="text-xs text-gray-400 italic">Price-Adjusted Base × (1 + Tax) × (1 + Tip)</span>
                  </div>
                  <span className="font-bold">{formatCurrency(results.processed || 0)}</span>
                </div>
              </div>
            </div>
            {/* Panel 2: Processing on Cards (New Program) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing on Cards (New Program)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Card Processed Total (incl. price differential, tax, and tip)</span>
                  <span className="font-bold">{formatCurrency(results.processed || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Processor Charge on Cards</span>
                    <span className="text-xs text-gray-400 italic">Processor Charge = Card Processed Total × Flat Rate</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.procCharge || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Markup Collected — Cards (price differential)</span>
                  <span className="font-medium text-green-600">{formatCurrency(results.markupCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Card Under/Over-Recovery (Markup − Processor)</span>
                    <span className="text-xs text-gray-400 italic">Recovery = Markup − Processor Charge</span>
                  </div>
                  <span className={`font-medium ${(results.recovery || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.recovery || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Coverage %</span>
                    <span className="text-xs text-gray-400 italic">Coverage % = Markup ÷ Processor Charge</span>
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
                    <span className="text-sm text-gray-600">Processing Cost After Price Differential</span>
                    <span className="text-xs text-gray-400 italic">Processor Charge − Markup Collected</span>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(results.netChangeCards || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <span className="text-xs text-gray-400 italic">Savings = Current Cost − Net Change</span>
                  </div>
                  <span className="font-medium text-blue-600">{formatCurrency(results.savingsCardsOnly || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <span className="text-sm font-medium text-gray-700">Total Net Gain (Monthly)</span>
                  <span className="font-bold text-green-700">{formatCurrency(results.netMonthly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Annual Net Gain</span>
                  <span className="font-bold text-green-600">{formatCurrency(results.netAnnual || 0)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
