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

// Map program type to user-friendly text
function getProgramTypeLabel(programType: string): string {
  switch (programType) {
    case 'DUAL_PRICING':
      return 'Dual Pricing';
    case 'CASH_DISCOUNTING':
      return 'Cash Discounting';
    case 'SUPPLEMENTAL_FEE':
      return 'Supplemental Fee';
    default:
      return programType;
  }
}

// Get order of operations text based on program type and settings
function getOrderOfOperationsText(inputs: CalculatorInputs): string {
  const isRetail = inputs.businessType === 'RETAIL';
  
  if (inputs.programType === 'DUAL_PRICING') {
    return isRetail ? 
      'Base Card Volume → +Price Differential → +Tax' :
      'Base Card Volume → +Price Differential → +Tax → +Tip';
  }
  
  if (inputs.programType === 'CASH_DISCOUNTING') {
    return isRetail ?
      'Base Volume → +Menu Markup → Cash: -Cash Discount | Cards: +Tax' :
      'Base Volume → +Menu Markup → Cash: -Cash Discount | Cards: +Tax → +Tip';
  }
  
  // Supplemental Fee order of operations
  const tipTiming = inputs.tipTiming || 
    (inputs.feeTiming === 'FEE_BEFORE_TIP' ? 'BEFORE_TIP' : 'AFTER_TIP');
  const feeTaxBasis = inputs.feeTaxBasis || 'PRE_TAX';
  
  const comboKey = `${tipTiming}__${feeTaxBasis}`;
  
  // For Retail businesses, remove tip from the order of operations
  if (isRetail) {
    const orderOfOperationsMap: Record<string, string> = {
      'BEFORE_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Supplemental Fee',
      'BEFORE_TIP__PRE_TAX': 'Pre-Tax Base → +Supplemental Fee → +Tax',
      'AFTER_TIP__POST_TAX': 'Pre-Tax Base → +Tax → +Supplemental Fee',
      'AFTER_TIP__PRE_TAX': 'Pre-Tax Base → +Fee → +Tax'
    };
    return orderOfOperationsMap[comboKey] || 'Standard order of operations';
  }
  
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
      'Dual Pricing' : 
      inputs.programType === 'CASH_DISCOUNTING' ? 
      'Cash Discounting' : 
      'Supplemental Fee', 
    format: 'text' 
  });
  
  // Monthly volumes
  rows.push({ 
    label: 'Monthly Card Volume (Gross)', 
    value: inputs.monthlyVolume, 
    format: 'money' 
  });
  
  // For Cash Discounting, always show cash volume field
  if (inputs.programType === 'CASH_DISCOUNTING' || inputs.monthlyCashVolume > 0) {
    rows.push({ 
      label: 'Monthly Cash Volume', 
      value: inputs.monthlyCashVolume || 0, 
      format: 'money' 
    });
  }
  
  // Rates
  rows.push({ 
    label: 'Current Processing Rate', 
    value: inputs.currentRate / 100, 
    format: 'percent' 
  });
  
  // For Cash Discounting, always show interchange cost
  if (inputs.programType === 'CASH_DISCOUNTING' || inputs.interchangeCost > 0) {
    rows.push({ 
      label: 'Interchange Cost', 
      value: inputs.interchangeCost / 100, 
      format: 'percent' 
    });
  }
  
  // Flat Rate % - use flatRatePct if available, otherwise flatRate
  // Always pass as decimal (divide by 100) so PDF generator converts properly
  const flatRateValue = inputs.flatRatePct !== undefined ? inputs.flatRatePct : inputs.flatRate;
  rows.push({ 
    label: 'Flat Rate %', 
    value: flatRateValue / 100,  // Pass as decimal for consistent PDF formatting
    format: 'percent' 
  });
  
  // Tax and tip - For Cash Discounting, always show these fields
  if (inputs.programType === 'CASH_DISCOUNTING' || inputs.taxRate > 0) {
    rows.push({ 
      label: 'Tax Rate', 
      value: inputs.taxRate / 100, 
      format: 'percent' 
    });
  }
  
  if (inputs.programType === 'CASH_DISCOUNTING' || inputs.tipRate > 0) {
    rows.push({ 
      label: 'Tip Rate', 
      value: inputs.tipRate / 100, 
      format: 'percent' 
    });
  }
  
  // Price differential / Supplemental fee
  const differentialLabel = inputs.programType === 'DUAL_PRICING' ? 
    'Price Differential' : 
    inputs.programType === 'CASH_DISCOUNTING' ? 
    'Menu Markup %' : 
    'Supplemental Fee %';
  rows.push({ 
    label: differentialLabel, 
    value: inputs.priceDifferential / 100, 
    format: 'percent' 
  });
  
  // Cash Discounting specific settings
  if (inputs.programType === 'CASH_DISCOUNTING' && inputs.cashDiscount !== undefined) {
    rows.push({ 
      label: 'Cash Discount %', 
      value: inputs.cashDiscount / 100, 
      format: 'percent' 
    });
  }
  
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

