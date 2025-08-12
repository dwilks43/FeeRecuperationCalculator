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

async function generateSavingsReportPDF(data: any): Promise<Buffer> {
  const apiKey = process.env.DOCRAPTOR_API_KEY;
  if (!apiKey) {
    throw new Error('DOCRAPTOR_API_KEY not configured');
  }
  
  const htmlContent = generateSavingsReportHTML(data);
  
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
            font-family: 'Segoe UI', sans-serif;
            font-size: 11pt;
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
            background: linear-gradient(135deg, #004ED3 0%, #0066FF 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 12pt;
            opacity: 0.9;
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
            margin-bottom: 2rem;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1.5rem;
        }
        
        .section h2 {
            font-size: 14pt;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 2px solid #004ED3;
            padding-bottom: 0.5rem;
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
            <h1>DMP Dual Pricing Savings Calculator</h1>
            <p>Your Potential Monthly Savings Analysis</p>
        </div>
        
        <!-- Executive Summary -->
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Current Cost</h3>
                <div class="value">$${currentCost.toFixed(2)}</div>
            </div>
            <div class="summary-card">
                <h3>New Cost</h3>
                <div class="value ${newCost >= 0 ? 'savings-negative' : 'savings-positive'}">
                    $${Math.abs(newCost).toFixed(2)}${newCost < 0 ? ' Credit' : ''}
                </div>
            </div>
            <div class="summary-card">
                <h3>Monthly Savings</h3>
                <div class="value savings-positive">$${monthlySavings.toFixed(2)}</div>
            </div>
        </div>
        
        <!-- Input Parameters -->
        <div class="section">
            <h2>Merchant Information</h2>
            <div class="data-grid">
                <div class="data-row">
                    <span class="data-label">Monthly Credit Card Volume</span>
                    <span class="data-value">$${monthlyVolume.toLocaleString()}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Current Processing Rate</span>
                    <span class="data-value">${currentRate}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Interchange Cost</span>
                    <span class="data-value">${interchangeCost}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Flat Rate Processing</span>
                    <span class="data-value">${flatRate}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Tax Rate</span>
                    <span class="data-value">${taxRate}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Tip Rate</span>
                    <span class="data-value">${tipRate}%</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Price Differential</span>
                    <span class="data-value">${priceDifferential}%</span>
                </div>
            </div>
        </div>
        
        <!-- Volume Breakdown -->
        <div class="section">
            <h2>Live Volume Breakdown</h2>
            <div class="data-grid">
                <div class="data-row">
                    <span class="data-label">Base Volume</span>
                    <span class="data-value">$${baseVolume.toLocaleString()}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Adjusted Card Volume</span>
                    <span class="data-value">$${adjustedVolume.toLocaleString()}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Total Processing Fees Charged</span>
                    <span class="data-value">$${processingFees.toFixed(2)}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Card Price Increase Collected</span>
                    <span class="data-value">$${markupCollected.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <!-- Savings Analysis -->
        <div class="section">
            <h2>Savings Analysis</h2>
            <div class="data-grid">
                <div class="data-row">
                    <span class="data-label">Current Processing Cost</span>
                    <span class="data-value">$${currentCost.toFixed(2)}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">New Processing Cost</span>
                    <span class="data-value ${newCost >= 0 ? 'savings-negative' : 'savings-positive'}">
                        $${Math.abs(newCost).toFixed(2)}${newCost < 0 ? ' Credit' : ''}
                    </span>
                </div>
                <div class="data-row">
                    <span class="data-label">Monthly Savings</span>
                    <span class="data-value savings-positive">$${monthlySavings.toFixed(2)}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Annual Impact</span>
                    <span class="data-value savings-positive">$${annualSavings.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        ${dmpProfit ? `
        <!-- DMP Profitability -->
        <div class="section">
            <h2>DMP Monthly Profitability</h2>
            <div class="data-row">
                <span class="data-label">DMP Monthly Profit</span>
                <span class="data-value">$${dmpProfit.toFixed(2)}</span>
            </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} by Dynamic Merchant Processing</p>
            <p>This report is based on the provided merchant data and DMP's dual pricing model.</p>
        </div>
    </div>
</body>
</html>`;
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

  // DocRaptor PDF Generation Route
  app.post("/api/generate-savings-report", async (req, res) => {
    try {
      const calculatorData = req.body;
      
      // Generate PDF using DocRaptor
      const pdfBuffer = await generateSavingsReportPDF(calculatorData);
      
      // Send PDF as download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="DMP-Savings-Report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation failed:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
