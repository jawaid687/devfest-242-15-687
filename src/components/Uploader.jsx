import React, { useState } from 'react';
import { translations } from '../i18n/translations';

/**
 * Uploader Component
 * Manages file dropzone, file input selection, background processing states,
 * and renders a polished list of uploaded files with SHA-256 hashes, page counts,
 * and prominent DUPLICATE warning flags.
 */
export default function Uploader({ 
  onFilesSelected, 
  uploadedFiles = [], 
  onRemoveFile, 
  isProcessing = false, 
  language = 'en' 
}) {
  const t = translations[language] || translations.en;
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);

  // Handle drag over state for dropzone
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

  // Handle files dropped directly into dropzone
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length > 0) {
      onFilesSelected(filesArray);
    }
    e.target.value = ''; // Reset input to allow re-uploading same file name if deleted
  };

  // Copy hash helper for user convenience
  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const duplicateCount = uploadedFiles.filter(f => f.isDuplicate).length;

  return (
    <div className="space-y-6">
      {/* File Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 shadow-sm ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-blue-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'
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
          <div className="mx-auto w-16 h-16 mb-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {t.uploaderTitle}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            {t.uploaderSubtitle}
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t.selectFiles}
          </div>

          <p className="text-xs text-slate-400 mt-3">
            {t.acceptsFormat}
          </p>
        </label>

        {/* Processing Overlay Skeleton */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 text-blue-700 font-medium">
            <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t.processing}</span>
          </div>
        )}
      </div>

      {/* Duplicate Warning Banner if Duplicates Exist */}
      {duplicateCount > 0 && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3 shadow-sm">
          <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-amber-900">
              {t.duplicateBanner} ({duplicateCount})
            </h4>
            <p className="text-sm text-amber-700 mt-0.5">
              {t.duplicateBannerDesc}
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              {t.uploadedFilesTitle}
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {uploadedFiles.length}
            </span>
          </div>

          {duplicateCount > 0 && (
            <span className="px-3 py-1 text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              {duplicateCount} {t.duplicatesCount}
            </span>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">{t.noFilesUploaded}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">{t.fileName}</th>
                  <th className="px-6 py-3 font-semibold text-center">{t.pageCount}</th>
                  <th className="px-6 py-3 font-semibold">{t.hash}</th>
                  <th className="px-6 py-3 font-semibold text-center">{t.status}</th>
                  <th className="px-6 py-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadedFiles.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors hover:bg-slate-50/80 ${
                      item.isDuplicate ? 'bg-rose-50/40 hover:bg-rose-50/70' : ''
                    }`}
                  >
                    {/* File Name & Icon */}
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.name.endsWith('.json')
                            ? 'bg-amber-100 text-amber-700'
                            : item.isDuplicate
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {item.name}
                            {item.isDuplicate && (
                              <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                                DUP
                              </span>
                            )}
                          </div>
                          {item.size && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {(item.size / 1024).toFixed(1)} KB
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Page Count */}
                    <td className="px-6 py-4 text-center">
                      {item.pageCount !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          📄 {item.pageCount} {language === 'en' ? 'Pages' : 'পৃষ্ঠা'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* SHA-256 Hash */}
                    <td className="px-6 py-4">
                      {item.hash ? (
                        <div className="flex items-center gap-2">
                          <code 
                            title={item.hash} 
                            className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 select-all max-w-[160px] truncate"
                          >
                            {item.hash.substring(0, 12)}...{item.hash.substring(item.hash.length - 8)}
                          </code>
                          <button
                            onClick={() => handleCopyHash(item.hash)}
                            className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === item.hash ? '✓ Copied' : '📋'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Status & Duplicate Badge */}
                    <td className="px-6 py-4 text-center">
                      {item.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 rounded-full shadow-xs">
                          <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {t.duplicateBadge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          {t.uniqueBadge}
                        </span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onRemoveFile(item.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                        title={t.removeFile}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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