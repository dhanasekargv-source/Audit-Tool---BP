import React from 'react';
import {
  Cpu,
  ShieldAlert,
  ArrowRight,
  Database,
  Filter,
  SortAsc,
  UserCheck,
  Columns,
  CheckCircle2,
} from 'lucide-react';
import { STAGE_DEFINITIONS, DEFAULT_COUNTRY_PRIORITY, COUNTRY_LABELS } from '../services/AuditEngine';
import { StageExecutionResult } from '../types/audit';

interface PipelineRulesViewProps {
  stageResults?: StageExecutionResult[];
  onTriggerRun?: () => void;
  canRun?: boolean;
}

export const PipelineRulesView: React.FC<PipelineRulesViewProps> = ({
  stageResults = [],
  onTriggerRun,
  canRun = false,
}) => {
  const getStageIcon = (id: string) => {
    switch (id) {
      case 'prune_fgh':
        return Columns;
      case 'numeric_m':
        return Database;
      case 'purge_blanks':
      case 'deduplicate':
        return Filter;
      case 'country_sort':
        return SortAsc;
      case 'team_lookup':
        return UserCheck;
      case 'inject_col_o':
        return Columns;
      default:
        return Cpu;
    }
  };

  const priorityEntries = Object.entries(DEFAULT_COUNTRY_PRIORITY).sort(
    (a, b) => a[1] - b[1]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Audit Pipeline Architecture & Rules Specification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic transformation engine following SAP Master Data Governance compliance
              </p>
            </div>
          </div>
        </div>

        {canRun && onTriggerRun && (
          <button
            type="button"
            onClick={onTriggerRun}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer self-start md:self-auto"
          >
            Execute Pipeline
          </button>
        )}
      </div>

      {/* Country Priority Matrix */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Sanctions & Compliance Country Sort Hierarchy
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Rules Step #5
          </span>
        </div>

        <p className="text-xs text-slate-300">
          The pipeline sorts the cleaned records prioritizing designated compliance and restricted jurisdictions at the very top of the audit report:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {priorityEntries.map(([code, rank]) => (
            <div
              key={code}
              className="bg-slate-800 border border-slate-700/80 rounded-lg p-2.5 text-center flex flex-col justify-between"
            >
              <div className="text-[10px] font-mono text-slate-400">
                Priority Rank #{rank}
              </div>
              <div className="text-base font-mono font-bold text-emerald-300 my-0.5">
                {code}
              </div>
              <div className="text-[11px] text-slate-300 truncate" title={COUNTRY_LABELS[code]}>
                {COUNTRY_LABELS[code]}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>
            Records for all other countries outside this 8-country matrix are sorted alphabetically by country code (A to Z).
          </span>
        </div>
      </div>

      {/* 7 Architectural Stages Detailed List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono px-1">
          Sequential Stage Definitions
        </h3>

        <div className="space-y-3">
          {STAGE_DEFINITIONS.map((stage) => {
            const Icon = getStageIcon(stage.id);
            const execResult = stageResults.find((r) => r.stageId === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 font-mono font-bold text-xs">
                    {stage.stepNumber}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">
                        {stage.name}
                      </h4>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {stage.category}
                      </span>
                      {execResult && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Executed ({execResult.executionTimeMs} ms)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {stage.shortDesc}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                      {stage.detailedDesc}
                    </p>
                  </div>
                </div>

                {execResult && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shrink-0 text-right min-w-36 self-end md:self-auto">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Affected Items
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-800">
                      {execResult.rowsAffected.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {execResult.rowsAfter.toLocaleString()} final rows
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
