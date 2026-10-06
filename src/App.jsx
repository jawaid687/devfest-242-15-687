import React, { useState, useEffect } from 'react';
import TenderDetails from './components/TenderDetails';
import MatchingEngine from './components/MatchingEngine';
import PackageGenerator from './components/PackageGenerator';
import Uploader from './components/Uploader';
import { calculateFileHash } from './utils/fileHasher';
import { getPdfPageCount } from './utils/pdfUtils';
import { translations } from './i18n/translations';

/**
 * App Main Component
 * Clean enterprise light layout designed for non-technical office workers.
 * Fully dynamic: Only renders tender details and requirements once requirements.json is uploaded.
 * All state persists to browser localStorage with no hardcoded fallback demo data.
 */
function App() {
  // Purge any lingering legacy demo data from localStorage on initialization
  if (typeof window !== 'undefined') {
    const rawTender = localStorage.getItem('tenderDetails');
    if (rawTender && rawTender.includes('IFT-2024-DEV-8891')) {
      localStorage.removeItem('tenderDetails');
      localStorage.removeItem('requirements');
      localStorage.removeItem('matches');
      localStorage.removeItem('expiryDates');
      localStorage.removeItem('uploadedFiles');
    }
  }

  // Language State ('en' | 'bn')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Tender Metadata State (strictly parsed from user's requirements.json)
  const [tenderDetails, setTenderDetails] = useState(() => {
    const saved = localStorage.getItem('tenderDetails');
    return saved ? JSON.parse(saved) : null;
  });

  // Requirements List State (strictly parsed from user's requirements.json)
  const [requirements, setRequirements] = useState(() => {
    const saved = localStorage.getItem('requirements');
    return saved ? JSON.parse(saved) : [];
  });

  // Uploaded Files State Array
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('uploadedFiles');
    return saved ? JSON.parse(saved) : [];
  });

  // Requirement-to-File Mappings State ({ [reqId]: fileId })
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('matches');
    return saved ? JSON.parse(saved) : {};
  });

  // Expiry Dates State ({ [reqId]: dateString })
  const [expiryDates, setExpiryDates] = useState(() => {
    const saved = localStorage.getItem('expiryDates');
    return saved ? JSON.parse(saved) : {};
  });

  // UI Processing and Toast States
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const t = translations[language] || translations.en;

  // LocalStorage Persistence Hook
  useEffect(() => {
    localStorage.setItem('app_language', language);
    if (tenderDetails) {
      localStorage.setItem('tenderDetails', JSON.stringify(tenderDetails));
    } else {
      localStorage.removeItem('tenderDetails');
    }

    if (requirements.length > 0) {
      localStorage.setItem('requirements', JSON.stringify(requirements));
    } else {
      localStorage.removeItem('requirements');
    }

    localStorage.setItem('matches', JSON.stringify(matches));
    localStorage.setItem('expiryDates', JSON.stringify(expiryDates));

    const serializableFiles = uploadedFiles.map(({ file, ...rest }) => rest);
    localStorage.setItem('uploadedFiles', JSON.stringify(serializableFiles));
  }, [language, tenderDetails, requirements, matches, expiryDates, uploadedFiles]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleMatchChange = (reqId, fileId) => {
    setMatches(prev => ({
      ...prev,
      [reqId]: fileId
    }));
  };

  const handleExpiryDateChange = (reqId, dateStr) => {
    setExpiryDates(prev => ({
      ...prev,
      [reqId]: dateStr
    }));
  };

  // ---------------------------------------------------------------------------
  // DYNAMIC FILE PROCESSING ENGINE
  // Extracts tender specification from uploaded requirements.json and processes PDFs
  // ---------------------------------------------------------------------------
  const handleFilesSelected = async (files) => {
    setIsProcessing(true);
    const newFilesBatch = [];
    const existingHashes = new Set(uploadedFiles.map(f => f.hash));
    let hasDuplicateInBatch = false;

    try {
      for (const file of files) {
        // 1. Process requirements.json Tender Specification
        if (file.name.endsWith('.json')) {
          try {
            const text = await file.text();
            const data = JSON.parse(text);

            const parsedTender = data.tender || (data.requirements ? data : null);
            const parsedReqs = data.requirements || [];

            if (parsedTender && Array.isArray(parsedReqs) && parsedReqs.length > 0) {
              setTenderDetails(parsedTender);
              setRequirements(parsedReqs);
              // Clear previous matches when a new JSON tender is uploaded
              setMatches({});
              setExpiryDates({});
              showToast(t.toastJsonSuccess, 'success');
            } else {
              showToast(t.toastInvalidFile, 'error');
            }
          } catch (err) {
            console.error('JSON parsing error:', err);
            showToast('Invalid JSON file format.', 'error');
          }
        } 
        // 2. Process PDF Documents with SHA-256 Hashing & pdfjs-dist Page Counting
        else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          const { hash, arrayBuffer } = await calculateFileHash(file);
          const isDuplicate = existingHashes.has(hash);
          if (isDuplicate) {
            hasDuplicateInBatch = true;
          }
          existingHashes.add(hash);

          const pageCount = await getPdfPageCount(arrayBuffer);

          const fileRecord = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            file,
            name: file.name,
            pageCount,
            hash,
            isDuplicate,
            size: file.size,
            uploadedAt: new Date().toISOString()
          };

          newFilesBatch.push(fileRecord);
        } else {
          showToast(`"${file.name}" - ${t.toastInvalidFile}`, 'error');
        }
      }

      if (newFilesBatch.length > 0) {
        setUploadedFiles(prev => [...prev, ...newFilesBatch]);
        if (hasDuplicateInBatch) {
          showToast(t.toastDuplicateDetected, 'warning');
        } else {
          showToast(t.toastPdfSuccess, 'success');
        }
      }
    } catch (error) {
      console.error('Error during file processing:', error);
      showToast('Error processing file upload.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(reqId => {
        if (next[reqId] === id) {
          delete next[reqId];
        }
      });
      return next;
    });
    showToast(t.toastFileRemoved, 'info');
  };

  const hasTenderLoaded = Boolean(tenderDetails && requirements.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-16 font-sans">
      {/* Clean Enterprise Light Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-2xs">
              TP
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[11px] text-slate-500">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <span className="text-xs">🌐</span>
              <span>{t.toggleLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-5 pt-6 space-y-6">
        {/* If no requirements.json uploaded yet, display clear guidance banner */}
        {!hasTenderLoaded && (
          <div className="p-5 bg-white border border-blue-200 rounded-lg text-center shadow-2xs">
            <div className="mx-auto w-8 h-8 mb-2 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="text-sm">📋</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              {t.uploadJsonFirstTitle}
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {t.uploadJsonFirstDesc}
            </p>
          </div>
        )}

        {/* Dynamic Rendering: ONLY render TenderDetails, MatchingEngine, and PackageGenerator when JSON is uploaded */}
        {hasTenderLoaded && (
          <>
            {/* 1. Tender Specifications */}
            <TenderDetails
              tenderDetails={tenderDetails}
              requirements={requirements}
              uploadedFiles={uploadedFiles}
              matches={matches}
              expiryDates={expiryDates}
              language={language}
            />

            {/* 2. Document Matching Engine */}
            <MatchingEngine
              requirements={requirements}
              uploadedFiles={uploadedFiles}
              matches={matches}
              onMatchChange={handleMatchChange}
              expiryDates={expiryDates}
              onExpiryDateChange={handleExpiryDateChange}
              submissionDeadline={tenderDetails?.submission_deadline || ''}
              language={language}
            />

            {/* 3. Package Generator */}
            <PackageGenerator
              tenderDetails={tenderDetails}
              requirements={requirements}
              uploadedFiles={uploadedFiles}
              matches={matches}
              expiryDates={expiryDates}
              language={language}
              showToast={showToast}
            />
          </>
        )}

        {/* Document Uploader */}
        <Uploader
          onFilesSelected={handleFilesSelected}
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
          isProcessing={isProcessing}
          language={language}
          hasTenderLoaded={hasTenderLoaded}
        />
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 max-w-sm ${
          toast.type === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : toast.type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-300'
            : toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-white text-slate-800 border-slate-300'
        }`}>
          <span>
            {toast.type === 'warning' ? '⚠' : toast.type === 'error' ? '✕' : toast.type === 'success' ? '✓' : 'ℹ'}
          </span>
          <span className="flex-1">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;