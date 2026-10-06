import React from 'react';
import { translations } from '../i18n/translations';

/**
 * MatchingEngine Component
 * Allows mapping non-duplicate uploaded PDF files to specific tender requirements.
 * Enforces one-to-one mapping (one file can only map to one requirement at a time)
 * and dynamically reveals an expiry date picker whenever a requirement has `has_expiry === true`.
 */
export default function MatchingEngine({
  requirements = [],
  uploadedFiles = [],
  language = 'en',
  matches = {},
  onMatchChange,
  expiryDates = {},
  onExpiryDateChange
}) {
  const t = translations[language] || translations.en;

  // Filter out duplicate files so only unique documents can be mapped
  const uniqueFiles = uploadedFiles.filter(file => !file.isDuplicate);

  // Compute a set of file IDs that are already mapped to OTHER requirements
  const getMappedFileIds = (currentReqId) => {
    const mappedIds = new Set();
    Object.entries(matches).forEach(([reqId, fileId]) => {
      if (reqId !== String(currentReqId) && fileId) {
        mappedIds.add(fileId);
      }
    });
    return mappedIds;
  };

  if (requirements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-600 text-white text-lg">🔗</span>
            <h2 className="text-xl font-bold text-slate-50">
              {t.matchingEngineTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t.matchingEngineSubtitle}
          </p>
        </div>

        <div className="text-right">
          <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 text-xs font-semibold rounded-full">
            {Object.values(matches).filter(Boolean).length} / {requirements.length} {t.mapped}
          </span>
        </div>
      </div>

      {/* Requirements List */}
      <div className="p-6 space-y-4">
        {requirements.map((req, idx) => {
          const reqId = String(req.id || idx);
          const selectedFileId = matches[reqId] || '';
          const selectedFile = uniqueFiles.find(f => String(f.id) === String(selectedFileId));
          const mappedElsewhereSet = getMappedFileIds(reqId);
          const expiryDateValue = expiryDates[reqId] || '';

          return (
            <div
              key={reqId}
              className={`p-5 rounded-xl border transition-all ${
                selectedFile
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Requirement Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <h3 className="font-semibold text-slate-800">
                      {language === 'bn' && req.title_bn ? req.title_bn : req.name}
                    </h3>

                    {/* Mandatory / Optional Badge */}
                    {req.mandatory ? (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded">
                        {t.mandatoryReq}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                        {t.optionalReq}
                      </span>
                    )}

                    {/* Has Expiry Badge */}
                    {req.has_expiry && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded flex items-center gap-1">
                        📅 {t.expiryRequired}
                      </span>
                    )}
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Mapping Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* File Selector Dropdown */}
                  <div className="min-w-[240px]">
                    <select
                      value={selectedFileId}
                      onChange={(e) => onMatchChange(reqId, e.target.value)}
                      className={`w-full text-xs rounded-lg border px-3 py-2 bg-white font-medium shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        selectedFile
                          ? 'border-blue-300 text-blue-900 font-semibold'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      <option value="">{t.selectFilePlaceholder}</option>
                      {uniqueFiles.map((file) => {
                        const isMappedElsewhere = mappedElsewhereSet.has(String(file.id));
                        return (
                          <option
                            key={file.id}
                            value={file.id}
                            disabled={isMappedElsewhere}
                          >
                            📄 {file.name} ({file.pageCount || 1} pgs) {isMappedElsewhere ? ` ${t.mappedAlready}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Dynamic Expiry Date Input Field */}
                  {req.has_expiry && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="date"
                          value={expiryDateValue}
                          onChange={(e) => onExpiryDateChange(reqId, e.target.value)}
                          className={`text-xs rounded-lg border px-3 py-2 bg-white font-medium shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            !expiryDateValue && selectedFile
                              ? 'border-amber-400 bg-amber-50/50 text-amber-900 ring-2 ring-amber-200'
                              : 'border-slate-300 text-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Clear Button */}
                  {selectedFileId && (
                    <button
                      onClick={() => onMatchChange(reqId, '')}
                      className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                      title={t.clearMapping}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Mapped Document Quick Details Bar */}
              {selectedFile && (
                <div className="mt-3 pt-3 border-t border-blue-100 flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">✓ {t.mapped}:</span>
                    <span className="font-mono bg-blue-100/70 px-2 py-0.5 rounded text-blue-800">
                      {selectedFile.name}
                    </span>
                    <span className="text-blue-600">({selectedFile.pageCount || 1} pages)</span>
                  </div>

                  {selectedFile.hash && (
                    <div className="text-[11px] font-mono text-slate-400">
                      SHA-256: {selectedFile.hash.substring(0, 10)}...{selectedFile.hash.substring(selectedFile.hash.length - 6)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
