import { QUESTIONS, QUESTION_BY_ID, STANDARDS, WIRE_IDS } from './content.mjs';

export const STORE_KEY = 'na2_study_cabling_v1';
export const LEGACY_KEY = 'na2_study_cabling_legacy_v1';
export const MAX_IMPORT_BYTES = 64 * 1024 * 1024;
const MODES = ['practice', 'assessment', 'review'];
const KINDS = ['pin', 'order', 'type'];
const MAX_EVENTS = 100000;
const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const CLOCK_GRACE_MS = 5 * 60 * 1000;
const PRACTICAL_MS = 600000;
const utf8Encoder = new TextEncoder();
const utf8Bytes = (value) => utf8Encoder.encode(value).byteLength;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const copy = (value) => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const integer = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= min && value <= max;
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));

function fail(message) { throw new Error(message); }
function requireThat(condition, message) { if (!condition) fail(message); }
function shape(value, keys, label, optional = []) {
  requireThat(record(value), `${label} 형식이 올바르지 않습니다.`);
  requireThat(Object.keys(value).every((key) => keys.includes(key) || optional.includes(key)), `${label}에 알 수 없는 항목이 있습니다.`);
  requireThat(keys.every((key) => own(value, key)), `${label}의 필수 항목이 없습니다.`);
}
function identifier(value, label) {
  requireThat(typeof value === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(value), `${label} 식별자가 올바르지 않습니다.`);
}

// Date.parse alone normalizes impossible dates, e.g. February 30. Check the
// calendar components first; both Z and explicit ISO timezone offsets are valid.
function isoMillis(value, label = '시간') {
  requireThat(typeof value === 'string', `${label}은 ISO 날짜 문자열이어야 합니다.`);
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  requireThat(parts, `${label}에 날짜와 시간대가 포함되어야 합니다.`);
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = parts;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  requireThat(year >= 1970 && month >= 1 && month <= 12, `${label}의 날짜가 올바르지 않습니다.`);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  requireThat(day >= 1 && day <= lastDay && Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59, `${label}의 날짜가 올바르지 않습니다.`);
  if (parts[8] !== 'Z') {
    const hours = Number(parts[10]), minutes = Number(parts[11]);
    requireThat(hours <= 14 && minutes <= 59 && (hours !== 14 || minutes === 0), `${label}의 시간대가 올바르지 않습니다.`);
  }
  const time = Date.parse(value);
  requireThat(Number.isFinite(time), `${label}의 날짜가 올바르지 않습니다.`);
  return time;
}
function storedTime(value, now, label) {
  const time = isoMillis(value, label);
  requireThat(time <= now + CLOCK_GRACE_MS, `${label}이 현재보다 미래입니다.`);
  return time;
}
function normalizedTime(value) { return new Date(isoMillis(value)).toISOString(); }

function validAnswer(question, answer, partial = false) {
  if (partial && answer === null) return true;
  if (!question) return false;
  if (question.kind === 'pin') return typeof answer === 'string' && WIRE_IDS.includes(answer);
  if (question.kind === 'type') return ['straight', 'crossover'].includes(answer);
  if (question.kind === 'order') return Array.isArray(answer) && answer.length <= 8
    && (partial || answer.length === 8) && answer.every((wire) => WIRE_IDS.includes(wire))
    && new Set(answer).size === answer.length;
  return false;
}

/** All-or-nothing scoring. A partial order is never a submitted answer. */
export function grade(question, answer) {
  if (!validAnswer(question, answer)) return false;
  return question.kind === 'order'
    ? answer.every((wire, index) => wire === question.answer[index])
    : answer === question.answer;
}

export function freshState() {
  return {
    schemaVersion: 2,
    events: [],
    session: null,
    settings: { autoNext: false, motion: true },
    legacy: null,
    practical: { active: null, records: [] },
    corrections: { active: null, records: [] },
  };
}

