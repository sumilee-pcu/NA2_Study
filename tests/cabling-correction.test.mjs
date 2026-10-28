import test from 'node:test';
import assert from 'node:assert/strict';
import { STORE_KEY, LEGACY_KEY, freshState, makeSession, reducer, stats, pinDiagnostics, loadState, saveState, validateBackup, exportBackup } from '../src/modules/cabling/model.mjs';

const A = ['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br'];
const B = ['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br'];
const TIME = '2026-10-20T03:00:00.000Z';
const LATER = '2026-10-20T03:01:00.000Z';
let seq = 0;
function submit(state, id, answer, mode = 'practice') {
  const session = makeSession({ mode, count: 1, questionIds: [id], now: TIME });
  session.id = `correction-test-${++seq}`;
  state = reducer(state, { type: 'START', session });
  state = reducer(state, { type: 'ANSWER', answer });
  return reducer(state, { type: 'SUBMIT', at: TIME });
}
function swap(state, from, to) {
  return reducer(reducer(state, { type: 'CORRECTION_SELECT', pin: from }), { type: 'CORRECTION_SELECT', pin: to });
}
function generated(standard = 'T568A', state = freshState()) {
  return reducer(state, { type: 'CORRECTION_START', standard, pair: [0, 1], at: TIME });
}

test('통합 저장소는 기존 독립 앱의 두 저장 키를 읽거나 쓰지 않는다', () => {
  const reads = [], writes = [];
  const storage = { getItem(key) { reads.push(key); return null; }, setItem(key, raw) { writes.push([key, raw]); } };
  assert.equal(STORE_KEY, 'na2_study_cabling_v1');
  assert.notEqual(LEGACY_KEY, 'cabling-trainer-progress');
  assert.equal(loadState(storage).canSave, true);
  assert.equal(saveState(storage, freshState()).ok, true);
  assert.deepEqual(reads, [STORE_KEY, LEGACY_KEY]);
  assert.deepEqual(writes.map(([key]) => key), [STORE_KEY]);
});

test('핀 진단은 A/B 16개이며 무응답의 정답률은 0%로 만들지 않는다', () => {
  const diagnosis = pinDiagnostics(freshState());
  assert.equal(diagnosis.rows.length, 16);
  assert.equal(diagnosis.rows.filter(row => row.standard === 'T568A').length, 8);
  assert.ok(diagnosis.rows.every(row => row.standalone.accuracy === null && row.position.accuracy === null));
  assert.deepEqual(diagnosis.reviewIds, []);
});

test('배열 한 번은 누적 1건이며 핀 단독 기록과 위치 진단을 분리한다', () => {
  let state = submit(freshState(), 'order-A', [A[1], A[0], ...A.slice(2)]);
  state = submit(state, 'pin-A-1', A[0]);
  const diagnosis = pinDiagnostics(state);
  assert.equal(stats(state).total, 2);
  assert.equal(diagnosis.orderSubmissions, 1);
  assert.equal(diagnosis.pinSubmissions, 1);
  const first = diagnosis.rows[0], third = diagnosis.rows[2];
  assert.deepEqual([first.standalone.total, first.standalone.correct, first.position.total, first.position.correct], [1, 1, 1, 0]);
  assert.deepEqual([third.standalone.total, third.position.total, third.position.correct], [0, 1, 1]);
  assert.deepEqual(diagnosis.reviewIds, ['pin-A-1', 'pin-A-2']);
  assert.equal(state.events.length, 2);
});

test('진행 중인 평가의 핀과 위치 진단은 원본 상태를 전달해도 숨긴다', () => {
  let state = submit(freshState(), 'order-B', B, 'assessment');
  assert.equal(pinDiagnostics(state).orderSubmissions, 0);
  assert.ok(pinDiagnostics(state).rows.every(row => row.position.total === 0));
  state = reducer(state, { type: 'NEXT', at: LATER });
  assert.equal(pinDiagnostics(state).orderSubmissions, 1);
  assert.equal(pinDiagnostics(state).rows.find(row => row.standard === 'T568B').position.accuracy, 100);
});

test('생성 교정은 정확히 두 핀을 교환하며 원본을 변경하지 않는다', () => {
  let state = generated();
  const original = [...state.corrections.active.original];
  assert.deepEqual(original, [A[1], A[0], ...A.slice(2)]);
  state = swap(state, 0, 1);
  assert.deepEqual(state.corrections.active.draft, A);
  assert.deepEqual(state.corrections.active.original, original);
  assert.equal(state.corrections.active.swaps, 1);
  assert.equal(state.events.length, 0);
});

test('실제 오답 교정 완료는 원본 제출과 점수와 오답 목록을 보존한다', () => {
  let state = submit(freshState(), 'order-B', [B[1], B[0], ...B.slice(2)]);
  const events = structuredClone(state.events), before = stats(state);
  state = reducer(state, { type: 'CORRECTION_START', standard: 'T568B', sourceEventId: events[0].id, at: TIME });
  state = swap(state, 0, 1);
  state = reducer(state, { type: 'CORRECTION_FINISH', at: LATER });
  assert.deepEqual(state.events, events);
  assert.deepEqual(stats(state), before);
  assert.deepEqual(stats(state).wrongIds, ['order-B']);
  assert.equal(state.corrections.records.length, 1);
  assert.equal(state.corrections.records[0].sourceEventId, events[0].id);
  assert.deepEqual(state.corrections.records[0].original, events[0].answer);
  assert.deepEqual(state.corrections.records[0].answer, B);
  assert.equal(state.corrections.active.completedAt, LATER);
});

