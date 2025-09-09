import { LOGO_DATA_URL } from './logo-loader.js';

/**
 * v1.4.0 PDF Mirror UI Generation
 * Source of Truth: ui_and_results, no new math calculations
 * Mirror ProcessingSavings (page 1) and DualPricingBreakdown (page 2) exactly
 */
export function generateBrandedPDF(data: any): string {
  const {
    programType,
    inputs = {},
    results = {},
    businessName = '',
    streetAddress = '',
    city = '',
    state = '',
    zipCode = '',
    contactName = '',
    contactEmail = '',
    salesRepName = ''
  } = data;

  // Helper for program type detection
  const isSF = programType === 'SUPPLEMENTAL_FEE';

  // Generate report number and date
  const reportNumber = Date.now().toString().slice(-8);
  const currentDate = new Date().toLocaleDateString();
  
  // Format complete business address
  const businessAddress = [streetAddress, city, state, zipCode].filter(Boolean).join(', ');

  // Format all numeric values with proper currency/percentage formatting
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (rate: number) => `${(rate * 100).toFixed(2)}%`;

  // v1.4.0: Helper functions to mirror UI components exactly
  const renderMonthlySavingsSummary = () => {
    if (isSF) {
      // Mirror ProcessingSavings.tsx - Supplemental Fee "Savings Summary"
      return `
        <div class="section avoid-break">
          <div class="section-hd">
            <div class="section-title">${isSF ? 'Supplemental Fee — Summary' : 'Dual Pricing / Cash Discounting — Summary'}</div>
          </div>
          <div class="section-bd">
            ${results.comboKey ? `
            <div style="margin-bottom: 12px; padding: 8px; background: var(--bg-soft); border-radius: 4px;">
              <div style="font-size: 12px; color: var(--muted); margin-bottom: 4px;">Order of Operations:</div>
              <div style="font-size: 13px; font-weight: 600; color: var(--ink-800);">${results.orderOfOperations || ''}</div>
            </div>
            ` : ''}
            <table class="kv">
              <tr><th>Current Processing Cost (Today)</th><td class="metric metric--negative">${formatCurrency(results.currentCost || 0)}</td></tr>
              <tr><th>Processor Charge on Cards</th><td class="metric metric--negative">${formatCurrency(results.processorChargeOnCards || 0)}</td></tr>
              <tr><th>Supplemental Fee Collected — Cards</th><td class="metric metric--positive">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
              <tr><th>Card Under/Over-Recovery (Fee − Processor)</th><td class="metric ${(results.recovery || 0) >= 0 ? 'metric--positive' : 'metric--negative'}">${formatCurrency(results.recovery || 0)}</td></tr>
              <tr><th>Processing Cost Savings (Cards Only)</th><td class="metric metric--positive">${formatCurrency(results.savingsCardsOnly || 0)}</td></tr>
              <tr><th>Processing Cost Savings %</th><td class="metric">${((results.procSavingsPct || 0) * 100).toFixed(2)}%</td></tr>
              <tr style="background: var(--bg-soft); border-top: 2px solid var(--brand-spruce);"><th style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">Total Net Gain (Monthly)</th><td class="metric metric-lg" style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">${formatCurrency(results.totalNetGainRevenue || 0)}</td></tr>
              <tr><th style="font-size: 14px; color: var(--muted);">Annual Net Gain</th><td class="metric" style="font-size: 16px; color: var(--brand-spruce);">${formatCurrency(results.annualNetGainRevenue || 0)}</td></tr>
            </table>
          </div>
        </div>`;
    } else {
      // Mirror ProcessingSavings.tsx - Dual Pricing "Monthly Processing Savings"
      return `
        <div class="section avoid-break">
          <div class="section-hd">
            <div class="section-title">Dual Pricing / Cash Discounting — Summary</div>
          </div>
          <div class="section-bd">
            <table class="kv">
              <tr><th>Current Processing Cost</th><td class="metric metric--negative">${formatCurrency(results.currentCost || 0)}</td></tr>
              ${(results.residualAfterMarkup || 0) > 0 ? 
                `<tr><th>Residual cost after markup</th><td class="metric metric--negative">${formatCurrency(results.residualAfterMarkup || 0)}</td></tr>` :
                (results.overageRetained || 0) > 0 ?
                `<tr><th>Overage retained after markup</th><td class="metric metric--positive">${formatCurrency(results.overageRetained || 0)}</td></tr>` :
                `<tr><th>Residual cost after markup</th><td class="metric">${formatCurrency(0)}</td></tr>`
              }
              <tr style="background: var(--bg-soft); border-top: 2px solid var(--brand-spruce);"><th style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">Monthly Savings</th><td class="metric metric-lg" style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">${formatCurrency(results.monthlySavings || 0)}</td></tr>
              <tr><th style="font-size: 14px; color: var(--muted);">Annual Savings</th><td class="metric" style="font-size: 16px; color: var(--brand-spruce);">${formatCurrency(results.annualSavings || 0)}</td></tr>
            </table>
          </div>
        </div>`;
    }
  };

  const renderInputParameters = () => {
    // Mirror UI input display exactly 
    return `
      <div class="section avoid-break">
        <div class="section-hd">
          <div class="section-title">Input Parameters</div>
        </div>
        <div class="section-bd">
          <table class="kv">
            <tr><th>Program Type</th><td class="metric">${isSF ? 'Supplemental Fee' : 'Dual Pricing or Cash Discounting'}</td></tr>
            <tr><th>Monthly Credit Card Volume</th><td class="metric">${formatCurrency(inputs.monthlyVolume || 0)}</td></tr>
            <tr><th>Monthly Cash Volume</th><td class="metric">${formatCurrency(inputs.monthlyCashVolume || 0)}</td></tr>
            <tr><th>Current Processing Rate</th><td class="metric">${formatPercentage(inputs.currentRate || 0)}</td></tr>
            <tr><th>Tax Rate</th><td class="metric">${formatPercentage(inputs.taxRate || 0)}</td></tr>
            <tr><th>Tip Rate</th><td class="metric">${formatPercentage(inputs.tipRate || 0)}</td></tr>
            ${isSF ? `
              <tr><th>Supplemental Fee (%)</th><td class="metric">${formatPercentage(inputs.priceDifferential || 0)}</td></tr>
              <tr><th>Flat Rate % (Bank Mapping)</th><td class="metric">${formatPercentage(results.derivedFlatRate || 0)}${Math.abs((inputs.flatRatePct || 0) - ((results.derivedFlatRate || 0) * 100)) < 0.0001 ? ' (auto-set for 100% offset)' : ' (custom)'}</td></tr>
              <tr><th>Tip Timing</th><td class="metric">${inputs.tipTiming === 'AFTER_TIP' ? 'Tip at time of sale (fee after tip)' : 'Tip handwritten (fee before tip)'}</td></tr>
              <tr><th>Apply Fee To</th><td class="metric">${inputs.feeTaxBasis === 'PRE_TAX' ? 'Apply fee to pre-tax amount' : 'Apply fee to post-tax amount'}</td></tr>
            ` : `
              <tr><th>Interchange Cost</th><td class="metric">${formatPercentage(inputs.interchangeCost || 0)}</td></tr>
              <tr><th>Price Differential</th><td class="metric">${formatPercentage(inputs.priceDifferential || 0)}</td></tr>
              <tr><th>Flat Rate % (Bank Mapping)</th><td class="metric">${formatPercentage(results.derivedFlatRate || 0)}</td></tr>
            `}
          </table>
        </div>
      </div>`;
  };

  // Mirror DualPricingBreakdown.tsx sections
  const renderDerivedTotals = () => {
    if (!isSF) return ''; // Only for Supplemental Fee
    return `
      <div class="section avoid-break">
        <div class="section-hd">
          <div class="section-title">Derived Bases & Totals</div>
        </div>
        <div class="section-bd">
          <table class="kv">
            <tr><th>Base Card Volume (pre-tax, pre-tip)</th><td class="metric">${formatCurrency(results.baseVolumePreTaxPreTip || 0)}</td></tr>
            <tr><th>Fee-Eligible Volume (Cards)</th><td class="metric">${formatCurrency(results.feeBaseCards || 0)}</td></tr>
            <tr><th>Supplemental Fee Collected — Cards</th><td class="metric metric--positive">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
            <tr><th>Tip-Eligible Volume (Cards)</th><td class="metric">${formatCurrency(results.tipBase || 0)}</td></tr>
            <tr><th>Tip Amount</th><td class="metric">${formatCurrency(results.tipAmount || 0)}</td></tr>
          </table>
        </div>
      </div>`;
  };

  const renderProcessingOnCards = () => {
    return `
      <div class="section avoid-break">
        <div class="section-hd">
          <div class="section-title">Processing on Cards (New Program)</div>
        </div>
        <div class="section-bd">
          <table class="kv">
            ${isSF ? `
              <tr><th>Card Processed Total (incl. price differential, tax, and tip)</th><td class="metric">${formatCurrency(results.cardProcessedTotal || 0)}</td></tr>
              <tr><th>Flat Rate %</th><td class="metric">${formatPercentage(results.derivedFlatRate || 0)}</td></tr>
              <tr><th>Processor Charge</th><td class="metric metric--negative">${formatCurrency(results.processorChargeOnCards || 0)}</td></tr>
              <tr><th>Markup Collected — Cards</th><td class="metric metric--positive">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
              <tr><th>Under/Over-Recovery</th><td class="metric ${(results.recovery || 0) >= 0 ? 'metric--positive' : 'metric--negative'}">${formatCurrency(results.recovery || 0)}</td></tr>
              <tr><th>Coverage %</th><td class="metric">${((results.coveragePct || 0) * 100).toFixed(1)}%</td></tr>
            ` : `
              <tr><th>Card Processed Total (incl. price differential, tax, and tip)</th><td class="metric">${formatCurrency(results.adjustedCardVolume || 0)}</td></tr>
              <tr><th>Flat Rate %</th><td class="metric">${formatPercentage(results.derivedFlatRate || 0)}</td></tr>
              <tr><th>Processor Charge</th><td class="metric metric--negative">${formatCurrency(results.processingFees || 0)}</td></tr>
              <tr><th>Markup Collected — Cards (price differential)</th><td class="metric metric--positive">${formatCurrency(results.markupCollected || 0)}</td></tr>
              <tr><th>Under/Over-Recovery</th><td class="metric ${((results.markupCollected || 0) - (results.processingFees || 0)) >= 0 ? 'metric--positive' : 'metric--negative'}">${formatCurrency((results.markupCollected || 0) - (results.processingFees || 0))}</td></tr>
            `}
          </table>
        </div>
      </div>`;
  };

  const renderSavingsVsToday = () => {
    return `
      <div class="section avoid-break">
        <div class="section-hd">
          <div class="section-title">Savings vs Today</div>
        </div>
        <div class="section-bd">
          <table class="kv">
            <tr><th>Current Processing Cost (Today)</th><td class="metric metric--negative">${formatCurrency(results.currentCost || 0)}</td></tr>
            <tr><th>Processing Cost After Price Differential</th><td class="metric ${(results.netChangeCards || 0) <= 0 ? 'metric--positive' : 'metric--negative'}">${formatCurrency(results.netChangeCards || 0)}</td></tr>
            <tr><th>Processing Cost Savings (Cards Only)</th><td class="metric metric--positive">${formatCurrency(results.savingsCardsOnly || 0)}</td></tr>
            ${isSF ? `<tr><th>Supplemental Fee Collected — Cash</th><td class="metric metric--positive">${formatCurrency(results.supplementalFeeCash || 0)}</td></tr>` : ''}
            <tr style="background: var(--bg-soft);"><th style="font-weight: 700;">Net Monthly</th><td class="metric metric--positive" style="font-weight: 700;">${formatCurrency(isSF ? results.totalNetGainRevenue || 0 : results.monthlySavings || 0)}</td></tr>
            <tr><th>Net Annual</th><td class="metric metric--positive">${formatCurrency(isSF ? results.annualNetGainRevenue || 0 : results.annualSavings || 0)}</td></tr>
          </table>
        </div>
      </div>`;
  };

  const renderGrossProfit = () => {
    return `
      <div class="section avoid-break">
        <div class="section-hd">
          <div class="section-title">Gross Profit</div>
        </div>
        <div class="section-bd">
          <table class="kv">
            <tr><th>Gross Profit (Cards)</th><td class="metric metric--positive">${formatCurrency(results.grossProfit || 0)}</td></tr>
            <tr><th>Skytab Bonus (Gross)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusGross || 0)}</td></tr>
            <tr><th>Skytab Bonus (Rep 50%)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusRep || 0)}</td></tr>
          </table>
        </div>
      </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMP Savings Report</title>
    <style>
        :root {
            --brand-ultramarine: #004ED3;  /* Primary */
            --brand-aqua: #2BD8C2;         /* Accent */
            --brand-spruce: #00937B;       /* Positive emphasis */
            --brand-ink: #0B2340;          /* Header text */
            --ink-800: #1F2937;            /* Body text (neutral dark) */
            --muted: #6B7280;              /* Secondary text */
            --border: #E5E7EB;             /* Table borders */
            --bg-soft: #F9FAFB;            /* Section header background */
            --bg-hero: #0A3FB1;            /* Deeper ultramarine for hero */
        }

        html, body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            color: var(--ink-800);
            font-size: 12px;
            line-height: 1.5;
            background: white;
        }

        * {
            box-sizing: border-box;
        }

        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
            position: relative;
        }





        /* Header Styles */
        .header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .brand-cell {
            width: 160px;
            vertical-align: top;
        }

        .title {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-ink);
            margin-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
            color: var(--brand-ink);
            font-style: italic;
        }

        /* Section Styles */
        .section {
            background: white;
            border-radius: 8px;
            padding: 0;
            margin-bottom: 20px;
            border: 1px solid var(--border);
            box-shadow: 0 1px 3px rgba(0, 78, 211, 0.1);
        }

        .section-hd {
            margin: 0;
            padding: 12px 20px;
            background: var(--bg-soft);
            border-radius: 8px 8px 0 0;
            border-left: 3px solid var(--brand-ultramarine);
            border-bottom: 1px solid var(--border);
        }

        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--brand-ultramarine);
            margin: 0;
        }

        .section-bd {
            background: white;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            border: none;
        }



        /* Key-Value Table */
        .kv {
            width: 100%;
            border-collapse: collapse;
        }

        .kv th {
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            color: var(--muted);
            background: #fbfcfd;
            border-bottom: 1px solid #f1f3f4;
            width: 60%;
        }

        .kv td {
            padding: 10px 12px;
            font-weight: 600;
            color: var(--ink-800);
            border-bottom: 1px solid #f1f3f4;
        }

        .kv tr:nth-child(even) th {
            background: #f8f9fa;
        }

        .kv tr:nth-child(even) td {
            background: #f8f9fa;
        }

        .kv .metric {
            font-weight: 700;
            color: var(--brand-ultramarine);
        }

        .metric--positive {
            color: var(--brand-spruce) !important;
        }

        .metric-lg {
            font-size: 20px;
            font-weight: 700;
        }

        .metric-pos {
            color: var(--brand-spruce) !important;
        }

        /* Card Grid */
        .cards {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
        }

        .card {
            flex: 1;
            background: white;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card--accent {
            border-left: 4px solid var(--brand-aqua);
            background: linear-gradient(135deg, #f0fdfc 0%, #e6fffa 100%);
            box-shadow: 0 2px 8px rgba(43, 216, 194, 0.15);
        }

        .hdr {
            font-size: 12px;
            font-weight: 600;
            color: var(--muted);
            margin-bottom: 8px;
        }

        .metric {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-ultramarine);
            margin-top: 8px;
        }

        .metric-pos {
            color: var(--brand-spruce) !important;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid var(--border);
            font-size: 11px;
            color: var(--muted);
            display: table;
            width: 100%;
        }

        .footer-left {
            display: table-cell;
            white-space: nowrap;
            width: 70%;
        }

        .footer-right {
            display: table-cell;
            text-align: right;
            white-space: nowrap;
            width: 30%;
        }

        /* Page Break Controls */
        .break-before {
            page-break-before: always;
        }

        .avoid-break {
            page-break-inside: avoid;
        }

        .page-2 {
            background: rgba(0, 78, 211, 0.01);
        }

        /* Enhanced Header Banner */
        .header-banner {
            background: linear-gradient(135deg, rgba(0, 78, 211, 0.08) 0%, rgba(43, 216, 194, 0.06) 100%);
            border: 1px solid var(--brand-ultramarine);
            border-radius: 8px;
            padding: 20px;
            margin: 0 0 24px 0;
        }

        .header-banner .header {
            margin: 0;
        }

        .header-banner .disclaimer {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 78, 211, 0.2);
            border-radius: 4px;
            padding: 10px 16px;
            margin-top: 16px;
            font-size: 13px;
            color: var(--brand-ink);
        }

        .header-banner .disclaimer b {
            color: var(--brand-ultramarine);
            font-weight: 700;
        }

        .header-banner .disclaimer small {
            color: var(--muted);
            font-size: 12px;
        }



        /* Enhanced Section Styling for Page 2 */
        .page-2 .section {
            background: rgba(249, 250, 251, 0.8);
            border: 1px solid rgba(0, 78, 211, 0.08);
        }

        .page-2 .card {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 78, 211, 0.1);
        }

        /* Two-column input table */
        .kv-2col {
            width: 100%;
            border-collapse: collapse;
        }

        .kv-2col th {
            text-align: left;
            padding: 8px 12px;
            font-weight: 600;
            color: var(--muted);
            background: #fbfcfd;
            border-bottom: 1px solid #f1f3f4;
            width: 25%;
        }

        .kv-2col td {
            padding: 8px 12px;
            font-weight: 600;
            color: var(--ink-800);
            border-bottom: 1px solid #f1f3f4;
            width: 25%;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Enhanced Header Banner with Logo -->
        <div class="header-banner">
            <table class="header">
                <tr>
                    <td class="brand-cell">
                        <img src="${LOGO_DATA_URL}" alt="DMP Logo" style="width: 140px; height: auto; display: block;" />
                    </td>
                    <td>
                        <div class="title">Dynamic Merchant Processing</div>
                        <div class="subtitle">Fee Recuperation Analysis</div>
                    </td>
                    <td style="text-align: right;">
                        <div class="subtitle">Report #: ${reportNumber}</div>
                        <div class="subtitle">Date: ${currentDate}</div>
                    </td>
                </tr>
            </table>
            
            <div class="disclaimer">
                <div style="color: var(--brand-ultramarine); font-weight: bold; margin-bottom: 8px; font-size: 16px;">${isSF ? 'Supplemental Fee Savings Report' : 'Dual Pricing Savings Report'}</div>
                <small>— estimates are based on your information provided; final savings are subject to change if actual data differs.</small>
            </div>
        </div>

        <!-- Customer Information Section -->
        <div class="section avoid-break">
            <div class="section-hd">
                <div class="section-title">Customer Information</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Business Name</th><td>${businessName}</td></tr>
                    <tr style="background:rgba(0,78,211,0.04);"><th>Business Address</th><td>${businessAddress}</td></tr>
                    <tr style="background:rgba(0,78,211,0.04);"><th>Contact Name</th><td>${contactName}</td></tr>
                    <tr style="background:rgba(0,78,211,0.04);"><th>Contact Email</th><td>${contactEmail}</td></tr>
                    <tr><th>Sales Representative</th><td>${salesRepName}</td></tr>
                </table>
            </div>
        </div>

        ${renderInputParameters()}

        <!-- Page 1: SUMMARY (v1.4.0 Mirror UI) -->
        <div class="page-1 break-before">
            ${renderMonthlySavingsSummary()}
            
            <!-- Footnotes -->
            <div style="margin-top: 24px; padding: 16px; background: var(--bg-soft); border-radius: 6px; border-left: 3px solid var(--brand-ultramarine);">
                <div style="font-size: 11px; color: var(--muted); line-height: 1.4;">
                    ${isSF ? `
                        <div>• Flat Rate = Fee ÷ (1+Fee), rounded to 2-dp percent and used in calculations.</div>
                        <div>• Card volume assumed Gross (tax + tip included).</div>
                        <div>• Savings can be negative if processor charges exceed the fee collected on cards.</div>
                    ` : `
                        <div>• Flat Rate = Price Differential ÷ (1+Price Differential), rounded to 2-dp percent and used in calculations.</div>
                        <div>• Card volume assumed Gross (tax + tip included).</div>
                    `}
                </div>
            </div>
        </div>

        <!-- Page 2: DETAILS (v1.4.0 Mirror UI) -->
        <div class="page-2 break-before">
            ${renderInputParameters()}
            ${renderDerivedTotals()}
            ${renderProcessingOnCards()}
            ${renderSavingsVsToday()}
            ${renderGrossProfit()}
        </div>
    </div>
</body>
</html>
`;

}
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Current Processing Cost (Today)</th><td class="metric">${formatCurrency(results.currentCost || currentCost)}</td></tr>
                        <tr><th>Processor Charge on Cards</th><td class="metric">${formatCurrency(results.processorChargeOnCards || 0)}</td></tr>
                        <tr><th>Supplemental Fee Collected — Cards</th><td class="metric metric--positive">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
                        <tr><th>Card Under/Over-Recovery (Fee − Processor)</th><td class="metric ${(results.recovery || 0) >= 0 ? 'metric--positive' : ''}">${formatCurrency(results.recovery || 0)}</td></tr>
                        <tr><th>Processing Cost Savings (Cards Only)</th><td class="metric metric--positive">${formatCurrency(results.savingsCardsOnly || 0)}</td></tr>
                        <tr><th>Processing Cost Savings %</th><td class="metric">${((results.procSavingsPct || 0) * 100).toFixed(2)}%</td></tr>
                        <tr style="background: var(--bg-soft); border-top: 2px solid var(--brand-spruce);"><th style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">Total Net Gain (Monthly)</th><td class="metric metric-lg" style="font-size: 18px; color: var(--brand-spruce); font-weight: 700;">${formatCurrency(results.totalNetGainRevenue || 0)}</td></tr>
                        <tr><th style="font-size: 14px; color: var(--muted);">Annual Net Gain</th><td class="metric" style="font-size: 16px; color: var(--brand-spruce);">${formatCurrency(results.annualNetGainRevenue || 0)}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Footnotes -->
            <div style="margin-top: 24px; padding: 16px; background: var(--bg-soft); border-radius: 6px; border-left: 3px solid var(--brand-ultramarine);">
                <div style="font-size: 11px; color: var(--muted); line-height: 1.4;">
                    <div>• Flat Rate = Fee ÷ (1+Fee), rounded to 2-dp percent and used in calculations.</div>
                    <div>• Card volume assumed Gross (tax + tip included).</div>
                    <div>• Savings can be negative if processor charges exceed the fee collected on cards.</div>
                </div>
            </div>
        </div>

        <!-- Page 3: DETAILS for Supplemental Fee (v1.2.2) -->
        <div class="page-3 break-before">
            <!-- Inputs Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Input Parameters</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Program Type</th><td class="metric">Supplemental Fee</td></tr>
                        <tr><th>Monthly Card Volume (Gross)</th><td class="metric">${formatCurrency(monthlyVolume)}</td></tr>
                        <tr><th>Monthly Cash Volume</th><td class="metric">${formatCurrency(monthlyCashVolume)}</td></tr>
                        <tr><th>Current Processing Rate (%)</th><td class="metric">${formatPercentage(currentRate)}</td></tr>
                        <tr><th>Tax Rate (%)</th><td class="metric">${formatPercentage(taxRate)}</td></tr>
                        <tr><th>Tip Rate (%)</th><td class="metric">${formatPercentage(tipRate)}</td></tr>
                        <tr><th>Supplemental Fee (%)</th><td class="metric">${formatPercentage(priceDifferential)}</td></tr>
                        <tr><th>Flat Rate % (Bank Mapping)</th><td class="metric">${formatPercentage(inputs.flatRatePct || results.derivedFlatRate || flatRate)}</td></tr>
                        <tr><th>Tip Timing</th><td class="metric">${inputs.tipTiming === 'AFTER_TIP' ? 'Tip at time of sale (fee after tip)' : 'Tip handwritten (fee before tip)'}</td></tr>
                        <tr><th>Apply Fee To</th><td class="metric">${inputs.feeTaxBasis === 'PRE_TAX' ? 'Apply fee to pre-tax amount' : 'Apply fee to post-tax amount'}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Derived Totals Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Derived Bases & Totals</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Base Card Volume (pre-tax, pre-tip)</th><td class="metric">${formatCurrency(results.baseVolumePreTaxPreTip || baseVolume)}</td></tr>
                        <tr><th>Fee-Eligible Volume (Cards)</th><td class="metric">${formatCurrency(results.feeBaseCards || 0)}</td></tr>
                        <tr><th>Supplemental Fee Collected — Cards</th><td class="metric">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
                        <tr><th>Tip-Eligible Volume (Cards)</th><td class="metric">${formatCurrency(results.tipBase || 0)}</td></tr>
                        <tr><th>Tip Amount</th><td class="metric">${formatCurrency(results.tipAmount || 0)}</td></tr>
                        <tr><th>Card Processed Total (incl. price differential, tax, and tip)</th><td class="metric">${formatCurrency(results.cardProcessedTotal || 0)}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Processing on Cards Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Processing on Cards (New Program)</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Card Processed Total (incl. price differential, tax, and tip)</th><td class="metric">${formatCurrency(results.cardProcessedTotal || 0)}</td></tr>
                        <tr><th>Flat Rate %</th><td class="metric">${formatPercentage(inputs.flatRatePct || results.derivedFlatRate || flatRate)}</td></tr>
                        <tr><th>Processor Charge on Cards</th><td class="metric">${formatCurrency(results.processorChargeOnCards || 0)}</td></tr>
                        <tr><th>Supplemental Fee Collected — Cards</th><td class="metric">${formatCurrency(results.cardFeeCollected || 0)}</td></tr>
                        <tr><th>Card Under/Over-Recovery</th><td class="metric ${(results.recovery || 0) >= 0 ? 'metric--positive' : ''}">${formatCurrency(results.recovery || 0)}</td></tr>
                        <tr><th>Coverage %</th><td class="metric">${((results.coveragePct || 0) * 100).toFixed(1)}%</td></tr>
                    </table>
                </div>
            </div>

            <!-- Savings vs Today Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Savings vs Today</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Current Processing Cost (Today)</th><td class="metric">${formatCurrency(results.currentCost || currentCost)}</td></tr>
                        <tr><th>Net Change in Card Processing</th><td class="metric ${(results.netChangeCards || 0) <= 0 ? 'metric--positive' : ''}">${formatCurrency(results.netChangeCards || 0)}</td></tr>
                        <tr><th>Processing Cost Savings (Cards Only)</th><td class="metric metric--positive">${formatCurrency(results.savingsCardsOnly || 0)}</td></tr>
                        <tr><th>Supplemental Fee Collected — Cash</th><td class="metric metric--positive">${formatCurrency(results.supplementalFeeCash || 0)}</td></tr>
                        <tr><th>Total Net Gain (Monthly)</th><td class="metric metric--positive">${formatCurrency(results.totalNetGainRevenue || 0)}</td></tr>
                        <tr><th>Annual Net Gain</th><td class="metric metric--positive">${formatCurrency(results.annualNetGainRevenue || 0)}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Profit Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Gross Profit</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Gross Profit (Cards)</th><td class="metric metric--positive">${formatCurrency(results.grossProfit || 0)}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Skytab Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Skytab Bonus</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Skytab Bonus (Gross)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusGross || 0)}</td></tr>
                        <tr><th>Skytab Bonus (Rep 50%)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusRep || 0)}</td></tr>
                    </table>
                </div>
            </div>
        </div>
        ` : `
        <!-- Page 2: Original Dual Pricing Layout -->
        <div class="page-2 break-before">
            <!-- Volume Breakdown Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Volume Breakdown</div>
                </div>
                <div class="section-bd">
                    <div class="cards avoid-break">
                        <div class="card card--accent">
                            <div class="hdr">${results.collectedLabel || 'Markup Collected'}</div>
                            <div class="metric metric-lg">${formatCurrency(results.markupCollected || 0)}</div>
                        </div>
                    </div>
                    <table class="kv">
                        <tr><th>Base Card Volume (pre-tax, pre-tip)</th><td class="metric">${formatCurrency(baseVolume)}</td></tr>
                        <tr><th>Card Processed Total</th><td class="metric">${formatCurrency(results.adjustedCardVolume || adjustedVolume)}</td></tr>
                        <tr><th>Current Processing Cost</th><td class="metric">${formatCurrency(currentCost)}</td></tr>
                        ${(results.residualAfterMarkup || 0) > 0 ? 
                            `<tr><th>Residual cost after markup</th><td class="metric">${formatCurrency(results.residualAfterMarkup || 0)}</td></tr>` :
                            (results.overageRetained || 0) > 0 ?
                            `<tr><th>Overage retained after markup</th><td class="metric">${formatCurrency(results.overageRetained || 0)}</td></tr>` :
                            `<tr><th>Residual cost after markup</th><td class="metric">${formatCurrency(0)}</td></tr>`
                        }
                    </table>
                </div>
            </div>

            <!-- Monthly Savings Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Monthly Processing Savings</div>
                </div>
                <div class="section-bd">
                    <div class="cards avoid-break">
                        <div class="card">
                            <div class="hdr">Current Processing Cost</div>
                            <div class="metric">${formatCurrency(currentCost)}</div>
                        </div>
                        ${(results.residualAfterMarkup || 0) > 0 ? 
                            `<div class="card">
                                <div class="hdr">Residual cost after markup</div>
                                <div class="metric">${formatCurrency(results.residualAfterMarkup || 0)}</div>
                            </div>` :
                            (results.overageRetained || 0) > 0 ?
                            `<div class="card">
                                <div class="hdr">Overage retained after markup</div>
                                <div class="metric">${formatCurrency(results.overageRetained || 0)}</div>
                            </div>` :
                            `<div class="card">
                                <div class="hdr">Residual cost after markup</div>
                                <div class="metric">${formatCurrency(0)}</div>
                            </div>`
                        }
                        <div class="card card--accent">
                            <div class="hdr">Monthly Savings</div>
                            <div class="metric metric-lg metric-pos">${formatCurrency(results.monthlySavings || monthlySavings)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DMP Section - Show for both program types -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">DMP</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Gross Profit</th><td class="metric metric--positive">${formatCurrency(results.grossProfit || 0)}</td></tr>
                        <tr><th>Skytab Bonus Calculation (Gross)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusGross || 0)}</td></tr>
                        <tr><th>Skytab Bonus Calculation (Rep 50%)</th><td class="metric metric--positive">${formatCurrency(results.skytabBonusRep || 0)}</td></tr>
                    </table>
                </div>
            </div>
        </div>
        `}

        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">Dynamic Merchant Processing • quotes@dmprocessing.com • (256) 835-6001</div>
            <div class="footer-right">Thank you for considering DMP</div>
        </div>
    </div>
</body>
</html>`;
}