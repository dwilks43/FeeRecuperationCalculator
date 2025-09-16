import { CalculatorInputs, CalculatorResults, CustomerInfo } from '@/types/calculator';
import { formatCurrency } from './calculations';

/**
 * v1.7.3 PDF Data Transformer
 * Transforms raw calculator data into the UI-formatted structure expected by pdf.config.json
 * Source of Truth: UI - no recalculation, exact mirroring of on-screen values
 */

// Generate a random 8-digit report ID
function generateReportId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Format the current date as MM/DD/YYYY
function formatDate(): string {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
}

// Format percentage values
function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Format currency values consistently
function formatMoney(value: number): string {
  return formatCurrency(value);
}

// Map fee timing to user-friendly text
function getFeeTimingLabel(feeTiming?: string): string {
  switch (feeTiming) {
    case 'FEE_AFTER_TIP':
      return 'Tip at time of sale';
    case 'FEE_BEFORE_TIP':
      return 'Tip handwritten – post sale';
    default:
      return 'Standard';
  }
}

// Map fee tax basis to user-friendly text
function getFeeTaxBasisLabel(feeTaxBasis?: string): string {
  switch (feeTaxBasis) {
    case 'POST_TAX':
      return 'Apply fee to post-tax amount';
    case 'PRE_TAX':
      return 'Apply fee to pre-tax amount';
    default:
      return 'Standard';
  }
}

// Get order of operations text based on program type and settings
function getOrderOfOperationsText(inputs: CalculatorInputs): string {
  if (inputs.programType === 'DUAL_PRICING') {
    return 'Base Card Volume → +Price Differential → +Tax → +Tip';
  }
  
  // Supplemental Fee order of operations
  const tipTiming = inputs.tipTiming || 
    (inputs.feeTiming === 'FEE_BEFORE_TIP' ? 'BEFORE_TIP' : 'AFTER_TIP');
  const feeTaxBasis = inputs.feeTaxBasis || 'POST_TAX';
  
  const comboKey = `${tipTiming}__${feeTaxBasis}`;
  
  const orderOfOperationsMap: Record<string, string> = {
    'BEFORE_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Supplemental Fee → +Tip',
    'BEFORE_TIP__PRE_TAX': 'Pre-Tax Base → +Supplemental Fee → +Tax → +Tip',
    'AFTER_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Tip → +Supplemental Fee',
    'AFTER_TIP__PRE_TAX': 'Pre-Tax Base → +Tip → +Fee → +Tax'
  };
  
  return orderOfOperationsMap[comboKey] || 'Standard order of operations';
}

// Build Customer Information rows
function buildCustomerInfoRows(customerInfo: Partial<CustomerInfo>): any[] {
  const rows = [];
  
  if (customerInfo.businessName) {
    rows.push({ label: 'Business Name', value: customerInfo.businessName, format: 'text' });
  }
  
  if (customerInfo.streetAddress) {
    rows.push({ label: 'Street Address', value: customerInfo.streetAddress, format: 'text' });
  }
  
  const cityStateZip = [
    customerInfo.city,
    customerInfo.state,
    customerInfo.zipCode
  ].filter(Boolean).join(', ');
  
  if (cityStateZip) {
    rows.push({ label: 'City, State, ZIP', value: cityStateZip, format: 'text' });
  }
  
  if (customerInfo.contactName) {
    rows.push({ label: 'Contact Name', value: customerInfo.contactName, format: 'text' });
  }
  
  if (customerInfo.contactTitle) {
    rows.push({ label: 'Contact Title', value: customerInfo.contactTitle, format: 'text' });
  }
  
  if (customerInfo.contactEmail) {
    rows.push({ label: 'Contact Email', value: customerInfo.contactEmail, format: 'text' });
  }
  
  if (customerInfo.salesRepName) {
    rows.push({ label: 'Sales Rep Name', value: customerInfo.salesRepName, format: 'text' });
  }
  
  if (customerInfo.salesRepEmail) {
    rows.push({ label: 'Sales Rep Email', value: customerInfo.salesRepEmail, format: 'text' });
  }
  
  if (customerInfo.salesRepPhone) {
    rows.push({ label: 'Sales Rep Phone', value: customerInfo.salesRepPhone, format: 'text' });
  }
  
  return rows;
}

