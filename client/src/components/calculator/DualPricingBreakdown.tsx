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
          {programType === 'SUPPLEMENTAL_FEE' ? 'Live Calculations' : 'Live Volume Breakdown'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programType === 'SUPPLEMENTAL_FEE' ? (
          // Supplemental Fee sales-friendly display
          <>
            {/* Fee Collected on Cards */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Fee Collected on Cards</span>
              <span className="text-lg font-bold text-blue-600" data-testid="text-card-fee-collected">
                {formatCurrency(results.cardFeeCollected || 0)}
              </span>
            </div>

            {/* Fee Collected on Cash */}
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Fee Collected on Cash</span>
              <span className="text-lg font-bold text-green-600" data-testid="text-cash-fee-collected">
                {formatCurrency(results.cashFeeCollected || 0)}
              </span>
            </div>

            {/* Total Fee Collected (Card + Cash) */}
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-sm font-medium text-gray-700">Total Fee Collected (Card + Cash)</span>
              <span className="text-lg font-bold text-amber-600" data-testid="text-total-fee-collected">
                {formatCurrency(results.collectedValue)}
              </span>
            </div>

            {/* Total Cards Processed (incl fees & tips) */}
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Cards Processed (incl fees & tips)</span>
              <span className="text-lg font-bold text-purple-600" data-testid="text-card-processed-total">
                {formatCurrency(results.cardProcessedTotal || 0)}
              </span>
            </div>

            {/* Total Cost for Processing Cards (new) */}
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Cost for Processing Cards (new)</span>
              <span className="text-lg font-bold text-red-600" data-testid="text-processor-charge">
                {formatCurrency(results.processorChargeOnCards || 0)}
              </span>
            </div>

            {/* Net Cost for Processing Cards (include tax + tips) */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Net Cost for Processing Cards (include tax + tips)</span>
              <span className={`text-lg font-bold ${(results.netCostForProcessingCards || 0) < 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-net-cost-cards">
                {formatCurrency(results.netCostForProcessingCards || 0)}
              </span>
            </div>

            {/* Total Net Gain Rev (include fee collected on cash) */}
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-sm font-medium text-gray-700">Total Net Gain Rev (include fee collected on cash)</span>
              <span className="text-lg font-bold text-emerald-600" data-testid="text-total-net-gain">
                {formatCurrency(results.monthlySavings || 0)}
              </span>
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
