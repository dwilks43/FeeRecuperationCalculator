import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw, Calendar, HelpCircle, Download, Mail } from "lucide-react";
import InputForm from "@/components/calculator/InputForm";
import ProcessingSavings from "@/components/calculator/ProcessingSavings";
import DualPricingBreakdown from "@/components/calculator/DualPricingBreakdown";
import GrossProfit from "@/components/calculator/GrossProfit";
import TooltipModal from "@/components/calculator/TooltipModal";
import EmailReportDialog from "@/components/calculator/EmailReportDialog";
import { CustomerInfoForm } from "@/components/calculator/CustomerInfoForm";
import dmpLogoPath from "@assets/DMP—Logo Mark—2 Color_1755032066759.jpg";
import { CalculatorInputs, TooltipKey, CustomerInfo } from "@/types/calculator";
import { calculateResults, debounce, formatCurrency, formatLargeNumber } from "@/utils/calculations";
import { preparePdfData } from "@/utils/pdfDataTransformer";

export default function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    programType: 'DUAL_PRICING',
    monthlyVolume: 0,
    monthlyCashVolume: 0,
    currentRate: 0,
    interchangeCost: 0,
    flatRate: 0,
    taxRate: 0,
    tipRate: 0,
    priceDifferential: 0,
    tipBasis: 'fee_inclusive',
    feeTiming: 'FEE_BEFORE_TIP',
    feeTaxBasis: 'POST_TAX',
    cardVolumeBasis: 'PRE_TAX'
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
    programType: inputs.programType,
    inputs: inputs, // Full inputs object for dual-mode support
    results: results, // Full results object for dual-mode support
    monthlyVolume: inputs.monthlyVolume,
    monthlyCashVolume: inputs.monthlyCashVolume,
    currentRate: inputs.currentRate,
    interchangeCost: inputs.interchangeCost,
    flatRate: inputs.flatRate,
    taxRate: inputs.taxRate,
    tipRate: inputs.tipRate,
    priceDifferential: inputs.priceDifferential,
    flatRatePct: inputs.flatRatePct,
    tipBasis: inputs.tipBasis,
    feeTiming: inputs.feeTiming,
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
    setInputs(prev => ({
      programType: prev.programType,
      monthlyVolume: 0,
      monthlyCashVolume: 0,
      currentRate: 0,
      interchangeCost: 0,
      flatRate: 0,
      taxRate: 0,
      tipRate: 0,
      priceDifferential: 0
    }));
    setShowDMPProfit(false);
  };

  const handleGenerateReport = async () => {
    console.log('Download PDF clicked');
    try {
      setIsGeneratingPDF(true);
      
      console.log('Preparing data transformation...');
      // Transform the data using the PDF transformer
      const transformedData = preparePdfData(
        calculatorData,
        inputs,
        results,
        customerInfo
      );
      
      console.log('Transformed data:', transformedData);
      console.log('Sending request to /api/generate-savings-report...');
      
      const response = await fetch('/api/generate-savings-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      console.log('PDF response status:', response.status);
      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DMP-Savings-Report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      console.log('PDF download initiated');
      
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
      
      {/* v1.3.0 Rectangle Layout */}
      <div className="container mx-auto px-6 py-8" style={{maxWidth: '1200px'}}>
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-title">
            Restaurant Fee Recuperation Savings Calculator
          </h1>
          <p className="text-gray-600 text-lg" data-testid="text-subtitle">
            Calculate your potential monthly savings with DMP's Fee Recuperation Program
          </p>
        </div>

        {/* Row 1: Customer Information */}
        <div className="grid grid-cols-12 gap-6 mb-4">
          <div className="col-span-12">
            <Card className="rounded-xl border-neutral-200 bg-white shadow-sm" role="region" aria-label="Customer Information">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                <CustomerInfoForm
                  onDataChange={setCustomerInfo}
                  initialData={customerInfo}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Red Notice for Dual Pricing and Cash Discounting */}
        {(inputs.programType === 'DUAL_PRICING' || inputs.programType === 'CASH_DISCOUNTING') && (
          <div className="grid grid-cols-12 gap-6 mb-4">
            <div className="col-span-12">
              <div className="text-center text-red-600 font-medium">
                Please note that all calculations below are based off of tips post-sale and menu markup / price differential being added pre-tax
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Input Parameters */}
        <div className="grid grid-cols-12 gap-6 mb-4">
          <div className="col-span-12">
            <Card className="rounded-xl border-neutral-200 bg-white shadow-sm" role="region" aria-label="Input Parameters">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Parameters</h2>
                <InputForm
                  inputs={inputs}
                  onInputChange={handleInputChange}
                  onTooltip={handleTooltip}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Row 3: Live Preview and Monthly Savings */}
        <div className="grid grid-cols-12 gap-6 mb-4">
          {/* Live Preview - 7/12 on large, full width on small, order 2 on small/medium, 1 on large */}
          <div className="col-span-12 lg:col-span-7 order-2 lg:order-1">
            <Card className="rounded-xl border-neutral-200 bg-white shadow-sm" role="region" aria-label={inputs.programType === 'DUAL_PRICING' ? 'Live Volume Breakdown' : 'Live Calculations'}>
              <div className="p-6">
                <DualPricingBreakdown
                  results={results}
                  inputs={inputs}
                  onTooltip={handleTooltip}
                  programType={inputs.programType}
                />
              </div>
            </Card>
          </div>

          {/* Monthly Savings - 5/12 on large, full width on small, order 1 on small/medium, 2 on large, sticky on large */}
          <div className="col-span-12 lg:col-span-5 order-1 lg:order-2">
            <div className="lg:sticky lg:top-4">
              <Card className="rounded-xl border-neutral-200 bg-white shadow-sm" role="complementary" aria-label={inputs.programType === 'DUAL_PRICING' ? 'Monthly Processing Savings' : 'Monthly Savings'}>
                <div className="p-6">
                  <ProcessingSavings
                    results={results}
                    onTooltip={handleTooltip}
                    programType={inputs.programType}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-12">
            <Card className="rounded-xl border-neutral-200 bg-white shadow-sm">
              <div className="p-6 space-y-6">
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
                    aria-pressed={showDMPProfit}
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
                      <GrossProfit
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
                    
                    <EmailReportDialog 
                      calculatorData={calculatorData}
                      inputs={inputs}
                      results={results}
                      customerInfo={customerInfo}
                    >
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
            </Card>
          </div>
        </div>
      </div>

      <TooltipModal
        isOpen={isTooltipOpen}
        onClose={() => setIsTooltipOpen(false)}
        tooltipKey={tooltipKey}
        programType={inputs.programType}
      />
    </div>
  );
}
