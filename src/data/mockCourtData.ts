import { UserProfile, StaffMember, TranscriptRequest, AuditLogEntry, JudicialInvoice } from '../types/court';
import { NAMIBIA_REGIONS } from './namibiaRegions';

export const JUDICORE_USERS: Record<string, UserProfile> = {
  lawyer: {
    id: 'usr-lawyer-01',
    name: 'J. Smith, Attorney',
    role: 'lawyer',
    title: 'Senior Defense Counsel',
    courtOrFirm: 'Smith & Partners Legal Advocates',
    badge: 'JS',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'jsmith@smithlaw.com.na',
    phone: '+264 61 248 990',
    nationalIdOrPassport: 'NAM-85041200349',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'Smith & Partners Legal Advocates (Inc.)',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    barOrPracticingNumber: 'LSN-2016-0812',
    isProfileComplete: true,
    profileVerificationStatus: 'Verified',
  },
  judge: {
    id: 'usr-judge-02',
    name: 'Hon. Lady Justice M. Shilongo',
    role: 'judge',
    title: 'Presiding Judge of the High Court',
    courtOrFirm: 'High Court of Namibia (Main Division)',
    badge: 'MS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'chambers.shilongo@judiciary.gov.na',
    phone: '+264 61 292 1200',
    nationalIdOrPassport: 'NAM-64091900122',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'Judiciary of the Republic of Namibia',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    judicialChambers: 'Chambers 3A, High Court Windhoek',
    isProfileComplete: true,
    profileVerificationStatus: 'Gazetted',
  },
  clerk: {
    id: 'usr-clerk-03',
    name: 'Lisa Tran',
    role: 'clerk',
    title: 'Court Registrar & Session Clerk',
    courtOrFirm: 'Office of the Registrar',
    badge: 'LT',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'lisa.tran@moj.gov.na',
    phone: '+264 61 292 1105',
    nationalIdOrPassport: 'NAM-92010800451',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'Office of the Registrar of High & Supreme Courts',
    stateMagistrateCourt: 'Katutura Regional Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    clerkRegistrationId: 'REG-KH-2021-99',
    isProfileComplete: true,
    profileVerificationStatus: 'Verified',
  },
  prosecutor: {
    id: 'usr-pros-04',
    name: 'Mark Thompson',
    role: 'prosecutor',
    title: 'State Advocate / Public Prosecutor',
    courtOrFirm: 'Office of the Prosecutor-General',
    badge: 'MT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'mthompson@pg.gov.na',
    phone: '+264 61 280 5000',
    nationalIdOrPassport: 'NAM-78112300588',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'Office of the Prosecutor-General of Namibia',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    prosecutorStation: 'High Court Criminal Prosecutions Unit',
    isProfileComplete: true,
    profileVerificationStatus: 'Verified',
  },
  manager: {
    id: 'usr-admin-05',
    name: 'Jane Doe',
    role: 'manager',
    title: 'Transcription Center Manager',
    courtOrFirm: 'JudiCore Legal Solutions (Pty) Ltd',
    badge: 'JD',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'admin.doe@judicore.na',
    phone: '+264 61 300 4400',
    nationalIdOrPassport: 'NAM-83021400299',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'JudiCore Legal Solutions (Pty) Ltd',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    isProfileComplete: true,
    profileVerificationStatus: 'Verified',
  },
  staff: {
    id: 'st-01',
    name: 'Michael Chen',
    role: 'staff',
    title: 'Senior Court Proofreader & Legal QA',
    courtOrFirm: 'High Court Proofreading & Verification Unit',
    badge: 'MC',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'mchen@judicore.na',
    phone: '+264 81 445 1092',
    nationalIdOrPassport: 'NAM-90082700188',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'JudiCore Legal Solutions (Pty) Ltd',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'High Court of Namibia (Main Division - Windhoek)',
    transcriptionWpm: 95,
    isProfileComplete: true,
    profileVerificationStatus: 'Verified',
  },
  government: {
    id: 'usr-gov-06',
    name: 'Hon. Festus Shanghala',
    role: 'government',
    title: 'Director of Judicial Court Services',
    courtOrFirm: 'Ministry of Justice (Department of Judicial Court Services)',
    badge: 'FS',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'festus.shanghala@moj.gov.na',
    phone: '+264 61 280 5111',
    nationalIdOrPassport: 'NAM-71052800192',
    region: 'Khomas',
    town: 'Windhoek',
    companyOrFirmName: 'Ministry of Justice - Republic of Namibia',
    stateMagistrateCourt: 'Windhoek Central Magistrate Court',
    superiorCourt: 'Supreme Court of Namibia',
    isProfileComplete: true,
    profileVerificationStatus: 'Gazetted',
  },
};

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'st-01',
    name: 'Michael Chen',
    role: 'Senior Court Proofreader (Legal QA)',
    activeTasks: 2,
    completedTasks: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-02',
    name: 'Sarah Jenkins',
    role: 'Senior Proofreader & Diarization QA',
    activeTasks: 1,
    completedTasks: 35,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-03',
    name: 'David Okafor',
    role: 'Court Proofreader & Citation Specialist',
    activeTasks: 0,
    completedTasks: 29,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-04',
    name: 'Maria Shiweda',
    role: 'Indigenous Accents & Phonetics Proofreader',
    activeTasks: 0,
    completedTasks: 41,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

