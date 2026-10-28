// Reviewed educational questions only. No original PDF, exam emulator, or
// unrelated application's storage is read by this module.
export const PRACTICAL_KEY = 'na2_study_practical_v1';
// Persistence limits stop automatic saving, never ordinary in-memory practice.
export const MAX_PRACTICAL_BYTES = 5 * 1024 * 1024;
export const MAX_PRACTICAL_ATTEMPTS = 20000;
// Separate absolute bounds protect validation/backups from pathological inputs.
export const MAX_PRACTICAL_MEMORY_BYTES = 50 * 1024 * 1024;
export const MAX_PRACTICAL_MEMORY_ATTEMPTS = 200000;
export const MAX_PRACTICAL_ANSWER_LENGTH = 1000;

const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const plain = value => value !== null && typeof value === 'object'
  && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const copy = value => JSON.parse(JSON.stringify(value));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const bytes = value => new TextEncoder().encode(value).byteLength;
const requireThat = (ok, message) => { if (!ok) throw new Error(message); };
const modes = ['practice', 'review'];
const statuses = ['correct', 'incorrect', 'unanswered'];

function shape(value, required, label) {
  requireThat(plain(value), label + ' 형식이 올바르지 않습니다.');
  requireThat(required.every(key => own(value, key))
    && Object.keys(value).every(key => required.includes(key)),
  label + '의 필수 항목 또는 알 수 없는 항목을 확인해 주세요.');
}
function text(value, label, max = 1000) {
  requireThat(typeof value === 'string' && value.trim().length > 0 && value.length <= max,
    label + ' 문자열을 확인해 주세요.');
}
function identifier(value, label, max = 120) {
  requireThat(typeof value === 'string' && new RegExp('^[A-Za-z0-9_-]{1,' + max + '}$').test(value),
    label + ' 식별자가 올바르지 않습니다.');
}
function serialized(value, limit = MAX_PRACTICAL_MEMORY_BYTES) {
  const raw = JSON.stringify(value);
  requireThat(typeof raw === 'string' && bytes(raw) <= limit, '실기 기록의 크기가 허용 범위를 넘었습니다.');
  return raw;
}
function persistentRaw(state) {
  requireThat(state.attempts.length <= MAX_PRACTICAL_ATTEMPTS,
    '실기 기록의 자동 저장 한도(20000회)를 넘었습니다. 현재 학습 기록을 JSON으로 백업해 주세요.');
  return serialized(state, MAX_PRACTICAL_BYTES);
}
function isoMillis(value, label = '시간') {
  const match = typeof value === 'string'
    && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  requireThat(match, label + '에 유효한 ISO 날짜와 시간대가 필요합니다.');
  const [, y, m, d, hh, mm, ss] = match;
  const year = Number(y), month = Number(m), day = Number(d);
  requireThat(year >= 1970 && month >= 1 && month <= 12
    && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
    && Number(hh) <= 23 && Number(mm) <= 59 && Number(ss) <= 59,
  label + '의 날짜가 올바르지 않습니다.');
  if (match[8] !== 'Z') {
    const hours = Number(match[10]), minutes = Number(match[11]);
    requireThat(hours <= 14 && minutes <= 59 && (hours !== 14 || minutes === 0),
      label + '의 시간대가 올바르지 않습니다.');
  }
  const time = Date.parse(value);
  requireThat(Number.isFinite(time), label + '의 날짜가 올바르지 않습니다.');
  return time;
}
function normalize(answer, rules) {
  let result = answer;
  if (rules.trim) result = result.trim();
  if (rules.collapseWhitespace) result = result.replace(/\s+/gu, ' ');
  // Case-insensitive means English letters only; no NFKC, whitespace removal,
  // fuzzy matching, suffix stripping, or unreviewed synonyms.
  if (!rules.caseSensitive) result = result.replace(/[A-Z]/g, letter => letter.toLowerCase());
  return result;
}

