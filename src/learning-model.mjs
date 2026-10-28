export const LEARNING_KEY = 'na2_study_learning_v1';
export const freshLearning = () => ({ version: 1, read: {}, checks: {}, tools: {} });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function validateLearning(value) {
  if (!plain(value) || value.version !== 1 || !plain(value.read) || !plain(value.checks) || !plain(value.tools)) throw new Error('지원하지 않는 학습센터 기록입니다.');
  if (Object.keys(value.read).length + Object.keys(value.checks).length + Object.keys(value.tools).length > 10000) throw new Error('기록 수가 허용 범위를 넘었습니다.');
  for (const [id, at] of Object.entries(value.read)) if (!id || typeof at !== 'string' || !Number.isFinite(Date.parse(at))) throw new Error('이론 읽기 기록의 날짜를 확인해 주세요.');
  for (const [id, entry] of Object.entries(value.checks)) if (!id || !plain(entry) || !Number.isInteger(entry.answer) || entry.answer < 0 || entry.answer > 20 || typeof entry.correct !== 'boolean' || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at))) throw new Error('개념 확인 기록을 확인해 주세요.');
  for (const [id, selected] of Object.entries(value.tools)) if (!id || typeof selected !== 'boolean') throw new Error('준비물 기록을 확인해 주세요.');
  return JSON.parse(JSON.stringify(value));
}
export function loadLearning(storage) {
  try {
    const raw = storage.getItem(LEARNING_KEY);
    return { state: raw ? validateLearning(JSON.parse(raw)) : freshLearning(), canSave: true, warning: '' };
  } catch (error) {
    return { state: freshLearning(), canSave: false, warning: `학습센터 기록을 읽지 못해 자동 저장을 중단했습니다. 기존 기록은 보존되어 있습니다. ${error.message}` };
  }
}
export function saveLearning(storage, state) {
  try { storage.setItem(LEARNING_KEY, JSON.stringify(validateLearning(state))); return { ok: true }; }
  catch (error) { return { ok: false, warning: `기록을 저장하지 못했습니다. 현재 기록을 백업해 주세요. ${error.message}` }; }
}
export function safeReturnPath(value) {
  return typeof value === 'string' && /^\/(?:written|cabling)(?:\/[a-zA-Z0-9_-]+)*$/.test(value) ? value : '/learn';
}
export function parseRoute(hash = '') {
  const raw = hash.replace(/^#/, '') || '/learn';
  const [path, query = ''] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/learn', params: new URLSearchParams(query) };
}
export function readAssessmentState(storage) {
  const state = { written: false, cabling: false };
  for (const [name, key, mode] of [['written', 'na2_study_written_v1', 'exam'], ['cabling', 'na2_study_cabling_v1', 'assessment']]) {
    try {
      const session = JSON.parse(storage.getItem(key) || 'null')?.session;
      state[name] = Boolean(session?.mode === mode && !session.completedAt);
    } catch { /* Each module presents its own storage recovery message. */ }
  }
  return state;
}
