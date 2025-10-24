import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PiggyBank, 
  HelpCircle, 
  MinusCircle, 
  CheckCircle, 
  Trophy, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { CalculatorResults, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";
import { useState } from "react";

interface ProcessingSavingsProps {
  results: CalculatorResults;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE' | 'CASH_DISCOUNTING';
}

export default function ProcessingSavings({ results, onTooltip, programType }: ProcessingSavingsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isNegativeCost = results.newCost < 0;
  
  // Calculate the main hero number based on program type
  const getHeroSavings = () => {
    if (programType === 'SUPPLEMENTAL_FEE') {
      return results.totalNetGainRevenue || 0;
    } else if (programType === 'CASH_DISCOUNTING') {
      // For Cash Discounting, include extra cash revenue
      return (results.savingsCardsOnly || 0) + (results.extraCashRevenue || 0);
    } else {
      return results.savingsOverall || 0;
    }
  };
  
  const heroSavings = getHeroSavings();
  const annualSavings = heroSavings * 12;
  const savingsPercent = results.currentCost > 0 ? (heroSavings / results.currentCost) * 100 : 0;
  
  // Get contextual comparison (varies by business size)
  const getContextualComparison = () => {
    if (annualSavings >= 50000) return "That's like hiring a full-time employee";
    if (annualSavings >= 20000) return "That's a new kitchen equipment upgrade";
    if (annualSavings >= 10000) return "That's your holiday marketing budget covered";
    if (annualSavings >= 5000) return "That's months of utility bills covered";
    if (annualSavings >= 2000) return "That's your monthly supply costs covered";
    return "That's real money back in your pocket";
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl border-2 border-green-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-transparent rounded-full opacity-30 -mr-32 -mt-32" />
      
      <CardHeader className="relative pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl text-gray-800">
            <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
            <span>Your Monthly Impact</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showDetails ? (
              <>Hide Details <ChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>View Details <ChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        {/* HERO SECTION - The Big Number */}
        <div className="text-center py-4">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              Monthly Savings
            </span>
          </div>
          <div className="text-6xl font-black text-green-600 mb-2" data-testid="text-hero-savings">
            {formatCurrency(heroSavings)}
          </div>
          <div className="text-lg font-semibold text-gray-700">
            {getContextualComparison()}
          </div>
        </div>

        {/* KEY METRICS - Quick Visual Impact */}
        <div className="grid grid-cols-2 gap-4">
          {/* Annual Projection */}
          <div className="bg-white/80 rounded-lg p-4 border border-green-200">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Annual Impact</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(annualSavings)}
            </div>
            <div className="text-xs text-gray-600 mt-1">per year</div>
          </div>
          
          {/* Percentage Saved */}
          <div className="bg-white/80 rounded-lg p-4 border border-green-200">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Cost Reduction</div>
            <div className="text-2xl font-bold text-green-700">
              {savingsPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600 mt-1">saved vs today</div>
          </div>
        </div>

        {/* COMPARISON SECTION */}
        <div className="bg-white/50 rounded-lg p-4 space-y-3">
          {/* What You Pay Today */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">What you pay today:</span>
            <span className="text-lg font-bold text-red-600 line-through">
              {formatCurrency(results.currentCost || 0)}
            </span>
          </div>
          
          {/* Your New Cost */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Your new cost:</span>
            <span className={`text-lg font-bold ${isNegativeCost ? 'text-green-600' : 'text-gray-700'}`}>
              {isNegativeCost ? (
                <>
                  <span className="text-sm font-normal">You earn</span> {formatCurrency(Math.abs(results.newCost))}
                </>
              ) : (
                formatCurrency(results.newCost || 0)
              )}
            </span>
          </div>

          {/* Extra Cash Revenue for Cash Discounting */}
          {programType === 'CASH_DISCOUNTING' && results.extraCashRevenue > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="text-sm font-medium text-gray-600">Extra cash revenue:</span>
              <span className="text-lg font-bold text-green-600">
                +{formatCurrency(results.extraCashRevenue)}
              </span>
            </div>
          )}
        </div>

        {/* DETAILED BREAKDOWN - Collapsible */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t border-green-200 animate-in slide-in-from-top-2">
            {programType === 'SUPPLEMENTAL_FEE' ? (
              <>
                {/* Supplemental Fee Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Detailed Breakdown</div>
                  
                  {/* Processor Charge */}
                  <div className="flex justify-between items-center bg-red-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Processor Charge on Cards</span>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(results.processorChargeOnCards || 0)}
                    </span>
                  </div>
                  
                  {/* Fee Collected on Cards */}
                  <div className="flex justify-between items-center bg-green-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Supplemental Fee (Cards)</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.cardFeeCollected || 0)}
                    </span>
                  </div>
                  
                  {/* Fee on Cash */}
                  {results.supplementalFeeCash > 0 && (
                    <div className="flex justify-between items-center bg-green-50/50 rounded p-2">
                      <span className="text-sm text-gray-600">Supplemental Fee (Cash)</span>
                      <span className="text-sm font-semibold text-green-600">
                        +{formatCurrency(results.supplementalFeeCash || 0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Coverage Percentage */}
                  <div className="flex justify-between items-center bg-blue-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Coverage %</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {((results.coveragePct || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </>
            ) : programType === 'CASH_DISCOUNTING' ? (
              <>
                {/* Cash Discounting Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Detailed Breakdown</div>
                  
                  {/* Current Cost */}
                  <div className="flex justify-between items-center bg-red-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Current Processing Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  {/* New Processing Cost */}
                  <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                    <span className="text-sm text-gray-600">New Processing Cost</span>
                    <span className="text-sm font-semibold text-gray-700">
                      -{formatCurrency(results.procCharge || 0)}
                    </span>
                  </div>
                  
                  {/* Menu Markup Collected */}
                  <div className="flex justify-between items-center bg-green-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Menu Markup Collected (Cards)</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.markupCollected || 0)}
                    </span>
                  </div>
                  
                  {/* Extra Cash Revenue */}
                  <div className="flex justify-between items-center bg-green-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Extra Cash Revenue</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.extraCashRevenue || 0)}
                    </span>
                  </div>
                  
                  {/* Coverage Percentage */}
                  <div className="flex justify-between items-center bg-blue-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Card Processing Coverage</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {((results.coveragePct || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Dual Pricing Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Detailed Breakdown</div>
                  
                  {/* Current Cost */}
                  <div className="flex justify-between items-center bg-red-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Current Processing Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  {/* New Processing Cost */}
                  <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                    <span className="text-sm text-gray-600">New Processing Cost</span>
                    <span className="text-sm font-semibold text-gray-700">
                      -{formatCurrency(results.procCharge || 0)}
                    </span>
                  </div>
                  
                  {/* Price Increase Collected */}
                  <div className="flex justify-between items-center bg-green-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Card Price Increase Collected</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.markupCollected || 0)}
                    </span>
                  </div>
                  
                  {/* Coverage Percentage */}
                  <div className="flex justify-between items-center bg-blue-50/50 rounded p-2">
                    <span className="text-sm text-gray-600">Coverage %</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {((results.coveragePct || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CALL TO ACTION */}
        <div className="text-center pt-4 border-t border-green-200">
          <p className="text-sm text-gray-600 italic">
            "This is money you're currently giving away to payment processors every month"
          </p>
          {savingsPercent >= 90 && (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4" />
              Near-Complete Cost Elimination!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}