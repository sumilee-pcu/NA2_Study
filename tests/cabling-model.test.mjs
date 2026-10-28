import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, STANDARDS, WIRE_IDS } from '../src/modules/cabling/content.mjs';
import {
  STORE_KEY, LEGACY_KEY, freshState, makeSession, reducer, grade, stats,
  loadState, saveState, validateBackup, exportBackup,
} from '../src/modules/cabling/model.mjs';

// H3C Appendix C의 핀표를 독립 전사한다. 구현 상수를 정답으로 사용하지 않는다.
const EXPECTED = {
  A: ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'],
  B: ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'],
};
const EXPECTED_WIRES = ['b', 'br', 'g', 'o', 'wb', 'wbr', 'wg', 'wo'];
const QUESTION = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]));
const BASE_TIME = '2026-10-20T03:00:00.000Z';
let fixtureSequence = 0;

function independentAnswer(id) {
  const parts = id.split('-');
  if (parts[0] === 'pin') return EXPECTED[parts[1]][Number(parts[2]) - 1];
  if (parts[0] === 'order') return [...EXPECTED[parts[1]]];
  return parts[1][0] === parts[1][1] ? 'straight' : 'crossover';
}

function started(ids, mode = 'practice', previous = freshState(), at = BASE_TIME) {
  const session = makeSession({
    kind: 'mixed', mode, count: ids.length, questionIds: ids, now: at, rng: () => 0.37,
  });
  session.id = `fixture-${++fixtureSequence}`;
  // 상태 전이 검사는 명시적인 문항 순서로 수행하고 섞기는 별도 검사한다.
  session.ids = [...ids];
  return reducer(previous, { type: 'START', session });
}

function answered(state, answer, at = BASE_TIME) {
  const drafted = reducer(state, { type: 'ANSWER', answer });
  return reducer(drafted, { type: 'SUBMIT', at: at });
}

function eventFor(previous, id, answer, mode = 'practice', at = BASE_TIME) {
  return answered(started([id], mode, previous, at), answer, at);
}

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const writes = [];
  return {
    data, writes,
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, String(value)); writes.push({ key, value }); },
    removeItem(key) { data.delete(key); writes.push({ key, removed: true }); },
  };
}

function localISO(year, month, day, hour = 12) {
  return new Date(year, month - 1, day, hour).toISOString();
}

test('문항은 핀 16개, 배열 2개, 유형 4개이며 ID가 중복되지 않는다', () => {
  assert.equal(QUESTIONS.length, 22);
  assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, 22);
  assert.equal(QUESTIONS.filter((question) => question.kind === 'pin').length, 16);
  assert.equal(QUESTIONS.filter((question) => question.kind === 'order').length, 2);
  assert.equal(QUESTIONS.filter((question) => question.kind === 'type').length, 4);
  assert.deepEqual([...WIRE_IDS].sort(), EXPECTED_WIRES);
  assert.deepEqual(STANDARDS.T568A, EXPECTED.A);
  assert.deepEqual(STANDARDS.T568B, EXPECTED.B);
});

test('A/B 16개 핀은 독립 핀표와 일치하고 다른 일곱 색상은 오답이다', () => {
  for (const standard of ['A', 'B']) {
    for (let pin = 1; pin <= 8; pin += 1) {
      const question = QUESTION[`pin-${standard}-${pin}`];
      assert.ok(question);
      for (const wire of EXPECTED_WIRES) {
        assert.equal(grade(question, wire), wire === EXPECTED[standard][pin - 1], `${question.id}: ${wire}`);
      }
    }
  }
});

test('배열은 8개 위치 전체를 채점하고 뒤바뀐 위치·빈 답·중복선을 오답 처리한다', () => {
  for (const standard of ['A', 'B']) {
    const question = QUESTION[`order-${standard}`];
    const answer = [...EXPECTED[standard]];
    assert.equal(grade(question, answer), true);
    const swapped = [...answer];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    assert.equal(grade(question, swapped), false);
    assert.equal(grade(question, answer.slice(0, 7)), false);
    assert.equal(grade(question, Array(8).fill(answer[0])), false);
    assert.equal(grade(question, null), false);
  }
});

