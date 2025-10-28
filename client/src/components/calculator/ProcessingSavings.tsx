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
    // Round down to nearest $5,000
    const roundedAmount = Math.floor(annualSavings / 5000) * 5000;
    
    if (roundedAmount >= 5000) {
      // Format the rounded amount with commas
      const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(roundedAmount);
      
      return `That's ${formattedAmount}+ more profit every year`;
    } else if (annualSavings >= 2000) {
      return "That's significant savings month after month";
    } else {
      return "That's real money back in your business";
    }
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
              How The Math Works
            </div>
            
            {programType === 'SUPPLEMENTAL_FEE' ? (
              <>
                {/* Supplemental Fee Math */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Current Processing Cost</span>
                      <button
                        onClick={() => onTooltip('currentCost' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-currentCost"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Processing After Fee Collection</span>
                      <button
                        onClick={() => onTooltip('netChangeCards' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netChangeCards"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {(() => {
                        const processingCharges = results.processorChargeOnCards || results.processingFees || 0;
                        const cardFeesCollected = results.cardFeeCollected || 0;
                        const netCost = processingCharges - cardFeesCollected;
                        
                        if (netCost < 0) {
                          // Negative = profit, show as green with actual negative sign
                          return <span className="text-green-600">{formatCurrency(netCost)}</span>;
                        } else {
                          // Positive or zero = remaining cost, show as gray
                          return <span className="text-gray-600">{formatCurrency(netCost)}</span>;
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Supplemental Fee on Cash</span>
                      <button
                        onClick={() => onTooltip('supplementalFeeCash' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-supplementalFeeCash"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      +{formatCurrency(results.supplementalFeeCash || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                      <button
                        onClick={() => onTooltip('netMonthly' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netMonthly"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Current Payment Acceptance Cost</span>
                      <button
                        onClick={() => onTooltip('currentCost' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-currentCost-cash"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Processing After Menu Markup</span>
                      <button
                        onClick={() => onTooltip('netChangeCards' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netChangeCards-cash"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Cash Discount Revenue</span>
                      <button
                        onClick={() => onTooltip('extraCashRevenue' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-extraCashRevenue"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className={`text-sm font-semibold ${(results.extraCashRevenue || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(() => {
                        const cashRevenue = results.extraCashRevenue || 0;
                        if (cashRevenue > 0) {
                          return `+${formatCurrency(cashRevenue)}`;
                        } else {
                          return formatCurrency(cashRevenue);
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                      <button
                        onClick={() => onTooltip('netMonthly' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netMonthly-cash"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Current Processing Cost</span>
                      <button
                        onClick={() => onTooltip('currentCost' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-currentCost-dual"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(results.currentCost || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">Net Cost After Price Differential</span>
                      <button
                        onClick={() => onTooltip('netChangeCards' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netChangeCards-dual"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {formatCurrency(results.netChangeCards || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t bg-green-50/50 rounded p-2 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-700">Total Net Monthly Gain</span>
                      <button
                        onClick={() => onTooltip('netMonthly' as TooltipKey)}
                        className="p-0 hover:opacity-80"
                        data-testid="button-tooltip-netMonthly-dual"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
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