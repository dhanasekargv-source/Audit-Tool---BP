import React from 'react';
import { X, Users, Search, Download } from 'lucide-react';
import { TeamMember } from '../utils/defaultTeamRoster';
import * as XLSX from 'xlsx';

interface TeamInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
}

export const TeamInspectModal: React.FC<TeamInspectModalProps> = ({
  isOpen,
  onClose,
  members,
}) => {
  const [search, setSearch] = React.useState('');

  if (!isOpen) return null;

  const filtered = members.filter(
    (m) =>
      m.empId.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const headers = ['EMP ID', 'Name', 'Department', 'Role'];
    const rows = members.map((m) => [m.empId, m.name, m.department || '', m.role || '']);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Team Members');
    XLSX.writeFile(wb, 'Team_details_roster.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Team Details Roster ({members.length} Mapped)
              </h3>
              <p className="text-xs text-slate-500">
                VLOOKUP source for mapping EMP Id → Name
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Name or Department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 sticky top-0">
              <tr>
                <th className="py-2 px-3 font-semibold border-b border-slate-200">EMP ID</th>
                <th className="py-2 px-3 font-semibold border-b border-slate-200">Name</th>
                <th className="py-2 px-3 font-semibold border-b border-slate-200">Department</th>
                <th className="py-2 px-3 font-semibold border-b border-slate-200">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">{m.empId}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{m.name}</td>
                  <td className="py-2 px-3 text-slate-500">{m.department || '—'}</td>
                  <td className="py-2 px-3 text-slate-500">{m.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