// Build Live Volume Breakdown rows for Dual Pricing matching the app's 3 sections
function buildDualPricingBreakdownRows(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const rows = [];
  
  // Section 1: Derived Bases & Totals
  rows.push({ 
    label: '### Derived Bases & Totals', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Base Card Volume (pre-tax, pre-tip)', 
    value: results.base || results.baseVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Base Card Volume + Price Differential', 
    value: results.priceAdjustedBase || results.markedUpVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Card Processed Total (incl. price differential, tax, and tip)', 
    value: results.processed || results.adjustedVolume || 0, 
    format: 'money' 
  });
  
  // Section 2: Processing on Cards (New Program)
  rows.push({ 
    label: '### Processing on Cards (New Program)', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Card Processed Total (incl. price differential, tax, and tip)', 
    value: results.processed || results.adjustedVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Flat Rate %', 
    value: results.derivedFlatRate || 0, 
    format: 'percent' 
  });
  
  rows.push({ 
    label: 'Processor Charge on Cards', 
    value: results.procCharge || results.processingFees || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Card Price Increase Collected (Cards)', 
    value: results.markupCollected || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost after Price Differential', 
    value: results.recovery || results.netChangeCards || results.residualAfterMarkup || results.newCost || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Coverage %', 
    value: results.coveragePct || 0, 
    format: 'percent' 
  });
  
  // Section 3: Savings vs Today
  rows.push({ 
    label: '### Savings vs Today', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Current Processing Cost (Today)', 
    value: results.currentCost || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost After Price Differential', 
    value: results.netChangeCards || results.recovery || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost Savings (Cards Only)', 
    value: results.savingsCardsOnly || results.monthlySavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Total Net Gain (Monthly)', 
    value: results.netMonthly || results.monthlySavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Annual Net Gain', 
    value: results.netAnnual || results.annualSavings || 0, 
    format: 'money' 
  });
  
  return rows;
}

// Build Live Volume Breakdown rows for Cash Discounting matching the app's 4 panels
function buildCashDiscountingBreakdownRows(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const rows = [];
  
  // Panel 1: Derived Bases & Totals
  rows.push({ 
    label: '### Derived Bases & Totals', 
    value: '', 
    format: 'section' 
  });
  
  // Cards Section
  rows.push({ 
    label: 'Cards:', 
    value: '', 
    format: 'subsection' 
  });
  
  rows.push({ 
    label: 'Base Card Volume (pre-tax, pre-tip)', 
    value: results.base || results.baseVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Base Card Volume + Menu Markup', 
    value: results.priceAdjustedBase || results.markedUpVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Card Processed Total (incl. markup, tax, and tip)', 
    value: results.processed || results.adjustedVolume || 0, 
    format: 'money' 
  });
  
  // Cash Section - always show for Cash Discounting even if cash volume is 0
  rows.push({ 
    label: 'Cash:', 
    value: '', 
    format: 'subsection' 
  });
  
  rows.push({ 
    label: 'Base Cash Volume (pre-tax, pre-tip)', 
    value: results.baseCashVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Base Cash Volume + Menu Markup', 
    value: results.menuPricedCashBase || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Cash Discount Applied', 
    value: results.cashDiscountGiven || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Net Cash Base (after discount)', 
    value: results.netCashBase || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Cash Processed Total (incl. net markup, tax, and tip)', 
    value: results.cashProcessedTotal || 0, 
    format: 'money' 
  });
  
  // Panel 2: Processing on Cards (New Program)
  rows.push({ 
    label: '### Processing on Cards (New Program)', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Card Processed Total (incl. menu markup, tax, and tip)', 
    value: results.processed || results.adjustedVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Flat Rate %', 
    value: results.derivedFlatRate || 0, 
    format: 'percent' 
  });
  
  rows.push({ 
    label: 'Processor Charge on Cards', 
    value: results.procCharge || results.processingFees || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Card Menu Markup Collected (Cards)', 
    value: results.markupCollected || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost after Menu Markup', 
    value: results.recovery || results.netChangeCards || results.residualAfterMarkup || results.newCost || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Coverage %', 
    value: results.coveragePct || 0, 
    format: 'percent' 
  });
  
  // Panel 3: Cash Revenue (New Program) - always show for Cash Discounting
  rows.push({ 
    label: '### Cash Revenue (New Program)', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Base Cash Volume (pre-tax, pre-tip)', 
    value: results.baseCashVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Menu Markup on Cash', 
    value: (results.menuPricedCashBase || 0) - (results.baseCashVolume || 0), 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Less: Cash Discount Given', 
    value: results.cashDiscountGiven || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Net Revenue from Cash', 
    value: results.extraCashRevenue || 0, 
    format: 'money' 
  });
  
  // Panel 4: Net Savings & Revenue
  rows.push({ 
    label: '### Net Savings & Revenue', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Current Processing Cost (Today)', 
    value: results.currentCost || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost After Menu Markup', 
    value: Math.abs(results.netChangeCards || 0), 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost Savings (Cards Only)', 
    value: results.savingsCardsOnly || results.monthlySavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Revenue from Cash Differential', 
    value: results.extraCashRevenue || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Total Net Gain (Monthly)', 
    value: results.netMonthly || results.monthlySavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Annual Net Gain', 
    value: results.netAnnual || results.annualSavings || 0, 
    format: 'money' 
  });
  
  return rows;
}

