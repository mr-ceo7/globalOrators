import { describe, test, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeMultiline,
  sanitizeEmail,
  validateEmail,
  sanitizePhone,
  validatePhone,
  validateName,
  sanitizeInteger,
} from '../utils/sanitization';

describe('Input Sanitization & Best Practices Unit Tests', () => {
  describe('sanitizeText', () => {
    test('strips HTML and script tags from single line input', () => {
      const malicious = '<script>alert("XSS")</script>Kwame Mensah <img src=x onerror=alert(1)>';
      expect(sanitizeText(malicious)).toBe('Kwame Mensah');
    });

    test('normalizes excessive spaces and trims', () => {
      const dirty = '   Kwame    Mensah   ';
      expect(sanitizeText(dirty)).toBe('Kwame Mensah');
    });

    test('enforces maxLength limit', () => {
      const longText = 'a'.repeat(200);
      expect(sanitizeText(longText, 50).length).toBe(50);
    });

    test('handles non-string types safely', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(12345)).toBe('');
    });
  });

  describe('sanitizeMultiline', () => {
    test('strips script and iframe blocks entirely', () => {
      const input = 'My goal is clear.\n<script>doEvil()</script>\nTo speak with impact.';
      expect(sanitizeMultiline(input)).toBe('My goal is clear.\n\nTo speak with impact.');
    });

    test('normalizes CRLF to LF and collapses excessive newlines', () => {
      const input = 'Paragraph 1\r\n\r\n\r\n\r\nParagraph 2';
      expect(sanitizeMultiline(input)).toBe('Paragraph 1\n\nParagraph 2');
    });
  });

  describe('sanitizeEmail & validateEmail', () => {
    test('sanitizes email to lowercase, trimmed, and strips forbidden chars', () => {
      const email = '  KWAME.Mensah+debate<tag>@GlobalOrators.ORG  ';
      expect(sanitizeEmail(email)).toBe('kwame.mensah+debatetag@globalorators.org');
    });

    test('validates standard email formats correctly', () => {
      expect(validateEmail('speaker@globalorators.org').isValid).toBe(true);
      expect(validateEmail('user.name+tag@sub.domain.co.ke').isValid).toBe(true);
    });

    test('rejects malformed email formats', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
      expect(validateEmail('user@domain..com').isValid).toBe(false);
      expect(validateEmail('user@domain.c').isValid).toBe(false); // TLD must be >= 2 chars
    });
  });

  describe('sanitizePhone & validatePhone', () => {
    test('sanitizes telephone input by stripping invalid letters and symbols', () => {
      const raw = '+254 (0) 700-123-456 ext 99 <script>';
      expect(sanitizePhone(raw)).toBe('+254 (0) 700-123-456 99');
    });

    test('validates valid phone numbers', () => {
      expect(validatePhone('+254700000000').isValid).toBe(true);
      expect(validatePhone('+1 (555) 234-5678').isValid).toBe(true);
      expect(validatePhone('').isValid).toBe(true); // Optional by default
    });

    test('rejects phones with too few digits', () => {
      expect(validatePhone('+254', true).isValid).toBe(false);
      expect(validatePhone('123').isValid).toBe(false);
    });
  });

  describe('validateName', () => {
    test('validates and trims names', () => {
      expect(validateName('Nia Adebayo').isValid).toBe(true);
      expect(validateName('   ').isValid).toBe(false);
      expect(validateName('A').isValid).toBe(false); // Below minLength
    });
  });

  describe('sanitizeInteger', () => {
    test('clamps numbers within range', () => {
      expect(sanitizeInteger(10, 12, 75, 20)).toBe(12);
      expect(sanitizeInteger(85, 12, 75, 20)).toBe(75);
      expect(sanitizeInteger('25', 12, 75, 20)).toBe(25);
      expect(sanitizeInteger('invalid', 12, 75, 20)).toBe(20);
    });
  });
});
