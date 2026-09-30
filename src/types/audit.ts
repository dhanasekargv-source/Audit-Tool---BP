export type AuditStageId =
  | 'prune_fgh'
  | 'numeric_m'
  | 'purge_blanks'
  | 'deduplicate'
  | 'country_sort'
  | 'team_lookup'
  | 'inject_col_o';

export interface StageDefinition {
  id: AuditStageId;
  stepNumber: number;
  name: string;
  shortDesc: string;
  detailedDesc: string;
  category: 'cleaning' | 'transformation' | 'enrichment' | 'sorting';
  enabled: boolean;
}

export interface DroppedRecord {
  originalIndex: number;
  businessPartner: string;
  linkedName: string;
  changedBy: string;
  changedOn: string;
  reason: 'blank_linked_name' | 'duplicate_composite_key';
  rawRow: (string | number | boolean | null | undefined)[];
}

export interface StageExecutionResult {
  stageId: AuditStageId;
  stepNumber: number;
  name: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  rowsBefore: number;
  rowsAfter: number;
  rowsAffected: number;
  executionTimeMs: number;
  notes: string;
}

export interface UnmatchedEmployeeRecord {
  empId: string;
  occurrences: number;
  affectedBpList: string[];
}

export interface AuditSummary {
  originalRows: number;
  blankRowsRemoved: number;
  duplicateRowsRemoved: number;
  finalRows: number;
  matchedRows: number;
  unmatchedRows: number;
  unmatchedIdsList: UnmatchedEmployeeRecord[];
  priorityCountryCount: number;
  processedAt: Date;
  totalDurationMs: number;
}

export interface AuditEngineResult {
  headers: string[];
  dataRows: (string | number | boolean | null | undefined)[][];
  summary: AuditSummary;
  stageResults: StageExecutionResult[];
  droppedRecords: DroppedRecord[];
  workbook: unknown; // XLSX.WorkBook
  auditTrailId: string;
}

export interface ProcessingStepLog {
  step: number;
  title: string;
  description: string;
  countRemovedOrAffected?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp?: string;
}

export type ActiveWorkspaceTab =
  | 'ingestion'
  | 'rules'
  | 'workbench'
  | 'discrepancies'
  | 'audit_trail';
