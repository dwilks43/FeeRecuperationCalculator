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
      return results.monthlySavings || 0;
    }
  };
  
  const heroSavings = getHeroSavings();
  const annualSavings = heroSavings * 12;
  const savingsPercent = results.currentCost > 0 ? (heroSavings / results.currentCost) * 100 : 0;
  
  // Get contextual comparison (emphasis on massive savings)
  const getContextualComparison = () => {
    if (annualSavings >= 50000) return "That's $50,000+ more profit every year";
    if (annualSavings >= 20000) return "That's over $20,000 in pure profit annually";
    if (annualSavings >= 10000) return "That's $10,000+ straight to your bottom line";
    if (annualSavings >= 5000) return "That's thousands in extra profit every year";
    if (annualSavings >= 2000) return "That's significant savings month after month";
    return "That's real money back in your business";
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

        {/* COMPARISON SECTION - Clear Flow */}
        <div className="bg-white/50 rounded-lg p-4 space-y-4">
          {/* Current Cost */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              {programType === 'CASH_DISCOUNTING' ? 'Current Payment Acceptance Cost:' : 
               programType === 'SUPPLEMENTAL_FEE' ? 'You Pay Alone Today:' :
               'Current Monthly Cost:'}
            </span>
            <span className="text-lg font-bold text-red-600">
              {formatCurrency(results.currentCost || 0)}
            </span>
          </div>
          
          {/* With Fee Recovery Program - High Level Summary */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {programType === 'CASH_DISCOUNTING' ? 'With Menu Optimization Program:' : 
               programType === 'SUPPLEMENTAL_FEE' ? 'With Transparent Fee Recovery:' :
               'With Fee Recovery Program:'}
            </div>
            
            {/* Show the high-level outcome, not the detailed math */}
            <div className="flex justify-between items-center pl-4">
              <span className="text-sm text-gray-600">
                {programType === 'DUAL_PRICING' ? 'Your New Reality' : 
                 programType === 'CASH_DISCOUNTING' ? 'Menu Optimization Creates' : 
                 programType === 'SUPPLEMENTAL_FEE' ? 'Fee Transparency Creates' :
                 'Your New Cost'}
              </span>
              <span className="text-lg font-bold">
                {(() => {
                  if (programType === 'DUAL_PRICING') {
                    // For Dual Pricing, show the total net gain as profit
                    const gain = results.netMonthly || results.savingsCardsOnly || 0;
                    return (
                      <span className="text-green-600">
                        You profit {formatCurrency(gain)}
                      </span>
                    );
                  } else if (programType === 'CASH_DISCOUNTING') {
                    // For Cash Discounting, show it as menu optimization creating profit
                    const processingCharges = results.procCharge || 0;
                    const feesCollected = results.markupCollected || 0;
                    const extraRevenue = results.extraCashRevenue || 0;
                    const netCost = processingCharges - feesCollected - extraRevenue;
                    
                    return netCost <= 0 ? (
                      <span className="text-green-600">
                        {formatCurrency(Math.abs(netCost))} monthly profit
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        {formatCurrency(netCost)} remaining cost
                      </span>
                    );
                  } else if (programType === 'SUPPLEMENTAL_FEE') {
                    // For Supplemental Fee, show the total transformation
                    const currentCost = results.currentCost || 0;
                    const monthlySavings = results.totalNetGainRevenue || 0;
                    
                    // Show the transformation story
                    if (monthlySavings > currentCost) {
                      // Over 100% savings - they profit
                      return (
                        <span className="text-green-600">
                          You save {formatCurrency(monthlySavings)} monthly
                        </span>
                      );
                    } else if (monthlySavings > 0) {
                      // Partial or full savings
                      return (
                        <span className="text-green-600">
                          You save {formatCurrency(monthlySavings)} monthly
                        </span>
                      );
                    } else {
                      // Some cost remains
                      const remainingCost = currentCost - monthlySavings;
                      return (
                        <span className="text-gray-700">
                          {formatCurrency(remainingCost)} remaining cost
                        </span>
                      );
                    }
                  } else {
                    // Default fallback
                    const processingCharges = results.processorChargeOnCards || results.processingFees || 0;
                    const feesCollected = (results.cardFeeCollected || 0) + (results.supplementalFeeCash || 0);
                    const netCost = processingCharges - feesCollected;
                    
                    return netCost <= 0 ? (
                      <span className="text-green-600">
                        You profit {formatCurrency(Math.abs(netCost))}
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        {formatCurrency(netCost)}
                      </span>
                    );
                  }
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* DETAILED BREAKDOWN - Collapsible */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t border-green-200 animate-in slide-in-from-top-2">
            {programType === 'SUPPLEMENTAL_FEE' ? (
              <>
                {/* Supplemental Fee Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Fee Transparency Impact</div>
                  
                  {/* Current vs New */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Processing Burden</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  {/* Processing After Transparent Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Cost (After Fee)</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(results.processorChargeOnCards || results.processingFees || 0)}
                    </span>
                  </div>
                  
                  {/* Transparent Fee from Cards */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transparent Fee from Cards</span>
                    <span className="text-sm font-semibold text-green-600">
                      -{formatCurrency(results.cardFeeCollected || 0)}
                    </span>
                  </div>
                  
                  {/* Transparent Fee from Cash */}
                  {(results.supplementalFeeCash || 0) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transparent Fee from Cash</span>
                      <span className="text-sm font-semibold text-green-600">
                        -{formatCurrency(results.supplementalFeeCash || 0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Total Savings Result */}
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Monthly Savings</span>
                    {(() => {
                      const currentCost = results.currentCost || 0;
                      const processingCharges = results.processorChargeOnCards || results.processingFees || 0;
                      const feesCollected = (results.cardFeeCollected || 0) + (results.supplementalFeeCash || 0);
                      const netCost = processingCharges - feesCollected;
                      const monthlySavings = results.totalNetGainRevenue || (currentCost - netCost);
                      
                      return (
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(monthlySavings)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : programType === 'CASH_DISCOUNTING' ? (
              <>
                {/* Cash Discounting Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Menu Optimization Impact</div>
                  
                  {/* Current Payment Acceptance Cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Payment Acceptance Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  {/* Processing After Menu Change */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Cost (After Menu Change)</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(results.procCharge || 0)}
                    </span>
                  </div>
                  
                  {/* Revenue from Cards at New Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue from Card Transactions</span>
                    <span className="text-sm font-semibold text-green-600">
                      -{formatCurrency(results.markupCollected || 0)}
                    </span>
                  </div>
                  
                  {/* Revenue from Cash Optimization */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue from Cash Optimization</span>
                    <span className="text-sm font-semibold text-green-600">
                      -{formatCurrency(results.extraCashRevenue || 0)}
                    </span>
                  </div>
                  
                  {/* Total Menu Optimization Result - matches Total Net Gain from Calculation Details */}
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Net Gain (Monthly)</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(results.netMonthly || 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Dual Pricing Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase">Detailed Breakdown</div>
                  
                  {/* Current vs New */}
                  <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                    <span className="text-sm text-gray-600">Current Processing Cost (Today)</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  {/* Processing Cost After Price Differential */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Cost After Price Differential</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(results.netChangeCards || 0)}
                    </span>
                  </div>
                  
                  {/* Processing Savings */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Cost Savings (Cards Only)</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.savingsCardsOnly || 0)}
                    </span>
                  </div>
                  
                  {/* Total Net Gain */}
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Net Gain (Monthly)</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(results.netMonthly || results.savingsCardsOnly || 0)}
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
          {savingsPercent >= 100 ? (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4" />
              {savingsPercent >= 105 ? 'You\'re Making Money on Processing!' : 'Complete Cost Elimination Achieved!'}
            </div>
          ) : savingsPercent >= 90 ? (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4" />
              Near-Complete Cost Elimination!
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}