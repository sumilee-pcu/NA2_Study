import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PRACTICAL_KEY, MAX_PRACTICAL_BYTES, MAX_PRACTICAL_ATTEMPTS, MAX_PRACTICAL_ANSWER_LENGTH,
  MAX_PRACTICAL_MEMORY_BYTES, MAX_PRACTICAL_MEMORY_ATTEMPTS,
  prepareBank, freshPractical, gradeAnswer, validatePractical, practicalReducer,
  loadPractical, savePractical, getLatestAttempts, wrongQuestionIds,
} from '../src/practical-model.mjs';
import { projectPracticalBank, serializePracticalBank } from '../scripts/prepare-practical-bank.mjs';

const review = JSON.parse(await readFile(new URL('../content-review/practical-bank.v1.json', import.meta.url), 'utf8'));
const publicRaw = await readFile(new URL('../src/content/practical-questions.json', import.meta.url), 'utf8');
const publicData = JSON.parse(publicRaw);
const bank = prepareBank(publicData);
const q = id => bank.byId['PRAC-' + String(id).padStart(3, '0')];
const clone = value => JSON.parse(JSON.stringify(value));
const at = second => new Date(Date.UTC(2026, 9, 23, 2, 0, second)).toISOString();
const start = (state = freshPractical(bank), ids = [q(4).id], id = 'session-1', second = 0, mode = 'practice') =>
  practicalReducer(state, { type: 'START', questionIds: ids, id, mode, at: at(second) }, bank);
const draft = (state, answer) => practicalReducer(state, { type: 'DRAFT', answer }, bank);
const submit = (state, second = 1) => practicalReducer(state, { type: 'SUBMIT', at: at(second) }, bank);
const next = (state, second = 2) => practicalReducer(state, { type: 'NEXT', at: at(second) }, bank);
function storage(raw = null) {
  const data = new Map(raw === null ? [] : [[PRACTICAL_KEY, raw]]);
  const calls = [];
  return { data, calls, getItem(key) { calls.push(['get', key]); return data.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key]); data.set(key, value); } };
}
// Build a valid history directly so a boundary test does not need thousands
// of reducer/serialization passes merely to reach its initial state.
function historyState(count, answer = 'ARP') {
  const state = freshPractical(bank);
  state.attempts = Array.from({ length: count }, (_, index) => ({
    id: 'history-' + index + ':0', sessionId: 'history-' + index,
    questionId: q(4).id, bankVersion: bank.version, answer,
    status: gradeAnswer(q(4), answer), at: at(index + 1), mode: 'practice',
  }));
  state.session = {
    id: 'continuing-' + count, questionIds: [q(4).id], index: 0, mode: 'practice',
    startedAt: at(count + 1), completedAt: null, draft: answer, submittedAttemptId: null,
  };
  return state;
}

test('배포 데이터는 검수 승인 문항과 참조 근거만 결정적으로 추출한다', () => {
  assert.equal(serializePracticalBank(review), publicRaw);
  const input = clone(review);
  input.secret = 'INTERNAL_MARKER';
  input.source.internal = 'INTERNAL_MARKER';
  input.questions[0].internal = 'INTERNAL_MARKER';
  input.questions.find(item => item.options).options[0].internal = 'INTERNAL_MARKER';
  input.questions.push({ id: 'NOT-APPROVED', reviewStatus: 'pending', internal: 'INTERNAL_MARKER' });
  input.evidence.UNUSED = { internal: 'INTERNAL_MARKER' };
  const before = JSON.stringify(input), output = serializePracticalBank(input);
  assert.equal(output, publicRaw);
  assert.equal(JSON.stringify(input), before);
  assert.equal(output.includes('excludedItems'), false);
  assert.equal(output.includes('sourceDisposition'), false);
  assert.equal(output.includes('INTERNAL_MARKER'), false);
  assert.deepEqual(Object.keys(JSON.parse(output)), ['version', 'title', 'source', 'evidence', 'questions']);
  assert.deepEqual(Object.keys(JSON.parse(output).source), ['filename', 'pages']);
  assert.equal(bank.questions.length, 24);
  assert.equal(Object.keys(bank.evidence).length, 21);
});

