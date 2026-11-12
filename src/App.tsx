/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  TranscriptRequest,
  UserProfile,
  UserRole,
  StaffMember,
  AuditLogEntry,
  JudicialInvoice,
  PaymentMethod,
} from './types/court';
import {
  JUDICORE_USERS,
  STAFF_MEMBERS,
  INITIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INVOICES,
} from './data/mockCourtData';
import {
  loadRequests,
  saveRequests,
  loadAuditLogs,
  saveAuditLogs,
  addAuditLog,
  loadUserProfiles,
  saveUserProfiles,
  loadInvoices,
  saveInvoices,
} from './utils/storage';

import { JudiCoreHeader } from './components/JudiCoreHeader';
import { RequesterPortal } from './components/RequesterPortal';
import { AdminCenter } from './components/AdminCenter';
import { StaffDashboard } from './components/StaffDashboard';
import { VerbitLegalAdvisor } from './components/VerbitLegalAdvisor';
import { JudicialBillingPortal } from './components/JudicialBillingPortal';
import { JudicialServicesGuide } from './components/JudicialServicesGuide';
import { AuditTrailLog } from './components/AuditTrailLog';
import { TranscriptExport } from './components/TranscriptExport';
import { UserProfileModal } from './components/UserProfileModal';
import { JudicialBenchDocket } from './components/JudicialBenchDocket';

