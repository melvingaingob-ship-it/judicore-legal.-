export type UserRole =
  | 'lawyer'
  | 'judge'
  | 'clerk'
  | 'registrar'
  | 'prosecutor'
  | 'manager'
  | 'admin'
  | 'staff'
  | 'government';

export type RequestStatus = 'pending' | 'assigned' | 'transcribing' | 'verification' | 'pending_final_check' | 'delivered' | 'archived';

export type RequestType = 'Full Transcript' | 'Summary' | 'Audio Only';

export type CaseClass =
  | 'criminal'
  | 'civil'
  | 'labour'
  | 'family_marriage'
  | 'family_maternal'
  | 'family_other'
  | 'constitutional'
  | 'appeal'
  | 'commercial';

export interface CaseClassMeta {
  key: CaseClass;
  label: string;
  prefix: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  statute: string;
  commonSubClasses: string[];
}

export const CASE_CLASS_CONFIG: Record<CaseClass, CaseClassMeta> = {
  criminal: {
    key: 'criminal',
    label: 'Criminal',
    prefix: 'CR',
    colorBg: 'bg-red-50 text-red-700',
    colorText: 'text-red-700',
    colorBorder: 'border-red-300',
    statute: 'Criminal Procedure Act 25 of 2004',
    commonSubClasses: ['Theft', 'Armed Robbery', 'Murder', 'Assault GBH', 'Rape', 'Fraud / Commercial Crime', 'Unlicensed Firearm Possession', 'Bail Application'],
  },
  civil: {
    key: 'civil',
    label: 'Civil',
    prefix: 'CV',
    colorBg: 'bg-blue-50 text-blue-700',
    colorText: 'text-blue-700',
    colorBorder: 'border-blue-300',
    statute: 'High Court Rules Act 16 of 1990',
    commonSubClasses: ['Breach of Contract', 'Damages Claim', 'Eviction / Land Dispute', 'Debt Recovery', 'Interdict Application', 'Defamation'],
  },
  labour: {
    key: 'labour',
    label: 'Labour',
    prefix: 'LC',
    colorBg: 'bg-amber-50 text-amber-800',
    colorText: 'text-amber-800',
    colorBorder: 'border-amber-300',
    statute: 'Labour Act 11 of 2007',
    commonSubClasses: ['Unfair Dismissal', 'Wage Claims / Severance', 'Arbitration Award Review', 'Industrial Strike Action', 'Workplace Discrimination'],
  },
  family_marriage: {
    key: 'family_marriage',
    label: 'Family - Marriage',
    prefix: 'FM-MAR',
    colorBg: 'bg-purple-50 text-purple-700',
    colorText: 'text-purple-700',
    colorBorder: 'border-purple-300',
    statute: 'Divorce Laws Consolidation / Marital Property Act',
    commonSubClasses: ['Divorce & Restitution of Conjugal Rights', 'Community of Property Division', 'Forfeiture of Benefits', 'Spousal Maintenance'],
  },
  family_maternal: {
    key: 'family_maternal',
    label: 'Family - Maternal/Mnt',
    prefix: 'FM-MNT',
    colorBg: 'bg-pink-50 text-pink-700',
    colorText: 'text-pink-700',
    colorBorder: 'border-pink-300',
    statute: 'Maintenance Act 9 of 2003 / Child Care & Protection Act',
    commonSubClasses: ['Child Maintenance Claim', 'Maternal / Paternity Verification', 'Child Custody & Guardianship', 'Arrear Maintenance Enforcement'],
  },
  family_other: {
    key: 'family_other',
    label: 'Family - Other',
    prefix: 'FM',
    colorBg: 'bg-fuchsia-50 text-fuchsia-700',
    colorText: 'text-fuchsia-700',
    colorBorder: 'border-fuchsia-300',
    statute: 'Combating of Domestic Violence Act 4 of 2003',
    commonSubClasses: ['Protection Order Confirmation', 'Domestic Violence Injunction', 'Child Adoption Order', 'Curatorship Application'],
  },
  constitutional: {
    key: 'constitutional',
    label: 'Constitutional',
    prefix: 'CON',
    colorBg: 'bg-indigo-50 text-indigo-800',
    colorText: 'text-indigo-800',
    colorBorder: 'border-indigo-300',
    statute: 'Constitution of the Republic of Namibia, Art. 12 & 25',
    commonSubClasses: ['Fundamental Human Rights Review', 'Bill of Rights Challenge', 'Statutory Constitutionality', 'Electoral Dispute'],
  },
  appeal: {
    key: 'appeal',
    label: 'Appeal',
    prefix: 'AP',
    colorBg: 'bg-emerald-50 text-emerald-700',
    colorText: 'text-emerald-700',
    colorBorder: 'border-emerald-300',
    statute: 'Supreme Court Act 15 of 1990 / High Court Act 16 of 1990',
    commonSubClasses: ['Magistrate Court Criminal Appeal', 'High Court Full Bench Appeal', 'Supreme Court Petition', 'Labour Court Appeal'],
  },
  commercial: {
    key: 'commercial',
    label: 'Commercial',
    prefix: 'COM',
    colorBg: 'bg-teal-50 text-teal-700',
    colorText: 'text-teal-700',
    colorBorder: 'border-teal-300',
    statute: 'Companies Act 28 of 2004 / Insolvency Act 24 of 1936',
    commonSubClasses: ['Corporate Liquidation', 'Commercial Arbitration', 'Shareholder Oppression', 'Banking & Financial Securities'],
  },
};

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  courtOrFirm: string;
  badge?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  nationalIdOrPassport?: string;
  region?: string;
  town?: string;
  companyOrFirmName?: string;
  stateMagistrateCourt?: string;
  superiorCourt?: string;
  barOrPracticingNumber?: string;
  judicialChambers?: string;
  clerkRegistrationId?: string;
  prosecutorStation?: string;
  transcriptionWpm?: number;
  isProfileComplete?: boolean;
  profileVerificationStatus?: 'Verified' | 'Pending Verification' | 'Gazetted';
}

