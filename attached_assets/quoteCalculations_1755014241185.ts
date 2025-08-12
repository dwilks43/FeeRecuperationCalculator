/**
 * Quote Calculation Utilities
 * 
 * This module provides standardized calculation functions for the Quote Generator.
 * These functions ensure consistency between all stages of quote creation:
 * - Stage 3 (Hardware Configuration)
 * - Stage 4 (Processing Volume)
 * - Stage 5 (Quote Summary)
 * - PDF Generation
 * - Email Distribution
 */

// Define the types needed for calculations directly in this file
// This avoids dependencies on other type files

export interface HardwareItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  [key: string]: any;
}

export interface MenuItem {
  name?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  [key: string]: any;
}

export interface SoftwareItem {
  itemName: string;
  quantity: number;
  monthlySoftware?: number | string;
  [key: string]: any;
}

export interface AddOnItem {
  name?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  [key: string]: any;
}

interface CreditCalculationInput {
  monthlyVolume: number;
  priceDifferential: number;
  interchangeCost: number;
  dmpProfitShare: number;
  roiMonths: number;
  currentSoftwareCost?: number; // Add support for currentSoftwareCost
  newSoftwareCost?: number; // Add support for DMP covering software cost
}

/**
 * DUAL PRICING VOLUME CALCULATIONS
 * These functions handle the correct volume adjustments when markup is applied
 */

/**
 * Calculate the original base amount from total volume (backing out tax and tip)
 * Formula: baseAmount = totalVolume / (1 + (taxPercent + tipPercent) / 100)
 * 
 * @param monthlyVolume Total monthly volume including tax and tip
 * @param taxPercent Tax percentage (e.g., 10 for 10%)
 * @param tipPercent Tip percentage (e.g., 20 for 20%)
 * @returns Original base amount before tax and tip
 */
export function calculateOriginalBaseAmount(
  monthlyVolume: number,
  taxPercent: number,
  tipPercent: number
): number {
  const divisor = 1 + (taxPercent + tipPercent) / 100;
  return monthlyVolume / divisor;
}

/**
 * Calculate new base amount after applying price differential
 * Formula: newBase = originalBase × (1 + priceDifferential / 100)
 * 
 * @param originalBase Original base amount
 * @param priceDifferential Price differential percentage (e.g., 4 for 4%)
 * @returns New base amount after markup
 */
export function calculateNewBaseAmount(
  originalBase: number,
  priceDifferential: number
): number {
  return originalBase * (1 + priceDifferential / 100);
}

/**
 * Calculate new total volume after markup (including tax and tip on new base)
 * Formula: newTotal = newBase × (1 + (taxPercent + tipPercent) / 100)
 * 
 * @param newBase New base amount after markup
 * @param taxPercent Tax percentage
 * @param tipPercent Tip percentage
 * @returns New total volume
 */
export function calculateNewTotalVolume(
  newBase: number,
  taxPercent: number,
  tipPercent: number
): number {
  return newBase * (1 + (taxPercent + tipPercent) / 100);
}

/**
 * Calculate markup collected (on original base amount only)
 * Formula: markup = originalBase × (priceDifferential / 100)
 * 
 * @param originalBase Original base amount before markup
 * @param priceDifferential Price differential percentage
 * @returns Markup amount collected
 */
export function calculateCorrectMarkupCollected(
  originalBase: number,
  priceDifferential: number
): number {
  return originalBase * (priceDifferential / 100);
}

/**
 * Calculate processing fees on the new total volume using flat rate processing
 * Formula: fees = newTotalVolume × (flatRatePercent / 100)
 * 
 * @param newTotalVolume New total volume after markup
 * @param flatRatePercent Flat rate processing percentage (not interchange rate)
 * @returns Processing fees
 */
export function calculateCorrectProcessingFees(
  newTotalVolume: number,
  flatRatePercent: number
): number {
  return newTotalVolume * (flatRatePercent / 100);
}

/**
 * Calculate total hardware costs from configuration object or array
 * Supports both legacy array format and new configuration object format
 * 
 * @param input Either HardwareItem[] or configuration object with hardware arrays
 * @returns Total hardware cost with 2 decimal precision
 */