// Build Input Parameters rows
function buildInputParamsRows(inputs: CalculatorInputs): any[] {
  const rows = [];
  
  // Program Type
  rows.push({ 
    label: 'Program Type', 
    value: inputs.programType === 'DUAL_PRICING' ? 
      'Dual Pricing or Cash Discounting' : 'Supplemental Fee', 
    format: 'text' 
  });
  
  // Monthly volumes
  rows.push({ 
    label: 'Monthly Card Volume (Gross)', 
    value: inputs.monthlyVolume, 
    format: 'money' 
  });
  
  if (inputs.monthlyCashVolume > 0) {
    rows.push({ 
      label: 'Monthly Cash Volume', 
      value: inputs.monthlyCashVolume, 
      format: 'money' 
    });
  }
  
  // Rates
  rows.push({ 
    label: 'Current Processing Rate', 
    value: inputs.currentRate / 100, 
    format: 'percent' 
  });
  
  if (inputs.interchangeCost > 0) {
    rows.push({ 
      label: 'Interchange Cost', 
      value: inputs.interchangeCost / 100, 
      format: 'percent' 
    });
  }
  
  rows.push({ 
    label: 'Flat Rate %', 
    value: inputs.flatRate / 100, 
    format: 'percent' 
  });
  
  // Tax and tip
  if (inputs.taxRate > 0) {
    rows.push({ 
      label: 'Tax Rate', 
      value: inputs.taxRate / 100, 
      format: 'percent' 
    });
  }
  
  if (inputs.tipRate > 0) {
    rows.push({ 
      label: 'Tip Rate', 
      value: inputs.tipRate / 100, 
      format: 'percent' 
    });
  }
  
  // Price differential / Supplemental fee
  const differentialLabel = inputs.programType === 'DUAL_PRICING' ? 
    'Price Differential' : 'Supplemental Fee %';
  rows.push({ 
    label: differentialLabel, 
    value: inputs.priceDifferential / 100, 
    format: 'percent' 
  });
  
  // Supplemental Fee specific settings
  if (inputs.programType === 'SUPPLEMENTAL_FEE') {
    if (inputs.feeTiming) {
      rows.push({ 
        label: 'Fee Timing', 
        value: getFeeTimingLabel(inputs.feeTiming), 
        format: 'text' 
      });
    }
    
    if (inputs.feeTaxBasis) {
      rows.push({ 
        label: 'Fee Tax Basis', 
        value: getFeeTaxBasisLabel(inputs.feeTaxBasis), 
        format: 'text' 
      });
    }
  }
  
  return rows;
}

// Build Live Volume Breakdown rows for Dual Pricing
function buildDualPricingBreakdownRows(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const rows = [];
  
  // Derived Bases & Totals section
  rows.push({ 
    label: 'Base Card Volume (pre-tax, pre-tip)', 
    value: results.base || results.baseVolume, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Price-Adjusted Base', 
    value: results.priceAdjustedBase || results.markedUpVolume, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Card Processed Total', 
    value: results.processed || results.adjustedVolume, 
    format: 'money' 
  });
  
  // Processing on Cards section
  rows.push({ 
    label: 'Processor Charge on Cards', 
    value: results.procCharge || results.processingFees, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Markup Collected — Cards', 
    value: results.markupCollected, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost After Price Differential', 
    value: results.netChangeCards || results.residualAfterMarkup || results.newCost, 
    format: 'money' 
  });
  
  const coveragePct = results.coveragePct || 
    (results.processingFees > 0 ? (results.markupCollected / results.processingFees) : 0);
  rows.push({ 
    label: 'Coverage %', 
    value: coveragePct, 
    format: 'percent' 
  });
  
  // Savings vs Today section
  rows.push({ 
    label: 'Current Processing Cost (Today)', 
    value: results.currentCost, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost Savings (Cards Only)', 
    value: results.savingsCardsOnly || results.monthlySavings, 
    format: 'money' 
  });
  
  const procSavingsPct = results.procSavingsPct || results.processingCostSavingsPct ||
    (results.currentCost > 0 ? (results.monthlySavings / results.currentCost) : 0);
  rows.push({ 
    label: 'Processing Cost Savings %', 
    value: procSavingsPct, 
    format: 'percent' 
  });
  
  rows.push({ 
    label: 'Total Net Gain (Monthly)', 
    value: results.netMonthly || results.monthlySavings, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Annual Net Gain', 
    value: results.netAnnual || results.annualSavings, 
    format: 'money' 
  });
  
  return rows;
}