test('A-A/B-B는 직결, A-B/B-A는 두 쌍 교차로 판정한다', () => {
  for (const pair of ['AA', 'AB', 'BA', 'BB']) {
    const question = QUESTION[`type-${pair}`];
    assert.ok(question);
    assert.equal(grade(question, 'straight'), pair === 'AA' || pair === 'BB');
    assert.equal(grade(question, 'crossover'), pair === 'AB' || pair === 'BA');
    assert.equal(grade(question, 'unknown'), false);
  }
});

test('회차의 전선 선택지는 8개를 한 번씩 포함하며 정답 순서에 고정되지 않는다', () => {
  const session = makeSession({ kind: 'order', mode: 'assessment', now: BASE_TIME, rng: () => 0.37 });
  assert.deepEqual([...session.palette].sort(), EXPECTED_WIRES);
  assert.notDeepEqual(session.palette, EXPECTED.A);
  assert.notDeepEqual(session.palette, EXPECTED.B);
});

test('답을 내지 않았거나 배열을 끝내지 않으면 기록과 진행 위치가 바뀌지 않는다', () => {
  const pin = started(['pin-A-1']);
  assert.equal(reducer(pin, { type: 'SUBMIT', at: BASE_TIME }).events.length, 0);
  assert.equal(reducer(pin, { type: 'NEXT', at: BASE_TIME }).session.index, 0);
  const order = started(['order-B']);
  assert.equal(answered(order, ['wo', 'o']).events.length, 0);
  assert.equal(answered(order, Array(8).fill('wo')).events.length, 0);
});

test('연속 제출은 이벤트 1건만 남기고 제출한 답은 변경할 수 없다', () => {
  const state = answered(started(['pin-A-1', 'pin-B-1']), 'wg');
  const repeated = reducer(state, { type: 'SUBMIT', at: '2026-10-20T03:00:01.000Z' });
  assert.equal(repeated.events.length, 1);
  assert.deepEqual(repeated.events, state.events);
  const changed = reducer(repeated, { type: 'ANSWER', answer: 'wo' });
  assert.deepEqual(changed.session.draft, state.session.draft);
  assert.equal(changed.events[0].correct, true);
});

test('수동 진행에서는 제출한 문항이 유지되고 NEXT에서만 다음 문항으로 간다', () => {
  const state = answered(started(['pin-A-1', 'pin-B-1']), 'wg');
  assert.equal(state.session.index, 0);
  assert.equal(state.session.ids[state.session.index], 'pin-A-1');
  assert.equal(state.session.submitted.correct, true);
  const next = reducer(state, { type: 'NEXT', at: BASE_TIME });
  assert.equal(next.session.index, 1);
  assert.equal(next.session.ids[next.session.index], 'pin-B-1');
  assert.equal(next.session.submitted, null);
  assert.equal(next.session.draft, null);
  assert.equal(reducer(next, { type: 'NEXT', at: BASE_TIME }).session.index, 1);
});

test('혼합 10문제 회차는 10건만 기록하고 마지막에서 종료된다', () => {
  const session = makeSession({ kind: 'mixed', mode: 'assessment', count: 10, now: BASE_TIME, rng: () => 0.37 });
  assert.equal(session.ids.length, 10);
  assert.equal(new Set(session.ids).size, 10);
  let state = reducer(freshState(), { type: 'START', session });
  for (let index = 0; index < 10; index += 1) {
    assert.equal(state.session.index, index);
    state = answered(state, independentAnswer(state.session.ids[index]));
    assert.equal(state.events.length, index + 1);
    state = reducer(state, { type: 'NEXT', at: BASE_TIME });
  }
  assert.ok(state.session.completedAt);
  assert.equal(state.events.length, 10);
  state = reducer(state, { type: 'SUBMIT', at: BASE_TIME });
  state = reducer(state, { type: 'NEXT', at: BASE_TIME });
  assert.equal(state.events.length, 10);
  assert.equal(new Set(state.events.map((event) => event.id)).size, 10);
});