/** Returns an exact status; a wrong answer is distinct from an invalid payload. */
export function gradeAnswer(question, answer) {
  if (!question || !['short', 'single', 'multiple'].includes(question.type)) return 'invalid';
  if (question.type === 'short') {
    if (typeof answer !== 'string' || answer.length > MAX_PRACTICAL_ANSWER_LENGTH) return 'invalid';
    const normalized = normalize(answer, question.normalization);
    if (!normalized.length) return 'unanswered';
    return question.acceptedAnswers.some(item => normalize(item, question.normalization) === normalized)
      ? 'correct' : 'incorrect';
  }
  if (!Array.isArray(answer) || answer.length > question.options.length
    || [...answer].some(id => typeof id !== 'string' || !question.options.some(option => option.id === id))
    || new Set(answer).size !== answer.length
    || (question.type === 'single' && answer.length > 1)) return 'invalid';
  if (!answer.length) return 'unanswered';
  return answer.length === question.answer.length && question.answer.every(id => answer.includes(id))
    ? 'correct' : 'incorrect';
}

/** Validate the public projection without importing the review-only source. */
export function prepareBank(raw) {
  serialized(raw, 1024 * 1024);
  shape(raw, ['version', 'title', 'source', 'evidence', 'questions'], '실기 문제은행');
  requireThat(typeof raw.version === 'string' && /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(raw.version),
    '문제은행 버전을 확인해 주세요.');
  text(raw.title, '문제은행 제목');
  shape(raw.source, ['filename', 'pages'], '문제은행 원자료');
  text(raw.source.filename, '원자료 파일명');
  requireThat(Number.isSafeInteger(raw.source.pages) && raw.source.pages > 0 && raw.source.pages <= 1000,
    '원자료 쪽수를 확인해 주세요.');
  requireThat(plain(raw.evidence) && Object.keys(raw.evidence).length <= 1000, '근거 목록을 확인해 주세요.');
  for (const [id, evidence] of Object.entries(raw.evidence)) {
    identifier(id, '근거');
    shape(evidence, ['title', 'url', 'locator', 'verifiedAt'], '근거');
    text(evidence.title, '근거 제목');
    text(evidence.locator, '근거 위치', 3000);
    text(evidence.url, '근거 URL', 3000);
    let url;
    try { url = new URL(evidence.url); } catch { throw new Error('근거 URL이 올바르지 않습니다.'); }
    requireThat(url.protocol === 'https:' && !url.username && !url.password, '근거는 HTTPS 문서 주소여야 합니다.');
    requireThat(typeof evidence.verifiedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(evidence.verifiedAt),
      '근거 확인일을 확인해 주세요.');
    isoMillis(evidence.verifiedAt + 'T00:00:00Z', '근거 확인일');
  }
  requireThat(Array.isArray(raw.questions) && raw.questions.length > 0 && raw.questions.length <= 1000,
    '실기 문항 목록을 확인해 주세요.');
  const ids = new Set(), referenced = new Set();
  for (const question of raw.questions) {
    const base = ['id', 'type', 'topic', 'prompt', 'answer', 'explanation', 'pdfPage',
      'sourceAnchor', 'evidenceIds', 'reviewStatus'];
    shape(question, base.concat(question?.type === 'short' ? ['acceptedAnswers', 'normalization'] : ['options']), '실기 문항');
    identifier(question.id, '문항');
    requireThat(!ids.has(question.id), '문항 식별자가 중복되었습니다.');
    ids.add(question.id);
    requireThat(['short', 'single', 'multiple'].includes(question.type) && question.reviewStatus === 'approved',
      '검수된 실기 문항만 사용할 수 있습니다.');
    text(question.topic, '문항 주제');
    text(question.prompt, '문항 지문', 10000);
    text(question.explanation, '문항 해설', 10000);
    text(question.sourceAnchor, 'PDF 원문 위치', 3000);
    requireThat(Number.isSafeInteger(question.pdfPage) && question.pdfPage >= 1
      && question.pdfPage <= raw.source.pages, '문항의 PDF 쪽수를 확인해 주세요.');
    requireThat(Array.isArray(question.evidenceIds) && question.evidenceIds.length > 0
      && question.evidenceIds.length <= 30 && new Set(question.evidenceIds).size === question.evidenceIds.length
      && question.evidenceIds.every(id => typeof id === 'string' && own(raw.evidence, id)),
    '문항의 근거 연결을 확인해 주세요.');
    question.evidenceIds.forEach(id => referenced.add(id));
    if (question.type === 'short') {
      shape(question.normalization, ['caseSensitive', 'trim', 'collapseWhitespace', 'ignoreWhitespace'], '단답형 정규화');
      requireThat(Object.values(question.normalization).every(value => typeof value === 'boolean')
        && question.normalization.ignoreWhitespace === false, '검수되지 않은 단답형 정규화입니다.');
      requireThat(Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0
        && question.acceptedAnswers.length <= 32, '단답형 허용 답안을 확인해 주세요.');
      question.acceptedAnswers.forEach(item => text(item, '단답형 허용 답안', MAX_PRACTICAL_ANSWER_LENGTH));
      text(question.answer, '대표 정답', MAX_PRACTICAL_ANSWER_LENGTH);
      requireThat(gradeAnswer(question, question.answer) === 'correct'
        && question.acceptedAnswers.every(item => gradeAnswer(question, item) === 'correct'),
      '대표 정답과 허용 답안이 일치하지 않습니다.');
    } else {
      requireThat(Array.isArray(question.options) && question.options.length >= 2
        && question.options.length <= 20, '선택지를 확인해 주세요.');
      const optionIds = new Set();
      for (const option of question.options) {
        shape(option, ['id', 'text'], '선택지');
        identifier(option.id, '선택지', 32);
        requireThat(!optionIds.has(option.id), '선택지 식별자가 중복되었습니다.');
        optionIds.add(option.id);
        text(option.text, '선택지 내용', 5000);
      }
      requireThat(Array.isArray(question.answer) && question.answer.length > 0
        && (question.type === 'single' ? question.answer.length === 1
          : question.answer.length >= 2 && question.answer.length < question.options.length)
        && gradeAnswer(question, question.answer) === 'correct', '선택형 정답을 확인해 주세요.');
    }
  }
  requireThat(Object.keys(raw.evidence).every(id => referenced.has(id)), '문항에서 사용하지 않는 근거가 포함되어 있습니다.');
  const bank = copy(raw);
  return { version: bank.version, questions: bank.questions,
    byId: Object.fromEntries(bank.questions.map(question => [question.id, question])),
    evidence: bank.evidence, source: bank.source, title: bank.title };
}