test('문제은행의 검수 상태·정답·선택지·근거·정규화 오류를 거부한다', () => {
  const cases = [
    data => { data.questions[0].reviewStatus = 'pending'; },
    data => { data.questions[1].id = data.questions[0].id; },
    data => { data.questions[0].evidenceIds = ['MISSING']; },
    data => { data.questions[0].normalization.ignoreWhitespace = true; },
    data => { data.questions[0].answer = 'wrong'; },
    data => { data.questions[8].answer = ['Z']; },
    data => { data.questions[8].options[1].id = data.questions[8].options[0].id; },
    data => { data.source.pages = 0; },
    data => { data.evidence.RFC4632.url = 'javascript:alert(1)'; },
    data => { data.evidence.RFC4632.verifiedAt = '2026-02-30'; },
    data => { data.excludedItems = []; },
  ];
  for (const mutate of cases) {
    const data = clone(publicData);
    mutate(data);
    assert.throws(() => prepareBank(data));
  }
  assert.throws(() => projectPracticalBank({ ...review, questions: [] }));
});

test('검수 24문항의 대표 정답과 모든 허용 답안이 정답으로 판정된다', () => {
  for (const question of bank.questions) {
    assert.equal(gradeAnswer(question, question.answer), 'correct', question.id);
    if (question.type === 'short') {
      for (const answer of question.acceptedAnswers) assert.equal(gradeAnswer(question, answer), 'correct', question.id);
    } else assert.equal(gradeAnswer(question, [...question.answer].reverse()), 'correct', question.id);
  }
  assert.equal(bank.byId instanceof Map, false);
});

test('단답형은 문항별 공백·대소문자 규칙만 적용하고 추정 정답을 인정하지 않는다', () => {
  const cases = [
    [4, ' arp ', 'correct'], [4, '\tArP\n', 'correct'], [4, 'A R P', 'incorrect'],
    [4, 'ARP입니다', 'incorrect'], [4, '주소 해석 프로토콜', 'incorrect'],
    [7, 'pwd', 'correct'], [7, ' PWD ', 'incorrect'], [7, 'pwd -P', 'incorrect'],
    [8, 'chmod', 'correct'], [8, 'CHMOD', 'incorrect'], [8, 'chmod 755', 'incorrect'],
    [3, '128', 'correct'], [3, '128bit', 'incorrect'], [3, '１２８', 'incorrect'],
    [2, '128.148.192.0', 'correct'], [2, '128.148.192.0/18', 'incorrect'],
    [1, '255.255.255.0', 'correct'], [1, '255. 255.255.0', 'incorrect'],
    [4, '', 'unanswered'], [4, ' \r\n\t ', 'unanswered'],
    [4, null, 'invalid'], [3, 128, 'invalid'], [4, [], 'invalid'],
    [4, 'x'.repeat(MAX_PRACTICAL_ANSWER_LENGTH + 1), 'invalid'],
  ];
  for (const [id, answer, expected] of cases) assert.equal(gradeAnswer(q(id), answer), expected, JSON.stringify([id, answer]));
});

test('단일선택은 유효한 선택지 한 개만 허용한다', () => {
  for (const [answer, expected] of [
    [['D'], 'correct'], [['A'], 'incorrect'], [[], 'unanswered'],
    [['D', 'A'], 'invalid'], [['D', 'D'], 'invalid'], [['Z'], 'invalid'],
    ['D', 'invalid'], [null, 'invalid'], [[null], 'invalid'], [Array(1), 'invalid'],
  ]) assert.equal(gradeAnswer(q(9), answer), expected);
});

