// This is a backup of the working Korean Medical Insurance Extractor
import { performBatchOCR } from '../../lib/ocr';
import { pdfToImages } from '../../lib/pdf';

/**
 * Korean Medical Insurance Form Extractor
 * Specialized for extracting information from Korean medical insurance forms
 */
class KoreanMedicalInsuranceExtractor {
  constructor() {
    // Korean medical form patterns
    this.patterns = {
      // Policyholder and Insured Information
      policyownerName: [
        /(?:보험계약자\s*성명|Name of Policyowner|Contract Holder)[\s:：]*([가-힣A-Za-z\s]+)/gi,
        /(?:계약자|Policyowner)[\s:：]*([가-힣A-Za-z\s]+)/gi
      ],
      
      insuredName: [
        /(?:피보험자\s*성명|Name of Insured|Insured Person)[\s:：]*([가-힣A-Za-z\s]+)/gi,
        /(?:피보험자|Insured)[\s:：]*([가-힣A-Za-z\s]+)/gi
      ],
      
      occupation: [
        /(?:직업|Occupation|Job)[\s:：]*([가-힣A-Za-z\s]+)/gi,
        /(?:직종|업무|Work)[\s:：]*([가-힣A-Za-z\s]+)/gi
      ],
      
      hkidPassport: [
        /(?:HKID|Passport|신분증번호|여권번호|ID Number)[\s:：]*([A-Za-z0-9()\s-]+)/gi,
        /(?:신분증|여권|ID)[\s:：]*([A-Za-z0-9()\s-]+)/gi,
        /([A-Z]{1,2}[0-9]{6,8}\([0-9A-Z]\))/g
      ],
      
      dateOfBirth: [
        /(?:생년월일|Date of Birth|Birth Date|DOB)[\s:：]*([0-9\s\-/.년월일]+)/gi,
        /([0-9]{1,2}[/\-.][0-9]{1,2}[/\-.][0-9]{4})/g,
        /([0-9]{4}[/\-.][0-9]{1,2}[/\-.][0-9]{1,2})/g,
        /([0-9]{1,2}[/\-.][0-9]{1,2}[/\-.][0-9]{1,2})/g
      ],
      
      // Hospital information
      hospitalName: [
        /(?:병원명|의료기관명|HOSPITAL NAME|Hospital)[\s:：]+([^\n\r]+)/gi,
        /([\w\s]+(?:병원|의원|클리닉|센터|Hospital|Clinic|Center|Medical))/gi,
        /([가-힣]+(?:대학교|종합|병원|의원|클리닉))/gi,
        /(?:Hospital|Medical|Clinic|Healthcare)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      hospitalId: [
        /(?:요양기관번호|기관번호|HOSPITAL ID)[\s:：]+([0-9]+)/gi,
        /([0-9]{8,})/g,
        /(?:Branch code|Location|ID)[\s:：]*([0-9A-Za-z]+)/gi
      ],
      
      hospitalAddress: [
        /(?:병원\s*주소|의료기관\s*주소|Hospital Address)[\s:：]*([^\n\r]+)/gi,
        /(?:주소|Address)[\s:：]*([가-힣A-Za-z0-9\s,.-]+)/gi
      ],
      
      // Patient information
      patientName: [
        /(?:환자명|환자성명|성\s*명|이\s*름|Patient|PATIENT NAME)[\s:：]*([가-힣A-Za-z\s]{2,})/gi,
        /성명[\s:：]*([가-힣A-Za-z\s]+)/gi,
        /(?:Patient Name|Name|Claimant)[\s:：]*([A-Za-z\s]+)/gi,
        /(?:benefit|claim|patient)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      patientIdNumber: [
        /(?:주민등록번호|주민번호|ID NUMBER|등록번호)[\s:：]*([0-9*-]{13,})/gi,
        /([0-9]{6}[-*][0-9*]{7})/g,
        /(?:Policy|Member|ID|Certificate)[\s:：]*([A-Za-z0-9-]+)/gi
      ],
      
      // Contact information
      address: [
        /(?:주소|거주지|ADDRESS|Address)[\s:：]+([^\n\r]+)/gi,
        /((?:서울|부산|대구|인천|광주|대전|울산|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n\r]*)/gi,
        /(?:Address|Location)[\s:：]*([A-Za-z0-9\s,.-]+)/gi
      ],
      
      phone: [
        /(?:전화번호|연락처|휴대폰|PHONE|Contact)[\s:：]*([0-9-]{10,})/gi,
        /([0-9]{2,3}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4})/g,
        /(?:Phone|Tel|Contact)[\s:：]*([0-9\s-+()]+)/gi
      ],
      
      // Medical information
      treatmentDate: [
        /(?:진료일자?|내원일자?|수진일자?|방문일자?|TREATMENT DATE|Visit Date)[\s:：]*([0-9.\-/년월일\s]{8,})/gi,
        /(20[0-9]{2}[.\-/\s]*[0-9]{1,2}[.\-/\s]*[0-9]{1,2})/g,
        /([0-9]{4}년[0-9]{1,2}월[0-9]{1,2}일)/g,
        /(?:Date|Treatment|Visit|Admission)[\s:：]*([0-9\s\-/.]+)/gi
      ],
      
      department: [
        /(?:진료과목?|진료과|과목|DEPARTMENT|Department)[\s:：]*([^\n\r]+)/gi,
        /(정형외과|내과|외과|소아과|산부인과|이비인후과|피부과|안과|치과|신경과|정신과|가정의학과|응급의학과)/gi,
        /(?:Department|Ward|Unit|Specialty)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      doctorName: [
        /(?:의사명|담당의|주치의|의료진|DOCTOR|Doctor|의사\s*성명)[\s:：]*([가-힣A-Za-z\s.]{2,})/gi,
        /(?:Dr.|Doctor|의사)\s*([가-힣A-Za-z\s.]+)/gi,
        /(?:Doctor's Name|Physician)[\s:：]*([A-Za-z\s.]+)/gi
      ],
      
      diagnosis: [
        /(?:상병명|진단명|질병명|병명|DIAGNOSIS|Diagnosis)[\s:：]*([^\n\r]+)/gi,
        /(?:진단|병명)[\s:：]*([^\n\r]+)/gi,
        /(?:Diagnosis|Condition|Disease|Illness)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      treatment: [
        /(?:치료내용|처치내용|시술내용|TREATMENT|Treatment)[\s:：]*([^\n\r]+)/gi,
        /(?:치료|처치|시술)[\s:：]*([^\n\r]+)/gi,
        /(?:Treatment|Procedure|Surgery|Therapy)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      prescription: [
        /(?:처방내용|처방전|약물|PRESCRIPTION|Prescription)[\s:：]*([^\n\r]+)/gi,
        /(?:처방|투약)[\s:：]*([^\n\r]+)/gi,
        /(?:Prescription|Medication|Medicine|Drug)[\s:：]*([A-Za-z\s]+)/gi
      ],
      
      // Financial information
      totalCost: [
        /(?:진료비\s*총액|총\s*진료비|진료비\s*합계|의료비\s*총액|TOTAL COST|Medical Fee)[\s:：]*([0-9,]+)(?:\s*원|KRW)?/gi,
        /총액[\s:：]*([0-9,]+)/gi,
        /([0-9,]+)\s*원(?:\s*총액)?/g,
        /(?:Total|Amount|Cost|Fee|Charge)[\s:：]*\$?([0-9,.]+)/gi
      ],
      
      patientPayment: [
        /(?:본인부담금|환자부담금?|개인부담|PATIENT PAYMENT|Co-payment)[\s:：]*([0-9,]+)(?:\s*원|KRW)?/gi,
        /본인부담[\s:：]*([0-9,]+)/gi,
        /부담금[\s:：]*([0-9,]+)/gi,
        /(?:Deductible|Copay|Patient Pay|Out of Pocket)[\s:：]*\$?([0-9,.]+)/gi
      ],
      
      insuranceClaim: [
        /(?:보험청구액?|급여청구|보험급여|INSURANCE CLAIM|Insurance Amount)[\s:：]*([0-9,]+)(?:\s*원|KRW)?/gi,
        /(?:보험|급여)[\s:：]*([0-9,]+)/gi,
        /청구[\s:：]*([0-9,]+)/gi,
        /(?:Claim|Coverage|Benefit|Reimbursement)[\s:：]*\$?([0-9,.]+)/gi
      ],
      
      // Banking Information
      accountHolderName: [
        /(?:예금주\s*성명|계좌명의인|Name of Account Holder|Account Name)[\s:：]*([가-힣A-Za-z\s]+)/gi,
        /(?:예금주|계좌주|Account Holder)[\s:：]*([가-힣A-Za-z\s]+)/gi
      ],
      
      currency: [
        /(?:통화|Currency)[\s:：]*([A-Z]{3}|원|달러|엔|HKD|USD|KRW|JPY)/gi,
        /(HKD|USD|KRW|JPY|EUR|GBP)/g
      ],
      
      bankName: [
        /(?:은행명|Bank Name|은행)[\s:：]*([가-힣A-Za-z\s]+(?:은행|Bank))/gi,
        /(?:Bank|은행)[\s:：]*([가-힣A-Za-z\s]+)/gi
      ],
      
      hkdBankAccount: [
        /(?:HKD\s*계좌번호|HKD Account|홍콩달러\s*계좌)[\s:：]*([0-9-]+)/gi,
        /HKD[\s:：]*([0-9-]+)/gi
      ],
      
      usdBankAccount: [
        /(?:USD\s*계좌번호|USD Account|달러\s*계좌)[\s:：]*([0-9-]+)/gi,
        /USD[\s:：]*([0-9-]+)/gi
      ],
      
      bankNumber: [
        /(?:은행번호|Bank No|Bank Code|SWIFT|BIC)[\s:：]*([A-Za-z0-9]+)/gi,
        /(?:Bank No|은행코드)[\s:：]*([0-9]+)/gi
      ],
      
      accountNumber: [
        /(?:계좌번호|Account Number|Account No)[\s:：]*([0-9-]+)/gi,
        /(?:계좌|Account)[\s:：]*([0-9-]+)/gi
      ],
      
      insuranceNumber: [
        /(?:보험증번호|가입자번호|피보험자번호|INSURANCE NUMBER)[\s:：]*([A-Za-z0-9-]+)/gi,
        /([A-Za-z0-9]{10,})/g,
        /(?:Policy|Certificate|Member|Group)[\s:：]*([A-Za-z0-9-]+)/gi
      ]
    };
    
    // Field importance weights
    this.fieldWeights = {
      // Personal Information
      policyownerName: 1.0,
      insuredName: 1.0,
      patientName: 1.0,
      occupation: 0.8,
      hkidPassport: 0.9,
      dateOfBirth: 0.8,
      patientIdNumber: 0.9,
      address: 0.7,
      phone: 0.7,
      
      // Hospital Information
      hospitalName: 1.0,
      hospitalId: 0.6,
      hospitalAddress: 0.7,
      doctorName: 0.8,
      
      // Medical Information
      treatmentDate: 0.9,
      department: 0.8,
      diagnosis: 0.9,
      treatment: 0.7,
      prescription: 0.5,
      
      // Financial Information
      totalCost: 1.0,
      patientPayment: 0.8,
      insuranceClaim: 0.9,
      
      // Banking Information
      accountHolderName: 0.9,
      currency: 0.8,
      bankName: 0.8,
      hkdBankAccount: 0.7,
      usdBankAccount: 0.7,
      bankNumber: 0.6,
      accountNumber: 0.8,
      insuranceNumber: 0.8
    };
    
    // Korean medical terms mapping
    this.medicalTerms = {
      '정형외과': 'Orthopedics',
      '내과': 'Internal Medicine',
      '외과': 'Surgery',
      '소아과': 'Pediatrics',
      '산부인과': 'Obstetrics and Gynecology',
      '이비인후과': 'ENT',
      '피부과': 'Dermatology',
      '안과': 'Ophthalmology',
      '치과': 'Dentistry',
      '신경과': 'Neurology',
      '정신과': 'Psychiatry',
      '가정의학과': 'Family Medicine',
      '응급의학과': 'Emergency Medicine'
    };
  }

  // Extract single field using patterns
  extractField(text, fieldName) {
    const patterns = this.patterns[fieldName];
    if (!patterns) return null;

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches[1]) {
        const value = matches[1].trim();
        if (value.length > 0) {
          return {
            value,
            confidence: 0.85,
            pattern: pattern.source
          };
        }
      }
    }
    return null;
  }

  // Clean and normalize text
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/[^\w\s가-힣\d.,:-]/g, ' ')  // Remove special characters but keep basic punctuation
      .replace(/\b[A-Z]{1,2}\b/g, ' ')  // Remove single/double isolated uppercase letters (OCR artifacts)
      .replace(/\b\d{1,2}\b(?!\d)/g, ' ')  // Remove isolated 1-2 digit numbers (likely OCR noise)
      .trim();
  }

  // Detect language
  detectLanguage(text) {
    const koreanChars = (text.match(/[가-힣]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const totalChars = koreanChars + englishChars;
    
    if (totalChars === 0) return 'unknown';
    
    const koreanRatio = koreanChars / totalChars;
    
    // Check for specific medical/insurance terms to help classification
    const hasKoreanMedicalTerms = /(?:병원|의원|환자|진료|치료|보험|청구)/i.test(text);
    const hasEnglishMedicalTerms = /(?:hospital|medical|patient|treatment|insurance|claim|benefit)/i.test(text);
    
    if (koreanRatio > 0.3 || hasKoreanMedicalTerms) return 'korean';
    if (koreanRatio > 0.1) return 'mixed';
    if (hasEnglishMedicalTerms) return 'english_medical';
    return 'english';
  }

  // Main parsing method
  parseKoreanMedicalForm(text) {
    const cleanedText = this.cleanText(text);
    console.log('Cleaned text preview:', cleanedText.substring(0, 200));
    
    const extracted = {};
    let totalScore = 0;
    let maxScore = 0;

    // Extract all fields
    for (const fieldName of Object.keys(this.patterns)) {
      const result = this.extractField(cleanedText, fieldName);
      
      if (result) {
        extracted[fieldName] = this.enhanceFieldValue(fieldName, result.value);
        const weight = this.fieldWeights[fieldName] || 0.5;
        totalScore += result.confidence * weight;
      }
      
      maxScore += this.fieldWeights[fieldName] || 0.5;
    }

    const accuracy = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      extractedData: extracted,
      accuracy: Math.round(accuracy),
      confidence: totalScore / Object.keys(this.patterns).length,
      fieldsFound: Object.keys(extracted).length,
      totalFields: Object.keys(this.patterns).length,
      language: this.detectLanguage(cleanedText),
      formType: 'korean_medical_insurance'
    };
  }

  // Enhance field values
  enhanceFieldValue(field, value) {
    // First clean the value
    let cleanValue = value.trim();
    
    switch (field) {
      case 'totalCost':
      case 'patientPayment':
      case 'insuranceClaim':
        // Extract numbers from currency values
        const numbers = cleanValue.match(/[0-9,.]+/);
        return numbers ? numbers[0].replace(/,/g, '') : cleanValue;
        
      case 'phone':
        // Extract phone numbers
        const phone = cleanValue.match(/[0-9\-\s()]+/);
        return phone ? phone[0].replace(/[^0-9-]/g, '') : cleanValue;
        
      case 'patientName':
      case 'doctorName':
        // Clean names - remove obvious OCR artifacts
        return cleanValue
          .replace(/\b[A-Z]{1,2}\b/g, '')  // Remove isolated caps
          .replace(/\d+/g, '')  // Remove numbers
          .replace(/\s+/g, ' ')
          .trim();
        
      case 'hospitalName':
        // Clean hospital names
        return cleanValue
          .replace(/\b[A-Z]{1,2}\s/g, '')  // Remove isolated caps at start of words
          .replace(/\s+/g, ' ')
          .trim();
        
      case 'treatmentDate':
        // Extract date patterns
        const dateMatch = cleanValue.match(/\d{4}[\s\-/]?\d{1,2}[\s\-/]?\d{1,2}|\d{1,2}[\s\-/]\d{1,2}[\s\-/]\d{4}/);
        return dateMatch ? dateMatch[0] : cleanValue;
        
      case 'department':
        for (const [korean, english] of Object.entries(this.medicalTerms)) {
          if (cleanValue.includes(korean)) {
            return `${korean} (${english})`;
          }
        }
        return cleanValue;
        
      default:
        return cleanValue;
    }
  }
}

/**
 * Main extraction function
 * @param {File} file - File to extract data from
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extraction result
 */
export async function extractFromDocument(file, options = {}) {
  const { 
    onProgress = () => {}
  } = options;

  const startTime = Date.now();
  const extractor = new KoreanMedicalInsuranceExtractor();
  
  try {
    console.log('🏥 Starting Korean medical form extraction...');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Fall back to local OCR extraction
    onProgress({ status: 'Converting document to images...', progress: 20 });
    
    let images = [];
    if (file.type === 'application/pdf') {
      images = await pdfToImages(file);
      console.log(`📄 Converted PDF to ${images.length} images`);
    } else if (file.type.startsWith('image/')) {
      images = [{ dataUrl: URL.createObjectURL(file), pageNumber: 1 }];
      console.log('🖼️ Processing single image');
    } else {
      throw new Error('Unsupported file type');
    }

    // Perform OCR on all images
    onProgress({ status: 'Performing OCR on document...', progress: 40 });
    
    const ocrResults = await performBatchOCR(images, {
      lang: 'kor+eng', // Use Korean + English for better recognition
      psm: 6,
      onProgress: (ocrProgress) => {
        onProgress({
          status: `Processing page ${ocrProgress.page}/${ocrProgress.total}...`,
          progress: 40 + (ocrProgress.progress * 0.4),
          page: ocrProgress.page,
          total: ocrProgress.total
        });
      }
    });

    // Combine all OCR text
    const validResults = ocrResults.filter(result => result && result.text);
    const combinedText = validResults.length > 0 
      ? validResults.map(result => result.text).join('\n\n')
      : '';
    console.log('Combined OCR text length:', combinedText.length);
    console.log('Valid OCR results:', validResults.length, 'of', ocrResults.length);

    // Parse the Korean medical form
    onProgress({ status: 'Parsing Korean medical form...', progress: 90 });
    
    const parseResult = extractor.parseKoreanMedicalForm(combinedText);
    
    console.log('Parsing completed:');
    console.log(`  - Accuracy: ${parseResult.accuracy}%`);
    console.log(`  - Fields found: ${parseResult.fieldsFound}/${parseResult.totalFields}`);
    console.log(`  - Language: ${parseResult.language}`);

    // Clean up image URLs
    images.forEach(img => {
      if (img.dataUrl && img.dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.dataUrl);
      }
    });

    onProgress({ status: 'Extraction completed!', progress: 100 });

    return {
      success: true,
      data: parseResult.extractedData,
      accuracy: parseResult.accuracy,
      confidence: Math.round(parseResult.confidence * 100),
      metadata: {
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
        language: parseResult.language,
        formType: parseResult.formType,
        fieldsExtracted: parseResult.fieldsFound,
        totalFields: parseResult.totalFields,
        processingTime: Date.now() - startTime,
        method: 'local_ocr',
        ocrResults: ocrResults.length
      },
      debug: {
        ocrText: combinedText.substring(0, 500),
        parseStats: {
          accuracy: parseResult.accuracy,
          fieldsFound: parseResult.fieldsFound,
          totalFields: parseResult.totalFields
        }
      }
    };

  } catch (error) {
    console.error('❌ Extraction failed:', error);
    
    return {
      success: false,
      error: error.message,
      metadata: {
        filename: file.name,
        fileSize: file.size,
        fileType: file.type,
        processingTime: Date.now() - startTime,
        method: 'failed'
      }
    };
  }
}

/**
 * Validate extraction result
 * @param {Object} result - Extraction result to validate
 * @returns {Object} Validation result
 */
export function validateExtractionResult(result) {
  if (!result || !result.success || !result.data) {
    return {
      isValid: false,
      score: 0,
      issues: ['Extraction failed or returned no result'],
      suggestions: ['Try re-uploading the document', 'Ensure the document is a Korean medical insurance form']
    };
  }

  const data = result.data;
  const accuracy = result.accuracy || 0;
  const metadata = result.metadata || {};
  
  let score = 0;
  const issues = [];
  const suggestions = [];

  // Required fields
  const requiredFields = ['patientName', 'hospitalName'];
  const importantFields = ['treatmentDate', 'department', 'totalCost'];
  const optionalFields = ['phone', 'address', 'diagnosis', 'treatment', 'prescription'];

  // Check required fields
  const missingRequired = requiredFields.filter(field => !data[field]);
  if (missingRequired.length > 0) {
    issues.push(`Missing required fields: ${missingRequired.join(', ')}`);
    suggestions.push('Ensure the document contains patient name and hospital information');
  } else {
    score += 40; // 40 points for required fields
  }

  // Important fields validation
  const missingImportant = importantFields.filter(field => !data[field]);
  if (missingImportant.length === 0) {
    score += 30; // 30 points for all important fields
  } else if (missingImportant.length <= 1) {
    score += 20; // 20 points for most important fields
    issues.push(`Missing some important fields: ${missingImportant.join(', ')}`);
  } else {
    score += 10; // 10 points for some important fields
    issues.push(`Missing multiple important fields: ${missingImportant.join(', ')}`);
    suggestions.push('Ensure the document is clear and contains medical treatment information');
  }

  // Optional fields bonus
  const presentOptional = optionalFields.filter(field => data[field]);
  score += Math.min(20, presentOptional.length * 7); // Up to 20 points for optional fields

  // Accuracy bonus
  if (accuracy >= 80) {
    score += 10;
  } else if (accuracy >= 60) {
    score += 5;
  } else if (accuracy < 40) {
    issues.push('Low extraction accuracy detected');
    suggestions.push('Document quality may be poor - try a clearer scan or photo');
  }

  // Language validation
  if (metadata.language === 'korean' || metadata.language === 'mixed' || metadata.language === 'english_medical') {
    score += 5; // Bonus for medical content
  } else if (metadata.language === 'english') {
    score += 3; // Partial bonus for English content (might be English medical form)
  } else {
    issues.push('Document does not appear to contain recognizable medical text');
    suggestions.push('Ensure this is a medical insurance form (Korean or English)');
  }

  // Final score calculation
  score = Math.min(100, Math.max(0, score));

  // Determine validation status
  const isValid = score >= 50 && missingRequired.length === 0;

  // Add general suggestions based on score
  if (score < 30) {
    suggestions.push('Consider uploading a different document or improving image quality');
  } else if (score < 60) {
    suggestions.push('Document partially processed - some information may be missing');
  }

  return {
    isValid,
    score,
    issues,
    suggestions,
    fieldCoverage: {
      required: requiredFields.length - missingRequired.length,
      important: importantFields.length - missingImportant.length,
      optional: presentOptional.length,
      total: Object.keys(data).length
    }
  };
}

export default KoreanMedicalInsuranceExtractor;
