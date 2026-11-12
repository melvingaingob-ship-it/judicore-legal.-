import React, { useState } from 'react';
import {
  TranscriptRequest,
  RequestType,
  UserProfile,
  CaseClass,
  CASE_CLASS_CONFIG,
} from '../types/court';
import { NAMIBIA_REGIONS, getTownsByRegion } from '../data/namibiaRegions';
import {
  FilePlus,
  ClipboardList,
  Calendar,
  Send,
  Headphones,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  Volume2,
  X,
  Play,
  Pause,
  Sparkles,
  Upload,
  Building,
} from 'lucide-react';
import { CourtAudioEngine, formatTimeSeconds } from '../utils/audioPlayerEngine';
import { LegalAiAnalysisModal } from './LegalAiAnalysisModal';
import { UploadFromFilesModal } from './UploadFromFilesModal';
import { AudioPlayer } from './AudioPlayer';
import { calculatePricing, UrgencyTier } from '../utils/pricing';

interface RequesterPortalProps {
  currentUser: UserProfile;
  requests: TranscriptRequest[];
  onSubmitRequest: (newRequest: Omit<TranscriptRequest, 'id' | 'status' | 'dateRequested' | 'dueDate'>) => void;
  onDownloadTranscript: (request: TranscriptRequest) => void;
  onOpenPaygate?: () => void;
  onOpenProfile?: () => void;
}

