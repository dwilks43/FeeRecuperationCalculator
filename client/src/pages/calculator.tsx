import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw, Calendar, HelpCircle, Download, Mail } from "lucide-react";
import InputForm from "@/components/calculator/InputForm";
import ProcessingSavings from "@/components/calculator/ProcessingSavings";
import DualPricingBreakdown from "@/components/calculator/DualPricingBreakdown";
import DMPProfitability from "@/components/calculator/DMPProfitability";
import TooltipModal from "@/components/calculator/TooltipModal";
import EmailReportDialog from "@/components/calculator/EmailReportDialog";
import { CustomerInfoForm } from "@/components/calculator/CustomerInfoForm";
import dmpLogoPath from "@assets/DMP—Logo Mark—2 Color_1755032066759.jpg";
import { CalculatorInputs, TooltipKey, CustomerInfo } from "@/types/calculator";
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<Partial<CustomerInfo>>({});

  const results = calculateResults(inputs);
  
  // Prepare calculator data for PDF and email
  const calculatorData = {
    businessName: customerInfo.businessName || '',
    streetAddress: customerInfo.streetAddress || '',
    city: customerInfo.city || '',
    state: customerInfo.state || '',
    zipCode: customerInfo.zipCode || '',
    contactName: customerInfo.contactName || '',
    contactTitle: customerInfo.contactTitle || '',
    contactEmail: customerInfo.contactEmail || '',
    salesRepName: customerInfo.salesRepName || '',
    salesRepEmail: customerInfo.salesRepEmail || '',
    salesRepPhone: customerInfo.salesRepPhone || '',
    monthlyVolume: inputs.monthlyVolume,
    currentRate: inputs.currentRate,
    interchangeCost: inputs.interchangeCost,
    flatRate: inputs.flatRate,
    taxRate: inputs.taxRate,
    tipRate: inputs.tipRate,
    priceDifferential: inputs.priceDifferential,
    baseVolume: results.baseVolume,
    adjustedVolume: results.adjustedVolume,
    processingFees: results.processingFees,
    markupCollected: results.markupCollected,
    currentCost: results.currentCost,
    newCost: results.newCost,
    monthlySavings: results.monthlySavings,
    annualSavings: results.annualSavings,
    dmpProfit: showDMPProfit ? results.dmpProfit : null,
    skytabBonus: showDMPProfit ? results.skytabBonus : null,
    skytabBonusRep: showDMPProfit ? results.skytabBonusRep : null
  };

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

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const response = await fetch('/api/generate-savings-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculatorData),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DMP-Savings-Report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* DMP Logo Watermark */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src={dmpLogoPath} 
          alt="DMP Logo" 
          className="w-16 h-auto opacity-80 hover:opacity-100 transition-opacity"
          data-testid="img-dmp-logo"
        />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-title">
            Fee Recuperation Savings Calculator
          </h1>
          <p className="text-gray-600 text-lg" data-testid="text-subtitle">
            Calculate your potential monthly savings with DMP's Fee Recuperation Program
          </p>
        </div>

        {/* Customer Information Section */}
        <div className="mb-8">
          <CustomerInfoForm
            onDataChange={setCustomerInfo}
            initialData={customerInfo}
          />
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

            {/* Annual Summary Card */}
            <Card className="shadow-lg border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Annual Impact</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <p className="text-sm text-gray-600">Annual Savings</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleTooltip('annual-savings')}
                        data-testid="button-tooltip-annual-savings"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-dmp-blue-500" />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-annual-savings">
                      {formatCurrency(results.annualSavings)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <p className="text-sm text-gray-600">Processing Volume</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleTooltip('annual-volume')}
                        data-testid="button-tooltip-annual-volume"
                      >
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-dmp-blue-500" />
                      </Button>
                    </div>
                    <p className="text-xl font-bold text-dmp-blue-600" data-testid="text-annual-volume">
                      {formatLargeNumber(results.annualVolume)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* DMP Toggle and Action Buttons */}
        <div className="mt-8 space-y-6">
          {/* DMP Toggle Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant={showDMPProfit ? "default" : "outline"}
              onClick={() => setShowDMPProfit(!showDMPProfit)}
              className={`font-semibold py-3 px-8 ${
                showDMPProfit 
                  ? "bg-dmp-blue-600 hover:bg-dmp-blue-700 text-white shadow-lg" 
                  : "bg-white hover:bg-gray-50 text-dmp-blue-600 border-dmp-blue-300"
              }`}
              data-testid="button-toggle-dmp"
            >
              DMP
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

          {/* DMP Profitability Card (conditionally shown) */}
          {showDMPProfit && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <DMPProfitability
                  results={results}
                  showDMPProfit={showDMPProfit}
                  onToggle={setShowDMPProfit}
                  onTooltip={handleTooltip}
                />
              </div>
            </div>
          )}

          {/* Generate Report Buttons */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGeneratingPDF}
                className="bg-dmp-blue-600 hover:bg-dmp-blue-700 text-white font-semibold py-3 px-4 shadow-lg disabled:opacity-50"
                data-testid="button-download-pdf"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              
              <EmailReportDialog calculatorData={calculatorData}>
                <Button 
                  variant="outline" 
                  className="w-full bg-white hover:bg-gray-50 text-dmp-blue-600 border-dmp-blue-300 font-semibold py-3 px-4 shadow-lg"
                  data-testid="button-email-report"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
                </Button>
              </EmailReportDialog>
            </div>
          </div>
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
