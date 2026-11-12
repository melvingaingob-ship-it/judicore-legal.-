import { jsPDF } from 'jspdf';
import { JudicialInvoice, UserProfile, CaseClass } from '../types/court';

export interface GovernmentBillingItem {
  caseNumber: string;
  caseClass?: CaseClass;
  requestedBy: string; // official name from login
  region?: string;
  town?: string;
  date: string;
  transcriptPages: number;
  duration?: string;
  rate: number;
  amount: number;
  legalAiService?: number;
}

export interface GovernmentBillingRecord {
  month: string;
  department: string;
  reference: string;
  treasuryCode: string;
  appliedTariffRate: number;
  ratePerPage?: number;
  items: GovernmentBillingItem[];
  subtotal: number;
  vat: number;
  total: number;
}

/**
 * Generates Consolidated Government Monthly Invoice PDF
 * Issuer: JUDICORE LEGAL SOLUTIONS (PTY) LTD (Private company, NOT government owned)
 * Client Gov: Ministry of Justice, Department of Judicial Court Services, VOTE-16 Judiciary
 * NO Republic coat of arms.
 */
export function generateGovernmentMinistryInvoicePDF(data: GovernmentBillingRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // --- NEW PRIVATE HEADER - DO NOT CHANGE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("JUDICORE LEGAL SOLUTIONS (PTY) LTD", 105, 20, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Private Court Transcription & Legal AI Services", 105, 26, { align: "center" });
  doc.setFontSize(8);
  doc.text("PO BOX 60788 WINDHOEK | TEL: 0818451323 | EMAIL: melvingaingaing@gmail.com", 105, 31, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("PRIVATE COMPANY - NOT GOVERNMENT OWNED - PRIVATE CONTRACTOR TO MINISTRY", 105, 36, { align: "center" });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(15, 40, 195, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("BILL TO:", 15, 48);
  doc.setFont("helvetica", "bold");
  doc.text("Ministry of Justice", 15, 52);
  doc.setFont("helvetica", "normal");
  doc.text("Department of Judicial Court Services", 15, 56);
  doc.text("Justitia Building, Independence Avenue, Private Bag 13302, Windhoek, Namibia", 15, 60);
  doc.text("VOTE-16 (Judiciary)", 15, 64);

  // TITLE
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CONSOLIDATED GOVERNMENT TRANSCRIPTION VOUCHER & INVOICE", 15, 72);

  // Account Reference & Cycle
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Reference: ${data.reference || 'MOJ-NAT-GOV-2024/25'}`, 15, 78);
  doc.text(`Billing Cycle: ${data.month || 'October 2024'}`, 85, 78);
  doc.text(`Gazetted Rate: N$ ${(data.appliedTariffRate || 35.0).toFixed(2)}/page`, 150, 78);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(15, 82, 195, 82);

  // Table Header
  const headers = [
    { title: 'Case Docket', width: 34 },
    { title: 'Class', width: 18 },
    { title: 'Requested Official', width: 38 },
    { title: 'Region/Town', width: 32 },
    { title: 'Date', width: 20 },
    { title: 'Pages', width: 16 },
    { title: 'Amount (NAD)', width: 22 },
  ];

  let y = 87;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, 180, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, 180, 7, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  let curX = margin + 2;
  headers.forEach((h) => {
    doc.text(h.title, curX, y + 4.8);
    curX += h.width;
  });

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const printFooter = () => {
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Issued by JUDICORE LEGAL SOLUTIONS (PTY) LTD - Private Contractor. Payment to JudiCore account. Not issued by Government.", 105, 285, { align: "center" });
  };

  data.items.forEach((item, index) => {
    if (y > pageHeight - 45) {
      printFooter();
      doc.addPage();
      y = 20;

      // Repeat Table Header on next page
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 180, 7, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, 180, 7, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);

      let repX = margin + 2;
      headers.forEach((h) => {
        doc.text(h.title, repX, y + 4.8);
        repX += h.width;
      });

      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, 180, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6.5, margin + 180, y + 6.5);

    curX = margin + 2;
    doc.setFont('helvetica', 'bold');
    doc.text(item.caseNumber, curX, y + 4.5);
    curX += headers[0].width;

    doc.setFont('helvetica', 'normal');
    doc.text((item.caseClass || 'criminal').toUpperCase(), curX, y + 4.5);
    curX += headers[1].width;

    doc.text(item.requestedBy.substring(0, 22), curX, y + 4.5);
    curX += headers[2].width;

    doc.text(`${item.town || 'Windhoek'}, ${item.region || 'Khomas'}`.substring(0, 18), curX, y + 4.5);
    curX += headers[3].width;

    doc.text(item.date, curX, y + 4.5);
    curX += headers[4].width;

    doc.text(String(item.transcriptPages), curX, y + 4.5);
    curX += headers[5].width;

    doc.setFont('helvetica', 'bold');
    doc.text(`N$ ${item.amount.toFixed(2)}`, curX, y + 4.5);

    y += 6.5;
  });

  y += 5;

  // Totals Box Right
  const totalsW = 70;
  const totalsX = margin + 180 - totalsW;
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX, y, totalsW, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(totalsX, y, totalsW, 22, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Subtotal:', totalsX + 4, y + 5.5);
  doc.text(`N$ ${data.subtotal.toFixed(2)}`, totalsX + totalsW - 4, y + 5.5, { align: 'right' });

  doc.text('Namibian VAT (15%):', totalsX + 4, y + 11);
  doc.text(`N$ ${data.vat.toFixed(2)}`, totalsX + totalsW - 4, y + 11, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Consolidated Total:', totalsX + 4, y + 17.5);
  doc.text(`N$ ${data.total.toFixed(2)}`, totalsX + totalsW - 4, y + 17.5, { align: 'right' });

  // Page Footer on final page
  printFooter();
  // --- END NEW HEADER ---

  doc.save(`JudiCore_MOJ_Consolidated_${(data.month || 'October_2024').replace(/\s+/g, '_')}.pdf`);
}

// Aliases to guarantee all lookup calls resolve to this function
export const generateGovernmentInvoice = generateGovernmentMinistryInvoicePDF;
export const createInvoicePDF = generateGovernmentMinistryInvoicePDF;
export const generateInvoicePDF = generateGovernmentMinistryInvoicePDF;
export const exportGovInvoice = generateGovernmentMinistryInvoicePDF;

/**
 * Generates an Individual Private Client Invoice PDF
 */
export function generatePrivateClientInvoicePDF(invoice: JudicialInvoice, userProfile?: UserProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('JUDICORE LEGAL SOLUTIONS (PTY) LTD', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(210, 225, 250);
  doc.text('Private Court Transcription Services', margin, 16);
  doc.text('PO BOX 60788 Windhoek | Tel 0818451323 | Email: melvingaingaing@gmail.com', margin, 21);
  doc.text('VAT No: 9948210-015 | Company Reg: 2019/0488', margin, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(253, 224, 71);
  doc.text('PRIVATE COMPANY - NOT GOVERNMENT OWNED', margin + 85, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - margin, 14, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(220, 230, 250);
  doc.text(invoice.invoiceNumber, pageWidth - margin, 20, { align: 'right' });
  doc.text(`Date: ${invoice.date}`, pageWidth - margin, 26, { align: 'right' });

  let y = 42;

  // Billed To
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (PRACTITIONER):', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`${invoice.billedTo.name} (${invoice.billedTo.firmOrDepartment || 'Private Practice'})`, margin + 4, y + 10.5);
  doc.text(`Jurisdiction: ${invoice.billedTo.town || 'Windhoek'}, ${invoice.billedTo.region || 'Khomas'} Region`, margin + 4, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.text('CASE DOCKET:', pageWidth / 2 + 10, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.caseNumber} - ${invoice.caseTitle || 'Court Proceedings'}`, pageWidth / 2 + 10, y + 10.5);
  doc.text(`Status: ${invoice.paymentStatus === 'paid' ? 'PAID / SETTLED' : 'PENDING PAYMENT'}`, pageWidth / 2 + 10, y + 15);

  y += 26;

  // Line Items
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Description', margin + 4, y + 5.5);
  doc.text('Qty / Pages', pageWidth - margin - 60, y + 5.5, { align: 'right' });
  doc.text('Unit Price', pageWidth - margin - 32, y + 5.5, { align: 'right' });
  doc.text('Total (NAD)', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;

  doc.setFont('helvetica', 'normal');
  invoice.lineItems.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);

    doc.text(item.description, margin + 4, y + 5);
    doc.text(String(item.quantity), pageWidth - margin - 60, y + 5, { align: 'right' });
    doc.text(`N$ ${item.unitPriceNad.toFixed(2)}`, pageWidth - margin - 32, y + 5, { align: 'right' });
    doc.text(`N$ ${item.totalNad.toFixed(2)}`, pageWidth - margin - 4, y + 5, { align: 'right' });
    y += 7;
  });

  y += 6;

  // Totals Box
  const totalsW = 65;
  const totalsX = pageWidth - margin - totalsW;
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX, y, totalsW, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(totalsX, y, totalsW, 22, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Subtotal:', totalsX + 4, y + 5.5);
  doc.text(`N$ ${invoice.subtotalNad.toFixed(2)}`, totalsX + totalsW - 4, y + 5.5, { align: 'right' });

  doc.text('Namibian VAT (15%):', totalsX + 4, y + 11);
  doc.text(`N$ ${invoice.vatNad.toFixed(2)}`, totalsX + totalsW - 4, y + 11, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total Due:', totalsX + 4, y + 17.5);
  doc.text(`N$ ${invoice.totalNad.toFixed(2)}`, totalsX + totalsW - 4, y + 17.5, { align: 'right' });

  y += 28;

  // Download Link Box with 7-day expiration notice
  doc.setFillColor(238, 242, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 16, 'F');
  doc.setDrawColor(199, 210, 254);
  doc.rect(margin, y, pageWidth - margin * 2, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text(`DOWNLOAD SECURE TRANSCRIPT: judicore.com.na/download/${invoice.requestId}`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Download link valid for 7 days upon payment release. High Court tamper-evident authentication applied.', margin + 4, y + 11);

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, 280, pageWidth - margin, 280);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Issued by JUDICORE LEGAL SOLUTIONS (PTY) LTD - Private Contractor. Payment to JudiCore account. Not issued by Government.',
    105,
    285,
    { align: 'center' }
  );

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
}
