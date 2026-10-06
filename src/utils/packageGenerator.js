import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generates a merged Tender Package PDF using pdf-lib.
 * 
 * Features:
 * 1. Creates a professional Cover Page in English containing:
 *    - Tender ID / Reference
 *    - Title
 *    - Procuring Entity
 *    - Bidder Name
 *    - Submission Deadline
 *    - Index of included documents with page counts.
 * 2. Appends matched PDF documents in requirement order.
 * 3. Stamps footer on every page reading '<tender_id> | Page X of Y'.
 * 4. Saves and triggers a browser file download named '<tender_id>_Package.pdf'.
 * 
 * @param {Object} params
 * @param {Object} params.tenderDetails - Tender metadata object
 * @param {Array} params.requirements - List of tender requirements
 * @param {Array} params.uploadedFiles - List of uploaded files
 * @param {Object} params.matches - Map of reqId -> fileId
 * @param {Object} params.expiryDates - Map of reqId -> expiryDate string
 */
export async function generateTenderPackage({
  tenderDetails = {},
  requirements = [],
  uploadedFiles = [],
  matches = {},
  expiryDates = {}
}) {
  // 1. Create a new PDF Document
  const mergedPdf = await PDFDocument.create();

  // Embed standard Helvetica fonts
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

  const tenderId = tenderDetails.tender_id || tenderDetails.reference_no || 'TENDER-2026';
  const tenderTitle = tenderDetails.title || 'Tender Package';
  const procuringEntity = tenderDetails.procuring_entity || tenderDetails.category || 'N/A';
  const bidderName = tenderDetails.bidder || 'Authorized Bidder';
  const deadline = tenderDetails.submission_deadline || 'N/A';

  // Build index of matched files
  const includedDocs = [];
  requirements.forEach((req, idx) => {
    const reqId = String(req.id || idx);
    const fileId = matches[reqId];
    const fileItem = uploadedFiles.find(f => String(f.id) === String(fileId));
    if (fileItem) {
      includedDocs.push({
        order: idx + 1,
        reqName: req.name,
        fileName: fileItem.name,
        pageCount: fileItem.pageCount || 1,
        hash: fileItem.hash || '',
        expiryDate: expiryDates[reqId] || ''
      });
    }
  });

  // ---------------------------------------------------------------------------
  // STEP 1: CREATE COVER PAGE (A4 size: 595.28 x 841.89 pt)
  // ---------------------------------------------------------------------------
  const coverPage = mergedPdf.addPage([595.28, 841.89]);
  const { width, height } = coverPage.getSize();

  // Header background accent bar
  coverPage.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.09, 0.14, 0.24) // Dark slate background
  });

  coverPage.drawText('TENDER PACKAGE SUBMISSION', {
    x: 40,
    y: height - 60,
    size: 22,
    font: fontBold,
    color: rgb(0.23, 0.51, 0.96) // Accent blue
  });

  coverPage.drawText('CONFIDENTIAL BID DOCUMENTATION', {
    x: 40,
    y: height - 85,
    size: 10,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.85)
  });

  // Tender Metadata Box
  let currentY = height - 160;

  coverPage.drawRectangle({
    x: 40,
    y: currentY - 120,
    width: width - 80,
    height: 130,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.93),
    borderWidth: 1
  });

  const metadataItems = [
    { label: 'Tender ID / Ref:', value: tenderId },
    { label: 'Tender Title:', value: tenderTitle },
    { label: 'Procuring Entity:', value: procuringEntity },
    { label: 'Bidder Name:', value: bidderName },
    { label: 'Submission Deadline:', value: deadline }
  ];

  let metaY = currentY - 20;
  metadataItems.forEach(item => {
    coverPage.drawText(item.label, {
      x: 55,
      y: metaY,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.35)
    });

    const valText = String(item.value).length > 50 ? String(item.value).substring(0, 47) + '...' : String(item.value);
    coverPage.drawText(valText, {
      x: 180,
      y: metaY,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1)
    });
    metaY -= 22;
  });

  // Index of Included Files Section
  currentY = metaY - 30;

  coverPage.drawText('INDEX OF INCLUDED DOCUMENTS', {
    x: 40,
    y: currentY,
    size: 13,
    font: fontBold,
    color: rgb(0.09, 0.14, 0.24)
  });

  currentY -= 15;
  coverPage.drawLine({
    start: { x: 40, y: currentY },
    end: { x: width - 40, y: currentY },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9)
  });

  currentY -= 25;

  if (includedDocs.length === 0) {
    coverPage.drawText('No documents attached.', {
      x: 40,
      y: currentY,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
  } else {
    includedDocs.forEach(doc => {
      coverPage.drawText(`${doc.order}. ${doc.reqName}`, {
        x: 45,
        y: currentY,
        size: 10,
        font: fontBold,
        color: rgb(0.15, 0.2, 0.3)
      });

      const detailStr = `File: ${doc.fileName} (${doc.pageCount} pgs)${doc.expiryDate ? ` | Expiry: ${doc.expiryDate}` : ''}`;
      coverPage.drawText(detailStr, {
        x: 60,
        y: currentY - 14,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55)
      });

      currentY -= 32;
    });
  }

  // Generation timestamp at bottom
  coverPage.drawText(`Generated on: ${new Date().toUTCString()}`, {
    x: 40,
    y: 50,
    size: 8,
    font: fontRegular,
    color: rgb(0.6, 0.6, 0.6)
  });

  // ---------------------------------------------------------------------------
  // STEP 2: APPEND MATCHED PDF PAGES IN ORDER
  // ---------------------------------------------------------------------------
  for (const req of requirements) {
    const reqId = String(req.id);
    const fileId = matches[reqId];
    const fileItem = uploadedFiles.find(f => String(f.id) === String(fileId));

    if (fileItem) {
      try {
        let pdfBytesToAppend = null;

        // If file object exists in runtime memory, read its arrayBuffer
        if (fileItem.file instanceof File || fileItem.file instanceof Blob) {
          pdfBytesToAppend = await fileItem.file.arrayBuffer();
        }

        if (pdfBytesToAppend) {
          const srcDoc = await PDFDocument.load(pdfBytesToAppend);
          const pageIndices = srcDoc.getPageIndices();
          const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
          copiedPages.forEach(p => mergedPdf.addPage(p));
        } else {
          // If no raw File buffer (e.g. sample demo data), generate clean sample document page
          const placeholderPage = mergedPdf.addPage([595.28, 841.89]);
          placeholderPage.drawRectangle({
            x: 30,
            y: 30,
            width: 595.28 - 60,
            height: 841.89 - 60,
            borderColor: rgb(0.8, 0.85, 0.9),
            borderWidth: 1
          });

          placeholderPage.drawText(`DOCUMENT: ${req.name.toUpperCase()}`, {
            x: 50,
            y: 780,
            size: 14,
            font: fontBold,
            color: rgb(0.09, 0.14, 0.24)
          });

          placeholderPage.drawText(`File Name: ${fileItem.name}`, {
            x: 50,
            y: 750,
            size: 10,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2)
          });

          placeholderPage.drawText(`SHA-256 Hash: ${fileItem.hash || 'N/A'}`, {
            x: 50,
            y: 730,
            size: 8,
            font: fontRegular,
            color: rgb(0.4, 0.4, 0.4)
          });

          placeholderPage.drawText(`[Attached Document Contents - ${fileItem.pageCount || 1} Pages]`, {
            x: 50,
            y: 680,
            size: 11,
            font: fontRegular,
            color: rgb(0.2, 0.4, 0.7)
          });
        }
      } catch (err) {
        console.error(`Failed to append PDF for requirement ${req.name}:`, err);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 3: STAMP FOOTER ON EVERY PAGE ('<tender_id> | Page X of Y')
  // ---------------------------------------------------------------------------
  const totalPages = mergedPdf.getPageCount();
  const pages = mergedPdf.getPages();

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    const footerText = `${tenderId} | Page ${pageNum} of ${totalPages}`;
    const pWidth = page.getWidth();

    // Draw line above footer
    page.drawLine({
      start: { x: 30, y: 30 },
      end: { x: pWidth - 30, y: 30 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85)
    });

    // Stamp footer text centered at bottom
    const textWidth = fontRegular.widthOfTextAtSize(footerText, 8);
    page.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 18,
      size: 8,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });
  });

  // ---------------------------------------------------------------------------
  // STEP 4: TRIGGER BROWSER DOWNLOAD ('<tender_id>_Package.pdf')
  // ---------------------------------------------------------------------------
  const finalPdfBytes = await mergedPdf.save();
  const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  
  const sanitizeTenderId = String(tenderId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizeTenderId}_Package.pdf`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