export function calculateHardwareTotals(input: any): number {
  let total = 0;

  // Handle array input (legacy format)
  if (Array.isArray(input)) {
    total = input.reduce((sum, item) => {
      const quantity = typeof item.quantity === 'string' ? Number(item.quantity) : item.quantity;
      const unitPrice = typeof item.unitPrice === 'string' ? Number(item.unitPrice) : item.unitPrice;

      if (isNaN(quantity) || isNaN(unitPrice)) {
        return sum;
      }

      return sum + (quantity * unitPrice);
    }, 0);
  } else {
    // Handle configuration object input (new format)
    const config = input;

    // Bundles
    (config.bundles || []).forEach((bundle: any) => {
      const quantity = bundle.quantity || 0;
      const unitPrice = typeof bundle.unitPrice === 'string'
        ? Number(bundle.unitPrice) || 0
        : (bundle.unitPrice || 0);
      total += quantity * unitPrice;
    });

    // Individual Equipment
    (config.individualEquipment || []).forEach((item: any) => {
      const quantity = item.quantity || 0;
      const unitPrice = typeof item.unitPrice === 'string'
        ? Number(item.unitPrice) || 0
        : (item.unitPrice || 0);
      total += quantity * unitPrice;
    });

    // Optional Equipment
    (config.optionalEquipment || []).forEach((item: any) => {
      const quantity = item.quantity || 0;
      const unitPrice = typeof item.unitPrice === 'string'
        ? Number(item.unitPrice) || 0
        : (item.unitPrice || 0);
      total += quantity * unitPrice;
    });

    // Other Hardware
    (config.otherHardware || []).forEach((item: any) => {
      const quantity = item.quantity || 0;
      const unitPrice = typeof item.unitPrice === 'string'
        ? Number(item.unitPrice) || 0
        : (item.unitPrice || 0);
      total += quantity * unitPrice;
    });
  }

  return Number(total.toFixed(2));
}

/**
 * Calculate Menu Works totals including items, add-ons and design fee
 * 
 * @param menuItems Array of menu items
 * @param menuAddOns Array of menu add-ons
 * @param designFee Design fee (if applicable)
 * @returns Total Menu Works cost with 2 decimal precision
 */
export function calculateMenuWorksTotals(
  menuItems: MenuItem[] = [],
  menuAddOns: AddOnItem[] = [],
  designFee: number = 0
): number {
  // Calculate menu items total
  const menuItemsTotal = !menuItems || !Array.isArray(menuItems) ? 0 :
    menuItems.reduce((sum, item) => {
      const quantity = typeof item.quantity === 'string' ? Number(item.quantity) || 0 : item.quantity;
      const unitPrice = typeof item.unitPrice === 'string' ? Number(item.unitPrice) || 0 : item.unitPrice;

      if (isNaN(quantity) || isNaN(unitPrice)) {
        return sum;
      }

      return sum + (quantity * unitPrice);
    }, 0);

  // Calculate menu add-ons total
  const menuAddOnsTotal = !menuAddOns || !Array.isArray(menuAddOns) ? 0 :
    menuAddOns.reduce((sum, item) => {
      const quantity = typeof item.quantity === 'string' ? Number(item.quantity) || 0 : item.quantity;
      const unitPrice = typeof item.unitPrice === 'string' ? Number(item.unitPrice) || 0 : item.unitPrice;

      if (isNaN(quantity) || isNaN(unitPrice)) {
        return sum;
      }

      return sum + (quantity * unitPrice);
    }, 0);

  // Ensure designFee is a number
  const parsedDesignFee = typeof designFee === 'string' ? Number(designFee) || 0 : designFee;
  const safeDesignFee = !isNaN(parsedDesignFee) ? parsedDesignFee : 0;

  // Calculate total with 2 decimal precision
  const total = menuItemsTotal + menuAddOnsTotal + safeDesignFee;
  return Number(total.toFixed(2));
}

/**
 * Calculate monthly software costs from all software items
 * 
 * @param softwareItems Array of software items
 * @returns Total monthly software cost with 2 decimal precision
 */
export function calculateMonthlySoftwareCost(softwareItems: SoftwareItem[] = []): number {
  if (!softwareItems || !Array.isArray(softwareItems)) {
    return 0;
  }

  const total = softwareItems.reduce((sum, item) => {
    // Get the correct monthly software cost based on quantity
    let softwareCost = 0;
    if (item.monthlySoftware !== undefined) {
      // Convert to number if it's a string
      softwareCost = typeof item.monthlySoftware === 'string' ?
        Number(item.monthlySoftware) || 0 : item.monthlySoftware;
    }

    const quantity = typeof item.quantity === 'string' ?
      Number(item.quantity) || 0 : item.quantity;

    if (isNaN(softwareCost) || isNaN(quantity)) {
      return sum;
    }

    return sum + (softwareCost * quantity);
  }, 0);

  // Return with 2 decimal precision
  return Number(total.toFixed(2));
}