export const freshPractical = bank => ({ version: 1, bankVersion: bank.version, attempts: [], session: null });
const emptyAnswer = question => question.type === 'short' ? '' : [];
const hasQuestion = (bank, id) => typeof id === 'string' && own(bank.byId, id);

/** All stored results are recomputed; validation returns an independent clone. */
export function validatePractical(state, bank) {
  serialized(state);
  shape(state, ['version', 'bankVersion', 'attempts', 'session'], '실기 학습 기록');
  requireThat(state.version === 1 && state.bankVersion === bank.version, '실기 기록 또는 문제은행 버전이 다릅니다.');
  requireThat(Array.isArray(state.attempts) && state.attempts.length <= MAX_PRACTICAL_MEMORY_ATTEMPTS,
    '메모리의 실기 제출 기록 수가 절대 허용 범위를 넘었습니다.');
  const attemptsById = new Map(), groups = new Map(), finishedGroups = new Set();
  let lastTime = -Infinity, lastGroupId = null;
  for (const attempt of state.attempts) {
    shape(attempt, ['id', 'sessionId', 'questionId', 'bankVersion', 'answer', 'status', 'at', 'mode'], '제출 기록');
    identifier(attempt.sessionId, '학습 회차');
    requireThat(hasQuestion(bank, attempt.questionId) && modes.includes(attempt.mode)
      && attempt.bankVersion === bank.version, '제출 문항·모드·문제은행 버전을 확인해 주세요.');
    const group = groups.get(attempt.sessionId) || [];
    requireThat(attempt.id === attempt.sessionId + ':' + group.length && !attemptsById.has(attempt.id),
      '제출 기록이 중복되었거나 순서가 올바르지 않습니다.');
    requireThat(!group.some(item => item.questionId === attempt.questionId)
      && (!group.length || group[0].mode === attempt.mode), '같은 회차의 문항 또는 모드가 일치하지 않습니다.');
    if (lastGroupId !== attempt.sessionId) {
      if (lastGroupId !== null) finishedGroups.add(lastGroupId);
      requireThat(!finishedGroups.has(attempt.sessionId), '종료된 회차에 제출 기록이 뒤섞여 있습니다.');
      lastGroupId = attempt.sessionId;
    }
    const status = gradeAnswer(bank.byId[attempt.questionId], attempt.answer);
    requireThat(statuses.includes(attempt.status) && attempt.status === status,
      '저장된 채점 결과가 실제 답안과 다릅니다.');
    const at = isoMillis(attempt.at, '제출 시간');
    requireThat(at >= lastTime, '제출 시간 순서가 올바르지 않습니다.');
    lastTime = at;
    attemptsById.set(attempt.id, attempt);
    group.push(attempt);
    groups.set(attempt.sessionId, group);
  }
  const session = state.session;
  requireThat(session !== null || state.attempts.length === 0, '제출 기록에 연결된 학습 회차가 없습니다.');
  if (session !== null) {
    shape(session, ['id', 'questionIds', 'index', 'mode', 'startedAt', 'completedAt',
      'draft', 'submittedAttemptId'], '진행 중인 학습');
    identifier(session.id, '학습 회차');
    requireThat(modes.includes(session.mode), '학습 모드를 확인해 주세요.');
    requireThat(Array.isArray(session.questionIds) && session.questionIds.length > 0
      && session.questionIds.length <= bank.questions.length
      && new Set(session.questionIds).size === session.questionIds.length
      && session.questionIds.every(id => hasQuestion(bank, id)), '학습 문항 목록을 확인해 주세요.');
    requireThat(Number.isSafeInteger(session.index) && session.index >= 0
      && session.index < session.questionIds.length, '현재 문항 위치를 확인해 주세요.');
    const started = isoMillis(session.startedAt, '학습 시작 시간');
    const group = groups.get(session.id) || [];
    const current = bank.byId[session.questionIds[session.index]];
    requireThat(gradeAnswer(current, session.draft) !== 'invalid', '현재 문항의 초안 형식이 올바르지 않습니다.');
    requireThat(session.submittedAttemptId === null || typeof session.submittedAttemptId === 'string',
      '현재 제출 기록 식별자를 확인해 주세요.');
    requireThat(group.length === session.index + (session.submittedAttemptId === null ? 0 : 1),
      '현재 진행 위치와 제출 기록 수가 다릅니다.');
    if (group.length) {
      requireThat(lastGroupId === session.id, '현재 회차 뒤에 다른 회차 기록이 있습니다.');
      for (let index = 0; index < group.length; index++) {
        requireThat(group[index].questionId === session.questionIds[index] && group[index].mode === session.mode
          && isoMillis(group[index].at) >= started, '학습 회차와 제출 문항 또는 시간이 다릅니다.');
      }
    }
    const prior = state.attempts.filter(attempt => attempt.sessionId !== session.id).at(-1);
    requireThat(!prior || started >= isoMillis(prior.at), '학습 시작 시간이 이전 제출보다 빠릅니다.');
    if (session.submittedAttemptId !== null) {
      const saved = attemptsById.get(session.id + ':' + session.index);
      requireThat(saved && saved.id === session.submittedAttemptId && same(session.draft, saved.answer),
        '현재 초안과 제출 기록이 다릅니다.');
    }
    if (session.completedAt !== null) {
      const completed = isoMillis(session.completedAt, '회차 종료 시간');
      requireThat(session.index === session.questionIds.length - 1 && session.submittedAttemptId !== null
        && completed >= isoMillis(group.at(-1).at), '회차 종료 상태가 올바르지 않습니다.');
    }
  }
  return copy(state);
}

