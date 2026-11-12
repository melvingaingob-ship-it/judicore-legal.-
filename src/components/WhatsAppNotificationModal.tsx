import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  X,
  Smartphone,
  Shield,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { TranscriptRequest } from '../types/court';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TranscriptRequest | null;
  onSentSuccess?: (log: any) => void;
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  request,
  onSentSuccess,
}) => {
  const [phone, setPhone] = useState('+264 81 248 990');
  const [isSending, setIsSending] = useState(false);
  const [sentLog, setSentLog] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const downloadLink = `https://judicore.com.na/download/${request.id}`;
  const amountText = `N$ ${(request.totalAmountNad || (request.pages || 30) * 35).toFixed(2)}`;
  const verifiedBy = request.verifiedBy || 'Jane Doe (Center Manager)';

  const templatePreview = `JudiCore: Your certified transcript for Case ${request.caseNumber} (${request.caseClass.toUpperCase()}) is ready! Region: ${request.region} (${request.town}). Download: ${downloadLink} Amount: ${amountText} (${request.pages || 30} pages x N$35). Verified by: ${verifiedBy}. Link valid for 7 days. Reply HELP.`;

  const handleSendWhatsApp = async () => {
    setIsSending(true);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: request.id,
          docketNumber: request.caseNumber,
          recipientName: request.requestedBy.name,
          phone,
          amountNad: request.totalAmountNad || (request.pages || 30) * 35,
          pages: request.pages || 30,
          verifiedBy,
          region: request.region,
          town: request.town,
          caseClass: request.caseClass,
        }),
      });

      const json = await res.json();
      if (json && json.log) {
        setSentLog(json.log);
        if (onSentSuccess) {
          onSentSuccess(json.log);
        }
      }
    } catch (e) {
      console.error('WhatsApp send error:', e);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(templatePreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden my-6 flex flex-col animate-in fade-in zoom-in-95 text-xs text-[#0A1931]">
        {/* Header */}
        <div className="bg-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                WhatsApp Cloud API Dispatch
              </h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Automated Transcript Ready Notification (Template: transcript_ready)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Phone Number (Namibian +264 format)
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+264 81 248 990"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-[#0A1931] focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Leading 0 automatically converted to +264 format compliant with Meta WhatsApp Cloud API.
            </span>
          </div>

          {/* Template Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Message Content (Approved HSM Template)
              </label>
              <button
                onClick={handleCopy}
                className="text-[10px] text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs font-mono text-emerald-950 space-y-2 leading-relaxed">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 text-[10px] text-emerald-800 font-bold uppercase">
                <span>JudiCore Official WhatsApp Gateway</span>
                <span>Encrypted HSM</span>
              </div>
              <p>{templatePreview}</p>
            </div>
          </div>

          {/* Sent Status Log */}
          {sentLog && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dispatch Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Delivered & Read ({sentLog.readAt})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Message ID:</span>
                <span className="text-slate-800 font-bold">{sentLog.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="text-blue-600">{sentLog.toNumber}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono">
              All logs stored permanently in whatsapp_logs
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={isSending}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending via WhatsApp...' : sentLog ? 'Re-send Notification' : 'Send WhatsApp Message'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