test('복수선택은 정확한 집합으로만 채점하고 누락·추가·중복·unknown을 구분한다', () => {
  for (const [answer, expected] of [
    [['D', 'A', 'C'], 'correct'], [['A', 'C'], 'incorrect'],
    [['A', 'B', 'C', 'D'], 'incorrect'], [['A', 'A', 'C', 'D'], 'invalid'],
    [['A', 'C', 'D', 'Z'], 'invalid'], [[], 'unanswered'], ['ACD', 'invalid'],
    [[null], 'invalid'], [Array(1), 'invalid'],
  ]) assert.equal(gradeAnswer(q(18), answer), expected);
});

test('초안과 제출 직후 상태가 새로고침을 거쳐 동일하게 복구된다', () => {
  const store = storage();
  let loaded = loadPractical(store, bank);
  assert.deepEqual(loaded, { state: freshPractical(bank), canSave: true, warning: '', raw: null });
  let state = start(loaded.state);
  state = draft(state, ' arp ');
  let saved = savePractical(store, state, bank, loaded.raw);
  assert.equal(saved.ok, true);
  loaded = loadPractical(store, bank);
  assert.equal(loaded.state.session.draft, ' arp ');
  assert.equal(loaded.state.session.submittedAttemptId, null);
  state = submit(loaded.state);
  saved = savePractical(store, state, bank, loaded.raw);
  assert.equal(saved.ok, true);
  loaded = loadPractical(store, bank);
  assert.equal(loaded.state.session.submittedAttemptId, 'session-1:0');
  assert.equal(loaded.state.attempts[0].answer, ' arp ');
  assert.equal(loaded.state.attempts[0].status, 'correct');
  assert.deepEqual(loaded.state, state);
  assert.deepEqual([...new Set(store.calls.map(call => call[1]))], [PRACTICAL_KEY]);
});

test('중복 제출·제출 후 편집·제출 전 다음은 무효이며 이력은 한 번만 추가된다', () => {
  const initial = start(undefined, [q(4).id, q(18).id]);
  assert.equal(next(initial), initial);
  const submitted = submit(draft(initial, 'ARP'));
  assert.equal(submit(submitted), submitted);
  assert.equal(draft(submitted, 'wrong'), submitted);
  assert.equal(submitted.attempts.length, 1);
  const advanced = next(submitted);
  assert.equal(advanced.session.index, 1);
  assert.deepEqual(advanced.session.draft, []);
  assert.equal(advanced.session.submittedAttemptId, null);
  const done = next(submit(draft(advanced, ['A', 'C', 'D']), 3), 4);
  assert.equal(done.session.completedAt, at(4));
  assert.equal(next(done, 5), done);
  assert.equal(submit(done, 5), done);
});

test('빈 답은 미응답 이력으로 저장하고 회차 종료 후 복습 목록에 남는다', () => {
  let state = start(undefined, [q(4).id, q(18).id]);
  state = submit(draft(state, '  '));
  assert.equal(state.attempts[0].status, 'unanswered');
  assert.equal(state.attempts[0].answer, '  ');
  state = next(state);
  state = submit(state, 3);
  assert.equal(state.attempts[1].status, 'unanswered');
  state = next(state, 4);
  assert.equal(state.session.completedAt, at(4));
  assert.deepEqual(wrongQuestionIds(state), [q(4).id, q(18).id]);
});

test('오답 재풀이에서 최신 정답이 복습 목록에서 빠져도 이전 이력은 보존된다', () => {
  let state = next(submit(draft(start(), 'wrong')));
  const oldAttempt = clone(state.attempts[0]);
  assert.deepEqual(wrongQuestionIds(state), [q(4).id]);
  state = start(state, wrongQuestionIds(state), 'review-1', 3, 'review');
  state = next(submit(draft(state, 'ARP'), 4), 5);
  assert.equal(state.attempts.length, 2);
  assert.deepEqual(state.attempts[0], oldAttempt);
  assert.equal(state.attempts[1].mode, 'review');
  assert.deepEqual(wrongQuestionIds(state), []);
  const latest = getLatestAttempts(state);
  assert.equal(latest instanceof Map, false);
  assert.equal(latest[q(4).id].id, 'review-1:0');
  latest[q(4).id].answer = 'changed';
  assert.equal(state.attempts[1].answer, 'ARP');
});

