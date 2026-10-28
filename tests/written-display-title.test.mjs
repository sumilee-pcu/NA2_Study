import test from 'node:test';
import assert from 'node:assert/strict';
import { displayWrittenTitle } from '../src/modules/written/display-title.mjs';
import { WRITTEN_STORE_KEY, readWrittenProgress } from '../src/modules/written/integration.mjs';

test('기존 세션과 학습 이력은 새 제목으로 표시하되 저장된 제목과 답안을 보존한다', () => {
  const saved = {
    progress: { 'Q-1': { attempts: 2, correct: 1, lastCorrect: false, lastChoice: 3 } },
    bookmarks: ['Q-1'], notes: {}, days: ['2026-10-23'],
    session: { title: '오늘의 10문항', ids: ['Q-1'], answers: { 'Q-1': 3 }, index: 0 },
    history: [{ title: '오답 복습 · 7문항', total: 7, correct: 4, unanswered: 1 }],
  };
  const original = JSON.stringify(saved);
  const values = new Map([[WRITTEN_STORE_KEY, original]]);
  const writes = [];
  const restored = readWrittenProgress({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { writes.push(key); values.set(key, value); },
  });
  assert.equal(displayWrittenTitle(restored.session.title), '미풀이 우선 10문항');
  assert.equal(displayWrittenTitle(restored.history[0].title), '오답·미응답 복습 · 7문항');
  assert.deepEqual(restored, saved);
  assert.equal(values.get(WRITTEN_STORE_KEY), original);
  assert.deepEqual(writes, []);
});

test('기존 확인창 제목만 변환하고 이미 바뀐 제목은 반복 변환하지 않는다', () => {
  const cases = [
    ['새 학습을 시작할까요?', '새 학습 시작 확인'],
    ['백업 기록으로 바꿀까요?', '학습 기록 복원 확인'],
    ['학습을 제출할까요?', '학습 답안 제출 확인'],
    ['학습 기록을 초기화할까요?', '학습 기록 초기화 확인'],
    ['오늘의 10문항', '미풀이 우선 10문항'],
    ['오답 복습 · 10문항', '오답·미응답 복습 · 10문항'],
  ];
  for (const [before, after] of cases) {
    assert.equal(displayWrittenTitle(before), after);
    assert.equal(displayWrittenTitle(after), after);
  }
});

test('부분적으로 비슷한 사용자 제목과 회차·문항 식별 정보는 변경하지 않는다', () => {
  for (const title of [
    '2026년 2회 · 실전 시험', '2025년 3회 · 회차 연습',
    '2026-02-Q01 · 개별 학습', '조건별 학습 · 20문항',
    '오늘의 10문항 복습 메모', '오답 복습 · TCP/IP', '사용자 지정 제목',
  ]) assert.equal(displayWrittenTitle(title), title);
  assert.equal(displayWrittenTitle(undefined), '');
  assert.equal(displayWrittenTitle(null), '');
});
