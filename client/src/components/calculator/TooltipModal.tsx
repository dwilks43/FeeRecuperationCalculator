import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TooltipKey, TooltipContent } from "@/types/calculator";
import { TOOLTIPS } from "@/utils/tooltips";

interface TooltipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tooltipKey: TooltipKey | null;
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

export default function TooltipModal({ isOpen, onClose, tooltipKey }: TooltipModalProps) {
  const content = tooltipKey ? tooltipContent[tooltipKey] : null;

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
