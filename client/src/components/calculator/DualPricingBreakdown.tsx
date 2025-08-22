import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, HelpCircle } from "lucide-react";
import { CalculatorResults, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";

interface DualPricingBreakdownProps {
  results: CalculatorResults;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE';
}

export default function DualPricingBreakdown({ results, onTooltip, programType }: DualPricingBreakdownProps) {
  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Live Volume Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {/* Supplemental Fee mode specific display */}
        {programType === 'SUPPLEMENTAL_FEE' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              Fee basis: Card + Cash • Processor FR applies to fee-inclusive + tip card totals.
            </p>
            {results.derivedFlatRate && (
              <p className="text-xs text-blue-600 mt-1">
                100% offset pair: FR = fee/(1+fee) ≈ {results.derivedFlatRate.toFixed(4)}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