test('교정은 오답 상태에서 완료할 수 없고 완료·교환을 중복 반영하지 않는다', () => {
  const initial = generated();
  assert.equal(reducer(initial, { type: 'CORRECTION_FINISH', at: LATER }), initial);
  let state = swap(initial, 0, 1);
  state = reducer(state, { type: 'CORRECTION_FINISH', at: LATER });
  assert.equal(reducer(state, { type: 'CORRECTION_FINISH', at: LATER }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_SELECT', pin: 0 }), state);
  assert.equal(state.corrections.records.length, 1);
});

test('새로고침·백업은 선택한 첫 핀과 교정 원본과 완료 기록을 복원한다', () => {
  let state = reducer(generated(), { type: 'CORRECTION_SELECT', pin: 0 });
  const storage = new Map();
  assert.equal(saveState({ setItem: (key, raw) => storage.set(key, raw) }, state).ok, true);
  state = loadState({ getItem: key => storage.get(key) ?? null }).state;
  assert.equal(state.corrections.active.selectedPin, 0);
  state = reducer(state, { type: 'CORRECTION_SELECT', pin: 1 });
  state = reducer(state, { type: 'CORRECTION_FINISH', at: LATER });
  assert.deepEqual(validateBackup(JSON.parse(exportBackup(state))), state);
});

test('교정 이후 무힌트 새 평가는 새 제출만 더하며 과거 오답을 덮어쓰지 않는다', () => {
  let state = submit(freshState(), 'order-A', [A[1], A[0], ...A.slice(2)]);
  state = reducer(state, { type: 'CORRECTION_START', standard: 'T568A', sourceEventId: state.events[0].id, at: TIME });
  state = reducer(swap(state, 0, 1), { type: 'CORRECTION_FINISH', at: LATER });
  const savedWrong = structuredClone(state.events[0]);
  state = submit(state, 'order-A', A, 'assessment');
  assert.equal(state.events.length, 2);
  assert.deepEqual(state.events[0], savedWrong);
  assert.equal(state.events[1].mode, 'assessment');
  assert.equal(stats(state).assessmentFirstAccuracy, 100);
  assert.equal(stats(state).firstAccuracy, 0);
  assert.equal(state.corrections.records.length, 1);
});

test('진행 중인 평가는 교정 시작·교환·완료로 정답을 우회하지 못한다', () => {
  let state = swap(generated(), 0, 1);
  state = submit(state, 'pin-A-1', 'o', 'assessment');
  assert.equal(reducer(state, { type: 'CORRECTION_START', standard: 'T568A', at: LATER }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_SELECT', pin: 0 }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_FINISH', at: LATER }), state);
});

test('schema 1 명시적 가져오기는 이전 기록을 보존하고 빈 교정을 추가한다', () => {
  const old = submit(freshState(), 'pin-B-1', 'wo');
  delete old.corrections; old.schemaVersion = 1;
  const migrated = validateBackup(old);
  assert.equal(migrated.schemaVersion, 2);
  assert.deepEqual(migrated.events, old.events);
  assert.deepEqual(migrated.corrections, { active: null, records: [] });
  assert.equal(old.schemaVersion, 1);
  assert.equal('corrections' in old, false);
});

test('백업 검증은 위조 원본·교정 정답·중복 완료·미래 버전·추가 필드를 거부한다', () => {
  let state = submit(freshState(), 'order-A', [A[1], A[0], ...A.slice(2)]);
  state = reducer(state, { type: 'CORRECTION_START', standard: 'T568A', sourceEventId: state.events[0].id, at: TIME });
  state = reducer(swap(state, 0, 1), { type: 'CORRECTION_FINISH', at: LATER });
  for (const alter of [
    value => { value.corrections.records[0].original = B; },
    value => { value.corrections.records[0].answer = B; },
    value => { value.corrections.records.push(structuredClone(value.corrections.records[0])); },
    value => { value.corrections.active.swaps += 1; },
    value => { value.schemaVersion = 3; },
    value => { value.corrections.records[0].unexpected = true; },
  ]) {
    const invalid = structuredClone(state); alter(invalid);
    assert.throws(() => validateBackup(invalid));
  }
});

test('초기화는 교정 진행·완료를 지우고 잘못된 핀·규격·원본은 상태를 유지한다', () => {
  let state = generated();
  assert.equal(reducer(state, { type: 'CORRECTION_SELECT', pin: 8 }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_START', standard: 'T568C', at: TIME }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_START', standard: 'T568A', pair: [1, 1], at: TIME }), state);
  assert.equal(reducer(state, { type: 'CORRECTION_START', standard: 'T568A', sourceEventId: 'missing', at: TIME }), state);
  state = reducer(swap(state, 0, 1), { type: 'CORRECTION_FINISH', at: LATER });
  assert.deepEqual(reducer(state, { type: 'RESET' }).corrections, { active: null, records: [] });
});
