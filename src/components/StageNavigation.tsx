import React from 'react';
import {
  UploadCloud,
  Cpu,
  TableProperties,
  AlertOctagon,
  FileBadge2,
} from 'lucide-react';
import { ActiveWorkspaceTab, AuditEngineResult } from '../types/audit';

interface StageNavigationProps {
  activeTab: ActiveWorkspaceTab;
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
  result: AuditEngineResult | null;
  hasInputFiles: boolean;
}

export const StageNavigation: React.FC<StageNavigationProps> = ({
  activeTab,
  onSelectTab,
  result,
  hasInputFiles,
}) => {
  const tabs = [
    {
      id: 'ingestion' as ActiveWorkspaceTab,
      label: 'Data Ingestion',
      icon: UploadCloud,
      badge: hasInputFiles ? 'Files Ready' : null,
      badgeColor: 'emerald',
    },
    {
      id: 'rules' as ActiveWorkspaceTab,
      label: 'Pipeline Architecture',
      icon: Cpu,
      badge: '7 Stages',
      badgeColor: 'slate',
    },
    {
      id: 'workbench' as ActiveWorkspaceTab,
      label: 'Cleaned Workbench',
      icon: TableProperties,
      badge: result ? `${result.summary.finalRows.toLocaleString()} rows` : null,
      badgeColor: 'emerald',
      disabled: !result,
    },
    {
      id: 'discrepancies' as ActiveWorkspaceTab,
      label: 'Purged & Discrepancies',
      icon: AlertOctagon,
      badge: result ? `${result.droppedRecords.length + result.summary.unmatchedRows}` : null,
      badgeColor: 'amber',
      disabled: !result,
    },
    {
      id: 'audit_trail' as ActiveWorkspaceTab,
      label: 'Audit Trail & Provenance',
      icon: FileBadge2,
      badge: result ? 'Certified' : null,
      badgeColor: 'sky',
      disabled: !result,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isDisabled
                    ? 'text-slate-300 cursor-not-allowed opacity-60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : tab.badgeColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : tab.badgeColor === 'amber'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : tab.badgeColor === 'sky'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