test('새 회차 시작은 이전 이력을 보존하고 중복 회차 ID를 거부한다', () => {
  const old = submit(draft(start(), 'ARP'));
  const newer = start(old, [q(1).id], 'session-2', 2);
  assert.deepEqual(newer.attempts, old.attempts);
  assert.equal(newer.session.id, 'session-2');
  assert.throws(() => start(newer, [q(4).id], 'session-1', 3));
  assert.throws(() => start(newer, [q(4).id], 'session-2', 3));
  assert.throws(() => start(newer, [], 'session-3', 3));
  assert.throws(() => start(newer, [q(4).id, q(4).id], 'session-3', 3));
  assert.throws(() => start(newer, ['UNKNOWN'], 'session-3', 3));
});

test('반환 상태는 원본 상태·입력 답안 배열과 분리된다', () => {
  const state = start(undefined, [q(18).id]);
  const answer = ['A', 'C', 'D'];
  const before = clone(state);
  const changed = draft(state, answer);
  answer.pop();
  assert.deepEqual(state, before);
  assert.deepEqual(changed.session.draft, ['A', 'C', 'D']);
  const submitted = submit(changed);
  changed.session.draft.pop();
  assert.deepEqual(submitted.attempts[0].answer, ['A', 'C', 'D']);
  const checked = validatePractical(submitted, bank);
  checked.attempts[0].answer.pop();
  assert.deepEqual(submitted.attempts[0].answer, ['A', 'C', 'D']);
});

test('손상된 기록·버전 불일치·빈 문자열 원문은 읽기와 저장 모두에서 보존된다', () => {
  for (const raw of ['{broken', '', 'null',
    JSON.stringify({ ...freshPractical(bank), version: 2 }),
    JSON.stringify({ ...freshPractical(bank), bankVersion: '9.0.0' }),
  ]) {
    const store = storage(raw);
    const loaded = loadPractical(store, bank);
    assert.equal(loaded.canSave, false);
    assert.equal(loaded.raw, raw);
    assert.match(loaded.warning, /보존/);
    const saved = savePractical(store, start(), bank, loaded.raw);
    assert.equal(saved.ok, false);
    assert.equal(store.data.get(PRACTICAL_KEY), raw);
    assert.equal(store.calls.some(call => call[0] === 'set'), false);
  }
});

test('다른 창에서 변경·삭제·생성한 저장소를 CAS 비교로 덮어쓰지 않는다', () => {
  const store = storage();
  const a = loadPractical(store, bank), b = loadPractical(store, bank);
  const savedA = savePractical(store, start(a.state), bank, a.raw);
  assert.equal(savedA.ok, true);
  const savedB = savePractical(store, start(b.state, [q(1).id], 'other'), bank, b.raw);
  assert.equal(savedB.ok, false);
  assert.match(savedB.warning, /다른 창/);
  assert.equal(store.data.get(PRACTICAL_KEY), savedA.raw);
  store.data.delete(PRACTICAL_KEY);
  assert.equal(savePractical(store, draft(start(), 'ARP'), bank, savedA.raw).ok, false);
  assert.equal(store.data.has(PRACTICAL_KEY), false);
  assert.equal(savePractical(store, start(), bank, undefined).ok, false);
});

test('저장소 읽기·용량 실패를 알리고 다른 저장 키와 기존 기록을 보존한다', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { assert.fail('must not write'); } };
  assert.equal(loadPractical(denied, bank).canSave, false);
  assert.equal(savePractical(denied, start(), bank, null).ok, false);
  const original = JSON.stringify(start());
  const store = storage(original);
  store.data.set('na2_study_written_v1', '{written}');
  store.data.set('na2_study_cabling_v1', '{cabling}');
  store.setItem = () => { throw new Error('QuotaExceededError'); };
  const result = savePractical(store, draft(start(), 'ARP'), bank, original);
  assert.equal(result.ok, false);
  assert.match(result.warning, /QuotaExceededError/);
  assert.equal(store.data.get(PRACTICAL_KEY), original);
  assert.equal(store.data.get('na2_study_written_v1'), '{written}');
  assert.equal(store.data.get('na2_study_cabling_v1'), '{cabling}');
});

