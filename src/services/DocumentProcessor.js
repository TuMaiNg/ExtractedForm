import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

class DocumentProcessorService {
  constructor() {
    this.tesseractWorker = null;
  }

  async initializeTesseract() {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await Tesseract.createWorker();
      await this.tesseractWorker.loadLanguage('eng');
      await this.tesseractWorker.initialize('eng');
    }
    return this.tesseractWorker;
  }

  async processDocument(file) {
    try {
      const fileType = file.type;
      let extractedText = '';

      if (fileType === 'application/pdf') {
        extractedText = await this.processPDF(file);
      } else if (fileType.startsWith('image/')) {
        extractedText = await this.processImage(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      // Parse the extracted text to structure the data
      const structuredData = this.parseInsuranceClaimData(extractedText);
      
      return {
        success: true,
        data: {
          ...structuredData,
          rawText: extractedText
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processPDF(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';

          // If PDF text extraction doesn't yield much, try OCR on the page
          if (pageText.trim().length < 50) {
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            // Convert canvas to blob and process with OCR
            canvas.toBlob(async (blob) => {
              try {
                const ocrText = await this.processImage(blob);
                fullText += ocrText + ' ';
              } catch (ocrError) {
                console.warn('OCR processing failed for PDF page:', ocrError);
              }
            });
          }
        }

        resolve(fullText.trim());
      } catch (error) {
        reject(new Error(`PDF processing failed: ${error.message}`));
      }
    });
  }

  async processImage(file) {
    try {
      const worker = await this.initializeTesseract();
      const result = await worker.recognize(file);
      return result.data.text;
    } catch (error) {
      throw new Error(`Image OCR processing failed: ${error.message}`);
    }
  }

  parseInsuranceClaimData(text) {
    const data = {
      personalInfo: {},
      claimInfo: {},
      vehicleInfo: {},
      medicalInfo: {}
    };

    // Convert text to lowercase for pattern matching
    const lowerText = text.toLowerCase();

    // Personal Information Patterns
    const patterns = {
      // Personal Info
      fullName: /(?:name|full name|insured name|policyholder)[:\s]*([a-zA-Z\s]+?)(?:\n|date|address|phone|policy)/i,
      dateOfBirth: /(?:date of birth|dob|birth date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      address: /(?:address|street address|home address)[:\s]*([^\n]+?)(?:\n|phone|email|city)/i,
      phoneNumber: /(?:phone|telephone|mobile|contact)[:\s]*(\(?[\d\s\-\.\(\)]{10,})/i,
      email: /(?:email|e-mail)[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      policyNumber: /(?:policy number|policy no|policy #)[:\s]*([A-Z0-9\-]+)/i,

      // Claim Info
      claimNumber: /(?:claim number|claim no|claim #)[:\s]*([A-Z0-9\-]+)/i,
      dateOfIncident: /(?:date of incident|incident date|accident date|loss date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      claimType: /(?:type of claim|claim type|loss type)[:\s]*([^\n]+?)(?:\n|amount|description)/i,
      claimAmount: /(?:claim amount|amount|total)[:\s]*\$?([0-9,]+\.?\d*)/i,
      
      // Vehicle Info
      vehicleMake: /(?:make|vehicle make)[:\s]*([a-zA-Z]+)(?:\s|model|year)/i,
      vehicleModel: /(?:model|vehicle model)[:\s]*([a-zA-Z0-9\s]+?)(?:\n|year|vin|license)/i,
      vehicleYear: /(?:year|vehicle year)[:\s]*(\d{4})/i,
      licensePlate: /(?:license plate|plate number|license)[:\s]*([A-Z0-9\-\s]+)/i,
      vin: /(?:vin|vehicle identification)[:\s]*([A-Z0-9]{17})/i,

      // Medical Info
      hospital: /(?:hospital|clinic|medical facility)[:\s]*([^\n]+?)(?:\n|doctor|date)/i,
      doctorName: /(?:doctor|physician|dr\.)[:\s]*([a-zA-Z\s\.]+?)(?:\n|date|treatment)/i,
      treatmentDate: /(?:treatment date|visit date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      diagnosis: /(?:diagnosis|condition|injury)[:\s]*([^\n]+?)(?:\n|treatment|cost)/i,
      treatmentCost: /(?:treatment cost|medical cost|bill amount)[:\s]*\$?([0-9,]+\.?\d*)/i
    };

    // Extract data using patterns
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        
        // Categorize the data
        if (key.startsWith('vehicle')) {
          const fieldName = key.replace('vehicle', '').toLowerCase();
          data.vehicleInfo[fieldName === 'make' ? 'make' : fieldName === 'model' ? 'model' : fieldName === 'year' ? 'year' : fieldName] = value;
        } else if (['hospital', 'doctorName', 'treatmentDate', 'diagnosis', 'treatmentCost'].includes(key)) {
          data.medicalInfo[key] = value;
        } else if (['claimNumber', 'dateOfIncident', 'claimType', 'claimAmount'].includes(key)) {
          data.claimInfo[key] = value;
        } else {
          data.personalInfo[key] = value;
        }
      }
    });

    // Try to extract description from common patterns
    const descriptionPatterns = [
      /(?:description|details|what happened)[:\s]*([^\.]+?)(?:\.|claim|amount|signature)/i,
      /(?:incident description|loss description)[:\s]*([^\.]+?)(?:\.|claim|amount)/i
    ];

    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data.claimInfo.description = match[1].trim();
        break;
      }
    }

    // Clean up extracted data
    Object.keys(data).forEach(category => {
      Object.keys(data[category]).forEach(field => {
        if (data[category][field]) {
          data[category][field] = data[category][field]
            .replace(/[^\w\s@.\-\/\$,]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      });
    });

    return data;
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}

export default new DocumentProcessorService();
