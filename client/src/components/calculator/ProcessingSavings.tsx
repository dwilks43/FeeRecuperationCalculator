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
            {/* Savings on card costs */}
            {results.processingSavings !== undefined && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Savings on card costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.processingSavings)}
                  </span>
                </div>
              </div>
            )}

            {/* Fee collected on cash sales */}
            {results.extraRevenueCash !== undefined && results.extraRevenueCash > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Fee collected on cash sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.extraRevenueCash)}
                  </span>
                </div>
              </div>
            )}

            {/* Surplus from card fee (show only if > 0) */}
            {results.cardProgramProfit !== undefined && results.cardProgramProfit > 0 && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Surplus from card fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(results.cardProgramProfit)}
                  </span>
                </div>
              </div>
            )}

            {/* Shortfall from tips (tip-driven) - show if tipAdjustmentResidual > 0 */}
            {results.tipAdjustmentResidual !== undefined && results.tipAdjustmentResidual > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">Shortfall from tips (tip-driven)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MinusCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-600">
                    {formatCurrency(results.tipAdjustmentResidual)}
                  </span>
                </div>
              </div>
            )}

            {/* Shortfall from tips - show if > 0 */}
            {results.residualCardCost !== undefined && results.residualCardCost > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Shortfall from tips</span>
                </div>
                <div className="flex items-center gap-2">
                  <MinusCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(results.residualCardCost)}
                  </span>
                </div>
              </div>
            )}

            {/* Total Monthly Savings - highlight */}
            <div className="bg-gradient-to-r from-dmp-blue-100 to-green-100 rounded-lg p-6 border-2 border-dmp-blue-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-gray-800">Total Monthly Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-green-700">
                  {formatCurrency(results.monthlySavings)}
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
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
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
                <Trophy className="h-5 w-5 text-green-600" />
                <span className="text-3xl font-bold text-green-700" data-testid="text-monthly-savings">
                  {formatCurrency(results.monthlySavings)}
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">per month saved with DMP</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
