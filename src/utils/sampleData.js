/**
 * Sample initialization data for empty localStorage states.
 * Ensures the application is immediately rich and interactive upon first load.
 */

export const INITIAL_SAMPLE_TENDER = {
  title: "Procurement of Enterprise Server Infrastructure & Cloud Hardware",
  reference_no: "IFT-2024-DEV-8891",
  category: "Information Technology & Data Centers",
  submission_deadline: "2026-11-15",
  budget: "$250,000 USD"
};

export const INITIAL_SAMPLE_REQUIREMENTS = [
  {
    id: "req_1",
    name: "Company Trade License & Registration",
    mandatory: true,
    has_expiry: true,
    description: "Valid commercial registration certificate from government authority."
  },
  {
    id: "req_2",
    name: "Tax Clearance Certificate (Current Year)",
    mandatory: true,
    has_expiry: true,
    description: "Income tax compliance certificate for current assessment year."
  },
  {
    id: "req_3",
    name: "Audited Financial Statement (Last 3 Years)",
    mandatory: true,
    has_expiry: false,
    description: "Audited balance sheet and profit/loss statement by chartered accountant."
  },
  {
    id: "req_4",
    name: "OEM Authorization & Partnership Letter",
    mandatory: false,
    has_expiry: true,
    description: "Manufacturer authorization form for server hardware supply."
  },
  {
    id: "req_5",
    name: "ISO 27001 Security Compliance Certificate",
    mandatory: false,
    has_expiry: true,
    description: "Information security management system certificate."
  }
];

export const INITIAL_SAMPLE_UPLOADED_FILES = [
  {
    id: "sample_file_1",
    name: "Company_Trade_License_2024.pdf",
    pageCount: 4,
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    isDuplicate: false,
    size: 245760,
    uploadedAt: "2026-10-06T10:00:00.000Z"
  },
  {
    id: "sample_file_2",
    name: "Tax_Clearance_Certificate.pdf",
    pageCount: 2,
    hash: "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
    isDuplicate: false,
    size: 112640,
    uploadedAt: "2026-10-06T10:05:00.000Z"
  },
  {
    id: "sample_file_3",
    name: "Tax_Clearance_Certificate_Copy.pdf",
    pageCount: 2,
    hash: "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589",
    isDuplicate: true,
    size: 112640,
    uploadedAt: "2026-10-06T10:10:00.000Z"
  },
  {
    id: "sample_file_4",
    name: "Audited_Financial_Statement_3Years.pdf",
    pageCount: 28,
    hash: "4f8490a6f44d5c900e408d6d5efda239276d1e4c76022e39e6a9f470a1a0f8b1",
    isDuplicate: false,
    size: 1548576,
    uploadedAt: "2026-10-06T10:15:00.000Z"
  }
];

export const INITIAL_SAMPLE_MATCHES = {
  req_1: "sample_file_1",
  req_2: "sample_file_2",
  req_3: "sample_file_4"
};

export const INITIAL_SAMPLE_EXPIRY_DATES = {
  req_1: "2027-05-30",
  req_2: "2026-12-31"
};
