import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TooltipKey, TooltipContent } from "@/types/calculator";
import { TOOLTIPS, getTooltip } from "@/utils/tooltips";

interface TooltipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tooltipKey: TooltipKey | null;
  programType?: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE';
}

// Convert TOOLTIPS to match TooltipContent interface
const tooltipContent: Record<string, TooltipContent> = Object.fromEntries(
  Object.entries(TOOLTIPS).map(([key, value]) => [
    key === 'monthlyCardVolume' ? 'monthly-volume' :
    key === 'monthlyCashVolume' ? 'monthly-cash-volume' :
    key === 'currentRate' ? 'current-rate' :
    key === 'taxRate' ? 'tax-rate' :
    key === 'tipRate' ? 'tip-rate' :
    key === 'feeTiming' ? 'fee-timing' :
    key === 'supplementalFee' ? 'supplemental-fee' :
    key === 'flatRate' ? 'flat-rate-pct' :
    key === 'feeOnCards' ? 'fee-on-cards' :
    key === 'feeOnCash' ? 'fee-on-cash' :
    key === 'totalFeeCollected' ? 'total-fee-collected' :
    key === 'totalCardsProcessed' ? 'total-cards-processed' :
    key === 'totalProcessingCostNew' ? 'total-processing-cost-new' :
    key === 'netCostForProcessingCards' ? 'net-cost-for-processing-cards' :
    key === 'totalNetGainRev' ? 'total-net-gain-rev' :
    key === 'currentProcessingCost' ? 'current-processing-cost' :
    key === 'savingsTotal' ? 'monthly-savings' :
    key === 'annualSavings' ? 'annual-savings' :
    key === 'grossProfit' ? 'gross-profit' :
    key === 'skytabBonusGross' ? 'skytab-bonus' :
    key === 'skytabBonusRep' ? 'skytab-bonus-rep' :
    key,
    { title: value.title, content: value.body }
  ])
);

export default function TooltipModal({ isOpen, onClose, tooltipKey, programType }: TooltipModalProps) {
  // Try new unified tooltip system first, then fallback to legacy
  let content: { title: string; content: string } | null = null;
  
  if (tooltipKey) {
    // Convert tooltip key format
    const keyName = tooltipKey === 'monthly-volume' ? 'monthlyCardVolume' :
                    tooltipKey === 'monthly-cash-volume' ? 'monthlyCashVolume' :
                    tooltipKey === 'current-rate' ? 'currentRate' :
                    tooltipKey === 'tax-rate' ? 'taxRate' :
                    tooltipKey === 'tip-rate' ? 'tipRate' :
                    tooltipKey === 'flat-rate-pct' ? 'flatRate' :
                    tooltipKey === 'supplemental-fee' ? 'supplementalFee' :
                    tooltipKey === 'price-differential' ? 'priceDifferential' :
                    tooltipKey === 'gross-profit' ? 'grossProfit' :
                    tooltipKey === 'recovery' ? 'recovery' :
                    tooltipKey === 'savingsCardsOnly' ? 'savingsCardsOnly' :
                    tooltipKey === 'procSavingsPct' ? 'processingCostSavingsPct' :
                    tooltipKey === 'skytab-bonus' ? 'skytabBonusGross' :
                    tooltipKey === 'skytab-bonus-rep' ? 'skytabBonusRep' :
                    tooltipKey;
    
    // Try unified tooltip system
    const unifiedTooltip = getTooltip(keyName, programType);
    if (unifiedTooltip) {
      content = { title: unifiedTooltip.title, content: unifiedTooltip.body };
    } else {
      // Fallback to legacy system
      content = tooltipContent[tooltipKey] || null;
    }
  }

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-lg font-semibold text-gray-900 pr-8">
              {content.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              data-testid="button-close-tooltip"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <p className="text-gray-600 leading-relaxed">{content.content}</p>
      </DialogContent>
    </Dialog>
  );
}
