import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileSpreadsheet,
  X,
  FileText,
} from 'lucide-react';
import { COUNTRY_PRIORITY, downloadWorkbook, downloadCSV } from '../utils/excelProcessor';

interface DataPreviewTableProps {
  headers: string[];
  dataRows: (string | number | boolean | null | undefined)[][];
  workbook: unknown;
  onViewUnmatched: () => void;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  headers,
  dataRows,
  workbook,
  onViewUnmatched,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'priority' | 'matched' | 'unmatched'>('all');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Column O is index 14
  const columnOIndex = 14;

  // Find country index
  const countryIndex = useMemo(() => {
    return headers.findIndex((h) => {
      const norm = String(h).toUpperCase().trim();
      return (
        norm.includes('COUNTRY') ||
        norm.includes('REGION')
      );
    });
  }, [headers]);

  // Filter rows
  const filteredRows = useMemo(() => {
    let result = dataRows;

    if (activeFilter === 'priority' && countryIndex !== -1) {
      result = result.filter((row) => {
        const c = String(row[countryIndex] ?? '').trim().toUpperCase();
        return Boolean(COUNTRY_PRIORITY[c]);
      });
    } else if (activeFilter === 'matched') {
      result = result.filter((row) => {
        const member = String(row[columnOIndex] ?? '').trim();
        return member !== '';
      });
    } else if (activeFilter === 'unmatched') {
      result = result.filter((row) => {
        const member = String(row[columnOIndex] ?? '').trim();
        return member === '';
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && String(cell).toLowerCase().includes(q))
      );
    }

    return result;
  }, [dataRows, activeFilter, searchQuery, countryIndex, columnOIndex]);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Header and Download Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cleaned Report Data Grid
            </h3>
            <span className="text-xs font-mono text-slate-500">
              ({filteredRows.length.toLocaleString()} of {dataRows.length.toLocaleString()} rows)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AutoFilter enabled · Column O (Team Member Name) enriched · Column M formatted as number
          </p>
        </div>

        {/* Primary Download Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => downloadWorkbook(workbook)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Cleaned Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCSV(headers, dataRows)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:px-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Rows ({dataRows.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('priority')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeFilter === 'priority'
                ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>Priority Sanctions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('matched')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeFilter === 'matched'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matched Members
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unmatched')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeFilter === 'unmatched'
                ? 'bg-white text-rose-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unmatched
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200 select-none shadow-2xs">
            <tr>
              <th className="py-2.5 px-3 font-mono text-[11px] text-slate-400 w-12 text-center border-b border-slate-200">
                #
              </th>
              {headers.map((h, idx) => {
                const isColumnO = idx === columnOIndex;
                const isColumnM = idx === 12;

                return (
                  <th
                    key={idx}
                    className={`py-2.5 px-3 border-b border-slate-200 font-semibold tracking-wide whitespace-nowrap ${
                      isColumnO
                        ? 'bg-emerald-100/80 text-emerald-950 font-bold border-l border-r border-emerald-300'
                        : isColumnM
                        ? 'bg-sky-50 text-sky-950 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{h}</span>
                      {isColumnO && (
                        <span className="text-[10px] bg-emerald-800 text-white font-mono px-1 rounded font-normal">
                          Col O
                        </span>
                      )}
                      {isColumnM && (
                        <span className="text-[10px] bg-sky-700 text-white font-mono px-1 rounded font-normal">
                          Col M
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="py-12 text-center text-slate-500 text-xs"
                >
                  No records matching the filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, rowIdx) => {
                const globalRowNumber =
                  (currentPage - 1) * pageSize + rowIdx + 1;
                const countryCode =
                  countryIndex !== -1
                    ? String(row[countryIndex] ?? '').trim().toUpperCase()
                    : '';
                const isPriorityCountry = Boolean(
                  COUNTRY_PRIORITY[countryCode]
                );
                const employeeName = String(row[columnOIndex] ?? '').trim();
                const isMatched = employeeName !== '';

                return (
                  <tr
                    key={rowIdx}
                    className={`hover:bg-slate-50 transition-colors ${
                      isPriorityCountry ? 'bg-amber-50/25' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center text-[11px] font-mono text-slate-400">
                      {globalRowNumber}
                    </td>
                    {row.map((cell, cellIdx) => {
                      const isColumnO = cellIdx === columnOIndex;
                      const isCountry = cellIdx === countryIndex;
                      const isColumnM = cellIdx === 12;

                      const formattedCell =
                        cell === null || cell === undefined ? '' : String(cell);

                      return (
                        <td
                          key={cellIdx}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isColumnO
                              ? 'bg-emerald-50/30 border-l border-r border-emerald-200'
                              : ''
                          }`}
                        >
                          {isColumnO ? (
                            isMatched ? (
                              <span className="font-semibold text-emerald-900">
                                {formattedCell}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">
                                — (Unmatched)
                              </span>
                            )
                          ) : isCountry && isPriorityCountry ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-900">
                              <span>{formattedCell}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-normal">
                                #{COUNTRY_PRIORITY[countryCode]}
                              </span>
                            </span>
                          ) : isColumnM && typeof cell === 'number' ? (
                            <span className="font-mono text-slate-900 font-medium">
                              {cell.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-800">
                              {formattedCell}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-800 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400">·</span>
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredRows.length)} of{' '}
            {filteredRows.length.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
