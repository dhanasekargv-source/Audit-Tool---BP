import * as XLSX from 'xlsx';
import {
  AuditEngineResult,
  AuditStageId,
  AuditSummary,
  DroppedRecord,
  StageDefinition,
  StageExecutionResult,
  UnmatchedEmployeeRecord,
} from '../types/audit';

export const DEFAULT_COUNTRY_PRIORITY: Record<string, number> = {
  CU: 1, // Cuba
  IR: 2, // Iran
  KP: 3, // North Korea
  RU: 4, // Russia
  BY: 5, // Belarus
  VE: 6, // Venezuela
  NI: 7, // Nicaragua
  UA: 8, // Ukraine
};

export const COUNTRY_LABELS: Record<string, string> = {
  CU: 'Cuba',
  IR: 'Iran',
  KP: 'North Korea',
  RU: 'Russia',
  BY: 'Belarus',
  VE: 'Venezuela',
  NI: 'Nicaragua',
  UA: 'Ukraine',
};

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    id: 'prune_fgh',
    stepNumber: 1,
    name: 'Delete Columns F, G & H',
    shortDesc: 'Purge legacy extraction artifacts at 0-indexes 5, 6, 7',
    detailedDesc: 'Deletes original columns F, G, and H from headers and data rows prior to downstream validation.',
    category: 'cleaning',
    enabled: true,
  },
  {
    id: 'numeric_m',
    stepNumber: 2,
    name: 'Convert Column M to Number',
    shortDesc: 'Format Column M (index 12 post-cut) as numeric float',
    detailedDesc: 'Strips commas and parses values in Column M into clean JavaScript floating-point numbers.',
    category: 'transformation',
    enabled: true,
  },
  {
    id: 'purge_blanks',
    stepNumber: 3,
    name: 'Purge Blank Linked Names',
    shortDesc: 'Filter out records where Linked Names is empty or spaces',
    detailedDesc: 'Removes rows that have no associated Linked Name for compliance linkage integrity.',
    category: 'cleaning',
    enabled: true,
  },
  {
    id: 'deduplicate',
    stepNumber: 4,
    name: 'Composite Deduplication',
    shortDesc: 'Deduplicate on [BP + Linked + Changed By + Changed On]',
    detailedDesc: 'Eliminates duplicate log entries based on composite business partner change fingerprint.',
    category: 'cleaning',
    enabled: true,
  },
  {
    id: 'country_sort',
    stepNumber: 5,
    name: 'Sanctions & Country Sort',
    shortDesc: 'Priority sort CU → IR → KP → RU → BY → VE → NI → UA',
    detailedDesc: 'Orders records placing high-risk compliance jurisdictions first, followed by alphabetical order.',
    category: 'sorting',
    enabled: true,
  },
  {
    id: 'team_lookup',
    stepNumber: 6,
    name: 'Employee Roster Cross-Reference',
    shortDesc: 'Match Changed By against Team Details (EMP ID → Name)',
    detailedDesc: 'Normalizes employee ID numbers and looks up member names from internal roster.',
    category: 'enrichment',
    enabled: true,
  },
  {
    id: 'inject_col_o',
    stepNumber: 7,
    name: 'Inject Column O (Team Member Name)',
    shortDesc: 'Insert enriched column at index 14 without overwriting',
    detailedDesc: 'Slices Team Member Name into Column O (index 14) and preserves subsequent original columns.',
    category: 'enrichment',
    enabled: true,
  },
];

export function normalize(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, ' ').toUpperCase();
}

export function normalizeEmployeeId(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\.0+$/, '');
}

export function findColumn(headers: unknown[], possibleNames: string[]): number {
  const normalizedNames = possibleNames.map(normalize);
  for (let i = 0; i < headers.length; i++) {
    const current = normalize(headers[i]);
    if (normalizedNames.includes(current)) {
      return i;
    }
  }
  return -1;
}

