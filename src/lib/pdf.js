import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Convert PDF pages to images
 * @param {File} file - PDF file
 * @param {Object} options - Conversion options
 * @returns {Promise<Array>} Array of image data URLs
 */
export async function pdfToImages(file, options = {}) {
  const { scale = 2, maxPages = 10 } = options;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = Math.min(pdf.numPages, maxPages);
    const images = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const imageDataUrl = canvas.toDataURL('image/png');
      
      images.push({
        pageNumber: pageNum,
        dataUrl: imageDataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error(`Failed to convert PDF: ${error.message}`);
  }
}

/**
 * Get PDF metadata
 * @param {File} file - PDF file
 * @returns {Promise<Object>} PDF metadata
 */
export async function getPdfMetadata(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const metadata = await pdf.getMetadata();
    
    return {
      numPages: pdf.numPages,
      title: metadata.info?.Title || '',
      author: metadata.info?.Author || '',
      creator: metadata.info?.Creator || '',
      producer: metadata.info?.Producer || '',
      creationDate: metadata.info?.CreationDate || null,
      modificationDate: metadata.info?.ModDate || null,
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new Error(`Failed to get PDF metadata: ${error.message}`);
  }
}

/**
 * Create thumbnail from first page of PDF
 * @param {File} file - PDF file
 * @returns {Promise<string>} Thumbnail data URL
 */
export async function createPdfThumbnail(file) {
  try {
    const images = await pdfToImages(file, { scale: 0.5, maxPages: 1 });
    return images[0]?.dataUrl || null;
  } catch (error) {
    console.error('Error creating PDF thumbnail:', error);
    return null;
  }
}