export function loadPractical(storage, bank) {
  let raw = null;
  try {
    raw = storage.getItem(PRACTICAL_KEY) ?? null;
    requireThat(raw === null || typeof raw === 'string', '저장소 원문 형식이 올바르지 않습니다.');
    if (raw === null) return { state: freshPractical(bank), canSave: true, warning: '', raw };
    requireThat(bytes(raw) <= MAX_PRACTICAL_BYTES, '저장소 기록이 허용 크기를 넘었습니다.');
    const state = validatePractical(JSON.parse(raw), bank);
    persistentRaw(state);
    return { state, canSave: true, warning: '', raw };
  } catch (error) {
    return { state: freshPractical(bank), canSave: false, raw,
      warning: '실기 기록을 읽지 못해 자동 저장을 중단했습니다. 기존 기록은 보존되어 있습니다. ' + error.message };
  }
}

/** Optimistic comparison prevents overwriting an already changed tab's data. */
export function savePractical(storage, state, bank, expectedRaw) {
  let current = expectedRaw ?? null;
  try {
    requireThat(expectedRaw === null || typeof expectedRaw === 'string', '이전에 읽은 저장소 원문이 필요합니다.');
    const nextRaw = persistentRaw(validatePractical(state, bank));
    current = storage.getItem(PRACTICAL_KEY) ?? null;
    requireThat(current === expectedRaw, '다른 창에서 실기 기록이 변경되었습니다. 새 기록을 덮어쓰지 않았습니다.');
    // Even a caller that ignores canSave cannot overwrite a corrupt/old record.
    if (current !== null) {
      requireThat(bytes(current) <= MAX_PRACTICAL_BYTES, '기존 기록의 크기를 확인해 주세요.');
      const prior = validatePractical(JSON.parse(current), bank);
      persistentRaw(prior);
      requireThat(prior.attempts.length <= state.attempts.length
        && prior.attempts.every((attempt, index) => same(attempt, state.attempts[index])),
      '이전 제출 기록을 삭제하거나 변경하는 저장은 허용하지 않습니다.');
    }
    storage.setItem(PRACTICAL_KEY, nextRaw);
    return { ok: true, raw: nextRaw, warning: '' };
  } catch (error) {
    return { ok: false, raw: current,
      warning: '실기 기록을 저장하지 못했습니다. 기존 기록은 보존되어 있습니다. ' + error.message };
  }
}

