import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, HelpCircle, Zap, AlertTriangle } from "lucide-react";
import { CalculatorInputs, TooltipKey } from "@/types/calculator";
import { parseNumericInput, formatNumberInput } from "@/utils/calculations";
import { TOOLTIPS } from "@/utils/tooltips";
import { useToast } from "@/hooks/use-toast";

interface InputFormProps {
  inputs: CalculatorInputs;
  onInputChange: (field: keyof CalculatorInputs, value: number) => void;
  onTooltip: (key: TooltipKey) => void;
}

export default function InputForm({ inputs, onInputChange, onTooltip }: InputFormProps) {
  const { toast } = useToast();
  const [inputValues, setInputValues] = useState<Record<keyof CalculatorInputs, string>>({
    programType: inputs.programType,
    businessType: inputs.businessType || 'RESTAURANT',
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
    feeTaxBasis: inputs.feeTaxBasis || 'PRE_TAX',
    cardVolumeBasis: inputs.cardVolumeBasis || 'PRE_TAX',
    // v1.0.1 fields
    tipTiming: inputs.tipTiming || 'BEFORE_TIP',
    flatRateOverride: formatNumberInput(inputs.flatRateOverride || 0),
    isAutoFlatRate: (inputs.isAutoFlatRate !== false).toString(),
    // Cash Discounting field
    cashDiscount: formatNumberInput(inputs.cashDiscount || 0)
  });

  const [autoSynced, setAutoSynced] = useState(true);
  const [isAutoFlatRate, setIsAutoFlatRate] = useState(inputs.isAutoFlatRate !== false);

  // HALF_UP rounding function for flat rate calculation (v1.0.1-patch-roundedFlatRate)
  const roundHalfUp = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  // Auto flat rate calculation with HALF_UP rounding to 4 decimals
  // Capped at 4.00% maximum
  const calculateAutoFlatRate = (fee: number): number => {
    if (fee <= 0) return 0;
    const calculated = fee / (1 + fee);
    const capped = Math.min(calculated, 0.04); // Cap at 4%
    return roundHalfUp(capped, 4);
  };

  // Auto flat rate calculation for dual pricing using priceDiff/(1+priceDiff)
  // Capped at 4.00% maximum
  const calculateAutoFlatRateDualPricing = (priceDiff: number): number => {
    if (priceDiff <= 0) return 0;
    const calculated = priceDiff / (1 + priceDiff);
    const capped = Math.min(calculated, 0.04); // Cap at 4%
    return roundHalfUp(capped, 4);
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string | number) => {
    if (typeof value === 'string') {
      // Sanitize percentage inputs to only allow numeric characters with digit limits
      const percentageFields = ['currentRate', 'interchangeCost', 'taxRate', 'tipRate', 'cashDiscount'];
      const sanitized = percentageFields.includes(field) ? sanitizeAndLimitPercentage(value, field) : value;
      
      setInputValues(prev => ({ ...prev, [field]: sanitized }));
      const numericValue = parseNumericInput(sanitized);
      onInputChange(field, numericValue);
    } else {
      onInputChange(field, value);
    }
  };

  const handleRadioChange = (field: keyof CalculatorInputs, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    onInputChange(field, value as any);
  };

  const handleProgramTypeChange = (newType: 'DUAL_PRICING' | 'SUPPLEMENTAL_FEE' | 'CASH_DISCOUNTING') => {
    onInputChange('programType', newType as any);
    
    // Cap price differential if switching to Supplemental Fee mode
    let priceDifferentialValue = inputs.priceDifferential;
    if (newType === 'SUPPLEMENTAL_FEE' && priceDifferentialValue > 4) {
      priceDifferentialValue = 4;
      onInputChange('priceDifferential', 4);
      setInputValues(prev => ({ ...prev, priceDifferential: '4' }));
    }
    
    // Reset fee tax basis to default (PRE_TAX) when switching to Supplemental Fee
    if (newType === 'SUPPLEMENTAL_FEE') {
      onInputChange('feeTaxBasis', 'PRE_TAX' as any);
    }
    
    // Smart handling for Cash Discounting mode
    if (newType === 'CASH_DISCOUNTING') {
      // Allow Cash Discount to be 0%, no auto-population
      // User can now set any value from 0% to 10%
    }
    
    // Auto-calculate flat rate when switching programs
    if (priceDifferentialValue > 0) {
      let flatRate: number;
      if (newType === 'SUPPLEMENTAL_FEE') {
        const fee = priceDifferentialValue / 100;
        flatRate = Math.round(calculateAutoFlatRate(fee) * 10000) / 100; // Convert to percentage with 2 decimals
      } else {
        // DUAL_PRICING and CASH_DISCOUNTING modes use priceDiff/(1+priceDiff)
        const priceDiff = priceDifferentialValue / 100;
        flatRate = Math.round(calculateAutoFlatRateDualPricing(priceDiff) * 10000) / 100; // Convert to percentage with 2 decimals
      }
      onInputChange('flatRatePct', flatRate);
      setAutoSynced(true);
      setIsAutoFlatRate(true);
    }
  };

  const handlePriceDifferentialChange = (value: string) => {
    // Sanitize input to only allow numeric characters with 3-digit limit (x.xx)
    const sanitized = sanitizeAndLimitPercentage(value, 'priceDifferential');
    let priceDifferentialValue = parseNumericInput(sanitized);
    
    // No cap - allow values to exceed 4% so Cost Reduction can exceed 100%
    setInputValues(prev => ({ ...prev, priceDifferential: sanitized }));
    
    onInputChange('priceDifferential', priceDifferentialValue);
    
    // Auto-update flat rate if still synced
    if (autoSynced) {
      let flatRate: number;
      if (inputs.programType === 'SUPPLEMENTAL_FEE') {
        const fee = priceDifferentialValue / 100;
        flatRate = Math.round(calculateAutoFlatRate(fee) * 10000) / 100; // Convert to percentage with 2 decimals
      } else {
        // DUAL_PRICING mode uses priceDiff/(1+priceDiff)
        const priceDiff = priceDifferentialValue / 100;
        flatRate = Math.round(calculateAutoFlatRateDualPricing(priceDiff) * 10000) / 100; // Convert to percentage with 2 decimals
      }
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
    }
  };

  const handleFlatRateChange = (value: string) => {
    // Sanitize input to only allow numeric characters with 3-digit limit (x.xx)
    const sanitized = sanitizeAndLimitPercentage(value, 'flatRatePct');
    setInputValues(prev => ({ ...prev, flatRatePct: sanitized }));
    onInputChange('flatRatePct', parseNumericInput(sanitized));
    onInputChange('flatRateOverride', parseNumericInput(sanitized));
    setAutoSynced(false); // User manually edited flat rate
    setIsAutoFlatRate(false); // Mark as manual override
  };

  const resetFlatRateToAuto = () => {
    if (inputs.priceDifferential > 0) {
      let flatRate: number;
      if (inputs.programType === 'SUPPLEMENTAL_FEE') {
        const fee = inputs.priceDifferential / 100;
        flatRate = Math.round(calculateAutoFlatRate(fee) * 10000) / 100; // Convert to percentage with 2 decimals
      } else {
        // DUAL_PRICING mode uses priceDiff/(1+priceDiff)
        const priceDiff = inputs.priceDifferential / 100;
        flatRate = Math.round(calculateAutoFlatRateDualPricing(priceDiff) * 10000) / 100; // Convert to percentage with 2 decimals
      }
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
      setAutoSynced(true);
      setIsAutoFlatRate(true);
    }
  };

  // Initialize auto-calculated flat rate on component mount
  useEffect(() => {
    console.log('InputForm useEffect - Initial state:', {
      flatRatePct: inputs.flatRatePct,
      priceDifferential: inputs.priceDifferential,
      isAutoFlatRate,
      programType: inputs.programType
    });
    
    // Only auto-calculate if flatRatePct is not already set and we're in auto mode
    if ((inputs.flatRatePct === undefined || inputs.flatRatePct === 0) && isAutoFlatRate && inputs.priceDifferential > 0) {
      let flatRate: number;
      if (inputs.programType === 'SUPPLEMENTAL_FEE') {
        const fee = inputs.priceDifferential / 100;
        flatRate = Math.round(calculateAutoFlatRate(fee) * 10000) / 100; // Convert to percentage with 2 decimals
      } else {
        // DUAL_PRICING and CASH_DISCOUNTING modes use priceDiff/(1+priceDiff)
        const priceDiff = inputs.priceDifferential / 100;
        flatRate = Math.round(calculateAutoFlatRateDualPricing(priceDiff) * 10000) / 100; // Convert to percentage with 2 decimals
      }
      console.log('InputForm useEffect - Auto-calculating flatRatePct:', flatRate);
      onInputChange('flatRatePct', flatRate);
      setInputValues(prev => ({ ...prev, flatRatePct: formatNumberInput(flatRate) }));
      setAutoSynced(true);
    }
    // We only want this to run once on mount to set the initial value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Sanitize volume input to only allow numbers, decimal, and commas
  const sanitizeVolumeInput = (value: string): string => {
    // Allow only digits, decimal point, and commas
    return value.replace(/[^0-9.,]/g, '');
  };

  // Sanitize percentage input to only allow numbers and decimal
  const sanitizePercentageInput = (value: string): string => {
    // Allow only digits and decimal point
    return value.replace(/[^0-9.]/g, '');
  };

  // Sanitize and limit percentage input based on field requirements
  const sanitizeAndLimitPercentage = (value: string, field: string): string => {
    // First, remove non-numeric characters except decimal
    let sanitized = value.replace(/[^0-9.]/g, '');
    
    // Remove all decimal points to get just the digits
    const digitsOnly = sanitized.replace(/\./g, '');
    
    // Find the position of the first decimal point in the original sanitized string
    const firstDecimalIndex = sanitized.indexOf('.');
    
    // Fields with max 3 digits (x.xx format)
    const threeDigitFields = ['currentRate', 'interchangeCost', 'flatRatePct', 'flatRateOverride'];
    // Fields with max 4 digits (xx.xx format)
    const fourDigitFields = ['taxRate', 'tipRate'];
    // Fields with special handling for 1-10% range with decimals
    const quarterPercentFields = ['cashDiscount', 'priceDifferential'];
    
    let result = '';
    
    if (quarterPercentFields.includes(field)) {
      // Special handling for cashDiscount and priceDifferential (1-10% in 0.25% increments)
      // Allow proper decimal input format
      if (firstDecimalIndex === -1) {
        // No decimal point - limit to 2 digits max (for "10")
        result = digitsOnly.slice(0, 2);
        // Ensure we don't exceed 10
        const numValue = parseFloat(result);
        if (!isNaN(numValue) && numValue > 10) {
          result = '10';
        }
      } else if (firstDecimalIndex === 0) {
        // Decimal at start (.xx) - format as 0.xx
        result = '0.' + digitsOnly.slice(0, 2);
      } else {
        // Has decimal - properly preserve the decimal position
        const beforeDecimal = sanitized.substring(0, firstDecimalIndex);
        const afterDecimal = sanitized.substring(firstDecimalIndex + 1).replace(/\./g, '');
        
        // Limit to 2 digits before decimal and 2 after
        const limitedBefore = beforeDecimal.slice(0, 2);
        const limitedAfter = afterDecimal.slice(0, 2);
        
        result = limitedBefore;
        if (limitedAfter.length > 0 || sanitized.includes('.')) {
          result = result + '.' + limitedAfter;
        }
        
        // Ensure we don't exceed 10%
        const numValue = parseFloat(result);
        if (!isNaN(numValue) && numValue > 10) {
          result = '10';
        }
      }
    } else if (threeDigitFields.includes(field)) {
      // For 3-digit fields (x.xx): max 1 digit before decimal, max 2 total after
      if (firstDecimalIndex === -1) {
        // No decimal point - just limit to 1 digit
        result = digitsOnly.slice(0, 1);
      } else if (firstDecimalIndex === 0) {
        // Decimal at start (.xxx) - format as 0.xx
        result = '0.' + digitsOnly.slice(0, 2);
      } else if (firstDecimalIndex === 1) {
        // Decimal after first digit (x.xxx) - perfect format already
        const beforeDecimalDigits = sanitized.slice(0, 1);
        const afterDecimalDigits = sanitized.slice(2).replace(/\./g, '');
        result = beforeDecimalDigits + '.' + afterDecimalDigits.slice(0, 2);
      } else {
        // Decimal after multiple digits (12.345) - take first digit, then next 2 as decimal
        const beforeDecimalDigits = sanitized.slice(0, firstDecimalIndex).replace(/\./g, '');
        const afterDecimalDigits = sanitized.slice(firstDecimalIndex + 1).replace(/\./g, '');
        // Take first digit from before decimal, then combine remaining digits
        const firstDigit = beforeDecimalDigits.slice(0, 1);
        const remainingBeforeDecimal = beforeDecimalDigits.slice(1);
        const decimalPart = (remainingBeforeDecimal + afterDecimalDigits).slice(0, 2);
        result = firstDigit + '.' + decimalPart;
      }
    } else if (fourDigitFields.includes(field)) {
      // For 4-digit fields (xx.xx): max 2 digits before decimal, max 2 after
      if (firstDecimalIndex === -1) {
        // No decimal point - just limit to 2 digits
        result = digitsOnly.slice(0, 2);
      } else if (firstDecimalIndex === 0) {
        // Decimal at start (.xxx) - format as 0.xx
        result = '0.' + digitsOnly.slice(0, 2);
      } else {
        // Has decimal - properly preserve the decimal position
        const beforeDecimal = sanitized.substring(0, firstDecimalIndex);
        const afterDecimal = sanitized.substring(firstDecimalIndex + 1).replace(/\./g, '');
        
        // Limit to 2 digits before decimal and 2 after
        const limitedBefore = beforeDecimal.slice(0, 2);
        const limitedAfter = afterDecimal.slice(0, 2);
        
        result = limitedBefore;
        if (limitedAfter.length > 0 || sanitized.includes('.')) {
          result = result + '.' + limitedAfter;
        }
      }
    } else {
      // For other fields, no special limiting
      result = sanitized;
    }
    
    return result;
  };

  const handleVolumeChange = (value: string) => {
    // Sanitize input to only allow numeric characters
    const sanitized = sanitizeVolumeInput(value);
    setInputValues(prev => ({ ...prev, monthlyVolume: sanitized }));
    const numericValue = parseNumericInput(sanitized);
    onInputChange('monthlyVolume', numericValue);
  };

  const handleVolumeBlur = () => {
    const formatted = formatVolumeInput(inputValues.monthlyVolume);
    setInputValues(prev => ({ ...prev, monthlyVolume: formatted }));
  };

  const handleCashVolumeChange = (value: string) => {
    // Sanitize input to only allow numeric characters
    const sanitized = sanitizeVolumeInput(value);
    setInputValues(prev => ({ ...prev, monthlyCashVolume: sanitized }));
    const numericValue = parseNumericInput(sanitized);
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

    // First load all demo values except priceDifferential
    Object.entries(demoValues).forEach(([key, value]) => {
      if (key !== 'priceDifferential') {
        const field = key as keyof CalculatorInputs;
        setInputValues(prev => ({ ...prev, [field]: value.toString() }));
        onInputChange(field, value);
      }
    });

    // Set autoSynced to true so price differential change will trigger flat rate calculation
    setAutoSynced(true);
    setIsAutoFlatRate(true);
    
    // Now set price differential which will trigger handlePriceDifferentialChange
    // and auto-calculate flatRatePct
    setInputValues(prev => ({ ...prev, priceDifferential: demoValues.priceDifferential.toString() }));
    handlePriceDifferentialChange(demoValues.priceDifferential.toString());
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
        {/* Business Type Selection */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Business Type</Label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center">
              <input
                type="radio"
                name="businessType"
                value="RESTAURANT"
                checked={(inputs.businessType || 'RESTAURANT') === 'RESTAURANT'}
                onChange={(e) => {
                  handleRadioChange('businessType', 'RESTAURANT');
                  // Reset tip rate to previous value when switching back to Restaurant
                  if (inputs.businessType === 'RETAIL') {
                    handleInputChange('tipRate', '15');
                    setInputValues(prev => ({ ...prev, tipRate: '15' }));
                  }
                }}
                className="mr-2"
                data-testid="radio-business-restaurant"
              />
              <span className="text-sm">Restaurant/QSR</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="businessType"
                value="RETAIL"
                checked={inputs.businessType === 'RETAIL'}
                onChange={(e) => {
                  handleRadioChange('businessType', 'RETAIL');
                  // Set tip rate to 0 when switching to Retail
                  handleInputChange('tipRate', '0');
                  setInputValues(prev => ({ ...prev, tipRate: '0' }));
                }}
                className="mr-2"
                data-testid="radio-business-retail"
              />
              <span className="text-sm">Retail</span>
            </label>
          </div>
          {inputs.businessType === 'RETAIL' && (
            <div className="mt-2 text-xs text-gray-600 italic">
              Tip calculations not applicable for retail businesses
            </div>
          )}
        </div>

        {/* Program Type Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Program Type</Label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center">
              <input
                type="radio"
                name="programType"
                value="DUAL_PRICING"
                checked={inputs.programType === 'DUAL_PRICING'}
                onChange={(e) => handleProgramTypeChange('DUAL_PRICING')}
                className="mr-2"
              />
              <span className="text-sm">Dual Pricing</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="programType"
                value="CASH_DISCOUNTING"
                checked={inputs.programType === 'CASH_DISCOUNTING'}
                onChange={(e) => handleProgramTypeChange('CASH_DISCOUNTING')}
                className="mr-2"
              />
              <span className="text-sm">Cash Discounting</span>
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
                onClick={() => onTooltip('monthlyCardVolume')}
                data-testid="button-tooltip-monthly-volume"
                tabIndex={-1}
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
                onClick={() => onTooltip('monthlyCashVolume')}
                data-testid="button-tooltip-monthly-cash-volume"
                tabIndex={-1}
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
              Current Processing Rate %
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('currentRate')}
                data-testid="button-tooltip-current-rate"
                tabIndex={-1}
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
              Interchange Cost %
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('interchangeCost')}
                data-testid="button-tooltip-interchange-cost"
                tabIndex={-1}
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
              Sales Tax %
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('taxRate')}
                data-testid="button-tooltip-tax-rate"
                tabIndex={-1}
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

          {/* Tip Rate - hidden for Retail businesses */}
          {inputs.businessType !== 'RETAIL' ? (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Tip Rate %
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('tipRate')}
                  data-testid="button-tooltip-tip-rate"
                  tabIndex={-1}
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
                        value="PRE_TAX"
                        checked={(inputs.feeTaxBasis || 'PRE_TAX') === 'PRE_TAX'}
                        onChange={(e) => handleRadioChange('feeTaxBasis', 'PRE_TAX')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Apply fee to pre-tax amount</div>
                        <div className="text-gray-500 text-xs">Fee is calculated before tax.</div>
                      </div>
                    </label>
                    <label className="flex items-start text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="feeTaxBasis"
                        value="POST_TAX"
                        checked={inputs.feeTaxBasis === 'POST_TAX'}
                        onChange={(e) => handleRadioChange('feeTaxBasis', 'POST_TAX')}
                        className="mr-2 mt-0.5"
                      />
                      <div>
                        <div className="font-medium">Apply fee to post-tax amount</div>
                        <div className="text-gray-500 text-xs">Tax is added before fee.</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            </div>
          ) : (
            <div>{/* Empty div to maintain grid layout when Retail is selected */}</div>
          )}

          {/* Price Differential / Supplemental Fee / Menu Markup */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {inputs.programType === 'SUPPLEMENTAL_FEE' ? 'Supplemental Fee (%)' : 
               inputs.programType === 'CASH_DISCOUNTING' ? 'Menu Markup (%)' : 'Price Differential %'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip(inputs.programType === 'SUPPLEMENTAL_FEE' ? 'supplementalFee' : inputs.programType === 'CASH_DISCOUNTING' ? 'menuMarkup' : 'priceDifferential')}
                data-testid="button-tooltip-price-differential"
                tabIndex={-1}
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

          {/* Cash Discount % - Only for Cash Discounting */}
          {inputs.programType === 'CASH_DISCOUNTING' && (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                Cash Discount (%)
                {(!inputs.cashDiscount || inputs.cashDiscount === 0) && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-normal">Required</span>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => onTooltip('cashDiscount')}
                  data-testid="button-tooltip-cash-discount"
                  tabIndex={-1}
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-dmp-blue-500" />
                </Button>
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  className={`pr-8 py-3 focus:ring-2 placeholder:text-gray-400 ${
                    (!inputs.cashDiscount || inputs.cashDiscount === 0)
                      ? 'border-amber-500 focus:ring-amber-500 bg-amber-50'
                      : 'focus:ring-dmp-blue-500'
                  }`}
                  placeholder="3.50"
                  value={inputValues.cashDiscount}
                  onChange={(e) => handleInputChange('cashDiscount', e.target.value)}
                  data-testid="input-cash-discount"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              </div>
              {(!inputs.cashDiscount || inputs.cashDiscount === 0) ? (
                <p className="text-xs text-amber-600 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cash Discount % must be set to calculate accurate savings in Cash Discounting mode
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">The discount given to cash customers</p>
              )}
            </div>
          )}

          {/* Card Volume Basis control removed per v1.0.1 spec - always Gross */}

          {/* Flat Rate (%) for all modes */}
          {(inputs.programType === 'SUPPLEMENTAL_FEE' || inputs.programType === 'DUAL_PRICING' || inputs.programType === 'CASH_DISCOUNTING') && (
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
                  onClick={() => onTooltip('flatRate')}
                  data-testid="button-tooltip-flat-rate-pct"
                  tabIndex={-1}
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
