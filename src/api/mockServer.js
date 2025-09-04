/**
 * Mock API server for insurance claim extraction
 * This simulates a real AI service for document processing
 */

// Mock API responses for different scenarios
const mockResponses = {
  success: {
    document: {
      type: "insurance_claim_form",
      sourceFile: "sample_claim.pdf", 
      pageCount: 1,
      extractedAt: new Date().toISOString()
    },
    claim: {
      policy: {
        policyNumber: { value: "POL-2024-123456", confidence: 0.95 },
        insurerName: { value: "Premium Insurance Corp", confidence: 0.92 },
        product: { value: "Auto Insurance Premium", confidence: 0.88 }
      },
      claimant: {
        fullName: { value: "John Michael Smith", confidence: 0.96 },
        dateOfBirth: { value: "15/03/1985", confidence: 0.91 },
        phone: { value: "+1 (555) 123-4567", confidence: 0.89 },
        email: { value: "john.smith@email.com", confidence: 0.94 },
        address: { value: "123 Main Street, Cityville, ST 12345", confidence: 0.87 },
        idNumber: { value: "DL123456789", confidence: 0.82 }
      },
      incident: {
        date: { value: "22/12/2024", confidence: 0.93 },
        time: { value: "14:30", confidence: 0.76 },
        place: { value: "Highway 95, Mile Marker 23", confidence: 0.84 },
        typeOfLoss: { value: "Vehicle Collision", confidence: 0.90 },
        description: { value: "Rear-end collision while stopped at traffic light. Minor damage to front bumper and headlight.", confidence: 0.78 }
      },
      claimDetails: {
        amountClaimed: { value: "$3,500.00", confidence: 0.92 },
        currency: { value: "USD", confidence: 0.98 },
        deductible: { value: "$500.00", confidence: 0.85 },
        documentsProvided: { value: ["Police Report", "Photos", "Repair Estimate"], confidence: 0.80 }
      },
      payee: {
        bankName: { value: "First National Bank", confidence: 0.88 },
        accountName: { value: "John Michael Smith", confidence: 0.94 },
        accountNumber: { value: "****-****-1234", confidence: 0.86 },
        iban: { value: "", confidence: 0 }
      },
      agentAdjuster: {
        agentName: { value: "Sarah Johnson", confidence: 0.89 },
        agentCode: { value: "AGT-7890", confidence: 0.84 },
        adjusterName: { value: "Mike Rodriguez", confidence: 0.87 }
      },
      authorization: {
        signaturePresent: { value: true, confidence: 0.91 },
        signedDate: { value: "23/12/2024", confidence: 0.88 }
      }
    },
    tables: [
      {
        name: "damaged_items",
        columns: ["Item", "Description", "Estimated Cost"],
        rows: [
          ["Front Bumper", "Cracked and scratched", "$800.00"],
          ["Headlight (Left)", "Broken lens and housing", "$450.00"],
          ["Paint Repair", "Touch-up front end", "$250.00"]
        ],
        confidence: 0.83
      }
    ],
    rawText: `INSURANCE CLAIM FORM

Policy Number: POL-2024-123456
Insurer: Premium Insurance Corp
Product: Auto Insurance Premium

CLAIMANT INFORMATION
Full Name: John Michael Smith
Date of Birth: 15/03/1985
Phone: +1 (555) 123-4567
Email: john.smith@email.com
Address: 123 Main Street, Cityville, ST 12345
ID Number: DL123456789

INCIDENT DETAILS
Date of Incident: 22/12/2024
Time: 14:30
Location: Highway 95, Mile Marker 23
Type of Loss: Vehicle Collision
Description: Rear-end collision while stopped at traffic light. Minor damage to front bumper and headlight.

CLAIM DETAILS
Amount Claimed: $3,500.00
Currency: USD
Deductible: $500.00
Documents Provided: Police Report, Photos, Repair Estimate

PAYMENT INFORMATION
Bank Name: First National Bank
Account Name: John Michael Smith
Account Number: ****-****-1234

AGENT/ADJUSTER
Agent Name: Sarah Johnson
Agent Code: AGT-7890
Adjuster: Mike Rodriguez

AUTHORIZATION
Signature: [Present]
Date Signed: 23/12/2024`,
    processing: {
      engine: "service",
      latencyMs: 1500,
      errors: []
    }
  },

  partial: {
    document: {
      type: "insurance_claim_form",
      sourceFile: "partial_claim.pdf",
      pageCount: 1,
      extractedAt: new Date().toISOString()
    },
    claim: {
      policy: {
        policyNumber: { value: "POL-UNCLEAR", confidence: 0.45 },
        insurerName: { value: "State Farm Insurance", confidence: 0.88 },
        product: { value: "", confidence: 0 }
      },
      claimant: {
        fullName: { value: "Jane Doe", confidence: 0.92 },
        dateOfBirth: { value: "", confidence: 0 },
        phone: { value: "555-0123", confidence: 0.67 },
        email: { value: "", confidence: 0 },
        address: { value: "456 Oak Avenue", confidence: 0.72 },
        idNumber: { value: "", confidence: 0 }
      },
      incident: {
        date: { value: "12/2024", confidence: 0.58 },
        time: { value: "", confidence: 0 },
        place: { value: "", confidence: 0 },
        typeOfLoss: { value: "Property Damage", confidence: 0.81 },
        description: { value: "Damage to vehicle", confidence: 0.65 }
      },
      claimDetails: {
        amountClaimed: { value: "$2,000", confidence: 0.76 },
        currency: { value: "USD", confidence: 0.95 },
        deductible: { value: "", confidence: 0 },
        documentsProvided: { value: [], confidence: 0 }
      },
      payee: {
        bankName: { value: "", confidence: 0 },
        accountName: { value: "", confidence: 0 },
        accountNumber: { value: "", confidence: 0 },
        iban: { value: "", confidence: 0 }
      },
      agentAdjuster: {
        agentName: { value: "", confidence: 0 },
        agentCode: { value: "", confidence: 0 },
        adjusterName: { value: "", confidence: 0 }
      },
      authorization: {
        signaturePresent: { value: false, confidence: 0.80 },
        signedDate: { value: "", confidence: 0 }
      }
    },
    tables: [],
    rawText: `CLAIM FORM
Policy: POL-UNCLEAR
Insurer: State Farm Insurance
Name: Jane Doe
Phone: 555-0123
Address: 456 Oak Avenue
Date: 12/2024
Type: Property Damage
Description: Damage to vehicle
Amount: $2,000`,
    processing: {
      engine: "service",
      latencyMs: 1200,
      errors: ["Low image quality detected", "Some text regions unclear"]
    }
  }
};

