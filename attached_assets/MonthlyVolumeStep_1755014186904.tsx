import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Save, Calculator, TrendingUp, HelpCircle, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { MonthlyVolume, PosItem, PriceItem, ProcessingRates, QuoteFormState } from "../../../types/quoteTypes";

// Define CalculationSetting type locally
interface CalculationSetting {
  id: number;
  key: string;
  name: string;
  value: string;
  description?: string;
  category: string;
  dataType: string;
  minValue?: string;
  maxValue?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: number;
}
import {
  formatCurrency,
  calculateTotalMonthlySoftwareCost,
  calculateHardwareTotals,
  calculateMenuWorksTotals
} from "@shared/utils/quoteCalculations";

interface MonthlyVolumeStepProps {
  monthlyVolume: MonthlyVolume;
  processingRates: ProcessingRates;
  hardwareConfig: any;
  updateMonthlyVolume: (data: Partial<MonthlyVolume>) => void;
  updateProcessingRates: (data: Partial<ProcessingRates>) => void;
  updateFormState?: (section: keyof import("../../../types/quoteTypes").QuoteFormState, data: any) => void;
  calculationSettings?: any[];
  calculatedValues?: QuoteFormState["calculatedValues"];
  savedQuoteData?: any;
  isReadOnly: boolean;
  priceItems: PriceItem[];
  selectedPosSystems?: PosItem[];
  handleNextStep: () => void;
  handlePreviousStep: () => void;
}

