import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  showDMPProfit, 
  onToggle, 
  onTooltip 
}: DMPProfitabilityProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-dmp-blue-600" />
            <h4 className="text-lg font-semibold text-dmp-blue-800">DMP Monthly Profitability</h4>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="dmp-toggle"
              checked={showDMPProfit}
              onCheckedChange={onToggle}
              data-testid="switch-dmp-profit"
            />
            <Label htmlFor="dmp-toggle" className="sr-only">
              Show DMP Profitability
            </Label>
          </div>
        </div>
        
        {showDMPProfit && (
          <div className="bg-white rounded-lg p-4 border border-blue-100 transition-all duration-200 ease-in-out">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600">DMP Monthly Profit</span>
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
            <p className="text-xs text-dmp-blue-600 mt-1">Monthly revenue from dual pricing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
