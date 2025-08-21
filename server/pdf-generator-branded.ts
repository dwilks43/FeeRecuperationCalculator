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
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            color: var(--ink-800);
            font-size: 12px;
            line-height: 1.5;
            background: white;
        }

        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
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
            background: var(--bg-soft);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--border);
        }

        .section-hd {
            margin-bottom: 16px;
            padding: 12px 0;
            border-bottom: 2px solid var(--brand-ultramarine);
            background: var(--bg-soft);
        }

        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--brand-ultramarine);
            margin: 0;
        }

        .section-bd {
            background: white;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid var(--border);
        }

        /* Key-Value Table */
        .kv {
            width: 100%;
            border-collapse: collapse;
        }

        .kv th {
            text-align: left;
            padding: 8px 12px;
            font-weight: 600;
            color: var(--muted);
            background: var(--bg-soft);
            border-bottom: 1px solid var(--border);
            width: 60%;
        }

        .kv td {
            padding: 8px 12px;
            font-weight: 600;
            color: var(--ink);
            border-bottom: 1px solid var(--border);
        }

        .kv .metric {
            font-weight: 700;
            color: var(--brand-ultramarine);
        }

        .metric--positive {
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
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }

        .card.highlight {
            background: linear-gradient(135deg, #E0F7F4 0%, #B3F1E9 100%);
            border: 2px solid var(--brand-aqua);
        }

        .metric {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-ultramarine);
            margin-top: 8px;
        }

        .card.highlight .metric {
            color: var(--brand-spruce);
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid var(--border);
            text-align: center;
            font-size: 11px;
            color: var(--muted);
            display: flex;
            justify-content: space-between;
            align-items: center;
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

        <!-- Customer Information Section -->
        <div class="section">
            <div class="section-hd">
                <div class="section-title">Customer Information</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Business Name</th><td>${businessName}</td></tr>
                    <tr><th>Business Address</th><td>${businessAddress}</td></tr>
                    <tr><th>Contact Name</th><td>${contactName}</td></tr>
                    <tr><th>Contact Email</th><td>${contactEmail}</td></tr>
                    <tr><th>Sales Representative</th><td>${salesRepName}</td></tr>
                </table>
            </div>
        </div>

        <!-- Input Parameters Section -->
        <div class="section">
            <div class="section-hd">
                <div class="section-title">Input Parameters</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Monthly Credit Card Volume</th><td class="metric">${formatCurrency(monthlyVolume)}</td></tr>
                    <tr><th>Current Processing Rate</th><td class="metric">${formatPercentage(currentRate)}</td></tr>
                    <tr><th>Interchange Cost</th><td class="metric">${formatPercentage(interchangeCost)}</td></tr>
                    <tr><th>Flat Rate</th><td class="metric">${formatPercentage(flatRate)}</td></tr>
                    <tr><th>Price Differential</th><td class="metric">${formatPercentage(priceDifferential)}</td></tr>
                    <tr><th>Tax Rate</th><td class="metric">${formatPercentage(taxRate)}</td></tr>
                    <tr><th>Tip Rate</th><td class="metric">${formatPercentage(tipRate)}</td></tr>
                </table>
            </div>
        </div>

        <!-- Volume Breakdown Section -->
        <div class="section">
            <div class="section-hd">
                <div class="section-title">Volume Breakdown</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Base Volume</th><td class="metric">${formatCurrency(baseVolume)}</td></tr>
                    <tr><th>Adjusted Card Volume</th><td class="metric">${formatCurrency(adjustedVolume)}</td></tr>
                    <tr><th>Current Processing Cost</th><td class="metric">${formatCurrency(currentCost)}</td></tr>
                    <tr><th>New Processing Cost</th><td class="metric">${formatCurrency(newCost)}</td></tr>
                </table>
            </div>
        </div>

        <!-- Monthly Processing Savings Section -->
        <div class="section">
            <div class="section-hd">
                <div class="section-title">Monthly Processing Savings</div>
            </div>
            <div class="section-bd">
                <div class="cards">
                    <div class="card">
                        <div style="font-weight: 700;">Current Processing Cost</div>
                        <div class="metric">${formatCurrency(currentCost)}</div>
                    </div>
                    <div class="card">
                        <div style="font-weight: 700;">New Processing Cost</div>
                        <div class="metric">${formatCurrency(newCost)}</div>
                    </div>
                    <div class="card highlight">
                        <div style="font-weight: 700;">Monthly Savings</div>
                        <div class="metric">${formatCurrency(monthlySavings)}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Annual Impact Section -->
        <div class="section">
            <div class="section-hd">
                <div class="section-title">Annual Impact</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Annual Savings</th><td class="metric metric--positive">${formatCurrency(annualSavings)}</td></tr>
                    <tr><th>Processing Volume</th><td class="metric">${formatCurrency(monthlyVolume * 12)}</td></tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>Dynamic Merchant Processing • info@dmprocessing.com • (555) 123-4567</div>
            <div>Thank you for considering DMP for your payment processing needs.</div>
        </div>
    </div>
</body>
</html>`;
}