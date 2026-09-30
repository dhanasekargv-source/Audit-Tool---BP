import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  AlertOctagon,
  Download,
  Copy,
  Check,
  Search,
  Layers,
  FileMinus,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { DroppedRecord, UnmatchedEmployeeRecord } from '../types/audit';

interface DiscrepanciesViewProps {
  droppedRecords: DroppedRecord[];
  unmatchedList: UnmatchedEmployeeRecord[];
  totalUnmatchedRows: number;
}

export const DiscrepanciesView: React.FC<DiscrepanciesViewProps> = ({
  droppedRecords,
  unmatchedList,
  totalUnmatchedRows,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'blanks' | 'duplicates' | 'unmatched'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const blankDrops = droppedRecords.filter((d) => d.reason === 'blank_linked_name');
  const duplicateDrops = droppedRecords.filter((d) => d.reason === 'duplicate_composite_key');

  const filteredDropped = droppedRecords.filter((d) => {
    if (activeSubTab === 'blanks' && d.reason !== 'blank_linked_name') return false;
    if (activeSubTab === 'duplicates' && d.reason !== 'duplicate_composite_key') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.businessPartner.toLowerCase().includes(q) ||
        d.linkedName.toLowerCase().includes(q) ||
        d.changedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyUnmatched = () => {
    const text = unmatchedList
      .map((u) => `${u.empId}\t${u.occurrences}\t${u.affectedBpList.join(', ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportDiscrepancies = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Purged Rows
    const purgedHeaders = ['Original Row Index', 'Business Partner', 'Linked Name', 'Changed By', 'Changed On', 'Purge Reason'];
    const purgedData = droppedRecords.map((d) => [
      d.originalIndex,
      d.businessPartner,
      d.linkedName,
      d.changedBy,
      d.changedOn,
      d.reason === 'blank_linked_name' ? 'Blank Linked Name' : 'Duplicate Composite Key',
    ]);
    const purgedWs = XLSX.utils.aoa_to_sheet([purgedHeaders, ...purgedData]);
    XLSX.utils.book_append_sheet(wb, purgedWs, 'Purged Rows');

    // Sheet 2: Unmatched IDs
    const unmatchedHeaders = ['Missing Employee ID (Changed By)', 'Record Count', 'Sample Business Partners'];
    const unmatchedData = unmatchedList.map((u) => [
      u.empId,
      u.occurrences,
      u.affectedBpList.join(', '),
    ]);
    const unmatchedWs = XLSX.utils.aoa_to_sheet([unmatchedHeaders, ...unmatchedData]);
    XLSX.utils.book_append_sheet(wb, unmatchedWs, 'Unmatched Roster IDs');

    XLSX.writeFile(wb, `Audit_Discrepancies_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Discrepancy & Purged Records Inspection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed audit ledger of every filtered record and unmapped employee ID
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportDiscrepancies}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Discrepancies Sheet (.xlsx)</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Blank Linked Names Purged</span>
            <FileMinus className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">
            {blankDrops.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dropped during Step 3 of pipeline
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Duplicate Records Purged</span>
            <Layers className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800">
            {duplicateDrops.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dropped during Step 4 composite match
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Unmatched Employee IDs</span>
            <UserX className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-900">
            {unmatchedList.length} <span className="text-xs font-normal text-slate-500">({totalUnmatchedRows} rows)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Pending team roster enrichment
          </div>
        </div>
      </div>

      {/* Sub-Tabs & Filter */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Purged ({droppedRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('blanks')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeSubTab === 'blanks'
                  ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blank Names ({blankDrops.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('duplicates')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeSubTab === 'duplicates'
                  ? 'bg-white text-rose-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Duplicates ({duplicateDrops.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('unmatched')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeSubTab === 'unmatched'
                  ? 'bg-white text-sky-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missing Roster IDs ({unmatchedList.length})
            </button>
          </div>

          {activeSubTab !== 'unmatched' && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search purged rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          )}
        </div>

        {/* Content based on sub-tab */}
        {activeSubTab === 'unmatched' ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-600">
                These employee IDs were recorded under <strong>Changed By</strong> in the SAP export but were absent from the Team Details file:
              </div>
              <button
                type="button"
                onClick={handleCopyUnmatched}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {copiedId === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy All IDs</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                      Unmatched Employee ID
                    </th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">
                      Impacted Rows
                    </th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                      Sample Business Partners Touched
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unmatchedList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">
                        No unmatched employee IDs found. 100% team match achieved!
                      </td>
                    </tr>
                  ) : (
                    unmatchedList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {item.empId || '(Blank ID)'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-center font-semibold text-amber-800">
                          {item.occurrences}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {item.affectedBpList.join(', ')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200 w-16 text-center">
                    Original #
                  </th>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                    Business Partner
                  </th>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                    Linked Name
                  </th>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                    Changed By
                  </th>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                    Changed On
                  </th>
                  <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                    Purge Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDropped.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No records match the current discrepancy filter.
                    </td>
                  </tr>
                ) : (
                  filteredDropped.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-center text-slate-400">
                        {item.originalIndex}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {item.businessPartner || '—'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {item.linkedName ? (
                          <span>{item.linkedName}</span>
                        ) : (
                          <span className="text-amber-700 italic font-semibold">
                            (Empty / Blank)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {item.changedBy || '—'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {item.changedOn || '—'}
                      </td>
                      <td className="py-2 px-3">
                        {item.reason === 'blank_linked_name' ? (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Blank Linked Name (Step 3)
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Duplicate Composite Key (Step 4)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
