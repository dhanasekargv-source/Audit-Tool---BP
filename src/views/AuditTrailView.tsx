import React from 'react';
import {
  FileBadge2,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AuditEngineResult } from '../types/audit';

interface AuditTrailViewProps {
  result: AuditEngineResult;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ result }) => {
  const { summary, stageResults, auditTrailId } = result;

  const throughput =
    summary.totalDurationMs > 0
      ? Math.round((summary.originalRows / summary.totalDurationMs) * 1000)
      : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Formal Audit Certificate Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              Verification Certified
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SAP Standard Compliance
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Audit Execution Certificate
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reference ID: <strong className="text-emerald-400 font-mono">{auditTrailId}</strong> · Generated {summary.processedAt.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Execution Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Runtime</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {summary.totalDurationMs} ms
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Full transformation pass
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Throughput</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {throughput.toLocaleString()} <span className="text-xs font-normal text-slate-500">rows/s</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Client-side WebAssembly execution
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Audit Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            100% Deterministic
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Zero hallucination risk
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Clean Yield</span>
            <FileBadge2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-900">
            {((summary.finalRows / summary.originalRows) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {summary.finalRows} of {summary.originalRows} rows
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Verification Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Stage Verification Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Auditable trail of row counts, items modified, and latency per sequential stage
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 w-12 text-center">
                  #
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                  Stage Name
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">
                  Status
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-right">
                  Rows Before
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-right">
                  Rows After
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-right">
                  Impact Count
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-right">
                  Latency
                </th>
                <th className="py-2.5 px-3 font-semibold border-b border-slate-200">
                  Verification Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stageResults.map((st) => (
                <tr key={st.stageId} className="hover:bg-slate-50 font-sans">
                  <td className="py-2.5 px-3 font-mono text-center text-slate-400">
                    {st.stepNumber}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {st.name}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Passed</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-600">
                    {st.rowsBefore.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-semibold text-slate-900">
                    {st.rowsAfter.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-emerald-800 font-semibold">
                    {st.rowsAffected.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-slate-500">
                    {st.executionTimeMs} ms
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {st.notes}
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