function validateLegacy(legacy) {
  if (legacy === null) return;
  shape(legacy, ['raw'], '이전 앱 기록', ['history', 'gameAttempts', 'gameSolved']);
  requireThat(typeof legacy.raw === 'string' && utf8Bytes(legacy.raw) <= MAX_BACKUP_BYTES, '이전 앱 원문 크기 또는 형식이 올바르지 않습니다.');
  if (own(legacy, 'history')) {
    requireThat(Array.isArray(legacy.history) && legacy.history.length <= 8, '이전 앱 활동 기록 형식이 올바르지 않습니다.');
    for (const item of legacy.history) {
      shape(item, ['type', 'label', 'success', 'time'], '이전 앱 활동');
      requireThat(['quiz', 'game'].includes(item.type) && typeof item.success === 'boolean', '이전 앱 활동 형식이 올바르지 않습니다.');
      requireThat(typeof item.label === 'string' && item.label.length <= 500 && typeof item.time === 'string' && item.time.length <= 100, '이전 앱 활동 표시가 올바르지 않습니다.');
    }
  }
  if (own(legacy, 'gameAttempts') || own(legacy, 'gameSolved')) {
    requireThat(integer(legacy.gameAttempts) && integer(legacy.gameSolved, 0, legacy.gameAttempts), '이전 앱 시도·성공 횟수가 올바르지 않습니다.');
  }
}

function validateEvents(events, now) {
  requireThat(Array.isArray(events) && events.length <= MAX_EVENTS, '응답 기록의 형식 또는 개수가 올바르지 않습니다.');
  const ids = new Map(), groups = new Map();
  let lastTime = -Infinity;
  for (const event of events) {
    shape(event, ['id', 'sessionId', 'questionId', 'kind', 'mode', 'answer', 'correct', 'submittedAt'], '응답 기록');
    identifier(event.sessionId, '학습');
    const question = QUESTION_BY_ID[event.questionId];
    requireThat(question && event.kind === question.kind && MODES.includes(event.mode), '응답 기록의 문항·유형·모드가 올바르지 않습니다.');
    requireThat(validAnswer(question, event.answer), '응답 기록의 답안이 올바르지 않습니다.');
    requireThat(typeof event.correct === 'boolean' && event.correct === grade(question, event.answer), '응답 기록의 채점 결과가 답안과 다릅니다.');
    const time = storedTime(event.submittedAt, now, '응답 시간');
    requireThat(time >= lastTime, '응답 기록의 시간 순서가 올바르지 않습니다.');
    lastTime = time;
    const group = groups.get(event.sessionId) || [];
    requireThat(event.id === `${event.sessionId}:${group.length}` && !ids.has(event.id), '응답 기록 식별자가 중복되었거나 순서가 올바르지 않습니다.');
    requireThat(!group.some((item) => item.questionId === event.questionId) && (!group.length || group[0].mode === event.mode), '같은 학습의 문항 또는 모드가 올바르지 않습니다.');
    group.push(event);
    groups.set(event.sessionId, group);
    ids.set(event.id, event);
  }
  return { ids, groups };
}

