import { z } from 'zod';

// File validation schema
export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: 'File size must be less than 20MB',
    })
    .refine(
      (file) => ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
      {
        message: 'File must be PDF, PNG, or JPEG format',
      }
    ),
});

// Extracted field validation
export const extractedFieldSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
  page: z.number().optional(),
  bbox: z.array(z.number()).length(4).optional(), // [x1, y1, x2, y2]
});

// Full extraction result schema
export const extractionResultSchema = z.object({
  document: z.object({
    type: z.literal('insurance_claim_form'),
    sourceFile: z.string(),
    pageCount: z.number(),
    extractedAt: z.string(),
  }),
  claim: z.object({
    policy: z.object({
      policyNumber: extractedFieldSchema,
      insurerName: extractedFieldSchema,
      product: extractedFieldSchema,
    }),
    claimant: z.object({
      fullName: extractedFieldSchema,
      dateOfBirth: extractedFieldSchema,
      phone: extractedFieldSchema,
      email: extractedFieldSchema,
      address: extractedFieldSchema,
      idNumber: extractedFieldSchema,
    }),
    incident: z.object({
      date: extractedFieldSchema,
      time: extractedFieldSchema,
      place: extractedFieldSchema,
      typeOfLoss: extractedFieldSchema,
      description: extractedFieldSchema,
    }),
    claimDetails: z.object({
      amountClaimed: extractedFieldSchema,
      currency: extractedFieldSchema,
      deductible: extractedFieldSchema,
      documentsProvided: z.object({
        value: z.array(z.string()),
        confidence: z.number().min(0).max(1),
      }),
    }),
    payee: z.object({
      bankName: extractedFieldSchema,
      accountName: extractedFieldSchema,
      accountNumber: extractedFieldSchema,
      iban: extractedFieldSchema,
    }),
    agentAdjuster: z.object({
      agentName: extractedFieldSchema,
      agentCode: extractedFieldSchema,
      adjusterName: extractedFieldSchema,
    }),
    authorization: z.object({
      signaturePresent: z.object({
        value: z.boolean(),
        confidence: z.number().min(0).max(1),
      }),
      signedDate: extractedFieldSchema,
    }),
  }),
  tables: z.array(z.object({
    name: z.string(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    confidence: z.number().min(0).max(1),
  })),
  rawText: z.string(),
  processing: z.object({
    engine: z.enum(['tesseract', 'service']),
    latencyMs: z.number(),
    errors: z.array(z.string()),
  }),
});
