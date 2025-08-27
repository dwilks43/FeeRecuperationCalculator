import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, HelpCircle, Zap } from "lucide-react";
import { CalculatorInputs, TooltipKey } from "@/types/calculator";
import { parseNumericInput, formatNumberInput } from "@/utils/calculations";

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
    tipBasis: inputs.tipBasis || 'fee_inclusive'
  });

  const [autoSynced, setAutoSynced] = useState(true);

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    if (typeof value === 'string') {
      setInputValues(prev => ({ ...prev, [field]: value }));
      const numericValue = parseNumericInput(value);
      onInputChange(field, numericValue);
    } else {
      onInputChange(field, value);
    }
  };

  const handleProgramTypeChange = (newType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE') => {
    onInputChange('programType', newType as any);
    
    // Auto-calculate flat rate when switching to supplemental fee
    if (newType === 'SUPPLEMENTAL_FEE' && inputs.priceDifferential > 0) {
      const fee = inputs.priceDifferential / 100;
      const flatRate = (fee / (1 + fee)) * 100;
      onInputChange('flatRatePct', flatRate);
      setAutoSynced(true);
    }
  };

  const handleSupplementalFeeChange = (value: string) => {
    setInputValues(prev => ({ ...prev, priceDifferential: value }));
    const fee = parseNumericInput(value) / 100;
    onInputChange('priceDifferential', parseNumericInput(value));
    
    // Auto-update flat rate if still synced
    if (autoSynced && inputs.programType === 'SUPPLEMENTAL_FEE') {
      const flatRate = fee > 0 ? (fee / (1 + fee)) * 100 : 0;
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
    }
  };

  const handleFlatRateChange = (value: string) => {
    setInputValues(prev => ({ ...prev, flatRatePct: value }));
    onInputChange('flatRatePct', parseNumericInput(value));
    setAutoSynced(false); // User manually edited flat rate
  };

  const resetFlatRateToOffset = () => {
    if (inputs.priceDifferential > 0) {
      const fee = inputs.priceDifferential / 100;
      const flatRate = (fee / (1 + fee)) * 100;
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
      setAutoSynced(true);
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
              Monthly Credit Card Volume
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

          {/* Interchange Cost - hide in Supplemental Fee mode */}
          {inputs.programType === 'DUAL_PRICING' && (
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
          )}

          {/* Flat Rate Processing - only show for Dual Pricing */}
          {inputs.programType !== 'SUPPLEMENTAL_FEE' && (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Flat Rate Processing
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('flat-rate')}
                  data-testid="button-tooltip-flat-rate"
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  className="pr-8 py-3 focus:ring-2 focus:ring-dmp-blue-500 placeholder:text-gray-400"
                  placeholder="4.00"
                  value={inputValues.flatRate}
                  onChange={(e) => handleInputChange('flatRate', e.target.value)}
                  data-testid="input-flat-rate"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
          )}

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
              <div className="mt-2 space-y-2">
                <Label className="text-xs font-medium text-gray-600">Tip Basis</Label>
                <div className="space-y-1">
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name="tipBasis"
                      value="fee_inclusive"
                      checked={(inputs.tipBasis || 'fee_inclusive') === 'fee_inclusive'}
                      onChange={(e) => handleInputChange('tipBasis', 'fee_inclusive')}
                      className="mr-2"
                    />
                    <span>Tip % of amount after fee</span>
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="radio"
                      name="tipBasis"
                      value="pre_fee"
                      checked={inputs.tipBasis === 'pre_fee'}
                      onChange={(e) => handleInputChange('tipBasis', 'pre_fee')}
                      className="mr-2"
                    />
                    <span>Tip % of amount before fee</span>
                  </label>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Tips are added after the fee. The processor flat rate applies to fee-inclusive + tip card totals.
                </p>
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
                onChange={(e) => inputs.programType === 'SUPPLEMENTAL_FEE' ? handleSupplementalFeeChange(e.target.value) : handleInputChange('priceDifferential', e.target.value)}
                data-testid="input-price-differential"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Flat Rate (%) for Supplemental Fee mode */}
          {inputs.programType === 'SUPPLEMENTAL_FEE' && (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Flat Rate (%) (applied to fee-inclusive card amount)
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
                  onClick={resetFlatRateToOffset}
                  className="text-blue-600 hover:text-blue-800 underline"
                  data-testid="link-reset-flat-rate"
                >
                  Reset flat rate to offset
                </button>
                <button
                  type="button"
                  onClick={computeFeeFromFlatRate}
                  className="text-blue-600 hover:text-blue-800 underline"
                  data-testid="link-compute-fee-from-flat-rate"
                >
                  Compute fee from flat rate
                </button>
              </div>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
