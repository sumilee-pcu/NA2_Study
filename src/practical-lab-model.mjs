import { LABS, LAB_BY_ID } from './content/practical-labs.mjs';

export const LAB_STORAGE_KEY = 'na2_study_labs_v1';
export const freshLabState = () => ({ version: 1, entries: {} });
export const freshLabEntry = () => ({ answers: {}, checked: false, usedSolution: false });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function ipv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some(part => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)) return null;
  return parts.join('.');
}

export function normalizeLabAnswer(kind, value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > 240) return null;
  if (kind === 'ipv4') return ipv4(text);
  if (kind === 'mask') {
    if (/^\/(0|[1-9]\d?)$/.test(text)) {
      const prefix = Number(text.slice(1));
      if (prefix > 32) return null;
      return Array.from({ length: 4 }, (_, i) => 256 - 2 ** (8 - Math.max(0, Math.min(8, prefix - i * 8)))).join('.');
    }
    const address = ipv4(text);
    if (!address) return null;
    const bits = address.split('.').map(part => Number(part).toString(2).padStart(8, '0')).join('');
    return /^1*0*$/.test(bits) ? address : null;
  }
  if (kind === 'integer') return /^\d+$/.test(text) && Number.isSafeInteger(Number(text)) ? String(Number(text)) : null;
  if (kind === 'dns-name') {
    const name = text.toLowerCase().replace(/\.$/, '');
    if (name.length > 253 || name.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
    return name;
  }
  return kind === 'text' || kind === 'choice' ? text : null;
}

export function gradeLab(lab, answers = {}) {
  const fields = lab.checks.map(check => {
    const expected = normalizeLabAnswer(check.kind, check.expected);
    const actual = normalizeLabAnswer(check.kind, answers[check.id]);
    return { id: check.id, correct: expected !== null && actual === expected, blank: !String(answers[check.id] || '').trim() };
  });
  const correct = fields.filter(field => field.correct).length;
  return { fields, correct, total: fields.length, passed: fields.length > 0 && correct === fields.length };
}

export function validateLabState(value) {
  if (!plain(value) || value.version !== 1 || !plain(value.entries) || Object.keys(value.entries).length > LABS.length) throw new Error('지원하지 않는 실습 자료 기록입니다.');
  const entries = {};
  for (const [id, entry] of Object.entries(value.entries)) {
    const lab = LAB_BY_ID[id];
    if (!lab || !plain(entry) || !plain(entry.answers) || typeof entry.checked !== 'boolean' || typeof entry.usedSolution !== 'boolean') throw new Error('실습 과제 기록을 확인해 주세요.');
    const answers = {};
    for (const [fieldId, answer] of Object.entries(entry.answers)) {
      if (!lab.checks.some(check => check.id === fieldId) || typeof answer !== 'string' || answer.length > 240) throw new Error('실습 입력값을 확인해 주세요.');
      answers[fieldId] = answer;
    }
    entries[id] = { answers, checked: entry.checked, usedSolution: entry.usedSolution };
  }
  return { version: 1, entries };
}

export function loadLabState(storage) {
  try {
    const raw = storage.getItem(LAB_STORAGE_KEY);
    if (raw && raw.length > 100000) throw new Error('기록 크기가 허용 범위를 넘었습니다.');
    return { state: raw !== null ? validateLabState(JSON.parse(raw)) : freshLabState(), observed: raw, canSave: true, warning: '' };
  } catch (error) {
    return { state: freshLabState(), observed: null, canSave: false, warning: `실습 자료 기록을 읽지 못했습니다. 기존 기록을 보존하고 자동 저장을 중단했습니다. ${error.message}` };
  }
}

export function persistLabState(storage, state, observed) {
  try {
    if (storage.getItem(LAB_STORAGE_KEY) !== observed) return { ok: false, warning: '다른 탭에서 실습 자료 기록이 바뀌었습니다. 현재 입력을 백업한 뒤 새로고침해 주세요.' };
    const raw = JSON.stringify(validateLabState(state));
    if (raw !== observed) storage.setItem(LAB_STORAGE_KEY, raw);
    return { ok: true, observed: raw };
  } catch (error) {
    return { ok: false, warning: `실습 자료 기록을 저장하지 못했습니다. 현재 입력을 백업해 주세요. ${error.message}` };
  }
}

export function updateLabEntry(state, labId, change) {
  if (!LAB_BY_ID[labId]) throw new Error('알 수 없는 실습 과제입니다.');
  return validateLabState({ ...state, entries: { ...state.entries, [labId]: { ...(state.entries[labId] || freshLabEntry()), ...change } } });
}

export function completedLabs(state) {
  return LABS.filter(lab => state.entries[lab.id]?.checked && gradeLab(lab, state.entries[lab.id].answers).passed);
}
