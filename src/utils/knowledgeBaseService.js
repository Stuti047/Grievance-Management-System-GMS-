import kbData from '../data/knowledgeBase.json';

/**
 * Service to query and navigate the Ask MRCMS Knowledge Base.
 * Adheres strictly to MITS-DU SLA and safety rules:
 * - Unverified entries are flagged with placeholder warnings.
 * - Sensitive queries (distress, ragging, harassment) trigger urgent safety protocols and helplines.
 * - Unknown questions return the official fallback with grievance filing options.
 */

export const KNOWLEDGE_BASE = kbData;

const STOPWORDS = new Set([
  'how', 'do', 'i', 'a', 'the', 'is', 'in', 'it', 'my', 'to', 'can', 'what', 
  'where', 'who', 'and', 'or', 'for', 'on', 'with', 'an', 'at', 'about', 'me'
]);

// Normalize text for token comparison
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

// Map KB category codes to application category IDs
export const CATEGORY_MAP = {
  'cat-mess': 'cat_mess',
  'cat-admin': 'cat_admin',
  'cat-events': 'cat_events',
  'cat-clubs': 'cat_clubs',
  'cat-other': 'cat_other'
};

/**
 * Find the best matching knowledge base entry for a query.
 */
export function queryKnowledgeBase(query) {
  if (!query || typeof query !== 'string') {
    return {
      match: null,
      score: 0,
      safetyNotice: kbData.safetyNotice,
      fallbackText: kbData.fallback
    };
  }

  const queryLower = query.toLowerCase().trim();
  const queryTokens = tokenize(queryLower);
  const meaningfulTokens = queryTokens.filter(t => !STOPWORDS.has(t));

  // 1. Critical Check: Sensitive entries (ragging, abuse, distress, suicide, depression)
  // Must trigger immediately with 100% safety precision
  for (const entry of kbData.entries) {
    if (entry.sensitive && entry.keywords) {
      const sensitiveHit = entry.keywords.some(kw => {
        const kwLower = kw.toLowerCase();
        return queryLower.includes(kwLower) || queryTokens.includes(kwLower);
      });
      if (sensitiveHit) {
        return {
          match: entry,
          score: 1.0,
          isSensitive: true,
          safetyNotice: kbData.safetyNotice,
          relatedEntries: getRelatedEntries(entry.related)
        };
      }
    }
  }

  // 2. Score other entries using token discrimination and keyword relevance
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of kbData.entries) {
    let score = 0;
    const entryQuestionLower = entry.question.toLowerCase();
    const entryQuestionTokens = tokenize(entryQuestionLower).filter(t => !STOPWORDS.has(t));

    // Overlap of non-stopword question tokens
    const qOverlap = meaningfulTokens.filter(t => entryQuestionTokens.includes(t));
    score += qOverlap.length * 20;

    if (queryLower === entryQuestionLower) {
      score += 60;
    } else if (entryQuestionLower.includes(queryLower) && queryLower.length > 5) {
      score += 40;
    }

    // Check keywords matches
    if (Array.isArray(entry.keywords)) {
      for (const kw of entry.keywords) {
        const kwLower = kw.toLowerCase();
        const isStop = STOPWORDS.has(kwLower);
        if (queryLower.includes(kwLower) || queryTokens.includes(kwLower)) {
          score += isStop ? 2 : 18;
        }
      }
    }

    // Check topic match
    if (entry.topic) {
      const topicTokens = tokenize(entry.topic).filter(t => !STOPWORDS.has(t));
      const commonTopic = meaningfulTokens.filter(t => topicTokens.includes(t));
      score += commonTopic.length * 12;
    }

    // Check answer overlap
    if (entry.answer) {
      const answerTokens = tokenize(entry.answer).filter(t => !STOPWORDS.has(t));
      const commonAnswer = meaningfulTokens.filter(t => answerTokens.includes(t));
      score += Math.min(commonAnswer.length * 1.5, 12);
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Threshold to consider a valid answer
  const MATCH_THRESHOLD = 12;

  if (bestEntry && bestScore >= MATCH_THRESHOLD) {
    return {
      match: bestEntry,
      score: bestScore,
      isSensitive: Boolean(bestEntry.sensitive),
      safetyNotice: kbData.safetyNotice,
      relatedEntries: getRelatedEntries(bestEntry.related)
    };
  }

  return {
    match: null,
    score: bestScore,
    isSensitive: false,
    safetyNotice: kbData.safetyNotice,
    fallbackText: kbData.fallback
  };
}

/**
 * Retrieve related entry objects by their IDs
 */
export function getRelatedEntries(relatedIds = []) {
  if (!Array.isArray(relatedIds)) return [];
  return relatedIds
    .map(id => kbData.entries.find(e => e.id === id))
    .filter(Boolean);
}

/**
 * Retrieve all entries grouped by topic/category
 */
export function getAllKnowledgeEntries() {
  return kbData.entries;
}

/**
 * Get an entry by its ID
 */
export function getEntryById(id) {
  return kbData.entries.find(e => e.id === id) || null;
}
