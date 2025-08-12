import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw, Calendar } from "lucide-react";
import InputForm from "@/components/calculator/InputForm";
import ProcessingSavings from "@/components/calculator/ProcessingSavings";
import DualPricingBreakdown from "@/components/calculator/DualPricingBreakdown";
import DMPProfitability from "@/components/calculator/DMPProfitability";
import TooltipModal from "@/components/calculator/TooltipModal";
import { CalculatorInputs, TooltipKey } from "@/types/calculator";
import { calculateResults, debounce, formatCurrency, formatLargeNumber } from "@/utils/calculations";

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyVolume: 0,
    currentRate: 0,
    interchangeCost: 0,
    flatRate: 0,
    taxRate: 0,
    tipRate: 0,
    priceDifferential: 0
  });

  const [showDMPProfit, setShowDMPProfit] = useState(false);
  const [tooltipKey, setTooltipKey] = useState<TooltipKey | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const results = calculateResults(inputs);

  const debouncedInputChange = useCallback(
    debounce((field: keyof CalculatorInputs, value: number) => {
      setInputs(prev => ({ ...prev, [field]: value }));
    }, 150),
    []
  );

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    // Update immediately for responsive UI
    setInputs(prev => ({ ...prev, [field]: value }));
    // Debounce for heavy calculations if needed
    debouncedInputChange(field, value);
  };

  const handleTooltip = (key: TooltipKey) => {
    setTooltipKey(key);
    setIsTooltipOpen(true);
  };

  const handleReset = () => {
    setInputs({
      monthlyVolume: 0,
      currentRate: 0,
      interchangeCost: 0,
      flatRate: 0,
      taxRate: 0,
      tipRate: 0,
      priceDifferential: 0
    });
    setShowDMPProfit(false);
  };

  const handleGenerateReport = () => {
    // TODO: Implement PDF generation
    console.log('Generate report clicked', { inputs, results });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-title">
            DMP Dual Pricing Savings Calculator
          </h1>
          <p className="text-gray-600 text-lg" data-testid="text-subtitle">
            Calculate your potential monthly savings with DMP's dual pricing model
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Input Parameters */}
          <div className="space-y-6">
            <InputForm
              inputs={inputs}
              onInputChange={handleInputChange}
              onTooltip={handleTooltip}
            />

            <DualPricingBreakdown
              results={results}
              onTooltip={handleTooltip}
            />
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            <ProcessingSavings
              results={results}
              onTooltip={handleTooltip}
            />

            <DMPProfitability
              results={results}
              showDMPProfit={showDMPProfit}
              onToggle={setShowDMPProfit}
              onTooltip={handleTooltip}
            />

            {/* Annual Summary Card */}
            <Card className="shadow-lg border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Annual Impact</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-annual-savings">
                      {formatCurrency(results.annualSavings)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Processing Volume</p>
                    <p className="text-xl font-bold text-dmp-blue-600" data-testid="text-annual-volume">
                      {formatLargeNumber(results.annualVolume)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGenerateReport}
            className="bg-dmp-blue-600 hover:bg-dmp-blue-700 text-white font-semibold py-3 px-8 shadow-lg"
            data-testid="button-generate-report"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Savings Report
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white hover:bg-gray-50 text-dmp-blue-600 font-semibold py-3 px-8 border-dmp-blue-300"
            data-testid="button-reset"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Calculator
          </Button>
        </div>
      </div>

      <TooltipModal
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        tooltipKey={tooltipKey}
      />
    </div>
  );
}
