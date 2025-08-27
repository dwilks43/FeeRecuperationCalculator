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
  
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {programType === 'SUPPLEMENTAL_FEE' ? 'How This Works For You (Live Preview)' : 'Live Volume Breakdown'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programType === 'SUPPLEMENTAL_FEE' ? (
          // Supplemental Fee sales-friendly display
          <>
            {/* Fee set aside from card payments */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Fee set aside from card payments</span>
              <span className="text-lg font-bold text-blue-600" data-testid="text-card-fee-collected">
                {formatCurrency(results.cardFeeCollected || 0)}
              </span>
            </div>

            {/* Fee captured on cash payments */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Fee captured on cash payments</span>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">pure extra revenue</span>
              </div>
              <span className="text-lg font-bold text-green-600" data-testid="text-cash-fee-collected">
                {formatCurrency(results.cashFeeCollected || 0)}
              </span>
            </div>

            {/* Total fee set aside */}
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-sm font-medium text-gray-700">Total fee set aside</span>
              <span className="text-lg font-bold text-amber-600" data-testid="text-total-fee-collected">
                {formatCurrency(results.collectedValue)}
              </span>
            </div>

            {/* Card totals with fee & tips */}
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Card totals with fee & tips</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600" data-testid="text-card-processed-total">
                  {formatCurrency(results.cardProcessedTotal || 0)}
                </span>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                  {results.tipAssumptionNote === 'Tip % applied on pre-fee amount' ? 'Tip basis: Before fee' : 'Tip basis: After fee'}
                </span>
              </div>
            </div>

            {/* Coverage on card costs */}
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-4">
                <span className="text-sm font-medium text-gray-700">Coverage on card costs</span>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 ml-4">• Covered</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(Math.min(results.processorChargeOnCards || 0, results.cardFeeCollected || 0))}
                    </span>
                  </div>
                  {results.residualCardCost && results.residualCardCost > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 ml-4">• Uncovered (mostly tips)</span>
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(results.residualCardCost)}
                      </span>
                    </div>
                  )}
                  {results.cardProgramProfit && results.cardProgramProfit > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 ml-4">• Extra coverage on cards</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(results.cardProgramProfit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Show details toggle */}
            <div className="border border-gray-200 rounded-lg">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 text-sm text-gray-600 hover:bg-gray-50"
              >
                <span>Show details</span>
                {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {showDetails && (
                <div className="border-t border-gray-200 p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Card costs at your rate</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(results.processorChargeOnCards || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Card fee set aside (cards)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(results.cardFeeCollected || 0)}
                    </span>
                  </div>
                </div>
              )}
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
                {formatCurrency(results.adjustedVolume)}
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
                {formatCurrency(results.processingFees)}
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
