import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/court';
import {
  Scale,
  ChevronDown,
  Check,
  Smartphone,
  Sparkles,
  CreditCard,
  UserCheck,
  Building,
  MapPin,
  X,
  Info,
  Gavel,
} from 'lucide-react';

interface JudiCoreHeaderProps {
  currentUser: UserProfile;
  onSelectUserRole: (role: UserRole) => void;
  activeView: 'requester' | 'admin' | 'staff' | 'advisor' | 'billing' | 'services' | 'export' | 'audit' | 'bench';
  onSelectView: (view: 'requester' | 'admin' | 'staff' | 'advisor' | 'billing' | 'services' | 'export' | 'audit' | 'bench') => void;
  allUsers: Record<string, UserProfile>;
  onOpenProfileModal: () => void;
}


export const JudiCoreHeader: React.FC<JudiCoreHeaderProps> = ({
  currentUser,
  onSelectUserRole,
  activeView,
  onSelectView,
  allUsers,
  onOpenProfileModal,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      if (isIOSDevice) {
        setShowIOSModal(true);
      } else {
        alert('JudiCore PWA: Tap the browser menu (⋮) and select "Add to Home screen" or "Install App".');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* JudiCore Brand Logo */}
        <div
          onClick={() => onSelectView('requester')}
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#0A1931]">
                JudiCore
              </span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600 -mt-1">
              LEGAL SOLUTIONS (PTY) LTD - PRIVATE
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
          {currentUser.role !== 'staff' && (
            <button
              onClick={() => onSelectView('requester')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'requester'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Requests
            </button>
          )}

          {/* Bench Docket Tab (Judges, Registrars & Admin) */}
          {(currentUser.role === 'judge' || currentUser.role === 'registrar' || currentUser.role === 'admin') && (
            <button
              onClick={() => onSelectView('bench')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeView === 'bench'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-blue-600" />
              <span>Bench Docket</span>
            </button>
          )}

          {/* Proofreader Desk (Staff / Proofreader & Admin) */}
          {(currentUser.role === 'staff' || currentUser.role === 'admin') && (
            <button
              onClick={() => onSelectView('staff')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'staff'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Proofreader Desk
            </button>
          )}

          {/* Admin Center (Admin / Manager) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onSelectView('admin')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeView === 'admin'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Admin Center
            </button>
          )}


          {/* Services Overview Tab */}
          <button
            onClick={() => onSelectView('services')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeView === 'services'
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Our Services
          </button>
        </nav>

        {/* Right Actions: Install, Profile Modal, User Profile Switcher */}
        <div className="flex items-center gap-2.5">
          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              title="Install JudiCore to your device"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition shadow-2xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Install</span>
            </button>
          )}

          {/* Edit Profile Button (14 Regions & Identification) */}
          <button
            onClick={onOpenProfileModal}

            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            title="Edit profile credentials, company, and 14 regions"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">
              {currentUser.town ? `${currentUser.town}, ${currentUser.region}` : 'Namibia Profile'}
            </span>
            <span className="md:hidden">Profile</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {currentUser.badge || 'JC'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#0A1931] line-clamp-1">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 -mt-0.5">{currentUser.title}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Current Judicial Profile
                  </div>
                  <div className="font-bold text-sm text-[#0A1931]">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.companyOrFirmName || currentUser.courtOrFirm}</div>
                  <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{currentUser.town || 'Windhoek'}, {currentUser.region || 'Khomas'} Region</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full mt-2 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold text-center transition"
                  >
                    Edit Profile & 14 Regions Accreditation
                  </button>
                </div>

                <div className="px-4 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Switch Active Role
                </div>

                {Object.values(allUsers).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUserRole(u.role);
                      setIsRoleDropdownOpen(false);
                      if (u.role === 'staff') {
                        onSelectView('staff');
                      } else if (u.role === 'manager') {
                        onSelectView('admin');
                      } else {
                        onSelectView('requester');
                      }
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                      currentUser.role === u.role ? 'bg-blue-50 text-blue-600 font-bold' : 'text-[#0A1931]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.title}</div>
                    </div>
                    {currentUser.role === u.role && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="xl:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 py-1.5 px-2 text-[10px] font-semibold overflow-x-auto">
        <button
          onClick={() => onSelectView('requester')}
          className={`px-2 py-1 rounded shrink-0 ${activeView === 'requester' ? 'text-blue-600 font-bold bg-white' : 'text-slate-600'}`}
        >
          My Requests
        </button>
        <button
          onClick={() => onSelectView('staff')}
          className={`px-2 py-1 rounded shrink-0 ${activeView === 'staff' ? 'text-blue-600 font-bold bg-white' : 'text-slate-600'}`}
        >
          Proofreader
        </button>
        <button
          onClick={() => onSelectView('admin')}
          className={`px-2 py-1 rounded shrink-0 ${activeView === 'admin' ? 'text-blue-600 font-bold bg-white' : 'text-slate-600'}`}
        >
          Admin Center
        </button>

        <button
          onClick={() => onSelectView('services')}
          className={`px-2 py-1 rounded shrink-0 ${activeView === 'services' ? 'text-blue-600 font-bold bg-white' : 'text-slate-600'}`}
        >
          Services
        </button>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0A1931]">Install on iOS / Safari</h3>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Launch JudiCore anytime from your device's home screen.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
