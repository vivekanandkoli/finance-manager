import { getAllRecords } from '../db';
import { removeStopwords } from 'stopword';

/**
 * ML-Based Auto-Categorization Service
 * Browser-compatible version without natural library
 */

// Simple Naive Bayes Classifier (browser-compatible)
class SimpleBayesClassifier {
  constructor() {
    this.categories = {};
    this.vocabulary = new Set();
    this.totalDocs = 0;
  }

  addDocument(text, category) {
    if (!this.categories[category]) {
      this.categories[category] = {
        count: 0,
        words: {},
      };
    }

    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word) {
        this.vocabulary.add(word);
        this.categories[category].words[word] = 
          (this.categories[category].words[word] || 0) + 1;
      }
    });

    this.categories[category].count++;
    this.totalDocs++;
  }

  train() {
    // Training is implicit in addDocument
    console.log('✅ Classifier trained');
  }

  classify(text) {
    const words = text.toLowerCase().split(/\s+/);
    let bestCategory = null;
    let bestScore = -Infinity;

    for (const category in this.categories) {
      let score = Math.log(this.categories[category].count / this.totalDocs);

      words.forEach(word => {
        if (word) {
          const wordCount = this.categories[category].words[word] || 0;
          const totalWords = Object.values(this.categories[category].words)
            .reduce((a, b) => a + b, 0);
          
          // Laplace smoothing
          const probability = (wordCount + 1) / (totalWords + this.vocabulary.size);
          score += Math.log(probability);
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  getClassifications(text) {
    const words = text.toLowerCase().split(/\s+/);
    const scores = [];

    for (const category in this.categories) {
      let score = Math.log(this.categories[category].count / this.totalDocs);

      words.forEach(word => {
        if (word) {
          const wordCount = this.categories[category].words[word] || 0;
          const totalWords = Object.values(this.categories[category].words)
            .reduce((a, b) => a + b, 0);
          
          const probability = (wordCount + 1) / (totalWords + this.vocabulary.size);
          score += Math.log(probability);
        }
      });

      scores.push({ label: category, value: Math.exp(score) });
    }

    // Normalize scores to probabilities
    const total = scores.reduce((sum, s) => sum + s.value, 0);
    scores.forEach(s => s.value = s.value / total);

    return scores.sort((a, b) => b.value - a.value);
  }
}

// Simple Word Tokenizer
class SimpleTokenizer {
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
}

class CategorizationService {
  constructor() {
    this.classifier = new SimpleBayesClassifier();
    this.isTrained = false;
    this.tokenizer = new SimpleTokenizer();
    
    // Pre-defined merchant patterns
    this.merchantPatterns = this.initializeMerchantPatterns();
    
    // Category keywords
    this.categoryKeywords = this.initializeCategoryKeywords();
  }

  /**
   * Initialize merchant patterns for instant recognition
   */
  initializeMerchantPatterns() {
    return {
      'Food & Dining': [
        /^(mcdonald|kfc|pizza|burger|subway|starbucks|cafe|restaurant|foodpanda|swiggy|zomato|ubereats|dominos)/i,
        /^(dining|lunch|dinner|breakfast|snack|food court|canteen)/i,
      ],
      'Groceries': [
        /^(walmart|target|tesco|big ?c|lotus|7-?eleven|familymart|convenience|grocery|market|supermarket)/i,
        /^(fresh|vegetables|fruits|meat|dairy)/i,
      ],
      'Transportation': [
        /^(uber|lyft|grab|ola|taxi|bus|train|mrt|bts|metro|gas|fuel|petrol|parking)/i,
        /^(transport|travel|commute)/i,
      ],
      'Shopping': [
        /^(amazon|flipkart|lazada|shopee|ebay|mall|shopping|retail|store|boutique)/i,
        /^(clothing|shoes|fashion|electronics|gadgets)/i,
      ],
      'Entertainment': [
        /^(netflix|spotify|disney|hulu|prime|cinema|movie|theater|concert|game|gaming|steam)/i,
        /^(entertainment|music|video|streaming)/i,
      ],
      'Healthcare': [
        /^(hospital|clinic|pharmacy|doctor|medical|medicine|apollo|fortis|healthca?re)/i,
        /^(dental|optical|lab|checkup)/i,
      ],
      'Utilities': [
        /^(electricity|water|gas|internet|broadband|mobile|phone|bill|airtel|jio|vodafone)/i,
        /^(utility|service charge|maintenance)/i,
      ],
      'Rent': [
        /^(rent|lease|landlord|apartment|condo|housing)/i,
      ],
      'Investment': [
        /^(mutual fund|stock|equity|sip|elss|nps|ppf|fd|investment|zerodha|groww|upstox)/i,
      ],
      'Insurance': [
        /^(insurance|policy|premium|lic|hdfc life|icici pru|term)/i,
      ],
      'Education': [
        /^(school|college|university|course|tuition|udemy|coursera|education|learning)/i,
      ],
      'Salary': [
        /^(salary|payroll|income|wages|commission)/i,
      ],
      'Freelance': [
        /^(freelance|upwork|fiverr|client payment|consulting|project)/i,
      ],
    };
  }

  /**
   * Initialize category keywords for text analysis
   */
  initializeCategoryKeywords() {
    return {
      'Food & Dining': ['food', 'eat', 'restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'pizza', 'burger'],
      'Groceries': ['grocery', 'vegetables', 'fruits', 'market', 'supermarket', 'provisions'],
      'Transportation': ['taxi', 'uber', 'bus', 'train', 'fuel', 'gas', 'parking', 'travel'],
      'Shopping': ['shopping', 'clothes', 'shoes', 'electronics', 'gadget', 'purchase', 'buy'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'game', 'music', 'concert', 'show'],
      'Healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic'],
      'Utilities': ['electricity', 'water', 'internet', 'phone', 'mobile', 'utility', 'bill'],
      'Rent': ['rent', 'lease', 'apartment', 'house', 'housing'],
      'Investment': ['investment', 'stock', 'mutual', 'fund', 'sip', 'equity'],
      'Insurance': ['insurance', 'policy', 'premium', 'coverage'],
      'Education': ['education', 'course', 'tuition', 'school', 'college', 'learning'],
      'Salary': ['salary', 'income', 'wage', 'payroll'],
      'Freelance': ['freelance', 'consulting', 'project', 'client'],
    };
  }

  /**
   * Train the classifier from existing transactions
   */
  async trainFromHistory() {
    console.log('🤖 Training auto-categorization model...');
    
    const expenses = await getAllRecords('expenses');
    
    if (expenses.length < 10) {
      console.warn('⚠️ Not enough data to train. Need at least 10 transactions.');
      return false;
    }

    let trainingCount = 0;
    
    expenses.forEach(expense => {
      if (expense.category && expense.description) {
        const cleanText = this.preprocessText(expense.description);
        this.classifier.addDocument(cleanText, expense.category);
        trainingCount++;
      }
    });

    if (trainingCount < 10) {
      console.warn('⚠️ Not enough categorized transactions to train.');
      return false;
    }

    this.classifier.train();
    this.isTrained = true;
    
    console.log(`✅ Model trained on ${trainingCount} transactions`);
    return true;
  }

  /**
   * Predict category for a transaction
   * Returns: { category, confidence, method }
   */
  async predictCategory(description, amount = null) {
    if (!description) {
      return { 
        category: 'Uncategorized', 
        confidence: 0, 
        method: 'default',
      };
    }

    // Step 1: Try merchant pattern matching (highest confidence)
    const patternMatch = this.matchMerchantPattern(description);
    if (patternMatch) {
      return {
        category: patternMatch,
        confidence: 0.95,
        method: 'pattern',
      };
    }

    // Step 2: Try keyword matching
    const keywordMatch = this.matchKeywords(description);
    if (keywordMatch.confidence > 0.7) {
      return {
        category: keywordMatch.category,
        confidence: keywordMatch.confidence,
        method: 'keyword',
      };
    }

    // Step 3: Try ML classifier (if trained)
    if (this.isTrained) {
      const mlPrediction = this.classifyWithML(description);
      if (mlPrediction.confidence > 0.6) {
        return {
          category: mlPrediction.category,
          confidence: mlPrediction.confidence,
          method: 'ml',
        };
      }
    }

    // Step 4: Fallback - suggest based on amount patterns
    if (amount) {
      const amountCategory = this.categorizeByAmount(amount);
      if (amountCategory) {
        return {
          category: amountCategory,
          confidence: 0.4,
          method: 'amount',
        };
      }
    }

    return {
      category: 'Uncategorized',
      confidence: 0,
      method: 'none',
    };
  }

  /**
   * Match against merchant patterns
   */
  matchMerchantPattern(description) {
    const text = description.toLowerCase().trim();
    
    for (const [category, patterns] of Object.entries(this.merchantPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return category;
        }
      }
    }
    
    return null;
  }

  /**
   * Match keywords with scoring
   */
  matchKeywords(description) {
    const text = this.preprocessText(description);
    const tokens = this.tokenizer.tokenize(text);
    const cleanTokens = removeStopwords(tokens);
    
    const scores = {};
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      
      cleanTokens.forEach(token => {
        keywords.forEach(keyword => {
          const similarity = this.stringSimilarity(token, keyword);
          if (similarity > 0.8) {
            score += similarity;
          }
        });
      });
      
      if (score > 0) {
        scores[category] = score / cleanTokens.length;
      }
    }
    
    if (Object.keys(scores).length === 0) {
      return { category: null, confidence: 0 };
    }
    
    const bestMatch = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      category: bestMatch[0],
      confidence: Math.min(bestMatch[1], 0.9),
    };
  }

  /**
   * ML classification using Naive Bayes
   */
  classifyWithML(description) {
    const cleanText = this.preprocessText(description);
    const classifications = this.classifier.getClassifications(cleanText);
    
    if (classifications.length === 0) {
      return { category: null, confidence: 0 };
    }
    
    return {
      category: classifications[0].label,
      confidence: classifications[0].value,
    };
  }

  /**
   * Categorize based on amount patterns
   */
  categorizeByAmount(amount) {
    const numAmount = parseFloat(amount);
    
    if (numAmount > 10000) return 'Rent';
    if (numAmount > 5000) return 'Shopping';
    if (numAmount > 1000) return 'Groceries';
    if (numAmount > 500) return 'Food & Dining';
    if (numAmount > 100) return 'Transportation';
    
    return null;
  }

  /**
   * Preprocess text for ML
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   * Browser-compatible implementation
   */
  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance implementation
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Learn from user corrections (incremental learning)
   */
  async learnFromCorrection(description, correctCategory) {
    const cleanText = this.preprocessText(description);
    this.classifier.addDocument(cleanText, correctCategory);
    this.classifier.train();
    console.log(`📚 Learned: "${description}" → ${correctCategory}`);
  }

  /**
   * Get category suggestions (top 3)
   */
  async getSuggestions(description) {
    if (!this.isTrained) {
      await this.trainFromHistory();
    }

    const predictions = [];

    // Pattern match
    const pattern = this.matchMerchantPattern(description);
    if (pattern) {
      predictions.push({ category: pattern, confidence: 0.95, method: 'pattern' });
    }

    // Keyword match
    const keyword = this.matchKeywords(description);
    if (keyword.confidence > 0.5) {
      predictions.push({ 
        category: keyword.category, 
        confidence: keyword.confidence, 
        method: 'keyword',
      });
    }

    // ML predictions
    if (this.isTrained) {
      const cleanText = this.preprocessText(description);
      const mlResults = this.classifier.getClassifications(cleanText)
        .slice(0, 3)
        .map(c => ({
          category: c.label,
          confidence: c.value,
          method: 'ml',
        }));
      predictions.push(...mlResults);
    }

    // Remove duplicates and sort by confidence
    const unique = Array.from(
      new Map(predictions.map(p => [p.category, p])).values()
    ).sort((a, b) => b.confidence - a.confidence);

    return unique.slice(0, 3);
  }

  /**
   * Export model for persistence
   */
  exportModel() {
    return {
      classifier: this.classifier,
      isTrained: this.isTrained,
      version: '1.0',
      trainedAt: new Date().toISOString(),
    };
  }

  /**
   * Import model
   */
  importModel(model) {
    if (model.classifier) {
      this.classifier = model.classifier;
      this.isTrained = model.isTrained;
      console.log('✅ Model imported successfully');
    }
  }

  /**
   * Get model statistics
   */
  getStats() {
    return {
      isTrained: this.isTrained,
      categories: Object.keys(this.categoryKeywords),
      merchantPatterns: Object.keys(this.merchantPatterns).length,
    };
  }
}

// Singleton instance
export const categorizationService = new CategorizationService();
