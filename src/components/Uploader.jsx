import React, { useState } from 'react';
import { translations } from '../i18n/translations';

/**
 * Uploader Component
 * Clean, compact enterprise dropzone for requirements.json and PDF documents.
 * Renders file list with page counts, SHA-256 hashes, and duplicate warnings.
 * All icons strictly capped at w-8 h-8 maximum.
 */
export default function Uploader({ 
  onFilesSelected, 
  uploadedFiles = [], 
  onRemoveFile, 
  isProcessing = false, 
  language = 'en',
  hasTenderLoaded = false
}) {
  const t = translations[language] || translations.en;
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);

  // Drag event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length > 0) {
      onFilesSelected(filesArray);
    }
    e.target.value = '';
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const duplicateCount = uploadedFiles.filter(f => f.isDuplicate).length;

  return (
    <div className="space-y-4 mb-6">
      {/* Compact Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-5 border border-dashed rounded-lg text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          id="fileInput"
          multiple
          accept="application/pdf,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <label htmlFor="fileInput" className="cursor-pointer block">
          {/* Maximum w-8 h-8 Icon Container */}
          <div className="mx-auto w-8 h-8 mb-2 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            {t.uploaderTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md mx-auto">
            {hasTenderLoaded ? t.uploaderSubtitle : t.uploadJsonFirstDesc}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-2xs transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t.selectFiles}</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {t.acceptsFormat}
          </p>
        </label>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/85 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-blue-700">
            <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t.processing}</span>
          </div>
        )}
      </div>

      {/* Duplicate Warning Notice */}
      {duplicateCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center gap-2">
          <span className="text-amber-600 text-sm">⚠</span>
          <div className="flex-1">
            <strong className="text-amber-900">{t.duplicateBanner} ({duplicateCount}):</strong>{' '}
            <span className="text-amber-700">{t.duplicateBannerDesc}</span>
          </div>
        </div>
      )}

      {/* Uploaded Documents Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.uploadedFilesTitle}
            </h3>
            <span className="px-1.5 py-0.2 text-[11px] font-semibold bg-slate-200 text-slate-700 rounded">
              {uploadedFiles.length}
            </span>
          </div>

          {duplicateCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
              {duplicateCount} {t.duplicatesCount} Flagged
            </span>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            {t.noFilesUploaded}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2 font-semibold">{t.fileName}</th>
                  <th className="px-3.5 py-2 font-semibold text-center">{t.pageCount}</th>
                  <th className="px-3.5 py-2 font-semibold">{t.hash}</th>
                  <th className="px-3.5 py-2 font-semibold text-center">{t.status}</th>
                  <th className="px-3.5 py-2 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadedFiles.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50/70 transition-colors ${
                      item.isDuplicate ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* File Name */}
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">📄</span>
                        <span className="truncate max-w-[220px]" title={item.name}>
                          {item.name}
                        </span>
                        {item.isDuplicate && (
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-1 rounded">
                            DUP
                          </span>
                        )}
                        {item.size && (
                          <span className="text-[10px] text-slate-400">
                            ({(item.size / 1024).toFixed(0)} KB)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Page Count */}
                    <td className="px-3.5 py-2.5 text-center text-slate-700">
                      {item.pageCount !== undefined ? (
                        <span className="font-mono">{item.pageCount}</span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* SHA-256 Hash */}
                    <td className="px-3.5 py-2.5">
                      {item.hash ? (
                        <div className="flex items-center gap-1.5">
                          <code 
                            title={item.hash} 
                            className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded select-all"
                          >
                            {item.hash.substring(0, 8)}...{item.hash.substring(item.hash.length - 6)}
                          </code>
                          <button
                            onClick={() => handleCopyHash(item.hash)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Copy checksum"
                          >
                            {copiedHash === item.hash ? '✓' : '📋'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3.5 py-2.5 text-center">
                      {item.isDuplicate ? (
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          {t.duplicateBadge}
                        </span>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          {t.uniqueBadge}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => onRemoveFile(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title={t.removeFile}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}