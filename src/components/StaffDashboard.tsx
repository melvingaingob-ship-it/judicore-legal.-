import React, { useState, useEffect } from 'react';
import { TranscriptRequest, UserProfile } from '../types/court';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  Check,
  Send,
  ArrowRight,
  Volume2,
  Play,
  Pause,
  User,
  RotateCcw,
} from 'lucide-react';
import { LegalAiAnalysisModal } from './LegalAiAnalysisModal';
import { ComparisonDiffEditor } from './ComparisonDiffEditor';
import { formatTimeSeconds } from '../utils/audioPlayerEngine';

interface StaffDashboardProps {
  currentUser: UserProfile;
  requests: TranscriptRequest[];
  onSaveDraft: (requestId: string, transcriptText: string) => void;
  onForwardForVerification: (requestId: string, transcriptText: string, accuracyScore?: number, proofreaderNotes?: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  requests,
  onSaveDraft,
  onForwardForVerification,
}) => {
  // Dockets assigned to proofreader OR in pending_final_check / verification / transcribing status waiting for proofreading
  const proofreadingRequests = requests.filter(
    (r) =>
      Boolean(r.assignedTo?.id && r.assignedTo.id === currentUser.id) ||
      Boolean(r.assignedTo?.name && currentUser.name && r.assignedTo.name.toLowerCase() === currentUser.name.toLowerCase()) ||
      r.status === 'pending_final_check' ||
      r.status === 'verification' ||
      r.status === 'transcribing'
  );

  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    proofreadingRequests[0]?.id || ''
  );
  const [workingText, setWorkingText] = useState<string>('');
  const [proofreaderNotes, setProofreaderNotes] = useState<string>('Verbatim proofreading completed. Speaker tags and legal terminology aligned with master court recording.');
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Audio Playback Simulation for verification
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  useEffect(() => {
    if (proofreadingRequests.length > 0 && !proofreadingRequests.some((r) => r.id === selectedRequestId)) {
      setSelectedRequestId(proofreadingRequests[0].id);
    }
  }, [proofreadingRequests, selectedRequestId]);

  const currentRequest = proofreadingRequests.find((r) => r.id === selectedRequestId) || proofreadingRequests[0];

  // Sync workingText when active request changes
  useEffect(() => {
    if (currentRequest) {
      setWorkingText(currentRequest.transcriptText || currentRequest.rawAiDraft || '');
    }
  }, [currentRequest?.id]);

  const handleWorkingTextChange = (newText: string) => {
    setWorkingText(newText);
    if (currentRequest) {
      onSaveDraft(currentRequest.id, newText);
    }
  };

  const handleForwardToManager = () => {
    if (!currentRequest) return;
    if (!confirmedCheck) {
      alert('Please confirm the proofreading quality verification checkbox before forwarding.');
      return;
    }

    onSaveDraft(currentRequest.id, workingText);
    onForwardForVerification(currentRequest.id, workingText, currentRequest.accuracyScore || 98.9, proofreaderNotes);

    setSuccessToast(`Docket ${currentRequest.caseNumber} finalized! Status moved to 'pending_final_check' for Center Manager approval.`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0A1931]">
              Proofreader Workspace &amp; Verification Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser.title || 'Official Court Proofreader'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review AI speech drafts against original courtroom audio. Correct transcripts in the live Comparison Diff, then forward to Center Manager for final check and approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRequest && (
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verbit Legal AI QA</span>
            </button>
          )}
        </div>
      </div>

      {proofreadingRequests.length === 0 ? (
        /* Empty Centered State */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-[#0A1931]">Proofreading Queue is Clear</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            All transcriptions have been proofread and forwarded to the Center Manager. When new court audio transcriptions are drafted, they will appear here for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Assigned Task Queue */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dockets For Proofreading ({proofreadingRequests.length})
              </h2>
              <span className="text-[10px] text-slate-400">Select to load docket</span>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {proofreadingRequests.map((req) => {
                const isSelected = req.id === currentRequest?.id;
                const isUnderReview = req.status === 'verification';
                const isDelivered = req.status === 'delivered';

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-2 ring-blue-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-bold text-blue-600 text-xs">
                        {req.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : req.status === 'pending_final_check'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                            : isUnderReview
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {req.status === 'pending_final_check'
                          ? 'Pending Final Check'
                          : req.status === 'verification'
                          ? 'Transcribed · For Verification'
                          : req.status}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[#0A1931] mt-1.5 line-clamp-1">
                      {req.caseNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {req.caseTitle}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {req.dueDate}
                      </span>
                      <span className="font-semibold text-slate-600">{req.urgency}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Case Quick Details */}
            {currentRequest && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5 text-xs">
                <h3 className="font-bold text-[#0A1931] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  Active Docket Profile
                </h3>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Jurisdiction:</span>
                    <span className="font-semibold text-slate-800">{currentRequest.town || 'Windhoek'}, {currentRequest.region || 'Khomas'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Division:</span>
                    <span className="font-semibold text-slate-800">{currentRequest.courtDivision || 'High Court of Namibia'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Case Class:</span>
                    <span className="font-semibold text-slate-800 uppercase">{currentRequest.caseClass || 'Criminal'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Pages / Folios:</span>
                    <span className="font-semibold text-slate-800">{currentRequest.pages || 35} pages</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Comparison Diff Editor & Forward to Center Manager */}
          <div className="lg:col-span-8 space-y-4">
            {/* Manager Feedback Note */}
            {currentRequest && currentRequest.managerFeedback && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Manager Correction Note for {currentRequest.caseNumber}:</strong>
                  <div className="mt-0.5 text-amber-800">{currentRequest.managerFeedback}</div>
                </div>
              </div>
            )}

            {/* Audio Stream Player for Verification */}
            {currentRequest && currentRequest.audioFile && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-[#0A1931] flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{currentRequest.audioFile.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Master Courtroom Channel · Duration: {formatTimeSeconds(currentRequest.audioFile.durationSeconds || 240)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Acoustic Reference Track
                  </span>
                </div>
              </div>
            )}

            {/* Comparison Diff: AI Draft vs Staff Corrected (Live Editable by Proofreader) */}
            {currentRequest ? (
              <ComparisonDiffEditor
                rawAiDraft={currentRequest.rawAiDraft || ''}
                correctedText={workingText}
                onChangeCorrectedText={handleWorkingTextChange}
                onSaveDraft={() => onSaveDraft(currentRequest.id, workingText)}
                role="proofreader"
                caseNumber={currentRequest.caseNumber}
              />
            ) : null}

            {/* Forward to Center Manager for Final Check and Approval */}
            {currentRequest && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-[#0A1931]">
                      Forward to Center Manager for Final Check &amp; Approval
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Submit your verified transcript changes to the Center Manager for official signoff and requester delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={confirmedCheck}
                      onChange={(e) => setConfirmedCheck(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600"
                    />
                    <span className="text-slate-700 font-medium">
                      <strong>Proofreader Certification:</strong> I certify that I have verified the verbatim transcript against courtroom audio, aligned speaker tags, and checked statutory legal terminology.
                    </span>
                  </label>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Proofreader Commentary &amp; Quality Notes for Manager:
                    </label>
                    <input
                      type="text"
                      value={proofreaderNotes}
                      onChange={(e) => setProofreaderNotes(e.target.value)}
                      placeholder="e.g. All speaker tags verified; Rule 73(4) citation confirmed..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0A1931]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleForwardToManager}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Forward to Center Manager for Final Check &amp; Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal AI Analysis Modal */}
      {currentRequest && (
        <LegalAiAnalysisModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          request={currentRequest}
          transcriptText={workingText || currentRequest.transcriptText || ''}
        />
      )}
    </div>
  );
};
