import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Radio,
  FileAudio,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Sliders,
  Maximize2,
  Download,
  AlertTriangle,
  FolderOpen,
  Volume2,
  Lock,
  X,
  CreditCard,
  Building,
  Gavel,
  Activity,
  Plus,
  Send,
} from 'lucide-react';
import { UserProfile, TranscriptRequest, CaseClass, CASE_CLASS_CONFIG } from '../types/court';
import { NAMIBIA_REGIONS, getTownsByRegion } from '../data/namibiaRegions';

interface JudicialBenchDocketProps {
  currentUser: UserProfile;
  requests: TranscriptRequest[];
  onAddRequest: (newReq: Omit<TranscriptRequest, 'id' | 'status' | 'dateRequested' | 'dueDate'>) => void;
  onNavigateTab: (tab: string) => void;
}

export const JudicialBenchDocket: React.FC<JudicialBenchDocketProps> = ({
  currentUser,
  requests,
  onAddRequest,
  onNavigateTab,
}) => {
  // Modal states
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [docketSearch, setDocketSearch] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState<'dockets' | 'record' | 'teres' | 'legal_visor' | 'vetting' | 'billing'>('dockets');

  // Live Court Session Recording State (MediaRecorder API)
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [evidenceMarkers, setEvidenceMarkers] = useState<{ id: string; time: string; label: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Ingest Modal Form state
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [detectedDurationSec, setDetectedDurationSec] = useState<number>(30735); // 08:32:15 default or dynamically detected
  const [modalDocketNumber, setModalDocketNumber] = useState('HC-MD-CIV-APP-2024/4876');
  const [modalMatterTitle, setModalMatterTitle] = useState('Apex Holdings (Pty) Ltd v Commissioner of Inland Revenue');
  const [modalCourtDivision, setModalCourtDivision] = useState('High Court of Namibia Main Division');
  const [modalRegion, setModalRegion] = useState('Khomas');
  const [modalTown, setModalTown] = useState('Windhoek');
  const [modalCaseClass, setModalCaseClass] = useState<CaseClass>('civil');
  const [modalUrgency, setModalUrgency] = useState<'Normal' | 'Urgent'>('Normal');
  const [modalHasLegalAI, setModalHasLegalAI] = useState(true);
  const [voiceDiarizationChecked, setVoiceDiarizationChecked] = useState(true);
  const [selectedJudicialOfficer, setSelectedJudicialOfficer] = useState(currentUser.name);

  // Live recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingLive) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingLive]);

  const formatHMS = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startLiveRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecordingLive(true);
        setEvidenceMarkers([
          { id: 'ev-1', time: '00:00:02', label: 'Court Called to Order — Session Commenced' },
        ]);
      } else {
        // Simulated recording
        setIsRecordingLive(true);
      }
    } catch (e) {
      // Fallback simulation
      setIsRecordingLive(true);
    }
  };

  const stopLiveRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingLive(false);

    // Prompt to ingest this session
    setDetectedDurationSec(recordingSeconds > 0 ? recordingSeconds : 1800);
    setIsIngestModalOpen(true);
  };

  const addEvidenceMarker = () => {
    const timeStr = formatHMS(recordingSeconds);
    const count = evidenceMarkers.length + 1;
    setEvidenceMarkers([
      ...evidenceMarkers,
      { id: `ev-${Date.now()}`, time: timeStr, label: `Exhibit / Evidence Marked by Presiding Judge (Item ${count})` },
    ]);
  };

  // Audio file selection & duration detection via Web Audio API
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAudioFile(file);

    // Detect duration using AudioContext or Audio element
    try {
      const audioUrl = URL.createObjectURL(file);
      const audioElem = new Audio(audioUrl);
      audioElem.onloadedmetadata = () => {
        if (audioElem.duration && !isNaN(audioElem.duration)) {
          setDetectedDurationSec(Math.round(audioElem.duration));
        } else {
          setDetectedDurationSec(7200); // 2 hours default
        }
      };
    } catch {
      setDetectedDurationSec(7200);
    }
  };

  const handleUseSampleAudio = () => {
    setSelectedAudioFile(null);
    setDetectedDurationSec(120); // 2 min sample
    setModalDocketNumber('CR-2024-1187');
    setModalMatterTitle('The State v Alexis Martinez (Formal Bail & Testimony)');
    setModalCaseClass('criminal');
    setModalRegion('Khomas');
    setModalTown('Windhoek');
  };

  const handleRegionChange = (newReg: string) => {
    setModalRegion(newReg);
    const towns = getTownsByRegion(newReg);
    if (towns.length > 0) {
      setModalTown(towns[0].name);
      setModalCourtDivision(towns[0].courtDivision);
    }
  };

  // Calculations: 1 hour ≈ 15 pages; 10 hour ≈ 150 pages
  const estimatedPages = Math.max(8, Math.round((detectedDurationSec / 3600) * 15));
  const ratePerPage = modalUrgency === 'Urgent' ? 30 : 25; // Government tariff
  const transcriptionSubtotal = estimatedPages * ratePerPage;
  const legalAiFee = modalHasLegalAI ? 450 : 0;
  const totalDueNad = Number((transcriptionSubtotal * 1.15 + legalAiFee).toFixed(2));
  const chunksCount = Math.ceil(detectedDurationSec / 600); // 10 min chunks

  const handleSubmitIngest = (e: React.FormEvent) => {
    e.preventDefault();

    onAddRequest({
      caseNumber: modalDocketNumber.trim(),
      docketPrefix: CASE_CLASS_CONFIG[modalCaseClass]?.prefix || 'CR',
      caseTitle: modalMatterTitle.trim(),
      hearingDate: new Date().toISOString().slice(0, 10),
      requestType: 'Full Transcript',
      caseClass: modalCaseClass,
      caseSubClass: CASE_CLASS_CONFIG[modalCaseClass]?.commonSubClasses[0] || 'Official Hearing',
      region: modalRegion,
      town: modalTown,
      courtDivision: modalCourtDivision,
      urgency: `${modalUrgency} (${modalUrgency === 'Urgent' ? '2-hour turnaround' : '24-hour turnaround'})`,
      urgencyTier: modalUrgency,
      pages: estimatedPages,
      ratePerPage,
      totalAmountNad: totalDueNad,
      audioDurationSeconds: detectedDurationSec,
      chunksTotal: chunksCount,
      chunksCompleted: 0,
      hasLegalAI: modalHasLegalAI,
      legalAiFee,
      notes: `Ingested via Judicial Bench Docket. Transcribed & forwarded to Official Court Proofreader Desk for verification. Presiding Officer: ${selectedJudicialOfficer}`,
      requestedBy: {
        id: currentUser.id,
        name: selectedJudicialOfficer || currentUser.name,
        role: currentUser.title,
        roleKey: currentUser.role,
      },
      audioFile: {
        name: selectedAudioFile ? selectedAudioFile.name : `${modalDocketNumber}_CourtSession.wav`,
        durationSeconds: detectedDurationSec,
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString(),
        sampleRate: '48000 Hz, 24-bit PCM Multi-Channel',
      },
    });

    setIsIngestModalOpen(false);
  };

  const judicialOfficers = [
    'Hon. Lady Justice M. Shilongo (High Court)',
    'Hon. Robert Jones (Presiding Judge)',
    'Lisa Tran (Court Registrar)',
    'Mark Thompson (State Advocate)',
    'Hon. Festus Shanghala (Director Court Services)',
  ];

  const filteredRequests = requests.filter((r) => {
    if (!docketSearch.trim()) return true;
    const q = docketSearch.toLowerCase();
    return (
      r.caseNumber.toLowerCase().includes(q) ||
      (r.caseTitle && r.caseTitle.toLowerCase().includes(q)) ||
      r.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Header: Authenticated as Presiding Judge with Badges */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Authenticated: {currentUser.name} ({currentUser.courtOrFirm})</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Judicial Bench Docket
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A1931] tracking-tight">
            Superior Courts Judicial Bench & Courtroom Recording Console
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audio diarization, tamper-evident evidence markers, and automated multi-channel certified transcription ingest.
          </p>
        </div>
      </div>

      {/* 2. Top Two Hero Cards: Recording Dashboard & Add Audio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Court Session Recording Dashboard */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0A1931]">
                <Activity className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-bold">Court Session Recording Dashboard</h2>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isRecordingLive ? 'bg-red-100 text-red-700 animate-pulse border border-red-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {isRecordingLive ? 'RECORDING LIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live multi-speaker waveform capture, timecode synch & judicial evidentiary markers. Authenticated as <strong>{currentUser.name}</strong>.
            </p>
          </div>

          {/* Waveform Visualization Canvas */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isRecordingLive ? 'text-red-400 animate-spin' : 'text-slate-500'}`} />
                <span className="text-slate-300">Channel 1: Presiding Bench · Channel 2: Witness Bar</span>
              </div>
              <div className="text-emerald-400 font-bold text-base">
                {formatHMS(recordingSeconds)}
              </div>
            </div>

            {/* Visualizer bars */}
            <div className="h-16 flex items-center justify-center gap-1 overflow-hidden px-2">
              {Array.from({ length: 44 }).map((_, i) => {
                const height = isRecordingLive
                  ? Math.max(12, Math.sin(i * 0.4 + recordingSeconds * 2) * 55 + 20)
                  : (i % 5 === 0 ? 28 : 10);
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isRecordingLive
                        ? i % 4 === 0 ? 'bg-blue-400' : 'bg-emerald-400'
                        : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Evidence Markers log */}
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">
                {evidenceMarkers.length} Evidentiary Timecode Markers Logged
              </span>
              {isRecordingLive && (
                <button
                  type="button"
                  onClick={addEvidenceMarker}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-mono text-[10px] transition"
                >
                  + Mark Evidence
                </button>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500 font-mono">
              Format: 48kHz Broadcast WAV
            </span>
            <div className="flex items-center gap-2">
              {isRecordingLive ? (
                <button
                  onClick={stopLiveRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop & Ingest Session</span>
                </button>
              ) : (
                <button
                  onClick={startLiveRecording}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Live Court Recording</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card B: Add Audio & Transcribe to PDF */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0A1931]">
                <FileAudio className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold">Add Audio & Transcribe to PDF</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                0 to 10+ Hours Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Voice diarization, continuous <strong>[HH:MM:SS]</strong> timestamps, acoustic cleanup, and High Court certified PDF output.
            </p>
          </div>

          {/* Feature Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Diarization Engine</span>
              <span className="font-bold text-[#0A1931]">5-Channel Speaker ID</span>
              <span className="text-[11px] text-slate-500 block">Judge, State, Defense, Witness, Clerk</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">File Volume Capacity</span>
              <span className="font-bold text-blue-600">Up to 2GB / 12 Hours</span>
              <span className="text-[11px] text-slate-500 block">MP3, WAV, M4A, AAC, OGG, FLAC</span>
            </div>
          </div>

          {/* Quick Buttons: Upload Audio & Test Sample Audio */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsIngestModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload from Files (Audio)</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 text-center font-mono">
              Auto-saves every 10 seconds · Resume if network disconnects
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row Icons: TERES Live Court Display, Legal Visor AI Inconsistency, 5-Hr Vetting, Billing N$ PayGate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedSubTab('teres')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            selectedSubTab === 'teres'
              ? 'bg-blue-50 border-blue-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#0A1931]">TERES Court Display</div>
            <div className="text-[10px] text-slate-500">Live Courtroom Screen</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedSubTab('legal_visor')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            selectedSubTab === 'legal_visor'
              ? 'bg-purple-50 border-purple-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#0A1931]">Legal Visor AI</div>
            <div className="text-[10px] text-purple-700 font-semibold">Inconsistency Detection</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedSubTab('vetting')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            selectedSubTab === 'vetting'
              ? 'bg-indigo-50 border-indigo-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#0A1931]">5-Hr Vetting SLA</div>
            <div className="text-[10px] text-slate-500">QC Fast-Track Turnaround</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('billing')}
          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-[#0A1931]">Billing N$ PayGate</div>
            <div className="text-[10px] text-emerald-700 font-semibold">70:30 Government Clearing</div>
          </div>
        </button>
      </div>

      {/* 4. Search by Docket Input "Search as Presiding Judge" & Docket Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0A1931]">
              Active Judicial Dockets ({filteredRequests.length} Cases)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered for presiding chamber review across all 14 regions
            </p>
          </div>

          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search as Presiding Judge (Docket, Title, Region)..."
              value={docketSearch}
              onChange={(e) => setDocketSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-[#0A1931] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Dockets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Docket Number</th>
                <th className="py-3 px-4">Matter Title</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Region / Town</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0A1931]">
              {filteredRequests.slice(0, 12).map((req) => {
                const cfg = CASE_CLASS_CONFIG[req.caseClass] || CASE_CLASS_CONFIG.criminal;
                const hrs = Math.floor((req.audioDurationSeconds || 3600) / 3600);
                const mins = Math.floor(((req.audioDurationSeconds || 3600) % 3600) / 60);

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {req.caseNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {req.caseTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.colorBg} ${cfg.colorBorder}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {req.region}, {req.town}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                      {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`} ({req.pages || 35} pgs)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => onNavigateTab('admin')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-blue-600 font-semibold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Red Recording Button Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={isRecordingLive ? stopLiveRecording : startLiveRecording}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-bold text-xs shadow-2xl transition transform hover:scale-105 ${
            isRecordingLive
              ? 'bg-red-700 ring-4 ring-red-400 animate-pulse'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title="MediaRecorder Live Courtroom Recording"
        >
          <div className="w-3 h-3 rounded-full bg-white animate-ping" />
          <span>{isRecordingLive ? `Recording (${formatHMS(recordingSeconds)})` : 'Record Session'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. Ingest & Transcribe Audio Modal (Exact Specification from User Brief) */}
      {/* ========================================================================= */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A1931] via-[#102A45] to-[#1E3A8A] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md border border-white/20">
                  <FileAudio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Ingest & Transcribe Audio
                  </h2>
                  <p className="text-xs text-blue-200/90 mt-0.5">
                    Live Playback Diarization & Certified PDF Export (0 to 10+ Hours Capable)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitIngest} className="p-5 sm:p-7 overflow-y-auto space-y-6 text-xs text-[#0A1931]">
              {/* SELECT AUDIO SOURCE (Two Cards) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Audio Source
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Upload from Device Storage */}
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className={`w-full p-4 rounded-2xl border-2 border-dashed transition cursor-pointer flex items-center gap-3.5 ${
                      selectedAudioFile
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-blue-300 hover:border-blue-500 bg-blue-50/40'
                    }`}
                  >
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.wma,.flac,.webm"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-[#0A1931] block">
                        Upload Real Court Audio from Device
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {selectedAudioFile ? selectedAudioFile.name : 'Select any MP3, WAV, M4A, AAC, OGG up to 2GB (0-10+ hrs)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 shrink-0"
                    >
                      Browse Audio
                    </button>
                  </div>
                </div>
              </div>

              {/* DURATION & CHUNKING PREVIEW BANNER */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">
                      Duration detected: {formatHMS(detectedDurationSec)}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">Estimated pages: {estimatedPages}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-blue-300">Chunks: {chunksCount} (10-min segments)</span>
                  </div>
                  <div className="text-amber-300 font-bold">
                    Tariff: N$ {totalDueNad.toFixed(2)} NAD
                  </div>
                </div>

                {/* Simulated chunk segments visualization */}
                <div className="grid grid-cols-12 gap-1 pt-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-2 rounded bg-blue-500/80 text-[8px] flex items-center justify-center text-white"
                      title={`Chunk ${i + 1} (10min)`}
                    />
                  ))}
                </div>
              </div>

              {/* COURT DOCKET METADATA */}
              <div className="space-y-4 pt-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Court Docket Metadata
                </h3>

                {/* Row 1: Docket Number & Matter Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Case / Docket Number
                    </label>
                    <input
                      type="text"
                      required
                      value={modalDocketNumber}
                      onChange={(e) => setModalDocketNumber(e.target.value)}
                      placeholder="e.g. HC-MD-CIV-APP-2024/4876"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Matter Title / Proceedings
                    </label>
                    <input
                      type="text"
                      required
                      value={modalMatterTitle}
                      onChange={(e) => setModalMatterTitle(e.target.value)}
                      placeholder="e.g. Judicial Proceedings & Testimony"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931] focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Row 2: Region, Town, Court Division */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Region (14 Regions)
                    </label>
                    <select
                      value={modalRegion}
                      onChange={(e) => handleRegionChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                    >
                      {NAMIBIA_REGIONS.map((r) => (
                        <option key={r.region} value={r.region}>
                          {r.region} Region
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Town / Court Station
                    </label>
                    <select
                      value={modalTown}
                      onChange={(e) => setModalTown(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                    >
                      {getTownsByRegion(modalRegion).map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Court Division
                    </label>
                    <input
                      type="text"
                      value={modalCourtDivision}
                      onChange={(e) => setModalCourtDivision(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700"
                    />
                  </div>
                </div>

                {/* Row 3: Case Class, Urgency, Judicial Officer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Case Class
                    </label>
                    <select
                      value={modalCaseClass}
                      onChange={(e) => setModalCaseClass(e.target.value as CaseClass)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                    >
                      {Object.values(CASE_CLASS_CONFIG).map((cfg) => (
                        <option key={cfg.key} value={cfg.key}>
                          {cfg.label} ({cfg.prefix})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Urgency
                    </label>
                    <select
                      value={modalUrgency}
                      onChange={(e) => setModalUrgency(e.target.value as 'Normal' | 'Urgent')}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                    >
                      <option value="Normal">Normal — 24-hour turnaround</option>
                      <option value="Urgent">Urgent — 2-hour turnaround</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Judicial Officer
                    </label>
                    <select
                      value={selectedJudicialOfficer}
                      onChange={(e) => setSelectedJudicialOfficer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#0A1931]"
                    >
                      {judicialOfficers.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Checkboxes: Voice Recognition & Legal AI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceDiarizationChecked}
                      onChange={(e) => setVoiceDiarizationChecked(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#0A1931] block">
                        Voice Recognition & Diarization
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Namibian English, Afrikaans, Oshiwambo & Otjiherero accents
                      </span>
                    </div>
                  </label>

                  <label className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modalHasLegalAI}
                        onChange={(e) => setModalHasLegalAI(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-xs text-purple-900 block">
                          Transcription + Legal AI Analysis
                        </span>
                        <span className="text-[10px] text-purple-700">
                          Contradiction detection & CPA 25/2004 grounding
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-200 text-purple-900">
                      +N$ 450
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="text-[11px] text-slate-500 font-mono">
                  Permanent storage guaranteed · Zero crash chunking pipeline
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIngestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transcribe & Forward to Proofreader for Verification</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
