# Tender Package Builder & Compliance Engine

A professional, client-side Single Page Application (React + Vite) designed for office environments to streamline tender document parsing, cryptographic verification, compliance checking, and PDF package compilation.

---

## 🚀 Main Features

1. **Strictly Light Mode & Enterprise-Clean Layout**:
   - Clean, light-themed, spacious enterprise layout suitable for non-technical office workers.
   - Built with pure Tailwind CSS, no dark mode, and zero bloated SVG icons.
   - Main wrapper styled with `min-h-screen bg-slate-50 text-slate-900 p-8 font-sans`.
   - Spacious uploader container styled with `max-w-4xl mx-auto p-10 bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-sm text-center mb-8`.

2. **Dynamic JSON Tender Loading (Zero Fake Data)**:
   - Operates strictly on user-uploaded `requirements.json` files.
   - Tender specifications, compliance checklist, matching engine, and package generator remain hidden until a valid `requirements.json` is uploaded.

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

## 💡 Most Useful Prompt

> "Your previous CSS update failed. The UI is still in dark mode and the SVGs are massive. Execute this EXACT hard-override immediately: 1. Delete ALL <svg> elements in Uploader.jsx and App.jsx. Do not use icons. Replace them with standard HTML text and a native <input type='file' multiple>. 2. Search for and DELETE every single bg-gray-800, bg-gray-900, bg-black, text-white, and dark: Tailwind class across the entire project. 3. Set the main App.jsx wrapper exactly to <div className='min-h-screen bg-slate-50 text-slate-900 p-8 font-sans'>. 4. Set the Uploader container exactly to <div className='max-w-4xl mx-auto p-10 bg-white border-2 border-dashed border-slate-300 rounded-xl shadow-sm text-center mb-8'>. Keep it strictly light mode, spacious, and enterprise-clean."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Tailwind v4 with `@tailwindcss/vite`, strictly light mode)
- **PDF Compilation**: `pdf-lib`
- **PDF Parsing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`
