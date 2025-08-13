function getProfessionalStyles(): string {
  return `
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
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
    }

    .quote-container {
        width: 7.5in;
        margin: 0 auto;
        padding: 0.5in;
        background: white;
    }

    /* Professional Header */
    .quote-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem;
        margin-bottom: 3rem;
        background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
        border: 3px solid #0ea5e9;
        border-radius: 12px;
        color: white;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    .company-branding {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .company-logo {
        width: 60px;
        height: 60px;
        border-radius: 8px;
    }

    .company-text {
        color: white;
    }

    .company-name {
        font-size: 18pt;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .company-tagline {
        font-size: 11pt;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
    }

    .quote-meta {
        text-align: right;
        color: white;
    }

    .quote-title {
        font-size: 16pt;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .quote-details {
        font-size: 10pt;
        line-height: 1.5;
    }

    /* Section Styles */
    .section {
        margin-bottom: 3rem;
        page-break-inside: avoid;
    }

    .section-title {
        font-size: 14pt;
        font-weight: 700;
        color: #0ea5e9;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #0ea5e9;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Merchant Details */
    .merchant-details {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.5rem;
    }

    .detail-row {
        display: flex;
        margin-bottom: 0.75rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
    }

    .detail-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    .label {
        font-weight: 600;
        color: #374151;
        width: 40%;
        flex-shrink: 0;
    }

    .value {
        color: #1f2937;
        font-weight: 500;
    }

    /* Summary Grid */
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .summary-card {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
    }

    .summary-card h3 {
        font-size: 11pt;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .summary-card .value {
        font-size: 18pt;
        font-weight: 700;
        color: #1f2937;
    }

    .summary-card.savings {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border-color: #22c55e;
    }

    .summary-card.savings h3 {
        color: #16a34a;
    }

    .savings-amount {
        color: #16a34a !important;
    }

    .savings-positive {
        color: #0ea5e9 !important;
    }

    /* Data Grid Tables */
    .data-grid {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }

    .data-grid th {
        background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
        color: white;
        font-weight: 700;
        padding: 1rem 0.75rem;
        text-align: left;
        font-size: 10pt;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    .data-grid th:last-child {
        text-align: right;
    }

    .data-grid td {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
        font-size: 10pt;
        line-height: 1.4;
    }

    .data-grid td:last-child {
        text-align: right;
        font-weight: 600;
    }

    .data-grid tr:hover {
        background: #f8fafc;
    }

    .highlight-row {
        background: #fef3c7 !important;
        font-weight: 700;
        border-left: 4px solid #f59e0b;
    }

    .highlight-row td {
        color: #92400e;
        font-weight: 700;
    }

    /* Footer */
    .quote-footer {
        margin-top: 4rem;
        padding-top: 2rem;
        border-top: 2px solid #e5e7eb;
        text-align: center;
    }

    .footer-content {
        color: #6b7280;
    }

    .footer-text {
        font-size: 11pt;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
    }

    .footer-contact {
        font-size: 10pt;
        color: #6b7280;
    }

    /* Print Styles */
    @media print {
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        .quote-container {
            width: 100%;
            margin: 0;
            padding: 0.5in;
        }
        
        .section {
            page-break-inside: avoid;
        }
        
        .quote-header {
            page-break-after: avoid;
        }
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
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzBlYTVlOSIvPg0KPHR0ZXh0IHg9IjEyMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ETVAuPC90ZXh0Pg0KPC9zdmc+" class="company-logo" alt="DMP Logo" />
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

        ${businessName ? `
        <!-- Quote Summary Section -->
        <section class="section merchant-section">
            <h3 class="section-title">Quote Summary</h3>
            <div class="merchant-details">
                ${businessName ? `
                <div class="detail-row">
                    <span class="label">Business Name:</span>
                    <span class="value">${businessName}</span>
                </div>
                ` : ''}
                ${contactName ? `
                <div class="detail-row">
                    <span class="label">Contact:</span>
                    <span class="value">${contactName}${contactTitle ? `, ${contactTitle}` : ""}</span>
                </div>
                ` : ''}
                ${contactEmail ? `
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${contactEmail}</span>
                </div>
                ` : ''}
                ${salesRepName ? `
                <div class="detail-row">
                    <span class="label">Sales Rep:</span>
                    <span class="value">${salesRepName}</span>
                </div>
                ` : ''}
                ${salesRepPhone ? `
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${salesRepPhone}</span>
                </div>
                ` : ''}
                ${businessAddress ? `
                <div class="detail-row">
                    <span class="label">Address:</span>
                    <span class="value">${businessAddress}</span>
                </div>
                ` : ''}
            </div>
        </section>
        ` : ''}

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
                    <div class="value savings-positive">$${Math.abs(newCost).toFixed(2)}${newCost < 0 ? ' Credit' : ''}</div>
                </div>
                <div class="summary-card savings">
                    <h3>Monthly Savings</h3>
                    <div class="value savings-amount">$${monthlySavings.toFixed(2)}</div>
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