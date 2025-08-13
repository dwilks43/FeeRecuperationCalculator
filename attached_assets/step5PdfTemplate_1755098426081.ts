import { calculateFinancialOptions } from "@/lib/utils";
import { QuoteDTO } from "@shared/quoteDTO";
import { FinancingOption } from "@shared/types/quoteTypes";

/**
 * Generate Step 5-style PDF template that mimics the exact layout of Step 5
 */
export function generateStep5StyleHtml(
    quote: QuoteDTO,
    allFinancingOptions: FinancingOption[]
): string {
    const formatCurrency = (amount: number | undefined): string => {
        if (!amount || isNaN(amount)) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatPercentage = (rate: number | undefined): string => {
        if (!rate || isNaN(rate)) return "0%";
        return `${rate}%`;
    };

    // 🔒 CRITICAL: Use exact calculatedValues from database for 1-to-1 Step 5 match
    const calculatedValues = quote.calculatedValues;
    console.log(
        "🔥 STEP 5 PDF - calculatedValues available:",
        !!calculatedValues
    );

    // Use exact Step 5 values from calculatedValues (frozen from Step 4)
    const exactMonthlyProcessingSavings =
        calculatedValues?.monthlyProcessingSavings ||
        quote?.processing?.monthlyProcessingSavings ||
        0;
    const exactMonthlySoftwareSavings =
        calculatedValues?.monthlySoftwareSavings ||
        quote?.processing?.monthlySoftwareSavings ||
        0;
    const exactTotalMonthlySavings =
        calculatedValues?.totalMonthlySavings ||
        quote?.processing?.totalMonthlySavings ||
        0;
    const exactCurrentProcessingCost =
        calculatedValues?.currentProcessingCost ||
        quote?.processing?.currentProcessingCost ||
        0;
    const exactNewProcessingCost =
        calculatedValues?.newProcessingCost ||
        quote?.processing?.newProcessingCost ||
        0;
    const exactCurrentSoftwareCost =
        calculatedValues?.volumeData?.currentSoftwareCost ||
        quote?.processing?.currentSoftwareCost ||
        0;
    const exactNewSoftwareCost =
        calculatedValues?.monthlySoftwareCost ||
        quote?.processing?.monthlySoftwareCost ||
        0;
    const exactHardwareTotal =
        calculatedValues?.hardwareTotals || quote.totals.hardwareTotal || 0;
    const exactMenuWorksTotal =
        calculatedValues?.menuWorksTotals || quote.totals.menuWorksTotal || 0;
    const exactMerchantCredit =
        calculatedValues?.merchantCredit || quote.totals.merchantCredit || 0;
    // 🔒 CRITICAL: Use exact Step 5 Total Due logic - Math.max(0, upfrontTotal - merchantCredit)
    const upfrontTotal = exactHardwareTotal + exactMenuWorksTotal;
    const exactTotalDue = Math.max(0, upfrontTotal - exactMerchantCredit);

    // Calculate Combined Savings % (Processing + Software / Current Total)
    const totalCurrentCost =
        exactCurrentProcessingCost + exactCurrentSoftwareCost;
    const totalNewCost = exactNewProcessingCost + exactNewSoftwareCost;
    const combinedSavingsPercent =
        totalCurrentCost > 0
            ? ((totalCurrentCost - totalNewCost) / totalCurrentCost) * 100
            : 0;

    console.log(
        "🔥 STEP 5 PDF - exactMonthlyProcessingSavings:",
        exactMonthlyProcessingSavings
    );
    console.log(
        "🔥 STEP 5 PDF - exactMonthlySoftwareSavings:",
        exactMonthlySoftwareSavings
    );
    console.log(
        "🔥 STEP 5 PDF - exactTotalMonthlySavings:",
        exactTotalMonthlySavings
    );
    console.log(
        "🔥 STEP 5 PDF - combinedSavingsPercent:",
        combinedSavingsPercent
    );

    // Calculate totals from hardware items
    let hardwareTotal = 0;
    let menuWorksTotal = 0;
    let softwareTotal = 0;

    // Handle different hardware structures
    const hardwareItems = Array.isArray(quote.hardware)
        ? quote.hardware
        : quote?.hardware?.items || [];

    hardwareItems.forEach((item: any) => {
        const total = (item.quantity || 0) * (item.unitPrice || 0);
        if (item.type === "menu") {
            menuWorksTotal += total;
        } else {
            hardwareTotal += total;
        }
    });

    const equipmentTotal = hardwareTotal + menuWorksTotal + softwareTotal;
    const merchantCredit = quote.totals?.merchantCredit || 0;
    const netInvestment = equipmentTotal - Math.abs(merchantCredit);

    // Processing data
    const monthlyVolume = quote.processing?.monthlyVolume || 0;
    const currentRate = quote.processing?.currentEffectiveRate || 0;
    const proposedRate = quote.processing?.effectiveRate || 0;
    const monthlySavings = quote.processing?.priceDifferential || 0;
    const annualSavings = monthlySavings * 12;

    // Processing costs
    const currentProcessingCost = quote.processing?.currentProcessingCost || 0;
    const newProcessingCost = quote.processing?.newProcessingCost || 0;

    // Software costs
    const currentSoftwareCost = quote.processing?.currentSoftwareCost || 0;
    const newSoftwareCost = quote.totals?.monthlySoftwareCost || 0;
    const softwareSavings =
        quote.processing?.monthlySoftwareSavings ||
        currentSoftwareCost - newSoftwareCost;

    // Total savings
    const totalMonthlySavings =
        quote.processing?.totalMonthlySavings || monthlySavings + softwareSavings;

    // ROI calculation
    const roiMonths =
        netInvestment > 0 ? Math.ceil(netInvestment / totalMonthlySavings) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Merchant Processing - Quote ${quote.quoteNumber}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #1f2937;
            background: white;
            margin: 0;
            padding: 0;
        }

        .quote-container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.4in;
            background: white;
        }

        /* Enhanced DMP Branded Header - Ultramarine & Aqua */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #004ED3 0%, #2BD8C2 100%);
            color: white;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 8px rgba(0, 78, 211, 0.2);
        }

        .header-content {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            width: 60%;
        }

        .header-logo {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 40%;
            padding-left: 1rem;
        }

        .company-name {
            font-size: 20pt;
            font-weight: 700;
            color: white;
            margin-bottom: 0.3rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .tagline {
            font-size: 11pt;
            color: white;
            font-weight: 600;
            margin-bottom: 0.3rem;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .quote-info {
            font-size: 9pt;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }

        .logo {
            max-width: 120px;
            max-height: 60px;
            width: auto;
            height: auto;
            display: block;
        }

        /* Section Styles */
        .section {
            margin-bottom: 1.5rem;
        }

        .section-title {
            font-size: 12pt;
            font-weight: 700;
            color: #004ED3;
            margin-bottom: 0.5rem;
            border-bottom: 2px solid #004ED3;
            padding-bottom: 0.3rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Quote Summary */
        .summary-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.5rem;
        }

        .summary-row {
            display: table-row;
        }

        .summary-label {
            display: table-cell;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            width: 40%;
            border: 1px solid #004ED3;
            background: linear-gradient(135deg, #E0F4FF 0%, #B8E6FF 100%);
            color: #004ED3;
        }

        .summary-value {
            display: table-cell;
            padding: 0.25rem 0.5rem;
            border: 1px solid #e5e7eb;
        }

        /* Itemization Table */
        .itemization-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 0.5rem;
        }

        .itemization-table th,
        .itemization-table td {
            padding: 0.3rem;
            text-align: left;
            border: 1px solid #e5e7eb;
        }

        .itemization-table th {
            background: linear-gradient(135deg, #004ED3 0%, #2BD8C2 100%);
            color: white;
            font-weight: 700;
            font-size: 8pt;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .text-right {
            text-align: right;
        }

        .subtotal-row {
            background: #f8fafc;
            font-style: italic;
        }

        .total-row {
            background: #f0f9ff;
            font-weight: 600;
        }

        .credit-row {
            background: #fef3f2;
            color: #dc2626;
        }

        .final-total-row {
            background: #f0fdf4;
            font-weight: 700;
            font-size: 9pt;
        }

        /* Savings Cards - 3 card layout */
        .savings-grid {
            display: table;
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0.5rem;
        }

        .savings-card {
            display: table-cell;
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 0.75rem;
            text-align: center;
            width: 33.33%;
        }

        /* Total Savings & ROI - 6 card layout */
        .total-savings-grid {
            display: table;
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0.25rem;
        }

        .total-savings-grid .savings-card {
            display: table-cell;
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 0.5rem;
            text-align: center;
            width: 16.66%;
        }

        .total-savings-grid .savings-card h4 {
            font-size: 8pt;
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 0.25rem;
        }

        .total-savings-grid .savings-value {
            font-size: 10pt;
            font-weight: 700;
            color: #1f2937;
        }

        .savings-card h4 {
            font-size: 9pt;
            font-weight: 600;
            color: #0ea5e9;
            margin-bottom: 0.25rem;
        }

        .savings-value {
            font-size: 12pt;
            font-weight: 700;
            color: #1f2937;
        }

        .processing-savings {
            background: #f0fdf4;
            border-color: #22c55e;
        }

        .processing-savings h4 {
            color: #16a34a;
        }

        .processing-savings .savings-value {
            color: #16a34a;
        }

        /* ROI Section */
        .roi-section {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 6px;
            padding: 0.75rem;
            margin-top: 1rem;
        }

        .roi-title {
            font-size: 10pt;
            font-weight: 600;
            color: #16a34a;
            margin-bottom: 0.5rem;
        }

        .roi-details {
            font-size: 8pt;
            color: #15803d;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #e5e7eb;
            font-size: 8pt;
            color: #6b7280;
        }

        /* Page Break Styles */
        .page-break {
            page-break-before: always;
            break-before: page;
        }

        @media print {
            body { -webkit-print-color-adjust: exact; }
            .page-break {
                page-break-before: always;
                break-before: page;
            }
        }
        
.itemization-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.itemization-table th,
.itemization-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}

.itemization-table th {
    background-color: #f2f2f2;
    color: #333;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.9em;
}

.itemization-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

.itemization-table tbody tr:hover {
    background-color: #f1f1f1;
}

    </style>
</head>
<body>
    <div class="quote-container">
        <!-- Enhanced DMP Branded Header -->
        <div class="header">
            <div class="header-content">
                <h1 class="company-name">Dynamic Merchant Processing</h1>
                <p class="tagline">Platinum POS Program Quote</p>
                <div class="quote-info">
                    Quote #${quote.quoteNumber
        } | ${new Date().toLocaleDateString()}
                </div>
            </div>
            <div class="header-logo">
                <img src="data:image/png;base64,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" style="position: absolute; right: 20px; top: 20px; width: 120px; height: auto;" alt="Dynamic Merchant Processing Logo">
            </div>
            </div>
        <!-- Quote Summary -->
        <div class="section">
            <h3 class="section-title">Quote Summary</h3>
            <div class="summary-grid">
                <div class="summary-row">
                    <div class="summary-label">Business Name:</div>
                    <div class="summary-value">${quote.merchant?.businessName || "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Contact:</div>
                    <div class="summary-value">${quote.merchant?.contactName || "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Contact Title:</div>
                    <div class="summary-value">${quote.merchant?.title || "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Email:</div>
                    <div class="summary-value">${quote.merchant?.email || "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Sales Rep:</div>
                    <div class="summary-value">${quote.merchant?.salesRepName
            ? quote.merchant?.salesRepName
            : "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Phone Number:</div>
                    <div class="summary-value">${quote.merchant?.phone || "N/A"
        }</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Address:</div>
                    <div class="summary-value">${quote.merchant?.address || "N/A"
        }</div>
                </div>
            </div>
        </div>

        <!-- Itemization -->
        <div class="section">
            <h3 class="section-title">Hardware/Software/Menus</h3>
            <table class="itemization-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${hardwareItems
            .map(
                (item: any) => `
                        <tr>
                            <td>${item.itemName}</td>
                            <td>${item.description || "Professional equipment"
                    }</td>
                            <td class="text-right">${item.quantity || 1}</td>
                            <td class="text-right">${formatCurrency(
                        item.unitPrice
                    )}</td>
                            <td class="text-right">${formatCurrency(
                        (item.quantity || 1) * (item.unitPrice || 0)
                    )}</td>
                        </tr>
                    `
            )
            .join("") ||
        '<tr><td colspan="5">No items configured</td></tr>'
        }
                    <tr class="subtotal-row">
                        <td colspan="4" class="text-right">Hardware Total:</td>
                        <td class="text-right">${formatCurrency(
            exactHardwareTotal
        )}</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td colspan="4" class="text-right">Menu Works Total:</td>
                        <td class="text-right">${formatCurrency(
            exactMenuWorksTotal
        )}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" class="text-right"><strong>Total Upfront Cost:</strong></td>
                        <td class="text-right"><strong>${formatCurrency(
            exactHardwareTotal + exactMenuWorksTotal
        )}</strong></td>
                    </tr>
                    <tr class="credit-row">
                        <td colspan="4" class="text-right">Merchant Credit:</td>
                        <td class="text-right">-${formatCurrency(
            exactMerchantCredit
        )}</td>
                    </tr>
                    <tr class="final-total-row">
                        <td colspan="4" class="text-right"><strong>Total Due:</strong></td>
                        <td class="text-right"><strong>${formatCurrency(
            exactTotalDue
        )}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Processing Savings -->
        <div class="section page-break">
            <h3 class="section-title">Processing Savings</h3>
            <div class="savings-grid">
                <div class="savings-card">
                    <h4>Current Processing Cost</h4>
                    <div class="savings-value">${formatCurrency(
            exactCurrentProcessingCost
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>New Processing Cost</h4>
                    <div class="savings-value">${formatCurrency(
            exactNewProcessingCost
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>Monthly Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactMonthlyProcessingSavings
        )}</div>
                </div>
            </div>
        </div>

        <!-- Software Savings -->
        <div class="section">
            <h3 class="section-title">Software Savings</h3>
            <div class="savings-grid">
                <div class="savings-card">
                    <h4>Current Software Cost</h4>
                    <div class="savings-value">${formatCurrency(
            exactCurrentSoftwareCost
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>New Software Cost</h4>
                    <div class="savings-value">${formatCurrency(
            exactNewSoftwareCost
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>Monthly Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactMonthlySoftwareSavings
        )}</div>
                </div>
            </div>
        </div>

        <!-- Total Savings & ROI -->
        <div class="section">
            <h3 class="section-title">Total Savings & ROI</h3>
            <div class="total-savings-grid">
                <div class="savings-card">
                    <h4>Processing Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactMonthlyProcessingSavings
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>Software Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactMonthlySoftwareSavings
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>Total Monthly Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactTotalMonthlySavings
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>Combined Savings %</h4>
                    <div class="savings-value">${combinedSavingsPercent.toFixed(
            1
        )}%</div>
                </div>
                <div class="savings-card">
                    <h4>Annual Savings</h4>
                    <div class="savings-value">${formatCurrency(
            exactTotalMonthlySavings * 12
        )}</div>
                </div>
                <div class="savings-card">
                    <h4>ROI Period</h4>
                    <div class="savings-value">${(
            (calculatedValues?.returnOnInvestmentMonths ||
                calculatedValues?.roiMonths ||
                0) as number
        ).toFixed(2)} months</div>
                </div>
            </div>
        </div>
       
        <!-- Financing Options -->
<div class="section page-break">
    <h3 class="section-title">Financing Options</h3>
    <div class="overflow-x-auto">
        <table class="itemization-table w-full">
            <thead>
                <tr>
                    <th class="text-left py-2">Credit Tier</th>
                    <th class="text-left py-2">Down Payment</th>
                    <th class="text-right py-2">12 Months</th>
                    <th class="text-right py-2">24 Months</th>
                    <th class="text-right py-2">36 Months</th>
                    <th class="text-right py-2">48 Months</th>
                    <th class="text-right py-2">60 Months</th>
                </tr>
            </thead>
            <tbody>
                ${allFinancingOptions.length === 0
            ? `
                    <tr>
                        <td colspan="7" class="text-center py-4 text-gray-500">
                            No financing options available.
                        </td>
                    </tr>
                `
            : `
                    ${allFinancingOptions
                .map((option: any) => {
                    const terms = [
                        option.twelveMonths,
                        option.twentyFourMonths,
                        option.thirtySixMonths,
                        option.fortyEightMonths,
                        option.sixtyMonths,
                    ];

                    return `
                            <tr>
                                <td class="py-2">${option.creditTier}</td>
                                <td class="py-2">${option.downPayment
                            ? formatCurrency(option.downPayment) +
                            " Down"
                            : "0 Down"
                        }</td>
                                ${terms
                            .map(
                                (term: any) => `
                                    <td class="text-right py-2">
                                        ${term !== null
                                        ? `$${calculateFinancialOptions(
                                            Number(exactTotalDue || 0),
                                            Number(option.downPayment || 0),
                                            Number(term || 0)
                                        )}`
                                        : `<span class="text-red-600">X</span>`
                                    }
                                    </td>
                                `
                            )
                            .join("")}
                            </tr>
                        `;
                })
                .join("")}
                `
        }
            </tbody>
        </table>
    </div>
</div>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for considering Dynamic Merchant Processing</p>
            <p>Questions? Contact us at support@dmprocessing.com or (256) 835-6001</p>
        </div>
    </div>
</body>
</html>
  `;
}
