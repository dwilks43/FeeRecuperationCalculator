import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, HelpCircle, Zap } from "lucide-react";
import { CalculatorInputs, TooltipKey } from "@/types/calculator";
import { parseNumericInput, formatNumberInput } from "@/utils/calculations";
import { TOOLTIPS } from "@/utils/tooltips";

interface InputFormProps {
  inputs: CalculatorInputs;
  onInputChange: (field: keyof CalculatorInputs, value: number) => void;
  onTooltip: (key: TooltipKey) => void;
}

export default function InputForm({ inputs, onInputChange, onTooltip }: InputFormProps) {
  const [inputValues, setInputValues] = useState<Record<keyof CalculatorInputs, string>>({
    programType: inputs.programType,
    monthlyVolume: formatNumberInput(inputs.monthlyVolume),
    monthlyCashVolume: formatNumberInput(inputs.monthlyCashVolume),
    currentRate: formatNumberInput(inputs.currentRate),
    interchangeCost: formatNumberInput(inputs.interchangeCost),
    flatRate: formatNumberInput(inputs.flatRate),
    taxRate: formatNumberInput(inputs.taxRate),
    tipRate: formatNumberInput(inputs.tipRate),
    priceDifferential: formatNumberInput(inputs.priceDifferential),
    flatRatePct: formatNumberInput(inputs.flatRatePct || 0),
    tipBasis: inputs.tipBasis || 'fee_inclusive',
    feeTiming: inputs.feeTiming || 'FEE_BEFORE_TIP',
    feeTaxBasis: inputs.feeTaxBasis || 'POST_TAX',
    cardVolumeBasis: inputs.cardVolumeBasis || 'PRE_TAX',
    // v1.0.1 fields
    tipTiming: inputs.tipTiming || 'BEFORE_TIP',
    flatRateOverride: formatNumberInput(inputs.flatRateOverride || 0),
    isAutoFlatRate: (inputs.isAutoFlatRate !== false).toString()
  });

  const [autoSynced, setAutoSynced] = useState(true);
  const [isAutoFlatRate, setIsAutoFlatRate] = useState(inputs.isAutoFlatRate !== false);

  // HALF_UP rounding function for flat rate calculation (v1.0.1-patch-roundedFlatRate)
  const roundHalfUp = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  // Auto flat rate calculation with HALF_UP rounding to 4 decimals
  const calculateAutoFlatRate = (fee: number): number => {
    if (fee <= 0) return 0;
    return roundHalfUp(fee / (1 + fee), 4);
  };

  // Auto flat rate calculation for dual pricing using priceDiff/(1+priceDiff)
  const calculateAutoFlatRateDualPricing = (priceDiff: number): number => {
    if (priceDiff <= 0) return 0;
    return roundHalfUp(priceDiff / (1 + priceDiff), 4);
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    if (typeof value === 'string') {
      setInputValues(prev => ({ ...prev, [field]: value }));
      const numericValue = parseNumericInput(value);
      onInputChange(field, numericValue);
    } else {
      onInputChange(field, value);
    }
  };

  const handleRadioChange = (field: keyof CalculatorInputs, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    onInputChange(field, value as any);
  };

  const handleProgramTypeChange = (newType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE') => {
    onInputChange('programType', newType as any);
    
    // Auto-calculate flat rate when switching programs
    if (inputs.priceDifferential > 0) {
      let flatRate: number;
      if (newType === 'SUPPLEMENTAL_FEE') {
        const fee = inputs.priceDifferential / 100;
        flatRate = calculateAutoFlatRate(fee) * 100; // Convert to percentage
      } else {
        // DUAL_PRICING mode uses priceDiff/(1+priceDiff)
        const priceDiff = inputs.priceDifferential / 100;
        flatRate = calculateAutoFlatRateDualPricing(priceDiff) * 100; // Convert to percentage
      }
      onInputChange('flatRatePct', flatRate);
      setAutoSynced(true);
      setIsAutoFlatRate(true);
    }
  };

  const handlePriceDifferentialChange = (value: string) => {
    setInputValues(prev => ({ ...prev, priceDifferential: value }));
    const priceDifferentialValue = parseNumericInput(value);
    onInputChange('priceDifferential', priceDifferentialValue);
    
    // Auto-update flat rate if still synced
    if (autoSynced) {
      let flatRate: number;
      if (inputs.programType === 'SUPPLEMENTAL_FEE') {
        const fee = priceDifferentialValue / 100;
        flatRate = calculateAutoFlatRate(fee) * 100; // Convert to percentage
      } else {
        // DUAL_PRICING mode uses priceDiff/(1+priceDiff)
        const priceDiff = priceDifferentialValue / 100;
        flatRate = calculateAutoFlatRateDualPricing(priceDiff) * 100; // Convert to percentage
      }
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
    }
  };

  const handleFlatRateChange = (value: string) => {
    setInputValues(prev => ({ ...prev, flatRatePct: value }));
    onInputChange('flatRatePct', parseNumericInput(value));
    onInputChange('flatRateOverride', parseNumericInput(value));
    setAutoSynced(false); // User manually edited flat rate
    setIsAutoFlatRate(false); // Mark as manual override
  };

  const resetFlatRateToAuto = () => {
    if (inputs.priceDifferential > 0) {
      let flatRate: number;
      if (inputs.programType === 'SUPPLEMENTAL_FEE') {
        const fee = inputs.priceDifferential / 100;
        flatRate = calculateAutoFlatRate(fee) * 100; // Convert to percentage
      } else {
        // DUAL_PRICING mode uses priceDiff/(1+priceDiff)
        const priceDiff = inputs.priceDifferential / 100;
        flatRate = calculateAutoFlatRateDualPricing(priceDiff) * 100; // Convert to percentage
      }
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
      setAutoSynced(true);
      setIsAutoFlatRate(true);
    }
  };

  const computeFeeFromFlatRate = () => {
    if (inputs.flatRatePct && inputs.flatRatePct > 0) {
      const fr = inputs.flatRatePct / 100;
      const fee = (fr / (1 - fr)) * 100;
      onInputChange('priceDifferential', fee);
      setInputValues(prev => ({ ...prev, priceDifferential: formatNumberInput(fee) }));
      setAutoSynced(false);
    }
  };

  const formatVolumeInput = (value: string): string => {
    if (!value) return '';
    const numericValue = parseNumericInput(value);
    if (numericValue === 0) return '';
    return numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleVolumeChange = (value: string) => {
    // Allow user to type freely, but format on blur
    setInputValues(prev => ({ ...prev, monthlyVolume: value }));
    const numericValue = parseNumericInput(value);
    onInputChange('monthlyVolume', numericValue);
  };

  const handleVolumeBlur = () => {
    const formatted = formatVolumeInput(inputValues.monthlyVolume);
    setInputValues(prev => ({ ...prev, monthlyVolume: formatted }));
  };

  const handleCashVolumeChange = (value: string) => {
    // Allow user to type freely, but format on blur
    setInputValues(prev => ({ ...prev, monthlyCashVolume: value }));
    const numericValue = parseNumericInput(value);
    onInputChange('monthlyCashVolume', numericValue);
  };

  const handleCashVolumeBlur = () => {
    const formatted = formatVolumeInput(inputValues.monthlyCashVolume);
    setInputValues(prev => ({ ...prev, monthlyCashVolume: formatted }));
  };

  const loadDemoValues = () => {
    const demoValues = {
      monthlyVolume: 100000,
      monthlyCashVolume: 25000,
      currentRate: 2.45,
      interchangeCost: 2.25,
      flatRate: 4.00,
      taxRate: 10.00,
      tipRate: 20.00,
      priceDifferential: 6.00
    };

    Object.entries(demoValues).forEach(([key, value]) => {
      const field = key as keyof CalculatorInputs;
      setInputValues(prev => ({ ...prev, [field]: value.toString() }));
      onInputChange(field, value);
    });
  };

  return (
    <Card className="shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
          <Calculator className="h-5 w-5 text-dmp-blue-600" />
          Input Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Program Type Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Program Type</Label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="programType"
                value="DUAL_PRICING"
                checked={inputs.programType === 'DUAL_PRICING'}
                onChange={(e) => handleProgramTypeChange('DUAL_PRICING')}
                className="mr-2"
              />
              <span className="text-sm">Dual Pricing or Cash Discounting</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="programType"
                value="SUPPLEMENTAL_FEE"
                checked={inputs.programType === 'SUPPLEMENTAL_FEE'}
                onChange={(e) => handleProgramTypeChange('SUPPLEMENTAL_FEE')}
                className="mr-2"
              />
              <span className="text-sm">Supplemental Fee</span>
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Monthly Credit Card Volume */}
          <div className="col-span-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {inputs.programType === 'SUPPLEMENTAL_FEE' ? 'Monthly Card Volume (Gross)' : 'Monthly Credit Card Volume'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('monthly-volume')}
                data-testid="button-tooltip-monthly-volume"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="text"
                className="pl-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="100,000.00"
                value={inputValues.monthlyVolume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                onBlur={handleVolumeBlur}
                data-testid="input-monthly-volume"
              />
            </div>
          </div>

          {/* Monthly Cash Volume */}
          <div className="col-span-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Monthly Cash Volume
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('monthly-cash-volume')}
                data-testid="button-tooltip-monthly-cash-volume"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="text"
                className="pl-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="25,000.00"
                value={inputValues.monthlyCashVolume}
                onChange={(e) => handleCashVolumeChange(e.target.value)}
                onBlur={handleCashVolumeBlur}
                data-testid="input-monthly-cash-volume"
              />
            </div>
          </div>

          {/* Current Processing Rate */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Current Processing Rate
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('current-rate')}
                data-testid="button-tooltip-current-rate"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <Input
                type="text"
                className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="2.45"
                value={inputValues.currentRate}
                onChange={(e) => handleInputChange('currentRate', e.target.value)}
                data-testid="input-current-rate"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Interchange Cost */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Interchange Cost
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('interchange-cost')}
                data-testid="button-tooltip-interchange-cost"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <Input
                type="text"
                className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="2.25"
                value={inputValues.interchangeCost}
                onChange={(e) => handleInputChange('interchangeCost', e.target.value)}
                data-testid="input-interchange-cost"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            
            {/* ISO Amp Integration Link */}
            <div className="mt-3">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/api/iso-amp-quote', '_blank');
                }}
                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                data-testid="link-interchange-calculator"
              >
                Interchange Calculator
              </a>
            </div>
          </div>


          {/* Tax Rate */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Tax Rate
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('tax-rate')}
                data-testid="button-tooltip-tax-rate"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <Input
                type="text"
                className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="10.00"
                value={inputValues.taxRate}
                onChange={(e) => handleInputChange('taxRate', e.target.value)}
                data-testid="input-tax-rate"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {inputs.programType === 'SUPPLEMENTAL_FEE' && (
              <div className="mt-2 flex justify-center">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Tip Timing</Label>
                  <div className="space-y-2 mt-1">
                    <label className="flex items-start text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="tipTiming"
                        value="BEFORE_TIP"
                        checked={(inputs.tipTiming || (inputs.feeTiming === 'FEE_BEFORE_TIP' ? 'BEFORE_TIP' : 'AFTER_TIP')) === 'BEFORE_TIP'}
                        onChange={(e) => handleRadioChange('tipTiming', 'BEFORE_TIP')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Tip handwritten (fee before tip)</div>
                        <div className="text-gray-500 text-xs">Tip is added after the card is processed; fee is calculated before tip.</div>
                      </div>
                    </label>
                    <label className="flex items-start text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="tipTiming"
                        value="AFTER_TIP"
                        checked={(inputs.tipTiming || (inputs.feeTiming === 'FEE_AFTER_TIP' ? 'AFTER_TIP' : 'BEFORE_TIP')) === 'AFTER_TIP'}
                        onChange={(e) => handleRadioChange('tipTiming', 'AFTER_TIP')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Tip at time of sale (fee after tip)</div>
                        <div className="text-gray-500 text-xs">Tip is part of the transaction when the fee is calculated.</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tip Rate - now enabled for Supplemental Fee mode */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Tip Rate
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('tip-rate')}
                data-testid="button-tooltip-tip-rate"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <Input
                type="text"
                className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="20.00"
                value={inputValues.tipRate}
                onChange={(e) => handleInputChange('tipRate', e.target.value)}
                data-testid="input-tip-rate"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {inputs.programType === 'SUPPLEMENTAL_FEE' && (
              <div className="mt-2 flex justify-center">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Fee Tax Basis</Label>
                  <div className="space-y-2 mt-1">
                    <label className="flex items-start text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="feeTaxBasis"
                        value="POST_TAX"
                        checked={(inputs.feeTaxBasis || 'POST_TAX') === 'POST_TAX'}
                        onChange={(e) => handleRadioChange('feeTaxBasis', 'POST_TAX')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Apply fee to post-tax amount</div>
                        <div className="text-gray-500 text-xs">Tax is added before fee.</div>
                      </div>
                    </label>
                    <label className="flex items-start text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="feeTaxBasis"
                        value="PRE_TAX"
                        checked={inputs.feeTaxBasis === 'PRE_TAX'}
                        onChange={(e) => handleRadioChange('feeTaxBasis', 'PRE_TAX')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Apply fee to pre-tax amount</div>
                        <div className="text-gray-500 text-xs">Fee is calculated before tax.</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Differential / Supplemental Fee */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {inputs.programType === 'SUPPLEMENTAL_FEE' ? 'Supplemental Fee (%)' : 'Price Differential'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip(inputs.programType === 'SUPPLEMENTAL_FEE' ? 'supplemental-fee' : 'price-differential')}
                data-testid="button-tooltip-price-differential"
              >
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
              </Button>
            </Label>
            <div className="relative">
              <Input
                type="text"
                className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                placeholder="6.00"
                value={inputValues.priceDifferential}
                onChange={(e) => handlePriceDifferentialChange(e.target.value)}
                data-testid="input-price-differential"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Card Volume Basis control removed per v1.0.1 spec - always Gross */}

          {/* Flat Rate (%) for both modes */}
          {(inputs.programType === 'SUPPLEMENTAL_FEE' || inputs.programType === 'DUAL_PRICING') && (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Flat Rate % (Bank Mapping)
                {isAutoFlatRate ? (
                  <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Auto</span>
                ) : (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Manual</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('flat-rate-pct')}
                  data-testid="button-tooltip-flat-rate-pct"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                  placeholder="3.85"
                  value={inputValues.flatRatePct}
                  onChange={(e) => handleFlatRateChange(e.target.value)}
                  data-testid="input-flat-rate-pct"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              
              {/* Helper links */}
              <div className="mt-2 flex gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    resetFlatRateToAuto();
                    setIsAutoFlatRate(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                  data-testid="link-reset-flat-rate"
                >
                  Reset to auto
                </button>
                <div className="text-xs text-gray-500">
                  {inputs.programType === 'SUPPLEMENTAL_FEE' ? (
                    <>Auto = Fee ÷ (1+Fee), rounded to 2-dp percent (e.g., 4% → 3.85%) and used in all calculations.</>
                  ) : (
                    <>Auto = Price Diff ÷ (1+Price Diff), rounded to 2-dp percent (e.g., 6% → 5.66%) and used in all calculations.</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
