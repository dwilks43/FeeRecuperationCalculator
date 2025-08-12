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
    monthlyVolume: formatNumberInput(inputs.monthlyVolume),
    currentRate: formatNumberInput(inputs.currentRate),
    interchangeCost: formatNumberInput(inputs.interchangeCost),
    flatRate: formatNumberInput(inputs.flatRate),
    taxRate: formatNumberInput(inputs.taxRate),
    tipRate: formatNumberInput(inputs.tipRate),
    priceDifferential: formatNumberInput(inputs.priceDifferential)
  });

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    const numericValue = parseNumericInput(value);
    onInputChange(field, numericValue);
  };

  const loadDemoValues = () => {
    const demoValues = {
      monthlyVolume: 100000,
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
                placeholder="100,000"
                value={inputValues.monthlyVolume}
                onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
                data-testid="input-monthly-volume"
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
            
            {/* ISO Amp Integration Button */}
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs px-3 py-1 h-7 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  window.open('/api/iso-amp-quote', '_blank');
                }}
                data-testid="button-iso-amp-quote"
              >
                <Calculator className="w-3 h-3 mr-1" />
                Get Accurate Interchange Rate
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Opens ISO Amp tool for precise interchange cost calculation
              </p>
            </div>
          </div>

          {/* Flat Rate Processing */}
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

          {/* Tip Rate */}
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
          </div>

          {/* Price Differential */}
          <div>
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              Price Differential
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0"
                onClick={() => onTooltip('price-differential')}
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
                onChange={(e) => handleInputChange('priceDifferential', e.target.value)}
                data-testid="input-price-differential"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
}
