import React, { useState } from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { generateTenderPackage } from '../utils/packageGenerator';
import { translations } from '../i18n/translations';

/**
 * PackageGenerator Component
 * Clean, compact enterprise UI for PDF compilation and download.
 * Disables generation button whenever blocking compliance statuses exist.
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

  if (!requirements || requirements.length === 0) {
    return null;
  }

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

  const outputFileName = `${(tenderDetails?.tender_id || tenderDetails?.reference_no || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.pdf`;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden mb-6">
      {/* Light Enterprise Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>📦</span>
            <span>{t.generateTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.generateSubtitle}
          </p>
        </div>

        <div>
          {isBlocked ? (
            <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded inline-flex items-center gap-1">
              ⛔ {blockingIssues.length} Blocking Issue{blockingIssues.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded inline-flex items-center gap-1">
              ✓ Ready for Compile
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3">
        {isBlocked ? (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded text-xs text-rose-900">
            <div className="font-semibold text-rose-800 flex items-center gap-1.5">
              <span>⚠</span>
              <span>{t.blockedNotice}</span>
            </div>
            <div className="mt-1.5 text-[11px] text-rose-700 space-y-0.5">
              {blockingIssues.map((req, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-rose-400">•</span>
                  <span><strong>{language === 'bn' && req.title_bn ? req.title_bn : req.name}</strong></span>
                  <span className="text-rose-500">
                    ({req.mandatory ? 'Mandatory file missing' : 'Expiry date required'})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
            <span>✓</span>
            <span className="font-medium">{t.readyNotice}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500">
            Target Output: <code className="font-mono text-slate-700 font-semibold">{outputFileName}</code>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isBlocked || isGenerating}
            className={`w-full sm:w-auto px-5 py-2.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              isBlocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : isGenerating
                ? 'bg-blue-600 text-white cursor-wait opacity-80'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>{t.generateButton}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