/**
 * Calculate merchant credit based on formula:
 * Merchant Credit = (Flat Rate Processing % - Interchange Cost) × ROI Months × DMP Profit Share %
 * 
 * @param input Object containing required parameters for credit calculation
 * @returns Merchant credit amount with 2 decimal precision
 */
export function calculateMerchantCredit(input: CreditCalculationInput & {
  taxPercent?: number;
  tipPercent?: number;
  flatRatePercent?: number;
}): number {
  const {
    monthlyVolume = 0,
    priceDifferential = 0,
    flatRatePercent = 0,
    interchangeCost = 0,
    dmpProfitShare = 50,
    roiMonths = 6
  } = input;

  // CORRECTED FORMULA: (Flat Rate Processing % - Interchange Cost) × ROI Months × DMP Profit Share %
  // Use flatRatePercent if available, otherwise fall back to priceDifferential
  const effectiveRate = flatRatePercent || priceDifferential;
  const netMargin = effectiveRate - interchangeCost;
  const profitShareDecimal = dmpProfitShare > 1 ? dmpProfitShare / 100 : dmpProfitShare;

  // Apply the simple formula: Net Margin × ROI Months × Profit Share × Volume Factor
  // Volume factor accounts for volume scaling (per $100K)
  const volumeFactor = monthlyVolume / 100000; // Scale to per $100K
  const totalCredit = netMargin * roiMonths * profitShareDecimal * volumeFactor * 1000; // *1000 to convert percentage to dollars

  // IMMUTABILITY FIX: Use Number() with toFixed to prevent parseFloat drift
  return Number(Math.max(0, totalCredit).toFixed(2));
}

/**
 * Calculate total amount due after applying merchant credit
 * 
 * @param hardwareTotal Total hardware cost
 * @param menuWorksTotal Total Menu Works cost
 * @param credit Merchant credit amount
 * @returns Total after credit (minimum 0) with 2 decimal precision
 */
export function calculateTotalAfterCredit(
  hardwareTotal: number = 0,
  menuWorksTotal: number = 0,
  credit: number = 0
): number {
  // Ensure all inputs are numbers
  const safeHardwareTotal = typeof hardwareTotal === 'string' ? Number(hardwareTotal) || 0 : hardwareTotal;
  const safeMenuWorksTotal = typeof menuWorksTotal === 'string' ? Number(menuWorksTotal) || 0 : menuWorksTotal;
  const safeCredit = typeof credit === 'string' ? Number(credit) || 0 : credit;

  // Calculate total (minimum 0)
  const total = Math.max(0, safeHardwareTotal + safeMenuWorksTotal - safeCredit);

  // IMMUTABILITY FIX: Use Number() with toFixed to prevent parseFloat drift
  return Number(total.toFixed(2));
}

/**
 * Create a standardized quote summary object with all calculated totals
 * 
 * @param hardwareItems All hardware items
 * @param softwareItems All software items
 * @param menuItems Menu items (if applicable)
 * @param menuAddOns Menu add-ons (if applicable)
 * @param designFee Design fee (if applicable)
 * @param creditCalculation Parameters for credit calculation
 * @returns An object with all calculated totals
 */
/**
 * Calculate a quote summary with all cost breakdowns and savings analysis
 * 
 * @param hardwareItems All hardware items from Step 3
 * @param softwareItems All software items from Step 3
 * @param menuItems Menu items (if applicable)
 * @param menuAddOns Menu add-ons (if applicable)
 * @param designFee Design fee (if applicable)
 * @param creditCalculation Parameters for credit calculation
 * @param savingsCalculation Parameters for savings and ROI calculation
 * @returns An object with all calculated totals and analysis
 */

/**
 * Calculate processing savings based on monthly volume and effective rate
 * UPDATED: Now properly handles dual pricing volume adjustments
 * 
 * @param monthlyVolume Monthly credit card volume
 * @param currentRate Current effective processing rate (as percentage, e.g., 3.5)
 * @param proposedRate Proposed processing rate (as percentage, e.g., 2.5)
 * @param priceDifferential Price differential for dual pricing (optional)
 * @param taxPercent Tax percentage (optional)
 * @param tipPercent Tip percentage (optional)
 * @returns Object with monthly and annual processing savings
 */
