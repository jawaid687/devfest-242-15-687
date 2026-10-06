import React from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { translations } from '../i18n/translations';

/**
 * TenderDetails Component
 * Compact enterprise layout displaying tender metadata and requirement compliance summary.
 * Strictly light theme with clean borders and non-technical office worker friendly styling.
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

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Light Enterprise Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            {tenderDetails.category || "Tender Information"}
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            {tenderDetails.title}
          </h2>
          {(tenderDetails.reference_no || tenderDetails.tender_id) && (
            <p className="text-xs text-slate-600 mt-0.5">
              Ref: <span className="font-mono text-slate-800">{tenderDetails.reference_no || tenderDetails.tender_id}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-slate-500 uppercase">{t.deadline}</div>
          <div className="text-xs font-bold text-slate-900">
            {tenderDetails.submission_deadline || "N/A"}
          </div>
          {tenderDetails.budget && (
            <div className="text-xs text-slate-600 mt-0.5">
              Budget: {tenderDetails.budget}
            </div>
          )}
        </div>
      </div>

      {/* Metadata Detail Row */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block">Procuring Entity</span>
          <span className="font-medium text-slate-800">{tenderDetails.procuring_entity || tenderDetails.category || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Bidder</span>
          <span className="font-medium text-slate-800">{tenderDetails.bidder || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Requirements</span>
          <span className="font-medium text-slate-800">{requirements.length}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Submission Status</span>
          <span className="font-semibold text-blue-800">In Preparation</span>
        </div>
      </div>

      {/* Requirements Summary Table */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {t.requirementChecklist}
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-semibold">#</th>
                <th className="px-4 py-2.5 font-semibold">{t.reqName}</th>
                <th className="px-4 py-2.5 font-semibold text-center">{t.mandatory}</th>
                <th className="px-4 py-2.5 font-semibold text-center">{t.expiryCheck}</th>
                <th className="px-4 py-2.5 font-semibold">{t.matchedDoc}</th>
                <th className="px-4 py-2.5 font-semibold text-center">{t.complianceStatus}</th>
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
                  <tr key={reqId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      <div>
                        {language === 'bn' 
                          ? (req.title_bn || req.title_en || req.name || req.title || 'Document')
                          : (req.title_en || req.name || req.title || req.title_bn || 'Document')}
                      </div>
                      {req.description && (
                        <div className="text-slate-500 text-[11px] max-w-sm truncate" title={req.description}>
                          {req.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {req.mandatory ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 rounded">
                          {t.mandatoryReq}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-700 bg-slate-100 rounded">
                          {t.optionalReq}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {req.has_expiry ? (
                        <span className="text-amber-800 font-medium">
                          {expiryDate ? expiryDate : 'Required'}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {matchedFile ? (
                        <span className="font-mono text-slate-800 truncate max-w-[150px] inline-block" title={matchedFile.name}>
                          {matchedFile.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmapped</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
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