test('백업 왕복은 제출 전 배열 초안과 제출 후 문항 잠금을 보존한다', () => {
  let state = started(['order-A', 'pin-B-1']);
  state = reducer(state, { type: 'ANSWER', answer: ['wg', 'g', 'wo'] });
  const draftRestored = validateBackup(JSON.parse(exportBackup(state)));
  assert.deepEqual(draftRestored.session, state.session);
  state = answered(state, EXPECTED.A);
  const submittedRestored = validateBackup(JSON.parse(exportBackup(state)));
  assert.deepEqual(submittedRestored.session, state.session);
  assert.deepEqual(submittedRestored.events, state.events);
  assert.equal(reducer(submittedRestored, { type: 'SUBMIT', at: BASE_TIME }).events.length, 1);
});

test('저장·재열기 후 현재 문항과 기록을 그대로 복원한다', () => {
  const state = answered(started(['pin-B-1', 'pin-A-8']), 'wo');
  const storage = memoryStorage();
  assert.equal(saveState(storage, state).ok, true);
  const loaded = loadState(storage);
  assert.deepEqual(loaded.state.session, state.session);
  assert.deepEqual(loaded.state.events, state.events);
});

test('기록 0건의 정답률은 계산 불가이고 7일의 모든 집계는 0이다', () => {
  const result = stats(freshState(), new Date(2026, 9, 22, 12));
  assert.equal(result.total, 0);
  assert.equal(result.correct, 0);
  assert.equal(result.accuracy, null);
  assert.equal(result.firstAccuracy, null);
  assert.equal(result.assessmentAccuracy, null);
  assert.equal(result.assessmentFirstAccuracy, null);
  assert.equal(result.studyDays, 0);
  assert.deepEqual(result.wrongIds, []);
  assert.equal(result.daily.length, 7);
  assert.ok(result.daily.every((day) => day.total === 0 && day.correct === 0));
});

test('실제 응답만 누적하고 최근 7일은 월 경계를 포함한 로컬 달력 날짜로 나눈다', () => {
  let state = freshState();
  state = eventFor(state, 'pin-A-1', 'wg', 'practice', localISO(2026, 9, 27));
  state = eventFor(state, 'pin-B-1', 'wo', 'practice', localISO(2026, 9, 28));
  state = eventFor(state, 'pin-A-2', 'o', 'practice', localISO(2026, 9, 30));
  state = eventFor(state, 'pin-B-2', 'o', 'practice', localISO(2026, 10, 4));
  const result = stats(state, new Date(2026, 9, 4, 12));
  assert.equal(result.total, 4);
  assert.equal(result.correct, 3);
  assert.equal(result.accuracy, 75);
  assert.equal(result.studyDays, 4);
  assert.deepEqual(result.daily.map((day) => day.date), [
    '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
  ]);
  assert.deepEqual(result.daily.map((day) => day.total), [1, 0, 1, 0, 0, 0, 1]);
  assert.deepEqual(result.daily.map((day) => day.correct), [1, 0, 0, 0, 0, 0, 1]);
  assert.equal(result.byKind.pin.total, 4);
  assert.equal(result.byKind.order.total, 0);
  assert.equal(result.byKind.type.total, 0);
});

test('평가 첫 응답은 연습·복습과 반복 평가를 제외하고 문항별 한 번만 계산한다', () => {
  let state = freshState();
  const add = (id, answer, mode, second) => {
    state = eventFor(state, id, answer, mode, `2026-10-20T03:00:${String(second).padStart(2, '0')}.000Z`);
  };
  add('pin-A-1', 'o', 'practice', 0);
  add('pin-A-1', 'wg', 'assessment', 1);
  add('pin-A-1', 'o', 'assessment', 2);
  add('pin-A-1', 'o', 'review', 3);
  add('pin-B-1', 'wo', 'practice', 4);
  add('pin-B-1', 'g', 'assessment', 5);
  add('pin-B-1', 'g', 'assessment', 6);
  add('pin-B-1', 'wo', 'review', 7);
  const result = stats(state, new Date(BASE_TIME));
  assert.equal(result.total, 8);
  assert.equal(result.correct, 3);
  assert.equal(result.firstAccuracy, 50);
  assert.equal(result.assessmentAccuracy, 25);
  assert.equal(result.assessmentFirstAccuracy, 50);
});