// Build Live Volume Breakdown rows for Supplemental Fee matching the app's 3 sections
function buildSupplementalFeeBreakdownRows(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const rows = [];
  
  // Section 1: Derived Bases & Totals (matching app exactly)
  rows.push({ 
    label: '### Derived Bases & Totals', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Base Card Volume (pre-tax, pre-tip)', 
    value: results.baseVolumePreTaxPreTip || results.base || results.baseVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Fee-Eligible Volume (Cards)', 
    value: results.feeBaseCards || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Supplemental Fee Collected — Cards', 
    value: results.cardFeeCollected || results.feeCollectedOnCards || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Tip-Eligible Volume (Cards)', 
    value: results.tipBase || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Tip Amount', 
    value: results.tipAmount || 0, 
    format: 'money' 
  });
  
  // Section 2: Processing on Cards (New Program)
  rows.push({ 
    label: '### Processing on Cards (New Program)', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Card Processed Total (after fee, tip, & tax)', 
    value: results.cardProcessedTotal || results.processed || results.adjustedVolume || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Flat Rate %', 
    value: results.derivedFlatRate || 0, 
    format: 'percent' 
  });
  
  rows.push({ 
    label: 'Processor Charge', 
    value: results.processorChargeOnCards || results.processingFees || results.procCharge || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Supplemental Fee Collected — Cards', 
    value: results.cardFeeCollected || results.feeCollectedOnCards || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost after Price Differential', 
    value: results.recovery || results.netChangeCards || results.netCostForProcessingCards || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Coverage %', 
    value: results.coveragePct || 0, 
    format: 'percent' 
  });
  
  // Section 3: Savings vs Today
  rows.push({ 
    label: '### Savings vs Today', 
    value: '', 
    format: 'section' 
  });
  
  rows.push({ 
    label: 'Current Processing Cost (Today)', 
    value: results.currentCost || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost after Price Differential', 
    value: results.netChangeCards || results.recovery || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Processing Cost Savings (Cards Only)', 
    value: results.savingsCardsOnly || results.processingSavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Supplemental Fee Collected — Cash', 
    value: results.supplementalFeeCash || results.cashFeeCollected || results.feeCollectedOnCash || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Net Monthly', 
    value: results.totalNetGainRevenue || results.netMonthly || results.monthlySavings || 0, 
    format: 'money' 
  });
  
  rows.push({ 
    label: 'Net Annual', 
    value: results.annualNetGainRevenue || results.netAnnual || results.annualSavings || 0, 
    format: 'money' 
  });
  
  return rows;
}

