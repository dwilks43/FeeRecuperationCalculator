import { Quote, QuoteLineItem, PosItem } from '@shared/schema';
import PDFDocument from 'pdfkit';

export async function generateQuotePdf(
  quote: Quote, 
  lineItems: QuoteLineItem[], 
  posItem?: PosItem | null
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        size: 'A4'
      });
      
      // Collect the PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Add content to the PDF
      addQuotePdfContent(doc, quote, lineItems, posItem);
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addQuotePdfContent(
  doc: PDFKit.PDFDocument, 
  quote: Quote, 
  lineItems: QuoteLineItem[], 
  posItem?: PosItem | null
) {
  // Add header with logo and quote details
  addHeader(doc, quote);
  
  // Add merchant information
  addMerchantInfo(doc, quote);
  
  // Add selected POS system information
  if (posItem) {
    addPosInfo(doc, posItem);
  }
  
  // Add quote line items table
  addLineItemsTable(doc, lineItems);
  
  // Add quote summary with subtotal, tax, and total
  addQuoteSummary(doc, quote);
  
  // Add terms and conditions
  addTermsAndConditions(doc);
  
  // Add footer with page numbers
  addFooter(doc);
}

function addHeader(doc: PDFKit.PDFDocument, quote: Quote) {
  // Add company logo
  // doc.image('path/to/logo.png', 50, 45, { width: 150 });
  
  // Add company name instead of logo
  doc.font('Helvetica-Bold')
     .fontSize(18)
     .text('DMP Sales Platform', 50, 50);
  
  doc.font('Helvetica')
     .fontSize(10)
     .text('123 Business Ave', 50, 75)
     .text('Cityville, ST 12345', 50, 90)
     .text('Phone: (555) 123-4567', 50, 105);
  
  // Add quote title and info
  doc.font('Helvetica-Bold')
     .fontSize(24)
     .text('QUOTE', 400, 50, { align: 'right' });
  
  doc.font('Helvetica')
     .fontSize(10)
     .text(`Quote #: ${quote.id}`, 400, 80, { align: 'right' })
     .text(`Date: ${formatDate(quote.createdAt)}`, 400, 95, { align: 'right' })
     .text(`Status: ${formatStatus(quote.status)}`, 400, 110, { align: 'right' });
  
  // Add horizontal line
  doc.moveTo(50, 130).lineTo(550, 130).stroke();
}

function addMerchantInfo(doc: PDFKit.PDFDocument, quote: Quote) {
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Prepared For:', 50, 150);
  
  doc.font('Helvetica')
     .fontSize(10)
     .text(quote.merchantName, 50, 170);
  
  if (quote.merchantEmail) {
    doc.text(`Email: ${quote.merchantEmail}`, 50, 185);
  }
  
  // Add space after merchant info
  doc.moveDown(2);
}

function addPosInfo(doc: PDFKit.PDFDocument, posItem: PosItem) {
  const yPos = doc.y;
  
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .text('Itemized Costs', 50, yPos);
  
  doc.moveDown(0.5);
  
  // Table header
  const headerY = doc.y;
  const startX = 50;
  const colWidths = [300, 80, 80];
  
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Item Description', startX, headerY);
  doc.text('Type', startX + colWidths[0], headerY);
  doc.text('Cost', startX + colWidths[0] + colWidths[1], headerY);
  
  doc.moveDown(0.5);
  let currentY = doc.y;
  
  // Draw a line
  doc.moveTo(startX, currentY).lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2], currentY).stroke();
  doc.moveDown(0.5);
  
  // Reset font
  doc.font('Helvetica');
  
  // Add POS system as line item
  currentY = doc.y;
  doc.text(`${posItem.name} - ${posItem.description || 'Point of Sale System'}`, 
    startX, currentY, { width: colWidths[0] - 10 });
  doc.text('POS System', startX + colWidths[0], currentY);
  doc.text('$0.00', startX + colWidths[0] + colWidths[1], currentY);
  
  doc.moveDown(1);
  
  // Add monthly software cost as a separate line
  // Since we don't have direct monthlySoftwareCost in the PosItem type, we use a fixed cost or 0
  const softwareCost = 0; // This will be handled by QuoteLineItems instead
  
  currentY = doc.y;
  doc.text('Monthly Software Subscription', 
    startX, currentY, { width: colWidths[0] - 10 });
  doc.text('Recurring', startX + colWidths[0], currentY);
  doc.text(`$${formatCurrency(softwareCost)}`, 
    startX + colWidths[0] + colWidths[1], currentY);
  
  doc.moveDown(1);
  
  // Draw a bottom line
  currentY = doc.y;
  doc.moveTo(startX, currentY).lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2], currentY).stroke();
  
  doc.moveDown(1);
}