function validateSession(session, events, now) {
  if (session === null) return;
  shape(session, ['id', 'mode', 'ids', 'index', 'draft', 'submitted', 'palette', 'startedAt', 'completedAt'], '학습 세션');
  identifier(session.id, '학습');
  requireThat(MODES.includes(session.mode), '학습 모드가 올바르지 않습니다.');
  requireThat(Array.isArray(session.ids) && session.ids.length >= 1 && session.ids.length <= QUESTIONS.length
    && new Set(session.ids).size === session.ids.length && session.ids.every((id) => own(QUESTION_BY_ID, id)), '학습 문항 목록이 올바르지 않습니다.');
  requireThat(integer(session.index, 0, session.ids.length - 1), '현재 문항 위치가 올바르지 않습니다.');
  const question = QUESTION_BY_ID[session.ids[session.index]];
  requireThat(validAnswer(question, session.draft, true), '진행 중인 답안이 올바르지 않습니다.');
  requireThat(Array.isArray(session.palette) && session.palette.length === 8
    && new Set(session.palette).size === 8 && session.palette.every((id) => WIRE_IDS.includes(id)), '전선 선택 목록이 올바르지 않습니다.');
  const started = storedTime(session.startedAt, now, '학습 시작 시간');
  const group = events.groups.get(session.id) || [];
  requireThat(group.length === session.index + (session.submitted === null ? 0 : 1), '학습 진행과 응답 기록의 개수가 다릅니다.');
  group.forEach((event, index) => {
    requireThat(event.questionId === session.ids[index] && event.mode === session.mode && isoMillis(event.submittedAt) >= started, '학습 진행과 응답 기록이 일치하지 않습니다.');
  });
  if (session.submitted !== null) {
    const saved = events.ids.get(`${session.id}:${session.index}`);
    requireThat(saved && record(session.submitted), '현재 문항의 제출 기록이 없습니다.');
    shape(session.submitted, ['id', 'sessionId', 'questionId', 'kind', 'mode', 'answer', 'correct', 'submittedAt'], '현재 제출 기록');
    requireThat(Object.keys(saved).every((key) => same(saved[key], session.submitted[key])) && same(session.draft, saved.answer), '현재 답안과 제출 기록이 일치하지 않습니다.');
  }
  if (session.completedAt !== null) {
    const completed = storedTime(session.completedAt, now, '학습 완료 시간');
    requireThat(session.index === session.ids.length - 1 && session.submitted !== null
      && completed >= isoMillis(session.submitted.submittedAt), '학습 완료 상태가 올바르지 않습니다.');
  }
}

function validateChecks(checks) {
  requireThat(Array.isArray(checks) && checks.length === 6 && checks.every((value) => typeof value === 'boolean'), '실물 자기점검 항목은 6개의 참·거짓 값이어야 합니다.');
}
function validatePractical(practical, now) {
  shape(practical, ['active', 'records'], '실물 자기점검');
  requireThat(Array.isArray(practical.records) && practical.records.length <= MAX_EVENTS, '실물 자기점검 기록 형식이 올바르지 않습니다.');
  const ids = new Set();
  let previousEnd = -Infinity;
  for (const item of practical.records) {
    shape(item, ['id', 'startedAt', 'endedAt', 'elapsedSeconds', 'checks', 'expired'], '실물 자기점검 기록');
    identifier(item.id, '실물 자기점검');
    requireThat(!ids.has(item.id), '실물 자기점검 기록이 중복되었습니다.');
    ids.add(item.id);
    const start = storedTime(item.startedAt, now, '실물 시작 시간');
    const end = storedTime(item.endedAt, now, '실물 종료 시간');
    requireThat(start >= previousEnd && end >= start, '실물 자기점검의 시간 순서가 올바르지 않습니다.');
    previousEnd = end;
    requireThat(integer(item.elapsedSeconds, 0, 600) && item.elapsedSeconds === Math.min(600, Math.floor((end - start) / 1000)), '실물 자기점검 소요 시간이 올바르지 않습니다.');
    requireThat(typeof item.expired === 'boolean' && item.expired === (end >= start + PRACTICAL_MS), '실물 자기점검의 시간 종료 표시가 올바르지 않습니다.');
    validateChecks(item.checks);
  }
  if (practical.active !== null) {
    const active = practical.active;
    shape(active, ['id', 'startedAt', 'deadlineAt', 'checks'], '진행 중인 실물 자기점검');
    identifier(active.id, '실물 자기점검');
    requireThat(!ids.has(active.id), '이미 완료한 실물 자기점검입니다.');
    const start = storedTime(active.startedAt, now, '실물 시작 시간');
    const deadline = isoMillis(active.deadlineAt, '실물 종료 예정 시간');
    requireThat(start >= previousEnd && deadline === start + PRACTICAL_MS, '실물 자기점검의 제한시간이 올바르지 않습니다.');
    validateChecks(active.checks);
  }
}

