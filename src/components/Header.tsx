import React from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  RotateCcw,
  BookOpen,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { downloadSampleTemplate } from '../utils/sampleDataGenerator';

interface HeaderProps {
  onLoadSampleData: () => void;
  onReset: () => void;
  hasFiles: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSampleData,
  onReset,
  hasFiles,
  onOpenHelp,
}) => {
  const [templateDropdownOpen, setTemplateDropdownOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  Audit Tool
                </span>
                <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  BP Engine
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                  v2.4 SAP Reconciler
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Automated SAP Business Partner Cleaning, Deduplication & Roster Lookup
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all cursor-pointer active:scale-95"
              title="Preload sample SAP BP report and Team roster to test immediately"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Load Sample Data</span>
            </button>

            {/* Templates Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTemplateDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {templateDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setTemplateDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateDropdownOpen(false);
                        downloadSampleTemplate('main');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Main Report Template (.xlsx)</span>
                      <Download className="w-3 h-3 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTemplateDropdownOpen(false);
                        downloadSampleTemplate('team');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Team Roster Template (.xlsx)</span>
                      <Download className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Audit Specifications & Logic"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Specification</span>
            </button>

            {hasFiles && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-900 transition-colors cursor-pointer"
                title="Reset all files and results"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
