import React, { useState, useEffect } from 'react';
import {
  TranscriptRequest,
  StaffMember,
  UserProfile,
  RequestStatus,
  AuditLogEntry,
  JudicialInvoice,
  PaymentMethod,
  CaseClass,
  CASE_CLASS_CONFIG,
} from '../types/court';
import {
  BarChart3,
  Clock,
  Mic,
  Shield,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  UserCheck,
  Eye,
  FileCheck,
  Sparkles,
  Send,
  X,
  Volume2,
  Check,
  LayoutDashboard,
  Layers,
  Users,
  ShieldCheck,
  Download,
  AlertCircle,
  RotateCcw,
  CreditCard,
  Building,
  User,
  Receipt,
  FileText,
  Upload,
  Archive,
  MessageSquare,
  MapPin,
  Calendar,
} from 'lucide-react';
import { VerificationQueue } from './VerificationQueue';
import { AuditTrailLog } from './AuditTrailLog';
import { TranscriptExport } from './TranscriptExport';
import { VerbitLegalAdvisor } from './VerbitLegalAdvisor';
import { LegalAiAnalysisModal } from './LegalAiAnalysisModal';
import { OcrDocketIngestModal } from './OcrDocketIngestModal';
import { WhatsAppNotificationModal } from './WhatsAppNotificationModal';
import { UploadFromFilesModal } from './UploadFromFilesModal';
import {
  generateGovernmentMinistryInvoicePDF,
  generatePrivateClientInvoicePDF,
  GovernmentBillingRecord,
} from '../utils/pdfInvoiceGenerator';
import { calculatePricing, UrgencyTier } from '../utils/pricing';
import { NAMIBIA_REGIONS, getTownsByRegion } from '../data/namibiaRegions';

interface AdminCenterProps {
  currentUser: UserProfile;
  requests: TranscriptRequest[];
  staffMembers: StaffMember[];
  auditLogs: AuditLogEntry[];
  invoices?: JudicialInvoice[];
  onAssignRequest: (requestId: string, staff: StaffMember) => void;
  onUploadAudioAndTranscribe: (requestId: string, audioFile: { name: string; durationSeconds: number }, transcriptText: string) => void;
  onVerifyAndDeliver: (requestId: string, notes: string, signature?: string, verifiedText?: string) => void;
  onRequestCorrection: (requestId: string, comment: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onOpenAuditTrail: () => void;
  onOpenExportLogs: () => void;
  onNewRequest?: (req: Omit<TranscriptRequest, 'id' | 'status' | 'dateRequested' | 'dueDate'>) => void;
  onIssueQuote?: (newInvoice: JudicialInvoice) => void;
  onPayInvoice?: (invoiceNumber: string, paymentMethod: PaymentMethod) => void;
}

export const AdminCenter: React.FC<AdminCenterProps> = ({
  currentUser,
  requests,
  staffMembers,
  auditLogs,
  invoices = [],
  onAssignRequest,
  onUploadAudioAndTranscribe,
  onVerifyAndDeliver,
  onRequestCorrection,
  onRejectRequest,
  onOpenAuditTrail,
  onOpenExportLogs,
  onNewRequest,
  onIssueQuote,
  onPayInvoice,
}) => {
  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'queue' | 'verification' | 'advisor' | 'billing' | 'staff' | 'audit' | 'export' | 'archive'
  >('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [townFilter, setTownFilter] = useState<string>('all');
  const [hasLegalAiFilter, setHasLegalAiFilter] = useState<boolean | null>(null);

  // Modals
  const [isUploadFilesModalOpen, setIsUploadFilesModalOpen] = useState(false);
  const [uploadFilesMode, setUploadFilesMode] = useState<'document' | 'audio' | 'auto'>('auto');
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [assigningRequest, setAssigningRequest] = useState<TranscriptRequest | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember>(staffMembers[0]);
  const [analyzingRequest, setAnalyzingRequest] = useState<TranscriptRequest | null>(null);
  const [whatsAppModalRequest, setWhatsAppModalRequest] = useState<TranscriptRequest | null>(null);

  // New Request Form State
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newHearingDate, setNewHearingDate] = useState('2024-10-30');
  const [newUrgencyTier, setNewUrgencyTier] = useState<UrgencyTier>('Normal');
  const [newPagesCount, setNewPagesCount] = useState<number>(45);
  const [newCaseClass, setNewCaseClass] = useState<CaseClass>('criminal');
  const [newRegion, setNewRegion] = useState('Khomas');
  const [newTown, setNewTown] = useState('Windhoek');

  const manualPricing = calculatePricing(currentUser, newUrgencyTier, newPagesCount);

  // Billing Hub State (Manual Rate Input & Quote Creation)
  const [manualGovRate, setManualGovRate] = useState<number>(35.0);
  const [quoteRecipient, setQuoteRecipient] = useState<string>('J. Smith, Attorney');
  const [quoteRecipientEmail, setQuoteRecipientEmail] = useState<string>('jsmith@smithlaw.com.na');
  const [quoteRecipientFirm, setQuoteRecipientFirm] = useState<string>('Smith & Partners Legal Advocates');
  const [quoteCaseNumber, setQuoteCaseNumber] = useState<string>('CR-2024-0891');
  const [quoteCaseTitle, setQuoteCaseTitle] = useState<string>('The State v Nuuyoma & Others');
  const [quotePages, setQuotePages] = useState<number>(45);
  const [quoteManualRate, setQuoteManualRate] = useState<number>(35.0);
  const [quoteIssuedSuccess, setQuoteIssuedSuccess] = useState<boolean>(false);

  // Automatic Calculation for Quote
  const quoteSubtotal = quotePages * quoteManualRate;
  const quoteVat = quoteSubtotal * 0.15; // 15% Namibian VAT
  const quoteTotal = quoteSubtotal + quoteVat;

  // Judicial Paygate & Clearance State
  const [billingSubTab, setBillingSubTab] = useState<'paygate' | 'government' | 'quote'>('paygate');
  const [paygateModalInvoice, setPaygateModalInvoice] = useState<JudicialInvoice | null>(null);
  const [selectedPaygateMethod, setSelectedPaygateMethod] = useState<PaymentMethod>('Bank Windhoek EFT');
  const [isProcessingPaygate, setIsProcessingPaygate] = useState(false);
  const [paygateStatusFilter, setPaygateStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [paygateSearch, setPaygateSearch] = useState('');

  const handleExecutePaygate = async () => {
    if (!paygateModalInvoice) return;
    setIsProcessingPaygate(true);

    try {
      await fetch('/api/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: paygateModalInvoice.invoiceNumber,
          paymentMethod: selectedPaygateMethod,
          amountNad: paygateModalInvoice.totalNad,
          caseNumber: paygateModalInvoice.caseNumber,
          payerName: currentUser.name,
        }),
      });
    } catch {
      // Fallback
    }

