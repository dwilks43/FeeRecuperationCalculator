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
            --brand-primary: #1d4ed8;  /* DMP Blue 700 */
            --brand-accent: #3b82f6;   /* DMP Blue 500 */
            --brand-light: #dbeafe;    /* DMP Blue 100 */
            --ink: #0f172a;            /* Slate 900 */
            --muted: #475569;          /* Slate 600 */
            --border: #e2e8f0;         /* Slate 200 */
            --bg-soft: #f8fafc;        /* Slate 50 */
            --success: #059669;        /* Green 600 */
            --success-light: #d1fae5;  /* Green 100 */
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            color: var(--ink);
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
            color: var(--brand-primary);
            margin-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
            color: var(--muted);
            font-style: italic;
        }

        .chip {
            background: var(--brand-primary);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 4px;
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
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--brand-light);
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
            color: var(--brand-primary);
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
            background: var(--success-light);
            border: 2px solid var(--success);
        }

        .metric {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-primary);
            margin-top: 8px;
        }

        .card.highlight .metric {
            color: var(--success);
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
                    <div class="chip">Report #: ${reportNumber}</div>
                    <div class="subtitle">Date: ${currentDate}</div>
                </td>
            </tr>
        </table>

        <!-- Customer Information Section -->
        <div class="section">
            <div class="section-hd">
                <div class="chip">Customer</div>
                <div style="font-weight: 700;">Customer Information</div>
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
                <div class="chip">Inputs</div>
                <div style="font-weight: 700;">Input Parameters</div>
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
                <div class="chip">Breakdown</div>
                <div style="font-weight: 700;">Volume Breakdown</div>
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
                <div class="chip">Savings</div>
                <div style="font-weight: 700;">Monthly Processing Savings</div>
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
                <div class="chip">Annual</div>
                <div style="font-weight: 700;">Annual Impact</div>
            </div>
            <div class="section-bd">
                <table class="kv">
                    <tr><th>Annual Savings</th><td class="metric">${formatCurrency(annualSavings)}</td></tr>
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