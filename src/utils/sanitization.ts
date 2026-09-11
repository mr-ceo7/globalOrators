/**
 * Global Orators Platform - Input Sanitization & Validation Utilities
 * Enforces strict XSS prevention, whitespace normalization, length caps, and RFC validation.
 */

/**
 * Strips HTML tags, script blocks, and dangerous control characters from single-line text.
 * Trims and collapses multiple whitespace characters into a single space.
 */
export const sanitizeText = (value: unknown, maxLength = 120): string => {
  if (typeof value !== 'string') return '';
  
  return value
    // Remove script / style tags and their contents completely
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove control characters (except standard printable characters)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Collapse consecutive whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

/**
 * Sanitizes multiline text (e.g. textareas, custom pursuit notes).
 * Strips HTML/script tags, normalizes line breaks, and limits consecutive blank lines.
 */
export const sanitizeMultiline = (value: unknown, maxLength = 1000): string => {
  if (typeof value !== 'string') return '';

  return value
    // Remove script / style tags and their contents
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize CRLF to LF
    .replace(/\r\n|\r/g, '\n')
    // Remove control characters except newline and tab
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Collapse lines that were left with whitespace only
    .replace(/[ \t]+\n/g, '\n')
    // Prevent excessive blank lines (max 2 consecutive newlines)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
};

/**
 * Normalizes email address to lowercase, removes forbidden characters, and trims.
 */
export const sanitizeEmail = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  return value
    .toLowerCase()
    .trim()
    // Remove quotes, brackets, angle brackets, commas, semicolons, control chars, and spaces
    .replace(/[\s<>()\[\]\\,;:"\u0000-\u001F\u007F-\u009F]/g, '')
    .slice(0, 254);
};

/**
 * Validates an email address against standard RFC structure.
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const cleaned = email.trim();
  if (cleaned.length > 254) {
    return { isValid: false, error: 'Email address exceeds maximum length (254 characters).' };
  }

  // RFC-standard compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. orator@globalorators.org).' };
  }

  // Check TLD length (at least 2 characters) and reject double dots
  const parts = cleaned.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email structure.' };
  }

  const domain = parts[1];
  if (domain.includes('..') || !domain.includes('.')) {
    return { isValid: false, error: 'Please enter a valid domain name.' };
  }

  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Email top-level domain must be at least 2 characters.' };
  }

  return { isValid: true };
};

/**
 * Sanitizes phone numbers by allowing only valid telephony characters:
 * +, digits, spaces, parentheses, hyphens, and dots.
 */
export const sanitizePhone = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  return value
    // Allow +, digits, spaces, hyphens, parentheses, dots
    .replace(/[^\d+()\s\-.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 25);
};

/**
 * Validates a telephone number.
 */
export const validatePhone = (phone: string, required = false): { isValid: boolean; error?: string } => {
  const cleaned = phone ? phone.trim() : '';

  if (!cleaned) {
    if (required) {
      return { isValid: false, error: 'Phone number is required.' };
    }
    return { isValid: true };
  }

  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 7) {
    return { isValid: false, error: 'Phone number must contain at least 7 digits.' };
  }

  if (digits.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits.' };
  }

  // Check for forbidden characters
  if (/[^\d+()\s\-.]/.test(cleaned)) {
    return { isValid: false, error: 'Phone number contains invalid characters.' };
  }

  return { isValid: true };
};

/**
 * Validates a full name or organization name.
 */
export const validateName = (name: string, fieldName = 'Full name', minLength = 2, maxLength = 100): { isValid: boolean; error?: string } => {
  const cleaned = sanitizeText(name, maxLength);

  if (!cleaned) {
    return { isValid: false, error: `${fieldName} is required.` };
  }

  if (cleaned.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters.` };
  }

  return { isValid: true };
};

/**
 * Clamps and sanitizes integer values (such as age, cadence).
 */
export const sanitizeInteger = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return Math.max(min, Math.min(max, parsed));
    }
  }

  return fallback;
};
