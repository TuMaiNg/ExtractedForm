import Tesseract from 'tesseract.js';

/**
 * Perform OCR on an image using Tesseract.js with enhanced settings
 * @param {string|File} image - Image source (data URL, File, or image element)
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export async function performOCR(image, options = {}) {
  const {
    lang = 'eng',
    psm = 6, // Page segmentation mode: 6 = Uniform block of text (better for forms)
    oem = 3, // OCR Engine Mode: 3 = Default, based on what is available
    onProgress = () => {},
  } = options;

  try {
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress(m.progress * 100);
        }
      },
    });

    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    
    // Enhanced parameters for better form recognition
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
      tessedit_ocr_engine_mode: oem,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:-/@()[]{}àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ ',
      preserve_interword_spaces: '1',
      tessedit_enable_dict_correction: '1',
    });

    const { data } = await worker.recognize(image);
    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence / 100, // Normalize to 0-1
      words: data.words.map(word => ({
        text: word.text,
        confidence: word.confidence / 100,
        bbox: {
          x1: word.bbox.x0,
          y1: word.bbox.y0,
          x2: word.bbox.x1,
          y2: word.bbox.y1,
        },
      })),
      paragraphs: data.paragraphs.map(para => ({
        text: para.text,
        confidence: para.confidence / 100,
        bbox: {
          x1: para.bbox.x0,
          y1: para.bbox.y0,
          x2: para.bbox.x1,
          y2: para.bbox.y1,
        },
      })),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

/**
 * Process multiple images with OCR
 * @param {Array} images - Array of image data URLs
 * @param {Object} options - OCR options
 * @returns {Promise<Array>} Array of OCR results
 */
export async function performBatchOCR(images, options = {}) {
  const results = [];
  const { onProgress = () => {} } = options;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    onProgress({ 
      page: i + 1, 
      total: images.length, 
      status: `Processing page ${i + 1}/${images.length}` 
    });

    try {
      const result = await performOCR(image.dataUrl, {
        ...options,
        onProgress: (progress) => onProgress({
          page: i + 1,
          total: images.length,
          status: `OCR page ${i + 1}/${images.length}`,
          progress,
        }),
      });

      results.push({
        pageNumber: image.pageNumber,
        ...result,
      });
    } catch (error) {
      console.error(`OCR failed for page ${i + 1}:`, error);
      results.push({
        pageNumber: image.pageNumber,
        text: '',
        confidence: 0,
        words: [],
        paragraphs: [],
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Clean and normalize OCR text
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
export function cleanOCRText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
}
