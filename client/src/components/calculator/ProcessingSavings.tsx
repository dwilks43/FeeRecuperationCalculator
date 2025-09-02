import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, HelpCircle, MinusCircle, CheckCircle, Trophy } from "lucide-react";
import { CalculatorResults, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";

interface ProcessingSavingsProps {
  results: CalculatorResults;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE';
}

export default function ProcessingSavings({ results, onTooltip, programType }: ProcessingSavingsProps) {
  const isNegativeCost = results.newCost < 0;
  
  return (
    <Card className="bg-gradient-to-br from-dmp-blue-50 to-indigo-100 shadow-lg border border-dmp-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-dmp-blue-800">
          <PiggyBank className="h-5 w-5 text-dmp-blue-600" />
          {programType === 'SUPPLEMENTAL_FEE' ? 'Monthly Savings' : 'Monthly Processing Savings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Processing Cost */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Current processing cost</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => onTooltip('current-cost')}
              data-testid="button-tooltip-current-cost"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-red-500" />
            <span className="text-2xl font-bold text-red-600" data-testid="text-current-cost">
              {formatCurrency(results.currentCost)}
            </span>
          </div>
        </div>

        {/* Supplemental Fee mode - specific rows in order */}
        {programType === 'SUPPLEMENTAL_FEE' ? (
          <>
            {/* Net Cost for Processing Cards (include tax + tips) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Net Cost for Processing Cards (include tax + tips)</span>
              </div>
              <div className="flex items-center gap-2">
                {(results.netCostForProcessingCards || 0) < 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <MinusCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${(results.netCostForProcessingCards || 0) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.netCostForProcessingCards || 0)}
                </span>
              </div>
            </div>

            {/* Fee Collected on Cash */}
            {results.extraRevenueCash !== undefined && results.extraRevenueCash > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Fee Collected on Cash</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.extraRevenueCash)}
                  </span>
                </div>
              </div>
            )}

            {/* Savings */}
            <div className="bg-gradient-to-r from-dmp-blue-100 to-green-100 rounded-lg p-4 border-2 border-dmp-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(results.monthlySavings)}
                </span>
              </div>
            </div>

            {/* Annual Savings */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Annual Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.annualSavings)}
                </span>
              </div>
            </div>


            {/* Tip assumption note */}
            {results.tipAssumptionNote && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 italic">
                  {results.tipAssumptionNote}
                </p>
              </div>
            )}
          </>
        ) : (
          // Dual Pricing mode - original layout
          <>
            {/* Revenue-Adjusted Processing Cost */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Revenue-Adjusted Processing Cost</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('new-cost')}
                  data-testid="button-tooltip-new-cost"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600" data-testid="text-new-cost">
                  {isNegativeCost ? '-' : ''}{formatCurrency(Math.abs(results.newCost))}
                </span>
              </div>
              {isNegativeCost && (
                <p className="text-xs text-green-600 mt-1">You earn money from processing!</p>
              )}
            </div>

            {/* Monthly Savings */}
            <div className="bg-gradient-to-r from-dmp-blue-100 to-green-100 rounded-lg p-4 border-2 border-dmp-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Monthly Savings</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('monthly-savings')}
                  data-testid="button-tooltip-monthly-savings"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700" data-testid="text-monthly-savings">
                  {formatCurrency(results.monthlySavings)}
                </span>
              </div>
            </div>

            {/* Annual Savings */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Annual Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.annualSavings)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
