# Tender Package Builder & Compliance Engine

A professional, client-side Single Page Application (React + Vite) designed for office environments to streamline tender document parsing, cryptographic verification, compliance checking, and PDF package compilation.

---

## 🚀 Main Features

1. **Premium Modern Enterprise SaaS UI/UX**:
   - Built exclusively with light-mode Tailwind CSS with crisp whites, slate grays for text (`text-slate-900`, `text-slate-600`), and professional, muted blues (`text-blue-700`, `bg-blue-600`) for primary accents.
   - **Soft Modern Shadows & Rounded Corners**: Elevated all layout containers with smooth `rounded-2xl` borders, `shadow-md`, and hover state elevation (`hover:shadow-lg`).
   - **Subtle Smooth Transitions**: Integrated `transition-all duration-300 ease-in-out` across all interactive buttons, dropdown menus, date pickers, and the file upload drop-zone.
   - **Animated Status Badges**: Added Tailwind pulse (`animate-pulse`) and smooth fade-in (`animate-fade-in`) transitions to live status badges (`Missing`, `OK`, `Expired`, `Expiry date needed`) for polished real-time status feedback.

2. **PDF Package Compiler with Dynamic Title Resolution (`packageGenerator.js`)**:
   - Compiles an official submission PDF using `pdf-lib`.
   - **Page 1 Cover Page (English)**: Generates a submission overview with Tender ID, Title, Entity, Bidder, Deadline, and an Index of attached documents.
   - **Accurate Document Name Resolution**: Reads `requirement.title_en` (or `requirement.title_bn` in Bangla mode) with fallbacks, preventing `undefined` labels in the Cover Page Index.
   - **Page Appending**: Appends every page of matched PDFs in requirement order.
   - **Footer Stamping**: Stamps every page with `<tender_id> | Page X of Y` footer.
   - **Blocking Enforcement**: Generation button is disabled if any requirement has a blocking status (`Missing`, `Expired`, `Expiry date needed`).
   - Automatically downloads `<tender_id>_Package.pdf`.

3. **Dynamic JSON Tender Loading (Zero Fake Data)**:
   - Operates strictly on user-uploaded `requirements.json` files.
   - Tender specifications, compliance checklist, matching engine, and package generator remain hidden until a valid `requirements.json` is uploaded.

4. **Interactive Document Matching Engine (`MatchingEngine.jsx`)**:
   - Maps unique uploaded PDF documents to specific tender requirements via dropdown selectors.
   - Excludes duplicate files (`isDuplicate: true`) from mapping options.
   - Enforces 1-to-1 mapping constraints so a single file cannot be mapped to multiple requirements.
   - Dynamically reveals an expiry date picker whenever a requirement specifies `has_expiry === true`.

5. **Automated Status Engine (`statusEngine.js`)**:
   - Evaluates compliance against 5 strict rules:
     - `Missing`: Mandatory requirement with no matched file.
     - `Not provided`: Optional requirement with no matched file.
     - `Expiry date needed`: File matched and expiry required, but no date entered.
     - `Expired`: File matched and expiry date is strictly before the submission deadline.
     - `OK`: File matched and expiry date is on or after the submission deadline.

6. **SHA-256 Cryptographic Hashing & Duplicate Detection**:
   - Uses native Web Crypto API (`crypto.subtle.digest('SHA-256')`) to compute binary hashes of uploaded PDF buffers.
   - Automatically detects duplicate files across uploads and flags them with visual indicators.

7. **Silent Background PDF Page Counting**:
   - Integrates `pdfjs-dist` to parse uploaded PDF documents silently in the background and display accurate page counts.

8. **Centralized Bilingual Support (English & Bangla)**:
   - Central dictionary supporting English (`en`) and Bangla (`bn`) with an instant language switcher in the header.

---

## 🎁 Bonus Features

- **Pill-Style Compliance Status Badges**: Micro-dot status indicator badges styled with rounded-full geometry and custom alert pulses.
- **Micro-Interaction Polish**: Active button press scaling (`active:scale-95`), card hover elevation, and smooth focus-ring states for dropdowns and inputs.
- **Client-Side Privacy**: 100% in-browser processing with zero external server dependencies, protecting sensitive procurement and tender documents.

---

## 💡 Most Useful Prompt

> "Enhance the UI/UX of the application to look like a premium, modern enterprise SaaS product using only Tailwind CSS. CRITICAL INSTRUCTION: Do NOT alter, refactor, or touch any core React state, useEffect hooks, file hashing logic, status validation rules, or the pdf-lib generation code. Your changes must be 100% cosmetic. Implement the following UI upgrades: 1) Add subtle hover transitions (transition-all duration-300 ease-in-out) to all buttons, the file upload drop-zone, and dropdown menus. 2) Elevate the main layout containers with soft, modern shadows (shadow-md, hover:shadow-lg) and smooth rounded corners (rounded-xl or rounded-2xl). 3) Add a gentle Tailwind pulse or fade-in animation to the status badges (Missing/OK) so they transition smoothly when updated. 4) Refine the color palette using crisp whites, slate grays for text, and professional, muted blues for primary accents."

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Tailwind v4 with `@tailwindcss/vite`, strictly light mode)
- **PDF Compilation**: `pdf-lib`
- **PDF Parsing**: `pdfjs-dist`
- **Crypto Engine**: Web Crypto API (`crypto.subtle.digest`)
- **Date Engine**: `date-fns`

---

## 🏁 Final Submission Checklist & Verification

- [x] **Client-Side Single Page Application**: Pure React 19 + Vite architecture with zero external backends.
- [x] **Bilingual Support**: Dynamic toggle between English (`en`) and Bangla (`bn`).
- [x] **Light-Themed Enterprise UI**: Polished modern SaaS design with subtle hover transitions, soft shadows, and animated status badges.
- [x] **Dynamic Tender Loading**: Strictly parses user-uploaded `requirements.json` tender specifications.
- [x] **Compliance & Validation Engine**: Live validation of mandatory requirements and document expiration dates.
- [x] **PDF Package Compilation**: Cover page index, sequential PDF appending, and `<tender_id> | Page X of Y` footer stamping.
