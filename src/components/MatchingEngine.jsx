import React from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { translations } from '../i18n/translations';

/**
 * MatchingEngine Component
 * Clean, compact enterprise UI for mapping unique PDF files to tender requirements.
 * Enforces one-to-one mapping and dynamic expiry date inputs with live status verification.
 * Strictly light theme with no SVGs or dark/text-white classes.
 */
export default function MatchingEngine({
  requirements = [],
  uploadedFiles = [],
  language = 'en',
  matches = {},
  onMatchChange,
  expiryDates = {},
  onExpiryDateChange,
  submissionDeadline = '2026-11-15'
}) {
  const t = translations[language] || translations.en;

  // Filter out duplicate files so only unique documents can be mapped
  const uniqueFiles = uploadedFiles.filter(file => !file.isDuplicate);

  // Set of file IDs already mapped to other requirements
  const getMappedFileIds = (currentReqId) => {
    const mappedIds = new Set();
    Object.entries(matches).forEach(([reqId, fileId]) => {
      if (reqId !== String(currentReqId) && fileId) {
        mappedIds.add(fileId);
      }
    });
    return mappedIds;
  };

  // Status badge styling helper
  const renderStatusBadge = (statusObj) => {
    switch (statusObj.status) {
      case 'OK':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded">
            OK
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 rounded">
            Missing
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-800 border border-red-300 rounded">
            Expired
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 rounded">
            Expiry date needed
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-300 rounded">
            Not provided
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-800 rounded">
            {statusObj.status}
          </span>
        );
    }
  };

  if (!requirements || requirements.length === 0) {
    return null;
  }

  const mappedCount = Object.values(matches).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Light Enterprise Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {t.matchingEngineTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.matchingEngineSubtitle}
          </p>
        </div>

        <div>
          <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded">
            {mappedCount} of {requirements.length} {t.mapped}
          </span>
        </div>
      </div>

      {/* Requirements List */}
      <div className="p-6 space-y-3 bg-slate-50/50">
        {requirements.map((req, idx) => {
          const reqId = String(req.id || idx);
          const selectedFileId = matches[reqId] || '';
          const selectedFile = uniqueFiles.find(f => String(f.id) === String(selectedFileId));
          const mappedElsewhereSet = getMappedFileIds(reqId);
          const expiryDateValue = expiryDates[reqId] || '';

          // Evaluate live status using statusEngine
          const statusObj = getDocumentStatus(
            req,
            selectedFile,
            expiryDateValue,
            submissionDeadline
          );

          return (
            <div
              key={reqId}
              className={`p-4 rounded-lg border bg-white transition-colors ${
                selectedFile
                  ? 'border-blue-300 shadow-2xs'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Requirement Title, Badges & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">
                      #{idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {language === 'bn' 
                        ? (req.title_bn || req.title_en || req.name || req.title || 'Document')
                        : (req.title_en || req.name || req.title || req.title_bn || 'Document')}
                    </h3>

                    {/* Mandatory / Optional Badge */}
                    {req.mandatory ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 rounded">
                        {t.mandatoryReq}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-700 bg-slate-100 rounded">
                        {t.optionalReq}
                      </span>
                    )}

                    {/* Expiry Badge */}
                    {req.has_expiry && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-300 rounded">
                        Expiry
                      </span>
                    )}

                    {/* Live Status Badge */}
                    <div className="ml-auto sm:ml-2">
                      {renderStatusBadge(statusObj)}
                    </div>
                  </div>

                  {req.description && (
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-xl" title={req.description}>
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Dropdown & Expiry Date Mapping Controls */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  {/* File Selector Dropdown */}
                  <select
                    value={selectedFileId}
                    onChange={(e) => onMatchChange(reqId, e.target.value)}
                    className={`text-xs rounded border px-3 py-2 bg-white shadow-2xs focus:ring-1 focus:ring-blue-500 focus:outline-none min-w-[220px] ${
                      selectedFile
                        ? 'border-blue-400 text-blue-900 font-medium'
                        : 'border-slate-300 text-slate-700'
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
                          {file.name} ({file.pageCount || 1}p) {isMappedElsewhere ? ` ${t.mappedAlready}` : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* Dynamic Expiry Date Input Field */}
                  {req.has_expiry && (
                    <input
                      type="date"
                      value={expiryDateValue}
                      onChange={(e) => onExpiryDateChange(reqId, e.target.value)}
                      className={`text-xs rounded border px-2.5 py-2 bg-white shadow-2xs focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                        !expiryDateValue && selectedFile
                          ? 'border-amber-400 bg-amber-50 text-amber-900'
                          : 'border-slate-300 text-slate-700'
                      }`}
                      title={t.expiryDateLabel}
                    />
                  )}

                  {/* Clear Button */}
                  {selectedFileId && (
                    <button
                      onClick={() => onMatchChange(reqId, '')}
                      className="px-2 py-1 text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded border border-slate-300 transition-colors"
                      title={t.clearMapping}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
