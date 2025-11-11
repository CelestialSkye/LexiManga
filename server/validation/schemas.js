const { z } = require('zod');

/**
 * Zod schemas for input validation
 * Ensures all API inputs are properly validated before processing
 */

// Translation request schema
const translateSchema = z.object({
  word: z.string()
    .min(1, 'Word cannot be empty')
    .max(100, 'Word must be less than 100 characters')
    .trim(),
  sourceLang: z.string()
    .length(2, 'Language code must be 2 characters')
    .uppercase(),
  targetLang: z.string()
    .length(2, 'Language code must be 2 characters')
    .uppercase(),
  context: z.string()
    .max(500, 'Context must be less than 500 characters')
    .optional(),
}).strict();

// Browse query schema
const browseSchema = z.object({
  search: z.string()
    .max(100, 'Search query must be less than 100 characters')
    .optional()
    .default(''),
  genres: z.string()
    .optional()
    .transform(val => val ? val.split(',').slice(0, 10) : []), // Max 10 genres
  format: z.enum(['TV', 'Movie', 'OVA', 'ONA', 'Manga', 'Unknown'], {
    errorMap: () => ({ message: 'Invalid format' })
  })
    .optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'], {
    errorMap: () => ({ message: 'Invalid status' })
  })
    .optional(),
  sort: z.string()
    .max(50, 'Invalid sort parameter')
    .optional()
    .default('TRENDING_DESC'),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(10),
  offset: z.number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .optional()
    .default(0),
}).strict();

// Manga by ID schema
const mangaIdSchema = z.object({
  id: z.string()
    .min(1, 'Manga ID cannot be empty')
    .max(20, 'Invalid manga ID')
    .regex(/^\d+$/, 'Manga ID must be numeric'),
}).strict();

// Trending query schema
const trendingSchema = z.object({
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(10),
}).strict();

// Monthly query schema
const monthlySchema = z.object({
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(10),
}).strict();

// Suggested query schema
const suggestedSchema = z.object({
  userId: z.string()
    .min(20, 'Invalid user ID format')
    .max(50, 'Invalid user ID format'),
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(10),
}).strict();

// reCAPTCHA verification schema
const recaptchaSchema = z.object({
  token: z.string()
    .min(20, 'Invalid reCAPTCHA token')
    .max(1000, 'Invalid reCAPTCHA token'),
}).strict();

/**
 * Validator helper function
 * Returns validation result with sanitized data or error
 */
const validateInput = (schema, data) => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors: messages };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
  }
};

module.exports = {
  translateSchema,
  browseSchema,
  mangaIdSchema,
  trendingSchema,
  monthlySchema,
  suggestedSchema,
  recaptchaSchema,
  validateInput,
};