// Build Live Volume Breakdown rows for Supplemental Fee
function buildSupplementalFeeBreakdownRows(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const rows = [];
  
  // Derived Bases & Totals section
  rows.push({ 
    label: 'Base Card Volume (pre-tax, pre-tip)', 
    value: results.base || results.baseVolume, 
    format: 'money' 
  });
  
  if (results.feeBaseCards !== undefined) {
    rows.push({ 
      label: 'Fee-Eligible Volume (Cards)', 
      value: results.feeBaseCards, 
      format: 'money' 
    });
  }
  
  if (results.tipBase !== undefined) {
    rows.push({ 
      label: 'Tip-Eligible Volume (Cards)', 
      value: results.tipBase, 
      format: 'money' 
    });
  }
  
  if (results.cardFeeCollected !== undefined || results.feeCollectedOnCards !== undefined) {
    rows.push({ 
      label: 'Supplemental Fee — Cards', 
      value: results.cardFeeCollected || results.feeCollectedOnCards || 0, 
      format: 'money' 
    });
  }
  
  if (inputs.monthlyCashVolume > 0 && (results.cashFeeCollected !== undefined || results.feeCollectedOnCash !== undefined)) {
    rows.push({ 
      label: 'Supplemental Fee — Cash', 
      value: results.cashFeeCollected || results.feeCollectedOnCash || results.supplementalFeeCash || 0, 
      format: 'money' 
    });
  }
  
  if (results.tipAmount !== undefined) {
    rows.push({ 
      label: 'Tip Amount', 
      value: results.tipAmount, 
      format: 'money' 
    });
  }
  
  // Processing on Cards section
  rows.push({ 
    label: 'Card Processed Total', 
    value: results.processed || results.cardProcessedTotal || results.adjustedVolume, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processor Charge on Cards', 
    value: results.procCharge || results.processorChargeOnCards || results.processingFees, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost After Fee', 
    value: results.netChangeCards || results.netCostForProcessingCards || results.newCost, 
    format: 'money' 
  });
  
  if (results.recovery !== undefined) {
    rows.push({ 
      label: 'Coverage Gap (info only)', 
      value: results.recovery, 
      format: 'money' 
    });
  }
  
  const coveragePct = results.coveragePct || 
    (results.processingFees > 0 ? 
      ((results.cardFeeCollected || results.feeCollectedOnCards || 0) / results.processingFees) : 0);
  rows.push({ 
    label: 'Coverage %', 
    value: coveragePct, 
    format: 'percent' 
  });
  
  // Savings vs Today section
  rows.push({ 
    label: 'Current Processing Cost (Today)', 
    value: results.currentCost, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost Savings (Cards Only)', 
    value: results.savingsCardsOnly || results.processingCostSavingsOnly || results.monthlySavings, 
    format: 'money' 
  });
  
  const procSavingsPct = results.procSavingsPct || results.processingCostSavingsPct ||
    (results.currentCost > 0 ? 
      ((results.savingsCardsOnly || results.monthlySavings) / results.currentCost) : 0);
  rows.push({ 
    label: 'Processing Cost Savings %', 
    value: procSavingsPct, 
    format: 'percent' 
  });
  
  rows.push({ 
    label: 'Total Net Gain (Monthly)', 
    value: results.netMonthly || results.totalNetGainRevenue || results.monthlySavings, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Annual Net Gain', 
    value: results.netAnnual || results.annualNetGainRevenue || results.annualSavings, 
    format: 'money' 
  });
  
  return rows;
}

// Build Monthly Savings items
function buildMonthlySavingsItems(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const items = [];
  
  // Current Cost
  items.push({
    label: 'Current Cost',
    value: results.currentCost,
    format: 'money'
  });
  
  // New Cost (Processing Cost After Differential/Fee)
  const newCostLabel = inputs.programType === 'DUAL_PRICING' ? 
    'New Cost' : 'Processing Cost After Fee';
  const newCostValue = results.netChangeCards || results.newCost || 0;
  items.push({
    label: newCostLabel,
    value: newCostValue,
    format: 'money'
  });
  
  // Monthly Savings
  items.push({
    label: 'Monthly Savings',
    value: results.monthlySavings,
    format: 'money'
  });
  
  // Annual Savings
  items.push({
    label: 'Annual Savings',
    value: results.annualSavings,
    format: 'money'
  });
  
  // Add cash fee revenue for Supplemental Fee
  if (inputs.programType === 'SUPPLEMENTAL_FEE' && inputs.monthlyCashVolume > 0) {
    const cashFee = results.cashFeeCollected || results.feeCollectedOnCash || 
      results.supplementalFeeCash || 0;
    if (cashFee > 0) {
      items.push({
        label: 'Cash Fee Revenue',
        value: cashFee,
        format: 'money'
      });
    }
    
    // Total Net Gain (includes cash fee)
    const totalNetGain = results.netMonthly || results.totalNetGainRevenue || 
      (results.monthlySavings + cashFee);
    items.push({
      label: 'Total Net Gain',
      value: totalNetGain,
      format: 'money'
    });
  }
  
  return items;
}

