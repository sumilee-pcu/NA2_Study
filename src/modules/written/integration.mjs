// This module owns only the integrated app's namespace. Never fall back to the
// separately published NA2-com app's progress or question-bank cache.
export const WRITTEN_STORE_KEY = 'na2_study_written_v1';
export const WRITTEN_LEGACY_KEY = 'na2_study_written_legacy_v1';
export const WRITTEN_BANK_CACHE = 'na2_study_written_bank_v1';

export const createWrittenState = () => ({
  progress: {}, bookmarks: [], notes: {}, history: [], days: [], session: null,
});

export function readWrittenProgress(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    const current = target.getItem(WRITTEN_STORE_KEY);
    const saved = JSON.parse(current ?? target.getItem(WRITTEN_LEGACY_KEY));
    if (saved?.progress && Array.isArray(saved.bookmarks) && Array.isArray(saved.history)) {
      return {
        ...createWrittenState(), ...saved,
        notes: saved.notes && typeof saved.notes === 'object' ? saved.notes : {},
      };
    }
  } catch { /* Reading unavailable or malformed integrated progress starts fresh. */ }
  return createWrittenState();
}

export function writeWrittenProgress(storage, state) {
  storage.setItem(WRITTEN_STORE_KEY, JSON.stringify(state));
}

// The parent can import this small helper before lazy-loading WrittenApp. It
// checks only this app's current key and never requests question-bank data.
export function readWrittenAssessmentState(storage) {
  try {
    const target = storage ?? globalThis.localStorage;
    return JSON.parse(target.getItem(WRITTEN_STORE_KEY))?.session?.mode === 'exam';
  } catch { return false; }
}

export function questionIdFromWrittenRoute(route) {
  if (typeof route !== 'string') return null;
  const match = /^\/written\/question\/([^/?#]+)\/?$/.exec(route);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

// Returning to /written, or opening a shared theory page, is deliberately a
// no-op. The parent keeps WrittenApp mounted so its view and drafts survive.
export function writtenRouteAction(route, session, knownQuestions) {
  const id = questionIdFromWrittenRoute(route);
  if (!id) return { kind: 'preserve' };
  if (!knownQuestions.has(id)) return { kind: 'missing', id };
  const index = session?.mode === 'practice' ? session.ids.indexOf(id) : -1;
  if (index >= 0) return { kind: 'resume', id, index };
  return { kind: session ? 'confirm' : 'start', id };
}

export function mayShowWrittenTheory({ mode, checked = false, completed = false } = {}) {
  return completed === true || (mode === 'practice' && checked === true);
}

export function writtenTheoryTopics(questionTopics, questionId) {
  const topics = questionTopics?.[questionId];
  if (!Array.isArray(topics)) return [];
  const seen = new Set();
  return topics.filter((topic) => {
    if (!topic || typeof topic.id !== 'string' || !topic.id.trim()
      || typeof topic.title !== 'string' || !topic.title.trim() || seen.has(topic.id)) return false;
    seen.add(topic.id);
    return true;
  });
}
