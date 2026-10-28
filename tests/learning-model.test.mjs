import test from 'node:test';
import assert from 'node:assert/strict';
import { freshLearning, loadLearning, saveLearning, validateLearning, safeReturnPath, parseRoute, readAssessmentState, LEARNING_KEY } from '../src/learning-model.mjs';

test('학습센터는 새 저장 키만 사용하며 기존 앱 기록을 읽거나 수정하지 않는다', () => {
  const data = new Map([['commutenet_react_v3', '{original}'], ['na2_cabling_v1', '{original}']]);
  const keys = [];
  const store = { getItem: k => { keys.push(k); return data.get(k); }, setItem: (k,v) => { keys.push(k); data.set(k,v); } };
  const { state } = loadLearning(store);
  state.read.example = '2026-10-22T04:00:00.000Z';
  assert.equal(saveLearning(store, state).ok, true);
  assert.deepEqual([...new Set(keys)], [LEARNING_KEY]);
  assert.equal(data.get('commutenet_react_v3'), '{original}');
  assert.equal(data.get('na2_cabling_v1'), '{original}');
  assert.equal(loadLearning(store).state.read.example, state.read.example);
});
test('손상된 기록은 자동 덮어쓰기를 허용하지 않는다', () => {
  const result = loadLearning({ getItem: () => '{broken' });
  assert.equal(result.canSave, false);
  assert.match(result.warning, /보존/);
  assert.throws(() => validateLearning({ ...freshLearning(), version: 2 }));
  assert.throws(() => validateLearning({ ...freshLearning(), checks: { x: { answer: 1, correct: true, at: 'invalid' } } }));
});
test('저장 실패와 잘못된 복귀 경로를 처리한다', () => {
  assert.equal(saveLearning({ setItem() { throw new Error('quota'); } }, freshLearning()).ok, false);
  assert.equal(safeReturnPath('//evil.example'), '/learn');
  assert.equal(safeReturnPath('/written/question/2022-01-Q01'), '/written/question/2022-01-Q01');
  assert.equal(parseRoute('#/learn/theory/network-osi?from=%2Fwritten').params.get('from'), '/written');
});
test('평가 가드는 새 통합 앱 세션만 읽고 종료된 평가를 제외한다', () => {
  const calls = [];
  const data = { na2_study_written_v1: { session: { mode: 'exam' } }, na2_study_cabling_v1: { session: { mode: 'assessment', completedAt: '2026-10-22' } } };
  const result = readAssessmentState({ getItem(key) { calls.push(key); return JSON.stringify(data[key]); } });
  assert.deepEqual(result, { written: true, cabling: false });
  assert.deepEqual(calls, ['na2_study_written_v1', 'na2_study_cabling_v1']);
});