test('오답 복습 정답은 목록에서 빠지고 이후 오답은 다시 포함되며 이력은 보존된다', () => {
  let state = eventFor(freshState(), 'pin-A-1', 'o');
  assert.deepEqual(stats(state).wrongIds, ['pin-A-1']);
  state = eventFor(state, 'pin-A-1', 'wg', 'review', '2026-10-20T03:00:01.000Z');
  assert.deepEqual(stats(state).wrongIds, []);
  state = eventFor(state, 'pin-A-1', 'o', 'assessment', '2026-10-20T03:00:02.000Z');
  assert.deepEqual(stats(state).wrongIds, ['pin-A-1']);
  assert.equal(state.events.length, 3);
  assert.equal(state.events[0].correct, false);
  assert.equal(state.events[1].correct, true);
});

test('이전 저장 키의 원문을 변경하지 않고 과거 집계를 새 응답 통계에 합산하지 않는다', () => {
  const raw = '{"total":999,"correct":888,"history":[1,2,3],"unknown":"보존"}';
  const storage = memoryStorage({ [LEGACY_KEY]: raw });
  const loaded = loadState(storage);
  assert.equal(storage.getItem(LEGACY_KEY), raw);
  assert.equal(storage.writes.length, 0);
  assert.ok(loaded.state.legacy);
  assert.equal(stats(loaded.state).total, 0);
  assert.equal(saveState(storage, loaded.state).ok, true);
  assert.equal(storage.getItem(LEGACY_KEY), raw);
  assert.ok(storage.writes.every((write) => write.key !== LEGACY_KEY));
});

test('손상된 현재 JSON은 경고하고 원문을 보존한다', () => {
  const raw = '{"schemaVersion":1,"events":';
  const storage = memoryStorage({ [STORE_KEY]: raw });
  const loaded = loadState(storage);
  assert.ok(loaded.warning);
  assert.equal(loaded.state.events.length, 0);
  assert.equal(storage.getItem(STORE_KEY), raw);
  assert.equal(storage.writes.length, 0);
});

test('미래 버전의 백업을 거부하고 읽기 과정에서 덮어쓰지 않는다', () => {
  const invalid = { ...freshState(), schemaVersion: 999 };
  assert.throws(() => validateBackup(invalid));
  const raw = JSON.stringify(invalid);
  const storage = memoryStorage({ [STORE_KEY]: raw });
  assert.ok(loadState(storage).warning);
  assert.equal(storage.getItem(STORE_KEY), raw);
  assert.equal(storage.writes.length, 0);
});

test('중복 응답·잘못된 답안·날짜·임의 정오값이 있는 백업을 거부한다', () => {
  const state = answered(started(['pin-A-1']), 'wg');
  for (const mutate of [
    (value) => value.events.push({ ...value.events[0] }),
    (value) => { value.events[0].answer = 'invalid-wire'; },
    (value) => { value.events[0].submittedAt = 'not-a-date'; },
    (value) => { value.events[0].correct = false; },
    (value) => { value.events[0].questionId = 'missing-question'; },
  ]) {
    const invalid = structuredClone(state);
    mutate(invalid);
    assert.throws(() => validateBackup(invalid));
  }
});

test('읽기 금지·저장 용량 오류는 예외 전파 대신 명시적인 실패를 반환한다', () => {
  const readDenied = { getItem() { throw new Error('read denied'); } };
  const loaded = loadState(readDenied);
  assert.ok(loaded.warning);
  assert.equal(loaded.state.events.length, 0);
  const writeDenied = { setItem() { throw new Error('quota exceeded'); } };
  const saved = saveState(writeDenied, freshState());
  assert.equal(saved.ok, false);
  assert.ok(saved.error);
});

