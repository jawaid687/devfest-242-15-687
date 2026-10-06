import React, { useState, useEffect } from 'react';
import TenderDetails from './components/TenderDetails';
import MatchingEngine from './components/MatchingEngine';
import Uploader from './components/Uploader';
import { calculateFileHash } from './utils/fileHasher';
import { getPdfPageCount } from './utils/pdfUtils';
import { translations } from './i18n/translations';
import { 
  INITIAL_SAMPLE_TENDER, 
  INITIAL_SAMPLE_REQUIREMENTS, 
  INITIAL_SAMPLE_UPLOADED_FILES,
  INITIAL_SAMPLE_MATCHES,
  INITIAL_SAMPLE_EXPIRY_DATES
} from './utils/sampleData';

/**
 * App Main Component
 * Manages global application state, bilingual dictionary context, localStorage sync,
 * background SHA-256 duplicate hashing, pdfjs-dist page counting, MatchingEngine,
 * and toast notifications.
 */
function App() {
  // ---------------------------------------------------------------------------
  // STATE INITIALIZATION WITH LOCALSTORAGE FALLBACK & SAMPLE DATA
  // ---------------------------------------------------------------------------
  
  // Language State ('en' | 'bn')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  // Tender Metadata State
  const [tenderDetails, setTenderDetails] = useState(() => {
    const saved = localStorage.getItem('tenderDetails');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_TENDER;
  });

  // Requirements List State
  const [requirements, setRequirements] = useState(() => {
    const saved = localStorage.getItem('requirements');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_REQUIREMENTS;
  });

  // Uploaded Files State Array (Contains: id, file, name, pageCount, hash, isDuplicate, size, uploadedAt)
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('uploadedFiles');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_UPLOADED_FILES;
  });

  // Mappings State ({ [reqId]: fileId })
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('matches');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_MATCHES;
  });

  // Expiry Dates State ({ [reqId]: dateString })
  const [expiryDates, setExpiryDates] = useState(() => {
    const saved = localStorage.getItem('expiryDates');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_EXPIRY_DATES;
  });

  // Processing & Toast UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const t = translations[language] || translations.en;

  // ---------------------------------------------------------------------------
  // LOCALSTORAGE PERSISTENCE HOOK
  // Synchronizes state to browser localStorage whenever data changes.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('app_language', language);
    localStorage.setItem('tenderDetails', JSON.stringify(tenderDetails));
    localStorage.setItem('requirements', JSON.stringify(requirements));
    localStorage.setItem('matches', JSON.stringify(matches));
    localStorage.setItem('expiryDates', JSON.stringify(expiryDates));
    
    // Strip non-serializable raw File objects before storing in localStorage
    const serializableFiles = uploadedFiles.map(({ file, ...rest }) => rest);
    localStorage.setItem('uploadedFiles', JSON.stringify(serializableFiles));
  }, [language, tenderDetails, requirements, matches, expiryDates, uploadedFiles]);

  /**
   * Helper function to show self-dismissing toast notifications.
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  /**
   * Handles mapping changes from MatchingEngine.
   */
  const handleMatchChange = (reqId, fileId) => {
    setMatches(prev => ({
      ...prev,
      [reqId]: fileId
    }));
  };

  /**
   * Handles expiry date changes from MatchingEngine.
   */
  const handleExpiryDateChange = (reqId, dateStr) => {
    setExpiryDates(prev => ({
      ...prev,
      [reqId]: dateStr
    }));
  };

  // ---------------------------------------------------------------------------
  // FILE PROCESSING ENGINE
  // Handles multi-file uploads, computes SHA-256 hash via crypto.subtle.digest,
  // runs silent background page counts using pdfjs-dist, and flags duplicates.
  // ---------------------------------------------------------------------------
  const handleFilesSelected = async (files) => {
    setIsProcessing(true);
    const newFilesBatch = [];

    // Track hashes to detect duplicates both against existing files and within current upload batch
    const existingHashes = new Set(uploadedFiles.map(f => f.hash));
    let hasDuplicateInBatch = false;

    try {
      for (const file of files) {
        // 1. Process JSON Tender Specification Files
        if (file.name.endsWith('.json')) {
          try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.tender && data.requirements) {
              setTenderDetails(data.tender);
              setRequirements(data.requirements);
              showToast(t.toastJsonSuccess, 'success');
            } else {
              showToast(t.toastInvalidFile, 'error');
            }
          } catch (err) {
            console.error('JSON parsing error:', err);
            showToast(t.toastInvalidFile, 'error');
          }
        } 
        // 2. Process PDF Documents with SHA-256 Hashing & pdfjs-dist Page Counting
        else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          // Step A: Calculate native Web Crypto SHA-256 hash & extract ArrayBuffer
          const { hash, arrayBuffer } = await calculateFileHash(file);

          // Step B: Check if hash already exists in uploadedFiles or current batch
          const isDuplicate = existingHashes.has(hash);
          if (isDuplicate) {
            hasDuplicateInBatch = true;
          }
          existingHashes.add(hash);

          // Step C: Silently load PDF in background using pdfjs-dist to count total pages
          const pageCount = await getPdfPageCount(arrayBuffer);

          // Step D: Build file record object with all required metadata
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

      // Update state if new PDF files were processed
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

  /**
   * Removes a file from uploadedFiles state and unlinks any active requirement mapping.
   */
  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    
    // Remove matches pointing to deleted file
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

  /**
   * Resets local state back to initial sample data for demonstration/testing.
   */
  const handleResetSampleData = () => {
    setTenderDetails(INITIAL_SAMPLE_TENDER);
    setRequirements(INITIAL_SAMPLE_REQUIREMENTS);
    setUploadedFiles(INITIAL_SAMPLE_UPLOADED_FILES);
    setMatches(INITIAL_SAMPLE_MATCHES);
    setExpiryDates(INITIAL_SAMPLE_EXPIRY_DATES);
    showToast('Reset to initial sample data', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 pb-16">
      {/* Navigation Header */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
              TP
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs text-slate-400">
                AI & Cryptographic Tender Compliance Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset Sample Data Button */}
            <button
              onClick={handleResetSampleData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              title="Reset state to initial sample data"
            >
              🔄 Reset Demo Data
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <span>🌐</span>
              <span>{t.toggleLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">
        {/* Tender Specification & Compliance Checklist */}
        <TenderDetails
          tenderDetails={tenderDetails}
          requirements={requirements}
          uploadedFiles={uploadedFiles}
          matches={matches}
          expiryDates={expiryDates}
          language={language}
        />

        {/* Interactive Matching Engine Component */}
        <MatchingEngine
          requirements={requirements}
          uploadedFiles={uploadedFiles}
          matches={matches}
          onMatchChange={handleMatchChange}
          expiryDates={expiryDates}
          onExpiryDateChange={handleExpiryDateChange}
          language={language}
        />

        {/* File Uploader & Document Analysis Section */}
        <Uploader
          onFilesSelected={handleFilesSelected}
          uploadedFiles={uploadedFiles}
          onRemoveFile={handleRemoveFile}
          isProcessing={isProcessing}
          language={language}
        />
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce-short transition-all ${
          toast.type === 'warning'
            ? 'bg-amber-900 text-amber-100 border-amber-700'
            : toast.type === 'error'
            ? 'bg-rose-900 text-rose-100 border-rose-700'
            : toast.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}>
          <span className="text-lg">
            {toast.type === 'warning' ? '⚠️' : toast.type === 'error' ? '❌' : toast.type === 'success' ? '✓' : 'ℹ️'}
          </span>
          <p className="text-xs font-semibold flex-1 leading-snug">{toast.message}</p>
          <button 
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;