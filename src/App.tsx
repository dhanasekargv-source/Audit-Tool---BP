import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { StageNavigation } from './components/StageNavigation';
import { UploadCard } from './components/UploadCard';
import { SummaryMetrics } from './components/SummaryMetrics';
import { DataPreviewTable } from './components/DataPreviewTable';
import { UnmatchedModal } from './components/UnmatchedModal';
import { RulesModal } from './components/RulesModal';
import { DiscrepanciesView } from './views/DiscrepanciesView';
import { AuditTrailView } from './views/AuditTrailView';
import { PipelineRulesView } from './views/PipelineRulesView';
import { ActiveWorkspaceTab, AuditEngineResult } from './types/audit';
import {
  findColumn,
  downloadWorkbook,
} from './utils/excelProcessor';
import { AuditEngine } from './services/AuditEngine';
import { generateSampleData } from './utils/sampleDataGenerator';
import { Play, Sparkles, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('ingestion');

  const [inputFile, setInputFile] = useState<File | null>(null);
  const [teamFile, setTeamFile] = useState<File | null>(null);

  const [inputInfo, setInputInfo] = useState<{
    totalRows: number;
    detectedHeaders: string[];
    missingRequired: string[];
  } | null>(null);

  const [teamInfo, setTeamInfo] = useState<{
    totalRows: number;
    detectedHeaders: string[];
    missingRequired: string[];
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const [result, setResult] = useState<AuditEngineResult | null>(null);
  const [isUnmatchedModalOpen, setIsUnmatchedModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Inspect input file headers
  const handleSelectInputFile = async (file: File) => {
    setInputFile(file);
    setResult(null);
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', sheetRows: 5 });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

      if (json.length > 0) {
        const headers = json[0].map((h) => String(h || '').trim());
        const deleteIndexes = new Set([5, 6, 7]);
        const postCutHeaders = headers.filter((_, idx) => !deleteIndexes.has(idx));

        const missing: string[] = [];
        if (findColumn(postCutHeaders, ['Business Partner', 'BusinessPartner']) === -1) {
          missing.push('Business Partner');
        }
        if (findColumn(postCutHeaders, ['Linked Names', 'LinkedNames']) === -1) {
          missing.push('Linked Names');
        }
        if (findColumn(postCutHeaders, ['Changed By', 'ChangedBy']) === -1) {
          missing.push('Changed By');
        }
        if (findColumn(postCutHeaders, ['Changed On', 'ChangedOn']) === -1) {
          missing.push('Changed On');
        }
        if (
          findColumn(postCutHeaders, [
            'Country/Region Key',
            'Country / Region Key',
            'Country Region Key',
            'Country/Region',
            'Country',
          ]) === -1
        ) {
          missing.push('Country/Region Key');
        }

        setInputInfo({
          totalRows: 0,
          detectedHeaders: headers,
          missingRequired: missing,
        });
      }
    } catch {
      // Ignore inspection error
    }
  };

  // Inspect team file headers
  const handleSelectTeamFile = async (file: File) => {
    setTeamFile(file);
    setResult(null);
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', sheetRows: 5 });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

      if (json.length > 0) {
        const headers = json[0].map((h) => String(h || '').trim());
        const missing: string[] = [];
        if (
          findColumn(headers, [
            'EMP ID',
            'EMPID',
            'Employee ID',
            'EmployeeID',
          ]) === -1
        ) {
          missing.push('EMP ID');
        }
        if (
          findColumn(headers, [
            'Name',
            'Employee Name',
            'EmployeeName',
          ]) === -1
        ) {
          missing.push('Name');
        }

        setTeamInfo({
          totalRows: 0,
          detectedHeaders: headers,
          missingRequired: missing,
        });
      }
    } catch {
      // Ignore inspection error
    }
  };

  // Load sample test data
  const handleLoadSampleData = async () => {
    const { mainReportFile, teamDetailsFile } = generateSampleData();
    await handleSelectInputFile(mainReportFile);
    await handleSelectTeamFile(teamDetailsFile);
    setStatusMessage({
      text: 'Sample SAP BP Report and Team Roster loaded. Ready to run audit execution.',
      type: 'info',
    });
  };

  const handleReset = () => {
    setInputFile(null);
    setTeamFile(null);
    setInputInfo(null);
    setTeamInfo(null);
    setResult(null);
    setStatusMessage(null);
    setProgressPercent(0);
    setProgressMessage('');
    setActiveTab('ingestion');
  };

  // Run audit processing using modular AuditEngine
  const handleProcess = async () => {
    if (!inputFile) {
      setStatusMessage({
        text: 'Please select the Main Input Report file first.',
        type: 'error',
      });
      return;
    }
    if (!teamFile) {
      setStatusMessage({
        text: 'Please select the Team Details file first.',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setProgressPercent(5);
    setProgressMessage('Initializing audit engine...');
    setStatusMessage(null);

    try {
      const engine = new AuditEngine();
      const processedResult = await engine.execute(
        inputFile,
        teamFile,
        (_step, percent, msg) => {
          setProgressPercent(percent);
          setProgressMessage(msg);
        }
      );

      setResult(processedResult);
      setStatusMessage({
        text: `Audit successfully processed in ${processedResult.summary.totalDurationMs} ms! Verified ${processedResult.summary.finalRows.toLocaleString()} rows.`,
        type: 'success',
      });
      // Transition to workbench for immediate inspection
      setActiveTab('workbench');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        text: `Execution Error: ${errMsg}`,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        onLoadSampleData={handleLoadSampleData}
        onReset={handleReset}
        hasFiles={Boolean(inputFile || teamFile || result)}
        onOpenHelp={() => setIsRulesModalOpen(true)}
      />

      {/* Stage / Tab Stepper Navigation */}
      <StageNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        result={result}
        hasInputFiles={Boolean(inputFile && teamFile)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {/* TAB 1: DATA INGESTION */}
        {activeTab === 'ingestion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <UploadCard
                stepNumber={1}
                title="1. Main Input Report"
                subtitle="SAP Business Partner change export file (.xlsx, .xls, .csv)"
                acceptFormats=".xlsx,.xls,.csv"
                file={inputFile}
                onFileSelect={handleSelectInputFile}
                onClearFile={() => {
                  setInputFile(null);
                  setInputInfo(null);
                  setResult(null);
                }}
                requiredColumnsHint={[
                  'Business Partner',
                  'Linked Names',
                  'Changed By',
                  'Changed On',
                  'Country/Region Key',
                ]}
                detectedColumnsInfo={inputInfo}
              />

              <UploadCard
                stepNumber={2}
                title="2. Team Details Roster"
                subtitle="Employee roster containing EMP ID and Name"
                acceptFormats=".xlsx,.xls,.csv"
                file={teamFile}
                onFileSelect={handleSelectTeamFile}
                onClearFile={() => {
                  setTeamFile(null);
                  setTeamInfo(null);
                  setResult(null);
                }}
                requiredColumnsHint={['EMP ID', 'Name']}
                detectedColumnsInfo={teamInfo}
              />
            </div>

            {/* Execution Control Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Audit Execution Control
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Executes deterministic column trimming, deduplication, country priority ordering, and team enrichment
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!inputFile && !teamFile && (
                    <button
                      type="button"
                      onClick={handleLoadSampleData}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Preload Test Scenario</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={!inputFile || !teamFile || isProcessing}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg bg-slate-950 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white shadow-sm transition-all cursor-pointer min-w-36 active:scale-95"
                  >
                    {isProcessing ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{isProcessing ? 'Executing...' : 'Run Audit Pipeline'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span className="font-medium text-slate-700">{progressMessage}</span>
                    <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {statusMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : statusMessage.type === 'error'
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-sky-50 border-sky-300 text-sky-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {statusMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-semibold leading-relaxed">
                      {statusMessage.text}
                    </span>
                  </div>

                  {result && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('workbench')}
                      className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
                    >
                      <span>Open Cleaned Grid</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick KPI Overview if result exists */}
            {result && (
              <div className="space-y-4">
                <SummaryMetrics
                  summary={result.summary}
                  onViewUnmatched={() => setActiveTab('discrepancies')}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PIPELINE ARCHITECTURE & RULES */}
        {activeTab === 'rules' && (
          <PipelineRulesView
            stageResults={result?.stageResults}
            onTriggerRun={handleProcess}
            canRun={Boolean(inputFile && teamFile && !isProcessing)}
          />
        )}

        {/* TAB 3: CLEANED WORKBENCH */}
        {activeTab === 'workbench' && result && (
          <div className="space-y-6">
            <SummaryMetrics
              summary={result.summary}
              onViewUnmatched={() => setActiveTab('discrepancies')}
            />

            <DataPreviewTable
              headers={result.headers}
              dataRows={result.dataRows}
              workbook={result.workbook}
              onViewUnmatched={() => setActiveTab('discrepancies')}
            />
          </div>
        )}

        {/* TAB 4: PURGED & DISCREPANCIES */}
        {activeTab === 'discrepancies' && result && (
          <DiscrepanciesView
            droppedRecords={result.droppedRecords}
            unmatchedList={result.summary.unmatchedIdsList}
            totalUnmatchedRows={result.summary.unmatchedRows}
          />
        )}

        {/* TAB 5: AUDIT TRAIL & PROVENANCE */}
        {activeTab === 'audit_trail' && result && (
          <AuditTrailView result={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Audit Tool - BP</span>
            <span>·</span>
            <span>Modular 5-Stage Audit Architecture</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Client-Side Confidential Processing · Zero External Telemetry
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {result && (
        <UnmatchedModal
          isOpen={isUnmatchedModalOpen}
          onClose={() => setIsUnmatchedModalOpen(false)}
          unmatchedList={result.summary.unmatchedIdsList.map((u) => ({
            empId: u.empId,
            count: u.occurrences,
          }))}
          totalUnmatchedRows={result.summary.unmatchedRows}
        />
      )}

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
}