export function calculateProcessingSavings(
  monthlyVolume: number | undefined,
  currentRate: number | undefined,
  proposedRate: number | undefined,
  priceDifferential: number = 0,
  taxPercent: number = 0,
  tipPercent: number = 0
): { monthly: number; annual: number } {
  // Use 0 as default for undefined values
  const safeMonthlyVolume = monthlyVolume ?? 0;
  const safeCurrentRate = currentRate ?? 0;
  const safeProposedRate = proposedRate ?? 0;

  // Convert rates to decimals if needed
  const currentRateDecimal = safeCurrentRate > 1 ? safeCurrentRate / 100 : safeCurrentRate;
  const proposedRateDecimal = safeProposedRate > 1 ? safeProposedRate / 100 : safeProposedRate;

  // Calculate current processing cost (on original volume)
  const currentProcessingCost = safeMonthlyVolume * currentRateDecimal;

  // For proposed cost with dual pricing, we need to calculate the net cost
  let proposedProcessingCost = 0;

  if (priceDifferential > 0) {
    // Dual pricing scenario - calculate net cost properly
    const originalBase = calculateOriginalBaseAmount(safeMonthlyVolume, taxPercent, tipPercent);
    const newBase = calculateNewBaseAmount(originalBase, priceDifferential);
    const newTotalVolume = calculateNewTotalVolume(newBase, taxPercent, tipPercent);

    const markupCollected = calculateCorrectMarkupCollected(originalBase, priceDifferential);
    const processingFees = calculateCorrectProcessingFees(newTotalVolume, safeProposedRate * 100);

    proposedProcessingCost = Math.max(0, processingFees - markupCollected);
  } else {
    // Standard pricing - simple calculation
    proposedProcessingCost = safeMonthlyVolume * proposedRateDecimal;
  }

  // Calculate monthly savings
  const monthlySavings = currentProcessingCost - proposedProcessingCost;

  // Calculate annual savings
  const annualSavings = monthlySavings * 12;

  // Return with 2 decimal precision
  return {
    monthly: parseFloat(monthlySavings.toFixed(2)),
    annual: parseFloat(annualSavings.toFixed(2))
  };
}

/**
 * Calculate software savings based on current and new monthly software costs
 * 
 * @param currentSoftwareCost Current monthly software cost
 * @param newSoftwareCost New monthly software cost from selected POS
 * @param dmpCoversSoftware Whether DMP covers the software cost (optional)
 * @returns Object with monthly and annual software savings
 */
export function calculateSoftwareSavings(
  currentSoftwareCost: number | undefined,
  newSoftwareCost: number,
  dmpCoversSoftware: boolean = false
): { monthly: number; annual: number } {
  const safeCurrentSoftwareCost = currentSoftwareCost ?? 0;

  // CORRECTED LOGIC:
  // If DMP covers software, merchant saves their ENTIRE current cost
  // because they pay $0 for new software
  const monthlySavings = dmpCoversSoftware
    ? safeCurrentSoftwareCost  // Full current cost saved
    : safeCurrentSoftwareCost - newSoftwareCost;  // Normal difference

  const annualSavings = monthlySavings * 12;

  return {
    monthly: parseFloat(monthlySavings.toFixed(2)),
    annual: parseFloat(annualSavings.toFixed(2))
  };
}

/**
 * Calculate combined savings (processing + software)
 * 
 * @param processingSavings Processing savings object
 * @param softwareSavings Software savings object
 * @returns Object with total monthly and annual savings
 */
export function calculateCombinedSavings(
  processingSavings: { monthly: number; annual: number },
  softwareSavings: { monthly: number; annual: number }
): { monthly: number; annual: number } {
  // Calculate combined monthly savings
  const monthlySavings = processingSavings.monthly + softwareSavings.monthly;

  // Calculate combined annual savings
  const annualSavings = processingSavings.annual + softwareSavings.annual;

  // Return with 2 decimal precision
  return {
    monthly: parseFloat(monthlySavings.toFixed(2)),
    annual: parseFloat(annualSavings.toFixed(2))
  };
}

/**
 * Calculate ROI (Return on Investment) in months
 * 
 * @param totalDue Total amount due
 * @param processingMonthlySavings Monthly processing savings
 * @param softwareMonthlySavings Monthly software savings
 * @returns ROI in months or null if total monthly savings is zero
 */