// Helper to generate 130 realistic distributed court cases
function generate130SeededCases(): TranscriptRequest[] {
  const result: TranscriptRequest[] = [];

  // Distribution specification: Criminal 40, Civil 30, Labour 20, Marriage 15, Maternal 15, Appeal 10 = 130 cases
  const classesDistribution: { caseClass: TranscriptRequest['caseClass']; count: number; prefix: string }[] = [
    { caseClass: 'criminal', count: 40, prefix: 'CR' },
    { caseClass: 'civil', count: 30, prefix: 'CV' },
    { caseClass: 'labour', count: 20, prefix: 'LC' },
    { caseClass: 'family_marriage', count: 15, prefix: 'FM-MAR' },
    { caseClass: 'family_maternal', count: 15, prefix: 'FM-MNT' },
    { caseClass: 'appeal', count: 10, prefix: 'AP' },
  ];

  const criminalTitles = [
    'The State v Johannes Nuuyoma & Others',
    'The State v Martinez & Another',
    'The State v Katjiua Formal Bail Application',
    'The State v Petrus & 2 Others (Armed Robbery)',
    'The State v Amutenya & Another (Fraud & Money Laundering)',
    'The State v Shikongo (Illegal Diamond Possession)',
    'The State v Haufiku (Stock Theft & Bribery)',
    'The State v Ndlovu (Contravention of Arms and Ammunition Act)',
  ];

  const civilTitles = [
    'Teachers Union v Minister of Basic Education & Another',
    'Namibia Breweries Ltd v Camelthorn Distillers (Pty) Ltd',
    'Standard Bank Namibia Ltd v Karasburg Cattle Ranch CC',
    'Municipality of Walvis Bay v Atlantic Fishing Holdings',
    'Erongo Red (Pty) Ltd v Swakopmund Industrial Park',
    'Desert Sands Properties v First National Bank Namibia',
  ];

  const labourTitles = [
    'Mine Workers Union of Namibia v Navachab Gold Mine',
    'Namibia Food & Allied Workers v Meatco Corporation',
    'Public Service Union v Ministry of Home Affairs & Immigration',
    'Metal and Allied Namibian Workers Union v TransNamib Ltd',
    'Commercial and Retail Workers Union v Shoprite Namibia',
  ];

  const marriageTitles = [
    'Shipanga v Shipanga (Divorce & Marital Property Division)',
    'Van der Merwe v Van der Merwe (Dissolution of Marriage)',
    'Katangolo v Katangolo (Forfeiture of Joint Estate Benefits)',
    'Cloete v Cloete (Spousal Maintenance & Ancillary Relief)',
  ];

  const maternalTitles = [
    'Nangula v Nghipandulwa (Child Maintenance Claim & Arrears)',
    'Hamukwaya v Tobias (Paternity Verification & Maintenance Order)',
    'Shilongo v Kamati (Maintenance & Parental Responsibility)',
    'Mouton v Beukes (Primary Care & Child Support Review)',
  ];

  const appealTitles = [
    'HC-MD-CIV-APP-2024/4876: Apex Holdings v Commissioner of Inland Revenue',
    'HC-MD-CRI-APP-2024/0042: State v Haikali (Sentence Appeal)',
    'SC-CIV-APP-2024/0019: Telecom Namibia v Communications Regulatory Authority',
    'LC-APP-2024/0011: Air Namibia Liquidators v Namibia Transport Workers Union',
  ];

  const subClassesMap: Record<string, string[]> = {
    criminal: ['Theft', 'Armed Robbery', 'Murder', 'Assault GBH', 'Rape', 'Fraud', 'Unlicensed Firearm', 'Bail Application'],
    civil: ['Breach of Contract', 'Damages Claim', 'Eviction', 'Land Dispute', 'Debt Recovery', 'Interdict'],
    labour: ['Unfair Dismissal', 'Wage Claims', 'Arbitration Award Review', 'Industrial Strike', 'Discrimination'],
    family_marriage: ['Divorce Proceedings', 'Community Property Division', 'Forfeiture of Benefits', 'Spousal Maintenance'],
    family_maternal: ['Child Maintenance', 'Paternity Verification', 'Custody & Guardianship', 'Arrears Enforcement'],
    appeal: ['Magistrate Court Criminal Appeal', 'High Court Full Bench Appeal', 'Supreme Court Appeal', 'Labour Review'],
  };

  const statuses: TranscriptRequest['status'][] = [
    'delivered', 'verification', 'transcribing', 'assigned', 'pending', 'archived'
  ];

  // Durations from 5 minutes to 12 hours
  const durationsSeconds = [
    300,        // 00:05:00
    1800,       // 00:30:00
    3600,       // 01:00:00
    7200,       // 02:00:00
    10800,      // 03:00:00
    18000,      // 05:00:00
    28800,      // 08:00:00
    30735,      // 08:32:15
    36000,      // 10:00:00
    43200,      // 12:00:00
  ];

  let caseCounter = 100;

  classesDistribution.forEach(({ caseClass, count, prefix }) => {
    for (let i = 0; i < count; i++) {
      caseCounter++;
      const regionIndex = (caseCounter + i) % NAMIBIA_REGIONS.length;
      const reg = NAMIBIA_REGIONS[regionIndex];
      const townObj = reg.towns[i % reg.towns.length];

      let titleList = criminalTitles;
      if (caseClass === 'civil') titleList = civilTitles;
      if (caseClass === 'labour') titleList = labourTitles;
      if (caseClass === 'family_marriage') titleList = marriageTitles;
      if (caseClass === 'family_maternal') titleList = maternalTitles;
      if (caseClass === 'appeal') titleList = appealTitles;

      const title = titleList[i % titleList.length];
      const subClasses = subClassesMap[caseClass] || ['General Proceedings'];
      const subClass = subClasses[i % subClasses.length];

      const durationSec = durationsSeconds[(caseCounter * 7) % durationsSeconds.length];
      // 1 hr ≈ 15 pages
      const pages = Math.max(12, Math.round((durationSec / 3600) * 15));
      const chunksTotal = Math.ceil(durationSec / 600); // 10 min chunks

      const status: TranscriptRequest['status'] = i < 14
        ? 'pending'
        : i < 30
        ? 'transcribing'
        : i < 38
        ? 'verification'
        : i < 46
        ? 'pending_final_check'
        : i < 115
        ? 'delivered'
        : 'archived';
      const assignedStaff = undefined;

      const urgencyTier: 'Urgent' | 'Normal' = i % 4 === 0 ? 'Urgent' : 'Normal';
      const isGov = i % 2 === 0;
      const ratePerPage = isGov ? (urgencyTier === 'Urgent' ? 30 : 25) : (urgencyTier === 'Urgent' ? 41 : 35);
      const hasLegalAI = i % 3 === 0;
      const legalAiFee = hasLegalAI ? 450 : 0;
      const subtotal = pages * ratePerPage;
      const totalAmountNad = Number((subtotal * 1.15 + legalAiFee).toFixed(2));

      const isVerified = status === 'delivered' || status === 'archived';

      const docketNumber = caseClass === 'appeal' && i === 0
        ? 'HC-MD-CIV-APP-2024/4876'
        : caseClass === 'criminal' && i === 0
        ? 'CR-2024-1187'
        : `${prefix}-2024-${String(1000 + caseCounter).slice(-4)}`;

      const day = 1 + (i % 28);
      const dateRequested = `Oct ${day.toString().padStart(2, '0')}, 2024`;
      const hearingDate = `2024-10-${day.toString().padStart(2, '0')}`;
      const dueDate = `2024-11-${Math.min(28, day + 5).toString().padStart(2, '0')}`;

      result.push({
        id: `REQ-${String(caseCounter).padStart(5, '0')}`,
        caseNumber: docketNumber,
        docketPrefix: prefix,
        caseTitle: title,
        hearingDate,
        requestType: 'Full Transcript',
        caseClass,
        caseSubClass: subClass,
        region: reg.region,
        town: townObj.name,
        courtDivision: townObj.courtDivision,
        urgency: `${urgencyTier} (${urgencyTier === 'Urgent' ? '2-hour turnaround' : '24-hour turnaround'})`,
        urgencyTier,
        status,
        requestedBy: isGov
          ? {
              id: 'usr-gov-06',
              name: 'Hon. Festus Shanghala',
              role: 'Director of Judicial Court Services',
              roleKey: 'government',
            }
          : {
              id: 'usr-lawyer-01',
              name: 'J. Smith, Attorney',
              role: 'Senior Defense Counsel',
              roleKey: 'lawyer',
            },
        assignedTo: status === 'verification' || status === 'pending_final_check' || status === 'transcribing'
          ? { id: 'st-01', name: 'Michael Chen' }
          : undefined,
        dueDate,
        dateRequested,
        audioFile: {
          name: `${docketNumber.replace(/[\/\-]/g, '_')}_CourtAudio.wav`,
          durationSeconds: durationSec,
          streamUrl: `/audio/stream/${docketNumber}`,
          uploadedBy: isGov ? 'Hon. Lady Justice M. Shilongo' : 'J. Smith, Attorney',
          uploadedAt: new Date(2024, 9, day).toISOString(),
          sampleRate: '48000 Hz, 24-bit PCM Multi-Channel',
        },
        audioDurationSeconds: durationSec,
        transcriptionProgress: status === 'delivered' ? 100 : status === 'verification' ? 98 : status === 'transcribing' ? 65 : 0,
        chunksTotal,
        chunksCompleted: status === 'delivered' || status === 'verification' ? chunksTotal : Math.floor(chunksTotal * 0.65),
        rawAiDraft: `[00:00:04] UNKNOWN: silence in court case number ${docketNumber} in the matter of ${title}.\n[00:00:15] SPEAKER 1: appearances for the state and defense.\n[00:00:28] SPEAKER 2: may it please the court j smith appearing for the applicant.\n[00:01:04] SPEAKER 3: i confirm under solemn oath that the record of proceedings reflects true verbatim recollection.\n[00:05:22] SPEAKER 1: proceed with testimony under section 212 of the criminal procedure act.`,
        transcriptText: `*** JUDICORE LEGAL PLATFORM - CERTIFIED VERBATIM RECORD ***\nCASE DOCKET: ${docketNumber}\nMATTER: ${title}\nCOURT DIVISION: ${townObj.courtName} (${townObj.courtDivision})\nREGION: ${reg.region} | TOWN: ${townObj.name}\nPRESIDING OFFICER: Hon. Lady Justice M. Shilongo\n\n[00:00:04] COURT CLERK: Silence in court. Case number ${docketNumber} in the matter of ${title}.\n[00:00:15] PRESIDING JUDGE: Appearances for the State and Defense.\n[00:00:28] ADV. J. SMITH: May it please the Court, J. Smith appearing for the applicant.\n[00:01:04] WITNESS: I confirm under solemn oath that the record of proceedings reflects true verbatim recollection.\n[00:05:22] PRESIDING JUDGE: Proceed with testimony under Section 212 of the Criminal Procedure Act.`,
        accuracyScore: 98.6,
        wordCount: pages * 280,
        billingStatus: status === 'delivered' ? (i % 2 === 0 ? 'paid' : 'pending') : 'pending',
        totalAmountNad,
        invoiceNumber: `INV-2024-${String(8000 + caseCounter)}`,
        pages,
        ratePerPage,
        hasLegalAI,
        legalAiFee,
        isVerified,
        proofreadBy: status === 'delivered' || status === 'verification' || status === 'pending_final_check' ? 'Michael Chen (Senior Court Proofreader)' : undefined,
        proofreadAt: status === 'delivered' || status === 'verification' || status === 'pending_final_check' ? `${hearingDate} 10:45` : undefined,
        proofreadNotes: 'Acoustic terminology and statutory citations cross-checked against court master audio.',
        verifiedBy: isVerified ? 'Jane Doe, Transcription Center Manager' : undefined,
        verifiedAt: isVerified ? `${hearingDate} 11:30` : undefined,
        managerApprovedBy: isVerified ? 'Jane Doe, Center Manager' : undefined,
        managerApprovedAt: isVerified ? `${hearingDate} 11:30` : undefined,
        verificationNotes: isVerified ? 'Full acoustic and legal terminology verified against master courtroom audio channel.' : undefined,
        deliveredAt: isVerified ? hearingDate : undefined,
        whatsappStatus: !isGov && isVerified ? 'delivered' : 'none',
        whatsappSentAt: !isGov && isVerified ? `${hearingDate} 11:32` : undefined,
        archived: status === 'archived',
        search_text: `${docketNumber} ${title} ${reg.region} ${townObj.name} ${caseClass} ${subClass} Hon. Lady Justice M. Shilongo J. Smith`.toLowerCase(),
      });
    }
  });

  return result;
}