function validateCorrections(corrections, events, now) {
  shape(corrections, ['active', 'records'], '배열 교정');
  requireThat(Array.isArray(corrections.records) && corrections.records.length <= MAX_EVENTS, '배열 교정 기록 형식이 올바르지 않습니다.');
  const ids = new Map();
  let previousEnd = -Infinity;
  function common(item, active) {
    shape(item, active
      ? ['id', 'standard', 'sourceEventId', 'original', 'draft', 'selectedPin', 'swaps', 'startedAt', 'completedAt']
      : ['id', 'standard', 'sourceEventId', 'original', 'answer', 'swaps', 'startedAt', 'completedAt'], '배열 교정 항목');
    identifier(item.id, '배열 교정');
    requireThat(own(STANDARDS, item.standard), '배열 교정 규격이 올바르지 않습니다.');
    const question = QUESTION_BY_ID[`order-${item.standard.at(-1)}`];
    requireThat(validAnswer(question, item.original) && !grade(question, item.original), '교정 전 원본은 완전한 오답 배열이어야 합니다.');
    requireThat(validAnswer(question, active ? item.draft : item.answer), '배열 교정 답안이 올바르지 않습니다.');
    requireThat(integer(item.swaps, 0), '배열 교정 교환 횟수가 올바르지 않습니다.');
    const start = storedTime(item.startedAt, now, '교정 시작 시간');
    if (item.sourceEventId !== null) {
      const source = events.ids.get(item.sourceEventId);
      requireThat(source && source.kind === 'order' && !source.correct && source.questionId === question.id
        && same(source.answer, item.original) && start >= isoMillis(source.submittedAt), '교정 원본과 응답 기록이 일치하지 않습니다.');
    } else requireThat(item.original.filter((id, index) => id !== question.answer[index]).length === 2, '생성 교정은 두 핀을 바꾼 배열이어야 합니다.');
    if (active) {
      requireThat(item.selectedPin === null || integer(item.selectedPin, 0, 7), '교정 선택 핀이 올바르지 않습니다.');
      requireThat(item.swaps > 0 || same(item.original, item.draft), '교환하지 않은 배열이 원본과 다릅니다.');
    }
    if (!active || item.completedAt !== null) {
      const end = storedTime(item.completedAt, now, '교정 완료 시간');
      requireThat(end >= start && item.swaps >= 1 && grade(question, active ? item.draft : item.answer), '배열 교정 완료 상태가 올바르지 않습니다.');
      if (active) requireThat(item.selectedPin === null, '완료한 교정에는 선택 핀이 없어야 합니다.');
      return { start, end };
    }
    return { start, end: null };
  }
  for (const item of corrections.records) {
    const time = common(item, false);
    requireThat(!ids.has(item.id) && time.start >= previousEnd, '배열 교정 기록이 중복되었거나 시간 순서가 올바르지 않습니다.');
    ids.set(item.id, item); previousEnd = time.end;
  }
  if (corrections.active !== null) {
    const active = corrections.active, time = common(active, true), saved = ids.get(active.id);
    if (active.completedAt === null) requireThat(!saved && time.start >= previousEnd, '진행 중인 배열 교정이 기록과 충돌합니다.');
    else {
      requireThat(saved && saved === corrections.records.at(-1), '완료한 교정의 저장 기록이 없습니다.');
      const expected = { id: active.id, standard: active.standard, sourceEventId: active.sourceEventId,
        original: active.original, answer: active.draft, swaps: active.swaps, startedAt: active.startedAt, completedAt: active.completedAt };
      requireThat(Object.keys(expected).every(key => same(expected[key], saved[key])), '교정 완료 화면과 저장 기록이 다릅니다.');
    }
  }
}

/** Schema 1 is accepted only as data explicitly loaded/imported from the new
 * namespace. Original app keys are never consulted. */
export function validateBackup(value) {
  requireThat(record(value) && [1, 2].includes(value.schemaVersion), '지원하지 않는 백업 버전입니다.');
  const keys = ['schemaVersion', 'events', 'session', 'settings', 'legacy', 'practical'];
  shape(value, value.schemaVersion === 2 ? [...keys, 'corrections'] : keys, '백업');
  const normalized = value.schemaVersion === 1 ? { ...value, schemaVersion: 2, corrections: { active: null, records: [] } } : value;
  shape(value.settings, ['autoNext', 'motion'], '설정');
  requireThat(typeof value.settings.autoNext === 'boolean' && typeof value.settings.motion === 'boolean', '설정 값이 올바르지 않습니다.');
  const now = Date.now();
  const events = validateEvents(value.events, now);
  validateSession(value.session, events, now);
  validateLegacy(value.legacy);
  validatePractical(value.practical, now);
  validateCorrections(normalized.corrections, events, now);
  return copy(normalized);
}

