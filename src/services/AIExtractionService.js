// AI Service Integration for better OCR and extraction

import { AI_SERVICES, SERVICE_PRIORITY, INSURANCE_PROMPTS } from '../config/aiServices';

export class AIExtractionService {
  constructor(apiKeys = {}) {
    this.apiKeys = apiKeys;
    this.retryAttempts = 3;
    this.timeout = 30000; // 30 seconds
  }

  async extractWithBestService(imageFile) {
    const errors = [];
    
    // Try services in priority order
    for (const serviceName of SERVICE_PRIORITY) {
      try {
        console.log(`Trying ${serviceName}...`);
        const result = await this.extractWithService(serviceName, imageFile);
        
        if (result && result.confidence > 0.6) {
          console.log(`✅ Success with ${serviceName} (confidence: ${result.confidence})`);
          return {
            ...result,
            service: serviceName,
            processingTime: Date.now() - this.startTime
          };
        }
      } catch (error) {
        console.warn(`❌ ${serviceName} failed:`, error.message);
        errors.push({ service: serviceName, error: error.message });
        continue;
      }
    }

    throw new Error(`All AI services failed: ${JSON.stringify(errors)}`);
  }

  async extractWithService(serviceName, imageFile) {
    this.startTime = Date.now();
    
    switch (serviceName) {
      case 'OPENAI_VISION':
        return this.extractWithOpenAI(imageFile);
      case 'GOOGLE_DOCUMENT_AI':
        return this.extractWithGoogleDocumentAI(imageFile);
      case 'AZURE_FORM_RECOGNIZER':
        return this.extractWithAzureFormRecognizer(imageFile);
      case 'AWS_TEXTRACT':
        return this.extractWithAWSTextract(imageFile);
      case 'CLAUDE_VISION':
        return this.extractWithClaude(imageFile);
      case 'PADDLE_OCR':
        return this.extractWithPaddleOCR(imageFile);
      case 'EASYOCR':
        return this.extractWithEasyOCR(imageFile);
      case 'TESSERACT_JS':
        return this.extractWithTesseract(imageFile);
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  async extractWithOpenAI(imageFile) {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const base64Image = await this.fileToBase64(imageFile);
    
    const payload = {
      model: AI_SERVICES.OPENAI_VISION.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: INSURANCE_PROMPTS.OPENAI_VISION
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: AI_SERVICES.OPENAI_VISION.maxTokens,
      temperature: AI_SERVICES.OPENAI_VISION.temperature
    };

    const response = await fetch(AI_SERVICES.OPENAI_VISION.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    return this.parseAIResponse(content, 'openai');
  }

  async extractWithGoogleDocumentAI(imageFile) {
    if (!this.apiKeys.google) {
      throw new Error('Google API key not configured');
    }

    const base64Image = await this.fileToBase64(imageFile);
    
    const endpoint = AI_SERVICES.GOOGLE_DOCUMENT_AI.endpoint
      .replace('{project}', this.apiKeys.googleProject)
      .replace('{location}', this.apiKeys.googleLocation || 'us')
      .replace('{processor}', this.apiKeys.googleProcessor);

    const payload = {
      document: {
        content: base64Image,
        mimeType: imageFile.type
      },
      ...AI_SERVICES.GOOGLE_DOCUMENT_AI
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.google}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Google Document AI error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseGoogleDocumentAIResponse(data);
  }

  async extractWithClaude(imageFile) {
    if (!this.apiKeys.anthropic) {
      throw new Error('Anthropic API key not configured');
    }

    const base64Image = await this.fileToBase64(imageFile);
    
    const payload = {
      model: AI_SERVICES.CLAUDE_VISION.model,
      max_tokens: AI_SERVICES.CLAUDE_VISION.maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: INSURANCE_PROMPTS.CLAUDE_VISION
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(AI_SERVICES.CLAUDE_VISION.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKeys.anthropic,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    return this.parseAIResponse(content, 'claude');
  }

  async extractWithPaddleOCR(imageFile) {
    // This would integrate with a PaddleOCR server/service
    // For now, throw error to fall back to next service
    throw new Error('PaddleOCR service not implemented yet');
  }

  async extractWithEasyOCR(imageFile) {
    // This would integrate with an EasyOCR server/service
    throw new Error('EasyOCR service not implemented yet');
  }

  async extractWithTesseract(imageFile) {
    // Use existing Tesseract.js implementation
    const { extractTextFromImage } = await import('../lib/ocr');
    const result = await extractTextFromImage(imageFile);
    
    // Parse the text using enhanced parser
    const { EnhancedInsuranceClaimParser } = await import('../features/extract/parsers/enhancedInsuranceClaim');
    const parser = new EnhancedInsuranceClaimParser();
    const parsed = parser.parseWithEnhancedRegex(result.text);
    
    return {
      ...parsed,
      rawText: result.text,
      confidence: result.confidence || 0.6,
      service: 'tesseract'
    };
  }

  async parseAIResponse(content, service) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          confidence: this.calculateOverallConfidence(parsed),
          service
        };
      }
      
      // If no JSON, fall back to text parsing
      const { EnhancedInsuranceClaimParser } = await import('../features/extract/parsers/enhancedInsuranceClaim');
      const parser = new EnhancedInsuranceClaimParser();
      return {
        ...parser.parseWithEnhancedRegex(content),
        rawText: content,
        confidence: 0.7, // AI extracted but no structured JSON
        service
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error(`Failed to parse ${service} response`);
    }
  }

  parseGoogleDocumentAIResponse(data) {
    const document = data.document;
    const text = document.text || '';
    
    // Extract form fields from Google Document AI response
    const fields = {};
    if (document.entities) {
      document.entities.forEach(entity => {
        const fieldName = entity.type;
        const fieldValue = entity.mentionText;
        const confidence = entity.confidence;
        
        fields[fieldName] = {
          value: fieldValue,
          confidence: confidence
        };
      });
    }

    // Map Google fields to our schema
    return this.mapGoogleFieldsToSchema(fields, text);
  }

  mapGoogleFieldsToSchema(fields, rawText) {
    // Map Google Document AI fields to our insurance claim schema
    // This is a simplified mapping - you'd need to customize based on your form
    return {
      claim: {
        policy: {
          policyNumber: fields.policy_number || { value: null, confidence: 0 },
          insurerName: fields.insurer_name || { value: null, confidence: 0 }
        },
        claimant: {
          fullName: fields.full_name || { value: null, confidence: 0 },
          dateOfBirth: fields.date_of_birth || { value: null, confidence: 0 },
          phone: fields.phone_number || { value: null, confidence: 0 },
          email: fields.email || { value: null, confidence: 0 }
        },
        // ... map other fields
      },
      rawText,
      confidence: this.calculateOverallConfidence({ claim: { policy: fields.policy_number } }),
      service: 'google'
    };
  }

  calculateOverallConfidence(parsed) {
    const fields = this.flattenObject(parsed);
    const confidenceValues = Object.values(fields)
      .filter(field => field && typeof field === 'object' && field.confidence !== undefined)
      .map(field => field.confidence);
    
    if (confidenceValues.length === 0) return 0.5;
    
    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  flattenObject(obj, prefix = '') {
    let flattened = {};
    
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, this.flattenObject(obj[key], prefix + key + '.'));
        } else {
          flattened[prefix + key] = obj[key];
        }
      }
    }
    
    return flattened;
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default AIExtractionService;
