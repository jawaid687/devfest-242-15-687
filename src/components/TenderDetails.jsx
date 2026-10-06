import React from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { translations } from '../i18n/translations';

/**
 * TenderDetails Component
 * Compact enterprise layout displaying tender metadata and requirement compliance summary.
 * Light theme with clean borders and non-technical office worker friendly styling.
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

  if (!tenderDetails) return null;

  // Status badge styling helper
  const getStatusBadge = (statusObj) => {
    switch (statusObj.status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            ✓ {t.statusOk}
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded">
            ✕ {t.statusMissing}
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded">
            ⚠ {t.statusExpired}
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded">
            📅 {t.statusExpiryNeeded}
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded">
            ℹ {t.statusNotProvided}
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded">
            {statusObj.status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden mb-6">
      {/* Light Enterprise Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            {tenderDetails.category || "Tender Information"}
          </span>
          <h2 className="text-base font-bold text-slate-800 mt-1">
            {tenderDetails.title}
          </h2>
          {(tenderDetails.reference_no || tenderDetails.tender_id) && (
            <p className="text-xs text-slate-500 mt-0.5">
              Ref: <span className="font-mono text-slate-700">{tenderDetails.reference_no || tenderDetails.tender_id}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-[11px] font-medium text-slate-500 uppercase">{t.deadline}</div>
          <div className="text-xs font-bold text-slate-800">
            {tenderDetails.submission_deadline || "N/A"}
          </div>
          {tenderDetails.budget && (
            <div className="text-[11px] text-slate-500 mt-0.5">
              Budget: {tenderDetails.budget}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Detail Row */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Procuring Entity</span>
          <span className="font-medium text-slate-700">{tenderDetails.procuring_entity || tenderDetails.category || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Bidder</span>
          <span className="font-medium text-slate-700">{tenderDetails.bidder || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Requirements</span>
          <span className="font-medium text-slate-700">{requirements.length}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Submission Status</span>
          <span className="font-semibold text-blue-700">In Preparation</span>
        </div>
      </div>

      {/* Requirements Summary Table */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          {t.requirementChecklist}
        </h3>

        <div className="overflow-x-auto border border-slate-150 rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2 font-semibold">#</th>
                <th className="px-3.5 py-2 font-semibold">{t.reqName}</th>
                <th className="px-3.5 py-2 font-semibold text-center">{t.mandatory}</th>
                <th className="px-3.5 py-2 font-semibold text-center">{t.expiryCheck}</th>
                <th className="px-3.5 py-2 font-semibold">{t.matchedDoc}</th>
                <th className="px-3.5 py-2 font-semibold text-center">{t.complianceStatus}</th>
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
                  <tr key={reqId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3.5 py-2 text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="px-3.5 py-2 font-medium text-slate-800">
                      <div>{language === 'bn' && req.title_bn ? req.title_bn : req.name}</div>
                      {req.description && (
                        <div className="text-[11px] text-slate-400 max-w-sm truncate" title={req.description}>
                          {req.description}
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      {req.mandatory ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          {t.mandatoryReq}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-600 bg-slate-100 rounded">
                          {t.optionalReq}
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-center">
                      {req.has_expiry ? (
                        <span className="text-[11px] text-amber-700 font-medium">
                          {expiryDate ? expiryDate : 'Required'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2">
                      {matchedFile ? (
                        <span className="font-mono text-slate-700 text-[11px] truncate max-w-[150px] inline-block" title={matchedFile.name}>
                          {matchedFile.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unmapped</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-center">
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