// Build Sales Impact section for hero display
function buildSalesImpactSection(inputs: CalculatorInputs, results: CalculatorResults): any {
  // Calculate the main hero number based on program type (matching ProcessingSavings.tsx logic)
  let monthlySavings = 0;
  if (inputs.programType === 'SUPPLEMENTAL_FEE') {
    monthlySavings = results.totalNetGainRevenue || 0;
  } else if (inputs.programType === 'CASH_DISCOUNTING') {
    // For Cash Discounting, include extra cash revenue
    monthlySavings = (results.savingsCardsOnly || 0) + (results.extraCashRevenue || 0);
  } else {
    // Dual Pricing
    monthlySavings = results.netMonthly || results.monthlySavings || 0;
  }
  
  const annualSavings = monthlySavings * 12;
  
  // For savings percent, include total savings (matching ProcessingSavings.tsx logic)
  let coveragePct = 0;
  if (results.currentCost > 0) {
    if (inputs.programType === 'CASH_DISCOUNTING') {
      // Include both card savings and cash revenue
      const totalSavings = (results.savingsCardsOnly || 0) + (results.extraCashRevenue || 0);
      coveragePct = (totalSavings / results.currentCost);
    } else if (inputs.programType === 'SUPPLEMENTAL_FEE') {
      // Use total net gain revenue
      coveragePct = (results.totalNetGainRevenue || 0) / results.currentCost;
    } else {
      // Dual Pricing
      coveragePct = monthlySavings / results.currentCost;
    }
  }
  
  // Generate professional context based on savings amount (matching UI logic)
  const roundedAmount = Math.floor(annualSavings / 5000) * 5000;
  let businessContext = '';
  
  // Professional, conservative messaging for banking-grade report
  if (annualSavings >= 50000) {
    businessContext = "Annual operational cost reduction";
  } else if (annualSavings >= 30000) {
    businessContext = "Significant annual savings achieved";
  } else if (annualSavings >= 20000) {
    businessContext = "Substantial cost optimization";
  } else if (annualSavings >= 10000) {
    businessContext = "Material expense reduction";
  } else if (annualSavings >= 5000) {
    businessContext = "Meaningful cost savings";
  } else if (annualSavings >= 2000) {
    businessContext = "Notable expense reduction";
  } else if (annualSavings >= 1000) {
    businessContext = "Positive impact on margins";
  } else {
    businessContext = "Incremental cost improvement";
  }
  
  // Add quarterly savings calculation
  const quarterlySavings = monthlySavings * 3;
  
  return {
    title: 'Your Monthly Impact',
    heroNumber: monthlySavings,
    businessContext: businessContext,
    annualImpact: annualSavings,
    quarterlySavings: quarterlySavings,
    costReduction: coveragePct,
    programType: getProgramTypeLabel(inputs.programType),
    isRestaurant: inputs.businessType === 'RESTAURANT',
    isRetail: inputs.businessType === 'RETAIL',
    businessType: inputs.businessType || 'RETAIL',
    highlights: {
      monthly: {
        label: 'MONTHLY SAVINGS',
        value: monthlySavings,
        format: 'money',
        emphasis: 'hero'
      },
      annual: {
        label: 'ANNUAL IMPACT',
        value: annualSavings,
        format: 'money',
        emphasis: 'strong'
      },
      quarterly: {
        label: 'QUARTERLY IMPACT',
        value: quarterlySavings,
        format: 'money',
        emphasis: 'metric'
      },
      coverage: {
        label: 'COST REDUCTION',
        value: coveragePct,
        format: 'percent',
        emphasis: 'metric'
      }
    }
  };
}

