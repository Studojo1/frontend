import { INTENTS, type Intent } from "./knowledge-base";

export interface MatchResult {
  intent: Intent | null;
  confidence: number;
  source: "pattern" | "keyword" | "none";
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "don", "don't", "it", "its", "it's", "i", "me", "my", "myself", "we",
  "our", "you", "your", "he", "him", "she", "her", "they", "them",
  "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "but", "if", "or", "because", "until", "while", "about",
  "and", "up", "down", "also", "please", "want", "get", "got", "like",
  "know", "tell", "help", "thing", "things",
]);

/**
 * Normalize text: lowercase, strip punctuation, collapse whitespace
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize and remove stop words
 */
function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Check if normalized input contains a pattern (fuzzy substring match)
 */
function patternMatch(input: string, pattern: string): boolean {
  const normInput = normalize(input);
  const normPattern = normalize(pattern);

  // Exact substring
  if (normInput.includes(normPattern)) return true;

  // Token overlap — if all pattern tokens appear in input
  const inputTokens = new Set(normInput.split(" "));
  const patternTokens = normPattern.split(" ").filter((t) => t.length > 1);
  if (patternTokens.length === 0) return false;

  const matches = patternTokens.filter((t) => inputTokens.has(t));
  return matches.length / patternTokens.length >= 0.8;
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Weighted keyword score — how many intent keywords appear in the input,
 * weighted by how specific they are (longer keywords = more weight)
 */
function keywordScore(inputTokens: Set<string>, intent: Intent): number {
  const inputText = [...inputTokens].join(" ");
  let matched = 0;
  let total = 0;

  for (const keyword of intent.keywords) {
    const kw = normalize(keyword);
    const weight = kw.includes(" ") ? 2 : 1; // Multi-word keywords worth more
    total += weight;

    if (kw.includes(" ")) {
      // Multi-word keyword — check as substring in joined input
      if (inputText.includes(kw)) matched += weight;
    } else {
      if (inputTokens.has(kw)) matched += weight;
    }
  }

  return total === 0 ? 0 : matched / total;
}

/**
 * Main matching function. Returns best intent + confidence score.
 *
 * Confidence thresholds:
 * - >= 0.7: high confidence, return NLP response directly
 * - 0.4 - 0.7: medium, return NLP response but note it might not be exact
 * - < 0.4: low confidence, fall back to LLM
 */
export function matchIntent(userMessage: string): MatchResult {
  if (!userMessage || userMessage.trim().length === 0) {
    return { intent: null, confidence: 0, source: "none" };
  }

  const normalized = normalize(userMessage);
  const tokens = tokenize(userMessage);
  const tokenSet = new Set(tokens);

  // Pre-check: if message contains problem signals, bias toward technical intent
  // before pattern matching so "resume not working" doesn't hit careers_resume
  const PROBLEM_SIGNALS = ["not working", "isn't working", "doesnt work", "broken", "not loading",
    "wont load", "won't load", "error", "stuck", "failed", "can't use", "cant use",
    "not downloading", "wont download", "won't download", "keep", "continuously", "redirecting"];
  const hasProblemSignal = PROBLEM_SIGNALS.some((s) => normalized.includes(s));

  // Phase 1: Pattern matching (highest confidence)
  for (const intent of INTENTS) {
    // If there's a problem signal and this is NOT the technical intent, skip pattern match
    // for intents that overlap (resume, account) so technical gets priority
    if (hasProblemSignal && ["careers_resume", "account"].includes(intent.id)) continue;
    for (const pattern of intent.patterns) {
      if (patternMatch(normalized, pattern)) {
        return { intent, confidence: 0.95, source: "pattern" };
      }
    }
  }

  // Phase 2: Keyword scoring
  let bestIntent: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    const kwScore = keywordScore(tokenSet, intent);
    const intentTokens = new Set(
      intent.keywords.flatMap((k) => normalize(k).split(" ")).filter((t) => t.length > 1)
    );
    const jaccard = jaccardSimilarity(tokenSet, intentTokens);

    // Combined score: keyword match weighted higher than jaccard
    const combined = kwScore * 0.7 + jaccard * 0.3;

    if (combined > bestScore) {
      bestScore = combined;
      bestIntent = intent;
    }
  }

  if (bestIntent && bestScore >= 0.15) {
    // Map raw score to confidence (0.15-0.5 raw → 0.4-0.9 confidence)
    const confidence = Math.min(0.9, 0.4 + (bestScore - 0.15) * (0.5 / 0.35));
    return { intent: bestIntent, confidence, source: "keyword" };
  }

  return { intent: null, confidence: 0, source: "none" };
}

// Confidence threshold for skipping LLM
export const NLP_CONFIDENCE_THRESHOLD = 0.55;