export default function App() {
  const [requests, setRequests] = useState<TranscriptRequest[]>(() => loadRequests());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadAuditLogs());
  const [invoices, setInvoices] = useState<JudicialInvoice[]>(() => loadInvoices());
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(() => loadUserProfiles());
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('lawyer'); // Default J. Smith, Attorney
  const [activeView, setActiveView] = useState<
    'requester' | 'admin' | 'staff' | 'advisor' | 'billing' | 'services' | 'export' | 'audit' | 'bench'
  >('admin');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== 'undefined' && !navigator.onLine);


  const currentUser = userProfiles[currentUserRole] || userProfiles.lawyer;

  // Online / Offline synchronization listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist requests
  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  // Persist audit logs
  useEffect(() => {
    saveAuditLogs(auditLogs);
  }, [auditLogs]);

  // Persist invoices
  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  // Persist user profiles
  useEffect(() => {
    saveUserProfiles(userProfiles);
  }, [userProfiles]);

  // Handle Role Change & Auto-routing
  const handleSelectUserRole = (role: UserRole) => {
    setCurrentUserRole(role);
    if (role === 'staff') {
      setActiveView('staff');
    } else if (role === 'manager' || role === 'admin' || role === 'government') {
      setActiveView('admin');
    } else if (role === 'judge') {
      setActiveView('bench');
    } else {
      setActiveView('requester');
    }
  };

  // Profile Save & Accreditation
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfiles((prev) => ({
      ...prev,
      [updatedProfile.role]: updatedProfile,
    }));

    addAuditLog({
      requestId: 'PROFILE-ACCREDITATION',
      caseNumber: updatedProfile.stateMagistrateCourt || 'General Docket',
      action: 'PROFILE_UPDATED',
      userName: updatedProfile.name,
      userRole: updatedProfile.title,
      details: `Profile accredited: ${updatedProfile.name} (${updatedProfile.companyOrFirmName || updatedProfile.courtOrFirm}) in ${updatedProfile.town || 'Windhoek'}, ${updatedProfile.region || 'Khomas'} Region. Magistrate: ${updatedProfile.stateMagistrateCourt || 'Windhoek Central'}.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 1: Submit Request (Requester & Admin Center manual docket)
  // Calculates amount = pages * rate based on userType + urgency (Government: N$30 urgent, N$25 normal; Private: N$41 urgent, N$35 normal)
  const handleSubmitRequest = (
    newReqData: Omit<TranscriptRequest, 'id' | 'status' | 'dateRequested' | 'dueDate'>
  ) => {
    const id = `REQ-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const dateRequested = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const dueDate = new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const pages = newReqData.pages || 45;
    const isGov = currentUser.role === 'government' || currentUser.email?.endsWith('@judiciary.na') || currentUser.email?.endsWith('@justice.gov.na');
    const isUrgent = newReqData.urgency?.toLowerCase().includes('urgent');
    const defaultRate = isGov ? (isUrgent ? 30 : 25) : (isUrgent ? 41 : 35);
    const rate = newReqData.ratePerPage || defaultRate;
    const subtotalNad = pages * rate;
    const vatNad = Number((subtotalNad * 0.15).toFixed(2));
    const totalNad = Number((subtotalNad + vatNad).toFixed(2));

    const hasAudio = Boolean(newReqData.audioFile || newReqData.audioDurationSeconds);
    const rawAiDraft = newReqData.rawAiDraft || (hasAudio ? `[00:00:04] UNKNOWN: silence in court case number ${newReqData.caseNumber} in the matter of ${newReqData.caseTitle}.\n[00:00:15] SPEAKER 1: appearances for the state and defense.\n[00:00:28] SPEAKER 2: may it please the court j smith appearing for the applicant.\n[00:01:04] SPEAKER 3: i confirm under solemn oath that the record of proceedings reflects true verbatim recollection.\n[00:05:22] SPEAKER 1: proceed with testimony under section 212 of the criminal procedure act.` : undefined);
    const transcriptText = newReqData.transcriptText || (hasAudio ? `*** JUDICORE LEGAL PLATFORM - CERTIFIED VERBATIM RECORD ***\nCASE DOCKET: ${newReqData.caseNumber}\nMATTER: ${newReqData.caseTitle}\nCOURT DIVISION: ${newReqData.courtDivision || 'High Court of Namibia'}\nREGION: ${newReqData.region} | TOWN: ${newReqData.town}\n\n[00:00:04] COURT CLERK: Silence in court. Case number ${newReqData.caseNumber} in the matter of ${newReqData.caseTitle}.\n[00:00:15] PRESIDING JUDGE: Appearances for the State and Defense.\n[00:00:28] ADV. J. SMITH: May it please the Court, J. Smith appearing for the applicant.\n[00:01:04] WITNESS: I confirm under solemn oath that the record of proceedings reflects true verbatim recollection.\n[00:05:22] PRESIDING JUDGE: Proceed with testimony under Section 212 of the Criminal Procedure Act.` : undefined);
    const status: TranscriptRequest['status'] = hasAudio ? 'verification' : 'pending';
    const assignedTo = hasAudio ? (newReqData.assignedTo || { id: STAFF_MEMBERS[0].id, name: STAFF_MEMBERS[0].name }) : newReqData.assignedTo;

    const newRequest: TranscriptRequest = {
      ...newReqData,
      id,
      status,
      assignedTo,
      rawAiDraft,
      transcriptText,
      dateRequested,
      dueDate,
      billingStatus: 'pending',
      pages,
      ratePerPage: rate,
      totalAmountNad: newReqData.totalAmountNad || totalNad,
      invoiceNumber,
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);

    // Create corresponding judicial invoice with dual billing fields
    const newInvoice: JudicialInvoice = {
      invoiceNumber,
      requestId: id,
      caseNumber: newRequest.caseNumber,
      caseTitle: newRequest.caseTitle,
      date: dateRequested,
      billedTo: {
        userId: currentUser.id,
        name: currentUser.name,
        firmOrDepartment: currentUser.companyOrFirmName || currentUser.courtOrFirm,
        email: currentUser.email || 'user@judiciary.gov.na',
        region: currentUser.region || 'Khomas',
        town: currentUser.town || 'Windhoek',
      },
      transcriptPages: pages,
      ratePerPage: rate,
      lineItems: [
        {
          description: `Court Verbatim Transcript (${newRequest.requestType} - ${newRequest.urgency || (isUrgent ? 'Urgent (2-hour)' : 'Normal (24-hour)')})`,
          quantity: pages,
          unitPriceNad: rate,
          totalNad: subtotalNad,
        },
      ],
      subtotalNad,
      vatNad,
      totalNad,
      paymentStatus: 'pending',
    };
    setInvoices([newInvoice, ...invoices]);

    // Audit log
    addAuditLog({
      requestId: id,
      caseNumber: newRequest.caseNumber,
      action: hasAudio ? 'TRANSCRIPTION_FORWARDED_TO_PROOFREADER' : 'REQUEST_SUBMITTED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: hasAudio
        ? `New transcript request submitted with court audio. Audio transcribed and forwarded to Official Court Proofreader Desk (${STAFF_MEMBERS[0].name}) for verbatim verification & comparison review.`
        : `New transcript request submitted for ${newRequest.caseNumber} (${newRequest.requestType}). Rate: N$ ${rate}/pg, Total: N$ ${totalNad.toFixed(2)}. Tax invoice ${invoiceNumber} issued.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 3: Assignment by Center Manager
  const handleAssignRequest = (requestId: string, staff: StaffMember) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'assigned' as const,
          assignedTo: { id: staff.id, name: staff.name },
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'ASSIGNED_TO_STAFF',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Task assigned to staff member ${staff.name} (${staff.role}).`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 4a: Staff Saves Draft to Local Storage
  const handleStaffSaveDraft = (requestId: string, transcriptText: string) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          transcriptText,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'DRAFT_SAVED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Draft updated and saved locally by ${currentUser.name}.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 4b: Staff / Proofreader Forwards for Final Check
  const handleForwardForVerification = (
    requestId: string,
    transcriptText: string,
    accuracyScore: number = 98.4,
    notes?: string
  ) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'pending_final_check' as const,
          transcriptText,
          accuracyScore,
          proofreadBy: currentUser.name,
          proofreadAt: new Date().toLocaleString(),
          proofreadNotes: notes,
          managerFeedback: undefined,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'FORWARDED_FOR_VERIFICATION',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Proofreader ${currentUser.name} finalized corrected text. Request status moved to pending_final_check for Center Manager final approval (${accuracyScore}% score).`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 4c: Audio Upload & Transcribe -> Forwarded to Proofreader for Verification
  const handleUploadAudioAndTranscribe = (
    requestId: string,
    audioFile: { name: string; durationSeconds: number },
    transcriptText: string
  ) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'verification' as const,
          assignedTo: r.assignedTo || { id: STAFF_MEMBERS[0].id, name: STAFF_MEMBERS[0].name },
          rawAiDraft: r.rawAiDraft || transcriptText,
          audioFile: {
            name: audioFile.name,
            durationSeconds: audioFile.durationSeconds,
            uploadedBy: currentUser.name,
            uploadedAt: new Date().toISOString(),
          },
          transcriptText,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'TRANSCRIPTION_FORWARDED_TO_PROOFREADER',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Audio transcription completed. Docket forwarded to Official Court Proofreader Desk (${STAFF_MEMBERS[0].name}) for verbatim verification & comparison review.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Step 5 & 6: Human Verification & Deliver to Requester
  const handleVerifyAndDeliver = (requestId: string, notes: string, signature?: string, verifiedText?: string) => {
    const now = new Date();
    const deliveredAt = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const verifier = signature || currentUser.name;

    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'delivered' as const,
          isVerified: true,
          verifiedBy: verifier,
          verifiedAt: now.toLocaleString(),
          verificationNotes: notes,
          deliveredAt,
          transcriptText: verifiedText !== undefined ? verifiedText : r.transcriptText,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'HUMAN_VERIFIED',
      userName: verifier,
      userRole: currentUser.title,
      details: `Quality Control verification signed off by ${verifier}: ${notes}`,
    });

    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'DISPATCHED_TO_PORTAL',
      userName: verifier,
      userRole: currentUser.title,
      details: `Certified transcript and stream-only audio link released to ${targetReq?.requestedBy.name || 'requester'} portal.`,
    });

    setAuditLogs(loadAuditLogs());
  };

  // Manager: Request Correction -> sends back to staff with comment
  const handleRequestCorrection = (requestId: string, comment: string) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'transcribing' as const,
          managerFeedback: comment,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'CORRECTION_REQUESTED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Returned to ${targetReq?.assignedTo?.name || 'Staff'} for revision with comment: "${comment}"`,
    });

    setAuditLogs(loadAuditLogs());
  };

  // Manager: Reject -> back to unassigned queue
  const handleRejectRequest = (requestId: string, reason: string) => {
    const updated = requests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'pending' as const,
          assignedTo: undefined,
        };
      }
      return r;
    });

    setRequests(updated);

    const targetReq = requests.find((r) => r.id === requestId);
    addAuditLog({
      requestId,
      caseNumber: targetReq?.caseNumber || 'Unknown',
      action: 'REQUEST_REJECTED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Transcript rejected by Manager and returned to Pending Assignment queue: ${reason}`,
    });

    setAuditLogs(loadAuditLogs());
  };

  // Judicial Paygate: Pay Invoice
  const handlePayInvoice = (invoiceNumber: string, paymentMethod: PaymentMethod) => {
    const now = new Date();
    const paidAt = now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const reference = `${paymentMethod.includes('Bank Windhoek') ? 'BW' : paymentMethod.includes('FNB') ? 'FNB' : 'DPO'}-EFT-${Date.now().toString().slice(-6)}`;
    const revenueStampCode = `REV-STAMP-NAM-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedInvoices = invoices.map((inv) => {
      if (inv.invoiceNumber === invoiceNumber) {
        return {
          ...inv,
          paymentStatus: 'paid' as const,
          paymentMethod,
          paymentReference: reference,
          paidAt,
          revenueStampCode,
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);

    // Update matching request
    const targetInvoice = invoices.find((i) => i.invoiceNumber === invoiceNumber);
    if (targetInvoice) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === targetInvoice.requestId || r.invoiceNumber === invoiceNumber
            ? { ...r, billingStatus: 'paid' }
            : r
        )
      );
    }

    addAuditLog({
      requestId: targetInvoice?.requestId || invoiceNumber,
      caseNumber: targetInvoice?.caseNumber || 'Judicial Paygate',
      action: 'PAYMENT_COMPLETED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Settled N$ ${targetInvoice?.totalNad.toFixed(2)} via ${paymentMethod} (${reference}). Revenue stamp issued: ${revenueStampCode}.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  // Download Transcript (with JudiCore watermark)
  const handleDownloadTranscript = (req: TranscriptRequest) => {
    const content = `*** JUDICORE LEGAL PLATFORM - CERTIFIED COURT TRANSCRIPT ***\n\n` +
      `CASE NUMBER: ${req.caseNumber}\n` +
      `HEARING DATE: ${req.hearingDate}\n` +
      `REQUEST ID: ${req.id}\n` +
      `REQUESTED BY: ${req.requestedBy.name} (${req.requestedBy.role})\n` +
      `REGIONAL JURISDICTION: ${currentUser.town || 'Windhoek'}, ${currentUser.region || 'Khomas'} Region\n` +
      `STATE MAGISTRATE STATION: ${currentUser.stateMagistrateCourt || 'Windhoek Central Magistrate Court'}\n` +
      `QUALITY VERIFIED BY: ${req.verifiedBy || 'Jane Doe, Transcription Center Manager'}\n` +
      `DELIVERED AT: ${req.deliveredAt || '2024-10-29'}\n\n` +
      `===============================================================\n` +
      `VERBATIM RECORD OF PROCEEDINGS\n` +
      `===============================================================\n\n` +
      (req.transcriptText || `[00:00:04] COURT CLERK: Silence in court. Case number ${req.caseNumber}.\n\n[00:00:18] JUDGE: Proceed with testimony.`);

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JudiCore_${req.caseNumber.replace(/\//g, '_')}_Transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);

    addAuditLog({
      requestId: req.id,
      caseNumber: req.caseNumber,
      action: 'TRANSCRIPT_DOWNLOADED',
      userName: currentUser.name,
      userRole: currentUser.title,
      details: `Watermarked certified transcript downloaded by ${currentUser.name}.`,
    });
    setAuditLogs(loadAuditLogs());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A1931] flex flex-col font-sans">
      {/* JudiCore Top Navigation Header with Role Switcher, Profile Button & PWA Install */}
      <JudiCoreHeader
        currentUser={currentUser}
        onSelectUserRole={handleSelectUserRole}
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        allUsers={userProfiles}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 text-center font-semibold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
          <span>Offline Mode Active: Accessing cached transcription metadata, case records, and profile data via Service Worker.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col pb-32">

        {/* View 0: Judicial Bench Docket (Presiding Judges & Registrars) */}
        {activeView === 'bench' && (
          <JudicialBenchDocket
            currentUser={currentUser}
            requests={requests}
            onAddRequest={handleSubmitRequest}
            onNavigateTab={(tab) => setActiveView(tab as any)}
          />
        )}


        {/* View 1: Requester Portal (Image 1) */}
        {activeView === 'requester' && (
          <RequesterPortal
            currentUser={currentUser}
            requests={requests}
            onSubmitRequest={handleSubmitRequest}
            onDownloadTranscript={handleDownloadTranscript}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* View 2: Staff Dashboard (Dedicated Staff Workspace) */}
        {activeView === 'staff' && (
          <StaffDashboard
            currentUser={currentUser}
            requests={requests}
            onSaveDraft={handleStaffSaveDraft}
            onForwardForVerification={handleForwardForVerification}
          />
        )}

        {/* View 3: Admin Center (Image 2 + Verification Queue + Staff Management + Verbit Legal AI + Judicial Paygate & Government Billing) */}
        {activeView === 'admin' && (
          <AdminCenter
            currentUser={currentUser}
            requests={requests}
            staffMembers={STAFF_MEMBERS}
            auditLogs={auditLogs}
            invoices={invoices}
            onAssignRequest={handleAssignRequest}
            onUploadAudioAndTranscribe={handleUploadAudioAndTranscribe}
            onVerifyAndDeliver={handleVerifyAndDeliver}
            onRequestCorrection={handleRequestCorrection}
            onRejectRequest={handleRejectRequest}
            onOpenAuditTrail={() => setActiveView('audit')}
            onOpenExportLogs={() => setActiveView('export')}
            onNewRequest={handleSubmitRequest}
            onIssueQuote={(newInv) => setInvoices([newInv, ...invoices])}
            onPayInvoice={handlePayInvoice}
          />
        )}

        {/* View 4: Verbit Legal Advisor AI */}
        {activeView === 'advisor' && (
          <VerbitLegalAdvisor
            currentUser={currentUser}
            requests={requests}
          />
        )}

        {/* View 5: Judicial Billing & Paygate Portal */}
        {activeView === 'billing' && (
          <JudicialBillingPortal
            currentUser={currentUser}
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
          />
        )}

        {/* View 6: Professional Services Overview */}
        {activeView === 'services' && (
          <JudicialServicesGuide
            onNavigateTab={(tab) => setActiveView(tab)}
          />
        )}

        {/* View 7: Transcript Export with JudiCore Watermark */}
        {activeView === 'export' && (
          <TranscriptExport
            requests={requests}
            onBack={() => setActiveView('requester')}
          />
        )}

        {/* View 8: Audit Trail Log */}
        {activeView === 'audit' && (
          <AuditTrailLog logs={auditLogs} />
        )}
      </main>

      {/* User Profile & 14 Regions Accreditation Modal */}
      <UserProfileModal
        currentUser={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
