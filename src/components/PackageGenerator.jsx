import React, { useState } from 'react';
import { getDocumentStatus } from '../utils/statusEngine';
import { generateTenderPackage } from '../utils/packageGenerator';
import { translations } from '../i18n/translations';

/**
 * PackageGenerator Component
 * Clean enterprise UI for PDF compilation and download.
 * Disables generation button whenever blocking compliance statuses exist.
 * No SVGs or dark/text-white classes.
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
        expiryDates,
        language
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
    <div className="max-w-4xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden mb-8">
      {/* Light Enterprise Header */}
      <div className="px-6 py-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {t.generateTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.generateSubtitle}
          </p>
        </div>

        <div>
          {isBlocked ? (
            <span className="inline-flex items-center px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full shadow-2xs transition-all duration-300 ease-in-out animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-rose-500"></span>
              [BLOCKED] {blockingIssues.length} Issue{blockingIssues.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full shadow-2xs transition-all duration-300 ease-in-out animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
              [READY] Compliant
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-4">
        {isBlocked ? (
          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 shadow-2xs">
            <div className="font-bold text-rose-900">
              {t.blockedNotice}
            </div>
            <div className="mt-2 text-rose-800 space-y-1">
              {blockingIssues.map((req, i) => (
                <div key={i}>
                  • <strong>{language === 'bn' ? (req.title_bn || req.title_en || req.name || req.title) : (req.title_en || req.name || req.title || req.title_bn)}</strong>{' '}
                  ({req.mandatory ? 'Mandatory file missing' : 'Expiry date required'})
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 shadow-2xs">
            <strong>[SUCCESS]</strong> {t.readyNotice}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-600">
            Output File: <code className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200/60">{outputFileName}</code>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isBlocked || isGenerating}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ease-in-out ${
              isBlocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : isGenerating
                ? 'bg-blue-100 text-blue-900 border border-blue-200 cursor-wait'
                : 'bg-blue-600 text-blue-50 hover:bg-blue-700 hover:shadow-md cursor-pointer shadow-xs active:scale-[0.98]'
            }`}
          >
            {isGenerating ? t.generating : t.generateButton}
          </button>
        </div>
      </div>
    </div>
  );
}