export interface ProgressCallback {
  (step: number, percent: number, stageName: string): void;
}

export class AuditEngine {
  private customCountryPriority: Record<string, number>;

  constructor(customCountryPriority?: Record<string, number>) {
    this.customCountryPriority = customCountryPriority || DEFAULT_COUNTRY_PRIORITY;
  }

  public async execute(
    inputFile: File | ArrayBuffer,
    teamFile: File | ArrayBuffer,
    onProgress?: ProgressCallback
  ): Promise<AuditEngineResult> {
    const startTime = performance.now();
    const stageResults: StageExecutionResult[] = [];
    const droppedRecords: DroppedRecord[] = [];
    const auditTrailId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Read Input File
    onProgress?.(0, 10, 'Ingesting Main Input Report...');
    const inputBuffer =
      inputFile instanceof File ? await inputFile.arrayBuffer() : inputFile;
    const inputWorkbook = XLSX.read(inputBuffer, { type: 'array', cellDates: true });
    const inputSheet = inputWorkbook.Sheets[inputWorkbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | null | undefined)[]>(
      inputSheet,
      { header: 1, defval: '' }
    );

    if (!rawRows || rawRows.length === 0) {
      throw new Error('The Main Input Report has no data or is empty.');
    }

    // Read Team Details File
    onProgress?.(0, 20, 'Ingesting Team Roster...');
    const teamBuffer =
      teamFile instanceof File ? await teamFile.arrayBuffer() : teamFile;
    const teamWorkbook = XLSX.read(teamBuffer, { type: 'array', cellDates: true });
    const teamSheet = teamWorkbook.Sheets[teamWorkbook.SheetNames[0]];
    const rawTeamRows = XLSX.utils.sheet_to_json<(string | number | boolean | null | undefined)[]>(
      teamSheet,
      { header: 1, defval: '' }
    );

    if (!rawTeamRows || rawTeamRows.length === 0) {
      throw new Error('The Team Details file has no data or is empty.');
    }

    let headers = rawRows[0].map((v) => String(v ?? '').trim());
    let dataRows = rawRows.slice(1).map((r) => [...r]);
    const originalRowsCount = dataRows.length;

    // STAGE 1: Delete original columns F, G, H (indices 5, 6, 7)
    const s1Start = performance.now();
    onProgress?.(1, 30, 'Step 1: Removing columns F, G, and H...');
    const deleteIndexes = new Set([5, 6, 7]);
    const beforeCols = headers.length;
    headers = headers.filter((_, idx) => !deleteIndexes.has(idx));
    dataRows = dataRows.map((r) => r.filter((_, idx) => !deleteIndexes.has(idx)));
    stageResults.push({
      stageId: 'prune_fgh',
      stepNumber: 1,
      name: 'Delete Columns F, G & H',
      status: 'success',
      rowsBefore: originalRowsCount,
      rowsAfter: dataRows.length,
      rowsAffected: beforeCols - headers.length,
      executionTimeMs: Math.round(performance.now() - s1Start),
      notes: `Removed column indexes 5, 6, and 7. Total column count reduced from ${beforeCols} to ${headers.length}.`,
    });

    // Detect column indexes post-cut
    const businessPartnerIndex = findColumn(headers, ['Business Partner', 'BusinessPartner']);
    const linkedNamesIndex = findColumn(headers, ['Linked Names', 'LinkedNames']);
    const changedByIndex = findColumn(headers, ['Changed By', 'ChangedBy']);
    const changedOnIndex = findColumn(headers, ['Changed On', 'ChangedOn']);
    const countryIndex = findColumn(headers, [
      'Country/Region Key',
      'Country / Region Key',
      'Country Region Key',
      'Country/Region',
      'Country',
    ]);

    if (businessPartnerIndex === -1) throw new Error('Missing required column: "Business Partner"');
    if (linkedNamesIndex === -1) throw new Error('Missing required column: "Linked Names"');
    if (changedByIndex === -1) throw new Error('Missing required column: "Changed By"');
    if (changedOnIndex === -1) throw new Error('Missing required column: "Changed On"');
    if (countryIndex === -1) throw new Error('Missing required column: "Country/Region Key"');

    // STAGE 2: Convert Column M to number (index 12 post-cut)
    const s2Start = performance.now();
    onProgress?.(2, 45, 'Step 2: Formatting Column M numeric...');
    const columnMIndex = 12;
    let numericConverted = 0;
    dataRows.forEach((row) => {
      if (columnMIndex < row.length) {
        const val = row[columnMIndex];
        if (val !== '' && val !== null && val !== undefined) {
          const cleaned = String(val).replace(/,/g, '').trim();
          const num = Number(cleaned);
          if (cleaned !== '' && !isNaN(num)) {
            row[columnMIndex] = num;
            numericConverted++;
          }
        }
      }
    });
    stageResults.push({
      stageId: 'numeric_m',
      stepNumber: 2,
      name: 'Convert Column M to Number',
      status: 'success',
      rowsBefore: dataRows.length,
      rowsAfter: dataRows.length,
      rowsAffected: numericConverted,
      executionTimeMs: Math.round(performance.now() - s2Start),
      notes: `Parsed ${numericConverted} comma-delimited currency/numeric values in Column M (index 12).`,
    });

    // STAGE 3: Remove blank Linked Names
    const s3Start = performance.now();
    onProgress?.(3, 58, 'Step 3: Purging blank Linked Names...');
    const beforeS3 = dataRows.length;
    const keptS3: (string | number | boolean | null | undefined)[][] = [];

    dataRows.forEach((row, i) => {
      const linkedName = normalize(row[linkedNamesIndex]);
      if (linkedName === '') {
        droppedRecords.push({
          originalIndex: i + 1,
          businessPartner: String(row[businessPartnerIndex] ?? ''),
          linkedName: '(Blank)',
          changedBy: String(row[changedByIndex] ?? ''),
          changedOn: String(row[changedOnIndex] ?? ''),
          reason: 'blank_linked_name',
          rawRow: [...row],
        });
      } else {
        keptS3.push(row);
      }
    });

    dataRows = keptS3;
    const blankRowsRemoved = beforeS3 - dataRows.length;
    stageResults.push({
      stageId: 'purge_blanks',
      stepNumber: 3,
      name: 'Purge Blank Linked Names',
      status: 'success',
      rowsBefore: beforeS3,
      rowsAfter: dataRows.length,
      rowsAffected: blankRowsRemoved,
      executionTimeMs: Math.round(performance.now() - s3Start),
      notes: `Filtered out ${blankRowsRemoved} rows with missing or whitespace-only Linked Names.`,
    });

    // STAGE 4: Remove duplicates (BP + Linked Names + Changed By + Changed On)
    const s4Start = performance.now();
    onProgress?.(4, 70, 'Step 4: Composite deduplication...');
    const duplicateSet = new Set<string>();
    const beforeS4 = dataRows.length;
    const keptS4: (string | number | boolean | null | undefined)[][] = [];

    dataRows.forEach((row, i) => {
      const key = [
        normalize(row[businessPartnerIndex]),
        normalize(row[linkedNamesIndex]),
        normalize(row[changedByIndex]),
        normalize(row[changedOnIndex]),
      ].join('|||');

      if (duplicateSet.has(key)) {
        droppedRecords.push({
          originalIndex: i + 1,
          businessPartner: String(row[businessPartnerIndex] ?? ''),
          linkedName: String(row[linkedNamesIndex] ?? ''),
          changedBy: String(row[changedByIndex] ?? ''),
          changedOn: String(row[changedOnIndex] ?? ''),
          reason: 'duplicate_composite_key',
          rawRow: [...row],
        });
      } else {
        duplicateSet.add(key);
        keptS4.push(row);
      }
    });

    dataRows = keptS4;
    const duplicateRowsRemoved = beforeS4 - dataRows.length;
    stageResults.push({
      stageId: 'deduplicate',
      stepNumber: 4,
      name: 'Composite Deduplication',
      status: 'success',
      rowsBefore: beforeS4,
      rowsAfter: dataRows.length,
      rowsAffected: duplicateRowsRemoved,
      executionTimeMs: Math.round(performance.now() - s4Start),
      notes: `Purged ${duplicateRowsRemoved} duplicate occurrences on [BP + Linked + ChangedBy + ChangedOn].`,
    });

    // STAGE 5: Country Priority Sort
    const s5Start = performance.now();
    onProgress?.(5, 80, 'Step 5: Applying Country Priority sort...');
    let priorityCountryCount = 0;
    dataRows.sort((a, b) => {
      const countryA = normalize(a[countryIndex]);
      const countryB = normalize(b[countryIndex]);
      const rankA = this.customCountryPriority[countryA] || 9999;
      const rankB = this.customCountryPriority[countryB] || 9999;

      if (rankA !== rankB) return rankA - rankB;
      return countryA.localeCompare(countryB);
    });

    dataRows.forEach((r) => {
      const c = normalize(r[countryIndex]);
      if (this.customCountryPriority[c]) priorityCountryCount++;
    });

    stageResults.push({
      stageId: 'country_sort',
      stepNumber: 5,
      name: 'Sanctions & Country Sort',
      status: 'success',
      rowsBefore: dataRows.length,
      rowsAfter: dataRows.length,
      rowsAffected: priorityCountryCount,
      executionTimeMs: Math.round(performance.now() - s5Start),
      notes: `Ranked ${priorityCountryCount} priority jurisdiction rows (CU → UA) at top of dataset.`,
    });

    // STAGE 6: Team Lookup (EMP ID -> Name)
    const s6Start = performance.now();
    onProgress?.(6, 88, 'Step 6: Building Team Details roster...');
    const teamHeaders = rawTeamRows[0].map((v) => String(v ?? '').trim());
    const empIdIndex = findColumn(teamHeaders, ['EMP ID', 'EMPID', 'Employee ID', 'EmployeeID']);
    const teamNameIndex = findColumn(teamHeaders, ['Name', 'Employee Name', 'EmployeeName']);

    if (empIdIndex === -1) throw new Error('Missing "EMP ID" column in Team Details');
    if (teamNameIndex === -1) throw new Error('Missing "Name" column in Team Details');

    const employeeMap = new Map<string, string>();
    for (let i = 1; i < rawTeamRows.length; i++) {
      const r = rawTeamRows[i];
      const id = normalizeEmployeeId(r[empIdIndex]);
      const name = String(r[teamNameIndex] ?? '').trim();
      if (id !== '') employeeMap.set(id, name);
    }

    stageResults.push({
      stageId: 'team_lookup',
      stepNumber: 6,
      name: 'Employee Roster Cross-Reference',
      status: 'success',
      rowsBefore: dataRows.length,
      rowsAfter: dataRows.length,
      rowsAffected: employeeMap.size,
      executionTimeMs: Math.round(performance.now() - s6Start),
      notes: `Indexed ${employeeMap.size} employee IDs for cross-reference.`,
    });

    // STAGE 7: Inject Column O (Team Member Name at index 14)
    const s7Start = performance.now();
    onProgress?.(7, 94, 'Step 7: Splicing Column O (Team Member Name)...');
    headers.splice(14, 0, 'Team Member Name');

    let matchedRows = 0;
    let unmatchedRows = 0;
    const unmatchedMap = new Map<string, { count: number; bps: string[] }>();

    dataRows = dataRows.map((row) => {
      const changedBy = normalizeEmployeeId(row[changedByIndex]);
      let memberName = '';

      if (changedBy !== '') {
        if (employeeMap.has(changedBy)) {
          memberName = employeeMap.get(changedBy) || '';
          matchedRows++;
        } else {
          unmatchedRows++;
          const bp = String(row[businessPartnerIndex] ?? '');
          const existing = unmatchedMap.get(changedBy) || { count: 0, bps: [] };
          existing.count++;
          if (existing.bps.length < 5) existing.bps.push(bp);
          unmatchedMap.set(changedBy, existing);
        }
      } else {
        unmatchedRows++;
      }

      row.splice(14, 0, memberName);
      return row;
    });

    const unmatchedIdsList: UnmatchedEmployeeRecord[] = Array.from(unmatchedMap.entries())
      .map(([empId, data]) => ({
        empId,
        occurrences: data.count,
        affectedBpList: data.bps,
      }))
      .sort((a, b) => b.occurrences - a.occurrences);

    stageResults.push({
      stageId: 'inject_col_o',
      stepNumber: 7,
      name: 'Inject Column O (Team Member Name)',
      status: 'success',
      rowsBefore: dataRows.length,
      rowsAfter: dataRows.length,
      rowsAffected: matchedRows,
      executionTimeMs: Math.round(performance.now() - s7Start),
      notes: `Enriched Column O (index 14). ${matchedRows} matched (${((matchedRows / dataRows.length) * 100).toFixed(1)}%), ${unmatchedRows} unmatched.`,
    });

    // Build Master Multi-Sheet Workbook
    onProgress?.(8, 98, 'Packaging multi-sheet audit package...');
    const outputRows = [headers, ...dataRows];
    const cleanedSheet = XLSX.utils.aoa_to_sheet(outputRows);
    cleanedSheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: outputRows.length - 1, c: headers.length - 1 },
      }),
    };

    // Build Discrepancy Log Sheet
    const discHeaders = ['Record Index', 'Business Partner', 'Linked Name', 'Changed By', 'Changed On', 'Purge Reason'];
    const discRows = droppedRecords.map((d) => [
      d.originalIndex,
      d.businessPartner,
      d.linkedName,
      d.changedBy,
      d.changedOn,
      d.reason === 'blank_linked_name' ? 'Blank Linked Name' : 'Duplicate Composite Key',
    ]);
    const discSheet = XLSX.utils.aoa_to_sheet([discHeaders, ...discRows]);

    // Build Audit Provenance Sheet
    const provHeaders = ['Audit Reference', 'Stage #', 'Stage Name', 'Rows Before', 'Rows After', 'Affected Items', 'Execution Time (ms)', 'Notes'];
    const provRows = stageResults.map((s) => [
      auditTrailId,
      s.stepNumber,
      s.name,
      s.rowsBefore,
      s.rowsAfter,
      s.rowsAffected,
      s.executionTimeMs,
      s.notes,
    ]);
    const provSheet = XLSX.utils.aoa_to_sheet([provHeaders, ...provRows]);

    const outputWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outputWorkbook, cleanedSheet, 'Cleaned Report');
    XLSX.utils.book_append_sheet(outputWorkbook, discSheet, 'Purged Discrepancies');
    XLSX.utils.book_append_sheet(outputWorkbook, provSheet, 'Audit Trail Log');

    const totalDurationMs = Math.round(performance.now() - startTime);

    const summary: AuditSummary = {
      originalRows: originalRowsCount,
      blankRowsRemoved,
      duplicateRowsRemoved,
      finalRows: dataRows.length,
      matchedRows,
      unmatchedRows,
      unmatchedIdsList,
      priorityCountryCount,
      processedAt: new Date(),
      totalDurationMs,
    };

    onProgress?.(9, 100, 'Audit reconciliation complete!');

    return {
      headers,
      dataRows,
      summary,
      stageResults,
      droppedRecords,
      workbook: outputWorkbook,
      auditTrailId,
    };
  }
}
