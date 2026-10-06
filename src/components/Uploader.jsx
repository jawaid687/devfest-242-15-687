import React, { useState } from 'react';
import { translations } from '../i18n/translations';

/**
 * Uploader Component
 * Pure light mode, spacious, enterprise-clean container.
 * No SVGs or icon fonts — uses standard HTML text and native file input.
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
  const [copiedHash, setCopiedHash] = useState(null);

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
    <div className="space-y-6">
      {/* Exact User Specification for Uploader Container */}
      <div className="max-w-4xl mx-auto p-10 bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-sm text-center mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-1">
          {t.uploaderTitle}
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          {hasTenderLoaded ? t.uploaderSubtitle : t.uploadJsonFirstDesc}
        </p>

        {/* Native File Input with Standard HTML Text */}
        <div className="inline-block bg-slate-50 border border-slate-300 rounded-lg p-4">
          <label htmlFor="nativeFileInput" className="block text-xs font-semibold text-slate-700 mb-2">
            Select files from your computer (requirements.json and PDF documents):
          </label>
          <input
            id="nativeFileInput"
            type="file"
            multiple
            accept="application/pdf,.json"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
          />
        </div>

        <p className="text-xs text-slate-500 mt-4">
          {t.acceptsFormat}
        </p>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium rounded-lg">
            [Processing files in background, please wait...]
          </div>
        )}
      </div>

      {/* Duplicate Alert Notice */}
      {duplicateCount > 0 && (
        <div className="max-w-4xl mx-auto p-4 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-900">
          <strong>[WARNING] {t.duplicateBanner} ({duplicateCount}):</strong>{' '}
          <span>{t.duplicateBannerDesc}</span>
        </div>
      )}

      {/* Uploaded Documents Table */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t.uploadedFilesTitle}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded">
              {uploadedFiles.length}
            </span>
          </div>

          {duplicateCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 rounded">
              {duplicateCount} {t.duplicatesCount} Flagged
            </span>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {t.noFilesUploaded}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t.fileName}</th>
                  <th className="px-4 py-3 font-semibold text-center">{t.pageCount}</th>
                  <th className="px-4 py-3 font-semibold">{t.hash}</th>
                  <th className="px-4 py-3 font-semibold text-center">{t.status}</th>
                  <th className="px-4 py-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {uploadedFiles.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      item.isDuplicate ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    {/* File Name */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.name}</span>
                        {item.isDuplicate && (
                          <span className="text-[11px] bg-rose-100 text-rose-800 border border-rose-300 font-bold px-1.5 py-0.5 rounded">
                            DUPLICATE
                          </span>
                        )}
                        {item.size && (
                          <span className="text-xs text-slate-500">
                            ({(item.size / 1024).toFixed(0)} KB)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Page Count */}
                    <td className="px-4 py-3 text-center text-slate-800 font-mono">
                      {item.pageCount !== undefined ? item.pageCount : 'N/A'}
                    </td>

                    {/* Checksum Hash */}
                    <td className="px-4 py-3">
                      {item.hash ? (
                        <div className="flex items-center gap-2">
                          <code 
                            title={item.hash} 
                            className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-300"
                          >
                            {item.hash.substring(0, 8)}...{item.hash.substring(item.hash.length - 6)}
                          </code>
                          <button
                            onClick={() => handleCopyHash(item.hash)}
                            className="text-xs text-slate-600 hover:text-slate-900 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded"
                            title="Copy checksum"
                          >
                            {copiedHash === item.hash ? '[Copied]' : '[Copy]'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">N/A</span>
                      )}
                    </td>

                    {/* Duplicate Status */}
                    <td className="px-4 py-3 text-center">
                      {item.isDuplicate ? (
                        <span className="inline-block px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded">
                          {t.duplicateBadge}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded">
                          {t.uniqueBadge}
                        </span>
                      )}
                    </td>

                    {/* Remove Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRemoveFile(item.id)}
                        className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                        title={t.removeFile}
                      >
                        {t.removeFile}
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