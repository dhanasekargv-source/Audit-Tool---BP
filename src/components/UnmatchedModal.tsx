import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface UnmatchedModalProps {
  isOpen: boolean;
  onClose: () => void;
  unmatchedList: { empId: string; count: number }[];
  totalUnmatchedRows: number;
}

export const UnmatchedModal: React.FC<UnmatchedModalProps> = ({
  isOpen,
  onClose,
  unmatchedList,
  totalUnmatchedRows,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = unmatchedList
      .map((item) => `${item.empId}\t${item.count}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExcel = () => {
    const headers = ['Unmatched Changed By (EMP ID)', 'Number of Records Affected'];
    const rows = unmatchedList.map((item) => [item.empId, item.count]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Unmatched IDs');
    XLSX.writeFile(wb, `Unmatched_Employee_IDs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Unmatched Employee IDs Roster
              </h3>
              <p className="text-xs text-slate-500">
                {unmatchedList.length} distinct IDs across {totalUnmatchedRows} rows
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

        {/* Description */}
        <div className="p-4 bg-amber-50/60 border-b border-amber-200 text-xs text-amber-900">
          The following <strong className="font-semibold">Changed By</strong> values appeared in the Main Input Report but were not found in the Team Details file. As a result, their <strong className="font-semibold">Team Member Name</strong> (Column O) remains empty.
        </div>

        {/* List Table */}
        <div className="overflow-y-auto p-4 flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 sticky top-0">
              <tr>
                <th className="py-2 px-3 font-semibold border-b border-slate-200">
                  Changed By ID
                </th>
                <th className="py-2 px-3 font-semibold border-b border-slate-200 text-right">
                  Affected Rows
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {unmatchedList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 font-mono">
                  <td className="py-2 px-3 text-slate-900 font-semibold">
                    {item.empId || '(Blank ID)'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {item.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export IDs (.xlsx)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