export function calculateROI(
  totalDue: number,
  processingMonthlySavings: number,
  softwareMonthlySavings: number
): number | null {
  // Calculate total monthly savings (processing + software)
  const totalMonthlySavings = processingMonthlySavings + softwareMonthlySavings;

  // Return null if total monthly savings is zero to prevent division by zero
  if (totalMonthlySavings <= 0) {
    return null;
  }

  // Calculate ROI in months
  const roiMonths = totalDue / totalMonthlySavings;

  // Return with 1 decimal precision
  return Number(roiMonths.toFixed(1));
}

/**
 * Calculate a complete savings and ROI analysis
 * 
 * @param monthlyVolume Monthly credit card volume
 * @param currentRate Current effective rate (%)
 * @param proposedRate Proposed effective rate (%)
 * @param currentSoftwareCost Current monthly software cost
 * @param newSoftwareCost New monthly software cost
 * @param totalDue Total amount due
 * @returns Complete savings and ROI analysis object
 */
export function calculateSavingsAnalysis(
  monthlyVolume: number | undefined,
  currentRate: number | undefined,
  proposedRate: number | undefined,
  currentSoftwareCost: number | undefined,
  newSoftwareCost: number,
  totalDue: number
): {
  processingSavings: { monthly: number; annual: number };
  softwareSavings: { monthly: number; annual: number };
  combinedSavings: { monthly: number; annual: number };
  roi: number | null;
} {
  // Calculate processing savings
  const processingSavings = calculateProcessingSavings(
    monthlyVolume,
    currentRate,
    proposedRate
  );

  // Calculate software savings
  const softwareSavings = calculateSoftwareSavings(
    currentSoftwareCost,
    newSoftwareCost
  );

  // Calculate combined savings
  const combinedSavings = calculateCombinedSavings(
    processingSavings,
    softwareSavings
  );

  // Calculate ROI using both processing and software savings
  const roi = calculateROI(totalDue, processingSavings.monthly, softwareSavings.monthly);

  // Return complete analysis
  return {
    processingSavings,
    softwareSavings,
    combinedSavings,
    roi
  };
}

export function calculateQuoteSummary({
  hardwareItems = [],
  softwareItems = [],
  menuItems = [],
  menuAddOns = [],
  designFee = 0,
  creditCalculation = {
    monthlyVolume: 0,
    priceDifferential: 0,
    interchangeCost: 0,
    // We'll use default values if undefined later in calculateMerchantCredit
    dmpProfitShare: 50,
    roiMonths: 6
  },
  savingsCalculation = {
    monthlyVolume: 0,
    currentRate: 0,
    proposedRate: 0,
    currentSoftwareCost: 0
  }
}: {
  hardwareItems?: HardwareItem[];
  softwareItems?: SoftwareItem[];
  menuItems?: MenuItem[];
  menuAddOns?: AddOnItem[];
  designFee?: number;
  creditCalculation?: CreditCalculationInput;
  savingsCalculation?: {
    monthlyVolume: number;
    currentRate: number;
    proposedRate: number;
    currentSoftwareCost: number;
  };
}) {
  // Calculate all totals using the standardized functions
  const hardwareTotals = calculateHardwareTotals(hardwareItems);
  const menuWorksTotals = calculateMenuWorksTotals(menuItems, menuAddOns, designFee);
  const monthlySoftwareCost = calculateMonthlySoftwareCost(softwareItems);

  // Ensure we have values for required calculation params
  const safeCalculation = {
    ...creditCalculation,
    // Use defaults if undefined (shouldn't happen as we're getting from DB now)
    dmpProfitShare: creditCalculation.dmpProfitShare ?? 50,
    roiMonths: creditCalculation.roiMonths ?? 6
  };

  const merchantCredit = calculateMerchantCredit(safeCalculation);
  const totalAfterCredit = calculateTotalAfterCredit(hardwareTotals, menuWorksTotals, merchantCredit);

  // Calculate savings and ROI analysis
  const savingsAnalysis = calculateSavingsAnalysis(
    savingsCalculation.monthlyVolume,
    savingsCalculation.currentRate,
    savingsCalculation.proposedRate,
    savingsCalculation.currentSoftwareCost,
    monthlySoftwareCost,
    totalAfterCredit
  );

  // Return consolidated summary object
  return {
    hardwareTotals,
    menuWorksTotals,
    monthlySoftwareCost,
    merchantCredit,
    totalAfterCredit,
    savingsAnalysis
  };
}

/**
 * Helper functions for dual pricing calculations
 */
function calculateBaseItemPortion(
  taxPercent: number,
  tipPercent: number
): number {
  return 1 / (1 + (taxPercent / 100) + (tipPercent / 100));
}

