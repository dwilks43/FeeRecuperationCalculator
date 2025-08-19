

function generateQuoteStyleHTML(data: any): string {
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
    customerInfo = {},
    // Try getting customer data directly from top level
    businessName,
    businessAddress,
    contactName,
    contactEmail,
    salesRepName
  } = data;

  // Generate report number and date
  const reportNumber = Date.now().toString().slice(-8);
  const currentDate = new Date().toLocaleDateString();

  // Use the exact simplified template with placeholder replacement - reordered with savings at bottom
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMP Savings Report</title>
    <style>
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
        }

        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid #0ea5e9;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        /* Company logo styling for DocRaptor compatibility */
        .company-logo {
            width: 60px;
            height: auto;
            max-height: 60px;
        }

        .company-name {
            font-size: 20pt;
            font-weight: 700;
            color: #0ea5e9;
        }

        .report-info {
            text-align: right;
            font-size: 12pt;
            color: #6b7280;
        }

        /* Unified section styling - all sections match Monthly Processing Savings */
        .section {
            background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .section-title {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .section-title span {
            font-size: 24px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .data-table th,
        .data-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #bfdbfe;
        }

        .data-table th {
            background: rgba(255, 255, 255, 0.95);
            font-weight: 600;
            color: #1e40af;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        /* Monthly Processing Savings Section - Complete 3-card section matching widget exactly */
        .processing-savings-container {
            background: linear-gradient(to bottom right, #dbeafe, #e0e7ff);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }

        .processing-savings-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .processing-savings-header span {
            font-size: 32px;
        }

        .processing-savings-title {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
        }

        .processing-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .processing-card {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            border: 1px solid #e5e7eb;
        }

        .processing-card.current {
            border-color: #fca5a5;
        }

        .processing-card.new {
            border-color: #86efac;
        }

        .processing-card.savings {
            background: linear-gradient(to right, #f0fdf4, #dcfce7);
            border: 2px solid #22c55e;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .card-title {
            font-size: 11pt;
            font-weight: 500;
            color: #6b7280;
        }

        .card-value-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: space-between;
        }
        
        .card-value-row span:first-child {
            font-size: 28px;
            width: 40px;
        }

        .card-value.current {
            font-size: 24pt;
            font-weight: 700;
            color: #dc2626;
        }

        .card-value.new {
            font-size: 24pt;
            font-weight: 700;
            color: #16a34a;
        }

        .card-value.savings {
            font-size: 24pt;
            font-weight: 800;
            color: #15803d;
        }

        .savings-subtitle {
            font-size: 11pt;
            color: #16a34a;
            font-weight: 500;
            margin-top: 0.25rem;
        }

        /* Annual Impact Section - Match widget exactly */
        .annual-impact {
            margin: 2rem 0;
            padding: 1.5rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .annual-impact-title {
            font-size: 16pt;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .calendar-icon {
            width: 20px;
            height: 20px;
            color: #7c3aed;
        }

        .annual-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .annual-card {
            text-align: center;
            padding: 1rem;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .annual-card-title {
            font-size: 11pt;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }

        .annual-card-amount.savings {
            font-size: 18pt;
            font-weight: 700;
            color: #16a34a;
        }

        .annual-card-amount.volume {
            font-size: 16pt;
            font-weight: 700;
            color: #0369a1;
        }

        .footer {
            margin-top: 3rem;
            text-align: center;
            color: #6b7280;
            font-size: 9pt;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with ACTUAL DMP Logo -->
        <table style="width: 100%; margin-bottom: 2rem; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: middle; width: 70%;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABkAPoEASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0LAOEw5+YoAi8eWKMGpn8Rp6m8TZR5yR+2tWqK2dWSFjEK5aRfDQM4JXIyOKYJXCDGjGAg5UMCCBQ6MZr+j/vAI/R7Vt2jI72jgJaBKNmqfGRaVhLWPNqfF8JCZdxOaHYKgJu8PJGWElmtjnKKKhIKN2sKKyhtg46vYKHbGpLvBJqKzJHfFB1KkFHVmBIyZ/rR" 
                             style="width: 120px; height: auto; max-height: 40px;" alt="DMP Logo" />
                        <div>
                            <h1 style="color: #0ea5e9; margin: 0; font-size: 20px; font-weight: 700; font-family: Arial, sans-serif;">Dynamic Merchant Processing</h1>
                            <p style="color: #666666; margin: 0; font-size: 14px; font-style: italic;">Dual Pricing Savings Report</p>
                        </div>
                    </div>
                </td>
                <td style="text-align: right; vertical-align: top; font-size: 12pt; color: #6b7280;">
                    <div style="font-weight: bold;">Report #: SAV{{REPORT_NUMBER}}</div>
                    <div style="font-weight: bold;">Date: {{DATE}}</div>
                </td>
            </tr>
        </table>

        <!-- Customer Information Section -->
        <div class="section">
            <h3 class="section-title">
                <span>👤</span>
                Customer Information
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Business Name</td>
                        <td>{{BUSINESS_NAME}}</td>
                    </tr>
                    <tr>
                        <td>Business Address</td>
                        <td>{{BUSINESS_ADDRESS}}</td>
                    </tr>
                    <tr>
                        <td>Contact Name</td>
                        <td>{{CONTACT_NAME}}</td>
                    </tr>
                    <tr>
                        <td>Contact Email</td>
                        <td>{{CONTACT_EMAIL}}</td>
                    </tr>
                    <tr>
                        <td>Sales Representative</td>
                        <td>{{SALES_REP_NAME}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Input Parameters -->
        <div class="section">
            <h3 class="section-title">
                <span>⚙️</span>
                Input Parameters
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Monthly Credit Card Volume</td>
                        <td>\${{VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Current Processing Rate</td>
                        <td>{{CURRENT_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Interchange Cost</td>
                        <td>{{INTERCHANGE}}%</td>
                    </tr>
                    <tr>
                        <td>Flat Rate Processing</td>
                        <td>{{FLAT_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Price Differential</td>
                        <td>{{PRICE_DIFF}}%</td>
                    </tr>
                    <tr>
                        <td>Tax Rate</td>
                        <td>{{TAX_RATE}}%</td>
                    </tr>
                    <tr>
                        <td>Tip Rate</td>
                        <td>{{TIP_RATE}}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Volume Breakdown -->
        <div class="section">
            <h3 class="section-title">
                <span>📊</span>
                Volume Breakdown
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Breakdown</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Volume</td>
                        <td>\${{BASE_VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Adjusted Card Volume</td>
                        <td>\${{ADJUSTED_VOLUME}}</td>
                    </tr>
                    <tr>
                        <td>Current Processing Cost</td>
                        <td>\${{CURRENT_COST}}</td>
                    </tr>
                    <tr>
                        <td>New Processing Cost</td>
                        <td>\${{NEW_COST}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Monthly Processing Savings - Complete 3-card section matching widget exactly -->
        <div class="processing-savings-container" style="page-break-before: always;">
            <div class="processing-savings-header">
                <span>🐷</span>
                <div class="processing-savings-title">Monthly Processing Savings</div>
            </div>
            <div class="processing-cards">
                <!-- Current Processing Cost Card -->
                <div class="processing-card current">
                    <div class="card-header">
                        <span class="card-title">Current Processing Cost</span>
                    </div>
                    <div class="card-value-row">
                        <span>⊖</span>
                        <span class="card-value current">\${{CURRENT_COST_FORMATTED}}</span>
                    </div>
                </div>
                
                <!-- New Processing Cost Card -->
                <div class="processing-card new">
                    <div class="card-header">
                        <span class="card-title">New Processing Cost</span>
                    </div>
                    <div class="card-value-row">
                        <span>✓</span>
                        <span class="card-value new">\${{NEW_COST_FORMATTED}}</span>
                    </div>
                </div>
                
                <!-- Monthly Savings Card -->
                <div class="processing-card savings">
                    <div class="card-header">
                        <span class="card-title">Monthly Savings</span>
                    </div>
                    <div class="card-value-row">
                        <span>🏆</span>
                        <span class="card-value savings">\${{MONTHLY_SAVINGS_FORMATTED}}</span>
                    </div>
                    <div class="savings-subtitle">per month saved with DMP</div>
                </div>
            </div>
        </div>

        <!-- Annual Impact - Styled like other sections -->
        <div class="section" style="margin-top: 2rem;">
            <h3 class="section-title">
                <span>📅</span>
                Annual Impact
            </h3>
            <div class="annual-grid">
                <div class="annual-card">
                    <div class="annual-card-title">Annual Savings</div>
                    <div class="annual-card-amount savings">\${{ANNUAL_SAVINGS_FORMATTED}}</div>
                </div>
                <div class="annual-card">
                    <div class="annual-card-title">Processing Volume</div>
                    <div class="annual-card-amount volume">\${{ANNUAL_VOLUME_FORMATTED}}</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Dynamic Merchant Processing</strong></p>
            <p>Questions? Contact us at info@dmprocessing.com or call (555) 123-4567</p>
        </div>
    </div>
</body>
</html>`;

  // Calculate annual volume (12 months of monthly volume)
  const annualVolume = monthlyVolume * 12;

  // Format currency values with commas
  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Replace placeholders with actual data
  return template
    .replace(/{{REPORT_NUMBER}}/g, reportNumber)
    .replace(/{{DATE}}/g, currentDate)
    .replace(/{{CURRENT_COST}}/g, currentCost.toFixed(2))
    .replace(/{{NEW_COST}}/g, newCost < 0 ? Math.abs(newCost).toFixed(2) : newCost.toFixed(2))
    .replace(/{{MONTHLY_SAVINGS}}/g, Math.abs(monthlySavings).toFixed(2))
    .replace(/{{CURRENT_COST_FORMATTED}}/g, formatCurrency(currentCost))
    .replace(/{{NEW_COST_FORMATTED}}/g, formatCurrency(newCost))
    .replace(/{{MONTHLY_SAVINGS_FORMATTED}}/g, formatCurrency(monthlySavings))
    .replace(/{{ANNUAL_SAVINGS_FORMATTED}}/g, formatCurrency(annualSavings))
    .replace(/{{ANNUAL_VOLUME_FORMATTED}}/g, annualVolume.toLocaleString('en-US'))
    .replace(/{{VOLUME}}/g, monthlyVolume.toLocaleString())
    .replace(/{{CURRENT_RATE}}/g, currentRate.toFixed(2))
    .replace(/{{INTERCHANGE}}/g, interchangeCost.toFixed(2))
    .replace(/{{FLAT_RATE}}/g, flatRate.toFixed(2))
    .replace(/{{PRICE_DIFF}}/g, priceDifferential.toFixed(2))
    .replace(/{{TAX_RATE}}/g, taxRate.toFixed(2))
    .replace(/{{TIP_RATE}}/g, tipRate.toFixed(2))
    .replace(/{{BASE_VOLUME}}/g, baseVolume.toLocaleString())
    .replace(/{{ADJUSTED_VOLUME}}/g, adjustedVolume.toLocaleString())
    .replace(/{{ANNUAL_SAVINGS}}/g, annualSavings.toFixed(2))
    .replace(/{{ANNUAL_VOLUME}}/g, annualVolume.toLocaleString())
    .replace(/{{BUSINESS_NAME}}/g, businessName || customerInfo.businessName || 'Not Provided')
    .replace(/{{BUSINESS_ADDRESS}}/g, businessAddress || customerInfo.businessAddress || 'Not Provided')
    .replace(/{{CONTACT_NAME}}/g, contactName || customerInfo.contactName || 'Not Provided')
    .replace(/{{CONTACT_EMAIL}}/g, contactEmail || customerInfo.contactEmail || 'Not Provided')
    .replace(/{{SALES_REP_NAME}}/g, salesRepName || customerInfo.salesRepName || 'Not Provided');
}

export { generateQuoteStyleHTML };