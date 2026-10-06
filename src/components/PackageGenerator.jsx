import React, { useState } from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { generateTenderPackage } from '../utils/packageGenerator';
import { translations } from '../i18n/translations';

/**
 * PackageGenerator Component
 * Handles the compilation of matched PDF documents, Cover Page creation,
 * page footer stamping, and browser download trigger using pdf-lib.
 * 
 * Rules:
 * - Generation button is strictly DISABLED if any requirement has a blocking status
 *   ('Missing', 'Expired', 'Expiry date needed').
 */
export default function PackageGenerator({
  tenderDetails = {},
  requirements = [],
  uploadedFiles = [],
  matches = {},
  expiryDates = {},
  language = 'en',
  showToast
}) {
  const t = translations[language] || translations.en;
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute compliance blocking status for all requirements
  const blockingIssues = requirements.filter(req => {
    const reqId = String(req.id);
    const matchedFileId = matches[reqId];
    const matchedFile = uploadedFiles.find(f => String(f.id) === String(matchedFileId));
    const expiryDate = expiryDates[reqId] || '';
    const statusObj = getDocumentStatus(
      req,
      matchedFile,
      expiryDate,
      tenderDetails?.submission_deadline
    );
    return statusObj.isBlocking;
  });

  const isBlocked = blockingIssues.length > 0;

  // Handle PDF Generation & Download
  const handleGenerate = async () => {
    if (isBlocked || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateTenderPackage({
        tenderDetails,
        requirements,
        uploadedFiles,
        matches,
        expiryDates
      });

      if (showToast) {
        showToast(t.toastGenerateSuccess, 'success');
      }
    } catch (error) {
      console.error('Error generating tender package PDF:', error);
      if (showToast) {
        showToast('Failed to generate PDF package.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
            📦
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">
              {t.generateTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              {t.generateSubtitle}
            </p>
          </div>
        </div>

        <div>
          {isBlocked ? (
            <span className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold rounded-full flex items-center gap-1">
              ⛔ {blockingIssues.length} Blocking Issue{blockingIssues.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
              ✓ Ready for Compile
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-4">
        {/* Compliance Notice Banner */}
        {isBlocked ? (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex items-start gap-3 text-rose-900">
            <svg className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-bold text-sm text-rose-950">
                {t.blockedNotice}
              </h4>
              <ul className="text-xs text-rose-700 mt-1.5 space-y-1 list-disc list-inside">
                {blockingIssues.map((req, i) => (
                  <li key={i}>
                    <strong>{language === 'bn' && req.title_bn ? req.title_bn : req.name}</strong> - 
                    {req.mandatory ? ' Mandatory document missing or invalid' : ' Expiry date required'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-center gap-3 text-emerald-900">
            <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-emerald-800">
              {t.readyNotice}
            </p>
          </div>
        )}

        {/* Generate Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Target Output File: <code className="font-mono font-bold text-slate-700">{(tenderDetails.tender_id || tenderDetails.reference_no || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.pdf</code>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isBlocked || isGenerating}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
              isBlocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                : isGenerating
                ? 'bg-blue-600 text-white cursor-wait opacity-90'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 active:scale-[0.99] cursor-pointer'
            }`}
            title={isBlocked ? t.blockedNotice : t.generateButton}
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{t.generateButton}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