// Build Monthly Savings items
function buildMonthlySavingsItems(inputs: CalculatorInputs, results: CalculatorResults): any[] {
  const items = [];
  
  if (inputs.programType === 'SUPPLEMENTAL_FEE') {
    // Match the UI's Savings Summary exactly for Supplemental Fee
    
    // 1. Current Processing Cost (Today)
    items.push({
      label: 'Current Processing Cost (Today)',
      value: results.currentCost || 0,
      format: 'money'
    });
    
    // 2. Processor Charge on Cards
    items.push({
      label: 'Processor Charge on Cards',
      value: results.processorChargeOnCards || results.processingFees || 0,
      format: 'money'
    });
    
    // 3. Supplemental Fee Collected — Cards
    items.push({
      label: 'Supplemental Fee Collected — Cards',
      value: results.cardFeeCollected || results.feeCollectedOnCards || 0,
      format: 'money'
    });
    
    // 4. Processing Cost after Price Differential
    items.push({
      label: 'Processing Cost after Price Differential',
      value: results.recovery || results.newCost || 0,
      format: 'money'
    });
    
    // 5. Processing Cost Savings (Cards Only)
    items.push({
      label: 'Processing Cost Savings (Cards Only)',
      value: results.savingsCardsOnly || results.processingSavings || 0,
      format: 'money'
    });
    
    // 6. Processing Cost Savings %
    items.push({
      label: 'Processing Cost Savings %',
      value: results.procSavingsPct || results.processingCostSavingsPct || 0,
      format: 'percent'
    });
    
    // 7. Total Net Gain (Monthly)
    items.push({
      label: 'Total Net Gain (Monthly)',
      value: results.totalNetGainRevenue || results.monthlySavings || 0,
      format: 'money',
      highlight: true
    });
    
    // 8. Annual Net Gain
    items.push({
      label: 'Annual Net Gain',
      value: results.annualNetGainRevenue || results.annualSavings || 0,
      format: 'money',
      highlight: true
    });
  } else if (inputs.programType === 'CASH_DISCOUNTING') {
    // Match the UI's Savings Summary exactly for Cash Discounting
    
    // 1. Current Processing Cost (Today)
    items.push({
      label: 'Current Processing Cost (Today)',
      value: results.currentCost || 0,
      format: 'money'
    });
    
    // 2. Processor Charge on Cards
    items.push({
      label: 'Processor Charge on Cards',
      value: results.procCharge || 0,
      format: 'money'
    });
    
    // 3. Card Menu Markup Collected
    items.push({
      label: 'Card Menu Markup Collected',
      value: results.markupCollected || 0,
      format: 'money'
    });
    
    // 4. Revenue from Cash Differential
    items.push({
      label: 'Revenue from Cash Differential',
      value: results.extraCashRevenue || 0,
      format: 'money'
    });
    
    // 5. Processing Cost after Menu Markup
    items.push({
      label: 'Processing Cost after Menu Markup',
      value: results.recovery || 0,
      format: 'money'
    });
    
    // 6. Processing Cost Savings (Cards Only)
    items.push({
      label: 'Processing Cost Savings (Cards Only)',
      value: results.savingsCardsOnly || 0,
      format: 'money'
    });
    
    // 7. Total Net Gain (Monthly)
    items.push({
      label: 'Total Net Gain (Monthly)',
      value: results.netMonthly || 0,
      format: 'money',
      highlight: true
    });
    
    // 8. Annual Net Gain
    items.push({
      label: 'Annual Net Gain',
      value: results.netAnnual || 0,
      format: 'money',
      highlight: true
    });
  } else {
    // Dual Pricing mode - Match the UI's 8-item layout
    
    // 1. Current Processing Cost (Today)
    items.push({
      label: 'Current Processing Cost (Today)',
      value: results.currentCost || 0,
      format: 'money'
    });
    
    // 2. Processor Charge on Cards
    items.push({
      label: 'Processor Charge on Cards',
      value: results.procCharge || 0,
      format: 'money'
    });
    
    // 3. Card Price Increase Collected (Cards)
    items.push({
      label: 'Card Price Increase Collected (Cards)',
      value: results.markupCollected || 0,
      format: 'money'
    });
    
    // 4. Processing Cost after Price Differential
    items.push({
      label: 'Processing Cost after Price Differential',
      value: results.recovery || 0,
      format: 'money'
    });
    
    // 5. Processing Cost Savings (Cards Only)
    items.push({
      label: 'Processing Cost Savings (Cards Only)',
      value: results.savingsCardsOnly || 0,
      format: 'money'
    });
    
    // 6. Processing Cost Savings %
    items.push({
      label: 'Processing Cost Savings %',
      value: results.procSavingsPct || 0,
      format: 'percent'
    });
    
    // 7. Total Net Gain (Monthly)
    items.push({
      label: 'Total Net Gain (Monthly)',
      value: results.netMonthly || results.monthlySavings || 0,
      format: 'money',
      highlight: true
    });
    
    // 8. Annual Net Gain
    items.push({
      label: 'Annual Net Gain',
      value: results.netAnnual || results.annualSavings || 0,
      format: 'money',
      highlight: true
    });
  }
  
  return items;
}

