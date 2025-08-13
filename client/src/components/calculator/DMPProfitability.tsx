import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, HelpCircle, Building } from "lucide-react";
import { CalculatorResults, TooltipKey } from "@/types/calculator";
import { formatCurrency } from "@/utils/calculations";

interface DMPProfitabilityProps {
  results: CalculatorResults;
  showDMPProfit: boolean;
  onToggle: (show: boolean) => void;
  onTooltip: (key: TooltipKey) => void;
}

export default function DMPProfitability({ 
  results, 
  onTooltip 
}: DMPProfitabilityProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5 text-dmp-blue-600" />
          <h4 className="text-lg font-semibold text-dmp-blue-800">DMP</h4>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-600">
              Gross Profit
              <br />
              <span className="text-xs text-gray-500">
                (without removal of schedule A or ISO % charged)
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => onTooltip('dmp-profit')}
              data-testid="button-tooltip-dmp-profit"
            >
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-dmp-blue-600" />
            <span className="text-2xl font-bold text-dmp-blue-600" data-testid="text-dmp-profit">
              {formatCurrency(results.dmpProfit)}
            </span>
          </div>
          <p className="text-xs text-dmp-blue-600 mt-1">Monthly gross profit from dual pricing</p>
        </div>
      </CardContent>
    </Card>
  );
}
