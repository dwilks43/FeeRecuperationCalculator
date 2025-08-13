function getProfessionalStyles(): string {
  return `
    /* Reset and Base Styles */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 10pt;
        line-height: 1.4;
        color: #1f2937;
        background: white;
        margin: 0;
        padding: 0;
    }

    .quote-container {
        width: 7.5in;
        margin: 0 auto;
        padding: 0.5in;
        background: white;
    }

    /* Header Styles */
    .quote-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 3px solid #0ea5e9;
    }

    .company-branding {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .company-logo {
        width: 60px;
        height: auto;
        max-height: 60px;
    }

    .company-text .company-name {
        font-size: 24pt;
        font-weight: 700;
        color: #0ea5e9;
        margin-bottom: 0.5rem;
    }

    .company-tagline {
        font-size: 12pt;
        color: #64748b;
        font-style: italic;
    }

    .quote-meta {
        text-align: right;
    }

    .quote-title {
        font-size: 18pt;
        font-weight: 600;
        color: #374151;
        margin-bottom: 1rem;
    }

    .quote-details p {
        margin-bottom: 0.5rem;
        font-size: 10pt;
    }

    /* Section Styles */
    .section {
        margin-bottom: 3rem;
        page-break-inside: avoid;
    }

    .section-title {
        font-size: 16pt;
        font-weight: 700;
        color: #0ea5e9;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e5e7eb;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Merchant Information */
    .merchant-details {
        background: #f8fafc;
        padding: 2rem;
        border-radius: 12px;
        border-left: 6px solid #0ea5e9;
        border: 2px solid #e5e7eb;
    }

    .detail-row {
        display: table;
        width: 100%;
        margin-bottom: 1rem;
    }

    .detail-row:last-child {
        margin-bottom: 0;
    }

    .label {
        display: table-cell;
        font-weight: 700;
        width: 140px;
        color: #374151;
        vertical-align: top;
        padding-right: 1rem;
    }

    .value {
        display: table-cell;
        color: #1f2937;
        vertical-align: top;
        font-weight: 500;
    }

    /* Processing Overview */
    .processing-grid {
        display: table;
        width: 100%;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 1rem;
        margin-bottom: 2rem;
    }

    .processing-card {
        display: table-cell;
        background: #ffffff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        vertical-align: top;
        width: 25%;
    }

    .processing-card h4 {
        font-size: 11pt;
        font-weight: 700;
        color: #6b7280;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .processing-value {
        font-size: 20pt;
        font-weight: 800;
        color: #1f2937;
        line-height: 1.2;
    }

    .processing-card.savings {
        background: #f0fdf4;
        border-color: #22c55e;
    }

    .savings-amount {
        color: #16a34a;
    }

    .highlight {
        color: #0ea5e9;
    }

    /* Summary Grid for 3-card layout */
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .summary-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }

    .summary-card h3 {
        font-size: 11pt;
        font-weight: 700;
        color: #6b7280;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .summary-card .value {
        font-size: 18pt;
        font-weight: 700;
        color: #004ED3;
        line-height: 1.2;
    }

    .summary-card.savings {
        background: #f0fdf4;
        border-color: #22c55e;
    }

    .summary-card.savings h3 {
        color: #16a34a;
    }

    .savings-amount {
        color: #16a34a;
    }

    .savings-positive {
        color: #059669;
    }

    .savings-negative {
        color: #dc2626;
    }

    /* Data Grid Tables */
    .data-grid {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        font-size: 10pt;
    }

    .data-grid th,
    .data-grid td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }

    .data-grid th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #d1d5db;
    }

    .data-grid tr:hover {
        background: #f9fafb;
    }

    .data-grid td:last-child {
        text-align: right;
        font-weight: 600;
    }

    .highlight-row {
        background: #f8fafc;
        font-weight: 600;
    }

    .highlight-row td {
        color: #1e40af;
        font-weight: 700;
    }

    /* Equipment Table */
    .equipment-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        font-size: 10pt;
    }

    .equipment-table th,
    .equipment-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
    }

    .equipment-table th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #d1d5db;
    }

    .equipment-table tr:hover {
        background: #f9fafb;
    }

    .item-name {
        font-weight: 600;
        color: #1f2937;
    }

    .item-description {
        color: #6b7280;
        font-size: 9pt;
    }

    .item-qty,
    .item-price,
    .item-total {
        text-align: right;
    }

    .total-row {
        background: #f8fafc;
        font-weight: 600;
    }

    .total-label {
        text-align: right;
        color: #374151;
    }

    .total-amount {
        text-align: right;
        color: #1e40af;
        font-weight: 700;
    }

    /* Financial Section */
    .financial-grid {
        display: table;
        width: 100%;
        table-layout: fixed;
        border-collapse: separate;
        border-spacing: 1rem;
        margin-bottom: 2rem;
    }

    .financial-card {
        display: table-cell;
        background: #ffffff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        vertical-align: top;
        width: 33.33%;
    }

    .financial-card h4 {
        font-size: 11pt;
        font-weight: 700;
        color: #6b7280;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .financial-value {
        font-size: 22pt;
        font-weight: 800;
        color: #1f2937;
        line-height: 1.2;
    }

    .financial-card.credit {
        background: #fef3c7;
        border-color: #f59e0b;
    }

    .credit-amount {
        color: #d97706;
    }

    .financial-card.total {
        background: #eff6ff;
        border-color: #0ea5e9;
    }

    .total-amount {
        color: #0ea5e9;
    }

    /* ROI Section */
    .roi-section {
        background: #f0fdf4;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #22c55e;
    }

    .roi-section h4 {
        font-size: 12pt;
        font-weight: 600;
        color: #166534;
        margin-bottom: 1rem;
    }

    .roi-details p {
        margin-bottom: 0.5rem;
        color: #15803d;
    }

    /* Footer */
    .quote-footer {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
        text-align: center;
    }

    .footer-text {
        font-size: 11pt;
        color: #374151;
        margin-bottom: 0.5rem;
    }

    .footer-contact {
        font-size: 10pt;
        color: #6b7280;
    }

    /* Print Optimizations */
    @media print {
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .quote-container {
            padding: 0;
        }
        
        .section {
            page-break-inside: avoid;
        }
        
        .quote-header {
            page-break-after: avoid;
        }
    }

    /* Page Break Controls */
    .page-break-before {
        page-break-before: always;
    }
    
    .page-break-after {
        page-break-after: always;
    }
    
    .no-page-break {
        page-break-inside: avoid;
    }
  `;
}

