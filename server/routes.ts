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
  const salesRepEmail = data.salesRepEmail || '';
  
  // Build mailto link with CC for sales rep
  const mailtoParams = new URLSearchParams({
    subject: 'Request More Information about Processing Savings'
  });
  if (salesRepEmail) {
    mailtoParams.append('cc', salesRepEmail);
  }
  const contactLink = `mailto:quotes@dmprocessing.com?${mailtoParams.toString()}`;
  
  // Use results data if available, fallback to root level data
  const savings = results?.monthlySavings || monthlySavings || 0;
  const annualSavingsValue = results?.annualSavings || annualSavings || 0;
  const volume = results?.monthlyVolume || monthlyVolume || 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #004ED3 0%, #0066FF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
        .highlight { background: #e8f4fd; border-left: 4px solid #004ED3; padding: 15px; margin: 20px 0; }
        .savings { font-size: 24px; font-weight: bold; color: #059669; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .cta { background: #004ED3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your DMP Savings Report</h1>
            <p>Personalized analysis from Dynamic Merchant Processing</p>
        </div>
        
        <div class="content">
            <p>Hello ${businessName},</p>
            
            <p>Thank you for providing your processing information for this quote.</p>
            
            <div class="highlight">
                <h3>Your Potential Savings:</h3>
                <div class="savings">Monthly: $${savings.toFixed(2)}</div>
                <div class="savings">Annual: $${annualSavingsValue.toFixed(2)}</div>
            </div>
            
            <p>Your detailed savings report is attached to this email as a PDF. This report includes:</p>
            <ul>
                <li>Complete breakdown of your current vs. new processing costs</li>
                <li>Volume analysis with dual pricing calculations</li>
                <li>Monthly and annual savings projections</li>
            </ul>
            
            <p>Ready to start saving? Our team is here to help you implement this solution.</p>
            
            <a href="${contactLink}" class="cta">Contact Us Today</a>
        </div>
        
        <div class="footer">
            <p>Dynamic Merchant Processing | Professional Payment Solutions</p>
            <p>This report was generated using your provided data and DMP's proven dual pricing model.</p>
        </div>
    </div>
</body>
</html>`;
}

function generateEmailText(data: any, verifiedSender: string): string {
  const { monthlySavings, annualSavings, monthlyVolume, results } = data;
  const businessName = data.businessName || 'Valued Merchant';
  
  // Use results data if available, fallback to root level data
  const savings = results?.monthlySavings || monthlySavings || 0;
  const annualSavingsValue = results?.annualSavings || annualSavings || 0;
  const volume = results?.monthlyVolume || monthlyVolume || 0;
  
  return `
Hello ${businessName},

Thank you for providing your processing information for this quote.

YOUR POTENTIAL SAVINGS:
Monthly: $${savings.toFixed(2)}
Annual: $${annualSavingsValue.toFixed(2)}

Your detailed savings report is attached to this email as a PDF. This report includes:
- Complete breakdown of your current vs. new processing costs
- Volume analysis with dual pricing calculations  
- Monthly and annual savings projections

Ready to start saving? Our team is here to help you implement this solution.

Contact us at: quotes@dmprocessing.com

Dynamic Merchant Processing | Professional Payment Solutions
This report was generated using your provided data and DMP's proven dual pricing model.
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
      
      // Ensure we forward programType, inputs, and results for dual-mode support
      const pdfData = {
        ...calculatorData,
        programType: calculatorData.programType,
        inputs: calculatorData.inputs || {},
        results: calculatorData.results || {},
        // Add logo data for PDF header
        logoBase64: LOGO_DATA_URL
      };
      
      // Log the exact payload for debugging (without the large base64 logo)
      const payloadForLogging = { ...pdfData, logoBase64: '[BASE64_LOGO_DATA_REDACTED]' };
      console.log('EXACT PDF PAYLOAD:', JSON.stringify(payloadForLogging, null, 2));
      
      // Generate PDF using DocRaptor
      const pdfBuffer = await generateSavingsReportPDF(pdfData);
      
      // Send PDF as download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="DMP-Savings-Report.pdf"');
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
