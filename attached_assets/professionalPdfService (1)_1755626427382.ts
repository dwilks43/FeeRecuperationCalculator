// server/services/professionalPdfService.ts
// Professional PDF generation service with dedicated templates
// Zero impact on quote calculations or existing functionality

import { db } from "server/db";
import { QuoteDTO } from "../../shared/quoteDTO";
import { generateStep5StyleHtml } from "./step5PdfTemplate";
import { financingOptions } from "@shared/schema";

/**
 * Generate a professional PDF with completely redesigned template
 * This is a brand new visual design optimized specifically for print
 */
export async function generateProfessionalPdf(
    quote: QuoteDTO,
    quoteId?: number,
): Promise<Buffer> {
    // Get API key from environment
    const apiKey = process.env.DOCRAPTOR_API_KEY;
    if (!apiKey) {
        throw new Error("DOCRAPTOR_API_KEY not found in environment variables");
    }

    // Use quote ID from parameter or DTO
    const id = quoteId || quote.id;

    try {
        let docConfig: any;
        if (id) {
            // Use comprehensive professional template
            const previewUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "http://localhost:5000"}/api/quote/${id}/professional-preview`;

            docConfig = {
                doc: {
                    test: false, // Production mode - removes test document watermark
                    document_type: "pdf",
                    document_url: previewUrl,
                    name: `DMP-Quote-${quote.quoteNumber || id}.pdf`,
                    prince_options: {
                        media: "print",
                        baseurl: process.env.REPLIT_DOMAINS
                            ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
                            : "http://localhost:5000",
                        // Professional quality settings
                        pdf_profile: "1.7",
                        pdf_lang: "en-US",
                        pdf_title: `Dynamic Merchant Processing - Quote ${quote.quoteNumber || id}`,
                        pdf_author: "Dynamic Merchant Processing",
                        pdf_subject: "Payment Processing Proposal",
                        pdf_keywords:
                            "payment processing, merchant services, pos systems, proposal",
                        // Maximum quality settings
                        jpeg_quality: 100,
                        png_quality: 100,
                        svg_quality: 100,
                        // Professional typography
                        font_size: 11,
                        font_family:
                            '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        // Page settings
                        page_size: "Letter",
                        page_margin: "0.75in",
                    },
                },
            };
        } else {
            const allFinancingOptions = await db
                .select()
                .from(financingOptions);
            // LIVE QUOTE: Generate HTML directly for quotes without IDs using external image approach
            const baseUrl = process.env.REPLIT_DOMAINS
                ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
                : "http://localhost:5000";
            const htmlContent = generateStep5StyleHtml(
                quote,
                allFinancingOptions,
            );

            docConfig = {
                doc: {
                    test: false, // Production mode - removes test document watermark
                    document_type: "pdf",
                    document_content: htmlContent,
                    name: `DMP-Quote-${quote.quoteNumber || "Draft"}.pdf`,
                    prince_options: {
                        media: "print",
                        pdf_profile: "1.7",
                        pdf_lang: "en-US",
                        pdf_title: `Dynamic Merchant Processing - Quote ${quote.quoteNumber || "Draft"}`,
                        pdf_author: "Dynamic Merchant Processing",
                        pdf_subject: "Payment Processing Proposal",
                        pdf_keywords:
                            "payment processing, merchant services, pos systems, proposal",
                        jpeg_quality: 100,
                        png_quality: 100,
                        svg_quality: 100,
                        font_size: 11,
                        font_family:
                            '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                        page_size: "Letter",
                        page_margin: "0.75in",
                    },
                },
            };
        }
        const response = await fetch("https://api.docraptor.com/docs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
            },
            body: JSON.stringify(docConfig),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error("🔥 DocRaptor API error:", error);
            console.error("🔥 DocRaptor API status:", response.status);
            console.error("🔥 DocRaptor API status text:", response.statusText);
            throw new Error(`DocRaptor API error: ${error}`);
        }

        const pdfBuffer = Buffer.from(await response.arrayBuffer());
        return pdfBuffer;
    } catch (error) {
        console.error("Error generating professional PDF:", error);
        throw error;
    }
}

/**
 * Generate professional HTML template for live quotes
 */
export function generateProfessionalHtml(quote: QuoteDTO): string {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Merchant Processing - Quote ${quote.quoteNumber || "Draft"}</title>
    <style>
        ${getProfessionalStyles()}
    </style>
</head>
<body>
    <div class="quote-container">
        <!-- Header Section -->
        <header class="quote-header">
            <div class="company-branding">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzBlYTVlOSIvPg0KPHR0ZXh0IHg9IjEyMCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ETVAuPC90ZXh0Pg0KPC9zdmc+" class="company-logo" alt="DMP Logo" />
                <div class="company-text">
                    <h1 class="company-name">Dynamic Merchant Processing</h1>
                    <p class="company-tagline">Your Partner in Payment Solutions</p>
                </div>
            </div>
            <div class="quote-meta">
                <h2 class="quote-title">Payment Processing Proposal</h2>
                <div class="quote-details">
                    <p><strong>Quote #:</strong> ${quote.quoteNumber || "Draft"}</p>
                    <p><strong>Date:</strong> ${currentDate}</p>
                    <p><strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US")}</p>
                </div>
            </div>
        </header>

        <!-- Merchant Information -->
        <section class="section merchant-section">
            <h3 class="section-title">Merchant Information</h3>
            <div class="merchant-details">
                <div class="detail-row">
                    <span class="label">Business Name:</span>
                    <span class="value">${quote.merchant.name}</span>
                </div>
                ${quote.merchant.contactName
            ? `
                <div class="detail-row">
                    <span class="label">Contact:</span>
                    <span class="value">${quote.merchant.contactName}${quote.merchant.contactTitle ? `, ${quote.merchant.contactTitle}` : ""}</span>
                </div>
                `
            : ""
        }
                ${quote.merchant.email
            ? `
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${quote.merchant.email}</span>
                </div>
                `
            : ""
        }
                ${quote.merchant.phone
            ? `
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${quote.merchant.phone}</span>
                </div>
                `
            : ""
        }
                ${quote.merchant.address
            ? `
                <div class="detail-row">
                    <span class="label">Address:</span>
                    <span class="value">${quote.merchant.address}</span>
                </div>
                `
            : ""
        }
            </div>
        </section>

        <!-- Processing Overview -->
        <section class="section processing-section">
            <h3 class="section-title">Processing Overview</h3>
            <div class="processing-grid">
                <div class="processing-card">
                    <h4>Monthly Volume</h4>
                    <p class="processing-value">$${quote.processing.creditCardVolume?.toLocaleString() || "0"}</p>
                </div>
                <div class="processing-card">
                    <h4>Current Rate</h4>
                    <p class="processing-value">${quote.processing.currentRate || 0}%</p>
                </div>
                <div class="processing-card">
                    <h4>Proposed Rate</h4>
                    <p class="processing-value highlight">${quote.processing.proposedRate || 0}%</p>
                </div>
                <div class="processing-card savings">
                    <h4>Monthly Savings</h4>
                    <p class="processing-value savings-amount">$${quote.processing.monthlySavings?.toLocaleString() || "0"}</p>
                </div>
            </div>
        </section>

        ${generateHardwareSection(quote)}
        ${generateFinancialSection(quote)}

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

/**
 * Generate hardware section HTML
 */
function generateHardwareSection(quote: QuoteDTO): string {
    if (!quote.hardware?.items?.length) {
        return "";
    }

    let hardwareHtml = `
    <section class="section hardware-section">
        <h3 class="section-title">Recommended Equipment</h3>
        <table class="equipment-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
  `;

    quote.hardware.items.forEach((item) => {
        hardwareHtml += `
      <tr>
          <td class="item-name">${item.name || "Equipment Item"}</td>
          <td class="item-description">${item.description || "Professional equipment"}</td>
          <td class="item-qty">${item.quantity || 1}</td>
          <td class="item-price">$${(item.unitPrice || 0).toLocaleString()}</td>
          <td class="item-total">$${(item.totalPrice || 0).toLocaleString()}</td>
      </tr>
    `;
    });

    hardwareHtml += `
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="4" class="total-label">Equipment Total:</td>
                    <td class="total-amount">$${quote.totals?.totalHardware?.toLocaleString() || "0"}</td>
                </tr>
            </tfoot>
        </table>
    </section>
  `;

    return hardwareHtml;
}

/**
 * Generate financial summary section
 */
function generateFinancialSection(quote: QuoteDTO): string {
    return `
    <section class="section financial-section">
        <h3 class="section-title">Investment Summary</h3>
        <div class="financial-grid">
            <div class="financial-card">
                <h4>Equipment Investment</h4>
                <p class="financial-value">$${quote.totals?.totalHardware?.toLocaleString() || "0"}</p>
            </div>
            ${quote.totals?.merchantCredit
            ? `
            <div class="financial-card credit">
                <h4>Merchant Credit</h4>
                <p class="financial-value credit-amount">-$${quote.totals.merchantCredit.toLocaleString()}</p>
            </div>
            `
            : ""
        }
            <div class="financial-card total">
                <h4>Net Investment</h4>
                <p class="financial-value total-amount">$${quote.totals?.grandTotal?.toLocaleString() || "0"}</p>
            </div>
        </div>
        
        <div class="roi-section">
            <h4>Return on Investment</h4>
            <div class="roi-details">
                <p><strong>Monthly Processing Savings:</strong> $${quote.processing.monthlySavings?.toLocaleString() || "0"}</p>
                <p><strong>Annual Savings:</strong> $${((quote.processing.monthlySavings || 0) * 12).toLocaleString()}</p>
                ${quote.financial?.roi ? `<p><strong>ROI Period:</strong> ${quote.financial.roi?.toFixed(2)}</p>` : ""}
            </div>
        </div>
    </section>
  `;
}

/**
 * Professional CSS styles optimized for print
 */
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