export default function MonthlyVolumeStep({
  monthlyVolume,
  processingRates,
  hardwareConfig,
  updateMonthlyVolume,
  updateProcessingRates,
  updateFormState,
  calculationSettings,
  calculatedValues,
  savedQuoteData,
  isReadOnly,
  priceItems,
  selectedPosSystems = [],
  handleNextStep,
  handlePreviousStep
}: MonthlyVolumeStepProps) {
  const [activePos, setActivePos] = useState(selectedPosSystems[0]?.id.toString() || "");
  const { toast } = useToast();

  // 🔍 TIMING DEBUG: Log processingRates when component receives them
  console.log('🔍 TIMING DEBUG - MonthlyVolumeStep received processingRates:', {
    timestamp: new Date().toISOString(),
    processingRates,
    'processingRates.currentRate': processingRates.currentRate,
    'typeof currentRate': typeof processingRates.currentRate
  });

  // 🔒 SPLIT-BRAIN ARCHITECTURE: Determine if quote is frozen
  // const isQuoteFrozen = savedQuoteData?.quote?.id && calculatedValues && calculatedValues.calculatedAt;
  const isQuoteFrozen = false;


  // Calculate monthly software cost from hardware config
  const allSoftwareItems = [
    ...(hardwareConfig?.softwareItems || []),
    // Include bundles that have monthly software costs
    ...(hardwareConfig?.bundles || []).filter((item: any) =>
      item.monthlySoftware !== undefined &&
      Number(item.monthlySoftware) > 0
    )
  ];

  // Filter items by POS compatibility
  const filterItemsByPOS = (item: PriceItem, posName: string): boolean => {
    if (!item.itemName) return false;

    if (item.posSystemCompatibility) {
      if (typeof item.posSystemCompatibility === 'string') {
        return item.posSystemCompatibility.toLowerCase() === posName.toLowerCase();
      }

      if (Array.isArray(item.posSystemCompatibility)) {
        return item.posSystemCompatibility.includes(posName);
      }
    }

    return item.itemName.toLowerCase().includes(posName.toLowerCase());
  };

  // Filter items by type for the current POS
  const bundleItems = useMemo(() => {
    return priceItems
      .filter(item => item.itemType === 'bundle')
      .filter(item => {
        if (selectedPosSystems.length === 0) return true;
        const activePosSystem = selectedPosSystems.find(pos => pos.id.toString() === activePos);
        if (!activePosSystem) return false;
        return filterItemsByPOS(item, activePosSystem.name);
      });
  }, [priceItems, activePos, selectedPosSystems]);

  const individualItems = useMemo(() => {
    return priceItems
      .filter(item => item.itemType === 'hardware')
      .filter(item => {
        if (selectedPosSystems.length === 0) return true;
        const activePosSystem = selectedPosSystems.find(pos => pos.id.toString() === activePos);
        if (!activePosSystem) return false;
        return filterItemsByPOS(item, activePosSystem.name);
      });
  }, [priceItems, activePos, selectedPosSystems]);

  const optionalItems = useMemo(() => {
    return priceItems
      .filter(item => item.itemType === 'optional')
      .filter(item => {
        if (selectedPosSystems.length === 0) return true;
        const activePosSystem = selectedPosSystems.find(pos => pos.id.toString() === activePos);
        if (!activePosSystem) return false;
        return filterItemsByPOS(item, activePosSystem.name);
      });
  }, [priceItems, activePos, selectedPosSystems]);

  // IMMUTABILITY FIX: Simple display-only estimation function
  const getEstimatedMonthlySoftware = () => {
    let estimatedSoftware = 0;

    const parseCost = (value: string | number | undefined): number => {
      const cost = typeof value === 'string' ? parseFloat(value) : value || 0;
      return isNaN(cost) ? 0 : cost;
    };

    const bundles = hardwareConfig?.bundles || [];
    const individualEquipment = hardwareConfig?.individualEquipment || [];
    const optionalEquipment = hardwareConfig?.optionalEquipment || [];

    // console.log("Bundles:", bundles);
    // console.log("Individual:", individualEquipment);
    // console.log("Optional:", optionalEquipment);

    const calculateItemSoftware = (item: any, label: string) => {
      const quantity = item.quantity || 1;
      const hasTiers = item.softwareCost2 || item.softwareCost3 || item.softwareCost4;

      let total = 0;

      if (hasTiers) {
        total += parseCost(item.monthlySoftware);

        if (quantity >= 2 && item.softwareCost2 !== undefined) {
          total += parseCost(item.softwareCost2);
        }
        if (quantity >= 3 && item.softwareCost3 !== undefined) {
          total += parseCost(item.softwareCost3);
        }
        if (quantity >= 4 && item.softwareCost4 !== undefined) {
          total += parseCost(item.softwareCost4);

          if (quantity > 4) {
            const extraUnits = quantity - 4;
            total += extraUnits * parseCost(item.softwareCost4);
          }
        }
      } else {
        total = parseCost(item.monthlySoftware) * quantity;
      }

      // console.log(`${label} item: ${item.itemName || 'Unnamed'} → quantity: ${quantity}, calculated total: $${total}`);
      return total;
    };

    bundles.forEach((item: PriceItem) => {
      const priceItemBundle = bundleItems?.find((b) => b.itemType === item.itemType && b.itemName === item.itemName)
      estimatedSoftware += calculateItemSoftware({ ...item, ...priceItemBundle }, 'Bundle');
    });

    individualEquipment.forEach((item: PriceItem) => {
      const priceItemIndividual = individualItems?.find((b) => b.itemType === item.itemType && b.itemName === item.itemName)
      estimatedSoftware += calculateItemSoftware({ ...item, ...priceItemIndividual }, 'Individual');
    });

    optionalEquipment.forEach((item: PriceItem) => {
      const priceItemoptional = individualItems?.find((b) => b.itemType === item.itemType && b.itemName === item.itemName)
      estimatedSoftware += calculateItemSoftware({ ...item, ...priceItemoptional }, 'Optional');
    });

    // console.log('Final estimatedSoftware:', estimatedSoftware);
    return estimatedSoftware;
  };

  // 🔒 IMMUTABILITY FIX: Use frozen software cost for saved quotes, live calculation for new quotes
  // const liveSoftwareCost = calculateTotalMonthlySoftwareCost(allSoftwareItems);
  const liveSoftwareCost = getEstimatedMonthlySoftware();

  console.log("liveSoftwareCost", allSoftwareItems, liveSoftwareCost, calculatedValues?.monthlySoftwareCost)
  // 🔒 IMMUTABILITY LOGIC: Check if quote should use frozen values
  const shouldUseFrozen = calculatedValues && calculatedValues.calculatedAt && savedQuoteData?.quote?.id;

  const monthlySoftwareCost = liveSoftwareCost;

  // 🔍 DEBUG: Software cost selection
  console.log(shouldUseFrozen
    ? `🔒 Using frozen software cost: $${calculatedValues.monthlySoftwareCost}`
    : `🔓 Using live software cost: $${liveSoftwareCost}`
  );

  // ORIGINAL CALCULATION LOGIC: Calculate live preview using dual pricing math
  const calculatePreviewData = () => {
    const volume = monthlyVolume.creditCardVolume || 0;
    // 🔧 FIX: For display, always use LIVE input value (processingRates.currentRate)
    // Only use stored value for saved quotes, not for live calculation display
    const currentRatePercent = processingRates.currentRate || 0;
    const currentRate = currentRatePercent / 100;

    const priceDiff = (processingRates.priceDifferential || 0) / 100;
    const flatRateProcessing = (processingRates.flatRatePercent || 0) / 100;
    const taxRate = (processingRates.taxPercent || 0) / 100;
    const tipRate = (processingRates.tipPercent || 0) / 100;
    // const taxRate = (processingRates.taxPercent || 10.0) / 100;
    // const tipRate = (processingRates.tipPercent || 20.0) / 100;
    // 🔍 DEBUG: Step 4 Display Calculation
    console.log('🎯 STEP 4 DISPLAY CALCULATION (FIXED):', {
      'processingRates.currentRate': processingRates.currentRate,
      'currentRatePercent (final)': currentRatePercent,
      'currentRate (divided by 100)': currentRate,
      'volume': volume,
      'calculated currentCost': volume * currentRate
    });

    // Dual pricing calculations
    const baseVolume = volume / (1 + taxRate + tipRate);
    console.log("---->", { baseVolume, volume, monthlyVolume, taxRate, tipRate })
    const markedUpVolume = baseVolume * (1 + priceDiff);
    const adjustedVolume = markedUpVolume * (1 + taxRate + tipRate);
    const markupCollected = baseVolume * priceDiff;
    const processingFees = adjustedVolume * flatRateProcessing;
    const netCost = processingFees - markupCollected;

    // Current cost
    const currentCost = volume * currentRate;

    // Processing savings
    const monthlyProcessingSavings = currentCost - netCost;

    // Software savings (with DMP coverage logic)
    const softwareSavings = processingRates.dmpCoverSoftwareCost
      ? (processingRates.currentSoftwareCost || 0)
      : (processingRates.currentSoftwareCost || 0) - monthlySoftwareCost;

    return {
      currentCost,
      netCost,
      monthly: monthlyProcessingSavings,
      annual: monthlyProcessingSavings * 12,
      newTotalVolume: adjustedVolume,
      markupCollected,
      processingFees,
      originalBase: baseVolume,
      softwareSavings,
      adjustedMonthlySavings: monthlyProcessingSavings + softwareSavings
    };
  };

  // 🔒 SPLIT-BRAIN LOGIC: Use frozen values OR live preview
  const previewData = React.useMemo(() => {
    if (isQuoteFrozen) {
      console.log('🔒 STEP 4: Using frozen calculations from:', new Date(calculatedValues!.calculatedAt));
      // Map frozen values to preview format for display consistency
      return {
        currentCost: calculatedValues!.currentProcessingCost || 0,
        netCost: calculatedValues!.newProcessingCost || 0,
        monthly: calculatedValues!.monthlyProcessingSavings || 0,
        annual: (calculatedValues!.monthlyProcessingSavings || 0) * 12,
        newTotalVolume: calculatedValues!.newTotalVolume || 0,
        markupCollected: calculatedValues!.markupCollected || 0,
        processingFees: calculatedValues!.newProcessingCost || 0,
        originalBase: calculatedValues!.baseVolume || 0,
        softwareSavings: calculatedValues!.monthlySoftwareSavings || 0,
        adjustedMonthlySavings: calculatedValues!.totalMonthlySavings || 0
      };
    }

    // Live preview for non-frozen quotes
    if (!monthlyVolume.creditCardVolume || !processingRates.currentRate) {
      return {
        currentCost: 0, netCost: 0, monthly: 0, annual: 0,
        newTotalVolume: 0, markupCollected: 0, processingFees: 0,
        originalBase: 0, softwareSavings: 0, adjustedMonthlySavings: 0
      };
    }

    console.log('✅ STEP 4: Calculating live preview');
    console.log('🎯 STEP 4 DISPLAY - ALL INPUT VALUES USED:', {
      'timestamp': new Date().toISOString(),
      'monthlyVolume.creditCardVolume': monthlyVolume.creditCardVolume,
      'processingRates.currentRate': processingRates.currentRate,
      'processingRates.interchangeCost': processingRates.interchangeCost,
      'processingRates.currentSoftwareCost': processingRates.currentSoftwareCost,
      'processingRates.priceDifferential': processingRates.priceDifferential,
      'processingRates.flatRatePercent': processingRates.flatRatePercent,
      'processingRates.taxPercent': processingRates.taxPercent,
      'processingRates.tipPercent': processingRates.tipPercent,
      'processingRates.dmpCoverSoftwareCost': processingRates.dmpCoverSoftwareCost
    });
    return calculatePreviewData();
  }, [
    isQuoteFrozen,
    calculatedValues,
    monthlyVolume.creditCardVolume,
    processingRates.currentRate,
    processingRates.flatRatePercent,
    processingRates.priceDifferential,
    processingRates.taxPercent,
    processingRates.tipPercent,
    processingRates.currentSoftwareCost,
    processingRates.dmpCoverSoftwareCost,
    monthlySoftwareCost
  ]);

  // ORIGINAL CALCULATION STORAGE LOGIC: Store calculated values in form state for Step 5 to use (eliminating redundancy)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    const isNewVersion = urlParams.get('newVersion') === 'true';

    // 🔒 IMMUTABILITY PROTECTION: Only prevent recalculation for SAVED quotes, not live editing
    // Allow live calculation updates when user is actively editing Step 4

    // if (calculatedValues && calculatedValues.calculatedAt && quoteId) {
    //   console.log('🔒 Quote has frozen calculations - preventing recalculation');
    //   console.log('🔒 Frozen at:', new Date(calculatedValues.calculatedAt));
    //   console.log('🔒 Hardware totals:', calculatedValues.hardwareTotals);
    //   console.log('🔍 DEBUG - Why is this frozen? quoteId:', quoteId, 'isNewVersion:', isNewVersion);
    //   return; // Exit early - do NOT recalculate ONLY for saved quotes
    // }

    // 🔓 LIVE EDITING: Allow calculations for new quotes or active editing
    if (!quoteId) {
      console.log('🔓 NEW QUOTE: Allowing live calculation updates');
    }

    // RECALCULATE if existing quote has zero hardware totals (indicates incomplete calculation)
    if (calculatedValues && calculatedValues.calculatedAt && calculatedValues.hardwareTotals === 0) {
      console.log('🔄 Existing quote has zero hardware totals - recalculating');
    }

    // RECALCULATE for new versions or when no calculated values exist
    if (isNewVersion) {
      console.log('🔄 Creating new version - recalculating');
    }

    if (updateFormState && monthlyVolume.creditCardVolume && processingRates.currentRate) {
      console.log('✅ Step 4: Calculating values for new/edited quote');
      console.log('✅ Step 4: Storing calculated values for Step 5 (eliminating redundancy)');

      // 🔍 COMPREHENSIVE TIMING DEBUG: Check ALL input values in storage useEffect
      console.log('💾 STORAGE useEffect - ALL INPUT VALUES CAPTURED:', {
        'timestamp': new Date().toISOString(),
        'monthlyVolume.creditCardVolume': monthlyVolume.creditCardVolume,
        'processingRates.currentRate': processingRates.currentRate,
        'processingRates.interchangeCost': processingRates.interchangeCost,
        'processingRates.currentSoftwareCost': processingRates.currentSoftwareCost,
        'processingRates.priceDifferential': processingRates.priceDifferential,
        'processingRates.flatRatePercent': processingRates.flatRatePercent,
        'processingRates.taxPercent': processingRates.taxPercent,
        'processingRates.tipPercent': processingRates.tipPercent,
        'processingRates.dmpCoverSoftwareCost': processingRates.dmpCoverSoftwareCost,
        'hardwareConfig totals': hardwareConfig ? {
          hardwareTotals: hardwareConfig.hardwareTotals,
          menuWorksTotals: hardwareConfig.menuWorksTotals
        } : 'undefined'
      });

      // IMMUTABILITY FIX: Calculate hardware and menu works totals using consolidated functions
      // These will be frozen in calculatedValues to prevent drift
      const hardwareTotals = calculateHardwareTotals({
        bundles: hardwareConfig?.bundles || [],
        individualEquipment: hardwareConfig?.individualEquipment || [],
        optionalEquipment: hardwareConfig?.optionalEquipment || [],
        otherHardware: hardwareConfig?.otherHardware || []
      } as any);

      // Calculate total design fees from all menu items
      const totalDesignFees = (hardwareConfig?.menuItems || []).reduce((sum: number, item: any) => {
        const designCost = typeof item.designCost === 'string' ?
          Number(item.designCost) || 0 :
          (item.designCost || 0);
        return sum + designCost;
      }, 0);

      // Add any manual design fee override
      const manualDesignFee = hardwareConfig?.menuDesignFee || 0;
      const totalDesignFee = totalDesignFees + manualDesignFee;

      const menuWorksTotals = calculateMenuWorksTotals(
        hardwareConfig?.menuItems || [],
        hardwareConfig?.menuAddOns || [],
        totalDesignFee
      );

      // Get DMP profit share and ROI timeframe from calculation settings
      const getDmpProfitShare = () => {
        const setting = calculationSettings?.find(s => s.key === 'dmp_profit_share');
        return setting ? Number(setting.value) : 50;
      };

      const getRoiTimeframe = () => {
        const setting = calculationSettings?.find(s => s.key === 'roi_timeframe');
        return setting ? Number(setting.value) || 6 : 6;
      };

      const profitShare = getDmpProfitShare();
      const roiTimeframe = getRoiTimeframe();

      // Calculate dual pricing components for storage  
      const monthlyVolumeAmount = monthlyVolume.creditCardVolume || 0; // Keep original monthly volume for base
      const storageTaxRate = (processingRates.taxPercent || 0) / 100;
      const storageTipRate = (processingRates.tipPercent || 0) / 100;
      const storagePriceDiff = (processingRates.priceDifferential || 0) / 100;
      const interchangeRate = (processingRates.interchangeCost || 0) / 100;

      // Step 1: Adjusted Volume Calculation (renamed to avoid conflicts)
      const monthlyBaseVolume = monthlyVolumeAmount / (1 + storageTaxRate + storageTipRate);
      const monthlyMarkedUpVolume = monthlyBaseVolume * (1 + storagePriceDiff);
      const adjustedVolume = monthlyMarkedUpVolume * (1 + storageTaxRate + storageTipRate);

      // ***************************************************************
      // HERE'S THE CHANGE: Use adjustedVolume for creditCardVolume
      // ***************************************************************
      const creditCardVolumeForMerchantCredit = adjustedVolume;
      // ***************************************************************

      const flatRatePercent = processingRates.flatRatePercent || 0;
      const interchangeCost = processingRates.interchangeCost || 0;

      // Calculate merchant credit using CORRECTED formula:
      // Merchant Credit = (Flat Rate Processing % - Interchange Cost) × ROI Months × DMP Profit Share %
      // Simple formula as requested - use FLAT RATE, not price differential
      const netMargin = flatRatePercent - interchangeCost;
      const volumeFactor = creditCardVolumeForMerchantCredit / 100000; // Scale to per $100K
      const merchantCredit = Math.max(0, netMargin * roiTimeframe * (profitShare / 100) * volumeFactor * 1000);

      console.log('💰 Merchant Credit Calculation:', {
        creditCardVolume: creditCardVolumeForMerchantCredit, // Use the new variable here
        flatRatePercent,
        interchangeCost,
        netMargin,
        profitShare,
        roiTimeframe,
        volumeFactor,
        merchantCredit,
        'Expected for $100K volume': (flatRatePercent - interchangeCost) * roiTimeframe * (profitShare / 100) * 1 * 1000
      });

      // IMMUTABILITY FIX: Remove all live calculations from Step 4
      // These preview calculations cause drift and should use frozen values only

      // Calculate final values that will be stored
      const previewTotalDueAfterCredit = Math.max(0, (hardwareTotals + menuWorksTotals) - merchantCredit);

      // Step 2: Markup Collected (USE SAME CALCULATION AS DISPLAY)
      const monthlyMarkupCollected = monthlyBaseVolume * storagePriceDiff;

      // Step 3: True Processing Cost - CRITICAL FIX: Use flat rate, not interchange
      const flatRateProcessing = (processingRates.flatRatePercent || 0) / 100;
      const rawProcessingCost = adjustedVolume * flatRateProcessing;
      const outOfPocketProcessingCost = rawProcessingCost - monthlyMarkupCollected;

      // 🔍 DEBUG: New Processing Cost calculation comparison
      console.log('🔧 NEW PROCESSING COST DEBUG:', {
        'adjustedVolume': adjustedVolume,
        'flatRateProcessing': flatRateProcessing,
        'rawProcessingCost (adjustedVolume × flatRate)': rawProcessingCost,
        'monthlyBaseVolume': monthlyBaseVolume,
        'flatRatePercent': flatRatePercent,
        'monthlyMarkupCollected (baseVolume × priceDiff)': monthlyMarkupCollected,
        'outOfPocketProcessingCost (final)': outOfPocketProcessingCost,
        'EXPECTED MATCH with Step 4 display': '$324.92'
      });

      // Calculate current processing cost
      // 🔍 DEBUG: Storage Calculation - TRACKING 2.75% vs 2% ISSUE
      console.log('💾 STORAGE CALCULATION - DETAILED DEBUG:', {
        'processingRates object': processingRates,
        'processingRates.currentRate': processingRates.currentRate,
        'typeof processingRates.currentRate': typeof processingRates.currentRate,
        'currentRate (divided by 100)': (processingRates.currentRate || 0) / 100,
        'monthlyVolumeAmount': monthlyVolumeAmount,
        'calculated currentProcessingCost': monthlyVolumeAmount * ((processingRates.currentRate || 0) / 100)
      });

      const currentProcessingCost = monthlyVolumeAmount * ((processingRates.currentRate || 0) / 100);

      // Calculate processing savings using out-of-pocket cost
      const monthlyProcessingSavings = currentProcessingCost - outOfPocketProcessingCost;

      // Software savings calculation
      const monthlySoftwareSavings = processingRates.dmpCoverSoftwareCost ?
        (processingRates.currentSoftwareCost || 0) :
        (processingRates.currentSoftwareCost || 0) - monthlySoftwareCost;

      // Total monthly savings
      const totalMonthlySavings = monthlyProcessingSavings + monthlySoftwareSavings;

      // Calculate total due after credit for ROI
      const totalDueAfterCredit = (hardwareTotals + menuWorksTotals) - merchantCredit;

      console.log('📊 ROI Calculation Debug:', {
        hardwareTotals,
        menuWorksTotals,
        merchantCredit,
        totalBeforeCredit: hardwareTotals + menuWorksTotals,
        totalDueAfterCredit,
        totalMonthlySavings,
        expectedROI: totalMonthlySavings > 0 ? totalDueAfterCredit / totalMonthlySavings : 0
      });
      const totalAmount = hardwareTotals + menuWorksTotals;
      // Calculate ROI - Simple division, no double-dipping on merchant credit
      const returnOnInvestmentMonths = totalMonthlySavings > 0 ?
        totalDueAfterCredit / totalMonthlySavings :
        0;
      // Format for display
      const roiDisplay = totalMonthlySavings > 0 ?
        returnOnInvestmentMonths.toFixed(1) :
        "0";

      console.log('✅ Step 4: Creating calculatedValues for new quote');
      const calculatedValues = {
        // Core dual pricing values
        adjustedVolume,
        markupCollected: monthlyMarkupCollected,
        rawProcessingCost,
        outOfPocketProcessingCost,
        processingFees: rawProcessingCost, // ADD THIS
        netCost: outOfPocketProcessingCost, // ADD THIS
        originalBase: monthlyBaseVolume, // ADD THIS
        newTotalVolume: adjustedVolume, // ADD THIS

        // Processing calculations
        currentProcessingCost,
        newProcessingCost: outOfPocketProcessingCost,
        monthlyProcessingSavings,

        // Software calculations
        monthlySoftwareSavings,
        monthlySoftwareCost: monthlySoftwareCost, // ADD THIS - CRITICAL
        adjustedMonthlySavings: monthlyProcessingSavings + monthlySoftwareSavings, // ADD THIS

        // Total savings
        totalMonthlySavings,

        // Hardware and pricing totals
        hardwareTotals: hardwareTotals,
        menuWorksTotals: menuWorksTotals,
        totalQuoteAmount: hardwareTotals + menuWorksTotals,

        // Financial calculations
        merchantCredit: Math.max(0, merchantCredit),
        totalDueAfterCredit: totalDueAfterCredit,

        // ROI - SINGLE CALCULATION (Fix Issue 6)
        roi: roiDisplay,
        roiMonths: returnOnInvestmentMonths, // ADD THIS
        paybackPeriod: roiDisplay,
        returnOnInvestmentMonths: returnOnInvestmentMonths,

        // Base calculations for transparency
        baseVolume: monthlyBaseVolume,
        markedUpVolume: monthlyMarkedUpVolume,

        // CRITICAL: Timestamp for immutability
        calculatedAt: Date.now(),

        // Volume/rate snapshot that generated these calculations
        volumeData: {
          creditCardVolume: monthlyVolumeAmount,
          isAnnualVolume: false,
          currentRate: processingRates.currentRate,
          proposedRate: processingRates.proposedRate,
          interchangeCost: processingRates.interchangeCost,
          priceDifferential: processingRates.priceDifferential,

          // CRITICAL: Include missing fields for complete data persistence
          flatRatePercent: processingRates.flatRatePercent,
          taxPercent: processingRates.taxPercent,
          tipPercent: processingRates.tipPercent,

          currentSoftwareCost: processingRates.currentSoftwareCost,
          dmpCoverSoftwareCost: processingRates.dmpCoverSoftwareCost || false,
          hardwareQuoteOnly: processingRates.hardwareQuoteOnly || false
        }
      };

      console.log('✅ Step 4: Storing calculatedValues in formState:', calculatedValues);
      updateFormState('calculatedValues', calculatedValues);

      console.log('✅ Step 4: calculatedValues stored with timestamp:', calculatedValues.calculatedAt);
    }
  }, [
    monthlyVolume.creditCardVolume,
    processingRates.currentRate,
    processingRates.flatRatePercent,
    processingRates.priceDifferential,
    processingRates.taxPercent,
    processingRates.tipPercent,
    monthlySoftwareCost,
    processingRates.dmpCoverSoftwareCost,
    processingRates.currentSoftwareCost,
    hardwareConfig,
    updateFormState
  ]);

  return (
    <div className="space-y-6">
      {/* 🔒 SPLIT-BRAIN ARCHITECTURE: Frozen Quote Banner */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="font-semibold text-blue-900">Viewing Frozen Quote</h3>
              <p className="text-sm text-blue-700">
                This quote was saved on {new Date(calculatedValues!.calculatedAt).toLocaleDateString()} and cannot be edited.
                All calculations are preserved exactly as they were when saved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={() => {
            // Validate calculations exist before proceeding
            if (!monthlyVolume.creditCardVolume || !processingRates.currentRate) {
              toast({
                title: "Missing Information",
                description: "Please enter monthly volume and current rate before proceeding.",
                variant: "destructive"
              });
              return;
            }

            // Ensure calculations have been performed
            if (!updateFormState) {
              console.error("updateFormState not available!");
              return;
            }

            handleNextStep();
          }}
          // disabled={!monthlyVolume.creditCardVolume || !processingRates.currentRate}
          className="flex items-center"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Monthly Volume & Processing Rates</CardTitle>
          <CardDescription>
            {isQuoteFrozen
              ? "Review the saved quote details and calculations"
              : "Enter the merchant's monthly credit card processing volume and current rates"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Monthly Volume Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monthly Processing Volume</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="credit-card-volume">Monthly Credit Card Volume</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Total monthly credit card sales, including all tax and tip amounts.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="credit-card-volume"
                    type="text"
                    placeholder="30,000"
                    className={`pl-7 ${(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={monthlyVolume.creditCardVolume
                      ? monthlyVolume.creditCardVolume.toLocaleString('en-US')
                      : ""
                    }
                    disabled={isReadOnly || isQuoteFrozen}
                    onFocus={(e) => !isQuoteFrozen && e.target.select()}
                    onChange={(e) => {
                      if (isQuoteFrozen) return;
                      const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                      updateMonthlyVolume({
                        creditCardVolume: numericValue === "" ? undefined : parseFloat(numericValue)
                      });
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total monthly credit card sales including tax and tip
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="current-rate">Current Processing Rate (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Merchant's average effective processing rate based on their current provider. Current Processing Rate = Total Fees ÷ Total Dollars Processed</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="current-rate"
                  type="number"
                  step="0.01"
                  placeholder="2.75"
                  min="0" // Ensure it does not accept negative numbers
                  className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  value={processingRates.currentRate !== undefined ? processingRates.currentRate : ""}
                  disabled={isReadOnly || isQuoteFrozen}
                  onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                  onInput={(e) => {
                    if (isQuoteFrozen || isReadOnly) return;
                    let value = (e.target as HTMLInputElement).value;
                    if (value.startsWith('.')) {
                      value = '0' + value;
                      (e.target as HTMLInputElement).value = value;
                    }
                    if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                      updateProcessingRates({
                        currentRate: value === "" ? undefined : Number(value)
                      });
                    } else {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent entering a negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current effective processing rate the merchant pays
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="interchange-cost">Interchange Cost (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The actual interchange cost rate that goes to card brands and issuing banks.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="interchange-cost"
                  type="number"
                  step="0.01"
                  placeholder="2.25"
                  min="0" // Ensure it does not accept negative numbers
                  className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  value={processingRates.interchangeCost !== undefined ? processingRates.interchangeCost : ""}
                  disabled={isReadOnly || isQuoteFrozen}
                  onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                  onInput={(e) => {
                    if (isQuoteFrozen || isReadOnly) return;
                    let value = (e.target as HTMLInputElement).value;
                    if (value.startsWith('.')) {
                      value = '0' + value;
                      (e.target as HTMLInputElement).value = value;
                    }
                    if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                      updateProcessingRates({
                        interchangeCost: value === "" ? undefined : Number(value)
                      });
                    } else {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent entering a negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Actual interchange cost rate for this merchant
                </p>

                {/* ISO Amp Integration Button */}
                {!isQuoteFrozen && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 h-7 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => {
                        window.open('/api/iso-amp-quote', '_blank');
                      }}
                      disabled={isReadOnly}
                    >
                      <Calculator className="w-3 h-3 mr-1" />
                      Get Accurate Interchange Rate
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Opens ISO Amp tool for precise interchange cost calculation
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Monthly Volume Section - Second Row */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Merchant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="current-software-cost">Current Software Cost</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The merchant's current monthly cost for their POS or software platform.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="current-software-cost"
                    type="number"
                    step="0.01"
                    placeholder="200.00"
                    min="0" // Ensure it does not accept negative numbers
                    className={`pl-7 ${(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    value={processingRates.currentSoftwareCost !== undefined ? processingRates.currentSoftwareCost : ""}
                    disabled={isReadOnly || isQuoteFrozen}
                    onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                    onInput={(e) => {
                      if (isQuoteFrozen || isReadOnly) return;
                      let value = (e.target as HTMLInputElement).value;
                      if (value.startsWith('.')) {
                        value = '0' + value;
                        (e.target as HTMLInputElement).value = value;
                      }
                      if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                        updateProcessingRates({
                          currentSoftwareCost: value === "" ? undefined : Number(value)
                        });
                      } else {
                        e.preventDefault(); // Prevent invalid input
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent entering a negative sign
                      if (e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current monthly software cost the merchant pays
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dual Pricing Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Dual Pricing Configuration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the dual pricing model parameters for savings calculations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="flat-rate">Flat Rate Processing (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Our flat processing rate applied to the entire card transaction amount — including tax and tip.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="flat-rate"
                  type="number"
                  step="0.01"
                  placeholder="4.00"
                  min="0" // Ensure it does not accept negative numbers
                  className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  value={processingRates.flatRatePercent !== undefined ? processingRates.flatRatePercent : ""}
                  disabled={isReadOnly || isQuoteFrozen}
                  onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                  onInput={(e) => {
                    if (isQuoteFrozen || isReadOnly) return;
                    let value = (e.target as HTMLInputElement).value;
                    if (value.startsWith('.')) {
                      value = '0' + value;
                      (e.target as HTMLInputElement).value = value;
                    }
                    if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                      updateProcessingRates({
                        flatRatePercent: value === "" ? undefined : Number(value)
                      });
                    } else {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent entering a negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Processing Flat Rate Cost
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="tax-percent">Tax Rate (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The average sales tax applied to transactions (used for volume and savings calculations).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="tax-percent"
                  type="number"
                  step="0.01"
                  placeholder="10.0"
                  min="0" // Ensure it does not accept negative numbers
                  className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  value={processingRates.taxPercent !== undefined ? processingRates.taxPercent : ""}
                  disabled={isReadOnly || isQuoteFrozen}
                  onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                  onInput={(e) => {
                    if (isQuoteFrozen || isReadOnly) return;
                    let value = (e.target as HTMLInputElement).value;
                    if (value.startsWith('.')) {
                      value = '0' + value;
                      (e.target as HTMLInputElement).value = value;
                    }
                    if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                      updateProcessingRates({
                        taxPercent: value === "" ? undefined : Number(value)
                      });
                    } else {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent entering a negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Average Sales Tax rate
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Label htmlFor="tip-percent">Tip Rate (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The average tip percentage customers leave on transactions (also included in total volume).</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="tip-percent"
                  type="number"
                  step="0.01"
                  placeholder="20.0"
                  min="0" // Ensure it does not accept negative numbers
                  className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                  value={processingRates.tipPercent !== undefined ? processingRates.tipPercent : ""}
                  disabled={isReadOnly || isQuoteFrozen}
                  onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                  onInput={(e) => {
                    if (isQuoteFrozen || isReadOnly) return;
                    let value = (e.target as HTMLInputElement).value;
                    if (value.startsWith('.')) {
                      value = '0' + value;
                      (e.target as HTMLInputElement).value = value;
                    }
                    if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                      updateProcessingRates({
                        tipPercent: value === "" ? undefined : Number(value)
                      });
                    } else {
                      e.preventDefault(); // Prevent invalid input
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent entering a negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Average tip percentage
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-2">
                <Label htmlFor="price-differential">Price Differential (%)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The markup percentage added to base menu prices for card-paying customers.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="price-differential"
                type="number"
                step="0.01"
                placeholder="4.00"
                min="0" // Ensure it does not accept negative numbers
                className={(isQuoteFrozen || isReadOnly) ? 'bg-gray-100 cursor-not-allowed' : ''}
                value={processingRates.priceDifferential !== undefined ? processingRates.priceDifferential : ""}
                disabled={isReadOnly || isQuoteFrozen}
                onFocus={(e) => !(isQuoteFrozen || isReadOnly) && (e.target as HTMLInputElement).select()}
                onInput={(e) => {
                  if (isQuoteFrozen || isReadOnly) return;
                  let value = (e.target as HTMLInputElement).value;
                  if (value.startsWith('.')) {
                    value = '0' + value;
                    (e.target as HTMLInputElement).value = value;
                  }
                  if (/^(?!-)(0|[1-9]\d*)(\.\d+)?$/.test(value) || value === "") {
                    updateProcessingRates({
                      priceDifferential: value === "" ? undefined : Number(value)
                    });
                  } else {
                    e.preventDefault(); // Prevent invalid input
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent entering a negative sign
                  if (e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Markup % applied to card payments
              </p>
            </div>
          </div>

          <Separator />

          {/* Enhanced Live Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <h3 className="text-lg font-semibold">
                {isQuoteFrozen ? 'Frozen Calculations' : 'Live Preview'}
              </h3>
              <TrendingUp className="w-4 h-4 text-green-600" />
              {processingRates.dmpCoverSoftwareCost && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Software Covered
                </Badge>
              )}
              {isQuoteFrozen && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  🔒 Frozen
                </Badge>
              )}
            </div>

            <TooltipProvider>
              <div className="space-y-6">
                {/* Calculation Data Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl border border-blue-200 p-6">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    📊 Calculation Data
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Adjusted Card Volume */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Adjusted Card Volume
                        </p>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            <div className="space-y-2">
                              <p className="font-semibold">Adjusted Card Volume</p>
                              <p>This is the new monthly card volume after the markup, tax, and tip adjustments are applied.</p>
                              <p className="font-medium">How it's calculated:</p>
                              <p className="text-sm">Adjusted Card Volume = (Monthly Sales ÷ (1 + Tax% + Tip%)) × (1 + Markup%) × (1 + Tax% + Tip%)</p>
                              {/* <p className="font-medium">Example:</p>
                              <p className="text-sm">If a merchant does $30,000/month in card sales, with 10% tax and 20% tip, and applies a 4% markup:</p>
                              <p className="text-sm">• Base Volume = $30,000 ÷ 1.30 = $23,076.92</p>
                              <p className="text-sm">• Marked-Up Base = $23,076.92 × 1.04 = $24,000</p>
                              <p className="text-sm">• Adjusted Volume = $24,000 × 1.30 = <strong>$31,200</strong></p>
                              <p className="text-sm">This becomes the new card volume after markup, tax, and tip.</p> */}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(previewData.newTotalVolume)}</p>
                      <p className="text-xs text-blue-600 font-medium">
                        +{((previewData.newTotalVolume / (monthlyVolume.creditCardVolume || 1) - 1) * 100).toFixed(1)}% increase
                      </p>
                    </div>

                    {/* Card Price Increase Collected */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Card Price Increase Collected
                        </p>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            <div className="space-y-2">
                              <p className="font-semibold">Card Price Increase Collected</p>
                              <p>Extra revenue collected from marking up card menu prices (e.g., $10 → $10.40).</p>
                              <p className="font-medium">How it's calculated:</p>
                              <p className="text-sm">Markup Collected = Base Volume × Markup%</p>
                              {/* <p className="font-medium">Example:</p>
                              <p className="text-sm">If the pre-tax/tip base volume is $23,076.92 and markup is 4%:</p>
                              <p className="text-sm">$23,076.92 × 4% = <strong>$923.08 collected from markup</strong></p>
                              <p className="text-sm">This is used to offset processing fees.</p> */}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(previewData.markupCollected)}</p>
                      <p className="text-xs text-gray-500">from {processingRates.priceDifferential || 0}% markup</p>
                    </div>

                    {/* Total Processing Fees Charged */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Total Processing Fees Charged
                        </p>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            <div className="space-y-2">
                              <p className="font-semibold">Total Processing Fees Charged</p>
                              <p>This is how much you'll be charged to process cards based on the new, adjusted volume after markup, tax, and tip.</p>
                              <p className="font-medium">How it's calculated:</p>
                              <p className="text-sm">Total Fees = Adjusted Card Volume × Flat Rate</p>
                              {/* <p className="font-medium">Example:</p>
                              <p className="text-sm">If your adjusted volume is $31,200 and the flat rate is 4%:</p>
                              <p className="text-sm">$31,200 × 4% = <strong>$1,248</strong></p>
                              <p className="text-sm">This is the new total cost of processing cards monthly.</p> */}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(previewData.processingFees)}</p>
                      <p className="text-xs text-gray-500">on new volume</p>
                    </div>

                  </div>

                  {/* Processing Breakdown Details */}
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-2">How it works:</p>
                    <p className="text-xs text-blue-600">
                      Base volume: {formatCurrency(previewData.originalBase)} •
                      After {processingRates.priceDifferential || 0}% markup: {formatCurrency(previewData.newTotalVolume)} •
                      Markup collected: {formatCurrency(previewData.markupCollected)}
                    </p>
                  </div>
                </div>

                {/* Processing Savings Section - matches Step 5 exactly */}
                <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    💳 Processing Savings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Processing Cost */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                      <div className="relative bg-white rounded-lg p-5 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">CURRENT</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-2">
                                  <p className="font-medium">What you pay now</p>
                                  <p className="text-sm">This is your current monthly cost for processing credit cards, calculated as:</p>
                                  <p className="text-sm font-mono">Credit Card Volume × Current Rate</p>
                                  <p className="text-sm">Example: $100,000 × 2.45% = $2,450/month</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Current Processing Cost</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {formatCurrency(previewData.currentCost)}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>

                    {/* New Processing Cost */}
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${previewData.netCost < 0 ? 'from-red-100 to-red-200' : 'from-blue-100 to-indigo-100'
                        } rounded-lg opacity-50 group-hover:opacity-70 transition-opacity`}></div>

                      <div className={`relative bg-white rounded-lg p-5 border ${previewData.netCost < 0 ? 'border-red-200' : 'border-blue-200'
                        } shadow-sm hover:shadow-md transition-all duration-200`}>

                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${previewData.netCost < 0 ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'
                            } px-2 py-1 rounded-full`}>
                            NEW
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-2">
                                  <p className="font-medium">Your net cost with DMP</p>
                                  <p className="text-sm">This is your actual out-of-pocket cost after implementing dual pricing, calculated as:</p>
                                  <p className="text-sm font-mono">Processing Fees - Markup Collected</p>
                                  <p className="text-sm">The markup collected from customers covers most or all of your processing fees. Negative values mean you profit from processing!</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">New Processing Cost</p>

                        <p className={`text-2xl font-bold mb-1 ${previewData.netCost < 0 ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          {formatCurrency(previewData.netCost)}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>

                    {/* Monthly Savings */}
                    <div className="relative group">
                      <div
                        className={`absolute inset-0 rounded-lg opacity-50 group-hover:opacity-70 transition-opacity
                          ${previewData.monthly < 0
                            ? 'bg-gradient-to-br from-red-100 to-rose-100'
                            : 'bg-gradient-to-br from-green-100 to-emerald-100'}
                        `}
                      ></div>
                      <div
                        className={`relative rounded-lg p-5 border shadow-sm hover:shadow-md transition-all duration-200
                          ${previewData.monthly < 0
                            ? 'bg-white border-red-200'
                            : 'bg-white border-green-200'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full
                              ${previewData.monthly < 0
                                ? 'text-red-700 bg-red-100'
                                : 'text-green-700 bg-green-100'}
                            `}
                          >
                            SAVINGS
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full
                              ${previewData.monthly < 0
                                ? 'bg-red-400'
                                : 'bg-green-400'}
                            `}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
                        <p
                          className={`text-2xl font-bold mb-1
                            ${previewData.monthly < 0
                              ? 'text-red-600'
                              : 'text-green-600'}
                          `}
                        >
                          {formatCurrency(previewData.monthly)}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* POS Software Impact Section */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-50/30 rounded-xl border border-purple-200 p-6">
                  <h4 className="text-sm font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    💻 POS Software Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Current Software Cost */}
                    <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Current Software Cost
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(processingRates.currentSoftwareCost || 0)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>

                    {/* New Software Cost */}
                    <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        New Software Cost
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(monthlySoftwareCost)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>

                    {/* Software Savings */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm ${previewData.softwareSavings > 0
                      ? 'border border-purple-200 ring-1 ring-purple-100'
                      : 'border border-red-600'
                      }`}>
                      <p className={`text-xs font-medium ${previewData.softwareSavings > 0 ? "text-purple-700" : "text-red-700"} uppercase tracking-wide mb-1`}>
                        Software Savings
                      </p>
                      <p className={`text-xl font-bold ${previewData.softwareSavings > 0 ? 'text-purple-600' :
                        previewData.softwareSavings < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                        {formatCurrency(previewData.softwareSavings)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {previewData.softwareSavings > 0 ? 'savings' :
                          previewData.softwareSavings < 0 ? 'decrease' : 'no change'}
                      </p>
                    </div>

                    {/* DMP Coverage Status */}
                    <div className={`bg-white rounded-lg p-4 border shadow-sm ${processingRates.dmpCoverSoftwareCost
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200'
                      }`}>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        DMP Covers Software
                      </p>
                      <p className="text-xl font-bold">
                        {processingRates.dmpCoverSoftwareCost ? (
                          <span className="text-purple-600">Yes ✓</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {processingRates.dmpCoverSoftwareCost ? 'included benefit' : 'merchant pays'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Savings Section */}
                <div className={`rounded-xl p-6 shadow-lg border-2
                  ${previewData.adjustedMonthlySavings < 0
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'}
                `}>
                  <h4 className={`text-sm font-semibold mb-4 flex items-center gap-2
                    ${previewData.adjustedMonthlySavings < 0
                      ? 'text-red-800'
                      : 'text-green-800'}
                  `}>
                    🎯 Total Savings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Processing Savings */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm border
                      ${previewData.monthly < 0 ? 'border-red-200' : 'border-green-200'}
                    `}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-1
                        ${previewData.monthly < 0 ? 'text-red-700' : 'text-green-700'}
                      `}>
                        Processing Savings
                      </p>
                      <p className={`text-xl font-bold
                        ${previewData.monthly < 0 ? 'text-red-600' : 'text-green-600'}
                      `}>
                        {formatCurrency(previewData.monthly)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>

                    {/* Software Savings */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm border
                      ${previewData.softwareSavings < 0 ? 'border-red-200' : 'border-green-200'}
                    `}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-1
                        ${previewData.softwareSavings < 0 ? 'text-red-700' : 'text-green-700'}
                      `}>
                        Software Savings
                      </p>
                      <p className={`text-xl font-bold
                        ${previewData.softwareSavings < 0 ? 'text-red-600' : 'text-green-600'}
                      `}>
                        {formatCurrency(previewData.softwareSavings)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>

                    {/* Total Monthly Savings */}
                    <div className={`bg-white rounded-lg p-4 shadow-md border-2
                      ${previewData.adjustedMonthlySavings < 0 ? 'border-red-400' : 'border-green-400'}
                    `}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-1
                        ${previewData.adjustedMonthlySavings < 0 ? 'text-red-700' : 'text-green-700'}
                      `}>
                        Total Monthly Savings
                      </p>
                      <p className={`text-xl font-bold
                        ${previewData.adjustedMonthlySavings < 0 ? 'text-red-600' : 'text-green-600'}
                      `}>
                        {formatCurrency(previewData.adjustedMonthlySavings)}
                      </p>
                      <p className="text-xs text-gray-500">combined savings</p>
                    </div>

                    {/* Combined Savings % */}
                    <div className={`bg-white rounded-lg p-4 shadow-sm border
                      ${previewData.adjustedMonthlySavings < 0 ? 'border-red-200' : 'border-green-200'}
                    `}>
                      <p className={`text-xs font-medium uppercase tracking-wide mb-1
                        ${previewData.adjustedMonthlySavings < 0 ? 'text-red-700' : 'text-green-700'}
                      `}>
                        Combined Savings %
                      </p>
                      <p className={`text-xl font-bold
                        ${previewData.adjustedMonthlySavings < 0 ? 'text-red-600' : 'text-green-600'}
                      `}>
                        {(() => {
                          const totalCurrentCost = previewData.currentCost + (processingRates.currentSoftwareCost || 0);
                          return totalCurrentCost > 0
                            ? `${((previewData.adjustedMonthlySavings / totalCurrentCost) * 100).toFixed(1)}%`
                            : "0.0%";
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">cost reduction</p>
                    </div>
                  </div>

                  {/* Annual Impact */}
                  <div className={`mt-4 p-4 rounded-lg border
                    ${previewData.adjustedMonthlySavings < 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'}
                  `}>
                    <p className={`text-sm font-medium
                      ${previewData.adjustedMonthlySavings < 0 ? 'text-red-800' : 'text-green-800'}
                    `}>
                      💰 Annual Impact: <span className="font-bold text-lg">
                        {formatCurrency(previewData.adjustedMonthlySavings * 12)}
                      </span> in total savings
                    </p>
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Options</h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="dmp-cover-software"
                checked={processingRates.dmpCoverSoftwareCost || false}
                disabled={isQuoteFrozen || isReadOnly}
                onCheckedChange={(checked) => {
                  if (isQuoteFrozen || isReadOnly) return;
                  updateProcessingRates({ dmpCoverSoftwareCost: checked });
                }}
              />
              <Label htmlFor="dmp-cover-software" className={(isQuoteFrozen || isReadOnly) ? 'text-gray-500' : ''}>
                DMP covers software cost
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enable this if DMP will fully cover the monthly software cost — this lowers the merchant credit but increases monthly savings.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hardware-quote-only"
                checked={processingRates.hardwareQuoteOnly || false}
                disabled={isQuoteFrozen || isReadOnly}
                onCheckedChange={(checked) => {
                  if (isQuoteFrozen || isReadOnly) return;
                  updateProcessingRates({ hardwareQuoteOnly: checked });
                }}
              />
              <Label htmlFor="hardware-quote-only" className={(isQuoteFrozen || isReadOnly) ? 'text-gray-500' : ''}>
                Hardware quote only (no merchant credit/ROI)
              </Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Use this mode if you only want to quote hardware, software, and menu work — no processing savings or merchant credit will be included.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent >
      </Card >
    </div >
  );
}