export type PaymentStatus = 'paid' | 'pending' | 'exempt';
export type PaymentMethod =
  | 'Bank Windhoek EFT'
  | 'FNB PayPulse'
  | 'Credit/Debit Card (DPO PayGate)'
  | 'Judicial Trust Account'
  | 'State Exemption Voucher'
  | 'Direct Treasury Warrant';

export interface JudicialInvoice {
  invoiceNumber: string;
  requestId: string;
  caseNumber: string;
  caseTitle?: string;
  date: string;
  billedTo: {
    userId?: string;
    name: string;
    firmOrDepartment: string;
    taxId?: string;
    email: string;
    region?: string;
    town?: string;
  };
  transcriptPages?: number;
  ratePerPage?: number;
  caseClass?: CaseClass;
  durationText?: string;
  hasLegalAI?: boolean;
  legalAiFee?: number;
  isGovernmentConsolidated?: boolean;
  lineItems: {
    description: string;
    quantity: number;
    unitPriceNad: number;
    totalNad: number;
  }[];
  subtotalNad: number;
  vatNad: number; // 15% Namibian VAT
  totalNad: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  revenueStampCode?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  activeTasks: number;
  completedTasks: number;
  avatarUrl: string;
}

export interface WhatsAppLog {
  id: string;
  caseId: string;
  docketNumber: string;
  toNumber: string;
  recipientName: string;
  template: 'transcript_ready';
  message: string;
  status: 'sent' | 'delivered' | 'read';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  downloadUrl: string;
}

export interface TranscriptRequest {
  id: string; // e.g. REQ-00142
  caseNumber: string; // e.g. HC-MD-CIV-APP-2024/4876 or CR-2024-0891
  docketPrefix?: string; // e.g. CR, CV, LC
  caseTitle?: string;
  hearingDate: string; // e.g. 2024-10-28
  requestType: RequestType;
  caseClass: CaseClass;
  caseSubClass?: string;
  region: string;
  town: string;
  courtDivision: string;
  urgency: string; // Standard (3-5 business days) | Urgent (24 hours) | Expedited (48 hours)
  urgencyTier?: 'Urgent' | 'Normal';
  notes?: string;
  status: RequestStatus;
  requestedBy: {
    id: string;
    name: string;
    role: string;
    roleKey: UserRole;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  dueDate: string;
  dateRequested: string;
  audioFile?: {
    name: string;
    durationSeconds: number;
    streamUrl?: string;
    uploadedBy: string;
    uploadedAt: string;
    sampleRate?: string;
  };
  audioDurationSeconds?: number;
  transcriptionProgress?: number; // 0 - 100
  chunksTotal?: number;
  chunksCompleted?: number;
  transcriptText?: string;
  rawAiDraft?: string;
  accuracyScore?: number;
  wordCount?: number;
  managerFeedback?: string;
  verificationSignature?: string;
  billingStatus?: PaymentStatus;
  totalAmountNad?: number;
  invoiceNumber?: string;
  pages?: number;
  ratePerPage?: number;
  hasLegalAI?: boolean;
  legalAiFee?: number; // N$ 450
  pricingTierDescription?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  proofreadBy?: string;
  proofreadAt?: string;
  proofreadNotes?: string;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  deliveredAt?: string;
  whatsappStatus?: 'none' | 'pending' | 'sent' | 'delivered' | 'read';
  whatsappSentAt?: string;
  legalAiReportUrl?: string;
  transcriptUrl?: string;
  downloadUrlExpiresAt?: string;
  archived?: boolean;
  search_text?: string;
}

export interface OcrDocketResult {
  docketNumber: string;
  matterTitle: string;
  caseClass: CaseClass;
  caseSubClass: string;
  hearingDate: string;
  courtDivision: string;
  region: string;
  town: string;
  presidingJudge?: string;
  estimatedPages: number;
  urgencyTier: 'Urgent' | 'Normal';
  hasLegalAI: boolean;
  rawOcrText: string;
  confidenceScore: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  requestId: string;
  caseNumber: string;
  action:
    | 'REQUEST_SUBMITTED'
    | 'ASSIGNED_TO_STAFF'
    | 'AUDIO_UPLOADED'
    | 'OCR_DOCKET_INGESTED'
    | 'TRANSCRIPTION_DRAFTED'
    | 'TRANSCRIPTION_FORWARDED_TO_PROOFREADER'
    | 'FORWARDED_FOR_VERIFICATION'
    | 'CORRECTION_REQUESTED'
    | 'REQUEST_REJECTED'
    | 'HUMAN_VERIFIED'
    | 'DISPATCHED_TO_PORTAL'
    | 'WHATSAPP_NOTIFICATION_SENT'
    | 'TRANSCRIPT_DOWNLOADED'
    | 'AUDIO_STREAMED'
    | 'DRAFT_SAVED'
    | 'PROFILE_UPDATED'
    | 'PAYMENT_COMPLETED';
  userName: string;
  userRole: string;
  details: string;
}
