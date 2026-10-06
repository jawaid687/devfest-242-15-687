import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs-dist worker source for background rendering
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Silently loads a PDF in the background using pdfjs-dist and counts total pages.
 * @param {ArrayBuffer} arrayBuffer - The PDF file array buffer
 * @returns {Promise<number>} - Total number of pages in the PDF document
 */
export async function getPdfPageCount(arrayBuffer) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    return pdfDoc.numPages;
  } catch (error) {
    console.error('Error counting PDF pages via pdfjs-dist:', error);
    return 1; // Fallback to 1 page on error
  }
}