// Helper type for savings items
type SavingsItem = { label: string; value: number; format?: 'money' | 'percent' | 'number' | 'text' };

// Build Monthly Savings rows for table rendering
function buildMonthlySavingsRows(items: SavingsItem[] | undefined): SavingsItem[] {
  if (!Array.isArray(items)) return [];
  // Normalize to rows with explicit format hints and ensure numeric values
  return items.map(it => {
    // Ensure value is numeric (coerce if needed)
    let numericValue = it.value;
    if (typeof numericValue === 'string') {
      // Strip currency symbols, commas, and percentage signs
      const cleaned = numericValue.replace(/[$,%\s]/g, '').replace(/,/g, '');
      numericValue = parseFloat(cleaned) || 0;
    } else if (typeof numericValue !== 'number') {
      numericValue = 0;
    }
    
    return {
      label: it.label,
      value: numericValue,
      // If an item already has format, keep it. Otherwise default money unless label implies percent
      format: it.format ?? (/percent|%/i.test(it.label) ? 'percent' : 'money')
    };
  });
}

/**
 * Main function to build the PDF UI model from calculator data
 */
export function buildPdfUiModel(
  inputs: CalculatorInputs,
  results: CalculatorResults,
  customerInfo: Partial<CustomerInfo>
): any {
  // Generate report metadata
  const reportId = generateReportId();
  const reportDate = formatDate();
  
  // Get order of operations text
  const orderOfOperationsText = getOrderOfOperationsText(inputs);
  
  // Build sections based on program type
  const liveVolumeTitle = inputs.programType === 'DUAL_PRICING' ? 
    'Live Volume Breakdown' : 'Live Calculations';
  
  const liveVolumeRows = inputs.programType === 'DUAL_PRICING' ?
    buildDualPricingBreakdownRows(inputs, results) :
    buildSupplementalFeeBreakdownRows(inputs, results);
  
  // Build monthly savings items first
  const monthlySavingsItems = buildMonthlySavingsItems(inputs, results);
  
  // Build the complete UI model
  const uiModel = {
    ui: {
      sections: {
        customerInformation: {
          title: 'Customer Information',
          rows: buildCustomerInfoRows(customerInfo)
        },
        inputParameters: {
          title: 'Input Parameters',
          rows: buildInputParamsRows(inputs)
        },
        liveVolumeBreakdown: {
          title: liveVolumeTitle,
          note: orderOfOperationsText,
          rows: liveVolumeRows
        },
        monthlyProcessingSavings: {
          title: 'Monthly Processing Savings',
          rows: buildMonthlySavingsRows(monthlySavingsItems)  // Add rows for table rendering
        }
      },
      monthlySavings: {
        items: monthlySavingsItems
      },
      report: {
        id: reportId,
        dateISO: reportDate
      },
      // Include order of operations text separately for flexibility
      orderOfOperationsText: orderOfOperationsText,
      // Include labels for PDF rendering
      labels: {
        customerInformation: 'Customer Information',
        inputParameters: 'Input Parameters',
        liveVolumeBreakdown: liveVolumeTitle,
        monthlyProcessingSavings: 'Monthly Processing Savings'
      }
    },
    // Include raw data for backward compatibility
    inputs: inputs,
    results: results,
    customerInfo: customerInfo,
    programType: inputs.programType
  };
  
  return uiModel;
}

/**
 * Helper function to merge calculator data with UI model for PDF generation
 */
export function preparePdfData(
  calculatorData: any,
  inputs: CalculatorInputs,
  results: CalculatorResults,
  customerInfo: Partial<CustomerInfo>
): any {
  // Build the UI model
  const uiModel = buildPdfUiModel(inputs, results, customerInfo);
  
  // Merge with existing calculator data (preserving backward compatibility)
  return {
    ...calculatorData,
    ...uiModel.ui.report, // Add report id and date at root level
    ui: uiModel.ui,
    // Ensure all required fields are present
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
    inputs: inputs,
    results: results
  };
}