import { TranscriptRequest, AuditLogEntry, UserProfile, JudicialInvoice } from '../types/court';
import { INITIAL_REQUESTS, INITIAL_AUDIT_LOGS, JUDICORE_USERS, INITIAL_INVOICES } from '../data/mockCourtData';

const REQUESTS_KEY = 'judicore_requests_v1';
const AUDIT_KEY = 'judicore_audit_logs_v1';
const PROFILES_KEY = 'judicore_user_profiles_v1';
const INVOICES_KEY = 'judicore_invoices_v1';

export function loadRequests(): TranscriptRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any hardcoded seed cases or sample/test items
        const realOnly = parsed.filter(
          (d: TranscriptRequest) =>
            !d.id?.toLowerCase().includes('test') &&
            !d.id?.toLowerCase().includes('sample') &&
            !d.caseNumber?.toLowerCase().includes('sample') &&
            !d.caseNumber?.toLowerCase().includes('test') &&
            (d as any).is_test !== true &&
            d.status !== ('demo' as any)
        );
        return realOnly;
      }
    }
  } catch (e) {
    console.error('Failed to load requests from localStorage:', e);
  }
  saveRequests([]);
  return [];
}

export function saveRequests(reqs: TranscriptRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
    syncWithServiceWorker({ requests: reqs });
  } catch (e) {
    console.error('Failed to save requests:', e);
  }
}

export function loadUserProfiles(): Record<string, UserProfile> {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }
  saveUserProfiles(JUDICORE_USERS);
  return JUDICORE_USERS;
}

export function saveUserProfiles(profiles: Record<string, UserProfile>): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    syncWithServiceWorker({ userProfile: profiles });
  } catch (e) {
    console.error('Failed to save user profiles:', e);
  }
}

export function loadInvoices(): JudicialInvoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load invoices:', e);
  }
  saveInvoices(INITIAL_INVOICES);
  return INITIAL_INVOICES;
}

export function saveInvoices(invs: JudicialInvoice[]): void {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invs));
    syncWithServiceWorker({ invoices: invs });
  } catch (e) {
    console.error('Failed to save invoices:', e);
  }
}

export function syncWithServiceWorker(payload: {
  requests?: TranscriptRequest[];
  userProfile?: any;
  invoices?: JudicialInvoice[];
  auditLogs?: AuditLogEntry[];
}): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_TRANSCRIPTION_DATA',
        payload,
      });
    } catch {
      // Ignore if SW controller is inactive
    }
  }
}

export function loadAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load audit logs:', e);
  }
  saveAuditLogs(INITIAL_AUDIT_LOGS);
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
    syncWithServiceWorker({ auditLogs: logs });
  } catch (e) {
    console.error('Failed to save audit logs:', e);
  }
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const logs = loadAuditLogs();
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const newLog: AuditLogEntry = {
    ...entry,
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: timeStr,
  };
  
  logs.unshift(newLog);
  saveAuditLogs(logs);
}

export interface TranscriptDraft {
  text: string;
  segments: any[];
  savedAt: number;
  savedAtFormatted: string;
  charCount: number;
  turnsCount: number;
  audioFileName?: string;
  caseNumber?: string;
}

const TRANSCRIPT_DRAFT_KEY = 'judicore_transcript_draft_v1';

export function saveTranscriptDraft(draft: TranscriptDraft): void {
  try {
    localStorage.setItem(TRANSCRIPT_DRAFT_KEY, JSON.stringify(draft));
    localStorage.setItem('judicore_transcript_draft', JSON.stringify(draft));
  } catch (e) {
    console.warn('Failed to save transcript draft to localStorage:', e);
  }
}

export function loadTranscriptDraft(): TranscriptDraft | null {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_DRAFT_KEY) || localStorage.getItem('judicore_transcript_draft');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && (parsed.text || (Array.isArray(parsed.segments) && parsed.segments.length > 0))) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load transcript draft from localStorage:', e);
  }
  return null;
}

export function clearTranscriptDraft(): void {
  try {
    localStorage.removeItem(TRANSCRIPT_DRAFT_KEY);
    localStorage.removeItem('judicore_transcript_draft');
  } catch (e) {
    console.warn('Failed to clear transcript draft:', e);
  }
}

export type CourtSpeakerRole =
  | 'Presiding Judge'
  | 'State Prosecutor'
  | 'Defense Counsel'
  | 'Witness'
  | 'Accused'
  | 'Court Registrar'
  | 'Court Interpreter'
  | 'Expert Witness'
  | 'Other';

export interface RegisteredSpeaker {
  id: string;
  name: string;
  role: CourtSpeakerRole;
  color: string; // 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'indigo' | 'cyan'
  notes?: string;
  aliases?: string[];
  createdAt: number;
}

export const DEFAULT_COURT_SPEAKERS: RegisteredSpeaker[] = [
  {
    id: 'spk-judge-shivute',
    name: 'Hon. Lady Justice Shivute',
    role: 'Presiding Judge',
    color: 'amber',
    notes: 'Presiding Bench, clear authoritative judicial tone, High Court Main Division Windhoek',
    aliases: ['Judge', 'Speaker 1', 'Court', 'Her Ladyship'],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'spk-prosecutor-smallbooi',
    name: 'Adv. E. Smallbooi',
    role: 'State Prosecutor',
    color: 'emerald',
    notes: 'Appearing on behalf of the Prosecutor-General of Namibia',
    aliases: ['Prosecutor', 'Speaker 2', 'State Counsel', 'Adv. Smallbooi'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'spk-defense-shikongo',
    name: 'Adv. N. Shikongo',
    role: 'Defense Counsel',
    color: 'blue',
    notes: 'Instructed by Amupanda & Associates for the accused',
    aliases: ['Defense', 'Speaker 3', 'Counsel', 'Adv. Shikongo'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'spk-registrar-clerk',
    name: 'Court Registrar / Clerk',
    role: 'Court Registrar',
    color: 'purple',
    notes: 'High Court session administration, docket and exhibit management',
    aliases: ['Registrar', 'Clerk', 'Speaker 4'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'spk-accused-nuuyoma',
    name: 'J. Nuuyoma',
    role: 'Accused',
    color: 'rose',
    notes: 'Accused No. 1, testifying in criminal review hearing',
    aliases: ['Accused', 'Speaker 5', 'Witness 1'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'spk-interpreter-namibia',
    name: 'Court Interpreter',
    role: 'Court Interpreter',
    color: 'indigo',
    notes: 'Sworn official court interpreter (Oshiwambo/English)',
    aliases: ['Interpreter', 'Translator'],
    createdAt: Date.now() - 86400000,
  },
];

const SPEAKER_REGISTRY_KEY = 'judicore_speaker_registry_v1';

export function loadSpeakerRegistry(): RegisteredSpeaker[] {
  try {
    const raw = localStorage.getItem(SPEAKER_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load speaker registry from localStorage:', e);
  }
  saveSpeakerRegistry(DEFAULT_COURT_SPEAKERS);
  return DEFAULT_COURT_SPEAKERS;
}

export function saveSpeakerRegistry(speakers: RegisteredSpeaker[]): void {
  try {
    localStorage.setItem(SPEAKER_REGISTRY_KEY, JSON.stringify(speakers));
    syncWithServiceWorker({ speakerRegistry: speakers } as any);
  } catch (e) {
    console.warn('Failed to save speaker registry to localStorage:', e);
  }
}

