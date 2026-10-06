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
 * Pure light mode, spacious, enterprise-clean layout for office environments.
 * No SVGs or dark/text-white classes.
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
              // Clear previous mappings when a new specification is loaded
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
    <div className='min-h-screen bg-slate-50 text-slate-900 p-8 font-sans'>
      {/* Top Header Bar */}
      <div className="max-w-4xl mx-auto mb-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full mb-1.5 shadow-2xs">
            TP-SYSTEM
          </div>
          <h1 className="text-xl font-bold text-slate-900 m-0 tracking-tight">
            {t.appTitle}
          </h1>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            {t.appSubtitle}
          </p>
        </div>

        <div>
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-300 ease-in-out cursor-pointer active:scale-95"
          >
            {t.toggleLanguage}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {/* If no requirements.json uploaded yet, display clear guidance banner */}
        {!hasTenderLoaded && (
          <div className="max-w-4xl mx-auto p-8 bg-white border border-blue-200/80 rounded-2xl text-center shadow-md hover:shadow-lg transition-all duration-300 ease-in-out mb-8">
            <h2 className="text-sm font-bold text-slate-900 m-0">
              {t.uploadJsonFirstTitle}
            </h2>
            <p className="text-xs text-slate-600 m-0 mt-1.5 max-w-md mx-auto leading-relaxed">
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
      </div>

      {/* Floating Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-semibold max-w-sm transition-all duration-300 ease-in-out animate-fade-in ${
          toast.type === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-300'
            : toast.type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-300'
            : toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
            : 'bg-white text-slate-800 border-slate-300'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;