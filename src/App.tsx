import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Check,
  CheckCircle2,
  Download,
  FolderOpen,
  Info,
  Search,
  Sparkles,
  Users,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  DEFAULT_38_TEAM_MEMBERS,
  createDefaultTeamDetailsFile,
  TeamMember,
} from './utils/defaultTeamRoster';
import { TeamInspectModal } from './components/TeamInspectModal';
import { RplNameMatchingView } from './components/RplNameMatchingView';
import { SummaryMetrics } from './components/SummaryMetrics';
import { DataPreviewTable } from './components/DataPreviewTable';
import { UnmatchedModal } from './components/UnmatchedModal';
import { AuditEngineResult } from './types/audit';
import { AuditEngine } from './services/AuditEngine';
import { generateSampleData } from './utils/sampleDataGenerator';
import { downloadWorkbook } from './utils/excelProcessor';

export default function App() {
  // Selected workflow module: 1 = BP Daily Report Cleaner, 2 = BP Name Matching
  const [activeModule, setActiveModule] = useState<1 | 2>(1);

  // File states
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [teamFile, setTeamFile] = useState<File>(() => createDefaultTeamDetailsFile());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_38_TEAM_MEMBERS);
  const [teamFileName, setTeamFileName] = useState<string>('Team_details.xlsx');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<AuditEngineResult | null>(null);
  const [statusBanner, setStatusBanner] = useState<{
    text: string;
    type: 'info' | 'success' | 'error';
  }>({
    text: 'Please select a BP Excel file (.xlsx or .xls) or load sample data.',
    type: 'info',
  });

  // Modals
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isUnmatchedOpen, setIsUnmatchedOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const teamFileInputRef = useRef<HTMLInputElement>(null);

  // Handle BP Report file selection
  const handleSelectInputFile = (file: File) => {
    setInputFile(file);
    setResult(null);
    setStatusBanner({
      text: `BP Report selected: "${file.name}". Click "Clean BP Report & VLOOKUP" to execute.`,
      type: 'info',
    });
  };

  // Handle desktop team file selection
  const handleSelectTeamFile = async (file: File) => {
    setTeamFile(file);
    setTeamFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      if (rows.length > 1) {
        const parsed: TeamMember[] = [];
        for (let i = 1; i < rows.length; i++) {
          const empId = String(rows[i][0] ?? '').trim();
          const name = String(rows[i][1] ?? '').trim();
          if (empId) {
            parsed.push({ empId, name, department: String(rows[i][2] ?? '') });
          }
        }
        if (parsed.length > 0) {
          setTeamMembers(parsed);
          setStatusBanner({
            text: `Loaded ${parsed.length} team members from ${file.name}.`,
            type: 'info',
          });
        }
      }
    } catch {
      // Ignored
    }
  };

  // Load sample BP data
  const handleLoadSampleBP = () => {
    const { mainReportFile } = generateSampleData();
    setInputFile(mainReportFile);
    setResult(null);
    setStatusBanner({
      text: 'Loaded sample SAP Business Partner (BP) audit report (includes priority countries CU, IR, RU, duplicates & blanks).',
      type: 'info',
    });
  };

  // Reset Team Details to default 38 members
  const handleResetTeam = () => {
    const defaultFile = createDefaultTeamDetailsFile();
    setTeamFile(defaultFile);
    setTeamFileName('Team_details.xlsx');
    setTeamMembers(DEFAULT_38_TEAM_MEMBERS);
    setStatusBanner({
      text: 'Team details reset to default 38 mapped members roster.',
      type: 'info',
    });
  };

  // Process Report
  const handleProcess = async () => {
    if (!inputFile) {
      setStatusBanner({
        text: 'Please select a BP Excel file (.xlsx or .xls) or click "Load Sample BP" first.',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setProgressMsg('Processing BP report...');

    try {
      const engine = new AuditEngine();
      const res = await engine.execute(inputFile, teamFile, (_step, pct, msg) => {
        setProgressMsg(`${msg} (${pct}%)`);
      });

      setResult(res);
      setStatusBanner({
        text: `BP audit report cleaned successfully! ${res.summary.finalRows.toLocaleString()} rows verified and Column O populated with Team Member Name.`,
        type: 'success',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatusBanner({
        text: `Error processing BP report: ${errMsg}`,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf2fa] text-slate-800 font-sans p-4 sm:p-7 md:p-9 flex flex-col items-center selection:bg-teal-100 selection:text-teal-900">
      <div className="max-w-6xl w-full space-y-5">
        {/* TOP NAV BANNER */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0d1e38] via-[#112443] to-[#12284c] text-white p-6 sm:p-7 shadow-md border border-[#1b345b] flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Title & Subtitle */}
          <div className="flex items-center gap-4">
            {/* Custom App Bar-Chart Icon */}
            <div className="w-13 h-13 rounded-2xl bg-[#1e3458]/70 border border-[#2e4c7e] flex items-center justify-center p-2.5 shadow-inner shrink-0">
              <div className="w-full h-full flex items-end justify-center gap-1.5 pb-0.5">
                <div className="w-2.5 h-6 bg-[#ec4899] rounded-xs shadow-xs" />
                <div className="w-2.5 h-8 bg-[#86efac] rounded-xs shadow-xs" />
                <div className="w-2.5 h-7 bg-[#38bdf8] rounded-xs shadow-xs" />
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                  Audit{' '}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#32d5b6] ml-1.5 font-sans">
                  Tool
                </span>
                <span className="text-xs uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 ml-3">
                  BP Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
                Automate your BP change audit cleaning, Team VLOOKUP, and RPL name matching workflows with browser-side precision.
              </p>
            </div>
          </div>

          {/* Right Clean Data Card */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3.5 self-start md:self-auto shrink-0 shadow-inner">
            <div className="w-9 h-9 rounded-full border-2 border-[#32d5b6] flex items-center justify-center text-[#32d5b6]">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Clean Data
              </div>
              <div className="text-[11px] text-[#93e5d5] font-medium tracking-tight">
                Better Insights · Smarter Audits
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW MODULE CARDS (1 & 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: BP Daily Report Cleaner */}
          <div
            onClick={() => setActiveModule(1)}
            className={`rounded-2xl p-5 sm:p-6 transition-all cursor-pointer relative ${
              activeModule === 1
                ? 'bg-white border-2 border-[#1a73e8] shadow-sm ring-1 ring-[#1a73e8]/20'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1a73e8] text-white font-bold flex items-center justify-center text-xs shrink-0 font-sans shadow-xs mt-0.5">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  BP Daily Report Cleaner
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Clean, prioritize countries (CU → UA), remove columns F/G/H, convert Col M, purge blank Linked Names, deduplicate, and VLOOKUP Team Details (EMP Id → Name) to update Column O.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: BP RPL Name Matching */}
          <div
            onClick={() => setActiveModule(2)}
            className={`rounded-2xl p-5 sm:p-6 transition-all cursor-pointer relative ${
              activeModule === 2
                ? 'bg-white border-2 border-[#6d28d9] shadow-sm ring-1 ring-[#6d28d9]/20'
                : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#6d28d9] text-white font-bold flex items-center justify-center text-xs shrink-0 font-sans shadow-xs mt-0.5">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  BP RPL Name Matching
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Compare Business Partner Name and RplName / Linked Names using token-sort Fuzzy and Jaro-Winkler algorithms sorted from Highest to Lowest score.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 1: BP REPORT CLEANER */}
        {activeModule === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">
            {/* Dual Upload Boxes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT BOX: Select BP Daily Report */}
              <div className="border-2 border-dashed border-[#60a5fa] rounded-2xl p-7 sm:p-8 bg-[#f8fbff] text-center flex flex-col items-center justify-center min-h-[220px]">
                {/* Soft cloud icon graphic */}
                <div className="w-10 h-7 rounded-full bg-gradient-to-r from-purple-200/70 to-indigo-100 flex items-center justify-center mb-2 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-white/80" />
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Select BP Daily Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-4">
                  Upload your daily Business Partner change Excel report (.xlsx or .xls)
                </p>

                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectInputFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Choose BP File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleBP}
                    className="bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Load Sample BP</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 mt-3.5 font-mono">
                  {inputFile ? (
                    <span className="font-semibold text-emerald-700">
                      {inputFile.name} ({(inputFile.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    'No file chosen'
                  )}
                </div>
              </div>

              {/* RIGHT BOX: Team Details (VLOOKUP) */}
              <div className="border border-dashed border-[#86efac] rounded-2xl p-6 bg-[#f7fdf9] flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Team Details (VLOOKUP)
                      </h3>
                    </div>

                    <span className="bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0] rounded-full px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>{teamMembers.length} mapped</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Source Excel file from desktop for matching <strong>EMP Id → Name</strong> to populate Column O (Changed By).
                  </p>

                  {/* File status line */}
                  <div className="bg-white/90 border border-slate-200/90 rounded-lg px-3 py-2 text-xs flex items-center justify-between mt-3 shadow-2xs">
                    <div className="truncate text-slate-700">
                      <span>File: </span>
                      <strong className="text-slate-900 font-semibold">{teamFileName}</strong>
                      <span className="text-slate-500 hidden sm:inline"> (Default / Desktop Ready)</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetTeam}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer ml-2 shrink-0 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* 3 Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap mt-4 pt-2">
                  <input
                    ref={teamFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectTeamFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => teamFileInputRef.current?.click()}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Choose Desktop File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetTeam}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sample File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInspectOpen(true)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspect ({teamMembers.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TWO LARGE ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Left Action Button (Mint Green) */}
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing}
                className="bg-[#7ec9ab] hover:bg-[#6ebf9e] active:bg-[#5db492] text-[#0f3c30] px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="w-4 h-4 border-2 border-[#0f3c30]/40 border-t-[#0f3c30] rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-current" />
                )}
                <span>{isProcessing ? progressMsg || 'Cleaning...' : 'Clean BP Report & VLOOKUP'}</span>
              </button>

              {/* Right Action Button (Soft Purple) */}
              <button
                type="button"
                disabled={!result}
                onClick={() => {
                  if (result) downloadWorkbook(result.workbook, 'Cleaned_BP_Audit_Report');
                }}
                className={`px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all ${
                  result
                    ? 'bg-[#c8b7f7] hover:bg-[#b8a2f4] active:bg-[#a68ff0] text-[#3b1979] cursor-pointer active:scale-[0.99]'
                    : 'bg-[#d8d2ea] text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Cleaned BP Report</span>
              </button>
            </div>

            {/* INFO BANNER */}
            <div
              className={`rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm flex items-center gap-2.5 font-medium transition-all ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : statusBanner.type === 'error'
                  ? 'bg-rose-50 border border-rose-300 text-rose-900'
                  : 'bg-[#e8f1fc] border border-[#bcd7f7] text-[#1e4277]'
              }`}
            >
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusBanner.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-[#1e4277] shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>

            {/* RESULTS DASHBOARD */}
            {result && (
              <div className="space-y-6 pt-3 border-t border-slate-100">
                <SummaryMetrics
                  summary={result.summary}
                  onViewUnmatched={() => setIsUnmatchedOpen(true)}
                />

                <DataPreviewTable
                  headers={result.headers}
                  dataRows={result.dataRows}
                  workbook={result.workbook}
                  onViewUnmatched={() => setIsUnmatchedOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* MODULE 2: BP RPL NAME MATCHING */}
        {activeModule === 2 && <RplNameMatchingView />}
      </div>

      {/* MODALS */}
      <TeamInspectModal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        members={teamMembers}
      />

      {result && (
        <UnmatchedModal
          isOpen={isUnmatchedOpen}
          onClose={() => setIsUnmatchedOpen(false)}
          unmatchedList={result.summary.unmatchedIdsList.map((u) => ({
            empId: u.empId,
            count: u.occurrences,
          }))}
          totalUnmatchedRows={result.summary.unmatchedRows}
        />
      )}
    </div>
  );
}
