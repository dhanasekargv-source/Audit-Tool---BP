import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Download,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { jaroWinkler, tokenSortRatio } from '../utils/fuzzyMatching';

interface MatchItem {
  id: string;
  entityName: string;
  rplName: string;
  tokenSortScore: number;
  jaroWinklerScore: number;
  compositeScore: number;
  matchGrade: 'High' | 'Medium' | 'Low';
  sanctionRisk: 'CRITICAL' | 'MEDIUM' | 'CLEAR';
}

export const RplNameMatchingView: React.FC = () => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const loadSampleRplData = () => {
    const samplePairs = [
      { id: 'REC-01', entity: 'HABANA LOGISTICS SA', rpl: 'HABANA LOGISTICS S.A.', risk: 'CRITICAL' as const },
      { id: 'REC-02', entity: 'PARS PETROLEUM TRADING LTD', rpl: 'PARS PETROLEUM SUBSIDIARY CO', risk: 'CRITICAL' as const },
      { id: 'REC-03', entity: 'DPRK MINING EXPORT GROUP', rpl: 'DPRK MINERALS TRADING', risk: 'CRITICAL' as const },
      { id: 'REC-04', entity: 'NORDIC STEEL TRANS CORP', rpl: 'NORDIC STEEL TRANS LLC', risk: 'CRITICAL' as const },
      { id: 'REC-05', entity: 'ORINOCO PETRO DISTRIBUTORS', rpl: 'ORINOCO PETRO SUPPLIES CORP', risk: 'MEDIUM' as const },
      { id: 'REC-06', entity: 'SIEMENS WERKZEUGBAU GMBH', rpl: 'SIEMENS MACHINERY AG', risk: 'CLEAR' as const },
      { id: 'REC-07', entity: 'THAMES SHIPPING PLC', rpl: 'THAMES MARITIME LOGISTICS LTD', risk: 'CLEAR' as const },
      { id: 'REC-08', entity: 'PACIFIC BANANA HOLDINGS', rpl: 'PACIFIC RIM FRESH FRUIT INC', risk: 'CLEAR' as const },
      { id: 'REC-09', entity: 'BELARUSKALI FERTILIZERS', rpl: 'BELARUSKALI POTASH ASSOC', risk: 'CRITICAL' as const },
      { id: 'REC-10', entity: 'MANAGUA AGRO EXPORTS', rpl: 'MANAGUA AGRO EXPORT SA', risk: 'MEDIUM' as const },
    ];

    const computed: MatchItem[] = samplePairs.map((p) => {
      const tsScore = tokenSortRatio(p.entity, p.rpl);
      const jwScore = Math.round(jaroWinkler(p.entity, p.rpl) * 100);
      const composite = Math.round((tsScore * 0.6) + (jwScore * 0.4));
      const grade = composite >= 85 ? 'High' : composite >= 65 ? 'Medium' : 'Low';

      return {
        id: p.id,
        entityName: p.entity,
        rplName: p.rpl,
        tokenSortScore: tsScore,
        jaroWinklerScore: jwScore,
        compositeScore: composite,
        matchGrade: grade,
        sanctionRisk: p.risk,
      };
    });

    computed.sort((a, b) => b.compositeScore - a.compositeScore);
    setMatches(computed);
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

    if (rows.length < 2) return;
    const headerRow = rows[0].map((h) => String(h || '').trim().toLowerCase());
    const entityIdx = headerRow.findIndex((h) => h.includes('entity') || h.includes('name'));
    const rplIdx = headerRow.findIndex((h) => h.includes('rpl') || h.includes('target') || h.includes('linked'));

    const eIdx = entityIdx !== -1 ? entityIdx : 0;
    const rIdx = rplIdx !== -1 ? rplIdx : (rows[0].length > 1 ? 1 : 0);

    const computed: MatchItem[] = [];
    for (let i = 1; i < rows.length; i++) {
      const entity = String(rows[i][eIdx] || '').trim();
      const rpl = String(rows[i][rIdx] || '').trim();
      if (!entity && !rpl) continue;

      const tsScore = tokenSortRatio(entity, rpl);
      const jwScore = Math.round(jaroWinkler(entity, rpl) * 100);
      const composite = Math.round((tsScore * 0.6) + (jwScore * 0.4));
      const grade = composite >= 85 ? 'High' : composite >= 65 ? 'Medium' : 'Low';

      computed.push({
        id: `ROW-${i}`,
        entityName: entity,
        rplName: rpl,
        tokenSortScore: tsScore,
        jaroWinklerScore: jwScore,
        compositeScore: composite,
        matchGrade: grade,
        sanctionRisk: composite >= 80 ? 'CRITICAL' : composite >= 60 ? 'MEDIUM' : 'CLEAR',
      });
    }

    computed.sort((a, b) => b.compositeScore - a.compositeScore);
    setMatches(computed);
  };

  const handleExport = () => {
    const headers = [
      'Record ID',
      'Entity Name',
      'RplName',
      'Token-Sort Fuzzy Score (%)',
      'Jaro-Winkler Score (%)',
      'Composite Similarity (%)',
      'Match Grade',
      'Compliance Flag',
    ];

    const rows = matches.map((m) => [
      m.id,
      m.entityName,
      m.rplName,
      m.tokenSortScore,
      m.jaroWinklerScore,
      m.compositeScore,
      m.matchGrade,
      m.sanctionRisk,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RPL Name Matches');
    XLSX.writeFile(wb, `RPL_Name_Matching_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filtered = matches.filter((m) => {
    if (m.compositeScore < minScoreFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.entityName.toLowerCase().includes(q) ||
        m.rplName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upload and Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              RPL Name Matching & Fuzzy Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual-algorithm comparison using token-sort Fuzzy and Jaro-Winkler sorted highest to lowest score
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSampleRplData}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Sample RPL Pairs</span>
            </button>

            {matches.length > 0 && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Match Results (.xlsx)</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Zone */}
        {matches.length === 0 && (
          <div className="mt-5 border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
              id="rplFileInput"
            />
            <label htmlFor="rplFileInput" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
              <div className="text-sm font-bold text-slate-800">
                Choose Excel file with Name & RplName columns
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Or click "Load Sample RPL Pairs" above to test right away
              </div>
            </label>
          </div>
        )}

        {/* Results Grid */}
        {matches.length > 0 && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Filter Minimum Score:</span>
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                  className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white focus:outline-none"
                >
                  <option value={0}>All Scores (0%+)</option>
                  <option value={60}>Medium+ (60%+)</option>
                  <option value={80}>High Confidence (80%+)</option>
                  <option value={90}>Near Exact (90%+)</option>
                </select>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">
                  Showing {filtered.length} of {matches.length} matches
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search entities or RPL names..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200">#</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200">Entity Name</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200">Target RplName</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">Token-Sort Fuzzy</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">Jaro-Winkler</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">Composite Score</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-slate-200 text-center">Sanction Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-center">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.entityName}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{item.rplName}</td>
                      <td className="py-2.5 px-3 font-mono text-center font-semibold text-slate-800">
                        {item.tokenSortScore}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-center font-semibold text-slate-800">
                        {item.jaroWinklerScore}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            item.compositeScore >= 85
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : item.compositeScore >= 70
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.compositeScore}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.sanctionRisk === 'CRITICAL' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            CRITICAL HIT
                          </span>
                        ) : item.sanctionRisk === 'MEDIUM' ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            REVIEW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            CLEAR
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