/** Events are append-only. CompletedAt records the round ending, not mastery. */
export function practicalReducer(state, action, bank) {
  const valid = validatePractical(state, bank);
  if (!plain(action) || typeof action.type !== 'string') return state;
  if (action.type === 'START') {
    identifier(action.id, '학습 회차');
    requireThat(action.id !== state.session?.id && !state.attempts.some(attempt => attempt.sessionId === action.id),
      '이미 사용한 학습 회차 식별자입니다.');
    const started = isoMillis(action.at, '학습 시작 시간');
    if (state.session) {
      requireThat(started >= isoMillis(state.session.completedAt || state.session.startedAt),
        '새 학습 시작 시간이 이전 회차보다 빠릅니다.');
    }
    requireThat(Array.isArray(action.questionIds) && action.questionIds.length > 0,
      '학습 문항 목록을 확인해 주세요.');
    const first = bank.byId[action.questionIds[0]];
    valid.session = { id: action.id, questionIds: copy(action.questionIds), index: 0,
      mode: action.mode, startedAt: action.at, completedAt: null,
      draft: first ? emptyAnswer(first) : '', submittedAttemptId: null };
    return validatePractical(valid, bank);
  }
  const session = valid.session;
  if (!session || session.completedAt !== null) return state;
  const question = bank.byId[session.questionIds[session.index]];
  if (action.type === 'DRAFT') {
    if (session.submittedAttemptId !== null || gradeAnswer(question, action.answer) === 'invalid') return state;
    session.draft = copy(action.answer);
  } else if (action.type === 'SUBMIT') {
    if (session.submittedAttemptId !== null) return state;
    const status = gradeAnswer(question, session.draft);
    if (status === 'invalid') return state;
    isoMillis(action.at, '제출 시간');
    const id = session.id + ':' + session.index;
    valid.attempts.push({ id, sessionId: session.id, questionId: question.id, bankVersion: bank.version,
      answer: copy(session.draft), status, at: action.at, mode: session.mode });
    session.submittedAttemptId = id;
  } else if (action.type === 'NEXT') {
    if (session.submittedAttemptId === null) return state;
    const at = isoMillis(action.at, '다음 문항 이동 시간');
    requireThat(at >= isoMillis(valid.attempts.at(-1).at), '다음 문항 이동 시간이 제출보다 빠릅니다.');
    if (session.index === session.questionIds.length - 1) session.completedAt = action.at;
    else {
      session.index += 1;
      session.draft = emptyAnswer(bank.byId[session.questionIds[session.index]]);
      session.submittedAttemptId = null;
    }
  } else return state;
  return validatePractical(valid, bank);
}

export function getLatestAttempts(state) {
  return Object.fromEntries(state.attempts.map(attempt => [attempt.questionId, copy(attempt)]));
}
export function wrongQuestionIds(state) {
  return Object.values(getLatestAttempts(state))
    .filter(attempt => attempt.status !== 'correct').map(attempt => attempt.questionId);
}
