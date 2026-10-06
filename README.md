# Tender Package Builder & Compliance Engine

A modern, client-side Single Page Application (React + Vite) designed to streamline tender document verification, cryptographic duplicate detection, interactive document matching, automated compliance checking, and PDF package generation.

---

## 🚀 Main Features

1. **PDF Package Compiler (`packageGenerator.js` & `PackageGenerator.jsx`)**:
   - Uses `pdf-lib` to construct an official submission PDF.
   - **Cover Page (English)**: Generates Page 1 containing Tender ID, Title, Entity, Bidder, Deadline, and an Index of attached documents.
   - **Document Appending**: Appends every page of matched PDFs in requirement order.
   - **Footer Page Stamping**: Stamps every page with `<tender_id> | Page X of Y` footer.
   - **Blocking Enforcement**: Generation button is strictly **DISABLED** whenever any requirement has a blocking compliance status (`Missing`, `Expired`, `Expiry date needed`).
   - **Automatic Download**: Triggers a browser file download named `<tender_id>_Package.pdf`.

2. **Automated Status Engine (`statusEngine.js`)**:
   - Evaluates tender requirement compliance based on 5 strict rules:
     - `Missing`: Mandatory requirement with no matched file.
     - `Not provided`: Optional requirement with no matched file.
     - `Expiry date needed`: File matched and expiry required, but no date selected.
     - `Expired`: File matched and expiry date is strictly before the submission deadline (using `date-fns`).
     - `OK`: File matched and expiry date is on or after the submission deadline.

3. **Interactive Document Matching Engine (`MatchingEngine.jsx`)**:
   - Maps unique uploaded PDF documents to specific tender requirements via interactive dropdowns.
   - Excludes duplicate files (`isDuplicate: true`) from mapping options.
   - Enforces 1-to-1 mapping constraints so a single file cannot be mapped to multiple requirements simultaneously.
   - Dynamically reveals an expiry date picker whenever a requirement specifies `has_expiry === true`.

4. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses native browser Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and within multi-file selection batches, highlighting duplicate files with high-visibility flags.

5. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background.
   - Extracts total page counts for every uploaded document without blocking the UI rendering thread.

6. **LocalStorage Persistence & Instant Demo Data**:
   - State automatically persists across browser refreshes via `localStorage` (storing `uploadedFiles`, `matches`, `expiryDates`, `tenderDetails`, `requirements`).
   - Populates rich sample data on first load so judges never see a blank screen.

7. **Centralized Bilingual Support (English & Bangla)**:
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

> "Implement a GeneratePackage feature using pdf-lib. When the user clicks Generate (which must be disabled if any document has a blocking status like Missing, Expired, or Expiry date needed), create a new PDF. Page 1 must be a Cover Page (in English) displaying the Tender ID, Title, Entity, Bidder, Deadline, and an index of included files. Then, append every page of the matched PDFs in the correct order. Stamp a footer on every page reading '<tender_id> | Page X of Y'. Trigger a browser download named '<tender_id>_Package.pdf'."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **PDF Compilation**: `pdf-lib`
- **PDF Parsing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
