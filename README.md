# Tender Package Builder & Compliance Engine

A modern, client-side Single Page Application (React + Vite) designed to streamline tender document verification, cryptographic duplicate detection, interactive document matching, and automated compliance checking.

---

## 🚀 Main Features

1. **Interactive Document Matching Engine (`MatchingEngine.jsx`)**:
   - Maps unique uploaded PDF documents to specific tender requirements via interactive dropdowns.
   - Excludes duplicate files (`isDuplicate: true`) from mapping options.
   - Enforces 1-to-1 mapping constraints so a single file cannot be mapped to multiple requirements simultaneously.
   - Dynamically reveals an expiry date picker whenever a requirement specifies `has_expiry === true`.

2. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses native browser Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and within multi-file selection batches, highlighting duplicate files with high-visibility flags.

3. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background.
   - Extracts total page counts for every uploaded document without blocking the UI rendering thread.

4. **Automated Tender Compliance & Status Engine**:
   - Compares matched documents and selected expiry dates against submission deadlines to compute real-time statuses (`OK`, `Missing`, `Expired`, `Expiry Date Needed`, `Not Provided`).

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

> "Create a new component called MatchingEngine.jsx. It should take requirements, uploadedFiles, and language as props. For each requirement, render a dropdown containing the uploadedFiles (exclude duplicates) so the user can map a file to a document. Ensure one file can only map to one requirement. If a requirement has has_expiry === true, dynamically reveal a date input field for the user to select an expiry date. Store these mappings in matches and expiryDates state objects in App.jsx."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **PDF Processing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
