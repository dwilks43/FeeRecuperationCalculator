import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, HelpCircle, ChevronDown, ChevronUp, Calculator, Eye, EyeOff } from "lucide-react";
import { CalculatorResults, CalculatorInputs, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";

interface DualPricingBreakdownProps {
  results: CalculatorResults;
  inputs: CalculatorInputs;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE' | 'CASH_DISCOUNTING';
}

export default function DualPricingBreakdown({ results, inputs, onTooltip, programType }: DualPricingBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl text-gray-900">
            <Calculator className="h-5 w-5 text-gray-600" />
            <span className="text-lg">Calculation Details</span>
            <span className="text-sm text-gray-500 font-normal ml-2">(Technical Breakdown)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTooltip('viewHideCalculationDetails' as TooltipKey);
              }}
              className="text-gray-400 hover:text-gray-600"
              data-testid="button-tooltip-viewHide"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4 animate-in slide-in-from-top-2">
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
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Fee-Eligible Volume (Cards)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('feeEligibleVolumeCards' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-feeEligibleVolumeCards"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(results.feeBaseCards || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Supplemental Fee Collected — Cards</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('supplementalFeeCards' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-supplementalFeeCards"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(results.cardFeeCollected || 0)}</span>
                </div>
                {inputs.businessType !== 'RETAIL' && (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Tip-Eligible Volume (Cards)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('tipEligibleVolumeCards' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-tipEligibleVolumeCards"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-medium">{formatCurrency(results.tipBase || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Tip Amount</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('tipAmount' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-tipAmount"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-medium">{formatCurrency(results.tipAmount || 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Panel 2: Processing on Cards (New Program) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing on Cards (New Program)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">
                      {inputs.businessType === 'RETAIL' ?
                        'Card Processed Total (after fee & tax)' :
                        'Card Processed Total (after fee, tip, & tax)'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('processed' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-processed-supplemental"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{formatCurrency(results.cardProcessedTotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processor Charge</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('procCharge' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-procCharge"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(results.processorChargeOnCards || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Supplemental Fee Collected — Cards</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('supplementalFeeCards' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-supplementalFeeCards"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(results.cardFeeCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost after Supplemental Fee</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('netChangeCards' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-netChangeCards"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(results.netChangeCards || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Cost Reduction %</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('procSavingsPct' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-procSavingsPct-supplemental"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{(() => {
                    const pct = (results.procSavingsPct || 0) * 100;
                    // Show 1 decimal place if close to 100% to avoid misleading rounding
                    if (pct >= 99 && pct <= 101) {
                      return pct.toFixed(1) + '%';
                    }
                    return pct.toFixed(0) + '%';
                  })()}</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Savings vs Today */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings vs Today</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Current Processing Cost (Today)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('currentCost' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-currentCost-supplemental"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.currentCost || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost after Supplemental Fee</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('netChangeCards' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-netChangeCards2"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(results.netChangeCards || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('savingsCardsOnly' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-savingsCardsOnly"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-blue-600">{formatCurrency(results.savingsCardsOnly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Supplemental Fee Collected — Cash</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('supplementalFeeCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-supplementalFeeCash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(results.supplementalFeeCash || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Net Monthly</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('totalNetGainCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-totalNetGainRevenue"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-700">{formatCurrency(results.totalNetGainRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Net Annual</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('annualNetGainCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-annualNetGainRevenue"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(results.annualNetGainRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Total Cost Reduction %</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('totalCostReductionCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-totalCostReductionPct"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{(() => {
                    const currentCost = results.currentCost || 0;
                    const totalSavings = results.totalNetGainRevenue || 0;
                    const percentage = currentCost > 0 ? (totalSavings / currentCost) * 100 : 0;
                    // Show 1 decimal place if close to 100% to avoid misleading rounding
                    if (percentage >= 99 && percentage <= 101) {
                      return percentage.toFixed(1) + '%';
                    }
                    return percentage.toFixed(0) + '%';
                  })()}</span>
                </div>
              </div>
            </div>

          </>
        ) : programType === 'CASH_DISCOUNTING' ? (
          // Cash Discounting - menu markup with cash discount
          <>
            {/* Order of Operations Ribbon */}
            <div className="mb-4 p-3 bg-gradient-to-r from-dmp-blue-50 to-blue-100 rounded-lg border border-dmp-blue-200">
              <div className="text-xs font-medium text-dmp-blue-700 mb-1">Order of Operations</div>
              <div className="text-sm text-dmp-blue-600 font-mono">
                {inputs.businessType === 'RETAIL' ?
                  'Base Volume → +Menu Markup → −Cash Discount (Cash Only) → +Tax' :
                  'Base Volume → +Menu Markup → −Cash Discount (Cash Only) → +Tax → +Tip (handwritten)'}
              </div>
            </div>

            {/* Panel 1: Derived Bases & Totals */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Derived Bases & Totals</h3>
              
              {/* Cards Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Cards:</h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {inputs.businessType === 'RETAIL' ?
                        'Base Card Volume (pre-tax)' :
                        'Base Card Volume (pre-tax, pre-tip)'}
                    </span>
                    <span className="font-medium">{formatCurrency(results.base || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Base Card Volume + Menu Markup</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTooltip('baseCardVolumeMarkup' as TooltipKey)}
                        className="h-4 w-4 p-0"
                        data-testid="button-tooltip-baseCardVolumeMarkup"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <span className="font-medium">{formatCurrency(results.priceAdjustedBase || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">
                        {inputs.businessType === 'RETAIL' ? 
                          'Card Processed Total (incl. markup and tax)' : 
                          'Card Processed Total (incl. markup, tax, and tip)'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTooltip('processed' as TooltipKey)}
                        className="h-4 w-4 p-0"
                        data-testid="button-tooltip-processed"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <span className="font-bold">{formatCurrency(results.processed || 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Cash Section */}
              {inputs.programType === 'CASH_DISCOUNTING' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Cash:</h4>
                  <div className="space-y-2 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {inputs.businessType === 'RETAIL' ?
                          'Base Cash Volume (pre-tax)' :
                          'Base Cash Volume (pre-tax, pre-tip)'}
                      </span>
                      <span className="font-medium">{formatCurrency(results.baseCashVolume || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Base Cash Volume + Menu Markup</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('markupOnCash' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-markupOnCash"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-medium">{formatCurrency(results.menuPricedCashBase || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Cash Discount Applied</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('cashDiscountApplied' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-cashDiscountApplied"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-medium text-orange-600">−{formatCurrency(results.cashDiscountGiven || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Net Cash Base (after discount)</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('netCashBase' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-netCashBase"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-medium">{formatCurrency(results.netCashBase || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">
                          {inputs.businessType === 'RETAIL' ?
                            'Cash Processed Total (incl. net markup and tax)' :
                            'Cash Processed Total (incl. net markup, tax, and tip)'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTooltip('cashProcessedTotal' as TooltipKey)}
                          className="h-4 w-4 p-0"
                          data-testid="button-tooltip-cashProcessedTotal"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </div>
                      <span className="font-bold">{formatCurrency(results.cashProcessedTotal || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel 2: Processing on Cards (New Program) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing on Cards (New Program)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {inputs.businessType === 'RETAIL' ?
                      'Card Processed Total (incl. menu markup and tax)' :
                      'Card Processed Total (incl. menu markup, tax, and tip)'}
                  </span>
                  <span className="font-bold">{formatCurrency(results.processed || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processor Charge on Cards</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('procCharge' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-procCharge2"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(results.procCharge || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Card Menu Markup Collected (Cards)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('markupCollected' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-markupCollected-cash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(results.markupCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost after Menu Markup</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('recovery' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-recovery"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.recovery || 0) >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(results.recovery || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Cost Reduction %</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('processingCostSavingsPct' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-processingCostSavingsPct"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{(() => {
                    const pct = (results.procSavingsPct || 0) * 100;
                    // Show 1 decimal place if close to 100% to avoid misleading rounding
                    if (pct >= 99 && pct <= 101) {
                      return pct.toFixed(1) + '%';
                    }
                    return pct.toFixed(0) + '%';
                  })()}</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Cash Revenue (New Program) */}
            {inputs.programType === 'CASH_DISCOUNTING' && (inputs.monthlyCashVolume && inputs.monthlyCashVolume > 0) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cash Revenue (New Program)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Cash Volume (pre-tax, pre-tip)</span>
                    <span className="font-medium">{formatCurrency(results.baseCashVolume || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Menu Markup on Cash</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTooltip('menuMarkupOnCash' as TooltipKey)}
                        className="h-4 w-4 p-0"
                        data-testid="button-tooltip-menuMarkupOnCash"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <span className="font-medium text-green-600">+{formatCurrency((results.menuPricedCashBase || 0) - (results.baseCashVolume || 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Less: Cash Discount Given</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTooltip('cashDiscountGiven' as TooltipKey)}
                        className="h-4 w-4 p-0"
                        data-testid="button-tooltip-cashDiscountGiven"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <span className="font-medium text-orange-600">−{formatCurrency(results.cashDiscountGiven || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 bg-amber-50 -mx-2 px-2 py-2 rounded">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">Net Revenue from Cash</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTooltip('extraCashRevenue' as TooltipKey)}
                        className="h-4 w-4 p-0"
                        data-testid="button-tooltip-extraCashRevenue"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </div>
                    <span className={`font-bold ${
                      (results.extraCashRevenue || 0) > 0 ? 'text-green-600' : 
                      (results.extraCashRevenue || 0) < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {(results.extraCashRevenue || 0) < 0 ? '−' : ''}{formatCurrency(Math.abs(results.extraCashRevenue || 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: Net Savings & Revenue */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Net Savings & Revenue</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Current Processing Cost (Today)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('currentCost' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-currentCost"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.currentCost || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost After Menu Markup</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('processingAfterMarkup' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-processingAfterMarkup"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(Math.abs(results.netChangeCards || 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('savingsCardsOnlyCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-savingsCardsOnlyCash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-blue-600">{formatCurrency(results.savingsCardsOnly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Revenue from Cash Differential</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('cashRevenueDiff' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-cashRevenueDiff"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-amber-600">{formatCurrency(results.extraCashRevenue || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Total Net Gain (Monthly)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('totalNetGainCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-totalNetGainCash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-700">{formatCurrency(results.netMonthly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Annual Net Gain</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('annualNetGainCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-annualNetGainCash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(results.netAnnual || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Total Cost Reduction %</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('totalCostReductionCash' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-totalCostReductionCash"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{(() => {
                    const totalSavings = (results.savingsCardsOnly || 0) + (results.extraCashRevenue || 0);
                    const currentCost = results.currentCost || 0;
                    const totalReductionPct = currentCost > 0 ? (totalSavings / currentCost) * 100 : 0;
                    // Show 1 decimal place if close to 100% to avoid misleading rounding
                    if (totalReductionPct >= 99 && totalReductionPct <= 101) {
                      return totalReductionPct.toFixed(1) + '%';
                    }
                    return totalReductionPct.toFixed(0) + '%';
                  })()}</span>
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
                {inputs.businessType === 'RETAIL' ?
                  'Base Card Volume → +Price Differential → +Tax' :
                  'Base Card Volume → +Price Differential → +Tax → +Tip (handwritten)'}
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
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Base Card Volume + Price Differential</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('priceAdjustedBase' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-priceAdjustedBase-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(results.priceAdjustedBase || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">
                      {inputs.businessType === 'RETAIL' ?
                        'Card Processed Total (incl. price differential and tax)' :
                        'Card Processed Total (incl. price differential, tax, and tip)'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('processed' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-processed-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
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
                  <span className="text-sm text-gray-600">
                    {inputs.businessType === 'RETAIL' ?
                      'Card Processed Total (incl. price differential and tax)' :
                      'Card Processed Total (incl. price differential, tax, and tip)'}
                  </span>
                  <span className="font-bold">{formatCurrency(results.processed || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Flat Rate %</span>
                  <span className="font-medium">{((results.derivedFlatRate || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processor Charge on Cards</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('procCharge' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-procCharge-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium">{formatCurrency(results.procCharge || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Card Price Increase Collected (Cards)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('markupCollected' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-markupCollected-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(results.markupCollected || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost after Price Differential</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('recovery' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-recovery-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.recovery || 0) >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(results.recovery || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Cost Reduction %</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('processingCostSavingsPct' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-processingCostSavingsPct-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold">{(() => {
                    const pct = (results.procSavingsPct || 0) * 100;
                    // Show 1 decimal place if close to 100% to avoid misleading rounding
                    if (pct >= 99 && pct <= 101) {
                      return pct.toFixed(1) + '%';
                    }
                    return pct.toFixed(0) + '%';
                  })()}</span>
                </div>
              </div>
            </div>

            {/* Panel 3: Savings vs Today */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Savings vs Today</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Current Processing Cost (Today)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('currentCost' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-currentCost-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrency(results.currentCost || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost After Price Differential</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('recovery' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-recovery-dual2"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className={`font-medium ${(results.netChangeCards || 0) <= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(results.netChangeCards || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('savingsCardsOnly' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-savingsCardsOnly-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-medium text-blue-600">{formatCurrency(results.savingsCardsOnly || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 bg-green-50 -mx-2 px-2 py-2 rounded">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Total Net Gain (Monthly)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('netMonthly' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-netMonthly-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-700">{formatCurrency(results.netMonthly || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">Annual Net Gain</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTooltip('netAnnual' as TooltipKey)}
                      className="h-4 w-4 p-0"
                      data-testid="button-tooltip-netAnnual-dual"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(results.netAnnual || 0)}</span>
                </div>
              </div>
            </div>
          </>
        )}
        </CardContent>
      )}
    </Card>
  );
}
