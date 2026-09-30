import React from 'react';
import { X, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { COUNTRY_PRIORITY, COUNTRY_NAMES } from '../utils/excelProcessor';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Audit Tool Specification & Business Logic
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic transformation standards for SAP BP Reports
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

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Overview
            </h4>
            <p>
              This tool cleans raw SAP Business Partner change logs and reconciles them with an internal Team Details roster to produce an audit-ready, deduplicated, and prioritized spreadsheet with Excel AutoFilters enabled.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Sequential Processing Steps
            </h4>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 1: Delete original columns F, G, and H
                </div>
                <div className="text-slate-600 mt-0.5">
                  Deletes columns at 0-indexes 5, 6, and 7 (original F, G, H) from headers and all data rows. These typically represent temporary extraction technical artifacts.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 2: Convert Column M to Number
                </div>
                <div className="text-slate-600 mt-0.5">
                  Targeted at Column M (index 12 after F, G, H removal). Strips commas, trims spaces, and parses to a clean JavaScript floating-point number.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 3: Remove Blank "Linked Names"
                </div>
                <div className="text-slate-600 mt-0.5">
                  Filters out any row where the normalized Linked Names column is empty or whitespace-only.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 4: Composite Deduplication
                </div>
                <div className="text-slate-600 mt-0.5">
                  Eliminates identical changes matching on composite key:
                  <code className="block mt-1 font-mono text-[11px] bg-white border border-slate-200 p-1 rounded text-slate-800">
                    Business Partner + Linked Names + Changed By + Changed On
                  </code>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 5: Country Priority & Sanctions Sort
                </div>
                <div className="text-slate-600 mt-0.5">
                  Orders rows so designated compliance jurisdictions appear first:
                  <div className="flex flex-wrap gap-1.5 mt-1.5 font-mono text-[11px]">
                    {Object.entries(COUNTRY_PRIORITY)
                      .sort((a, b) => a[1] - b[1])
                      .map(([c, r]) => (
                        <span key={c} className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                          #{r}: {c} ({COUNTRY_NAMES[c]})
                        </span>
                      ))}
                  </div>
                  Rows outside this list are sorted alphabetically by country code.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 6: Team Member Roster Lookup
                </div>
                <div className="text-slate-600 mt-0.5">
                  Cross-references the <strong className="font-semibold">Changed By</strong> ID with the uploaded Team Details file (<strong className="font-semibold">EMP ID → Name</strong>), trimming trailing decimal artifacts (e.g., <code>105.0</code> becomes <code>105</code>).
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900">
                  Step 7: Inject Column O ("Team Member Name")
                </div>
                <div className="text-slate-600 mt-0.5">
                  Inserts a brand-new column at index 14 (Column O in Excel). Does not overwrite existing data; subsequent columns shift rightwards.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