function calculateMarkupCollected(
  monthlyVolume: number,
  baseItemPortion: number,
  priceDifferentialPercent: number
): number {
  return monthlyVolume * baseItemPortion * (priceDifferentialPercent / 100);
}

function calculateProcessingFees(
  monthlyVolume: number,
  flatRatePercent: number
): number {
  return monthlyVolume * (flatRatePercent / 100);
}

function calculateNetProcessingCost(
  processingFees: number,
  markupCollected: number
): number {
  return Math.max(0, processingFees - markupCollected);
}

/**
 * Calculate realistic processing savings with dual pricing
 * This is the same function used in the client-side Step 5 calculations
 */
export function calculateRealisticProcessingSavings(
  monthlyVolume: number,
  currentRate: number,
  flatRatePercent: number,
  priceDifferentialPercent: number,
  taxPercent: number,
  tipPercent: number
): { monthly: number, annual: number, netCost: number, currentCost: number } {
  // Current processing cost
  const currentProcessingCost = monthlyVolume * (currentRate / 100);

  // Calculate new processing cost (flat rate)
  const newProcessingCost = monthlyVolume * (flatRatePercent / 100);

  // Calculate new net cost with dual pricing
  const baseItemPortion = calculateBaseItemPortion(taxPercent, tipPercent);
  const markupCollected = calculateMarkupCollected(monthlyVolume, baseItemPortion, priceDifferentialPercent);
  const processingFees = calculateProcessingFees(monthlyVolume, flatRatePercent);
  const netCost = calculateNetProcessingCost(processingFees, markupCollected);

  // Use the higher of netCost or standard new processing cost as the actual new cost
  const actualNewCost = Math.max(netCost, newProcessingCost * 0.5); // Ensure realistic minimum

  // Calculate savings
  const monthlySavings = currentProcessingCost - actualNewCost;
  const annualSavings = monthlySavings * 12;

  const result = {
    monthly: Math.max(0, monthlySavings),
    annual: Math.max(0, annualSavings),
    netCost: actualNewCost,
    currentCost: currentProcessingCost
  };

  return result;
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate total monthly software cost from items with tiered pricing
 */
export function calculateTotalMonthlySoftwareCost(
  items: Array<{
    quantity: number,
    monthlySoftware?: number | string,
    softwareCost2?: number | string,
    softwareCost3?: number | string,
    softwareCost4?: number | string,
    hasSoftware?: boolean,
    softwareCosts?: {
      unit1: number;
      unit2: number;
      unit3: number;
      unit4: number;
    }
  }>
): number {
  return items.reduce((total, item) => {
    const quantity = item.quantity || 1;
    let monthlyCost = 0;

    // Tiered pricing implementation using the database fields
    if (quantity >= 1 && item.monthlySoftware !== undefined && item.monthlySoftware !== null) {
      // First unit always uses monthlySoftware
      const firstUnitCost = typeof item.monthlySoftware === 'string'
        ? Number(item.monthlySoftware)
        : item.monthlySoftware;

      if (!isNaN(firstUnitCost)) {
        monthlyCost += firstUnitCost;
      }
    }

    // Second unit uses softwareCost2
    if (quantity >= 2 && item.softwareCost2 !== undefined && item.softwareCost2 !== null) {
      const secondUnitCost = typeof item.softwareCost2 === 'string'
        ? Number(item.softwareCost2)
        : item.softwareCost2;

      if (!isNaN(secondUnitCost)) {
        monthlyCost += secondUnitCost;
      }
    }

    // Third unit uses softwareCost3
    if (quantity >= 3 && item.softwareCost3 !== undefined && item.softwareCost3 !== null) {
      const thirdUnitCost = typeof item.softwareCost3 === 'string'
        ? Number(item.softwareCost3)
        : item.softwareCost3;

      if (!isNaN(thirdUnitCost)) {
        monthlyCost += thirdUnitCost;
      }
    }

    // Fourth unit uses softwareCost4
    if (quantity >= 4 && item.softwareCost4 !== undefined && item.softwareCost4 !== null) {
      const fourthUnitCost = typeof item.softwareCost4 === 'string'
        ? Number(item.softwareCost4)
        : item.softwareCost4;

      if (!isNaN(fourthUnitCost)) {
        monthlyCost += fourthUnitCost;
      }
    }

    return total + monthlyCost;
  }, 0);
}

/**
 * Apply markup to a price
 */
export function applyMarkup(basePrice: number, markupPercentage: number): number {
  return basePrice * (1 + markupPercentage / 100);
}