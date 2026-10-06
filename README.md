# Tender Package Builder & Compliance Engine

A professional, client-side Single Page Application (React + Vite) designed for office environments to streamline tender document parsing, cryptographic verification, compliance checking, and PDF package compilation.

---

## 🚀 Main Features

1. **Dynamic JSON Tender Loading (Zero Hardcoded Data)**:
   - The application strictly operates on user-uploaded `requirements.json` files.
   - Requirements, compliance checklists, matching engine, and package generator remain hidden until a valid `requirements.json` is provided.

2. **Clean Enterprise Light Layout**:
   - Designed for non-technical office workers with clean typography, compact spacing, and a crisp neutral palette.
   - All icons are strictly constrained to a maximum of `w-8 h-8` using Tailwind CSS.

3. **Interactive Document Matching Engine (`MatchingEngine.jsx`)**:
   - Maps unique uploaded PDF documents to specific tender requirements via dropdown selectors.
   - Excludes duplicate files (`isDuplicate: true`) from mapping options.
   - Enforces 1-to-1 mapping constraints so a single file cannot be mapped to multiple requirements.
   - Dynamically reveals an expiry date picker whenever a requirement specifies `has_expiry === true`.

4. **Automated Status Engine (`statusEngine.js`)**:
   - Evaluates compliance against 5 strict rules:
     - `Missing`: Mandatory requirement with no matched file.
     - `Not provided`: Optional requirement with no matched file.
     - `Expiry date needed`: File matched and expiry required, but no date entered.
     - `Expired`: File matched and expiry date is strictly before the submission deadline.
     - `OK`: File matched and expiry date is on or after the submission deadline.

5. **PDF Package Compiler (`packageGenerator.js` & `PackageGenerator.jsx`)**:
   - Compiles an official submission PDF using `pdf-lib`.
   - **Page 1 Cover Page (English)**: Generates a submission overview with Tender ID, Title, Entity, Bidder, Deadline, and an Index of attached documents.
   - **Page Appending**: Appends every page of matched PDFs in requirement order.
   - **Footer Stamping**: Stamps every page with `<tender_id> | Page X of Y` footer.
   - **Blocking Enforcement**: Generation button is disabled if any requirement has a blocking status (`Missing`, `Expired`, `Expiry date needed`).
   - Automatically downloads `<tender_id>_Package.pdf`.

6. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses native Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and flags them.

7. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background and display accurate page counts.

8. **Centralized Bilingual Support (English & Bangla)**:
   - Central dictionary supporting English (`en`) and Bangla (`bn`) with an instant language switcher in the header.

---

## ⭐ Bonus Features

- **Compact Drag & Drop Dropzone**: Streamlined dropzone supporting multi-file selection with loading overlays.
- **Office-Friendly Toast System**: Lightweight notification alerts for file uploads, JSON specification loads, and duplicate warnings.
- **Checksum Copy Tool**: Allows copying SHA-256 hex checksums to the clipboard.

---

## 💡 Most Useful Prompt

> "You broke the UI scaling and injected fake data. Fix the UI styling across all components immediately. 1) Remove all massive SVG icons; restrict any necessary icons to a maximum of w-8 h-8 using Tailwind. 2) Remove the dark mode theme and replace it with a clean, light-themed, compact enterprise layout suitable for non-technical office workers. 3) CRITICAL: Completely remove the 'Reset Demo Data' feature and the hardcoded 'IFT-2024-DEV-8891' tender data. The app MUST ONLY render data dynamically parsed from the user-uploaded requirements.json. Do not render any requirements or tender details until a JSON file is uploaded."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Enterprise Light Theme)
- **PDF Compilation**: `pdf-lib`
- **PDF Parsing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