// Helper type for savings items
type SavingsItem = { label: string; value: number | string; format?: 'money' | 'percent' | 'number' | 'text' };

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
  const liveVolumeTitle = inputs.programType === 'DUAL_PRICING' || inputs.programType === 'CASH_DISCOUNTING' ? 
    'Live Volume Breakdown' : 'Live Calculations';
  
  let liveVolumeRows: any[];
  if (inputs.programType === 'DUAL_PRICING') {
    liveVolumeRows = buildDualPricingBreakdownRows(inputs, results);
  } else if (inputs.programType === 'CASH_DISCOUNTING') {
    liveVolumeRows = buildCashDiscountingBreakdownRows(inputs, results);
  } else {
    liveVolumeRows = buildSupplementalFeeBreakdownRows(inputs, results);
  }
  
  // Build sales impact section first (hero display)
  const salesImpact = buildSalesImpactSection(inputs, results);
  
  // Build monthly savings items for technical breakdown
  const monthlySavingsItems = buildMonthlySavingsItems(inputs, results);
  
  // Build the complete UI model
  const uiModel = {
    ui: {
      sections: {
        salesImpact: salesImpact,  // Hero section at the top
        customerInformation: {
          title: 'Customer Information',
          rows: buildCustomerInfoRows(customerInfo)
        },
        inputParameters: {
          title: 'Input Parameters',
          rows: buildInputParamsRows(inputs)
        },
        liveVolumeBreakdown: {
          title: 'Technical Calculation Details',
          subtitle: liveVolumeTitle,
          note: orderOfOperationsText,
          rows: liveVolumeRows
        },
        monthlyProcessingSavings: {
          title: 'Processing Cost Breakdown',
          subtitle: inputs.programType === 'SUPPLEMENTAL_FEE' ? 'Savings Summary' : 'Monthly Processing Savings',
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
        salesImpact: 'Your Monthly Impact',
        customerInformation: 'Customer Information',
        inputParameters: 'Input Parameters',
        liveVolumeBreakdown: 'Technical Calculation Details',
        monthlyProcessingSavings: 'Processing Cost Breakdown'
      }
    },
    // Include raw data for backward compatibility
    inputs: inputs,
    results: results,
    customerInfo: customerInfo,
    programType: getProgramTypeLabel(inputs.programType)
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
  console.log('🔍 [PDF-TRANSFORM] Starting preparePdfData');
  console.log('🔍 [PDF-TRANSFORM] Raw inputs.programType:', inputs.programType);
  
  // Build the UI model
  const uiModel = buildPdfUiModel(inputs, results, customerInfo);
  
  console.log('🔍 [PDF-TRANSFORM] uiModel.ui.sections.salesImpact.programType:', uiModel.ui.sections.salesImpact.programType);
  
  // Create metrics object from salesImpact for executive summary
  const metrics = {
    monthlySavings: uiModel.ui.sections.salesImpact.heroNumber || 0,
    annualSavings: uiModel.ui.sections.salesImpact.annualImpact || 0,
    quarterlySavings: uiModel.ui.sections.salesImpact.quarterlySavings || 0,
    costReductionPct: uiModel.ui.sections.salesImpact.costReduction || 0,
    currentCost: results.currentCost || 0,
    newProgramNetCost: results.processorChargeCards - (results.markupCollectedCards || results.markupCardsDual || 0),
    programType: uiModel.ui.sections.salesImpact.programType || getProgramTypeLabel(inputs.programType),
    isRestaurant: uiModel.ui.sections.salesImpact.isRestaurant || false,
    isRetail: uiModel.ui.sections.salesImpact.isRetail || false
  };
  
  console.log('🔍 [PDF-TRANSFORM] metrics.programType:', metrics.programType);
  
  const transformedProgramType = getProgramTypeLabel(inputs.programType);
  console.log('🔍 [PDF-TRANSFORM] getProgramTypeLabel result:', transformedProgramType);
  
  // Merge with existing calculator data (preserving backward compatibility)
  const finalData = {
    ...calculatorData,
    ...uiModel.ui.report, // Add report id and date at root level
    ui: uiModel.ui,
    metrics: metrics,  // Add metrics for executive summary
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
    programType: getProgramTypeLabel(inputs.programType),
    inputs: inputs,
    results: results
  };
  
  console.log('🔍 [PDF-TRANSFORM] finalData.programType:', finalData.programType);
  console.log('🔍 [PDF-TRANSFORM] finalData.metrics.programType:', finalData.metrics.programType);
  console.log('🔍 [PDF-TRANSFORM] Complete finalData:', JSON.stringify({
    programType: finalData.programType,
    'metrics.programType': finalData.metrics?.programType,
    'ui.sections.salesImpact.programType': finalData.ui?.sections?.salesImpact?.programType
  }, null, 2));
  
  return finalData;
}