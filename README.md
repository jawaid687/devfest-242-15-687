# Tender Package Builder & Compliance Engine

A modern, client-side Single Page Application (React + Vite) designed to streamline tender document verification, cryptographic duplicate detection, interactive document matching, and automated compliance checking.

---

## 🚀 Main Features

1. **Automated Status Engine (`statusEngine.js`)**:
   - Evaluates tender requirement compliance based on 5 strict rules:
     - `Missing`: Mandatory requirement with no matched file.
     - `Not provided`: Optional requirement with no matched file.
     - `Expiry date needed`: File matched and expiry required, but no date selected.
     - `Expired`: File matched and expiry date is strictly before the submission deadline (using `date-fns`).
     - `OK`: File matched and expiry date is on or after the submission deadline.
   - Integrated into `MatchingEngine.jsx` and `TenderDetails.jsx` to render live compliance status badges next to every requirement.

2. **Interactive Document Matching Engine (`MatchingEngine.jsx`)**:
   - Maps unique uploaded PDF documents to specific tender requirements via interactive dropdowns.
   - Excludes duplicate files (`isDuplicate: true`) from mapping options.
   - Enforces 1-to-1 mapping constraints so a single file cannot be mapped to multiple requirements simultaneously.
   - Dynamically reveals an expiry date picker whenever a requirement specifies `has_expiry === true`.

3. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses native browser Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and within multi-file selection batches, highlighting duplicate files with high-visibility flags.

4. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background.
   - Extracts total page counts for every uploaded document without blocking the UI rendering thread.

5. **LocalStorage Persistence & Instant Demo Data**:
   - State automatically persists across browser refreshes via `localStorage` (storing `uploadedFiles`, `matches`, `expiryDates`, `tenderDetails`, `requirements`).
   - Populates rich sample data on first load so judges never see a blank screen.

6. **Centralized Bilingual Support (English & Bangla)**:
   - Built-in central translation dictionary supporting English (`en`) and Bangla (`bn`).
   - Highly visible language switcher in the main header bar.

---

## ⭐ Bonus Features

- **Drag & Drop Dropzone**: Interactive dropzone supporting multi-file selection with active drag state and background processing spinner overlays.
- **Toast Notification System**: Self-dismissing toast alerts for file uploads, JSON specification loads, mapping changes, and duplicate file warnings.
- **One-Click SHA-256 Hash Copy**: Allows copying truncated SHA-256 hex hashes to clipboard.
- **Demo Reset Functionality**: Instant button to reset demo state back to standard sample tender data for live testing.

---

## 💡 Most Useful Prompt

> "Create src/utils/statusEngine.js with a function that takes a requirement, matched file, expiry date, and submission deadline. It must return exactly one of these statuses based on the strict rules: 'Missing' (mandatory, no file), 'Not provided' (optional, no file), 'Expiry date needed' (has file and expiry flag, but no date), 'Expired' (expiry date is before deadline using date-fns), or 'OK' (matched, and expiry is on/after deadline). Integrate this function into MatchingEngine.jsx to display a live status badge next to every requirement."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **PDF Processing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
