import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, HelpCircle, MinusCircle, CheckCircle, Trophy, AlertTriangle } from "lucide-react";
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
          {programType === 'SUPPLEMENTAL_FEE' ? 'Savings Summary' : 'Monthly Processing Savings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supplemental Fee mode - v1.2.2-hotfix Monthly Savings UI */}
        {programType === 'SUPPLEMENTAL_FEE' ? (
          <>
            {/* Current Processing Cost (Today) - RED */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Current Processing Cost (Today)</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600" data-testid="text-current-cost">
                  {formatCurrency(results.currentCost || 0)}
                </span>
              </div>
            </div>

            {/* Processor Charge on Cards - RED */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processor Charge on Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(results.processorChargeOnCards || 0)}
                </span>
              </div>
            </div>

            {/* Markup Collected — Cards - GREEN */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Markup Collected — Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.cardFeeCollected || 0)}
                </span>
              </div>
            </div>

            {/* Processing Cost after Price Differential - NEUTRAL */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost after Price Differential</span>
              </div>
              <div className="flex items-center gap-2">
                {(results.recovery || 0) >= 0 ? (
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                ) : (
                  <MinusCircle className="h-5 w-5 text-gray-500" />
                )}
                <span className="text-2xl font-bold text-gray-700">
                  {formatCurrency(results.recovery || 0)}
                </span>
              </div>
            </div>

            {/* Processing Cost Savings (Cards Only) - TEAL */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost Savings (Cards Only)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-2xl font-bold text-teal-600">
                  {formatCurrency(results.savingsCardsOnly || 0)}
                </span>
              </div>
            </div>

            {/* Processing Cost Savings % - NEUTRAL */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost Savings %</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-700">
                  {((results.procSavingsPct || 0) * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Total Net Gain (Monthly) - TEAL */}
            <div className="bg-gradient-to-r from-teal-100 to-teal-50 rounded-lg p-4 border-2 border-teal-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Total Net Gain (Monthly)</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-600" />
                <span className="text-2xl font-bold text-teal-700">
                  {formatCurrency(results.totalNetGainRevenue || 0)}
                </span>
              </div>
            </div>

            {/* Annual Net Gain - TEAL */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Annual Net Gain</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-500" />
                <span className="text-2xl font-bold text-teal-600">
                  {formatCurrency(results.annualNetGainRevenue || 0)}
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
          // v1.5.0: Dual Pricing mode - aligned 8-item layout
          <>
            {/* 1. Current Processing Cost (Today) - RED */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Current Processing Cost (Today)</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600" data-testid="text-current-cost">
                  {formatCurrency(results.currentCost || 0)}
                </span>
              </div>
            </div>

            {/* 2. Processor Charge on Cards - RED */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processor Charge on Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <MinusCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(results.procCharge || 0)}
                </span>
              </div>
            </div>

            {/* 3. Markup Collected — Cards - GREEN */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Markup Collected — Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.markupCollected || 0)}
                </span>
              </div>
            </div>

            {/* 4. Processing Cost after Price Differential - NEUTRAL */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost after Price Differential</span>
              </div>
              <div className="flex items-center gap-2">
                {(results.recovery || 0) >= 0 ? (
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                ) : (
                  <MinusCircle className="h-5 w-5 text-gray-500" />
                )}
                <span className="text-2xl font-bold text-gray-700">
                  {formatCurrency(results.recovery || 0)}
                </span>
              </div>
            </div>

            {/* 5. Processing Cost Savings (Cards Only) - TEAL */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost Savings (Cards Only)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-2xl font-bold text-teal-600">
                  {formatCurrency(results.savingsCardsOnly || 0)}
                </span>
              </div>
            </div>

            {/* 6. Processing Cost Savings % - NEUTRAL */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Processing Cost Savings %</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-bold text-gray-700">
                  {((results.procSavingsPct || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 7. Total Net Gain (Monthly) - TEAL */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Total Net Gain (Monthly)</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-500" />
                <span className="text-2xl font-bold text-teal-600">
                  {formatCurrency(results.netMonthly || 0)}
                </span>
              </div>
            </div>

            {/* 8. Annual Net Gain - TEAL */}
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Annual Net Gain</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-500" />
                <span className="text-2xl font-bold text-teal-600">
                  {formatCurrency(results.netAnnual || 0)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