/**
 * Mock extraction API endpoint
 * @param {FormData} formData - Contains file and docType
 * @returns {Promise<Object>} Extraction result
 */
export async function mockExtractAPI(formData) {
  const file = formData.get('file');
  const docType = formData.get('docType');

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Validate input
  if (!file) {
    throw new Error('No file provided');
  }

  if (!docType || docType !== 'insurance_claim_form') {
    throw new Error('Invalid document type');
  }

  // Check file size (20MB limit)
  if (file.size > 20 * 1024 * 1024) {
    const error = new Error('File too large');
    error.status = 413;
    throw error;
  }

  // Check file type
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    const error = new Error('Unsupported file format');
    error.status = 400;
    throw error;
  }

  // Simulate different outcomes based on file name/size
  const fileName = file.name.toLowerCase();
  
  // Simulate service errors for testing
  if (fileName.includes('error') || fileName.includes('fail')) {
    const error = new Error('Service processing failed');
    error.status = 500;
    throw error;
  }

  // Return partial results for files with "partial" in name
  if (fileName.includes('partial') || fileName.includes('unclear')) {
    const result = { ...mockResponses.partial };
    result.document.sourceFile = file.name;
    return result;
  }

  // Return successful extraction
  const result = { ...mockResponses.success };
  result.document.sourceFile = file.name;
  
  // Add some randomness to confidence scores
  const addNoise = (obj) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        if (obj[key].confidence !== undefined) {
          // Add small random variation to confidence
          obj[key].confidence = Math.max(0.1, Math.min(1.0, 
            obj[key].confidence + (Math.random() - 0.5) * 0.1
          ));
        } else {
          addNoise(obj[key]);
        }
      }
    });
  };
  
  addNoise(result.claim);
  
  return result;
}

/**
 * Setup mock service worker or Express server
 * This would typically be in a separate file or service
 */
export function setupMockServer() {
  // For development, you can use MSW (Mock Service Worker)
  // or a simple Express server
  
  console.log('Mock API server setup for /api/extract endpoint');
  
  // Example Express.js endpoint:
  /*
  app.post('/api/extract', upload.single('file'), async (req, res) => {
    try {
      const formData = new FormData();
      formData.append('file', req.file);
      formData.append('docType', req.body.docType);
      
      const result = await mockExtractAPI(formData);
      res.json(result);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({
        message: error.message,
        code: status
      });
    }
  });
  */
}

/**
 * Client-side mock for testing (when no server available)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Mock response
 */
export async function mockFetch(endpoint, options) {
  if (endpoint.includes('/api/extract') && options.method === 'POST') {
    try {
      const result = await mockExtractAPI(options.body);
      return {
        ok: true,
        status: 200,
        json: async () => result
      };
    } catch (error) {
      return {
        ok: false,
        status: error.status || 500,
        statusText: error.message,
        json: async () => ({
          message: error.message,
          code: error.status || 500
        })
      };
    }
  }
  
  // Fall back to real fetch for other requests
  return fetch(endpoint, options);
}

export default mockExtractAPI;
