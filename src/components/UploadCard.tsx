import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  FileCheck,
} from 'lucide-react';

interface UploadCardProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  acceptFormats: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  requiredColumnsHint?: string[];
  detectedColumnsInfo?: {
    totalRows?: number;
    detectedHeaders?: string[];
    missingRequired?: string[];
  } | null;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  stepNumber,
  title,
  subtitle,
  acceptFormats,
  file,
  onFileSelect,
  onClearFile,
  requiredColumnsHint = [],
  detectedColumnsInfo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isMissingHeaders =
    detectedColumnsInfo?.missingRequired &&
    detectedColumnsInfo.missingRequired.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 transition-all flex flex-col justify-between hover:border-slate-300">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
              {stepNumber}
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>

          {file ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Loaded</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-slate-400">
              Required (.xlsx, .csv)
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-3.5">{subtitle}</p>

        {/* Dropzone or File Summary */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all select-none ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptFormats}
              onChange={handleChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center mx-auto mb-2 text-slate-600">
              <UploadCloud className="w-5 h-5 text-slate-700" />
            </div>
            <div className="text-xs font-semibold text-slate-800 mb-0.5">
              Choose file or drag & drop here
            </div>
            <div className="text-[11px] text-slate-500">
              Microsoft Excel (.xlsx, .xls) or CSV
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div
                    className="text-xs font-bold text-slate-900 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptFormats}
                  onChange={handleChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={onClearFile}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Validation Feedback */}
            {detectedColumnsInfo && (
              <div className="pt-2 border-t border-slate-200/70 text-[11px]">
                {isMissingHeaders ? (
                  <div className="flex items-start gap-1.5 text-amber-800 bg-amber-50/80 border border-amber-200 p-2 rounded">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Missing required column(s):{' '}
                      <strong>
                        {detectedColumnsInfo.missingRequired?.join(', ')}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>All key headers detected successfully</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expected Headers Hint */}
      {requiredColumnsHint.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium text-slate-600">Expected Schema:</span>
          <span className="font-mono text-slate-500 truncate max-w-[70%]" title={requiredColumnsHint.join(', ')}>
            {requiredColumnsHint.join(' · ')}
          </span>
        </div>
      )}
    </div>
  );
};
