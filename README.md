# Tender Package Builder & Compliance Engine

A modern, client-side Single Page Application (React + Vite) designed to streamline tender document verification, cryptographic duplicate detection, and automated compliance checking.

---

## 🚀 Main Features

1. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses the native browser Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and within multi-file selection batches, highlighting duplicate files with high-visibility flags.

2. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background.
   - Extracts total page counts for every uploaded document without blocking the UI rendering thread.

3. **Automated Tender Compliance & Status Engine**:
   - Compares uploaded documents against tender requirements.
   - Evaluates mandatory vs optional documents, expiry dates against submission deadlines, and generates statuses (`OK`, `Missing`, `Expired`, `Expiry Date Needed`, `Not Provided`).

4. **LocalStorage Persistence & Instant Demo Data**:
   - State automatically persists across browser refreshes via `localStorage`.
   - Populates rich sample data on first load so judges never see a blank screen.

5. **Centralized Bilingual Support (English & Bangla)**:
   - Built-in central translation dictionary supporting English (`en`) and Bangla (`bn`).
   - Highly visible language switcher in the main header bar.

---

## ⭐ Bonus Features

- **Drag & Drop Dropzone**: Interactive dropzone supporting multi-file selection with active drag state and background processing spinner overlays.
- **Toast Notification System**: Self-dismissing toast alerts for file uploads, JSON specification loads, and duplicate file warnings.
- **One-Click SHA-256 Hash Copy**: Allows copying truncated SHA-256 hex hashes to clipboard.
- **Demo Reset Functionality**: Instant button to reset demo state back to standard sample tender data for live testing.

---

## 💡 Most Useful Prompt

> "Update App.jsx and Uploader.jsx to process the uploaded PDFs. When a PDF is uploaded, use the native crypto.subtle.digest('SHA-256') to generate a hash of the file buffer to detect duplicates. Then, use pdfjs-dist to silently load the PDF in the background and count the total number of pages. Store this data (file, name, pageCount, hash, isDuplicate) in the uploadedFiles state array. Ensure the UI clearly flags any file marked as isDuplicate"

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **PDF Processing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
