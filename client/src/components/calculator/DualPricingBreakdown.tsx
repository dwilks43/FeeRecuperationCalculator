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
      'BEFORE_TIP__PRE_TAX':  { feeBaseCards: 'pre-tax', tipBase: 'pre-tax + fee + tax' },
      'AFTER_TIP__POST_TAX':  { feeBaseCards: 'post-tax + tip', tipBase: 'post-tax' },
      'AFTER_TIP__PRE_TAX':   { feeBaseCards: 'pre-tax + tip', tipBase: 'post-tax' }
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
                    <span className="text-sm text-gray-600">Fee Base — Cards</span>
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
                    <span className="text-sm text-gray-600">Tip Base</span>
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
                  <span className="text-sm text-gray-600">Card Processed Total (after fee & tip)</span>
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

            {/* Panel 4: Gross Profit */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Gross Profit</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Gross Profit (Cards)</span>
                <span className="font-bold text-dmp-blue-600">{formatCurrency(results.grossProfit || 0)}</span>
              </div>
            </div>
          </>
        ) : (
          // Dual Pricing - keep original layout
          <>
            {/* Base Volume */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Base Volume</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('base-volume')}
                  data-testid="button-tooltip-base-volume"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <span className="text-lg font-bold text-gray-900" data-testid="text-base-volume">
                {formatCurrency(results.baseVolume)}
              </span>
            </div>

            {/* Adjusted Card Volume */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Adjusted Card Volume</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('adjusted-volume')}
                  data-testid="button-tooltip-adjusted-volume"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <span className="text-lg font-bold text-dmp-blue-600" data-testid="text-adjusted-volume">
                {formatCurrency(results.adjustedCardVolume || results.adjustedVolume)}
              </span>
            </div>

            {/* Total Processing Fees Charged */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Total Processing Fees Charged</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('processing-fees')}
                  data-testid="button-tooltip-processing-fees"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <span className="text-lg font-bold text-green-600" data-testid="text-processing-fees">
                {formatCurrency(results.programCardFees || results.processingFees)}
              </span>
            </div>

            {/* Dynamic Collected Label */}
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{results.collectedLabel}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('markup-collected')}
                  data-testid="button-tooltip-markup-collected"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <span className="text-lg font-bold text-amber-600" data-testid="text-markup-collected">
                {formatCurrency(results.collectedValue)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