test('기존 이력을 삭제하거나 이미 저장된 제출 답안을 바꿔 저장할 수 없다', () => {
  const state = next(submit(draft(start(), 'wrong')));
  const original = JSON.stringify(state), store = storage(original);
  assert.equal(savePractical(store, freshPractical(bank), bank, original).ok, false);
  const changed = clone(state);
  changed.attempts[0].answer = 'ARP';
  changed.attempts[0].status = 'correct';
  changed.session.draft = 'ARP';
  assert.equal(savePractical(store, changed, bank, original).ok, false);
  assert.equal(store.data.get(PRACTICAL_KEY), original);
});

test('기록의 실제 정답·시간·진행 위치·식별자를 검증한다', () => {
  const state = next(submit(draft(start(), 'ARP')));
  const cases = [
    value => { value.attempts[0].status = 'incorrect'; },
    value => { value.attempts[0].questionId = 'UNKNOWN'; },
    value => { value.attempts[0].bankVersion = '0.0.1'; },
    value => { value.attempts.push(clone(value.attempts[0])); },
    value => { value.attempts[0].id = 'session-1:1'; },
    value => { value.attempts[0].at = '2026-02-30T00:00:00Z'; },
    value => { value.attempts[0].at = '2026-10-23'; },
    value => { value.attempts[0].at = '2026-10-23T02:00:00+14:01'; },
    value => { value.attempts[0].at = at(-1); },
    value => { value.session.completedAt = at(0); },
    value => { value.session.submittedAttemptId = null; },
    value => { value.session.draft = 'different'; },
    value => { value.session.index = 1; },
    value => { value.session = null; },
    value => { value.extra = true; },
  ];
  for (const mutate of cases) {
    const value = clone(state);
    mutate(value);
    assert.throws(() => validatePractical(value, bank));
  }
  const offset = clone(state);
  offset.attempts[0].at = '2026-10-23T11:00:01+09:00';
  assert.doesNotThrow(() => validatePractical(offset, bank));
});

test('잘못된 답안은 초안에 반영되지 않으며 제출될 수 없다', () => {
  const state = start(undefined, [q(18).id]);
  assert.equal(draft(state, ['A', 'A']), state);
  assert.equal(draft(state, ['Z']), state);
  const tampered = clone(state);
  tampered.session.draft = ['A', 'A'];
  assert.throws(() => practicalReducer(tampered, { type: 'SUBMIT', at: at(1) }, bank));
  assert.equal(state.attempts.length, 0);
});

test('저장소의 원문 크기 한도를 넘는 기록을 잘라내거나 덮어쓰지 않는다', () => {
  const huge = ' '.repeat(MAX_PRACTICAL_BYTES + 1);
  const store = storage(huge);
  assert.equal(loadPractical(store, bank).canSave, false);
  assert.equal(savePractical(store, start(), bank, huge).ok, false);
  assert.equal(store.data.get(PRACTICAL_KEY), huge);
});

test('유효한 2001회 이력은 저장과 새로고침 복구가 가능하다', () => {
  const state = historyState(2001);
  const store = storage();
  const saved = savePractical(store, state, bank, null);
  assert.equal(saved.ok, true);
  const loaded = loadPractical(store, bank);
  assert.equal(loaded.canSave, true);
  assert.equal(loaded.state.attempts.length, 2001);
  assert.deepEqual(loaded.state, state);
  assert.equal(MAX_PRACTICAL_ATTEMPTS, 20000);
  assert.equal(MAX_PRACTICAL_BYTES, 5 * 1024 * 1024);
});

