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
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background-color: white;
            font-size: 10pt;
        }
        
        .container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 50px;
        }
        
        .header {
            margin-bottom: 40px;
        }
        
        .company-info {
            float: left;
            width: 50%;
        }
        
        .company-name {
            font-size: 18pt;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 10px;
        }
        
        .company-address {
            font-size: 10pt;
            color: #333;
            line-height: 1.4;
        }
        
        .quote-info {
            float: right;
            width: 40%;
            text-align: right;
        }
        
        .quote-title {
            font-size: 24pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
        }
        
        .quote-meta {
            font-size: 10pt;
            color: #333;
            line-height: 1.4;
        }
        
        .clear {
            clear: both;
        }
        
        .divider {
            border-bottom: 1px solid #ccc;
            margin: 20px 0;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            text-align: center;
            letter-spacing: 2px;
        }
        
        .customer-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .customer-table td {
            padding: 8px 0;
            border-bottom: none;
            font-size: 10pt;
        }
        
        .customer-table td:first-child {
            font-weight: bold;
            color: #333;
            width: 35%;
        }
        
        .customer-table td:last-child {
            color: #000;
        }
        
        .parameters-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .parameters-table th {
            background: #f5f5f5;
            color: #000;
            font-weight: bold;
            padding: 12px;
            text-align: left;
            border: 1px solid #ccc;
            font-size: 10pt;
        }
        
        .parameters-table td {
            padding: 10px 12px;
            border: 1px solid #ccc;
            font-size: 10pt;
        }
        
        .parameters-table th:last-child,
        .parameters-table td:last-child {
            text-align: right;
        }
        
        .savings-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .savings-card {
            text-align: center;
            padding: 20px;
            border: 2px solid #ddd;
            background: #f9f9f9;
        }
        
        .savings-card h3 {
            font-size: 11pt;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
            line-height: 1.3;
        }
        
        .savings-card .amount {
            font-size: 18pt;
            font-weight: bold;
            color: #000;
        }
        
        .savings-card.positive .amount {
            color: #16a34a;
        }
        
        .savings-card.credit .amount {
            color: #0ea5e9;
        }
        
        .breakdown-section {
            margin-top: 30px;
        }
        
        .breakdown-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .breakdown-table th {
            background: #f5f5f5;
            color: #000;
            font-weight: bold;
            padding: 12px;
            text-align: left;
            border: 1px solid #ccc;
            font-size: 10pt;
        }
        
        .breakdown-table td {
            padding: 10px 12px;
            border: 1px solid #ccc;
            font-size: 10pt;
        }
        
        .breakdown-table th:last-child,
        .breakdown-table td:last-child {
            text-align: right;
        }
        
        .total-row {
            font-weight: bold;
            background: #f0f0f0;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 8pt;
            line-height: 1.4;
        }
        
        @media print {
            .container { 
                width: 100%; 
                margin: 0; 
                padding: 50px 50px; 
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">Dynamic Merchant<br>Processing</div>
                <div class="company-address">
                    Platinum POS Program Quote<br>
                    Generated: ${new Date().toLocaleDateString()}
                </div>
            </div>
            <div class="quote-info">
                <div class="quote-title">QUOTE</div>
                <div class="quote-meta">
                    Quote #: SAV${Date.now().toString().slice(-8)}<br>
                    Date: ${new Date().toLocaleDateString()}<br>
                    Status: Generated
                </div>
            </div>
            <div class="clear"></div>
            <div class="divider"></div>
        </div>

        ${businessName ? `
        <!-- Quote Summary Section -->
        <div class="section">
            <h2 class="section-title">QUOTE SUMMARY</h2>
            <table class="customer-table">
                <tbody>
                    ${businessName ? `
                    <tr>
                        <td>Business Name:</td>
                        <td>${businessName}</td>
                    </tr>
                    ` : ''}
                    ${contactName ? `
                    <tr>
                        <td>Contact:</td>
                        <td>${contactName}</td>
                    </tr>
                    ` : ''}
                    ${contactTitle ? `
                    <tr>
                        <td>Contact Title:</td>
                        <td>${contactTitle}</td>
                    </tr>
                    ` : ''}
                    ${contactEmail ? `
                    <tr>
                        <td>Email:</td>
                        <td>${contactEmail}</td>
                    </tr>
                    ` : ''}
                    ${salesRepName ? `
                    <tr>
                        <td>Sales Rep:</td>
                        <td>${salesRepName}</td>
                    </tr>
                    ` : ''}
                    ${salesRepPhone ? `
                    <tr>
                        <td>Phone Number:</td>
                        <td>${salesRepPhone}</td>
                    </tr>
                    ` : ''}
                    ${businessAddress ? `
                    <tr>
                        <td>Address:</td>
                        <td>${businessAddress}</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Processing Savings -->
        <div class="section">
            <h2 class="section-title">PROCESSING SAVINGS</h2>
            <div class="savings-grid">
                <div class="savings-card">
                    <h3>Current Processing Cost</h3>
                    <div class="amount">$${currentCost.toFixed(2)}</div>
                </div>
                <div class="savings-card credit">
                    <h3>New Processing Cost</h3>
                    <div class="amount">
                        $${Math.abs(newCost).toFixed(2)}${newCost < 0 ? '<br><small>Credit</small>' : ''}
                    </div>
                </div>
                <div class="savings-card positive">
                    <h3>Monthly Savings</h3>
                    <div class="amount">$${monthlySavings.toFixed(2)}</div>
                </div>
            </div>
        </div>

        <!-- Parameters Table -->
        <div class="section">
            <table class="parameters-table">
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
        </div>

        <!-- Volume Breakdown -->
        <div class="breakdown-section">
            <table class="breakdown-table">
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
                    <tr class="total-row">
                        <td><strong>Annual Savings Projection</strong></td>
                        <td><strong>$${annualSavings.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Thank you for considering Dynamic Merchant Processing</strong></p>
            <p>Questions? Contact us at support@dmprocessing.com or (256) 835-6001</p>
        </div>
    </div>
</body>
</html>
  `;
}

export { generateQuoteStyleHTML };