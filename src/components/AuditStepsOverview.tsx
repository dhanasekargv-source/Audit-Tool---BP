import React from 'react';
import { CheckCircle2, ChevronRight, ShieldAlert, Cpu } from 'lucide-react';
import { COUNTRY_PRIORITY, COUNTRY_NAMES } from '../utils/excelProcessor';
import { ProcessingStepLog } from '../types/audit';

interface AuditStepsOverviewProps {
  logs?: ProcessingStepLog[];
  isProcessing?: boolean;
}

export const AuditStepsOverview: React.FC<AuditStepsOverviewProps> = ({
  logs = [],
  isProcessing = false,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Drop F, G, H',
      desc: 'Removes legacy columns 5, 6, 7',
    },
    {
      num: 2,
      title: 'Column M Numeric',
      desc: 'Converts index 12 to clean number',
    },
    {
      num: 3,
      title: 'Filter Blank Names',
      desc: 'Purges empty Linked Names',
    },
    {
      num: 4,
      title: 'Purge Duplicates',
      desc: 'BP + Linked + Changed By + Date',
    },
    {
      num: 5,
      title: 'Priority Country Sort',
      desc: 'CU → IR → KP → RU → BY → VE → NI → UA',
    },
    {
      num: 6,
      title: 'Team Lookup',
      desc: 'Matches Changed By to EMP ID',
    },
    {
      num: 7,
      title: 'Inject Column O',
      desc: 'Inserts Team Member Name at index 14',
    },
  ];

  const priorityEntries = Object.entries(COUNTRY_PRIORITY).sort(
    (a, b) => a[1] - b[1]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 text-slate-100 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Automated Audit Pipeline
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            7 Sequential Steps
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <span>Target Schema: SAP BP Extract</span>
        </div>
      </div>

      {/* Steps Row / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step) => {
          const log = logs.find((l) => l.step === step.num);
          const isDone = Boolean(log);

          return (
            <div
              key={step.num}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Step {step.num}
                  </span>
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {step.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {step.desc}
                </div>
              </div>

              {log?.countRemovedOrAffected !== undefined && (
                <div className="mt-2 pt-1 border-t border-emerald-200/60 text-[10px] font-mono text-emerald-800 font-medium">
                  {log.countRemovedOrAffected.toLocaleString()} items
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Country Priority Banner */}
      <div className="rounded-lg bg-slate-900 text-white p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Country Priority Sort:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {priorityEntries.map(([code, rank], idx) => (
            <div key={code} className="flex items-center gap-1">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-300"
                title={`${COUNTRY_NAMES[code]} (Rank ${rank})`}
              >
                <span className="text-[10px] text-slate-400 font-normal">#{rank}</span>
                <span>{code}</span>
              </span>
              {idx < priorityEntries.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              )}
            </div>
          ))}
          <span className="text-slate-600 text-xs mx-0.5">→</span>
          <span className="text-xs font-mono text-slate-400">
            [Remaining Countries A–Z]
          </span>
        </div>
      </div>
    </div>
  );
};
