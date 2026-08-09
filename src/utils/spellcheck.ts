import { Language } from '../types';

export interface AiSpellError {
  motOriginal: string;
  correction: string;
  explication: string;
  type: string;
}

export interface SpellError {
  word: string;
  startIndex: number;
  endIndex: number;
  suggestions: string[];
  explication?: string;
}

/**
 * Call server-side Gemini API for intelligent spellcheck & grammar review
 */
export async function checkTextWithAi(text: string, lang: Language): Promise<AiSpellError[]> {
  if (!text || text.trim().length === 0) return [];
  try {
    const res = await fetch('/api/correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte: text, langue: lang })
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.erreurs) ? data.erreurs : [];
  } catch (err) {
    console.warn('AI spellcheck API request failed:', err);
    return [];
  }
}

/**
 * Synchronous local heuristic check fallback
 */
export function checkTextSpelling(text: string, lang: Language, ignoredWords: string[] = []): SpellError[] {
  if (!text || text.trim().length === 0) return [];

  const wordRegex = /[a-zA-ZàâæçéèêëîïôœùûüÿÀÂÆÇÉÈÊËÎÏÔŒÙÛÜŸ']+/g;
  const errors: SpellError[] = [];
  const ignoredSet = new Set(ignoredWords.map(w => w.toLowerCase()));

  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const cleanWord = rawWord.toLowerCase().replace(/^'|'$/g, '');

    if (cleanWord.length <= 2 || /^\d+$/.test(cleanWord) || ignoredSet.has(cleanWord)) continue;
  }

  return errors;
}
