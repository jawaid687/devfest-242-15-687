import React from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { translations } from '../i18n/translations';

/**
 * TenderDetails Component
 * Displays tender metadata and evaluates requirement document status using statusEngine.
 * Uses matches and expiryDates from state to display real-time compliance results.
 */
export default function TenderDetails({ 
  tenderDetails, 
  requirements = [], 
  uploadedFiles = [], 
  matches = {},
  expiryDates = {},
  language = 'en' 
}) {
  const t = translations[language] || translations.en;

  if (!tenderDetails) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">Upload requirements.json or click sample data to view compliance breakdown</p>
      </div>
    );
  }

  // Status badge style mapper
  const getStatusBadge = (statusObj) => {
    switch (statusObj.status) {
      case 'OK':
        return <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">✓ {t.statusOk}</span>;
      case 'Missing':
        return <span className="px-3 py-1 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded-full">🚫 {t.statusMissing}</span>;
      case 'Expired':
        return <span className="px-3 py-1 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded-full">⚠️ {t.statusExpired}</span>;
      case 'Expiry date needed':
        return <span className="px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full">📅 {t.statusExpiryNeeded}</span>;
      case 'Not provided':
        return <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 rounded-full">ℹ️ {t.statusNotProvided}</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">{statusObj.status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
            {tenderDetails.category || "Tender Overview"}
          </span>
          <h2 className="text-xl font-bold mt-2 text-slate-50">
            {tenderDetails.title}
          </h2>
          {tenderDetails.reference_no && (
            <p className="text-xs text-slate-400 mt-1">Ref: {tenderDetails.reference_no}</p>
          )}
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">{t.deadline}</div>
          <div className="text-sm font-semibold text-amber-400">
            {tenderDetails.submission_deadline}
          </div>
          {tenderDetails.budget && (
            <div className="text-xs text-slate-300 mt-0.5">Budget: {tenderDetails.budget}</div>
          )}
        </div>
      </div>

      {/* Requirements Compliance Summary Table */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>{t.requirementChecklist}</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {requirements.length} Requirements
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.reqName}</th>
                <th className="px-4 py-3 font-semibold text-center">{t.mandatory}</th>
                <th className="px-4 py-3 font-semibold text-center">{t.expiryCheck}</th>
                <th className="px-4 py-3 font-semibold">{t.matchedDoc}</th>
                <th className="px-4 py-3 font-semibold text-center">{t.complianceStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map((req, idx) => {
                const reqId = String(req.id || idx);
                const matchedFileId = matches[reqId];
                const matchedFile = uploadedFiles.find(f => String(f.id) === String(matchedFileId));
                const expiryDate = expiryDates[reqId] || '';

                const statusObj = getDocumentStatus(
                  req,
                  matchedFile,
                  expiryDate,
                  tenderDetails.submission_deadline
                );

                return (
                  <tr key={reqId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Requirement Name */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {language === 'bn' && req.title_bn ? req.title_bn : req.name}
                      </div>
                      {req.description && (
                        <div className="text-xs text-slate-400 mt-0.5 max-w-sm">
                          {req.description}
                        </div>
                      )}
                    </td>

                    {/* Mandatory / Optional */}
                    <td className="px-4 py-3.5 text-center">
                      {req.mandatory ? (
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded">
                          {t.mandatoryReq}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                          {t.optionalReq}
                        </span>
                      )}
                    </td>

                    {/* Expiry Required & Selected Date */}
                    <td className="px-4 py-3.5 text-center">
                      {req.has_expiry ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded">
                            {t.expiryRequired}
                          </span>
                          <span className="text-xs font-mono text-slate-600">
                            {expiryDate || '(Not set)'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">{t.expiryNotRequired}</span>
                      )}
                    </td>

                    {/* Matched File */}
                    <td className="px-4 py-3.5">
                      {matchedFile ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <span className="text-blue-600 font-bold">📄</span>
                          <span className="truncate max-w-[180px]" title={matchedFile.name}>
                            {matchedFile.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No document mapped</span>
                      )}
                    </td>

                    {/* Compliance Status Badge */}
                    <td className="px-4 py-3.5 text-center">
                      {getStatusBadge(statusObj)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}