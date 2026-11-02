/**
 * grievanceDraftingEngine.js
 * Local Rule-Based Grievance Structuring and Category Suggestion Engine.
 * 
 * Complies with strict MITS Institutional Rules:
 * - 100% client/server local execution. No external paid LLMs or data leaks.
 * - Does not invent MITS policies or make official institutional decisions.
 * - Transforms rough student bullet points into clear, formal grievance descriptions.
 * - Suggests suitable categories and priority levels with student confirmation.
 */

// Category keyword dictionary mapped to MITS Institutional categories
const CATEGORY_RULES = [
  {
    category: "Central Computer Centre & IT",
    section: "college",
    keywords: ["wifi", "internet", "lan", "computer", "lab pc", "software", "network", "server", "portal", "ims", "login failed", "cctv"],
    defaultPriority: "Medium"
  },
  {
    category: "Hostel Facilities & Maintenance",
    section: "hostel",
    keywords: ["hostel", "room", "bed", "geyser", "fan", "bathroom", "water tap", "washroom", "warden", "block", "cooler"],
    defaultPriority: "Medium"
  },
  {
    category: "Hostel Mess (Food & Hygiene)",
    section: "mess",
    keywords: ["mess", "food", "lunch", "dinner", "breakfast", "roti", "dal", "caterer", "hygiene", "stale", "uncooked", "insects"],
    defaultPriority: "High"
  },
  {
    category: "Examination & Evaluation",
    section: "academic",
    keywords: ["exam", "marks", "grade", "revaluation", "admit card", "hall ticket", "cgpa", "sgpa", "backlog", "result", "practical"],
    defaultPriority: "High"
  },
  {
    category: "Building & Campus Infrastructure",
    section: "college",
    keywords: ["light", "fan", "switchboard", "spark", "wiring", "ac", "air conditioner", "bench", "desk", "blackboard", "projector", "water cooler", "lift", "elevator"],
    defaultPriority: "Medium"
  },
  {
    category: "Campus Discipline & Ragging",
    section: "college",
    keywords: ["ragging", "bully", "harassment", "threat", "fight", "abuse", "discipline", "proctor"],
    defaultPriority: "Urgent"
  },
  {
    category: "Women Grievance & Guidance",
    section: "college",
    keywords: ["women", "girl", "safety", "stalking", "misconduct", "female", "redressal cell"],
    defaultPriority: "Urgent"
  },
  {
    category: "Administrative & Fee Disputes",
    section: "administrative",
    keywords: ["fee", "receipt", "challan", "dues", "scholarship", "bonafide", "tc", "migration", "documents", "registrar"],
    defaultPriority: "Medium"
  },
  {
    category: "Campus Medical & Health Services",
    section: "college",
    keywords: ["medical", "doctor", "dispensary", "sick", "first aid", "medicine", "health", "injury", "fever"],
    defaultPriority: "Urgent"
  },
  {
    category: "Training & Placement Cell",
    section: "college",
    keywords: ["placement", "interview", "company", "resume", "internship", "tpo", "drive", "job offer"],
    defaultPriority: "Medium"
  },
  {
    category: "Sanitation & Hygiene",
    section: "college",
    keywords: ["garbage", "dustbin", "cleanliness", "dirty", "toilet", "sweep", "drainage", "stink"],
    defaultPriority: "Medium"
  }
];

const URGENCY_TRIGGERS = [
  "urgent", "danger", "hazard", "fire", "spark", "electric shock", "hospital", "ragging", "threat", "injury", "bleeding", "food poisoning"
];

/**
 * Extracts potential campus location indicators from the text
 */
function extractLocation(text) {
  const match = text.match(/\b(lab\s*\d+|room\s*\d+|hostel\s*\d+|block\s*[a-z0-9]+|canteen|library|auditorium|workshop|ground|department\s*of\s*[a-z\s]+)\b/i);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Rule-based category classification from raw complaint text
 */
export function suggestCategoryAndPriority(text) {
  if (!text || typeof text !== 'string') {
    return {
      category: "Other / General Grievance",
      section: "college",
      priority: "Medium",
      confidence: "low"
    };
  }

  const lower = text.toLowerCase();
  let bestMatch = null;
  let highestHits = 0;

  for (const rule of CATEGORY_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) hits++;
    }
    if (hits > highestHits) {
      highestHits = hits;
      bestMatch = rule;
    }
  }

  // Detect urgent safety flags
  let priority = bestMatch ? bestMatch.defaultPriority : "Medium";
  const hasUrgentWords = URGENCY_TRIGGERS.some(trig => lower.includes(trig));
  if (hasUrgentWords) {
    priority = "Urgent";
  }

  if (bestMatch && highestHits > 0) {
    return {
      category: bestMatch.category,
      section: bestMatch.section,
      priority,
      confidence: highestHits >= 2 ? "high" : "medium"
    };
  }

  return {
    category: "Other / General Grievance",
    section: "college",
    priority: hasUrgentWords ? "Urgent" : "Medium",
    confidence: "low"
  };
}

/**
 * Generates a clean, structured formal grievance draft from rough student text.
 */
export function structureGrievanceDraft(rawInput) {
  if (!rawInput || rawInput.trim().length < 5) {
    return null;
  }

  const cleaned = rawInput.trim();
  const location = extractLocation(cleaned);
  const suggestion = suggestCategoryAndPriority(cleaned);

  // Generate a formal, concise title
  const words = cleaned.split(/\s+/).slice(0, 10).join(' ');
  let formalTitle = words;
  if (suggestion.category && suggestion.category !== "Other / General Grievance") {
    formalTitle = `${suggestion.category}: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
  } else {
    formalTitle = `Grievance: ${words.charAt(0).toUpperCase() + words.slice(1)}`;
  }

  if (location && !formalTitle.toLowerCase().includes(location.toLowerCase())) {
    formalTitle += ` at ${location}`;
  }

  if (formalTitle.length > 80) {
    formalTitle = formalTitle.slice(0, 77) + '...';
  }

  // Format into clear institutional paragraphs
  const structuredDescription = 
`1. ISSUE SUMMARY:
${cleaned}

2. LOCATION / VENUE:
${location || 'MITS Gwalior Campus (Specific department/room to be verified by authority)'}

3. REQUESTED CORRECTIVE ACTION:
Kindly request the concerned department head or authority to inspect the reported matter and initiate necessary resolution within institutional SLA norms.

---
*Notice: This draft was structured by the MITS local rule-based assistant to aid formal filing. You can freely review and modify all fields before submission.*`;

  return {
    title: formalTitle,
    description: structuredDescription,
    suggestedCategory: suggestion.category,
    suggestedSection: suggestion.section,
    suggestedPriority: suggestion.priority,
    location: location || "MITS Campus",
    isDraft: true
  };
}
