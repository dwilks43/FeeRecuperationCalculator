import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ProcessingSavingsProps {
  results: CalculatorResults;
  onTooltip: (key: TooltipKey) => void;
  programType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE' | 'CASH_DISCOUNTING';
}

export default function ProcessingSavings({ results, onTooltip, programType }: ProcessingSavingsProps) {
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
  
  // For savings percent, include total savings (with cash revenue for Cash Discounting)
  const getTotalSavingsPercent = () => {
    if (results.currentCost <= 0) return 0;
    
    if (programType === 'CASH_DISCOUNTING') {
      // Include both card savings and cash revenue
      const totalSavings = (results.savingsCardsOnly || 0) + (results.extraCashRevenue || 0);
      return (totalSavings / results.currentCost) * 100;
    } else if (programType === 'SUPPLEMENTAL_FEE') {
      // Use total net gain revenue
      return (results.totalNetGainRevenue || 0) / results.currentCost * 100;
    } else {
      // Dual Pricing
      return (heroSavings / results.currentCost) * 100;
    }
  };
  
  const savingsPercent = getTotalSavingsPercent();
  
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
        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
          <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
          <span>Your Monthly Impact</span>
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

        {/* HOW THE MATH WORKS SECTION - Always Visible */}
        <div className="bg-white/50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="text-xs font-medium text-gray-500 uppercase mb-3">
              {programType === 'CASH_DISCOUNTING' ? 'Menu Optimization Math' : 
               programType === 'SUPPLEMENTAL_FEE' ? 'Fee Transparency Math' :
               'How The Math Works'}
            </div>
            
            {programType === 'SUPPLEMENTAL_FEE' ? (
              <>
                {/* Supplemental Fee Math */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Processing Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Cost After Fee Collection</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {(() => {
                        const processingCharges = results.processorChargeOnCards || results.processingFees || 0;
                        const feesCollected = (results.cardFeeCollected || 0) + (results.supplementalFeeCash || 0);
                        const netCost = processingCharges - feesCollected;
                        return formatCurrency(Math.max(0, netCost));
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(results.totalNetGainRevenue || 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : programType === 'CASH_DISCOUNTING' ? (
              <>
                {/* Cash Discounting Math */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Payment Acceptance Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing After Menu Markup</span>
                    <span className="text-sm font-semibold">
                      {(() => {
                        // Use netChangeCards which matches Calculation Details panel
                        // netChangeCards = procCharge - markupCollected
                        // Negative means profit (markup exceeds processing)
                        const netChange = results.netChangeCards || 0;
                        
                        if (netChange < 0) {
                          // Negative = profit, show as green with actual negative sign
                          return <span className="text-green-600">{formatCurrency(netChange)}</span>;
                        } else {
                          // Positive or zero = remaining cost, show as gray
                          return <span className="text-gray-600">{formatCurrency(netChange)}</span>;
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cash Discount Revenue</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.extraCashRevenue || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(results.netMonthly || 0)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Dual Pricing Math */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Processing Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Net Cost After Price Differential</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(results.netChangeCards || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(results.netMonthly || results.savingsCardsOnly || 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

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