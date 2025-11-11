import { describe, it, expect } from 'vitest';

/**
 * Utility Functions Tests
 * Tests common utility functions
 */

describe('Utility Functions', () => {
  // ============ Format Utils Tests ============
  describe('Format Utilities', () => {
    it('should format numbers with commas', () => {
      const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      };

      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123)).toBe('123');
    });

    it('should truncate long text', () => {
      const truncate = (text, length = 50) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
      };

      expect(truncate('Short')).toBe('Short');
      expect(truncate('a'.repeat(60), 50).length).toBe(53); // 50 + '...'
    });

    it('should format dates', () => {
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US');
      };

      const testDate = '2024-01-01';
      const formatted = formatDate(testDate);
      expect(formatted).toMatch(/\d+\/\d+\/\d+/);
    });
  });

  // ============ Validation Utils Tests ============
  describe('Validation Utilities', () => {
    it('should validate email addresses', () => {
      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });

    it('should validate URLs', () => {
      const validateURL = (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('invalid-url')).toBe(false);
    });

    it('should check for empty values', () => {
      const isEmpty = (value) => {
        return (
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)
        );
      };

      expect(isEmpty(null)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('value')).toBe(false);
      expect(isEmpty([1])).toBe(false);
    });
  });

  // ============ Data Transformation Tests ============
  describe('Data Transformation', () => {
    it('should merge objects deeply', () => {
      const deepMerge = (obj1, obj2) => {
        return {
          ...obj1,
          ...obj2,
          nested: {
            ...obj1.nested,
            ...obj2.nested,
          },
        };
      };

      const obj1 = { a: 1, nested: { b: 2 } };
      const obj2 = { c: 3, nested: { d: 4 } };
      const result = deepMerge(obj1, obj2);

      expect(result.a).toBe(1);
      expect(result.c).toBe(3);
      expect(result.nested.b).toBe(2);
      expect(result.nested.d).toBe(4);
    });

    it('should filter array by condition', () => {
      const items = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true },
      ];

      const activeItems = items.filter((item) => item.active);
      expect(activeItems.length).toBe(2);
      expect(activeItems[0].id).toBe(1);
    });

    it('should sort array by property', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];

      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Charlie');
    });
  });

  // ============ String Utils Tests ============
  describe('String Utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should convert to kebab-case', () => {
      const toKebabCase = (str) => {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      };

      expect(toKebabCase('helloWorld')).toBe('hello-world');
      expect(toKebabCase('HelloWorld')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      const removeSpecialChars = (str) => {
        return str.replace(/[^a-zA-Z0-9\s]/g, '');
      };

      expect(removeSpecialChars('Hello@World#123')).toBe('HelloWorld123');
      expect(removeSpecialChars('test@example.com')).toBe('testexamplecom');
    });
  });

  // ============ Math Utils Tests ============
  describe('Math Utilities', () => {
    it('should calculate average', () => {
      const average = (arr) => {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
      };

      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20])).toBe(15);
    });

    it('should find min and max', () => {
      const arr = [5, 2, 8, 1, 9, 3];
      const min = Math.min(...arr);
      const max = Math.max(...arr);

      expect(min).toBe(1);
      expect(max).toBe(9);
    });

    it('should calculate percentage', () => {
      const percentage = (part, total) => {
        return (part / total) * 100;
      };

      expect(percentage(50, 100)).toBe(50);
      expect(percentage(1, 4)).toBe(25);
    });
  });
});
