/**
 * Automated Courtroom Speaker Detection & Diarization Engine
 * Color codes and classifies dialogue turns according to official judicial roles
 */

export interface DetectedSpeaker {
  speaker: 'PRESIDING JUDGE' | 'COUNSEL' | 'COURT CLERK' | 'WITNESS';
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

/**
 * Detects the speaker classification and Tailwind color based on text content or speaker prefix
 */
export const detectSpeaker = (text: string): DetectedSpeaker | null => {
  if (!text) return null;
  const upper = text.toUpperCase();

  if (upper.includes('JUDGE')) {
    return {
      speaker: 'PRESIDING JUDGE',
      color: 'bg-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-500',
    };
  }
  if (upper.includes('COUNSEL') || upper.includes('ADV')) {
    return {
      speaker: 'COUNSEL',
      color: 'bg-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-500',
    };
  }
  if (upper.includes('CLERK')) {
    return {
      speaker: 'COURT CLERK',
      color: 'bg-gray-500',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-500',
    };
  }
  if (upper.includes('WITNESS')) {
    return {
      speaker: 'WITNESS',
      color: 'bg-green-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-500',
    };
  }
  return null;
};

export interface ParsedDialogueLine {
  id: string;
  timestamp?: string;
  rawSpeaker?: string;
  detected: DetectedSpeaker | null;
  textContent: string;
  rawLine: string;
}

/**
 * Parses full verbatim transcript into diarized segments with detected speakers
 */
export const parseTranscriptLines = (fullText: string): ParsedDialogueLine[] => {
  if (!fullText) return [];
  const rawLines = fullText.split('\n').filter((l) => l.trim().length > 0);

  return rawLines.map((line, idx) => {
    // Check for [00:00:00] timestamp
    const tsMatch = line.match(/^\[([0-9]{2}:[0-9]{2}(?::[0-9]{2})?)\]/);
    const timestamp = tsMatch ? tsMatch[1] : undefined;
    const lineWithoutTs = tsMatch ? line.replace(/^\[[0-9]{2}:[0-9]{2}(?::[0-9]{2})?\]\s*/, '') : line;

    // Check for SPEAKER: prefix
    const speakerMatch = lineWithoutTs.match(/^([^:]+):/);
    const rawSpeaker = speakerMatch ? speakerMatch[1].trim() : undefined;
    const textContent = speakerMatch ? lineWithoutTs.slice(speakerMatch[0].length).trim() : lineWithoutTs;

    const detected = detectSpeaker(rawSpeaker || lineWithoutTs);

    return {
      id: `dialogue-${idx}-${Date.now().toString().slice(-4)}`,
      timestamp,
      rawSpeaker,
      detected,
      textContent,
      rawLine: line,
    };
  });
};
