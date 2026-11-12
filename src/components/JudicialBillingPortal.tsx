import React, { useState } from 'react';
import { UserProfile, JudicialInvoice, PaymentMethod } from '../types/court';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  Building,
  FileText,
  DollarSign,
  AlertCircle,
  X,
  Receipt,
  Search,
  ExternalLink,
  ChevronDown,
  Layers,
  User,
  Calendar,
} from 'lucide-react';
import {
  generatePrivateClientInvoicePDF,
} from '../utils/pdfInvoiceGenerator';

interface JudicialBillingPortalProps {
  currentUser: UserProfile;
  invoices: JudicialInvoice[];
  onPayInvoice: (invoiceNumber: string, paymentMethod: PaymentMethod) => void;
}

export const JudicialBillingPortal: React.FC<JudicialBillingPortalProps> = ({
  currentUser,
  invoices,
  onPayInvoice,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<JudicialInvoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<JudicialInvoice | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Bank Windhoek EFT');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // For private users: show ONLY invoices where userId == currentUser.id (or matching email)
  const userInvoices = invoices.filter(
    (inv) => inv.billedTo.userId === currentUser.id || inv.billedTo.email === currentUser.email
  );

  const handleExecutePayment = async () => {
    if (!paymentModalInvoice) return;
    setIsProcessingPayment(true);

    try {
      await fetch('/api/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: paymentModalInvoice.invoiceNumber,
          paymentMethod: selectedPaymentMethod,
          amountNad: paymentModalInvoice.totalNad,
          caseNumber: paymentModalInvoice.caseNumber,
          payerName: currentUser.name,
        }),
      });
    } catch {
      // Fallback
    }

    setIsProcessingPayment(false);
    onPayInvoice(paymentModalInvoice.invoiceNumber, selectedPaymentMethod);
    setPaymentModalInvoice(null);
  };

  const handleExportPDF = (inv: JudicialInvoice) => {
    generatePrivateClientInvoicePDF(inv, currentUser);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Private Issuer Letterhead Header */}
      <div className="bg-[#0a0f1e] text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <div className="text-[10px] tracking-widest text-blue-400">PRIVATE COMPANY LETTERHEAD</div>
          <div className="font-bold text-xl">JUDICORE LEGAL SOLUTIONS (PTY) LTD</div>
          <div className="text-xs text-gray-400">PO BOX 60788 WINDHOEK - TEL: 0818451323 - EMAIL: melvingaingaing@gmail.com</div>
          <div className="text-[10px] text-yellow-400 mt-1">PRIVATE COMPANY - NOT GOVERNMENT OWNED</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-widest text-blue-400">Private Practitioner Invoicing</div>
          <div className="text-sm font-semibold">Tax Clearing & Revenue Stamps</div>
          <div className="text-xs text-gray-300">Compliant with Namibian Tax Act</div>
        </div>
      </div>

      {/* Title & Account Identification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-[#0A1931] tracking-tight">
              My Judicial Invoices & Billing
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private Practitioner Account for {currentUser.name} ({currentUser.companyOrFirmName || 'Legal Practice'}). Official quotes & tax invoices.
          </p>
        </div>

        {/* Account Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Account Classification</span>
            <div className="text-sm font-bold text-[#0A1931] font-mono">
              PRIVATE LEGAL PRACTITIONER
            </div>
            <div className="text-[10px] text-blue-600 font-medium">
              {currentUser.email}
            </div>
          </div>
        </div>
      </div>

      {/* PRIVATE PRACTITIONER BILLING */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#0A1931]">
                Quotes & Tax Invoices for {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing only quotes and invoices issued to your account (<span className="font-mono text-blue-600">{currentUser.id}</span>).
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Total Invoices: <strong className="text-slate-800">{userInvoices.length}</strong>
            </div>
          </div>

          {userInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No quotes or invoices have been issued to your private account yet. Submit a transcript request or contact the Admin Center.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Invoice No.</th>
                    <th className="py-3 px-4">Case Docket</th>
                    <th className="py-3 px-4">Pages & Rate</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total (Incl. VAT)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0A1931]">
                  {userInvoices.map((inv) => (
                    <tr key={inv.invoiceNumber} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <div>{inv.caseNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">{inv.caseTitle}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{inv.transcriptPages || 45} pages</div>
                        <div className="text-[10px] text-slate-500">Rate: N$ {(inv.ratePerPage || 35.0).toFixed(2)} / page</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        N$ {inv.totalNad.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Payment</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {/* Export PDF Invoice button using jsPDF */}
                        <button
                          onClick={() => handleExportPDF(inv)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1.5"
                          title="Generate official PDF invoice"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>Export PDF Invoice</span>
                        </button>

                        {/* Pay Now Button */}
                        {inv.paymentStatus === 'pending' && (
                          <button
                            onClick={() => setPaymentModalInvoice(inv)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Pay Now Modal with Payment Methods */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#0A1931]">
                  Settle Judicial Invoice
                </h3>
              </div>
              <button onClick={() => setPaymentModalInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-blue-600">{paymentModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Case Docket:</span>
                <span className="font-mono font-semibold text-[#0A1931]">{paymentModalInvoice.caseNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transcript Folios:</span>
                <span className="font-semibold text-[#0A1931]">{paymentModalInvoice.transcriptPages || 45} pages @ N$ {(paymentModalInvoice.ratePerPage || 35).toFixed(2)}/page</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-[#0A1931]">
                <span>Total Due (Incl. 15% VAT):</span>
                <span className="text-blue-600 font-mono text-base">N$ {paymentModalInvoice.totalNad.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Select Payment Method
              </label>
              <div className="space-y-2">
                {(
                  [
                    'Bank Windhoek EFT',
                    'FNB PayPulse',
                    'Credit/Debit Card (DPO PayGate)',
                    'Judicial Trust Account',
                  ] as PaymentMethod[]
                ).map((pm) => (
                  <label
                    key={pm}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selectedPaymentMethod === pm
                        ? 'bg-blue-50 border-blue-400 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="pay_method"
                        checked={selectedPaymentMethod === pm}
                        onChange={() => setSelectedPaymentMethod(pm)}
                        className="text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">{pm}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Instant Clearing</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleExecutePayment}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessingPayment ? 'Clearing Payment...' : `Authorize N$ ${paymentModalInvoice.totalNad.toFixed(2)}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