export const INITIAL_REQUESTS: TranscriptRequest[] = [];

export const INITIAL_INVOICES: JudicialInvoice[] = [
  {
    invoiceNumber: 'INV-2024-00891',
    requestId: 'REQ-00135',
    caseNumber: '2024-CR-01892',
    caseTitle: 'The State v Johannes Nuuyoma & Others',
    date: 'Oct 29, 2024',
    caseClass: 'criminal',
    durationText: '03:30:00',
    hasLegalAI: true,
    legalAiFee: 450.0,
    billedTo: {
      userId: 'usr-lawyer-01',
      name: 'J. Smith, Attorney',
      firmOrDepartment: 'Smith & Partners Legal Advocates',
      taxId: 'TIN-NAM-4902188',
      email: 'jsmith@smithlaw.com.na',
      region: 'Khomas',
      town: 'Windhoek',
    },
    transcriptPages: 52,
    ratePerPage: 35.0,
    lineItems: [
      {
        description: 'Certified Court Verbatim Transcript (52 pages @ N$ 35.00/page)',
        quantity: 52,
        unitPriceNad: 35.0,
        totalNad: 1820.0,
      },
      {
        description: 'Verbit Legal AI Analysis & Inconsistency Report',
        quantity: 1,
        unitPriceNad: 450.0,
        totalNad: 450.0,
      },
    ],
    subtotalNad: 2270.0,
    vatNad: 340.5,
    totalNad: 2610.5,
    paymentStatus: 'paid',
    paymentMethod: 'Bank Windhoek EFT',
    paymentReference: 'BW-EFT-991042',
    paidAt: 'Oct 29, 2024, 02:45 PM',
    revenueStampCode: 'REV-STAMP-NAM-2024-884912',
  },
  {
    invoiceNumber: 'INV-2024-00892',
    requestId: 'REQ-00140',
    caseNumber: '2024-CV-00451',
    caseTitle: 'Teachers Union v Minister of Basic Education',
    date: 'Oct 25, 2024',
    caseClass: 'civil',
    durationText: '02:30:00',
    hasLegalAI: false,
    legalAiFee: 0,
    billedTo: {
      userId: 'usr-lawyer-01',
      name: 'J. Smith, Attorney',
      firmOrDepartment: 'Smith & Partners Legal Advocates',
      taxId: 'TIN-NAM-4902188',
      email: 'jsmith@smithlaw.com.na',
      region: 'Khomas',
      town: 'Windhoek',
    },
    transcriptPages: 38,
    ratePerPage: 35.0,
    lineItems: [
      {
        description: 'Certified Court Verbatim Transcript (38 pages @ N$ 35.00/page)',
        quantity: 38,
        unitPriceNad: 35.0,
        totalNad: 1330.0,
      },
    ],
    subtotalNad: 1330.0,
    vatNad: 199.5,
    totalNad: 1529.5,
    paymentStatus: 'pending',
  },
  {
    invoiceNumber: 'INV-2024-00893',
    requestId: 'REQ-00142',
    caseNumber: 'CR-2024-0891',
    caseTitle: 'The State v Nuuyoma & Others',
    date: 'Oct 28, 2024',
    caseClass: 'criminal',
    durationText: '03:00:00',
    hasLegalAI: true,
    legalAiFee: 450.0,
    billedTo: {
      userId: 'usr-gov-06',
      name: 'Hon. Festus Shanghala',
      firmOrDepartment: 'Ministry of Justice (Department of Judicial Court Services)',
      taxId: 'MOJ-VOTE-16',
      email: 'festus.shanghala@moj.gov.na',
      region: 'Khomas',
      town: 'Windhoek',
    },
    transcriptPages: 45,
    ratePerPage: 25.0,
    lineItems: [
      {
        description: 'Government Verbatim Transcript (45 pages @ N$ 25.00/page - Normal)',
        quantity: 45,
        unitPriceNad: 25.0,
        totalNad: 1125.0,
      },
      {
        description: 'Verbit Legal AI Analysis Service',
        quantity: 1,
        unitPriceNad: 450.0,
        totalNad: 450.0,
      },
    ],
    subtotalNad: 1575.0,
    vatNad: 236.25,
    totalNad: 1811.25,
    paymentStatus: 'paid',
    paymentMethod: 'State Exemption Voucher',
    paymentReference: 'MOJ-VOUCHER-2024-118',
    paidAt: 'Oct 28, 2024, 04:15 PM',
    revenueStampCode: 'REV-STAMP-NAM-2024-910244',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2024-10-29 14:45:12',
    requestId: 'REQ-00135',
    caseNumber: '2024-CR-01892',
    action: 'PAYMENT_COMPLETED',
    userName: 'J. Smith, Attorney',
    userRole: 'Senior Defense Counsel',
    details: 'Invoice INV-2024-00891 settled via Bank Windhoek EFT (Ref: BW-EFT-991042). Revenue stamp REV-STAMP-NAM-2024-884912 issued.',
  },
  {
    id: 'aud-002',
    timestamp: '2024-10-29 11:32:00',
    requestId: 'REQ-00135',
    caseNumber: '2024-CR-01892',
    action: 'WHATSAPP_NOTIFICATION_SENT',
    userName: 'System (WhatsApp Cloud API)',
    userRole: 'Automated Bot',
    details: 'Sent template "transcript_ready" to +26481248990 for Case 2024-CR-01892. Status: Delivered & Read.',
  },
  {
    id: 'aud-003',
    timestamp: '2024-10-29 10:14:22',
    requestId: 'REQ-00135',
    caseNumber: '2024-CR-01892',
    action: 'HUMAN_VERIFIED',
    userName: 'Jane Doe',
    userRole: 'Transcription Center Manager',
    details: 'Quality Control review completed. Verifier signature applied and audio link released to Requester Portal.',
  },
  {
    id: 'aud-004',
    timestamp: '2024-10-28 16:30:19',
    requestId: 'REQ-00142',
    caseNumber: 'CR-2024-0891',
    action: 'OCR_DOCKET_INGESTED',
    userName: 'Hon. Lady Justice M. Shilongo',
    userRole: 'Presiding Judge of the High Court',
    details: 'Court docket document ingested via OCR. Case CR-2024-0891 (State v Nuuyoma) mapped to TranscriptRequest.',
  },
];
