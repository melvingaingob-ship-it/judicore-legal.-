import React, { useState } from 'react';
import { AuditLogEntry } from '../types/court';
import { ShieldCheck, Search, Filter, RefreshCw, Calendar, User, Clock } from 'lucide-react';

interface AuditTrailLogProps {
  logs: AuditLogEntry[];
}

export const AuditTrailLog: React.FC<AuditTrailLogProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.caseNumber.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.requestId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'REQUEST_SUBMITTED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ASSIGNED_TO_STAFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AUDIO_UPLOADED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HUMAN_VERIFIED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DISPATCHED_TO_PORTAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-[#0A1931] tracking-tight">
              Audit Trail Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every step (requested, assigned, verified, delivered) is permanently logged with timestamp and user verification.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total Logged Events: <span className="font-bold text-[#0A1931]">{logs.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case number, user, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-[#0A1931] placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#0A1931] font-medium shadow-2xs"
          >
            <option value="ALL">All Logged Actions</option>
            <option value="REQUEST_SUBMITTED">Request Submitted</option>
            <option value="ASSIGNED_TO_STAFF">Assigned to Staff</option>
            <option value="AUDIO_UPLOADED">Audio Uploaded</option>
            <option value="HUMAN_VERIFIED">Human Verified</option>
            <option value="DISPATCHED_TO_PORTAL">Dispatched to Portal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0A1931]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                    {log.requestId}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#0A1931] whitespace-nowrap">
                    {log.caseNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadge(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0A1931]">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {log.userRole}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