function legacySnapshot(raw) {
  const legacy = { raw };
  try {
    const value = JSON.parse(raw);
    if (!record(value)) return legacy;
    if (Array.isArray(value.history)) {
      legacy.history = value.history.filter((item) => record(item) && ['quiz', 'game'].includes(item.type)
        && typeof item.label === 'string' && item.label.length <= 500 && typeof item.success === 'boolean'
        && typeof item.time === 'string' && item.time.length <= 100).slice(0, 8)
        .map(({ type, label, success, time }) => ({ type, label, success, time }));
    }
    if (integer(value.gameAttempts) && integer(value.gameSolved, 0, value.gameAttempts)) {
      legacy.gameAttempts = value.gameAttempts;
      legacy.gameSolved = value.gameSolved;
    }
  } catch { /* Preserve the raw legacy value even if its JSON cannot be parsed. */ }
  return legacy;
}

/** Never writes storage. On a warning the UI must pause automatic writes until
 * the user explicitly chooses recovery or a fresh save. raw/sourceKey let the
 * UI download the untouched damaged value. A saved v1 key prevents reimporting
 * legacy data after RESET; RESET also retains the legacy snapshot itself. */
export function loadState(storage) {
  let raw = null;
  try {
    raw = storage.getItem(STORE_KEY);
  } catch (error) {
    return { state: freshState(), warning: `저장 기록을 읽지 못했습니다. ${error.message || ''}`.trim(), canSave: false, sourceKey: STORE_KEY };
  }
  if (raw !== null && raw !== undefined) {
    try {
      requireThat(typeof raw === 'string' && utf8Bytes(raw) <= MAX_BACKUP_BYTES, '저장 기록의 크기 또는 형식이 올바르지 않습니다.');
      return { state: validateBackup(JSON.parse(raw)), canSave: true };
    } catch (error) {
      return { state: freshState(), warning: `저장 기록을 복원하지 못했습니다. 원문은 보존되어 있습니다. ${error.message}`, raw, sourceKey: STORE_KEY, canSave: false };
    }
  }
  try {
    const legacyRaw = storage.getItem(LEGACY_KEY);
    const state = freshState();
    if (legacyRaw !== null && legacyRaw !== undefined) {
      requireThat(typeof legacyRaw === 'string' && utf8Bytes(legacyRaw) <= MAX_BACKUP_BYTES, '이전 앱 기록의 크기 또는 형식이 올바르지 않습니다.');
      state.legacy = legacySnapshot(legacyRaw);
    }
    return { state, canSave: true };
  } catch (error) {
    return { state: freshState(), warning: `이전 앱 기록을 읽지 못했습니다. ${error.message}`, sourceKey: LEGACY_KEY, canSave: false };
  }
}

export function saveState(storage, state) {
  try {
    const raw = JSON.stringify(validateBackup(state));
    requireThat(utf8Bytes(raw) <= MAX_BACKUP_BYTES, '기록이 저장 한도를 넘었습니다. 백업 후 기록을 정리하세요.');
    storage.setItem(STORE_KEY, raw);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `기록을 저장하지 못했습니다. ${error.message || '저장 공간 또는 브라우저 권한을 확인하세요.'}` };
  }
}

export function exportBackup(state) { return JSON.stringify(validateBackup(state)); }

