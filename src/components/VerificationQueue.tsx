import React, { useState, useEffect } from 'react';
import { TranscriptRequest, UserProfile } from '../types/court';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileCheck,
  Sparkles,
  User,
  ArrowRight,
  Send,
  X,
  Clock,
  MessageSquare,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { formatTimeSeconds } from '../utils/audioPlayerEngine';
import { LegalAiAnalysisModal } from './LegalAiAnalysisModal';
import { ComparisonDiffEditor } from './ComparisonDiffEditor';

interface VerificationQueueProps {
  currentUser: UserProfile;
  requests: TranscriptRequest[];
  onApprove: (requestId: string, notes: string, signature: string, verifiedText?: string) => void;
  onRequestCorrection: (requestId: string, comment: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onClose?: () => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  currentUser,
  requests,
  onApprove,
  onRequestCorrection,
  onReject,
  onClose,
}) => {
  // Requests waiting for manager final check & verification
  const verificationRequests = requests.filter(
    (r) => r.status === 'pending_final_check' || r.status === 'verification'
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    verificationRequests[0]?.id || ''
  );
  const [verifiedAnalysisRequest, setVerifiedAnalysisRequest] = useState<TranscriptRequest | null>(null);

  const activeRequest =
    verificationRequests.find((r) => r.id === selectedRequestId) ||
    verificationRequests[0];

  const [workingTranscriptText, setWorkingTranscriptText] = useState<string>(
    activeRequest?.transcriptText || activeRequest?.rawAiDraft || ''
  );

  useEffect(() => {
    if (activeRequest) {
      setWorkingTranscriptText(activeRequest.transcriptText || activeRequest.rawAiDraft || '');
    }
  }, [activeRequest?.id]);

  // Audio Playback simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // 4 Checkboxes
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(true);
  const [check4, setCheck4] = useState(true);

  // Signature and Comments
  const [signature, setSignature] = useState(currentUser.name || 'Jane Doe, Center Manager');
  const [verificationNotes, setVerificationNotes] = useState('Verbatim check completed against courtroom recording. Legal nomenclature and speaker tags verified.');
  const [correctionComment, setCorrectionComment] = useState('');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  const allChecked = check1 && check2 && check3 && check4;
  const accuracy = activeRequest?.accuracyScore || 98.6;

  // Waveform visualization bars
  const waveformBars = [22, 38, 54, 42, 60, 75, 48, 30, 65, 82, 45, 55, 68, 40, 28, 50, 70, 85, 60, 42, 33, 58, 77, 44];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#0A1931]">
              Manager Final Check &amp; Verification Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {verificationRequests.length} Pending Final Check
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review proofread transcripts and comparison diffs before completing Final Approval and delivering certified records
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Back to Dashboard
          </button>
        )}
      </div>

      {verificationRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-[#0A1931]">Final Check Queue is Clear</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All submitted transcripts have been verified and delivered to requester portals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Requests list */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Awaiting Final Check ({verificationRequests.length})
            </h3>

            <div className="space-y-2.5">
              {verificationRequests.map((req) => {
                const isSelected = req.id === activeRequest?.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 border-indigo-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-bold text-indigo-700 text-xs">
                        {req.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.status === 'pending_final_check'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>
                        {req.status === 'pending_final_check' ? 'Pending Final Check' : req.status}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[#0A1931] mt-1 line-clamp-1">
                      {req.caseNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {req.caseTitle}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Staff: <strong>{req.assignedTo?.name || 'Assigned Staff'}</strong></span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        {req.accuracyScore ? `${req.accuracyScore}% score` : 'Ready QA'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Request Review Workspace */}
          {activeRequest && (
            <div className="lg:col-span-8 space-y-6">
              {/* Request Info & Accuracy Score Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-700">
                        {activeRequest.id}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-sm font-bold text-[#0A1931]">
                        {activeRequest.caseNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Proofread by: <strong className="text-[#0A1931]">{activeRequest.proofreadBy || activeRequest.assignedTo?.name || 'Senior Court Proofreader'}</strong> · Hearing: {activeRequest.hearingDate}
                    </div>
                  </div>

                  {/* Accuracy Score Badge */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {accuracy}%
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Accuracy Score
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold">
                        High Fidelity Verbatim
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Courtroom Audio Player */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A1931] flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span>Original Audio Recording: {activeRequest.audioFile?.name || 'Master_Recording.wav'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {formatTimeSeconds(currentTime)} / {formatTimeSeconds(activeRequest.audioFile?.durationSeconds || 240)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    {/* Waveform Bar Mini Display */}
                    <div className="flex-1 flex items-end gap-1 h-8 bg-slate-200/80 rounded-lg p-1.5 overflow-hidden">
                      {waveformBars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500 rounded-xs"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Diff: AI Draft vs Staff Corrected (Live Editable by Center Manager) */}
              <ComparisonDiffEditor
                rawAiDraft={activeRequest.rawAiDraft || ''}
                correctedText={workingTranscriptText}
                onChangeCorrectedText={setWorkingTranscriptText}
                role="manager"
                caseNumber={activeRequest.caseNumber}
              />

              {/* 4-Item Verification Checklist & Signature Field */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-[#0A1931]">
                    Quality Verification Checklist & Digital Signoff
                  </h3>
                </div>

                {/* 4 Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check1}
                      onChange={(e) => setCheck1(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 leading-snug">
                      <strong>1. Audio Match:</strong> Verbatim dialogue verified against official court audio recording.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check2}
                      onChange={(e) => setCheck2(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 leading-snug">
                      <strong>2. Nomenclature:</strong> Judicial titles, counsel appearances, and speaker tags confirmed.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check3}
                      onChange={(e) => setCheck3(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 leading-snug">
                      <strong>3. Legal Citations:</strong> Namibian statutory references and neutral case citations verified.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={check4}
                      onChange={(e) => setCheck4(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 leading-snug">
                      <strong>4. Privacy & Redactions:</strong> Confidential testimony and protected witness details reviewed.
                    </span>
                  </label>
                </div>

                {/* Signature Field & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Verifier Full Name & Official Stamp
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-[#0A1931] font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                      placeholder="Jane Doe, Transcription Center Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Quality Signoff Notes
                    </label>
                    <input
                      type="text"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-[#0A1931] bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                      placeholder="Audit signoff notes..."
                    />
                  </div>
                </div>

                {/* Action Buttons: Approve, Request Correction, Reject */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Reject button -> moves back to unassigned queue */}
                    <button
                      onClick={() => onReject(activeRequest.id, 'Verification failed judicial standard')}
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                    >
                      Reject to Queue
                    </button>

                    {/* Request Correction -> sends back to staff with comment */}
                    <button
                      onClick={() => setShowCorrectionModal(true)}
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold transition"
                    >
                      Request Correction
                    </button>

                    {/* Inspect Legal AI Analysis button */}
                    <button
                      onClick={() => setVerifiedAnalysisRequest(activeRequest)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Legal AI Analysis</span>
                    </button>
                  </div>

                  {/* Final Approval button visible only to users with the 'manager' role that completes the workflow */}
                  {currentUser.role === 'manager' ? (
                    <button
                      disabled={!allChecked}
                      onClick={() => {
                        const req = { ...activeRequest, transcriptText: workingTranscriptText };
                        onApprove(activeRequest.id, verificationNotes, signature, workingTranscriptText);
                        setVerifiedAnalysisRequest(req);
                      }}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition ${
                        allChecked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-2 ring-emerald-500/20'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      title="Complete Final Approval as Center Manager"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Final Approval</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Final Approval restricted to users with the 'manager' role</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legal AI Analysis Panel shown after transcript verified */}
      <LegalAiAnalysisModal
        isOpen={!!verifiedAnalysisRequest}
        onClose={() => setVerifiedAnalysisRequest(null)}
        request={verifiedAnalysisRequest}
        transcriptText={verifiedAnalysisRequest?.transcriptText}
      />

      {/* Modal: Request Correction with Comment */}
      {showCorrectionModal && activeRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Request Staff Correction</span>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Provide feedback for <strong className="text-[#0A1931]">{activeRequest.assignedTo?.name || 'Staff'}</strong>.
              The task will return to their active queue with your comment.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correction Instructions / Notes:
              </label>
              <textarea
                rows={4}
                value={correctionComment}
                onChange={(e) => setCorrectionComment(e.target.value)}
                placeholder="e.g. Please verify the latin term at 00:02:15 and fix spelling of witness surname..."
                className="w-full p-3 border border-slate-300 rounded-xl font-sans text-xs text-[#0A1931] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRequestCorrection(activeRequest.id, correctionComment || 'Please revise transcript citations');
                  setShowCorrectionModal(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
              >
                Send Back to Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
