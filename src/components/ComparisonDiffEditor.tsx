import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  FileCheck,
  Wand2,
  Eye,
  Columns,
  List,
  Save,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export interface ComparisonDiffEditorProps {
  rawAiDraft: string;
  correctedText: string;
  onChangeCorrectedText: (newText: string) => void;
  onSaveDraft?: () => void;
  role: 'proofreader' | 'manager';
  readOnly?: boolean;
  caseNumber?: string;
  onResetToAiDraft?: () => void;
}

interface DiffToken {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

// Compute word-level diff between AI Draft and Corrected version
function computeWordDiff(original: string, modified: string): DiffToken[] {
  const origWords = (original || '').split(/(\s+)/);
  const modWords = (modified || '').split(/(\s+)/);

  const diff: DiffToken[] = [];
  let i = 0;
  let j = 0;

  while (i < origWords.length && j < modWords.length) {
    if (origWords[i] === modWords[j]) {
      diff.push({ type: 'unchanged', value: modWords[j] });
      i++;
      j++;
    } else {
      // Lookahead check for additions or deletions
      const lookaheadMod = modWords.slice(j, j + 5).indexOf(origWords[i]);
      const lookaheadOrig = origWords.slice(i, i + 5).indexOf(modWords[j]);

      if (lookaheadMod > 0) {
        // Words added in modified
        for (let k = 0; k < lookaheadMod; k++) {
          diff.push({ type: 'added', value: modWords[j + k] });
        }
        j += lookaheadMod;
      } else if (lookaheadOrig > 0) {
        // Words removed from original
        for (let k = 0; k < lookaheadOrig; k++) {
          diff.push({ type: 'removed', value: origWords[i + k] });
        }
        i += lookaheadOrig;
      } else {
        // Replaced token
        diff.push({ type: 'removed', value: origWords[i] });
        diff.push({ type: 'added', value: modWords[j] });
        i++;
        j++;
      }
    }
  }

  while (i < origWords.length) {
    diff.push({ type: 'removed', value: origWords[i] });
    i++;
  }

  while (j < modWords.length) {
    diff.push({ type: 'added', value: modWords[j] });
    j++;
  }

  return diff;
}

export const ComparisonDiffEditor: React.FC<ComparisonDiffEditorProps> = ({
  rawAiDraft,
  correctedText,
  onChangeCorrectedText,
  onSaveDraft,
  role,
  readOnly = false,
  caseNumber,
  onResetToAiDraft,
}) => {
  const [viewMode, setViewMode] = useState<'sideBySide' | 'unified' | 'preview'>('sideBySide');
  const [copiedAi, setCopiedAi] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Fallback defaults if empty
  const defaultAiDraft =
    rawAiDraft ||
    `[00:00:04] UNKNOWN: Case number ${caseNumber || 'CR-2024-0891'} Telecom Corp versus TransNamib Logistics.\n\n[00:00:20] SPEAKER 1: May it please the court we move in terms of prayer 1 and 2 of the notice of motion.\n\n[00:00:42] SPEAKER 2: We submit the matter lacks urgency under rule 73 4.`;

  const defaultCorrected =
    correctedText ||
    `[00:00:04] COURT CLERK: Silence in court. Case number ${caseNumber || 'CR-2024-0891'}, Telecom Corp versus TransNamib Logistics.\n\n[00:00:20] ADV. SMITH (APPLICANT): May it please the Court, we move in terms of prayers 1 and 2 of the notice of motion regarding interim interdict.\n\n[00:00:42] ADV. NDIMWEYA (RESPONDENT): We submit the matter lacks urgency in terms of rule 73(4).`;

  const activeAi = defaultAiDraft;
  const activeCorrected = correctedText !== undefined && correctedText !== '' ? correctedText : defaultCorrected;

  // Diff Calculations
  const wordDiff = useMemo(() => computeWordDiff(activeAi, activeCorrected), [activeAi, activeCorrected]);

  const stats = useMemo(() => {
    const aiWords = activeAi.trim() ? activeAi.trim().split(/\s+/).length : 0;
    const correctedWords = activeCorrected.trim() ? activeCorrected.trim().split(/\s+/).length : 0;
    const additions = wordDiff.filter((t) => t.type === 'added' && t.value.trim().length > 0).length;
    const deletions = wordDiff.filter((t) => t.type === 'removed' && t.value.trim().length > 0).length;
    const totalChanges = additions + deletions;

    // Accuracy Score formula based on edits vs length
    const score = Math.max(90, Math.min(99.8, 100 - (totalChanges / Math.max(1, aiWords)) * 10));

    return {
      aiWords,
      correctedWords,
      additions,
      deletions,
      totalChanges,
      accuracyScore: score.toFixed(1),
    };
  }, [activeAi, activeCorrected, wordDiff]);

  const handleCopyAi = () => {
    navigator.clipboard.writeText(activeAi);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  const handleNormalizeSpeakerTags = () => {
    let text = activeCorrected;
    // Standardize speaker tags
    text = text.replace(/speaker\s*1:/gi, 'PRESIDING JUDGE:');
    text = text.replace(/speaker\s*2:/gi, 'PROSECUTOR:');
    text = text.replace(/speaker\s*3:/gi, 'DEFENSE COUNSEL:');
    text = text.replace(/unknown:/gi, 'COURT CLERK:');
    onChangeCorrectedText(text);
  };

  const handleSaveClick = () => {
    onSaveDraft?.();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset corrected version back to the raw AI speech draft? All manual edits will be overwritten.')) {
      onChangeCorrectedText(activeAi);
      onResetToAiDraft?.();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 font-sans">
      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Working draft corrections saved successfully!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-extrabold text-[#0A1931]">
              Comparison Diff: AI Draft vs Staff Corrected
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                role === 'proofreader'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              {role === 'proofreader' ? 'Proofreader Editable' : 'Center Manager Review & Edit'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare acoustic AI speech output with human proofreader corrections. Directly editable by {role === 'proofreader' ? 'Court Proofreaders' : 'Transcription Center Managers'}.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'sideBySide' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'unified' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Unified Diff</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'preview' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Clean Record</span>
          </button>
        </div>
      </div>

      {/* Real-time Diff Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Baseline Words</span>
          <span className="font-mono font-bold text-slate-800 text-sm">{stats.aiWords}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Corrected Words</span>
          <span className="font-mono font-bold text-blue-700 text-sm">{stats.correctedWords}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">+ Additions (Verified)</span>
          <span className="font-mono font-bold text-emerald-700 text-sm">+{stats.additions}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-red-600 block">- Removals (Noise/Errors)</span>
          <span className="font-mono font-bold text-red-600 text-sm">-{stats.deletions}</span>
        </div>
        <div className="space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-purple-700 block">Fidelity QA Score</span>
          <span className="font-mono font-bold text-purple-800 text-sm">{stats.accuracyScore}%</span>
        </div>
      </div>

      {/* Editing & Formatting Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              Editor Controls:
            </span>
            <button
              type="button"
              onClick={handleNormalizeSpeakerTags}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition"
              title="Automatically standardize Speaker 1/2 to Judge/Counsel"
            >
              Normalize Speaker Tags
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-amber-700 text-[11px] font-semibold transition flex items-center gap-1"
              title="Reset corrected text back to original AI speech draft"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to AI Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-blue-600" />
                <span>Save Working Copy</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: SIDE-BY-SIDE VIEW */}
      {viewMode === 'sideBySide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: AI Raw Draft (Reference) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>AI Speech Model Draft (Unverified Baseline)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAi}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1"
              >
                {copiedAi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAi ? 'Copied' : 'Copy Baseline'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] text-slate-700 leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap select-all border-dashed">
              {activeAi}
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Raw diarization generated by acoustic model. Read-only reference baseline.
            </div>
          </div>

          {/* Right Column: Staff Corrected Version (Live Editable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A1931]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Staff Corrected Version ({role === 'proofreader' ? 'Proofreader Editor' : 'Manager Final Editor'})
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live Editable
              </span>
            </div>

            <textarea
              rows={18}
              readOnly={readOnly}
              value={activeCorrected}
              onChange={(e) => onChangeCorrectedText(e.target.value)}
              placeholder="Correct court transcription, fix legal citations, and verify speaker tags..."
              className="w-full p-3.5 bg-white border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-2xl font-mono text-[11px] text-[#0A1931] leading-relaxed max-h-[460px] overflow-y-auto shadow-2xs transition"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Lines: {activeCorrected.split('\n').length} · Words: {stats.correctedWords}</span>
              <span className="font-semibold text-blue-600">Edits automatically reflected in comparison diff</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: UNIFIED DIFF VIEW */}
      {viewMode === 'unified' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0A1931]">Word-by-Word Diff Inspection</span>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 line-through">
                  Red = AI Draft Deleted
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 underline font-bold">
                  Green = Staff Correction
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Total Changes: <strong className="text-purple-700">{stats.totalChanges}</strong>
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap">
            {wordDiff.map((token, idx) => {
              if (token.type === 'removed') {
                return (
                  <span
                    key={idx}
                    className="bg-red-100/90 text-red-800 line-through px-0.5 mx-0.5 rounded text-[11px]"
                    title="Removed from raw AI draft"
                  >
                    {token.value}
                  </span>
                );
              }
              if (token.type === 'added') {
                return (
                  <span
                    key={idx}
                    className="bg-emerald-100 text-emerald-900 font-semibold px-0.5 mx-0.5 rounded border border-emerald-300 text-[11px]"
                    title="Corrected by staff proofreader"
                  >
                    {token.value}
                  </span>
                );
              }
              return <span key={idx} className="text-slate-800">{token.value}</span>;
            })}
          </div>

          {/* Quick Edit Box below Unified Diff */}
          {!readOnly && (
            <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Quick Corrected Text Update:</span>
                <span className="text-[10px] text-blue-600 font-normal">Edit below to update diff immediately</span>
              </div>
              <textarea
                rows={5}
                value={activeCorrected}
                onChange={(e) => onChangeCorrectedText(e.target.value)}
                className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-mono text-xs text-[#0A1931]"
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CLEAN RECORD PREVIEW */}
      {viewMode === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0A1931]">
              Current Verified Transcript Clean Record
            </span>
            <span className="text-[11px] text-slate-500">
              Ready for Manager Review &amp; Official Seal
            </span>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl font-mono text-xs text-[#0A1931] leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap shadow-2xs">
            {activeCorrected}
          </div>
        </div>
      )}
    </div>
  );
};
