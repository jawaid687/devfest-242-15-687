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
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-2xs hover:bg-emerald-100 transition-all duration-300 ease-in-out animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
            OK
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full shadow-2xs hover:bg-rose-100 transition-all duration-300 ease-in-out animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-rose-500"></span>
            Missing
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-full shadow-2xs hover:bg-red-100 transition-all duration-300 ease-in-out animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500"></span>
            Expired
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full shadow-2xs hover:bg-amber-100 transition-all duration-300 ease-in-out animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500"></span>
            Expiry date needed
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded-full shadow-2xs hover:bg-slate-100 transition-all duration-300 ease-in-out animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-400"></span>
            Not provided
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-full border border-slate-200 shadow-2xs transition-all duration-300 ease-in-out">
            {statusObj.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden mb-8">
      {/* Light Enterprise Header */}
      <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-2xs">
            {tenderDetails.category || "Tender Information"}
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1.5 tracking-tight">
            {tenderDetails.title}
          </h2>
          {(tenderDetails.reference_no || tenderDetails.tender_id) && (
            <p className="text-xs text-slate-600 mt-0.5">
              Ref: <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/60">{tenderDetails.reference_no || tenderDetails.tender_id}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.deadline}</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">
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
      <div className="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block font-medium">Procuring Entity</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">{tenderDetails.procuring_entity || tenderDetails.category || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Bidder</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">{tenderDetails.bidder || "N/A"}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Total Requirements</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">{requirements.length}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-medium">Submission Status</span>
          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full inline-block mt-0.5">In Preparation</span>
        </div>
      </div>

      {/* Requirements Summary Table */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3.5">
          {t.requirementChecklist}
        </h3>

        <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
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
                  <tr key={reqId} className="hover:bg-slate-50/80 transition-all duration-200 ease-in-out">
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="font-semibold text-slate-800">
                        {language === 'bn' 
                          ? (req.title_bn || req.title_en || req.name || req.title || 'Document')
                          : (req.title_en || req.name || req.title || req.title_bn || 'Document')}
                      </div>
                      {req.description && (
                        <div className="text-slate-500 text-[11px] max-w-sm truncate mt-0.5" title={req.description}>
                          {req.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.mandatory ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full shadow-2xs">
                          {t.mandatoryReq}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/60 rounded-full">
                          {t.optionalReq}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.has_expiry ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full text-[11px] border border-amber-200/80">
                          {expiryDate ? expiryDate : 'Required'}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {matchedFile ? (
                        <span className="font-mono text-slate-800 font-medium truncate max-w-[150px] inline-block bg-slate-100/70 px-2 py-0.5 rounded text-[11px] border border-slate-200/60" title={matchedFile.name}>
                          {matchedFile.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmapped</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
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