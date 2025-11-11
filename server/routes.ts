import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from 'crypto';
import { storage } from "./storage";

function generateISOAmpLoginLink(
  email: string,
  name: string,
  destination: string = "/dustin"
): string {
  const secretKey = process.env.ISO_AMP_SECRET_KEY;
  if (!secretKey) {
    throw new Error("ISO_AMP_SECRET_KEY not found in environment variables");
  }
  
  const message = {
    email: email,
    name: name,
    destination: destination,
  };
  
  // JSON stringify and hex encode
  const messageJson = JSON.stringify(message);
  const hexEncodedMessage = Buffer.from(messageJson).toString("hex");
  
  // Get Unix timestamp
  const unixTime = Math.floor(Date.now() / 1000);
  
  // Create message blob
  const version = "1";
  const messageBlob = hexEncodedMessage + unixTime + version;
  
  // Generate HMAC signature
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(messageBlob)
    .digest("hex");
  
  // Build URL
  const baseUrl = "https://dmprocessing.isoquote.com/login_via_link";
  return `${baseUrl}?m=${hexEncodedMessage}&s=${signature}&t=${unixTime}&v=${version}`;
}

async function sendSavingsReportEmail(toEmails: string[], ccEmails: string[], calculatorData: any) {
  const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
  const verifiedSender = process.env.POSTMARK_VERIFIED_SENDER;
  
  if (!postmarkToken || !verifiedSender) {
    throw new Error('Postmark configuration missing');
  }

  // Generate PDF buffer
  const pdfBuffer = await generateSavingsReportPDF(calculatorData);
  
  // Convert PDF to base64 for attachment
  const pdfBase64 = pdfBuffer.toString('base64');
  
  const emailData = {
    From: verifiedSender,
    To: toEmails.join(','),
    Cc: ccEmails.join(','),
    Subject: 'Your DMP Dual Pricing Savings Report',
    HtmlBody: generateEmailHTML(calculatorData, verifiedSender),
    TextBody: generateEmailText(calculatorData, verifiedSender),
    Attachments: [{
      Name: 'DMP-Savings-Report.pdf',
      Content: pdfBase64,
      ContentType: 'application/pdf'
    }]
  };

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': postmarkToken
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Postmark API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

function generateEmailHTML(data: any, verifiedSender: string): string {
  const { monthlySavings, annualSavings, monthlyVolume, results } = data;
  const businessName = data.businessName || 'Valued Merchant';
  const salesRepName = data.salesRepName || 'Your Sales Representative';
  const salesRepEmail = data.salesRepEmail || 'quotes@dmprocessing.com';
  const salesRepPhone = data.salesRepPhone || '877-515-0028';
  
  // Build mailto link with CC for sales rep - properly encode subject
  const subject = encodeURIComponent('Request More Information about Processing Savings');
  let contactLink = `mailto:quotes@dmprocessing.com?subject=${subject}`;
  if (salesRepEmail && salesRepEmail !== 'quotes@dmprocessing.com') {
    contactLink += `&cc=${encodeURIComponent(salesRepEmail)}`;
  }
  
  // Use results data if available, fallback to root level data
  const savings = results?.monthlySavings || monthlySavings || 0;
  const annualSavingsValue = results?.annualSavings || annualSavings || 0;
  const volume = results?.monthlyVolume || monthlyVolume || 0;
  
  // Format numbers with commas
  const formatCurrency = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Create a properly formatted DMP logo as inline SVG HTML
  const logoHTML = `
    <div style="display: inline-block; padding: 10px 0;">
      <div style="display: flex; align-items: center; justify-content: center;">
        <div style="background: linear-gradient(135deg, #004ED3 0%, #0066FF 100%); color: white; padding: 8px 16px; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold; font-size: 18px; letter-spacing: 1px;">
          DMP
        </div>
        <div style="color: #0B2340; margin-left: 10px; font-family: Arial, sans-serif; font-size: 16px; font-weight: 600;">
          Dynamic Merchant Processing
        </div>
      </div>
    </div>`;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; 
            line-height: 1.6; 
            color: #0B2340;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #004ED3 0%, #2BD8C2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }
        .logo {
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
        }
        .content { 
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #0B2340;
            margin-bottom: 20px;
        }
        .highlight { 
            background: linear-gradient(135deg, #F7F9FC 0%, #E8F7F5 100%);
            border-left: 4px solid #00937B;
            padding: 25px;
            margin: 30px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 147, 123, 0.1);
        }
        .highlight h3 {
            margin-top: 0;
            color: #004ED3;
            font-size: 18px;
            font-weight: 600;
        }
        .savings-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
        }
        .savings-label {
            font-size: 14px;
            color: #6A6F7A;
            font-weight: 500;
        }
        .savings-value {
            font-size: 26px;
            font-weight: 700;
            color: #00937B;
        }
        .benefits-list {
            background: #F7F9FC;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .benefits-list ul {
            margin: 10px 0;
            padding-left: 0;
            list-style: none;
        }
        .benefits-list li {
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
            color: #0B2340;
            font-size: 15px;
        }
        .benefits-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #00937B;
            font-weight: bold;
            font-size: 18px;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .cta { 
            background: linear-gradient(135deg, #004ED3 0%, #0066FF 100%);
            color: white !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 50px;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 78, 211, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 78, 211, 0.4);
        }
        .signature {
            background: #0B2340;
            color: white;
            padding: 30px;
            margin-top: 40px;
        }
        .signature-grid {
            display: table;
            width: 100%;
        }
        .signature-col {
            display: table-cell;
            vertical-align: top;
            padding: 0 15px;
        }
        .signature-col:first-child {
            border-right: 1px solid rgba(255, 255, 255, 0.2);
        }
        .signature h4 {
            color: #2BD8C2;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 15px 0;
        }
        .signature p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.5;
        }
        .signature a {
            color: #2BD8C2;
            text-decoration: none;
        }
        .signature a:hover {
            text-decoration: underline;
        }
        .footer { 
            text-align: center;
            padding: 20px;
            background: #F7F9FC;
            color: #6A6F7A;
            font-size: 12px;
        }
        .footer-logo {
            font-weight: 700;
            color: #004ED3;
            font-size: 14px;
            margin-bottom: 5px;
        }
        @media only screen and (max-width: 600px) {
            .signature-grid { display: block; }
            .signature-col { 
                display: block; 
                padding: 15px 0;
                border-right: none !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            .signature-col:last-child { border-bottom: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                ${logoHTML}
            </div>
            <h1>Your Savings Report is Ready!</h1>
            <p>Personalized Payment Processing Analysis</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello ${businessName},</p>
            
            <p>Thank you for taking the time to explore how Dynamic Merchant Processing can transform your payment processing costs into profit. Based on your current processing volume and our proven Fee Recuperation Program, we're excited to show you the significant savings available to your business.</p>
            
            <div class="highlight">
                <h3>💰 Your Potential Impact:</h3>
                <div class="savings-row">
                    <span class="savings-label">Monthly Savings</span>
                    <span class="savings-value">$${formatCurrency(savings)}</span>
                </div>
                <div class="savings-row">
                    <span class="savings-label">Annual Savings</span>
                    <span class="savings-value">$${formatCurrency(annualSavingsValue)}</span>
                </div>
            </div>
            
            <div class="benefits-list">
                <p><strong>Your Detailed PDF Report (attached) includes:</strong></p>
                <ul>
                    <li>Complete breakdown of your current vs. new processing costs</li>
                    <li>Line-by-line analysis of fees and savings</li>
                    <li>Customized implementation roadmap for your business</li>
                    <li>Real numbers based on your actual processing volume</li>
                </ul>
            </div>
            
            <p style="font-size: 16px; color: #0B2340; margin-top: 30px;">
                <strong>What makes Dynamic different?</strong> We don't just process payments – we partner with you to ensure every transaction adds to your bottom line, not your expenses.
            </p>
            
            <div class="cta-section">
                <p style="color: #6A6F7A; margin-bottom: 20px;">Ready to keep more of what you earn?</p>
                <a href="${contactLink}" class="cta">Start Saving Today →</a>
                <p style="color: #6A6F7A; font-size: 13px; margin-top: 15px;">
                    Or simply reply to this email to schedule a consultation
                </p>
            </div>
        </div>
        
        <div class="signature">
            <div class="signature-grid">
                <div class="signature-col">
                    <h4>Your Sales Representative</h4>
                    <p><strong>${salesRepName}</strong></p>
                    <p><a href="mailto:${salesRepEmail}">${salesRepEmail}</a></p>
                    <p>📞 ${salesRepPhone}</p>
                </div>
                <div class="signature-col">
                    <h4>Corporate Headquarters</h4>
                    <p><strong>Dynamic Merchant Processing</strong></p>
                    <p>1323 Hamric Dr E, Suite C<br>Oxford, AL 36203</p>
                    <p><a href="mailto:info@dmprocessing.com">info@dmprocessing.com</a></p>
                    <p>📞 877-515-0028</p>
                    <p><a href="https://dmprocessing.com">www.dmprocessing.com</a></p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">DYNAMIC MERCHANT PROCESSING</div>
            <p>Professional Payment Solutions Since 2003</p>
            <p style="margin-top: 15px;">This report was generated using your provided data and DMP's proven dual pricing model.<br>
            All calculations are estimates based on the information provided.</p>
        </div>
    </div>
</body>
</html>`;
}

function generateEmailText(data: any, verifiedSender: string): string {
  const { monthlySavings, annualSavings, monthlyVolume, results } = data;
  const businessName = data.businessName || 'Valued Merchant';
  const salesRepName = data.salesRepName || 'Your Sales Representative';
  const salesRepEmail = data.salesRepEmail || 'quotes@dmprocessing.com';
  const salesRepPhone = data.salesRepPhone || '877-515-0028';
  
  // Use results data if available, fallback to root level data
  const savings = results?.monthlySavings || monthlySavings || 0;
  const annualSavingsValue = results?.annualSavings || annualSavings || 0;
  const volume = results?.monthlyVolume || monthlyVolume || 0;
  
  // Format numbers with commas
  const formatCurrency = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return `
Hello ${businessName},

Thank you for taking the time to explore how Dynamic Merchant Processing can transform 
your payment processing costs into profit. Based on your current processing volume and 
our proven Fee Recuperation Program, we're excited to show you the significant savings 
available to your business.

═══════════════════════════════════════════
💰 YOUR POTENTIAL IMPACT
═══════════════════════════════════════════
Monthly Savings: $${formatCurrency(savings)}
Annual Savings:  $${formatCurrency(annualSavingsValue)}
═══════════════════════════════════════════

YOUR DETAILED PDF REPORT (attached) includes:
✓ Complete breakdown of your current vs. new processing costs
✓ Line-by-line analysis of fees and savings
✓ Customized implementation roadmap for your business
✓ Real numbers based on your actual processing volume

What makes Dynamic different? We don't just process payments – we partner with you 
to ensure every transaction adds to your bottom line, not your expenses.

Ready to keep more of what you earn? Contact us today to get started:
• Email: quotes@dmprocessing.com
• Phone: 877-515-0028
• Or simply reply to this email to schedule a consultation

────────────────────────────────────────────
YOUR SALES REPRESENTATIVE
────────────────────────────────────────────
${salesRepName}
Email: ${salesRepEmail}
Phone: ${salesRepPhone}

────────────────────────────────────────────
CORPORATE HEADQUARTERS
────────────────────────────────────────────
Dynamic Merchant Processing
1323 Hamric Dr E, Suite C
Oxford, AL 36203

Email: info@dmprocessing.com
Phone: 877-515-0028
Web: www.dmprocessing.com

═══════════════════════════════════════════
DYNAMIC MERCHANT PROCESSING
Professional Payment Solutions Since 2003
═══════════════════════════════════════════

This report was generated using your provided data and DMP's proven dual pricing model.
All calculations are estimates based on the information provided.
`;
}

import { LOGO_DATA_URL } from "./logo-loader.js";

async function generateSavingsReportPDF(data: any): Promise<Buffer> {
  const apiKey = process.env.DOCRAPTOR_API_KEY;
  if (!apiKey) {
    throw new Error('DOCRAPTOR_API_KEY not configured');
  }
  
  const { generateConfigDrivenPDF } = await import('./pdf-generator-v1.7.0');
  const htmlContent = generateConfigDrivenPDF(data);
  
  const docConfig = {
    document_type: 'pdf',
    document_content: htmlContent,
    name: 'DMP-Savings-Report.pdf',
    test: false, // Production mode
    prince_options: {
      media: 'print',
      pdf_profile: '1.7',
      pdf_title: 'DMP Dual Pricing Savings Report',
      pdf_author: 'Dynamic Merchant Processing',
      jpeg_quality: 100,
      png_quality: 100
    }
  };

  const response = await fetch('https://api.docraptor.com/docs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`
    },
    body: JSON.stringify({ doc: docConfig })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DocRaptor API error: ${response.status} - ${error}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function generateSavingsReportHTML(data: any): string {
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
    <title>DMP Dual Pricing Savings Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1f2937;
            background: white;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        
        .container {
            width: 7.5in;
            margin: 0 auto;
            padding: 0.5in;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .company-name {
            font-size: 18pt;
            font-weight: 700;
            color: #0ea5e9;
            line-height: 1.2;
            margin-bottom: 0.5rem;
        }
        
        .report-title {
            font-size: 14pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.25rem;
        }
        
        .report-meta {
            font-size: 12pt;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        
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
            font-size: 10pt;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
        }
        
        .summary-card .value {
            font-size: 18pt;
            font-weight: 700;
            color: #004ED3;
        }
        
        .savings-positive { color: #059669; }
        .savings-negative { color: #dc2626; }
        
        .section {
            margin-bottom: 3rem;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16pt;
            font-weight: 700;
            color: #0ea5e9;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .input-table, .results-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            margin-bottom: 1rem;
        }
        
        .input-table th, .results-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
            padding: 0.75rem;
            text-align: left;
            border-bottom: 2px solid #d1d5db;
        }
        
        .input-table td, .results-table td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
        }
        
        .input-table tr:hover, .results-table tr:hover {
            background: #f9fafb;
        }
        
        .total-row {
            background: #f8fafc !important;
            font-weight: 600;
        }
        
        .financial-cards {
            display: table;
            width: 100%;
            margin: 1rem 0;
        }
        
        .financial-card {
            display: table-cell;
            width: 33.33%;
            padding: 2rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            text-align: center;
            margin-right: 1rem;
        }
        
        .financial-card:last-child {
            margin-right: 0;
        }
        
        .financial-card h4 {
            font-size: 12pt;
            color: #6b7280;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .financial-card .amount {
            font-size: 20pt;
            font-weight: 700;
            color: #0ea5e9;
        }
        
        .savings-amount { color: #22c55e !important; }
        .cost-amount { color: #f59e0b !important; }
        
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer .main-text {
            font-size: 11pt;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .footer .contact-info {
            font-size: 10pt;
            color: #6b7280;
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .data-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .data-row:last-child {
            border-bottom: none;
        }
        
        .data-label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .data-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        .footer {
            margin-top: 2rem;
            text-align: center;
            color: #6b7280;
            font-size: 9pt;
        }
        
        @media print {
            .container { width: 100%; margin: 0; padding: 0.25in; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">
                Dynamic Merchant<br>
                Processing
            </div>
            <div class="report-title">Dual Pricing Savings Report</div>
            <div class="report-meta">Report Date: ${new Date().toLocaleDateString()}</div>
        </div>
        
        ${businessName ? `
        <!-- Quote Summary Section -->
        <div class="section">
            <h2 class="section-title" style="text-align: center; font-size: 14pt; font-weight: 700; color: #374151; margin-bottom: 1.5rem; letter-spacing: 2px;">
                QUOTE SUMMARY
            </h2>
            <div style="margin-bottom: 2rem;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
                    <tbody>
                        ${businessName ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151; width: 35%;">Business Name:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${businessName}</td>
                        </tr>
                        ` : ''}
                        ${contactName ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Contact:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${contactName}</td>
                        </tr>
                        ` : ''}
                        ${contactTitle ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Contact Title:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${contactTitle}</td>
                        </tr>
                        ` : ''}
                        ${contactEmail ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Email:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${contactEmail}</td>
                        </tr>
                        ` : ''}
                        ${salesRepName ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Sales Rep:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${salesRepName}</td>
                        </tr>
                        ` : ''}
                        ${salesRepPhone ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Phone Number:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${salesRepPhone}</td>
                        </tr>
                        ` : ''}
                        ${businessAddress ? `
                        <tr>
                            <td style="padding: 0.4rem 0; font-weight: 600; color: #374151;">Address:</td>
                            <td style="padding: 0.4rem 0; color: #1f2937;">${businessAddress}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        

        
        <!-- Input Parameters -->
        <div class="section">
            <h2 class="section-title">Merchant Information</h2>
            <table class="input-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Monthly Credit Card Volume</td>
                        <td>$${monthlyVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
        
        <!-- Processing Analysis -->
        <div class="section">
            <h2 class="section-title">Processing Analysis</h2>
            <div class="financial-cards">
                <div class="financial-card">
                    <h4>Current Monthly Cost</h4>
                    <div class="amount cost-amount">$${currentCost.toFixed(2)}</div>
                </div>
                <div class="financial-card">
                    <h4>New Monthly Cost</h4>
                    <div class="amount ${newCost >= 0 ? 'cost-amount' : 'savings-amount'}">
                        $${Math.abs(newCost).toFixed(2)}${newCost < 0 ? ' Credit' : ''}
                    </div>
                </div>
                <div class="financial-card">
                    <h4>Monthly Savings</h4>
                    <div class="amount savings-amount">$${monthlySavings.toFixed(2)}</div>
                </div>
            </div>
            
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Volume Breakdown</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Volume</td>
                        <td>$${baseVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td>Adjusted Card Volume</td>
                        <td>$${adjustedVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
        
        ${dmpProfit !== null ? `
        <!-- DMP Profitability -->
        <div class="section">
            <h2 class="section-title">DMP Profitability Analysis</h2>
            <div class="financial-cards">
                <div class="financial-card">
                    <h4>DMP Gross Profit</h4>
                    <div class="amount">$${dmpProfit.toFixed(2)}</div>
                    <p style="font-size: 8pt; color: #6b7280; margin-top: 0.5rem;">
                        (without removal of schedule A or ISO % charged)
                    </p>
                </div>
                ${data.skytabBonus ? `
                <div class="financial-card">
                    <h4>Skytab Bonus (Gross)</h4>
                    <div class="amount savings-amount">$${data.skytabBonus.toFixed(2)}</div>
                    <p style="font-size: 8pt; color: #6b7280; margin-top: 0.5rem;">
                        18-month bonus calculation, capped at $10,000
                    </p>
                </div>
                ` : ''}
                ${data.skytabBonusRep ? `
                <div class="financial-card">
                    <h4>Skytab Bonus (Rep 50%)</h4>
                    <div class="amount" style="color: #7c3aed;">$${data.skytabBonusRep.toFixed(2)}</div>
                    <p style="font-size: 8pt; color: #6b7280; margin-top: 0.5rem;">
                        Rep commission at 50% of gross bonus
                    </p>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
            <div class="main-text">Thank you for considering Dynamic Merchant Processing for your payment processing needs.</div>
            <div class="contact-info">Questions? Contact us at info@dmprocessing.com or call (555) 123-4567</div>
        </div>
    </div>
</body>
</html>
  `;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ISO Amp One-Click Login Route
  app.get("/api/iso-amp-quote", (req, res) => {
    try {
      const loginLink = generateISOAmpLoginLink(
        "dustin@dmprocessing.com",  // Sales rep email
        "Dustin Wilkins",           // Sales rep name  
        "/dustin"                   // ISO Amp destination path
      );
      res.redirect(loginLink);
    } catch (error) {
      console.error("Error generating ISO Amp link:", error);
      res.status(500).send("Error connecting to ISO Amp");
    }
  });

  // Logo validation endpoint for testing
  app.get("/api/validate-logo", async (req, res) => {
    try {
      if (!LOGO_DATA_URL) {
        return res.status(500).json({ 
          success: false, 
          error: "Logo not loaded",
          details: "Logo data URL is empty" 
        });
      }

      // Extract base64 data and validate
      const base64Data = LOGO_DATA_URL.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      res.json({ 
        success: true, 
        logoSize: buffer.length,
        base64Length: base64Data.length,
        dataUrlPreview: LOGO_DATA_URL.substring(0, 100) + "...",
        validation: "Logo data loaded and validated successfully"
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Logo validation failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // DocRaptor PDF Generation Route
  app.post("/api/generate-savings-report", async (req, res) => {
    try {
      const calculatorData = req.body;
      
      console.log('🔍 [ROUTES] Received programType:', calculatorData.programType);
      console.log('🔍 [ROUTES] Received metrics.programType:', calculatorData.metrics?.programType);
      console.log('🔍 [ROUTES] Received ui.sections.salesImpact.programType:', calculatorData.ui?.sections?.salesImpact?.programType);
      
      // Ensure we forward programType, inputs, and results for dual-mode support
      const pdfData = {
        ...calculatorData,
        programType: calculatorData.programType,
        inputs: calculatorData.inputs || {},
        results: calculatorData.results || {},
        // Add logo data for PDF header
        logoBase64: LOGO_DATA_URL
      };
      
      console.log('🔍 [ROUTES] pdfData.programType before sending to generator:', pdfData.programType);
      console.log('🔍 [ROUTES] pdfData.metrics.programType before sending to generator:', pdfData.metrics?.programType);
      
      // Log the exact payload for debugging (without the large base64 logo)
      const payloadForLogging = { ...pdfData, logoBase64: '[BASE64_LOGO_DATA_REDACTED]' };
      console.log('EXACT PDF PAYLOAD:', JSON.stringify(payloadForLogging, null, 2));
      
      // Generate PDF using DocRaptor
      const pdfBuffer = await generateSavingsReportPDF(pdfData);
      
      // Create filename with business name and timestamp
      const businessName = calculatorData.businessName || 'Business';
      const safeName = businessName.replace(/[^a-zA-Z0-9]/g, '_'); // Replace special chars with underscore
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      const filename = `DMP_Fee_Recovery_Report_${safeName}_${timestamp}.pdf`;
      
      // Send PDF as download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation failed:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  // Email PDF Report Route
  app.post("/api/email-savings-report", async (req, res) => {
    try {
      const { toEmails, ccEmails, calculatorData } = req.body;
      
      // Basic validation
      if (!toEmails || !Array.isArray(toEmails) || toEmails.length === 0) {
        return res.status(400).json({ error: 'At least one recipient email is required' });
      }
      
      if (!calculatorData) {
        return res.status(400).json({ error: 'Calculator data required' });
      }
      
      // Validate all email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const allEmails = [...toEmails, ...(ccEmails || [])];
      
      for (const email of allEmails) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: `Invalid email address: ${email}` });
        }
      }
      
      // Ensure we forward programType, inputs, and results for dual-mode support
      const emailData = {
        ...calculatorData,
        programType: calculatorData.programType,
        inputs: calculatorData.inputs || {},
        results: calculatorData.results || {},
        // Add logo data for PDF header
        logoBase64: LOGO_DATA_URL
      };
      
      // Send email with PDF attachment
      const result = await sendSavingsReportEmail(toEmails, ccEmails || [], emailData);
      
      res.json({ 
        success: true, 
        messageId: result.MessageID,
        message: 'Savings report sent successfully'
      });
      
    } catch (error) {
      console.error('Email sending failed:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
