import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TooltipKey, TooltipContent } from "@/types/calculator";

interface TooltipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tooltipKey: TooltipKey | null;
}

const tooltipContent: Record<TooltipKey, TooltipContent> = {
  'monthly-volume': {
    title: 'Monthly Credit Card Volume',
    content: 'The total dollar amount of credit card transactions processed per month. This is your gross credit card sales volume.'
  },
  'current-rate': {
    title: 'Current Processing Rate (%)',
    content: 'Your current effective rate for processing credit cards, including all fees. Usually between 2-4%.'
  },
  'interchange-cost': {
    title: 'Interchange Cost (%)',
    content: 'The wholesale cost charged by card networks (Visa/Mastercard). Typically 1.8-2.5% depending on card types.'
  },
  'flat-rate': {
    title: 'Flat Rate Processing (%)',
    content: 'DMP\'s flat processing rate that will be charged on the adjusted volume. This covers all processing costs.'
  },
  'tax-rate': {
    title: 'Tax Rate (%)',
    content: 'Local sales tax percentage that increases transaction totals. Enter 0 if not applicable.'
  },
  'tip-rate': {
    title: 'Tip Rate (%)',
    content: 'Average tip percentage that increases transaction totals. Common in restaurants (15-25%). Enter 0 if not applicable.'
  },
  'price-differential': {
    title: 'Price Differential (%)',
    content: 'The markup percentage added to cash prices when customers pay with cards. This covers your processing costs.'
  },
  'base-volume': {
    title: 'Base Volume',
    content: 'Your actual sales volume before taxes and tips are added. Calculated as: Credit Card Volume ÷ (1 + Tax Rate + Tip Rate)'
  },
  'marked-up-volume': {
    title: 'Marked Up Volume',
    content: 'Base volume after applying the price differential. Calculated as: Base Volume × (1 + Price Differential)'
  },
  'adjusted-volume': {
    title: 'Adjusted Volume',
    content: 'Final transaction volume after adding back taxes and tips. This is what gets processed through DMP.'
  },
  'markup-collected': {
    title: 'Markup Collected',
    content: 'Total monthly revenue collected from the price differential. Calculated as: Base Volume × Price Differential'
  },
  'processing-fees': {
    title: 'Processing Fees',
    content: 'Total monthly fees paid to DMP for processing. Calculated as: Adjusted Volume × Flat Rate'
  },
  'current-cost': {
    title: 'Current Processing Cost',
    content: 'What you currently pay monthly for credit card processing. Calculated as: Credit Card Volume × Current Processing Rate'
  },
  'new-cost': {
    title: 'New Processing Cost',
    content: 'Your actual out-of-pocket cost with DMP\'s dual pricing system. Calculated as: Processing Fees - Markup Collected. Negative amounts mean you earn money from processing.'
  },
  'monthly-savings': {
    title: 'Monthly Savings',
    content: 'The difference between your current processing cost and your new processing cost. Calculated as: Current Cost - New Cost'
  },
  'annual-savings': {
    title: 'Annual Savings',
    content: 'Your total savings projected over 12 months. Calculated as: Monthly Savings × 12'
  },
  'annual-volume': {
    title: 'Annual Processing Volume',
    content: 'Your total credit card processing volume projected over 12 months. Calculated as: Monthly Volume × 12'
  },
  'dmp-profit': {
    title: 'Gross Profit',
    content: 'The profit DMP earns from your account each month (without removal of schedule A or ISO % charged). Calculated as: (Flat Rate Processing % - Interchange Cost %) × Monthly Credit Card Volume'
  },
  'skytab-bonus': {
    title: 'Skytab Bonus Calculation (Gross)',
    content: 'A bonus calculation for Skytab merchants over 18 months with a 60% factor applied. Formula: (Flat Rate % - Interchange Cost %) × 60% × Monthly Credit Card Volume × 18. Maximum bonus is capped at $10,000.'
  }
};

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