function generateQuoteStyleHTML(data: any): string {
  const {
    // Customer Information
    businessName,
    businessAddress,
    contactName,
    contactTitle,
    contactEmail,
    salesRepName,
    salesRepEmail,
    salesRepPhone,
    // Calculator Data
    monthlyVolume,
    currentRate,
    interchangeCost,
    flatRate,
    taxRate,
    tipRate,
    priceDifferential,
    baseVolume,
    adjustedVolume,
    processingFees,
    markupCollected,
    currentCost,
    newCost,
    monthlySavings,
    annualSavings,
    dmpProfit
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Merchant Processing - Dual Pricing Savings Report</title>
    <style>
        ${getProfessionalStyles()}
    </style>
</head>
<body>
    <div class="quote-container">
        <header class="quote-header">
            <div class="company-branding">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzBlYTVlOSIvPg0KPHR0ZXh0IHg9IjEyMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ETVAuPC90ZXh0Pg0KPC9zdmc+" 
                     class="company-logo" alt="DMP Logo" style="width: 60px; height: auto;" />
                <div class="company-text">
                    <h1 class="company-name">Dynamic Merchant Processing</h1>
                    <p class="company-tagline">Your Partner in Payment Solutions</p>
                </div>
            </div>
            <div class="quote-meta">
                <h2 class="quote-title">Dual Pricing Savings Report</h2>
                <div class="quote-details">
                    <p><strong>Report #:</strong> SAV${Date.now().toString().slice(-8)}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </header>

        <!-- Processing Savings -->
        <section class="section processing-section">
            <h3 class="section-title">Processing Savings</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Current Cost</h3>
                    <div class="value">$${currentCost.toFixed(2)}</div>
                </div>
                <div class="summary-card">
                    <h3>New Cost</h3>
                    <div class="value savings-positive">${newCost < 0 ? '$' + Math.abs(newCost).toFixed(2) + ' Credit' : '$' + newCost.toFixed(2)}</div>
                </div>
                <div class="summary-card savings">
                    <h3>Monthly Savings</h3>
                    <div class="value savings-amount">$${Math.abs(monthlySavings).toFixed(2)}</div>
                </div>
            </div>
        </section>

        <!-- Parameters Table -->
        <section class="section">
            <h3 class="section-title">Merchant Information</h3>
            <table class="data-grid">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Monthly Credit Card Volume</td>
                        <td>$${monthlyVolume.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Current Processing Rate</td>
                        <td>${currentRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Interchange Cost</td>
                        <td>${interchangeCost.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Flat Rate Processing</td>
                        <td>${flatRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Tax Rate</td>
                        <td>${taxRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Tip Rate</td>
                        <td>${tipRate.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>Price Differential</td>
                        <td>${priceDifferential.toFixed(2)}%</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Volume Breakdown -->
        <section class="section">
            <h3 class="section-title">Volume Analysis</h3>
            <table class="data-grid">
                <thead>
                    <tr>
                        <th>Volume Breakdown</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Volume</td>
                        <td>$${baseVolume.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Adjusted Card Volume</td>
                        <td>$${adjustedVolume.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Total Processing Fees Charged</td>
                        <td>$${processingFees.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Card Price Increase Collected</td>
                        <td>$${markupCollected.toFixed(2)}</td>
                    </tr>
                    <tr class="highlight-row">
                        <td><strong>Annual Savings Projection</strong></td>
                        <td><strong>$${annualSavings.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Footer -->
        <footer class="quote-footer">
            <div class="footer-content">
                <p class="footer-text">Thank you for considering Dynamic Merchant Processing for your payment processing needs.</p>
                <p class="footer-contact">Questions? Contact us at info@dmprocessing.com or call (555) 123-4567</p>
            </div>
        </footer>
    </div>
</body>
</html>
  `;
}

export { generateQuoteStyleHTML };