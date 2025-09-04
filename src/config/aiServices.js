// AI Services Configuration for better OCR and document understanding

export const AI_SERVICES = {
  // OpenAI GPT-4 Vision (Best accuracy)
  OPENAI_VISION: {
    name: 'OpenAI GPT-4 Vision',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-vision-preview',
    maxTokens: 4096,
    temperature: 0.1,
    cost: 'high',
    accuracy: 'excellent',
    speed: 'fast'
  },

  // Google Document AI (Specialized for documents)
  GOOGLE_DOCUMENT_AI: {
    name: 'Google Document AI',
    endpoint: 'https://documentai.googleapis.com/v1/projects/{project}/locations/{location}/processors/{processor}:process',
    processor: 'form-parser', // or 'ocr-processor'
    cost: 'medium',
    accuracy: 'excellent',
    speed: 'fast'
  },

  // AWS Textract (Good for forms and tables)
  AWS_TEXTRACT: {
    name: 'AWS Textract',
    endpoint: 'https://textract.{region}.amazonaws.com/',
    features: ['FORMS', 'TABLES', 'SIGNATURES'],
    cost: 'medium',
    accuracy: 'very-good',
    speed: 'fast'
  },

  // Azure Form Recognizer (Specialized for insurance forms)
  AZURE_FORM_RECOGNIZER: {
    name: 'Azure Form Recognizer',
    endpoint: 'https://{resource}.cognitiveservices.azure.com/formrecognizer/v2.1/prebuilt/invoice/analyze',
    model: 'prebuilt-invoice', // Can be customized for insurance
    cost: 'medium',
    accuracy: 'very-good',
    speed: 'fast'
  },

  // Anthropic Claude Vision (Good understanding)
  CLAUDE_VISION: {
    name: 'Claude 3 Vision',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    cost: 'medium',
    accuracy: 'excellent',
    speed: 'fast'
  },

  // Free/Local alternatives
  PADDLE_OCR: {
    name: 'PaddleOCR',
    type: 'local',
    model: 'paddleocr-server',
    languages: ['en', 'vi'],
    cost: 'free',
    accuracy: 'good',
    speed: 'medium'
  },

  EASYOCR: {
    name: 'EasyOCR',
    type: 'local',
    model: 'easyocr-python',
    languages: ['en', 'vi'],
    cost: 'free',
    accuracy: 'good',
    speed: 'medium'
  }
};

// Service priority order (best to fallback)
export const SERVICE_PRIORITY = [
  'OPENAI_VISION',
  'GOOGLE_DOCUMENT_AI',
  'AZURE_FORM_RECOGNIZER',
  'AWS_TEXTRACT',
  'CLAUDE_VISION',
  'PADDLE_OCR',
  'EASYOCR',
  'TESSERACT_JS' // Current fallback
];

// Specialized prompts for insurance forms
export const INSURANCE_PROMPTS = {
  OPENAI_VISION: `
    Analyze this insurance claim form image and extract structured data in JSON format.
    
    Focus on extracting:
    1. Policy information (number, insurer name, product type)
    2. Claimant details (name, DOB, contact info, address, ID)
    3. Incident information (date, time, place, description, type)
    4. Claim details (amount, currency, deductible)
    5. Payment info (bank, account details)
    6. Agent/adjuster information
    7. Authorization (signature, date)
    
    Return confidence scores (0-1) for each field.
    Handle Vietnamese and English text.
    If text is unclear, use context clues from surrounding text.
    
    Response format:
    {
      "claim": { /* structured data */ },
      "confidence": { /* field confidence scores */ },
      "rawText": "extracted text"
    }
  `,

  CLAUDE_VISION: `
    Extract insurance claim data from this document image.
    
    Parse carefully:
    - Policy numbers (often alphanumeric codes)
    - Names (Vietnamese and English)
    - Dates (various formats: DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY)
    - Currency amounts (VND, USD, with commas/dots)
    - Phone numbers (Vietnamese format)
    - Addresses (Vietnamese format)
    
    Return structured JSON with confidence scores.
  `,

  GOOGLE_DOCUMENT_AI: {
    // Uses Google's pre-trained form parser
    includeTextDetectionConfidenceScore: true,
    enableSymbolDetection: true,
    enableImageQualityScores: true
  }
};

export default AI_SERVICES;
