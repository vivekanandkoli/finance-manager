import { describe, it, expect, beforeEach, vi } from 'vitest';
import { categorizationService } from '../categorizationService';

describe('CategorizationService', () => {
  beforeEach(() => {
    // Reset classifier
    categorizationService.isTrained = false;
  });

  describe('predictCategory', () => {
    it('should categorize food merchants correctly', async () => {
      const result = await categorizationService.predictCategory('McDonald\'s lunch');
      
      expect(result.category).toBe('Food & Dining');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.method).toBe('pattern');
    });

    it('should categorize grocery stores correctly', async () => {
      const result = await categorizationService.predictCategory('Walmart groceries');
      
      expect(result.category).toBe('Groceries');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should categorize transportation correctly', async () => {
      const result = await categorizationService.predictCategory('Uber ride to office');
      
      expect(result.category).toBe('Transportation');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should categorize entertainment services', async () => {
      const result = await categorizationService.predictCategory('Netflix subscription');
      
      expect(result.category).toBe('Entertainment');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle empty description', async () => {
      const result = await categorizationService.predictCategory('');
      
      expect(result.category).toBe('Uncategorized');
      expect(result.confidence).toBe(0);
    });

    it('should use amount for categorization when description is vague', async () => {
      const result = await categorizationService.predictCategory('Payment', 15000);
      
      expect(result.category).toBe('Rent');
      expect(result.method).toBe('amount');
    });
  });

  describe('matchMerchantPattern', () => {
    it('should match case-insensitive patterns', () => {
      expect(categorizationService.matchMerchantPattern('STARBUCKS COFFEE')).toBe('Food & Dining');
      expect(categorizationService.matchMerchantPattern('starbucks coffee')).toBe('Food & Dining');
    });

    it('should match partial merchant names', () => {
      expect(categorizationService.matchMerchantPattern('uber ride')).toBe('Transportation');
      expect(categorizationService.matchMerchantPattern('grab taxi')).toBe('Transportation');
    });

    it('should return null for unmatched patterns', () => {
      expect(categorizationService.matchMerchantPattern('Unknown Merchant')).toBeNull();
    });
  });

  describe('matchKeywords', () => {
    it('should match keywords in description', () => {
      const result = categorizationService.matchKeywords('bought groceries from local market');
      
      expect(result.category).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle stop words', () => {
      const result = categorizationService.matchKeywords('the food was very good at restaurant');
      
      expect(result.category).toBe('Food & Dining');
    });

    it('should return low confidence for unmatched text', () => {
      const result = categorizationService.matchKeywords('xyz abc def');
      
      expect(result.confidence).toBe(0);
    });
  });

  describe('getSuggestions', () => {
    it('should return top 3 suggestions', async () => {
      const suggestions = await categorizationService.getSuggestions('restaurant bill');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions[0]).toHaveProperty('category');
      expect(suggestions[0]).toHaveProperty('confidence');
      expect(suggestions[0]).toHaveProperty('method');
    });

    it('should sort suggestions by confidence', async () => {
      const suggestions = await categorizationService.getSuggestions('starbucks coffee');
      
      if (suggestions.length > 1) {
        expect(suggestions[0].confidence).toBeGreaterThanOrEqual(suggestions[1].confidence);
      }
    });
  });

  describe('learnFromCorrection', () => {
    it('should accept user corrections', async () => {
      await categorizationService.learnFromCorrection(
        'Payment to John',
        'Personal Transfer'
      );
      
      // After learning, should predict better
      const result = await categorizationService.predictCategory('Payment to Jane');
      // Confidence may improve after training
      expect(result).toBeDefined();
    });
  });

  describe('preprocessText', () => {
    it('should convert to lowercase', () => {
      const result = categorizationService.preprocessText('HELLO WORLD');
      expect(result).toBe('hello world');
    });

    it('should remove special characters', () => {
      const result = categorizationService.preprocessText('Hello@World#123!');
      expect(result).toBe('hello world 123');
    });

    it('should collapse multiple spaces', () => {
      const result = categorizationService.preprocessText('hello    world');
      expect(result).toBe('hello world');
    });
  });

  describe('categorizeByAmount', () => {
    it('should categorize large amounts as Rent', () => {
      expect(categorizationService.categorizeByAmount(15000)).toBe('Rent');
    });

    it('should categorize medium amounts as Shopping', () => {
      expect(categorizationService.categorizeByAmount(7000)).toBe('Shopping');
    });

    it('should categorize small amounts as Transportation', () => {
      expect(categorizationService.categorizeByAmount(150)).toBe('Transportation');
    });

    it('should return null for very small amounts', () => {
      expect(categorizationService.categorizeByAmount(50)).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return model statistics', () => {
      const stats = categorizationService.getStats();
      
      expect(stats).toHaveProperty('isTrained');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('merchantPatterns');
      expect(Array.isArray(stats.categories)).toBe(true);
    });
  });
});