function shuffled(values, rng) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = rng();
    requireThat(typeof value === 'number' && value >= 0 && value < 1, '난수 값은 0 이상 1 미만이어야 합니다.');
    const other = Math.floor(value * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
function seededRng(seed) {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let mixed = Math.imul(value ^ (value >>> 15), 1 | value);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
function makePalette(question, rng) {
  const palette = shuffled(WIRE_IDS, rng);
  // A shuffled palette must not accidentally display either complete answer.
  if (Object.values(STANDARDS).some((answer) => same(palette, answer))) [palette[0], palette[1]] = [palette[1], palette[0]];
  return palette;
}
function uniqueSessionId(startedAt) {
  const token = globalThis.crypto?.randomUUID?.() || `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return `s_${Date.parse(startedAt).toString(36)}_${token}`;
}

export function makeSession({ kind = 'mixed', mode = 'practice', count = 10, questionIds, now = new Date().toISOString(), rng = Math.random } = {}) {
  requireThat(['mixed', ...KINDS].includes(kind) && MODES.includes(mode), '학습 유형 또는 모드가 올바르지 않습니다.');
  requireThat(integer(count, 1, MAX_EVENTS) && typeof rng === 'function', '학습 문항 수가 올바르지 않습니다.');
  let pool = QUESTIONS.filter((question) => kind === 'mixed' || question.kind === kind).map((question) => question.id);
  if (questionIds !== undefined) {
    requireThat(Array.isArray(questionIds) && questionIds.length > 0 && new Set(questionIds).size === questionIds.length
      && questionIds.every((id) => pool.includes(id)), '선택한 학습 문항이 올바르지 않습니다.');
    pool = [...questionIds];
  }
  const ids = shuffled(pool, rng).slice(0, Math.min(count, pool.length));
  const startedAt = normalizedTime(now);
  return {
    id: uniqueSessionId(startedAt), mode, ids, index: 0, draft: null, submitted: null,
    palette: makePalette(QUESTION_BY_ID[ids[0]], rng), startedAt, completedAt: null,
  };
}

export function resetState(state, { preserveSettings = false } = {}) {
  const fresh = freshState();
  fresh.legacy = state.legacy === null ? null : copy(state.legacy);
  if (preserveSettings) fresh.settings = { ...state.settings };
  return fresh;
}

function actionTime(action, earliest) {
  try {
    const time = isoMillis(action.at);
    return time >= earliest ? { time, at: new Date(time).toISOString() } : null;
  } catch { return null; }
}

/** Pure state transitions: no storage, timers, or random calls in the reducer. */
export function reducer(state, action) {
  if (!record(action)) return state;
  const session = state.session;
  switch (action.type) {
    case 'START': {
      try {
        const candidate = action.session;
        requireThat(record(candidate) && candidate.index === 0 && candidate.draft === null
          && candidate.submitted === null && candidate.completedAt === null, '새 학습 상태가 올바르지 않습니다.');
        requireThat(!state.events.some((event) => event.sessionId === candidate.id), '이미 사용한 학습입니다.');
        return validateBackup({ ...state, session: candidate });
      } catch { return state; }
    }
    case 'ANSWER': {
      if (!session || session.submitted || session.completedAt) return state;
      const question = QUESTION_BY_ID[session.ids[session.index]];
      if (!validAnswer(question, action.answer, true)) return state;
      return { ...state, session: { ...session, draft: Array.isArray(action.answer) ? [...action.answer] : action.answer } };
    }
    case 'SUBMIT': {
      if (!session || session.submitted || session.completedAt) return state;
      const question = QUESTION_BY_ID[session.ids[session.index]];
      if (!validAnswer(question, session.draft)) return state;
      const last = state.events.at(-1);
      const clock = actionTime(action, Math.max(isoMillis(session.startedAt), last ? isoMillis(last.submittedAt) : -Infinity));
      const id = `${session.id}:${session.index}`;
      if (!clock || state.events.some((event) => event.id === id)) return state;
      const event = {
        id, sessionId: session.id, questionId: question.id, kind: question.kind, mode: session.mode,
        answer: Array.isArray(session.draft) ? [...session.draft] : session.draft,
        correct: grade(question, session.draft), submittedAt: clock.at,
      };
      return { ...state, events: [...state.events, event], session: { ...session, submitted: event } };
    }
    case 'NEXT': {
      if (!session || !session.submitted || session.completedAt) return state;
      const clock = actionTime(action, isoMillis(session.submitted.submittedAt));
      if (!clock) return state;
      if (session.index === session.ids.length - 1) return { ...state, session: { ...session, completedAt: clock.at } };
      const index = session.index + 1;
      return { ...state, session: { ...session, index, draft: null, submitted: null,
        palette: makePalette(QUESTION_BY_ID[session.ids[index]], seededRng(`${session.id}:${index}`)) } };
    }
    case 'CLEAR_SESSION': return { ...state, session: null };
    case 'SETTINGS': {
      if (!record(action.settings) || !Object.keys(action.settings).every((key) => ['autoNext', 'motion'].includes(key) && typeof action.settings[key] === 'boolean')) return state;
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }
    case 'IMPORT': {
      try { return validateBackup(action.state); } catch { return state; }
    }
    case 'RESET': return resetState(state);
    case 'CORRECTION_START': {
      if (session?.mode === 'assessment' && !session.completedAt) return state;
      if (!own(STANDARDS, action.standard)) return state;
      const source = action.sourceEventId == null ? null : state.events.find(event => event.id === action.sourceEventId);
      const question = QUESTION_BY_ID[`order-${action.standard.at(-1)}`];
      if (action.sourceEventId != null && (!source || source.questionId !== question.id || source.correct || source.kind !== 'order')) return state;
      const last = state.corrections.records.at(-1);
      const clock = actionTime(action, Math.max(last ? isoMillis(last.completedAt) : -Infinity, source ? isoMillis(source.submittedAt) : -Infinity));
      if (!clock) return state;
      const original = source ? [...source.answer] : [...question.answer];
      if (!source) {
        const pair = action.pair ?? [0, 1];
        if (!Array.isArray(pair) || pair.length !== 2 || pair[0] === pair[1] || !pair.every(pin => integer(pin, 0, 7))) return state;
        [original[pair[0]], original[pair[1]]] = [original[pair[1]], original[pair[0]]];
      }
      const active = { id: `c_${clock.time.toString(36)}_${state.corrections.records.length.toString(36)}`,
        standard: action.standard, sourceEventId: source?.id ?? null, original, draft: [...original],
        selectedPin: null, swaps: 0, startedAt: clock.at, completedAt: null };
      return { ...state, corrections: { ...state.corrections, active } };
    }
    case 'CORRECTION_SELECT': {
      const active = state.corrections.active;
      if (!active || active.completedAt || !integer(action.pin, 0, 7) || (session?.mode === 'assessment' && !session.completedAt)) return state;
      if (active.selectedPin === null || active.selectedPin === action.pin) {
        return { ...state, corrections: { ...state.corrections, active: { ...active, selectedPin: active.selectedPin === action.pin ? null : action.pin } } };
      }
      const draft = [...active.draft];
      [draft[active.selectedPin], draft[action.pin]] = [draft[action.pin], draft[active.selectedPin]];
      return { ...state, corrections: { ...state.corrections, active: { ...active, draft, selectedPin: null, swaps: active.swaps + 1 } } };
    }
    case 'CORRECTION_FINISH': {
      const active = state.corrections.active;
      if (!active || active.completedAt || (session?.mode === 'assessment' && !session.completedAt)
        || state.corrections.records.some(item => item.id === active.id)
        || !grade(QUESTION_BY_ID[`order-${active.standard.at(-1)}`], active.draft)) return state;
      const clock = actionTime(action, isoMillis(active.startedAt));
      if (!clock) return state;
      const item = { id: active.id, standard: active.standard, sourceEventId: active.sourceEventId,
        original: [...active.original], answer: [...active.draft], swaps: active.swaps,
        startedAt: active.startedAt, completedAt: clock.at };
      return { ...state, corrections: { active: { ...active, selectedPin: null, completedAt: clock.at }, records: [...state.corrections.records, item] } };
    }
    case 'PRACTICAL_START': {
      if (state.practical.active) return state;
      const last = state.practical.records.at(-1);
      const clock = actionTime(action, last ? isoMillis(last.endedAt) : -Infinity);
      if (!clock) return state;
      const id = `p_${clock.time.toString(36)}_${state.practical.records.length.toString(36)}`;
      return { ...state, practical: { ...state.practical, active: {
        id, startedAt: clock.at, deadlineAt: new Date(clock.time + PRACTICAL_MS).toISOString(), checks: Array(6).fill(false),
      } } };
    }
    case 'PRACTICAL_CHECK': {
      const active = state.practical.active;
      if (!active || !integer(action.index, 0, 5) || typeof action.checked !== 'boolean') return state;
      const checks = active.checks.map((value, index) => index === action.index ? action.checked : value);
      return { ...state, practical: { ...state.practical, active: { ...active, checks } } };
    }
    case 'PRACTICAL_FINISH': {
      const active = state.practical.active;
      if (!active || state.practical.records.some((item) => item.id === active.id)) return state;
      const start = isoMillis(active.startedAt);
      const clock = actionTime(action, start);
      if (!clock) return state;
      const item = {
        id: active.id, startedAt: active.startedAt, endedAt: clock.at,
        elapsedSeconds: Math.min(600, Math.floor((clock.time - start) / 1000)),
        checks: [...active.checks], expired: clock.time >= isoMillis(active.deadlineAt),
      };
      return { ...state, practical: { active: null, records: [...state.practical.records, item] } };
    }
    default: return state;
  }
}

function rate(events) {
  const total = events.length;
  const correct = events.reduce((sum, event) => sum + (event.correct ? 1 : 0), 0);
  return { total, correct, accuracy: total ? Math.round(correct / total * 100) : null };
}
function firstAnswers(events) {
  const first = new Map();
  for (const event of events) if (!first.has(event.questionId)) first.set(event.questionId, event);
  return [...first.values()];
}
function localDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getWrongIds(state) {
  const latest = new Map();
  for (const event of state.events) latest.set(event.questionId, event);
  return [...latest.values()].filter((event) => !event.correct).map((event) => event.questionId);
}

/** A position diagnosis is an observation within one order submission; it is
 * never an additional quiz event. Hide the open assessment even if the caller
 * passes the unfiltered state. */
export function pinDiagnostics(state) {
  const hiddenId = state.session?.mode === 'assessment' && !state.session.completedAt ? state.session.id : null;
  const events = state.events.filter(event => event.sessionId !== hiddenId);
  function observations(items) {
    return { ...rate(items), lastCorrect: items.at(-1)?.correct ?? null, lastAnsweredAt: items.at(-1)?.submittedAt ?? null };
  }
  const rows = Object.keys(STANDARDS).flatMap(standard => STANDARDS[standard].map((answer, index) => {
    const questionId = `pin-${standard.at(-1)}-${index + 1}`;
    const standalone = observations(events.filter(event => event.questionId === questionId));
    const position = observations(events.filter(event => event.questionId === `order-${standard.at(-1)}`)
      .map(event => ({ correct: event.answer[index] === answer, submittedAt: event.submittedAt })));
    return { standard, pin: index + 1, questionId, standalone, position };
  }));
  return {
    pinSubmissions: events.filter(event => event.kind === 'pin').length,
    orderSubmissions: events.filter(event => event.kind === 'order').length,
    rows, reviewIds: rows.filter(row => row.standalone.lastCorrect === false || row.position.lastCorrect === false).map(row => row.questionId),
  };
}

export function stats(state, now = new Date()) {
  const date = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  requireThat(Number.isFinite(date.getTime()), '통계 기준 날짜가 올바르지 않습니다.');
  const events = state.events;
  const assessment = events.filter((event) => event.mode === 'assessment');
  const byKind = Object.fromEntries(KINDS.map((kind) => [kind, rate(events.filter((event) => event.kind === kind))]));
  const perDate = new Map();
  for (const event of events) {
    const key = localDate(event.submittedAt);
    if (!perDate.has(key)) perDate.set(key, []);
    perDate.get(key).push(event);
  }
  // Calendar arithmetic rather than subtracting 24h also works across DST.
  const daily = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6 + index);
    const key = localDate(day);
    return { date: key, ...rate(perDate.get(key) || []) };
  });
  return {
    ...rate(events), firstAccuracy: rate(firstAnswers(events)).accuracy,
    assessmentAccuracy: rate(assessment).accuracy,
    assessmentFirstAccuracy: rate(firstAnswers(assessment)).accuracy,
    studyDays: perDate.size, byKind, daily, wrongIds: getWrongIds(state),
  };
}
