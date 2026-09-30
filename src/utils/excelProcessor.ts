import * as XLSX from 'xlsx';
import { AuditEngine, DEFAULT_COUNTRY_PRIORITY, COUNTRY_LABELS } from '../services/AuditEngine';
import { AuditEngineResult } from '../types/audit';

export { DEFAULT_COUNTRY_PRIORITY as COUNTRY_PRIORITY, COUNTRY_LABELS as COUNTRY_NAMES };
export { normalize, normalizeEmployeeId, findColumn } from '../services/AuditEngine';

export async function processAuditReport(
  inputFile: File | ArrayBuffer,
  teamFile: File | ArrayBuffer,
  onProgress?: (step: number, percent: number, msg: string) => void
): Promise<AuditEngineResult> {
  const engine = new AuditEngine();
  return engine.execute(inputFile, teamFile, onProgress);
}

export function downloadWorkbook(
  workbook: unknown,
  fileNamePrefix: string = 'Cleaned_Team_Lookup_Report'
): void {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook as XLSX.WorkBook, fileName);
}

export function downloadCSV(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  fileNamePrefix: string = 'Cleaned_Team_Lookup_Report'
): void {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const fileName = `${fileNamePrefix}_${dateStr}.csv`;

  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