function addLineItemsTable(doc: PDFKit.PDFDocument, lineItems: QuoteLineItem[]) {
  const yPos = doc.y;
  
  // Add table headers
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .text('Item', 50, yPos)
     .text('Description', 180, yPos)
     .text('Qty', 350, yPos, { width: 40, align: 'right' })
     .text('Unit Price', 400, yPos, { width: 70, align: 'right' })
     .text('Total', 480, yPos, { width: 70, align: 'right' });
  
  // Add horizontal line below headers
  doc.moveTo(50, yPos + 20).lineTo(550, yPos + 20).stroke();
  
  // Add line items
  let currentY = yPos + 30;
  lineItems.forEach((item) => {
    const itemHeight = 20; // Adjust based on content
    
    doc.font('Helvetica')
       .fontSize(10)
       .text(item.itemName, 50, currentY, { width: 120 })
       .text(item.description || '', 180, currentY, { width: 160 })
       .text(item.quantity.toString(), 350, currentY, { width: 40, align: 'right' })
       .text(`$${formatCurrency(item.unitPrice)}`, 400, currentY, { width: 70, align: 'right' })
       .text(`$${formatCurrency(item.totalPrice)}`, 480, currentY, { width: 70, align: 'right' });
    
    currentY += itemHeight;
  });
  
  // Add horizontal line below items
  doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke();
  
  // Update doc position
  doc.y = currentY + 20;
}

function addQuoteSummary(doc: PDFKit.PDFDocument, quote: Quote) {
  const yPos = doc.y;
  
  // Add summary table
  doc.font('Helvetica')
     .fontSize(10)
     .text('Subtotal:', 400, yPos, { width: 70, align: 'right' })
     .text(`$${formatCurrency(quote.subtotal)}`, 480, yPos, { width: 70, align: 'right' });
  
  doc.text(`Tax (${quote.taxRate}%):`, 400, yPos + 20, { width: 70, align: 'right' })
     .text(`$${formatCurrency(quote.tax)}`, 480, yPos + 20, { width: 70, align: 'right' });
  
  // Add total with emphasis
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .text('TOTAL:', 400, yPos + 45, { width: 70, align: 'right' })
     .text(`$${formatCurrency(quote.totalAmount)}`, 480, yPos + 45, { width: 70, align: 'right' });
  
  // Update doc position
  doc.y = yPos + 70;
}

function addTermsAndConditions(doc: PDFKit.PDFDocument) {
  const yPos = doc.y;
  
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .text('Terms and Conditions', 50, yPos);
  
  doc.font('Helvetica')
     .fontSize(9)
     .text('1. This quote is valid for 30 days from the date of issue.', 50, yPos + 20)
     .text('2. Payment terms: 50% deposit required to initiate order, remainder due upon delivery.', 50, yPos + 35)
     .text('3. Prices do not include installation or training unless explicitly stated.', 50, yPos + 50)
     .text('4. All pricing is subject to applicable sales tax.', 50, yPos + 65);
  
  // Update doc position
  doc.y = yPos + 90;
}

function addFooter(doc: PDFKit.PDFDocument) {
  const pageCount = doc.bufferedPageRange().count;
  let i;
  for (i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Add page number at the bottom
    doc.font('Helvetica')
       .fontSize(8)
       .text(
         `Page ${i + 1} of ${pageCount}`, 
         50, 
         doc.page.height - 50,
         { align: 'center', width: doc.page.width - 100 }
       );
    
    // Add company info at the bottom
    doc.text(
      'DMP Sales Platform • www.dmpsales.example.com • (555) 123-4567',
      50,
      doc.page.height - 35,
      { align: 'center', width: doc.page.width - 100 }
    );
  }
}

// Helper functions
function formatDate(date: Date): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
