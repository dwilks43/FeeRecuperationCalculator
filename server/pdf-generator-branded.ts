import { LOGO_DATA_URL } from './logo-loader.js';

export function generateBrandedPDF(data: any): string {
  const {
    monthlyVolume,
    currentRate,
    interchangeCost,
    flatRate,
    priceDifferential,
    taxRate = 0,
    tipRate = 0,
    baseVolume,
    adjustedVolume,
    currentCost,
    newCost,
    monthlySavings,
    annualSavings,
    businessName = 'N/A',
    businessAddress = 'N/A',
    contactName = 'N/A',
    contactEmail = 'N/A',
    salesRepName = 'N/A'
  } = data;

  // Generate report number and date
  const reportNumber = Date.now().toString().slice(-8);
  const currentDate = new Date().toLocaleDateString();

  // Format all numeric values with proper currency/percentage formatting
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (rate: number) => `${rate.toFixed(2)}%`;

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

        /* Branded Banner */
        .banner {
            background: linear-gradient(135deg, rgba(0, 78, 211, 0.05) 0%, rgba(43, 216, 194, 0.05) 100%);
            border: 1px solid var(--brand-ultramarine);
            border-radius: 6px;
            padding: 12px 20px;
            margin: 16px 0 24px 0;
            font-size: 14px;
            color: var(--brand-ink);
        }

        .banner b {
            color: var(--brand-ultramarine);
            font-weight: 700;
        }

        .banner small {
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
        <!-- Header with DMP Logo -->
        <table class="header">
            <tr>
                <td class="brand-cell">
                    <img src="${LOGO_DATA_URL}" alt="DMP Logo" style="width: 140px; height: auto; display: block;" />
                </td>
                <td>
                    <div class="title">Dynamic Merchant Processing</div>
                    <div class="subtitle">Dual Pricing Savings Report</div>
                </td>
                <td style="text-align: right;">
                    <div class="subtitle">Report #: ${reportNumber}</div>
                    <div class="subtitle">Date: ${currentDate}</div>
                </td>
            </tr>
        </table>

        <!-- Branded Banner -->
        <div class="banner">
            <b>Dual Pricing Savings Report</b> 
            <small>— estimate based on your current inputs; final terms subject to underwriting and program selection.</small>
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

        <!-- Input Parameters Section -->
        <div class="section avoid-break">
            <div class="section-hd">
                <div class="section-title">Input Parameters</div>
            </div>
            <div class="section-bd">
                <table class="kv-2col">
                    <tr>
                        <th>Monthly Credit Card Volume</th><td class="metric">${formatCurrency(monthlyVolume)}</td>
                        <th>Current Processing Rate</th><td class="metric">${formatPercentage(currentRate)}</td>
                    </tr>
                    <tr>
                        <th>Interchange Cost</th><td class="metric">${formatPercentage(interchangeCost)}</td>
                        <th>Flat Rate</th><td class="metric">${formatPercentage(flatRate)}</td>
                    </tr>
                    <tr>
                        <th>Price Differential</th><td class="metric">${formatPercentage(priceDifferential)}</td>
                        <th>Tax Rate</th><td class="metric">${formatPercentage(taxRate)}</td>
                    </tr>
                    <tr>
                        <th>Tip Rate</th><td class="metric">${formatPercentage(tipRate)}</td>
                        <th>&nbsp;</th><td>&nbsp;</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Page 2 starts here -->
        <div class="page-2 break-before">
            <!-- Volume Breakdown Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Volume Breakdown</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Base Volume</th><td class="metric">${formatCurrency(baseVolume)}</td></tr>
                        <tr><th>Adjusted Card Volume</th><td class="metric">${formatCurrency(adjustedVolume)}</td></tr>
                        <tr><th>Current Processing Cost</th><td class="metric">${formatCurrency(currentCost)}</td></tr>
                        <tr><th>Revenue-Adjusted Processing Cost</th><td class="metric">${formatCurrency(newCost)}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Monthly Processing Savings Section -->
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
                        <div class="card">
                            <div class="hdr">Revenue-Adjusted Processing Cost</div>
                            <div class="metric">${formatCurrency(newCost)}</div>
                        </div>
                        <div class="card card--accent">
                            <div class="hdr">Monthly Savings</div>
                            <div class="metric metric-lg metric-pos">${formatCurrency(monthlySavings)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Annual Impact Section -->
            <div class="section avoid-break">
                <div class="section-hd">
                    <div class="section-title">Annual Impact</div>
                </div>
                <div class="section-bd">
                    <table class="kv">
                        <tr><th>Annual Savings</th><td class="metric metric-lg metric-pos">${formatCurrency(annualSavings)}</td></tr>
                        <tr><th>Processing Volume</th><td class="metric">${formatCurrency(monthlyVolume * 12)}</td></tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">Dynamic Merchant Processing • quotes@dmprocessing.com • (256) 835-6001</div>
            <div class="footer-right">Thank you for considering DMP</div>
        </div>
    </div>
</body>
</html>`;
}