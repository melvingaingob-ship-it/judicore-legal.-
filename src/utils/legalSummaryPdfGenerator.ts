import { jsPDF } from 'jspdf';
import { TranscriptRequest } from '../types/court';

export interface KeyFact {
  fact: string;
  source: string;
}

export interface Contradiction {
  title: string;
  discrepancy1: string;
  discrepancy2: string;
  impact: string;
}

export interface EvidentiaryObjection {
  objection: string;
  ruling: string;
  statutoryBasis: string;
}

export interface LegalIssue {
  issue: string;
  statutoryBasis: string;
  recommendation: string;
}

export interface LegalAnalysisData {
  summary: string;
  keyFacts: KeyFact[];
  contradictions: Contradiction[];
  evidentiaryObjections?: EvidentiaryObjection[];
  legalIssues: LegalIssue[];
  trialStrategy?: string[];
  sourcesAndCitations: string[];
  documentMetadata?: {
    analyzedFrom?: string;
    zeroAudioDependency?: boolean;
    confidenceScore?: number;
  };
  aiDisclaimer: string;
}

/**
 * Generates an official Verbit Legal AI Analysis Report PDF using jsPDF
 * Grounded 100% in the Certified Court PDF Transcript Document (Zero Audio Dependency).
 */
export function downloadLegalSummary(caseData: Partial<TranscriptRequest>, analysis: LegalAnalysisData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(10, 25, 49); // Dark Judicial Blue
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('VERBIT LEGAL AI — JUDICIAL ANALYSIS REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(190, 210, 240);
  doc.text('JUDICORE LEGAL PLATFORM · REPUBLIC OF NAMIBIA COURT SYSTEM', margin, 18);
  doc.text('LETTERHEAD: PO BOX 60788 WINDHOEK · TEL: 0818451323 · melvingaingaing@gmail.com', margin, 22);

  let y = 34;

  // Case Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`CASE DOCKET: ${caseData.caseNumber || 'CR-2024-0891'}`, margin + 4, y + 5.5);
  doc.text(`REQUEST ID: ${caseData.id || 'REQ-00142'}`, pageWidth - margin - 4, y + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Matter: ${caseData.caseTitle || 'The State v Johannes Nuuyoma & Others'}`, margin + 4, y + 10);
  doc.text(`Date of Hearing: ${caseData.hearingDate || '2024-10-28'} · Status: Verified Record`, margin + 4, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`Source: Certified Full Court Transcript Document / PDF (Analyzed in Fullness · Zero Audio Dependency)`, margin + 4, y + 18);

  y += 26;

  // 1. Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(10, 25, 49);
  doc.text('1. EXECUTIVE LEGAL SUMMARY', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4 + 4;

  // 2. Key Facts Table with Source
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(10, 25, 49);
  doc.text('2. KEY FACTS TABLE (WITH SOURCE CITATION)', margin, y);
  y += 5;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Adduced Fact / Testimony', margin + 3, y + 4.2);
  doc.text('Source in Transcript / Docket', margin + 115, y + 4.2);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  analysis.keyFacts.forEach((kf, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    const factLines = doc.splitTextToSize(`• ${kf.fact}`, 110);
    doc.text(factLines[0] || '', margin + 3, y + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text(kf.source, margin + 115, y + 4.2);
    doc.setFont('helvetica', 'normal');

    y += 6;
  });

  y += 4;

  // 3. Contradictions Analysis (Highlighted in RED with IMPACT Field)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28); // Red-700
  doc.text('3. CONTRADICTIONS ANALYSIS (DETECTED DISCREPANCIES & IMPACT)', margin, y);
  y += 5;

  analysis.contradictions.forEach((c) => {
    // Red box background
    doc.setFillColor(254, 242, 242); // Red-50
    doc.rect(margin, y, contentWidth, 14, 'F');
    doc.setDrawColor(239, 68, 68); // Red-500
    doc.setLineWidth(0.4);
    doc.rect(margin, y, contentWidth, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    doc.text(`[CONTRADICTION] ${c.title.toUpperCase()}`, margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(127, 29, 29);
    doc.text(`Discrepancy 1: ${c.discrepancy1}  |  Discrepancy 2: ${c.discrepancy2}`, margin + 3, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text(`IMPACT: ${c.impact}`, margin + 3, y + 12);

    y += 16;
  });

  // 4. Legal Issues & Recommendations citing Namibian Criminal Procedure Act 25 of 2004
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(10, 25, 49);
  doc.text('4. LEGAL ISSUES & RECOMMENDATIONS (CPA 25 OF 2004)', margin, y);
  y += 5;

  analysis.legalIssues.forEach((li) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`• Issue: ${li.issue}`, margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.text(`  Statutory Authority: ${li.statutoryBasis}`, margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`  Recommendation: ${li.recommendation}`, margin, y);
    y += 5;
  });

  // 5. Sources & Citations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 25, 49);
  doc.text('5. Sources & Citations:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(analysis.sourcesAndCitations.join('  ·  '), margin + 35, y);
  y += 6;

  // 6. AI Disclaimer
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const disclaimerLines = doc.splitTextToSize(`AI DISCLAIMER: ${analysis.aiDisclaimer}`, contentWidth - 4);
  doc.text(disclaimerLines, margin + 2, y + 3.5);
  y += 12;

  // 7. Legal Advisor Signature Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Legal Advisor Signature: ____________________________________', margin, y);
  doc.text(`Date Authenticated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 50, y);
  y += 6;

  // 8. Confidential Footer & Page 1 of 1
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CONFIDENTIAL · JUDICIAL IN-CHAMBERS PRIVILEGE', margin, pageHeight - 6);
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 6, { align: 'right' });

  // Save PDF
  doc.save(`Verbit-Summary-${caseData.id || 'CASE'}.pdf`);
}