    setIsProcessingPaygate(false);
    onPayInvoice?.(paygateModalInvoice.invoiceNumber, selectedPaygateMethod);
    setPaygateModalInvoice(null);
  };

  const handleExportPrivatePDF = (inv: JudicialInvoice) => {
    generatePrivateClientInvoicePDF(inv, currentUser);
  };

  // Work & Verification Modal
  const [activeWorkflowRequest, setActiveWorkflowRequest] = useState<TranscriptRequest | null>(null);
  const [audioFileName, setAudioFileName] = useState('Court_Hearing_Master.wav');
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('Verified 100% against official court recording. All legal terms verified.');

  // Real Dockets & Stats (No test/sample/demo data)
  const [dockets, setDockets] = useState<TranscriptRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTranscription: 0,
    verification: 0,
    delivered: 0,
  });

  useEffect(() => {
    // Filter out any with id or caseNumber containing 'TEST' or 'sample' or status 'demo'
    const realOnly = (requests || []).filter(
      (d) =>
        !d.id?.toLowerCase().includes('test') &&
        !d.id?.toLowerCase().includes('sample') &&
        !d.caseNumber?.toLowerCase().includes('sample') &&
        !d.caseNumber?.toLowerCase().includes('test') &&
        (d as any).is_test !== true &&
        (d.status as any) !== 'demo'
    );
    setDockets(realOnly);
    setStats({
      total: realOnly.length,
      pending: realOnly.filter((d) => d.status === 'pending').length,
      inTranscription: realOnly.filter((d) => d.status === 'transcribing' || d.status === 'assigned').length,
      verification: realOnly.filter((d) => d.status === 'verification' || d.status === 'pending_final_check').length,
      delivered: realOnly.filter((d) => d.status === 'delivered').length,
    });
  }, [requests]);

  // Counts based on real dockets
  const pendingRequests = dockets.filter((r) => r.status === 'pending');
  const inTranscriptionRequests = dockets.filter((r) => r.status === 'assigned' || r.status === 'transcribing');
  const awaitingVerificationRequests = dockets.filter((r) => r.status === 'verification' || r.status === 'pending_final_check');
  const deliveredRequests = dockets.filter((r) => r.status === 'delivered');
  const archivedRequests = dockets.filter((r) => r.status === 'archived' || r.archived);

  const totalCount = stats.total;
  const pendingCount = stats.pending;
  const inTranscriptionCount = stats.inTranscription;
  const awaitingVerificationCount = stats.verification;
  const deliveredCount = stats.delivered;

  // Filter requests (strictly from real dockets)
  const filteredRequests = dockets.filter((r) => {
    // Tab check for archive
    if (adminTab === 'archive') {
      if (r.status !== 'archived' && r.status !== 'delivered') return false;
    }

    if (statusFilter === 'pending' && r.status !== 'pending') return false;
    if (statusFilter === 'transcribing' && r.status !== 'transcribing' && r.status !== 'assigned') return false;
    if (statusFilter === 'verification' && r.status !== 'verification' && r.status !== 'pending_final_check') return false;
    if (statusFilter === 'pending_final_check' && r.status !== 'pending_final_check') return false;
    if (statusFilter === 'delivered' && r.status !== 'delivered') return false;

    // Case Class filter
    if (classFilter !== 'all' && r.caseClass !== classFilter) return false;

    // Region filter
    if (regionFilter !== 'all' && r.region.toLowerCase() !== regionFilter.toLowerCase()) return false;

    // Town filter
    if (townFilter !== 'all' && r.town.toLowerCase() !== townFilter.toLowerCase()) return false;

    // Legal AI filter
    if (hasLegalAiFilter !== null && r.hasLegalAI !== hasLegalAiFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.caseNumber.toLowerCase().includes(q) ||
        (r.caseTitle || '').toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.town.toLowerCase().includes(q) ||
        r.caseClass.toLowerCase().includes(q) ||
        r.requestedBy.name.toLowerCase().includes(q) ||
        (r.assignedTo?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transcribing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'verification':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'pending_final_check':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'archived':
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTableHeading = () => {
    if (adminTab === 'archive') {
      return `Permanent Docket Archive (Stored Forever · ${filteredRequests.length} Cases)`;
    }
    switch (statusFilter) {
      case 'pending':
        return `Pending Assignments (${filteredRequests.length}) - Needs action`;
      case 'transcribing':
        return `In Transcription (${filteredRequests.length}) - Processing`;
      case 'verification':
        return `Awaiting Verification (${filteredRequests.length}) - Pending review`;
      case 'delivered':
        return `Delivered Transcripts (${filteredRequests.length}) - Completed`;
      default:
        return `All Active Court Dockets (${filteredRequests.length} Cases)`;
    }
  };

  const handleOpenWorkflow = (req: TranscriptRequest) => {
    if (req.status === 'verification') {
      setAdminTab('verification');
      return;
    }
    setActiveWorkflowRequest(req);
    setAudioFileName(req.audioFile?.name || `${req.caseNumber.replace(/\//g, '_')}_Audio.wav`);
    setTranscriptDraft(
      req.transcriptText ||
        req.rawAiDraft ||
        `[00:00:04] COURT CLERK: Silence in court! High Court is now in session. Case number ${req.caseNumber}.\n\n[00:00:18] JUDGE: Record appearances for counsel on record.\n\n[00:00:26] COUNSEL: Counsel present and ready to proceed.`
    );
  };

  const handleCreateManualRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseNumber.trim() || !onNewRequest) return;
    onNewRequest({
      caseNumber: newCaseNumber.trim(),
      docketPrefix: CASE_CLASS_CONFIG[newCaseClass]?.prefix || 'CR',
      caseTitle: newCaseTitle.trim() || 'Court Proceedings',
      hearingDate: newHearingDate,
      requestType: 'Full Transcript',
      caseClass: newCaseClass,
      caseSubClass: CASE_CLASS_CONFIG[newCaseClass]?.commonSubClasses[0] || 'General Docket',
      region: newRegion,
      town: newTown,
      courtDivision: `${newTown} Magistrate Court`,
      urgency: `${newUrgencyTier} (${manualPricing.turnaroundText})`,
      urgencyTier: newUrgencyTier,
      pages: newPagesCount,
      ratePerPage: manualPricing.ratePerPage,
      totalAmountNad: manualPricing.totalNad,
      pricingTierDescription: `${manualPricing.userCategory} ${newUrgencyTier}: N$${manualPricing.ratePerPage}/page (${manualPricing.turnaroundText})`,
      notes: 'Submitted via Admin Center docket registration',
      requestedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.title,
        roleKey: currentUser.role,
      },
    });
    setNewCaseNumber('');
    setNewCaseTitle('');
    setIsNewRequestModalOpen(false);
  };

  // Government Consolidated Monthly Record
  const govItems = requests
    .filter((r) => r.requestedBy.roleKey === 'government' || r.status === 'delivered')
    .slice(0, 10)
    .map((r) => ({
      caseNumber: r.caseNumber,
      caseClass: r.caseClass,
      requestedBy: r.requestedBy.name,
      region: r.region,
      town: r.town,
      date: r.dateRequested,
      transcriptPages: r.pages || 45,
      duration: r.audioDurationSeconds ? `${Math.floor(r.audioDurationSeconds / 3600)}h ${Math.floor((r.audioDurationSeconds % 3600) / 60)}m` : '02:30:00',
      rate: manualGovRate,
      amount: (r.pages || 45) * manualGovRate,
      legalAiService: r.hasLegalAI ? 450 : undefined,
    }));

  const govSubtotal = govItems.reduce((acc, curr) => acc + curr.amount + (curr.legalAiService || 0), 0);
  const govVat = govSubtotal * 0.15;
  const govTotal = govSubtotal + govVat;

  const handleExportGovPDF = () => {
    generateGovernmentMinistryInvoicePDF({
      month: 'October 2024',
      department: 'Department of Judicial Court Services',
      reference: 'MOJ-NAT-GOV-2024/25',
      treasuryCode: 'VOTE-16 (Judiciary)',
      appliedTariffRate: manualGovRate,
      items: govItems,
      subtotal: govSubtotal,
      vat: govVat,
      total: govTotal,
    });
  };

  // Admin creates quote for private individual
  const handleIssueQuoteToPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInvoice: JudicialInvoice = {
      invoiceNumber: invNumber,
      requestId: `REQ-${Date.now().toString().slice(-5)}`,
      caseNumber: quoteCaseNumber,
      caseTitle: quoteCaseTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      billedTo: {
        userId: 'usr-lawyer-01',
        name: quoteRecipient,
        firmOrDepartment: quoteRecipientFirm,
        email: quoteRecipientEmail,
        region: 'Khomas',
        town: 'Windhoek',
      },
      transcriptPages: quotePages,
      ratePerPage: quoteManualRate,
      lineItems: [
        {
          description: `Certified Verbatim Transcript (${quotePages} Folios @ N$ ${quoteManualRate.toFixed(2)}/page)`,
          quantity: quotePages,
          unitPriceNad: quoteManualRate,
          totalNad: quoteSubtotal,
        },
      ],
      subtotalNad: quoteSubtotal,
      vatNad: quoteVat,
      totalNad: quoteTotal,
      paymentStatus: 'pending',
    };

    if (onIssueQuote) {
      onIssueQuote(newInvoice);
    }

    setQuoteIssuedSuccess(true);
    setTimeout(() => setQuoteIssuedSuccess(false), 2500);
  };

  // Filter Pill buttons specification
  const classPills: { key: string; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All Classes', count: requests.length, color: 'text-slate-800' },
    { key: 'criminal', label: 'Criminal', count: requests.filter((r) => r.caseClass === 'criminal').length, color: 'text-red-700 bg-red-50 border-red-200' },
    { key: 'civil', label: 'Civil', count: requests.filter((r) => r.caseClass === 'civil').length, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { key: 'labour', label: 'Labour', count: requests.filter((r) => r.caseClass === 'labour').length, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    { key: 'family_marriage', label: 'Marriage', count: requests.filter((r) => r.caseClass === 'family_marriage').length, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { key: 'family_maternal', label: 'Maternal / Mnt', count: requests.filter((r) => r.caseClass === 'family_maternal').length, color: 'text-pink-700 bg-pink-50 border-pink-200' },
    { key: 'family_other', label: 'Family Other', count: requests.filter((r) => r.caseClass === 'family_other').length, color: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
    { key: 'appeal', label: 'Appeal', count: requests.filter((r) => r.caseClass === 'appeal').length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#F8FAFC] text-[#0A1931] min-h-[calc(100vh-65px)] font-sans">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 shadow-2xs">
        <div className="space-y-6">
          <div className="hidden md:flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              JC
            </div>
            <div>
              <div className="text-sm font-bold text-[#0A1931]">JudiCore Legal</div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Admin Center
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => {
                setAdminTab('dashboard');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dockets Dashboard</span>
            </button>

            <button
              onClick={() => {
                setAdminTab('queue');
                setStatusFilter('pending');
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Pending Queue</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  adminTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('verification')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'verification'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4" />
                <span>Verification Queue</span>
              </div>
              {awaitingVerificationCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    adminTab === 'verification'
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {awaitingVerificationCount}
                </span>
              )}
            </button>



            {/* Permanent Archive Tab */}
            <button
              onClick={() => setAdminTab('archive')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'archive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Permanent Archive</span>
            </button>

            {/* Verbit Legal AI in Admin Center */}
            <button
              onClick={() => setAdminTab('advisor')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'advisor'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Verbit Legal AI</span>
            </button>

            {/* Judicial Paygate & Billing Center */}
            <button
              onClick={() => setAdminTab('billing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'billing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Judicial Paygate & Billing</span>
            </button>

            <button
              onClick={() => setAdminTab('staff')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                adminTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff Management</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Reports & Audit
              </div>
              <button
                onClick={() => setAdminTab('audit')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                  adminTab === 'audit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Audit Trail Log</span>
              </button>

              <button
                onClick={() => setAdminTab('export')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                  adminTab === 'export'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Transcript Export</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom User */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {currentUser.badge || 'JD'}
          </div>
          <div>
            <div className="text-xs font-bold text-[#0A1931]">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentUser.title}</div>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* SUBVIEW 1: Verification Queue Tab */}
        {adminTab === 'verification' && (
          <VerificationQueue
            currentUser={currentUser}
            requests={requests}
            onApprove={(reqId, notes, signature, verifiedText) => {
              const req = requests.find((r) => r.id === reqId);
              onVerifyAndDeliver(reqId, notes, signature, verifiedText);

              // If private lawyer user -> trigger WhatsApp notification modal
              if (req && req.requestedBy.roleKey === 'lawyer') {
                setWhatsAppModalRequest(req);
              }
              setAdminTab('dashboard');
            }}
            onRequestCorrection={(reqId, comment) => {
              onRequestCorrection(reqId, comment);
              setAdminTab('dashboard');
            }}
            onReject={(reqId, reason) => {
              onRejectRequest(reqId, reason);
              setAdminTab('dashboard');
            }}
            onClose={() => setAdminTab('dashboard')}
          />
        )}

        {/* SUBVIEW 2: Verbit Legal AI Advisor Tab */}
        {adminTab === 'advisor' && (
          <div className="space-y-4">
            <VerbitLegalAdvisor currentUser={currentUser} requests={requests} />
          </div>
        )}

        {/* SUBVIEW 3: Judicial Paygate & Government Billing */}
        {adminTab === 'billing' && (
          <div className="space-y-6">
            {/* Top Navigation & Sub-Tabs */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-extrabold text-[#0A1931]">
                      Judicial Paygate & Government Billing
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Centralized financial portal: Paygate settlement, Ministry of Justice VOTE-16 consolidated billing, and client quote generation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBillingSubTab('paygate')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      billingSubTab === 'paygate'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Paygate Settlement Desk ({invoices.length})</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('government')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      billingSubTab === 'government'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Ministry Account (VOTE-16)</span>
                  </button>

                  <button
                    onClick={() => setBillingSubTab('quote')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      billingSubTab === 'quote'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Issue Quote</span>
                  </button>
                </div>
              </div>

              {/* Quick Financial KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoiced</span>
                  <span className="text-base font-extrabold text-[#0A1931] font-mono mt-0.5 block">
                    N$ {invoices.reduce((acc, c) => acc + c.totalNad, 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Settled via Paygate</span>
                  <span className="text-base font-extrabold text-emerald-800 font-mono mt-0.5 block">
                    N$ {invoices.filter((i) => i.paymentStatus === 'paid').reduce((acc, c) => acc + c.totalNad, 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Settlement</span>
                  <span className="text-base font-extrabold text-amber-800 font-mono mt-0.5 block">
                    N$ {invoices.filter((i) => i.paymentStatus === 'pending').reduce((acc, c) => acc + c.totalNad, 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Gov VOTE-16 Total</span>
                  <span className="text-base font-extrabold text-blue-800 font-mono mt-0.5 block">
                    N$ {govTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* SUB-TAB 1: Judicial Paygate Settlement Desk */}
            {billingSubTab === 'paygate' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0A1931]">
                      Judicial Paygate Invoices Clearance Desk
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Process instant clearances, EFT bank settlement, revenue stamp verification, and tax invoices.
                    </p>
                  </div>

                  {/* Search & Status Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search invoices or docket..."
                        value={paygateSearch}
                        onChange={(e) => setPaygateSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-48 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setPaygateStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          paygateStatusFilter === 'all' ? 'bg-white shadow-2xs text-[#0A1931]' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        All ({invoices.length})
                      </button>
                      <button
                        onClick={() => setPaygateStatusFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          paygateStatusFilter === 'pending' ? 'bg-white shadow-2xs text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Pending ({invoices.filter((i) => i.paymentStatus === 'pending').length})
                      </button>
                      <button
                        onClick={() => setPaygateStatusFilter('paid')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          paygateStatusFilter === 'paid' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Settled ({invoices.filter((i) => i.paymentStatus === 'paid').length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Invoices List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Invoice No.</th>
                        <th className="py-3 px-4">Case Docket</th>
                        <th className="py-3 px-4">Billed To</th>
                        <th className="py-3 px-4">Pages & Tariff</th>
                        <th className="py-3 px-4">Amount (Incl. 15% VAT)</th>
                        <th className="py-3 px-4">Status & Reference</th>
                        <th className="py-3 px-4 text-right">Paygate Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[#0A1931]">
                      {invoices
                        .filter((inv) => {
                          const matches =
                            inv.invoiceNumber.toLowerCase().includes(paygateSearch.toLowerCase()) ||
                            inv.caseNumber.toLowerCase().includes(paygateSearch.toLowerCase()) ||
                            inv.billedTo.name.toLowerCase().includes(paygateSearch.toLowerCase());
                          if (!matches) return false;
                          if (paygateStatusFilter === 'pending') return inv.paymentStatus === 'pending';
                          if (paygateStatusFilter === 'paid') return inv.paymentStatus === 'paid';
                          return true;
                        })
                        .map((inv) => (
                          <tr key={inv.invoiceNumber} className="hover:bg-slate-50/80">
                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-medium">
                              <div>{inv.caseNumber}</div>
                              <div className="text-[10px] text-slate-400 font-sans truncate max-w-xs">{inv.caseTitle}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{inv.billedTo.name}</div>
                              <div className="text-[10px] text-slate-500">{inv.billedTo.firmOrDepartment || 'Private Practice'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold">{inv.transcriptPages || 45} pages</div>
                              <div className="text-[10px] text-slate-500">N$ {(inv.ratePerPage || 35.0).toFixed(2)}/page</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              N$ {inv.totalNad.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4">
                              {inv.paymentStatus === 'paid' ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Settled</span>
                                  </span>
                                  {inv.revenueStampCode && (
                                    <div className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]" title={inv.revenueStampCode}>
                                      {inv.revenueStampCode}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Pending Paygate</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              {/* Export Tax Invoice PDF */}
                              <button
                                onClick={() => handleExportPrivatePDF(inv)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1"
                                title="Download PDF invoice"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                <span>PDF</span>
                              </button>

                              {/* Paygate Settle Button */}
                              {inv.paymentStatus === 'pending' && (
                                <button
                                  onClick={() => setPaygateModalInvoice(inv)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Settle via Paygate</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: Ministry of Justice Consolidated Account (VOTE-16 Judiciary) */}
            {billingSubTab === 'government' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="w-6 h-6 text-blue-600" />
                      <h2 className="text-xl font-extrabold text-[#0A1931]">
                        Ministry of Justice Consolidated Account (VOTE-16)
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Department of Judicial Court Services — Private contractor billing for Superior and Subordinate Courts.
                    </p>
                    <div className="text-[11px] text-blue-700 font-mono mt-0.5">
                      Treasury Reference: <strong>MOJ-NAT-GOV-2024/25</strong> · VOTE-16 Judiciary
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                      <span className="text-xs font-semibold text-slate-600">Manual Gov Rate:</span>
                      <span className="font-mono font-bold text-xs text-blue-600">N$</span>
                      <input
                        type="number"
                        step="0.5"
                        value={manualGovRate}
                        onChange={(e) => setManualGovRate(Number(e.target.value))}
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-[#0A1931]"
                      />
                    </div>

                    <button
                      onClick={handleExportGovPDF}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Ministry Invoice PDF</span>
                    </button>
                  </div>
                </div>

                {/* Consolidated Monthly Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Case Docket</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Requested Official</th>
                        <th className="py-3 px-4">Region / Town</th>
                        <th className="py-3 px-4">Pages</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Rate (NAD)</th>
                        <th className="py-3 px-4 text-right">Amount (NAD)</th>
                        <th className="py-3 px-4 text-right">Legal AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[#0A1931]">
                      {govItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.caseNumber}</td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600">{item.caseClass || 'criminal'}</td>
                          <td className="py-3 px-4 font-medium">{item.requestedBy}</td>
                          <td className="py-3 px-4 text-slate-500">{item.region}, {item.town}</td>
                          <td className="py-3 px-4 font-mono">{item.transcriptPages}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{item.duration}</td>
                          <td className="py-3 px-4 font-mono">N$ {item.rate.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-right">N$ {item.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 font-mono text-right text-purple-700">
                            {item.legalAiService ? `N$ ${item.legalAiService}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <div className="w-80 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span>N$ {govSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Namibian VAT (15%):</span>
                      <span>N$ {govVat.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#0A1931]">
                      <span>Consolidated Total:</span>
                      <span className="text-blue-600">N$ {govTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: Create Quote for Private Practitioner */}
            {billingSubTab === 'quote' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#0A1931]">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold">Issue Official Quote to Private Practitioner</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Quotes are private and will appear only in the lawyer's profile billing portal. Enter page rate manually; 15% VAT is calculated automatically.
                </p>

                <form onSubmit={handleIssueQuoteToPrivate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={quoteRecipient}
                      onChange={(e) => setQuoteRecipient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Law Firm / Practice</label>
                    <input
                      type="text"
                      value={quoteRecipientFirm}
                      onChange={(e) => setQuoteRecipientFirm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Docket Number</label>
                    <input
                      type="text"
                      value={quoteCaseNumber}
                      onChange={(e) => setQuoteCaseNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manual Rate / Page (NAD)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={quoteManualRate}
                      onChange={(e) => setQuoteManualRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-blue-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estimated Pages</label>
                    <input
                      type="number"
                      value={quotePages}
                      onChange={(e) => setQuotePages(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Subtotal</span>
                      <span className="font-bold">N$ {quoteSubtotal.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">+15% VAT</span>
                      <span className="font-bold text-slate-600">N$ {quoteVat.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Due</span>
                      <span className="font-bold text-blue-600">N$ {quoteTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                    >
                      {quoteIssuedSuccess ? '✓ Quote Dispatched!' : 'Issue Quote to Client'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SUBVIEW 4: Staff Management */}
        {adminTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A1931]">Proofreaders &amp; QA Roster</h2>
                <p className="text-xs text-slate-500">
                  Official court proofreaders verify verbatim accuracy, check citations, and submit comparison diffs for manager approval.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffMembers.map((staff) => (
                <div key={staff.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {staff.avatarUrl ? (
                      <img src={staff.avatarUrl} alt={staff.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {staff.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-[#0A1931]">{staff.name}</div>
                      <div className="text-xs text-slate-500">{staff.role}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Active Tasks: {staff.activeTasks} · Completed: {staff.completedTasks}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active on Duty
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBVIEW 5: Audit Log Tab */}
        {adminTab === 'audit' && (
          <AuditTrailLog logs={auditLogs} />
        )}

        {/* SUBVIEW 6: Transcript Export Tab */}
        {adminTab === 'export' && (
          <TranscriptExport requests={requests} onBack={() => setAdminTab('dashboard')} />
        )}

        {/* SUBVIEW 7: Main Dashboard & Requests Queue / Permanent Archive */}
        {(adminTab === 'dashboard' || adminTab === 'queue' || adminTab === 'archive') && (
          <>
            {/* Header with Global Search and Top Action Buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-[#0A1931] tracking-tight">
                  {adminTab === 'archive' ? 'Permanent Court Docket Archive' : 'JudiCore Admin Center'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanent storage guaranteed · Never delete · Complete judicial lookups across 14 regions
                </p>
              </div>

              {/* Action Buttons: Court Transcriber, Auto-Populate Docket (OCR) & Register Docket */}
              <div className="flex flex-wrap items-center gap-2.5">

                <button
                  onClick={() => setIsOcrModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Auto-Populate Docket (OCR)</span>
                </button>

                <button
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Docket</span>
                </button>
              </div>
            </div>

            {/* Top Stat Cards (Clickable Status Filters) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`text-left p-4 rounded-2xl transition-all shadow-2xs space-y-2 cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-50/50 border-2 border-blue-600 ring-2 ring-blue-600'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Total Dockets</div>
                  <div className="text-2xl font-bold text-[#0A1931] font-mono">{totalCount}</div>
                  <div className="text-[10px] text-slate-400">All 14 Regions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`text-left p-4 rounded-2xl transition-all shadow-2xs space-y-2 cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-50/50 border-2 border-amber-600 ring-2 ring-amber-600'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Pending Assignment</div>
                  <div className="text-2xl font-bold text-[#0A1931] font-mono">{pendingCount}</div>
                  <div className="text-[10px] text-amber-600 font-medium">Needs Staff</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('transcribing')}
                className={`text-left p-4 rounded-2xl transition-all shadow-2xs space-y-2 cursor-pointer ${
                  statusFilter === 'transcribing'
                    ? 'bg-purple-50/50 border-2 border-purple-600 ring-2 ring-purple-600'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">In Transcription</div>
                  <div className="text-2xl font-bold text-[#0A1931] font-mono">{inTranscriptionCount}</div>
                  <div className="text-[10px] text-purple-600 font-medium">0-10+ Hr Audio</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('verification')}
                className={`text-left p-4 rounded-2xl transition-all shadow-2xs space-y-2 cursor-pointer ${
                  statusFilter === 'verification'
                    ? 'bg-indigo-50/50 border-2 border-indigo-600 ring-2 ring-indigo-600'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Verification</div>
                  <div className="text-2xl font-bold text-[#0A1931] font-mono">{awaitingVerificationCount}</div>
                  <div className="text-[10px] text-indigo-600 font-medium">Manager Gate</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('delivered')}
                className={`text-left p-4 rounded-2xl transition-all shadow-2xs space-y-2 cursor-pointer ${
                  statusFilter === 'delivered'
                    ? 'bg-emerald-50/50 border-2 border-emerald-600 ring-2 ring-emerald-600'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Delivered Transcripts</div>
                  <div className="text-2xl font-bold text-[#0A1931] font-mono">{deliveredCount}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Archived Forever</div>
                </div>
              </button>
            </div>

            {/* CASE CLASSIFICATION FILTER PILLS (Exact User Specification) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filter Dockets by Case Class:
                </span>
                {classFilter !== 'all' && (
                  <button
                    onClick={() => setClassFilter('all')}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Reset Class Filter
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {classPills.map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setClassFilter(pill.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${
                      classFilter === pill.key
                        ? 'ring-2 ring-blue-600 border-blue-600 shadow-xs scale-102 ' + pill.color
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/70">
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar: Region & Town, Global Search & Legal AI */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Docket, Title, Region, Town, Judge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0A1931] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Region Dropdown */}
                <select
                  value={regionFilter}
                  onChange={(e) => {
                    setRegionFilter(e.target.value);
                    setTownFilter('all');
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                >
                  <option value="all">All 14 Regions</option>
                  {NAMIBIA_REGIONS.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.region} Region
                    </option>
                  ))}
                </select>

                {/* Town Dropdown */}
                {regionFilter !== 'all' && (
                  <select
                    value={townFilter}
                    onChange={(e) => setTownFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                  >
                    <option value="all">All Towns in {regionFilter}</option>
                    {getTownsByRegion(regionFilter).map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Has Legal AI Pill */}
                <button
                  type="button"
                  onClick={() => setHasLegalAiFilter(hasLegalAiFilter === true ? null : true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    hasLegalAiFilter === true
                      ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Legal AI Only (+N$450)</span>
                </button>
              </div>

              {(searchQuery || statusFilter !== 'all' || classFilter !== 'all' || regionFilter !== 'all' || hasLegalAiFilter !== null) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setClassFilter('all');
                    setRegionFilter('all');
                    setTownFilter('all');
                    setHasLegalAiFilter(null);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-[#0A1931]">
                    {getTableHeading()}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                    {filteredRequests.length}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Permanent Storage · Archived Forever · 0-10+ Hr Audio Resilient
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
                    <tr>
                      <th className="py-3 px-4">Case ID / Docket</th>
                      <th className="py-3 px-4">Matter Title</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Region & Town</th>
                      <th className="py-3 px-4">Requested Official</th>
                      <th className="py-3 px-4">Assigned Staff</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Pages / Tariff</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[#0A1931]">
                    {filteredRequests.slice(0, 25).map((req) => {
                      const cfg = CASE_CLASS_CONFIG[req.caseClass] || CASE_CLASS_CONFIG.criminal;
                      const hrs = Math.floor((req.audioDurationSeconds || 3600) / 3600);
                      const mins = Math.floor(((req.audioDurationSeconds || 3600) % 3600) / 60);

                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold font-mono text-blue-600">
                            <div>{req.caseNumber}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{req.id}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                            <div className="truncate">{req.caseTitle}</div>
                            {req.caseSubClass && (
                              <div className="text-[10px] text-slate-500 font-normal">{req.caseSubClass}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.colorBg} ${cfg.colorBorder}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="font-semibold">{req.region}</div>
                            <div className="text-[10px] text-slate-500">{req.town}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="font-semibold">{req.requestedBy.name}</div>
                            <div className="text-[10px] text-slate-400">{req.requestedBy.role}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {req.assignedTo?.name ? (
                              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>{req.assignedTo.name}</span>
                              </div>
                            ) : (
                              <span className="text-amber-600 font-semibold italic bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(req.status)}`}>
                              {req.status === 'verification'
                                ? 'Transcribed · For Verification'
                                : req.status === 'pending_final_check'
                                ? 'Pending Final Check'
                                : req.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-slate-800">{req.pages || 35} pages</div>
                            <div className="text-[10px] text-slate-500">N$ {(req.totalAmountNad || (req.pages || 35) * 35).toFixed(2)}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                            {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            {/* WhatsApp Button if delivered */}
                            {req.status === 'delivered' && (
                              <button
                                onClick={() => setWhatsAppModalRequest(req)}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1"
                                title="Send WhatsApp Notification"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {/* Legal AI Button */}
                            <button
                              onClick={() => setAnalyzingRequest(req)}
                              className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs inline-flex items-center gap-1"
                              title="Inspect Legal AI"
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Legal AI</span>
                            </button>

                            {/* Assign button */}
                            <button
                              onClick={() => setAssigningRequest(req)}
                              className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 text-blue-600 font-semibold text-xs"
                            >
                              Assign
                            </button>

                            {/* Final Approval for Manager, Verify or Inspect */}
                            {req.status === 'pending_final_check' ? (
                              currentUser.role === 'manager' ? (
                                <button
                                  onClick={() => setAdminTab('verification')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs inline-flex items-center gap-1 cursor-pointer ring-2 ring-emerald-500/20"
                                  title="Complete Final Approval as Manager"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Final Approval</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setAdminTab('verification')}
                                  className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs"
                                >
                                  Pending Final Check
                                </button>
                              )
                            ) : req.status === 'verification' ? (
                              <button
                                onClick={() => setAdminTab('verification')}
                                className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-xs shadow-2xs"
                              >
                                Verify QA
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenWorkflow(req)}
                                className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination text */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {Math.min(25, filteredRequests.length)} of {filteredRequests.length} permanently stored cases</span>
                <span className="font-mono text-[11px] text-slate-400">
                  Database: Supabase persistent cloud schema
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* 0. Primary Upload from Files Modal (Device Storage: Docket OCR & Audio) */}
      <UploadFromFilesModal
        isOpen={isUploadFilesModalOpen}
        onClose={() => setIsUploadFilesModalOpen(false)}
        currentUser={currentUser}
        onNewRequest={(newReq) => {
          if (onNewRequest) onNewRequest(newReq);
        }}
        initialMode={uploadFilesMode}
      />

      {/* 1. OCR Docket Ingest Modal */}
      <OcrDocketIngestModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onDocketIngested={(newReq) => {
          if (onNewRequest) onNewRequest(newReq);
        }}
      />

      {/* 2. WhatsApp Notification Modal */}
      <WhatsAppNotificationModal
        isOpen={!!whatsAppModalRequest}
        onClose={() => setWhatsAppModalRequest(null)}
        request={whatsAppModalRequest}
      />

      {/* 3. Assign Staff Modal */}
      {assigningRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Assign Proofreader</span>
              </div>
              <button onClick={() => setAssigningRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-slate-400 block font-mono">Case Docket</span>
              <span className="font-bold text-sm text-[#0A1931]">{assigningRequest.caseNumber}</span>
              <span className="text-[11px] text-slate-500 block truncate">{assigningRequest.caseTitle}</span>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Select Proofreader</label>
              <div className="space-y-1.5">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => setSelectedStaff(staff)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      selectedStaff.id === staff.id
                        ? 'bg-blue-50 border-blue-400 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {staff.avatarUrl ? (
                        <img src={staff.avatarUrl} alt={staff.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {staff.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs">{staff.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{staff.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-mono">{staff.activeTasks} tasks</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setAssigningRequest(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAssignRequest(assigningRequest.id, selectedStaff);
                  setAssigningRequest(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Manual Request Docket Registration Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Register Court Docket</span>
              </div>
              <button onClick={() => setIsNewRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualRequest} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Docket Number</label>
                <input
                  type="text"
                  required
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  placeholder="e.g. HC-MD-CIV-APP-2024/4876 or CR-2024-1187"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-[#0A1931]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Matter Title</label>
                <input
                  type="text"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. State v Martinez & Another"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-[#0A1931]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Case Class</label>
                  <select
                    value={newCaseClass}
                    onChange={(e) => setNewCaseClass(e.target.value as CaseClass)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {Object.values(CASE_CLASS_CONFIG).map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label} ({c.prefix})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={newUrgencyTier}
                    onChange={(e) => setNewUrgencyTier(e.target.value as UrgencyTier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Normal">Normal (24-hr)</option>
                    <option value="Urgent">Urgent (2-hr)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => {
                      setNewRegion(e.target.value);
                      const towns = getTownsByRegion(e.target.value);
                      if (towns.length > 0) setNewTown(towns[0].name);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {NAMIBIA_REGIONS.map((r) => (
                      <option key={r.region} value={r.region}>{r.region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Town</label>
                  <select
                    value={newTown}
                    onChange={(e) => setNewTown(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {getTownsByRegion(newRegion).map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save & Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Working Workflow Modal */}
      {activeWorkflowRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0A1931]">
                  Docket Inspection & Audio Transcription: {activeWorkflowRequest.caseNumber}
                </h3>
                <span className="text-[11px] text-slate-500 font-sans">
                  {activeWorkflowRequest.caseTitle} · {activeWorkflowRequest.region}, {activeWorkflowRequest.town}
                </span>
              </div>
              <button onClick={() => setActiveWorkflowRequest(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Mandatory workflow notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Judicial Verification Protocol:</strong> After transcription is drafted, the docket is automatically forwarded to the <strong>Official Court Proofreader Desk</strong> for verbatim verification &amp; comparison review against courtroom audio.
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Audio Record: {audioFileName}</span>
                  <span className="text-blue-600 font-mono">Stream Protected</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Duration: {activeWorkflowRequest.audioDurationSeconds ? `${Math.floor(activeWorkflowRequest.audioDurationSeconds / 3600)}h ${Math.floor((activeWorkflowRequest.audioDurationSeconds % 3600) / 60)}m` : '02:30:00'} | Chunks: {activeWorkflowRequest.chunksTotal || 15}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verbatim Transcript Document (Draft / Transcribed Output)
                </label>
                <textarea
                  rows={8}
                  value={transcriptDraft}
                  onChange={(e) => setTranscriptDraft(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl font-mono text-xs text-[#0A1931] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proofreader Routing &amp; Verification Notes
                </label>
                <input
                  type="text"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Notes for Proofreader Desk (e.g. Check Latin citations at 00:02:15)"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  onUploadAudioAndTranscribe(
                    activeWorkflowRequest.id,
                    { name: audioFileName, durationSeconds: activeWorkflowRequest.audioDurationSeconds || 1800 },
                    transcriptDraft
                  );
                  setActiveWorkflowRequest(null);
                }}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-semibold"
              >
                Save Working Draft
              </button>

              {activeWorkflowRequest.status === 'pending_final_check' && currentUser.role === 'manager' ? (
                <button
                  onClick={() => {
                    onVerifyAndDeliver(activeWorkflowRequest.id, verificationNotes);
                    setActiveWorkflowRequest(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-500/20"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Final Approval &amp; Deliver</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUploadAudioAndTranscribe(
                      activeWorkflowRequest.id,
                      { name: audioFileName, durationSeconds: activeWorkflowRequest.audioDurationSeconds || 1800 },
                      transcriptDraft
                    );
                    setActiveWorkflowRequest(null);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Forward to Proofreader for Verification</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Legal AI Analysis Modal */}
      <LegalAiAnalysisModal
        isOpen={!!analyzingRequest}
        onClose={() => setAnalyzingRequest(null)}
        request={analyzingRequest}
        transcriptText={analyzingRequest?.transcriptText}
      />

      {/* 7. Judicial Paygate Settlement Modal */}
      {paygateModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#0A1931]">
                  Judicial Paygate — Settle Invoice
                </h3>
              </div>
              <button onClick={() => setPaygateModalInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-blue-600">{paygateModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Case Docket:</span>
                <span className="font-mono font-semibold text-[#0A1931]">{paygateModalInvoice.caseNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Billed To:</span>
                <span className="font-semibold text-[#0A1931]">{paygateModalInvoice.billedTo.name} ({paygateModalInvoice.billedTo.firmOrDepartment || 'Practice'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transcript Folios:</span>
                <span className="font-semibold text-[#0A1931]">{paygateModalInvoice.transcriptPages || 45} pages @ N$ {(paygateModalInvoice.ratePerPage || 35).toFixed(2)}/page</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-[#0A1931]">
                <span>Total Due (Incl. 15% VAT):</span>
                <span className="text-emerald-700 font-mono text-base">N$ {paygateModalInvoice.totalNad.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Select Settlement Method
              </label>
              <div className="space-y-2">
                {(
                  [
                    'Bank Windhoek EFT',
                    'FNB PayPulse',
                    'Credit/Debit Card (DPO PayGate)',
                    'Judicial Trust Account',
                    'Direct Treasury Warrant',
                  ] as PaymentMethod[]
                ).map((pm) => (
                  <label
                    key={pm}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      selectedPaygateMethod === pm
                        ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paygate_method"
                        checked={selectedPaygateMethod === pm}
                        onChange={() => setSelectedPaygateMethod(pm)}
                        className="text-emerald-600"
                      />
                      <span className="font-semibold text-slate-800">{pm}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Instant Clearing</span>
                  </label>
                ))}
              </div>
            </div>

            {/* JudiCore Trust Banking Details */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-0.5 font-mono">
              <div className="font-bold text-slate-800 font-sans">JudiCore Legal Solutions (Pty) Ltd — Trust Account</div>
              <div>Bank: Bank Windhoek (Main Branch) · Acc: 8001293842 · Branch: 483872</div>
              <div className="text-[10px] text-slate-500">Ref: {paygateModalInvoice.invoiceNumber} · Instant clearing via Paygate engine</div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPaygateModalInvoice(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPaygate}
                onClick={handleExecutePaygate}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessingPaygate ? 'Authorizing Paygate...' : `Settle N$ ${paygateModalInvoice.totalNad.toFixed(2)}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
