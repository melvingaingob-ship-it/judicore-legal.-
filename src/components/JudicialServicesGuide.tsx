import React from 'react';
import {
  Scale,
  Mic,
  ShieldCheck,
  Headphones,
  Sparkles,
  CreditCard,
  FileCheck,
  MapPin,
  Building,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gavel,
  Users,
} from 'lucide-react';
import { NAMIBIA_REGIONS } from '../data/namibiaRegions';

interface JudicialServicesGuideProps {
  onNavigateTab?: (tab: 'requester' | 'staff' | 'admin' | 'advisor' | 'billing' | 'export') => void;
}

export const JudicialServicesGuide: React.FC<JudicialServicesGuideProps> = ({
  onNavigateTab,
}) => {
  const services = [
    {
      icon: <Mic className="w-6 h-6 text-blue-600" />,
      title: 'Verbatim Courtroom Audio & AI Diarization',
      badge: 'Core Service',
      description:
        'Secure multi-track courtroom audio capture with speaker identification and microsecond timestamp synchronization tailored for Namibian legal discourse, multilingual testimony (English, Oshiwambo, Afrikaans), and formal courtroom nomenclature.',
      benefits: [
        'Automated speaker diarization (Judge, Prosecutor, Defense, Witness)',
        'Accurate handling of Roman-Dutch legal citations and statutory references',
        'Direct synchronization between verbatim transcript text and audio playback',
      ],
      actionTab: 'staff' as const,
      actionLabel: 'Explore Transcription Engine',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: 'Mandatory Human Verification Quality Gate',
      badge: 'Quality Assurance',
      description:
        'Every draft transcript undergoes rigorous quality control by accredited Senior Transcription Center Managers before release. Involves side-by-side comparison diffs, accuracy scoring, and 4-point judicial checklists.',
      benefits: [
        'Side-by-side AI vs. Staff comparison diff highlighting',
        'Official verifier signature stamp & audit trail logging',
        'Automated revision workflow with manager correction comments',
      ],
      actionTab: 'admin' as const,
      actionLabel: 'Inspect Verification Queue',
    },
    {
      icon: <Lock className="w-6 h-6 text-amber-600" />,
      title: 'Stream-Only Evidentiary Audio Security',
      badge: 'Judicial Security',
      description:
        'To preserve the integrity of court records and protect witness confidentiality, raw courtroom master audio recordings are strictly stream-only. Downloading raw audio files is blocked, while certified watermarked transcripts remain fully exportable.',
      benefits: [
        'Zero-download streaming link architecture for evidentiary safety',
        'Tamper-evident audit ledger tracking every stream and download event',
        'Compliance with in-camera trial protections and Child Justice provisions',
      ],
      actionTab: 'requester' as const,
      actionLabel: 'View Security Protocols',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: 'Verbit Legal Advisor AI',
      badge: 'AI Intelligence',
      description:
        'A specialized courtroom AI research assistant grounded in the Constitution of the Republic of Namibia, the High Court Rules, the Criminal Procedure Act 51 of 1977, and leading Superior Court neutral precedents.',
      benefits: [
        'Rule 73(4) High Court urgency test assessment',
        'Bail criteria analysis under CPA Sections 60 & 61',
        'Automated transcript analysis, contradiction detection, and headnote synthesis',
      ],
      actionTab: 'advisor' as const,
      actionLabel: 'Launch Verbit Legal Advisor',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      title: 'Judicial Paygate & Gazetted Tariff Billing',
      badge: 'Financial Clearing',
      description:
        'Official electronic payment settlement integrated with Namibian banking institutions (Bank Windhoek, FNB PayPulse, Visa/Mastercard via DPO PayGate) managed securely in the Admin Center Paygate Desk.',
      benefits: [
        'Transparent fee calculation (N$ 35/folio, N$ 12.50/audio minute)',
        'Automated 15% Namibian VAT Tax Invoices & Official Revenue Stamps',
        'Instant payment clearance and Legal Aid/State exemption handling',
      ],
      actionTab: 'admin' as const,
      actionLabel: 'Access Admin Center Paygate',
    },
    {
      icon: <FileCheck className="w-6 h-6 text-sky-600" />,
      title: 'Certified Watermarked Transcripts & Legal Export',
      badge: 'Legal Evidentiary',
      description:
        'Instantly export certified verbatim court records embossed with the official JudiCore tamper-evident legal watermark, neutral citation headers, and verifiable registry certificate stamps ready for presentation in Superior & Subordinate Courts.',
      benefits: [
        'Standardized Namibian High Court & Supreme Court record format',
        'Formal title block with presiding officers, counsel, and case dockets',
        'Direct print view with court seal and cryptographic verification code',
      ],
      actionTab: 'export' as const,
      actionLabel: 'View Certified Exports',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      {/* Hero Presentation */}
      <div className="bg-gradient-to-br from-[#0A1931] via-[#102A45] to-[#1E3A8A] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden space-y-6">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <Scale className="w-3.5 h-3.5 text-blue-300" />
            <span>Republic of Namibia · JudiCore Judicial Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Professional Court Transcription, AI Advisory & Judicial Management Services
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-light">
            JudiCore provides an end-to-end, bank-grade digital courtroom infrastructure built specifically for the Namibian Judicial System. We bridge courtroom audio recordings, AI-assisted transcription, human quality verification, and legal paygate processing across all 14 Regions of Namibia.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 relative z-10">
          <div>
            <div className="text-2xl font-bold font-mono text-blue-300">14 Regions</div>
            <div className="text-xs text-blue-200/80">National Magisterial Reach</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-300">100% Verbatim</div>
            <div className="text-xs text-blue-200/80">Human Verified Standards</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-amber-300">Stream-Only</div>
            <div className="text-xs text-blue-200/80">Audio Evidentiary Safeguard</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-300">Verbit AI</div>
            <div className="text-xs text-blue-200/80">Namibian Legal Advisory</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0A1931]">
            Comprehensive Judicial Services
          </h2>
          <p className="text-xs text-slate-500">
            Designed in strict accordance with the Superior Courts Practice Directives, High Court Rules, and the Legal Practitioners Act
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                    {srv.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {srv.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-[#0A1931]">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Key Features:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {srv.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {onNavigateTab && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateTab(srv.actionTab)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    <span>{srv.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Regional Magisterial Coverage Showcase */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-[#0A1931]">
                National Coverage Across all 14 Regions of Namibia
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Serving the Supreme Court, High Court Main & Northern Divisions, and District Magistrate Benches
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
            14 Regions · 42+ Magistrate Stations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {NAMIBIA_REGIONS.map((reg) => (
            <div
              key={reg.region}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0A1931]">{reg.region}</span>
                <span className="font-mono text-[10px] text-blue-600 font-semibold">{reg.towns.length} towns</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Main: {reg.towns[0]?.name}</div>
              <div className="text-[10px] text-slate-400 truncate" title={reg.towns.map((t) => t.name).join(', ')}>
                {reg.towns.map((t) => t.name).slice(0, 2).join(', ')}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