test('제작 연습은 600초 마감 시각과 6개 점검 항목을 만들고 새로고침 후 복원된다', () => {
  let state = reducer(freshState(), { type: 'PRACTICAL_START', at: BASE_TIME });
  assert.ok(state.practical.active);
  assert.equal(Date.parse(state.practical.active.deadlineAt) - Date.parse(BASE_TIME), 600_000);
  assert.deepEqual(state.practical.active.checks, [false, false, false, false, false, false]);
  state = reducer(state, { type: 'PRACTICAL_CHECK', index: 0, checked: true });
  state = reducer(state, { type: 'PRACTICAL_CHECK', index: 5, checked: true });
  const restored = validateBackup(JSON.parse(exportBackup(state)));
  assert.deepEqual(restored.practical, state.practical);
  assert.deepEqual(restored.practical.active.checks, [true, false, false, false, false, true]);
});

test('제작 완료는 시간과 자기점검만 1번 기록하고 퀴즈 통계에 합산하지 않는다', () => {
  let state = reducer(freshState(), { type: 'PRACTICAL_START', at: BASE_TIME });
  state = reducer(state, { type: 'PRACTICAL_CHECK', index: 0, checked: true });
  state = reducer(state, { type: 'PRACTICAL_FINISH', at: '2026-10-20T03:00:31.900Z' });
  assert.equal(state.practical.active, null);
  assert.equal(state.practical.records.length, 1);
  assert.equal(state.practical.records[0].elapsedSeconds, 31);
  assert.equal(state.practical.records[0].expired, false);
  assert.deepEqual(state.practical.records[0].checks, [true, false, false, false, false, false]);
  const repeated = reducer(state, { type: 'PRACTICAL_FINISH', at: '2026-10-20T03:00:32.000Z' });
  assert.deepEqual(repeated.practical.records, state.practical.records);
  assert.equal(stats(repeated).total, 0);
  assert.equal(stats(repeated).assessmentFirstAccuracy, null);
  assert.deepEqual(validateBackup(JSON.parse(exportBackup(repeated))).practical, repeated.practical);
});

test('타이머가 만료되면 600초로 기록하고 조작된 제작 백업은 거부한다', () => {
  let state = reducer(freshState(), { type: 'PRACTICAL_START', at: BASE_TIME });
  state = reducer(state, { type: 'PRACTICAL_FINISH', at: '2026-10-20T03:12:00.000Z' });
  assert.equal(state.practical.records[0].elapsedSeconds, 600);
  assert.equal(state.practical.records[0].expired, true);
  for (const mutate of [
    (value) => { value.practical.records[0].checks = [true]; },
    (value) => { value.practical.records[0].elapsedSeconds = 1; },
    (value) => { value.practical.records[0].expired = false; },
  ]) {
    const invalid = structuredClone(state);
    mutate(invalid);
    assert.throws(() => validateBackup(invalid));
  }
});

test('새 기록 초기화는 이전 버전 원문을 유지하고 퀴즈·제작 기록만 비운다', () => {
  const raw = '{"total":999,"memo":"keep exactly"}';
  const storage = memoryStorage({ [LEGACY_KEY]: raw });
  let state = eventFor(loadState(storage).state, 'pin-A-1', 'wg');
  state = reducer(state, { type: 'PRACTICAL_START', at: BASE_TIME });
  const legacy = structuredClone(state.legacy);
  state = reducer(state, { type: 'RESET' });
  assert.deepEqual(state.legacy, legacy);
  assert.equal(state.events.length, 0);
  assert.equal(state.session, null);
  assert.deepEqual(state.practical, { active: null, records: [] });
  assert.equal(saveState(storage, state).ok, true);
  assert.equal(storage.getItem(LEGACY_KEY), raw);
});