export const RequesterPortal: React.FC<RequesterPortalProps> = ({
  currentUser,
  requests,
  onSubmitRequest,
  onDownloadTranscript,
  onOpenPaygate,
  onOpenProfile,
}) => {
  // Form State
  const [caseNumber, setCaseNumber] = useState('2024-CR-01892');
  const [caseTitle, setCaseTitle] = useState('The State v Johannes Nuuyoma & Others');
  const [caseClass, setCaseClass] = useState<CaseClass>('criminal');
  const [caseSubClass, setCaseSubClass] = useState('State Trial');
  const [region, setRegion] = useState(currentUser.region || 'Khomas');
  const [town, setTown] = useState(currentUser.town || 'Windhoek');
  const [courtDivision, setCourtDivision] = useState(currentUser.courtOrFirm || 'High Court of Namibia (Main Division)');
  const [hearingDate, setHearingDate] = useState('2024-10-28');
  const [requestType, setRequestType] = useState<RequestType>('Full Transcript');
  const [urgencyTier, setUrgencyTier] = useState<UrgencyTier>('Normal');
  const [pagesCount, setPagesCount] = useState<number>(45);
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Ready Document Popup State
  const [selectedReadyRequest, setSelectedReadyRequest] = useState<TranscriptRequest | null>(null);
  const [analyzingRequest, setAnalyzingRequest] = useState<TranscriptRequest | null>(null);

  // Upload from Files Modal State
  const [isUploadFilesModalOpen, setIsUploadFilesModalOpen] = useState(false);
  const [uploadFilesMode, setUploadFilesMode] = useState<'document' | 'audio' | 'auto'>('auto');

  // Audio Streaming Modal State (Audio is stream-only, NO download)
  const [streamingAudioRequest, setStreamingAudioRequest] = useState<TranscriptRequest | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(295);

  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number | null>(null);
  const [isAudioAnalyzing, setIsAudioAnalyzing] = useState(false);
  const [audioMetricsInfo, setAudioMetricsInfo] = useState<{
    fileName: string;
    durationSeconds: number;
    pages: number;
  } | null>(null);

  // Automated audio loading calculation handler
  const processAudioDuration = (fileName: string, durationSeconds: number) => {
    const validDuration = Math.max(10, Math.round(durationSeconds));
    setAudioDurationSeconds(validDuration);

    // Calculate pages assuming ~1.2 minutes (72 seconds) of spoken audio per transcript page
    const calculatedPages = Math.max(1, Math.ceil(validDuration / (60 * 1.2)));
    setPagesCount(calculatedPages);

    setAudioMetricsInfo({
      fileName,
      durationSeconds: validDuration,
      pages: calculatedPages,
    });
    setIsAudioAnalyzing(false);
  };

  const handleAudioUpload = (file?: File | null) => {
    if (!file) return;
    setAudioFile(file);
    setIsAudioAnalyzing(true);

    const audioUrl = URL.createObjectURL(file);
    const audioContextElement = document.createElement('audio');
    audioContextElement.preload = 'metadata';
    audioContextElement.src = audioUrl;

    audioContextElement.onloadedmetadata = () => {
      const dur = audioContextElement.duration;
      if (dur && !isNaN(dur) && dur !== Infinity && dur > 0) {
        processAudioDuration(file.name, dur);
      } else {
        // Fallback by size: 1 MB ≈ 60 seconds
        const estSecs = Math.max(60, Math.round((file.size / (1024 * 1024)) * 60));
        processAudioDuration(file.name, estSecs);
      }
      URL.revokeObjectURL(audioUrl);
    };

    audioContextElement.onerror = () => {
      const estSecs = Math.max(60, Math.round((file.size / (1024 * 1024)) * 60));
      processAudioDuration(file.name, estSecs);
      URL.revokeObjectURL(audioUrl);
    };
  };

  const handleLoadSampleAudio = (url: string, name: string) => {
    setIsAudioAnalyzing(true);
    const audioElem = document.createElement('audio');
    audioElem.preload = 'metadata';
    audioElem.src = url;

    audioElem.onloadedmetadata = () => {
      const dur = audioElem.duration && !isNaN(audioElem.duration) && audioElem.duration > 0 ? audioElem.duration : 180;
      processAudioDuration(name, dur);
      setAudioFile(new File([''], name, { type: 'audio/webm' }));
    };

    audioElem.onerror = () => {
      processAudioDuration(name, 240);
      setAudioFile(new File([''], name, { type: 'audio/webm' }));
    };
  };

  // Calculate pricing: Government vs Private, Urgent vs Normal
  const pricing = calculatePricing(currentUser, urgencyTier, pagesCount);

  const availableCases = [
    { number: '2024-CR-01892', title: 'The State v Johannes Nuuyoma & Others' },
    { number: '2024-CV-00451', title: 'Teachers Union v Minister of Basic Education' },
    { number: '2023-CR-11022', title: 'The State v Katjiua Formal Bail Application' },
    { number: 'CR-2024-0891', title: 'The State v Nuuyoma & Others' },
    { number: 'CV-2024-1123', title: 'Namibia Breweries Ltd v Camelthorn Distillers' },
    { number: 'CR-2024-0887', title: 'The State v Katjiua & Another' },
    { number: 'LCA-ND-2026/0018', title: 'Mine Workers Union v Navachab Gold Mine' },
  ];

  // Filter requests submitted by this user (or show all for demo if needed)
  const userRequests = requests.filter(
    (r) => r.requestedBy.roleKey === currentUser.role || currentUser.role === 'lawyer'
  );

  const handleSelectPreset = (c: { number: string; title: string }) => {
    setCaseNumber(c.number);
    setCaseTitle(c.title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber.trim()) return;

    const matched = availableCases.find((c) => c.number.toLowerCase() === caseNumber.trim().toLowerCase());

    onSubmitRequest({
      caseNumber: caseNumber.trim(),
      caseTitle: caseTitle.trim() || matched?.title || 'Court Proceedings',
      hearingDate,
      requestType,
      caseClass,
      caseSubClass: caseSubClass || CASE_CLASS_CONFIG[caseClass].label,
      region,
      town,
      courtDivision,
      urgency: `${urgencyTier} (${pricing.turnaroundText})`,
      urgencyTier,
      pages: pagesCount,
      ratePerPage: pricing.ratePerPage,
      totalAmountNad: pricing.totalNad,
      pricingTierDescription: `${pricing.userCategory} ${urgencyTier}: N$${pricing.ratePerPage}/page (${pricing.turnaroundText})`,
      notes,
      audioDurationSeconds: audioDurationSeconds || 295,
      audioFile: audioFile
        ? {
            name: audioFile.name,
            durationSeconds: audioDurationSeconds || 295,
            uploadedBy: currentUser.name,
            uploadedAt: 'Just now',
          }
        : undefined,
      requestedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.title,
        roleKey: currentUser.role,
      },
    });

    setNotes('');
    setAudioFile(null);
    setAudioDurationSeconds(null);
    setAudioMetricsInfo(null);
  };

  const handleOpenStreamModal = (req: TranscriptRequest) => {
    setStreamingAudioRequest(req);
    setIsPlayingAudio(true);
    setAudioCurrentTime(0);
    setAudioDuration(req.audioFile?.durationSeconds || 295);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Title & Subtitle Matching Image 1 + Accredited Profile Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            My Transcript Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and request court hearing transcripts for your cases
          </p>
        </div>

        {/* Accredited Identification Badge */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:px-4 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {currentUser.badge || 'JC'}
            </div>
            <div>
              <div className="text-xs font-bold text-[#0A1931]">{currentUser.companyOrFirmName || currentUser.courtOrFirm}</div>
              <div className="text-[10px] text-slate-500">
                {currentUser.town || 'Windhoek'}, {currentUser.region || 'Khomas'} Region · {currentUser.stateMagistrateCourt || 'Magistrate Station'}
              </div>
            </div>
          </div>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Card 1: Request New Transcript (Matching Image 1) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header section without upload button on top bar */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0A1931]">Submit a new transcript request</h2>
            <p className="text-xs text-gray-500">Fill out details below - Audio 0-10+ hours supported</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCaseNumber('');
                setCaseTitle('');
                setAudioFile(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition"
            >
              + New Request
            </button>
          </div>
        </div>

        {audioFile && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Audio attached: <strong>{audioFile.name}</strong> ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB) · 0–10+ hours supported</span>
            </div>
            <button
              type="button"
              onClick={() => setAudioFile(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Row 1: Case Number & Hearing Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Case Number</label>
              <input
                className="w-full border border-slate-300 rounded-lg p-2.5 mt-1 font-mono text-[#0A1931]"
                placeholder="CR-2024-0891"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Hearing Date</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2.5 mt-1 text-[#0A1931]"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 1b: Case Title / Parties */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Case Title / Parties
            </label>
            <input
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="e.g. The State v Johannes Nuuyoma & Others"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0A1931] focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Row 1c: Case Classification & Region / Town Jurisdiction */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Case Classification
              </label>
              <select
                value={caseClass}
                onChange={(e) => {
                  const cc = e.target.value as CaseClass;
                  setCaseClass(cc);
                  setCaseSubClass(CASE_CLASS_CONFIG[cc]?.commonSubClasses[0] || CASE_CLASS_CONFIG[cc]?.label);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0A1931] font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {Object.entries(CASE_CLASS_CONFIG).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label} ({info.prefix})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Namibia Region (14 Regions)
              </label>
              <select
                value={region}
                onChange={(e) => {
                  const reg = e.target.value;
                  setRegion(reg);
                  const towns = getTownsByRegion(reg);
                  if (towns.length > 0) {
                    setTown(towns[0].name);
                    setCourtDivision(towns[0].courtDivision);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0A1931] font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {NAMIBIA_REGIONS.map((r) => (
                  <option key={r.region} value={r.region}>
                    {r.region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Magisterial Town / Station
              </label>
              <select
                value={town}
                onChange={(e) => {
                  const tName = e.target.value;
                  setTown(tName);
                  const towns = getTownsByRegion(region);
                  const matchedTown = towns.find((t) => t.name === tName);
                  if (matchedTown) setCourtDivision(matchedTown.courtDivision);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0A1931] font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
              >
                {getTownsByRegion(region).map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.courtDivision})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Request Type (3 big buttons: Full Transcript, Summary, Audio Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Request Type
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {(['Full Transcript', 'Summary', 'Audio Only'] as RequestType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setRequestType(t)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center ${
                    requestType === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Urgency (Urgent/Normal) & Estimated Pages with Live Tariff Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Urgency (Turnaround Tier)
              </label>
              <select
                value={urgencyTier}
                onChange={(e) => setUrgencyTier(e.target.value as UrgencyTier)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0A1931] font-semibold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Normal">Normal — 24-hour turnaround</option>
                <option value="Urgent">Urgent — 2-hour turnaround</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Pages / Folios
              </label>
              <input
                type="number"
                min={1}
                value={pagesCount}
                onChange={(e) => setPagesCount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0A1931] font-mono font-bold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Add special instructions or court room..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-[#0A1931] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Form Body Audio Attachment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Court Master Audio Recording (Upload for Auto-Calculation)
              </label>
              <span className="text-[11px] text-blue-600 font-semibold">
                Pages and billing amounts are automatically calculated upon loading audio
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition">
                <span>📁 Select Audio File (MP3, WAV, AAC, M4A)</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleAudioUpload(e.target.files?.[0])}
                />
              </label>
              <span className="text-[11px] text-slate-400">
                {audioFile ? `Selected: ${audioFile.name}` : 'Supports files 0–10+ hours long'}
              </span>
            </div>

            {/* Quick Sample Audio Loaders */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Quick load court sample:</span>
              <button
                type="button"
                onClick={() => handleLoadSampleAudio('/uploads/HarasebvRossing.prt1.aac', 'HarasebvRossing.prt1.aac')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition"
              >
                HarasebvRossing.aac
              </button>
              <button
                type="button"
                onClick={() => handleLoadSampleAudio('/uploads/courtroom_audio.webm', 'courtroom_audio.webm')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition"
              >
                Courtroom Session.webm
              </button>
            </div>

            {/* Real-time System Auto-Calculation Banner */}
            {isAudioAnalyzing && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-800 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Analyzing audio recording duration &amp; computing system pages and amounts...</span>
              </div>
            )}

            {audioMetricsInfo && (
              <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A1931] flex items-center gap-2">
                      <span>{audioMetricsInfo.fileName}</span>
                      <span className="text-[10px] font-mono text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                        {formatTimeSeconds(audioMetricsInfo.durationSeconds)}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-medium">
                      ⚡ <strong>System Auto-Calculated:</strong> {pagesCount} pages (~1.2 min/page court standard)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Calculated Total</span>
                  <span className="text-base font-extrabold text-blue-700 font-mono">
                    N$ {pricing.totalNad.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Tiers & Calculation Breakdown Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  urgencyTier === 'Urgent'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                }`}>
                  {pricing.userCategory} {urgencyTier} ({pricing.turnaroundText})
                </span>
                <span className="font-bold font-mono text-slate-800">
                  Rate: N$ {pricing.ratePerPage}.00 / page
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Formula: amount = {pagesCount} pages × N${pricing.ratePerPage} = N$ {pricing.subtotalNad.toFixed(2)} (+15% Tax: N$ {pricing.vatNad.toFixed(2)})
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Estimated Amount Due</span>
              <span className="text-lg font-bold font-mono text-blue-600">
                N$ {pricing.totalNad.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Request ({pricing.turnaroundText})</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: My Requests (Matching Image 1) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 relative">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0A1931]">
              My Requests
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage your submitted requests
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Date Requested</th>
                <th className="py-3 px-4">Turnaround & Tier Requested</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0A1931]">
              {userRequests.map((req) => {
                const isReady = req.status === 'delivered';
                const isInProgress = req.status === 'assigned' || req.status === 'transcribing' || req.status === 'verification';
                const isRequested = req.status === 'pending';
                const isUrgent = req.urgency?.toLowerCase().includes('urgent');

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-blue-600">
                      <div>{req.caseNumber}</div>
                      {req.caseTitle && (
                        <div className="text-[10px] font-sans text-slate-400 font-normal truncate max-w-xs">{req.caseTitle}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.dateRequested}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isUrgent ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {req.urgency || (isUrgent ? 'Urgent (2-hour)' : 'Normal (24-hour)')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {req.pages || 45} pages @ N$ {req.ratePerPage || (currentUser.role === 'government' ? (isUrgent ? 30 : 25) : (isUrgent ? 41 : 35))}/pg · N$ {(req.totalAmountNad || (req.pages || 45) * 35).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isReady ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Requested
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {isReady ? (
                        <>
                          <button
                            onClick={() => setAnalyzingRequest(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                            title="Analyze this transcript with Verbit Legal AI"
                          >
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Analyze with Legal AI</span>
                          </button>
                          <button
                            onClick={() => setSelectedReadyRequest(req)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>View Audio & Ready Documents</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 inline-flex items-center gap-1 cursor-not-allowed">
                          <span>Processing in Admin Center...</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* The Exact Popup Card: Document Ready */}
        {selectedReadyRequest && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Document Ready</span>
                </div>
                <button
                  onClick={() => setSelectedReadyRequest(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Your requested court transcript and hearing recording for{' '}
                <strong className="text-[#0A1931]">{selectedReadyRequest.caseNumber}</strong> are prepared.
              </p>

              {/* Requirement: Audio Stream Only + Transcript Download */}
              <div className="space-y-2.5 pt-1">
                {/* Audio: Stream Only */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-[#0A1931] font-semibold">
                    <Headphones className="w-4 h-4 text-blue-600" />
                    <span>Audio: Stream Only</span>
                  </div>
                  <button
                    onClick={() => {
                      handleOpenStreamModal(selectedReadyRequest);
                      setSelectedReadyRequest(null);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    Play Stream
                  </button>
                </div>

                {/* Transcript: Download PDF */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-[#0A1931] font-semibold">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>Transcript: Download PDF</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Certified Record</span>
                </div>

                {/* Analyze with Legal AI Button */}
                <button
                  onClick={() => {
                    const req = selectedReadyRequest;
                    setSelectedReadyRequest(null);
                    setAnalyzingRequest(req);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Analyze with Legal AI</span>
                </button>
              </div>

              {/* Blue Download PDF Button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    onDownloadTranscript(selectedReadyRequest);
                    setSelectedReadyRequest(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certified PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legal AI Modal */}
      <LegalAiAnalysisModal
        isOpen={!!analyzingRequest}
        onClose={() => setAnalyzingRequest(null)}
        request={analyzingRequest}
        transcriptText={analyzingRequest?.transcriptText}
      />

      {/* Audio Streaming Modal: ENFORCES STREAM-ONLY (NO DOWNLOAD) */}
      {streamingAudioRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Headphones className="w-5 h-5 text-blue-600" />
                <span>Court Audio Stream (Protected Recording)</span>
              </div>
              <button
                onClick={() => setStreamingAudioRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-blue-600">
                {streamingAudioRequest.caseNumber}
              </div>
              <div className="text-sm font-bold text-[#0A1931] mt-0.5">
                {streamingAudioRequest.caseTitle}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                File: {streamingAudioRequest.audioFile?.name || 'Master_Court_Audio.wav'} · Hearing Date: {streamingAudioRequest.hearingDate}
              </div>
            </div>

            {/* Access Control Notice (Rule: Audio is link-only, no download) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Access Control Enforced:</strong> Under judicial rules, courtroom audio records are stream-only. Downloading or copying raw audio files is restricted.
              </div>
            </div>

            {/* Stream Audio Player with 100% Volume & Sound */}
            <AudioPlayer
              file={audioFile}
              fileUrl={streamingAudioRequest.audioFile?.streamUrl}
              onTimeUpdate={(t, d) => {
                setAudioCurrentTime(t);
                if (d > 0) setAudioDuration(d);
              }}
              className="my-2"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStreamingAudioRequest(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload from Files Modal */}
      <UploadFromFilesModal
        isOpen={isUploadFilesModalOpen}
        onClose={() => setIsUploadFilesModalOpen(false)}
        currentUser={currentUser}
        onNewRequest={onSubmitRequest}
        initialMode={uploadFilesMode}
      />
    </div>
  );
};