test('20000회 저장 경계 이후에는 저장을 중단하되 메모리 풀이와 전체 백업은 계속한다', () => {
  const initial = historyState(MAX_PRACTICAL_ATTEMPTS);
  const store = storage();
  const saved = savePractical(store, initial, bank, null);
  assert.equal(saved.ok, true);
  const original = saved.raw;
  const continued = submit(initial, MAX_PRACTICAL_ATTEMPTS + 2);
  assert.equal(continued.attempts.length, MAX_PRACTICAL_ATTEMPTS + 1);
  assert.equal(continued.attempts.at(-1).status, 'correct');
  const blocked = savePractical(store, continued, bank, original);
  assert.equal(blocked.ok, false);
  assert.match(blocked.warning, /자동 저장 한도/);
  assert.equal(store.data.get(PRACTICAL_KEY), original);
  const ended = next(continued, MAX_PRACTICAL_ATTEMPTS + 3);
  const newRound = start(ended, [q(4).id], 'after-storage-cap', MAX_PRACTICAL_ATTEMPTS + 4);
  const latest = submit(draft(newRound, 'wrong'), MAX_PRACTICAL_ATTEMPTS + 5);
  assert.equal(latest.attempts.length, MAX_PRACTICAL_ATTEMPTS + 2);
  assert.equal(latest.attempts.at(-1).status, 'incorrect');
  assert.deepEqual(latest.attempts.slice(0, initial.attempts.length), initial.attempts);
  const backup = JSON.stringify(validatePractical(latest, bank));
  const restored = validatePractical(JSON.parse(backup), bank);
  assert.deepEqual(restored, latest);
  assert.equal(JSON.parse(backup).attempts.length, MAX_PRACTICAL_ATTEMPTS + 2);
  const oversizedStore = storage(backup);
  const loaded = loadPractical(oversizedStore, bank);
  assert.equal(loaded.canSave, false);
  assert.equal(loaded.raw, backup);
  assert.equal(savePractical(oversizedStore, start(), bank, loaded.raw).ok, false);
  assert.equal(oversizedStore.data.get(PRACTICAL_KEY), backup);
});

test('UTF-8 바이트 기준 저장 한도 이후에도 메모리 제출과 JSON 백업을 보존한다', () => {
  const state = historyState(1800, '가'.repeat(MAX_PRACTICAL_ANSWER_LENGTH));
  const raw = JSON.stringify(state);
  assert.ok(raw.length < MAX_PRACTICAL_BYTES, '문자 수는 저장 한도보다 작아야 한다');
  assert.ok(new TextEncoder().encode(raw).byteLength > MAX_PRACTICAL_BYTES, 'UTF-8 바이트는 저장 한도를 넘어야 한다');
  assert.ok(new TextEncoder().encode(raw).byteLength < MAX_PRACTICAL_MEMORY_BYTES);
  assert.doesNotThrow(() => validatePractical(state, bank));
  const original = JSON.stringify(freshPractical(bank)), store = storage(original);
  assert.equal(savePractical(store, state, bank, original).ok, false);
  assert.equal(store.data.get(PRACTICAL_KEY), original);
  const continued = submit(state, 1802);
  assert.equal(continued.attempts.length, 1801);
  assert.equal(continued.attempts.at(-1).status, 'incorrect');
  const backup = JSON.stringify(validatePractical(continued, bank));
  assert.deepEqual(validatePractical(JSON.parse(backup), bank), continued);
  const oversizedStore = storage(backup);
  assert.equal(loadPractical(oversizedStore, bank).canSave, false);
  assert.equal(oversizedStore.data.get(PRACTICAL_KEY), backup);
});

test('메모리 절대한도는 저장소 한도와 분리해 과도한 입력을 거부한다', () => {
  assert.equal(MAX_PRACTICAL_MEMORY_ATTEMPTS, 200000);
  assert.equal(MAX_PRACTICAL_MEMORY_BYTES, 50 * 1024 * 1024);
  const state = freshPractical(bank);
  state.attempts = Array(MAX_PRACTICAL_MEMORY_ATTEMPTS + 1).fill(null);
  assert.throws(() => validatePractical(state, bank), /절대 허용/);
});
