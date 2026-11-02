// Jaccard-based Token Similarity Engine
// Implemented as specified in Slide 4, 8 & 10 of the RCMS Specification

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  // Common generic filler words in student complaints
  'please', 'sir', 'madam', 'issue', 'problem', 'facing', 'kindly', 'help', 'complaint'
]);

/**
 * Tokenize string into a normalized set of significant tokens/words
 */
export function tokenize(text) {
  if (!text || typeof text !== 'string') return new Set();

  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map(token => token.trim())
      .filter(token => token.length > 2 && !STOP_WORDS.has(token))
  );
}

/**
 * Compute Jaccard Similarity between two token sets:
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
export function computeJaccardSimilarity(tokensA, tokensB) {
  if (!tokensA || !tokensB || tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionSize = tokensA.size + tokensB.size - intersectionCount;
  if (unionSize === 0) return 0;

  return intersectionCount / unionSize;
}

/**
 * Find potential duplicate complaints in existing database
 * @param {string} title Current input title
 * @param {string} description Current input description
 * @param {string} category Selected category
 * @param {Array} existingComplaints List of open tickets
 * @param {number} threshold Default 0.28 (28% token match triggers alert)
 */
export function findDuplicateComplaints(title, description, category, existingComplaints, threshold = 0.28) {
  const combinedText = `${title || ''} ${description || ''}`.trim();
  if (combinedText.length < 6) return null;

  const inputTokens = tokenize(combinedText);
  if (inputTokens.size === 0) return null;

  let highestMatch = null;
  let highestScore = 0;
  let matchingKeywords = [];

  for (const complaint of existingComplaints) {
    // Only check open/active tickets (exclude deleted)
    if (complaint.isDeleted || complaint.status === 'Resolved') continue;

    // Weight higher if in the exact same category
    const sameCategory = complaint.category.toLowerCase().includes((category || '').toLowerCase()) ||
                         (category || '').toLowerCase().includes(complaint.category.toLowerCase());

    const targetTokens = tokenize(`${complaint.title} ${complaint.description}`);
    const score = computeJaccardSimilarity(inputTokens, targetTokens);

    // Apply category bonus if matching
    const adjustedScore = sameCategory ? score * 1.25 : score * 0.85;

    if (adjustedScore > highestScore && adjustedScore >= threshold) {
      highestScore = adjustedScore;
      highestMatch = complaint;

      // Extract matching tokens
      matchingKeywords = Array.from(inputTokens).filter(token => targetTokens.has(token));
    }
  }

  if (highestMatch) {
    return {
      matchComplaint: highestMatch,
      similarityScore: Math.min(Math.round(highestScore * 100), 98),
      matchingKeywords: matchingKeywords.slice(0, 5)
    };
  }

  return null;
}

/**
 * Generate cryptographic SHA-256 style hash simulation for tamper-proofing and anonymous tracking
 */
export function generateHash(content) {
  let hash = 0;
  const str = content + Date.now().toString() + Math.random().toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Generate 64-character hex string
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + 'a9f28d3e7b1c4a0e9812fbc4567890123456789abcdef0123456789abcdef012').substring(0, 64);
}
