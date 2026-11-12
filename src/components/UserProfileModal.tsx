import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/court';
import { NAMIBIA_REGIONS, SUPERIOR_COURTS } from '../data/namibiaRegions';
import {
  User,
  Shield,
  MapPin,
  Building,
  Scale,
  Award,
  CheckCircle2,
  X,
  Briefcase,
  Phone,
  Mail,
  FileBadge,
  Sparkles,
  CreditCard,
} from 'lucide-react';

interface UserProfileModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...currentUser });
  const [selectedRegionName, setSelectedRegionName] = useState<string>(
    currentUser.region || 'Khomas'
  );
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableMagistrates, setAvailableMagistrates] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // When selected region changes, update towns and magistrate courts
  useEffect(() => {
    const regionObj =
      NAMIBIA_REGIONS.find((r) => r.region.toLowerCase() === selectedRegionName.toLowerCase()) ||
      NAMIBIA_REGIONS[0];
    const townsList = regionObj.towns.map((t) => t.name);
    const courtsList = regionObj.towns.map((t) => t.courtName);

    setAvailableTowns(townsList);
    setAvailableMagistrates(courtsList);

    // If current town is not in new region, set default town
    if (!townsList.includes(formData.town || '')) {
      setFormData((prev) => ({
        ...prev,
        region: regionObj.region,
        town: townsList[0],
        stateMagistrateCourt: courtsList[0],
      }));
    }
  }, [selectedRegionName]);

  // Sync when currentUser changes
  useEffect(() => {
    setFormData({ ...currentUser });
    setSelectedRegionName(currentUser.region || 'Khomas');
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...formData,
      region: selectedRegionName,
      isProfileComplete: true,
      profileVerificationStatus: formData.profileVerificationStatus || 'Verified',
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'lawyer':
        return 'Legal Practitioner / Defense Counsel';
      case 'judge':
        return 'Judicial Officer / Judge of Superior Court';
      case 'clerk':
        return 'Court Registrar / Session Clerk';
      case 'prosecutor':
        return 'State Advocate / Public Prosecutor';
      case 'manager':
        return 'Transcription Center Manager';
      case 'staff':
        return 'Senior Court Proofreader & Legal QA Specialist';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A1931] to-[#162C4E] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md border border-white/20">
              {currentUser.badge || 'JC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Judicial Profile & Credential Identification</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-400/20 text-blue-200 border border-blue-300/30">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Official accreditation across all 14 Regions & Superior Courts of Namibia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated and certified with Judicial Registry credentials!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Section 1: Personal & Legal Identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0A1931] font-bold text-xs border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Section 1: Personal & Institutional Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-medium focus:outline-none focus:border-blue-600"
                  placeholder="e.g. Adv. Helao Shikwambi"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  National ID or Passport Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.nationalIdOrPassport || ''}
                  onChange={(e) => setFormData({ ...formData, nationalIdOrPassport: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-mono focus:outline-none focus:border-blue-600"
                  placeholder="e.g. NAM-85041200349"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] focus:outline-none focus:border-blue-600"
                    placeholder="user@smithlaw.com.na"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Direct Telephone / Mobile</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-mono focus:outline-none focus:border-blue-600"
                    placeholder="+264 61 248 990"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Law Firm / Company / Government Directorate Name
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.companyOrFirmName || ''}
                    onChange={(e) => setFormData({ ...formData, companyOrFirmName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] focus:outline-none focus:border-blue-600"
                    placeholder="e.g. Smith & Partners Legal Advocates (Inc.)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Regional Location (All 14 Regions of Namibia & Towns) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[#0A1931] font-bold text-xs border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Section 2: Regional Magisterial Jurisdiction (14 Regions of Namibia)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Namibian Region (14 Administrative Regions)
                </label>
                <select
                  value={selectedRegionName}
                  onChange={(e) => setSelectedRegionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {NAMIBIA_REGIONS.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.region} Region
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Town / Magisterial District
                </label>
                <select
                  value={formData.town || availableTowns[0] || ''}
                  onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {availableTowns.map((town) => (
                    <option key={town} value={town}>
                      {town}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Primary State Magistrate Court Station
                </label>
                <select
                  value={formData.stateMagistrateCourt || availableMagistrates[0] || ''}
                  onChange={(e) => setFormData({ ...formData, stateMagistrateCourt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {availableMagistrates.map((court) => (
                    <option key={court} value={court}>
                      {court}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Superior Court Jurisdiction
                </label>
                <select
                  value={formData.superiorCourt || SUPERIOR_COURTS[1]}
                  onChange={(e) => setFormData({ ...formData, superiorCourt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931] font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  {SUPERIOR_COURTS.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Role-Specific Credentials */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[#0A1931] font-bold text-xs border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Section 3: Professional Role Credentials ({getRoleLabel(formData.role)})</span>
            </div>

            {formData.role === 'lawyer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Law Society of Namibia (LSN) Practicing Number
                  </label>
                  <input
                    type="text"
                    value={formData.barOrPracticingNumber || ''}
                    onChange={(e) => setFormData({ ...formData, barOrPracticingNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-[#0A1931]"
                    placeholder="LSN-2016-0812"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Fidelity Fund Certificate Status
                  </label>
                  <input
                    type="text"
                    defaultValue="Valid for Current Legal Year (Gazetted)"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50"
                  />
                </div>
              </div>
            )}

            {formData.role === 'judge' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Judicial Chambers Location</label>
                  <input
                    type="text"
                    value={formData.judicialChambers || ''}
                    onChange={(e) => setFormData({ ...formData, judicialChambers: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931]"
                    placeholder="Chambers 3C, High Court Windhoek"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Judicial Commission Status</label>
                  <input
                    type="text"
                    defaultValue="Article 82 Judicial Appointment (Life Tenure)"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50"
                  />
                </div>
              </div>
            )}

            {formData.role === 'clerk' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Court Registrar Registration ID</label>
                  <input
                    type="text"
                    value={formData.clerkRegistrationId || ''}
                    onChange={(e) => setFormData({ ...formData, clerkRegistrationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-[#0A1931]"
                    placeholder="REG-KH-2021-99"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Docket Clearance Level</label>
                  <input
                    type="text"
                    defaultValue="Full High & Supreme Docket Access"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50"
                  />
                </div>
              </div>
            )}

            {formData.role === 'prosecutor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PG Prosecutions Station</label>
                  <input
                    type="text"
                    value={formData.prosecutorStation || ''}
                    onChange={(e) => setFormData({ ...formData, prosecutorStation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-[#0A1931]"
                    placeholder="High Court Criminal Prosecutions Unit"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Special Delegation</label>
                  <input
                    type="text"
                    defaultValue="Prosecutor-General Section 3 Delegation"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50"
                  />
                </div>
              </div>
            )}

            {formData.role === 'staff' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Certified Typing Speed (WPM)</label>
                  <input
                    type="number"
                    value={formData.transcriptionWpm || 95}
                    onChange={(e) => setFormData({ ...formData, transcriptionWpm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-[#0A1931]"
                    placeholder="95"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Security Vetting Clearance</label>
                  <input
                    type="text"
                    defaultValue="Level 1 National Court In-Camera Clearance"
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 bg-slate-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              *All information is securely stored under Namibian Judiciary data privacy regulations.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
              >
                Save & Accredit Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
