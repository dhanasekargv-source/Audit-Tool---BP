import React from 'react';
import { AuditSummary } from '../types/audit';
import {
  FileCheck,
  AlertTriangle,
  Layers,
  UserCheck,
  UserX,
  FileMinus2,
  ExternalLink,
} from 'lucide-react';

interface SummaryMetricsProps {
  summary: AuditSummary;
  onViewUnmatched: () => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  summary,
  onViewUnmatched,
}) => {
  const matchRate =
    summary.finalRows > 0
      ? ((summary.matchedRows / summary.finalRows) * 100).toFixed(1)
      : '0.0';

  const reduction = summary.originalRows - summary.finalRows;
  const reductionPct =
    summary.originalRows > 0
      ? ((reduction / summary.originalRows) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Processing Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit executed successfully · Net reduction of{' '}
            <strong className="text-slate-800 font-semibold font-mono">
              {reduction.toLocaleString()} rows ({reductionPct}%)
            </strong>
          </p>
        </div>

        {summary.unmatchedRows > 0 && (
          <button
            type="button"
            onClick={onViewUnmatched}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Inspect {summary.unmatchedRows} Unmatched</span>
            <ExternalLink className="w-3 h-3 text-amber-600" />
          </button>
        )}
      </div>

      {/* 6 Stat Boxes corresponding to user original cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Original Rows */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 text-center flex flex-col justify-between">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary.originalRows.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Original Rows
          </div>
        </div>

        {/* 2. Duplicates Removed */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 text-center flex flex-col justify-between">
          <div className="flex items-center justify-center gap-1 text-rose-500 mb-1">
            <FileMinus2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700">
            {summary.duplicateRowsRemoved.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Duplicates Removed
          </div>
        </div>

        {/* 3. Blank Linked Names Removed */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 text-center flex flex-col justify-between">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {summary.blankRowsRemoved.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Blank Names Removed
          </div>
        </div>

        {/* 4. Final Rows */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
            {summary.finalRows.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-emerald-900 mt-1">
            Final Rows
          </div>
        </div>

        {/* 5. Employee Matches */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 text-center flex flex-col justify-between">
          <div className="flex items-center justify-center gap-1 text-sky-600 mb-1">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary.matchedRows.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Employee Matches ({matchRate}%)
          </div>
        </div>

        {/* 6. Unmatched IDs */}
        <div
          onClick={summary.unmatchedRows > 0 ? onViewUnmatched : undefined}
          className={`border rounded-lg p-3.5 text-center flex flex-col justify-between transition-colors ${
            summary.unmatchedRows > 0
              ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/70 cursor-pointer'
              : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <UserX className="w-3.5 h-3.5" />
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              summary.unmatchedRows > 0 ? 'text-amber-800' : 'text-slate-700'
            }`}
          >
            {summary.unmatchedRows.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-1">
            Unmatched IDs
          </div>
        </div>
      </div>
    </div>
  );
};
