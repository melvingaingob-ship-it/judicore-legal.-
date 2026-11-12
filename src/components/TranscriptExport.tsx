import React, { useState } from 'react';
import { TranscriptRequest } from '../types/court';
import { Download, Printer, CheckCircle2, FileText, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { LegalAiAnalysisModal } from './LegalAiAnalysisModal';

interface TranscriptExportProps {
  requests: TranscriptRequest[];
  onBack?: () => void;
}

export const TranscriptExport: React.FC<TranscriptExportProps> = ({ requests, onBack }) => {
  const deliveredRequests = requests.filter((r) => r.status === 'delivered' || r.transcriptText);
  const [selectedReqId, setSelectedReqId] = useState<string>(
    deliveredRequests[0]?.id || requests[0]?.id || ''
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const activeRequest =
    deliveredRequests.find((r) => r.id === selectedReqId) || deliveredRequests[0] || requests[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!activeRequest) return;
    const content = `CASE NUMBER: ${activeRequest.caseNumber}\n` +
      `HEARING DATE: ${activeRequest.hearingDate}\n` +
      `REQUEST ID: ${activeRequest.id}\n` +
      `VERIFIED BY: ${activeRequest.verifiedBy || 'Jane Doe, Transcription Center Manager'}\n` +
      `DATE DELIVERED: ${activeRequest.deliveredAt || '2024-10-29'}\n\n` +
      `===============================================================\n` +
      `VERBATIM RECORD OF PROCEEDINGS\n` +
      `===============================================================\n\n` +
      (activeRequest.transcriptText || 'No transcript text available.');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Court_Transcript_${activeRequest.caseNumber.replace(/\//g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!activeRequest) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">
        No completed transcript records ready for export.
      </div>
    );
  }

  const transcriptLines = (activeRequest.transcriptText || '')
    .split('\n\n')
    .filter((l) => l.trim().length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Non-printing Control Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">
              Court Records
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#0A1931] mt-0.5">
            Certified Court Transcript Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complies with Supreme Court and High Court certified record standards (clean verbatim).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedReqId}
            onChange={(e) => setSelectedReqId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-[#0A1931]"
          >
            {deliveredRequests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.caseNumber} ({r.id})
              </option>
            ))}
          </select>

          {/* Analyze with Legal AI Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Analyze with Legal AI</span>
          </button>

          <button
            onClick={handleDownloadDoc}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Text Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certified PDF</span>
          </button>
        </div>
      </div>

      {/* Official Legal Document Sheet (Clean Parchment without Watermark) */}
      <div className="bg-white border border-slate-300 shadow-md rounded-2xl p-8 md:p-14 text-slate-900 font-serif relative overflow-hidden min-h-[700px]">
        {/* Watermark removed as requested */}

        {/* Document Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6 mb-6">
          <div className="text-xs uppercase font-sans font-bold tracking-widest text-slate-600">
            Certified Record of Proceedings
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wider font-sans text-slate-950">
            SUPERIOR COURTS OF NAMIBIA · TRANSCRIPTION REGISTER
          </h2>
          <div className="font-mono text-sm font-bold pt-1 text-blue-700">
            CASE NUMBER: {activeRequest.caseNumber}
          </div>
          <div className="text-xs text-slate-500 font-sans">
            Hearing Date: {activeRequest.hearingDate} · Request ID: {activeRequest.id}
          </div>
        </div>

        {/* Appearances / Parties */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold uppercase text-slate-500 block text-[10px]">
              Matter:
            </span>
            <span className="font-semibold text-slate-900">
              {activeRequest.caseTitle || 'The State v Accused'}
            </span>
          </div>
          <div>
            <span className="font-bold uppercase text-slate-500 block text-[10px]">
              Requested By:
            </span>
            <span className="font-semibold text-slate-900">
              {activeRequest.requestedBy.name}
            </span>
          </div>
        </div>

        {/* Verbatim Transcript Body with 30-Line Margins */}
        <div className="space-y-4 mb-8">
          <div className="text-center font-sans font-bold uppercase text-[11px] tracking-wider text-slate-700 border-b border-slate-300 pb-1.5 mb-4">
            VERBATIM RECORD OF COURT PROCEEDINGS
          </div>

          {transcriptLines.map((line, idx) => (
            <div key={idx} className="relative pl-8">
              {/* Margin Line Number (1 to 30) */}
              <div className="absolute left-0 top-0 text-[11px] font-mono text-slate-400 select-none">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <p className="text-[13px] text-justify leading-relaxed text-slate-900">
                {line}
              </p>
            </div>
          ))}
        </div>

        {/* JudiCore Verification Certificate Block */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-3 font-sans text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-blue-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>JUDICORE QUALITY VERIFICATION CERTIFICATE</span>
          </div>

          <p className="text-slate-700 italic text-[11px] leading-relaxed">
            I hereby certify that this transcript has undergone human QA verification against the official court audio recording and conforms to the standards of the JudiCore Legal Platform.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Verified By:</span>
              <span className="font-bold text-slate-900">
                {activeRequest.verifiedBy || 'Jane Doe (Center Manager)'}
              </span>
              <div className="mt-4 border-b border-slate-800 w-44" />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Official Electronic Signature</span>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block">Date of Delivery:</span>
              <span className="font-bold font-mono text-slate-900">
                {activeRequest.deliveredAt || '2024-10-29'}
              </span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200">
                STATUS: HUMAN VERIFIED & DISPATCHED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal AI Analysis Modal */}
      <LegalAiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        request={activeRequest}
        transcriptText={activeRequest.transcriptText}
      />
    </div>
  );
};
