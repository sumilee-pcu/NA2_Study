import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WRITTEN_STORE_KEY, WRITTEN_LEGACY_KEY, WRITTEN_BANK_CACHE,
  createWrittenState, readWrittenProgress, writeWrittenProgress, readWrittenAssessmentState,
  questionIdFromWrittenRoute, writtenRouteAction,
  mayShowWrittenTheory, writtenTheoryTopics,
} from '../src/modules/written/integration.mjs';

function storageFixture(initial = {}) {
  const values = new Map(Object.entries(initial));
  const reads = [], writes = [];
  return {
    values, reads, writes,
    getItem(key) { reads.push(key); return values.get(key) ?? null; },
    setItem(key, value) { writes.push(key); values.set(key, value); },
  };
}

function sessionFixture(mode = 'practice') {
  return {
    id: 'existing-session', ids: ['Q-1', 'Q-2'], mode, title: '진행 중 학습',
    index: 1, answers: { 'Q-1': 3, 'Q-2': 2 }, checked: ['Q-1'], flags: ['Q-2'],
    started: 1000, deadline: mode === 'exam' ? 3001000 : null,
    duration: mode === 'exam' ? 3000 : null,
  };
}

test('기존 공개 앱 저장 키를 읽거나 쓰지 않고 통합 필기 전용 저장소만 사용한다', () => {
  const original = {
    commutenet_react_v3: JSON.stringify({ ...createWrittenState(), bookmarks: ['OLD-1'] }),
    commutenet_bank_v2: JSON.stringify({ ...createWrittenState(), bookmarks: ['OLD-2'] }),
    cabling_trainer_progress: 'old-cabling-data',
  };
  const storage = storageFixture(original);
  assert.deepEqual(readWrittenProgress(storage), createWrittenState());
  assert.deepEqual(storage.reads, [WRITTEN_STORE_KEY, WRITTEN_LEGACY_KEY]);
  const integrated = { ...createWrittenState(), bookmarks: ['Q-1'] };
  writeWrittenProgress(storage, integrated);
  assert.deepEqual(storage.writes, [WRITTEN_STORE_KEY]);
  for (const [key, value] of Object.entries(original)) assert.equal(storage.values.get(key), value);
  assert.equal(WRITTEN_STORE_KEY, 'na2_study_written_v1');
  assert.match(WRITTEN_LEGACY_KEY, /^na2_study_written_/);
  assert.match(WRITTEN_BANK_CACHE, /^na2_study_written_/);
  assert.notEqual(WRITTEN_BANK_CACHE, 'commutenet-bank');
});

test('통합 앱 자체의 이전 키만 복원하며 미제출 답안·위치·검토 표시를 보존한다', () => {
  const saved = {
    ...createWrittenState(), session: sessionFixture(),
    progress: { 'Q-1': { attempts: 1, correct: 1, lastCorrect: true, lastChoice: 3 } },
    notes: { 'Q-1': '복습 메모' },
  };
  const storage = storageFixture({ [WRITTEN_LEGACY_KEY]: JSON.stringify(saved) });
  assert.deepEqual(readWrittenProgress(storage), saved);
  writeWrittenProgress(storage, saved);
  storage.reads.length = 0;
  assert.deepEqual(readWrittenProgress(storage), saved);
  assert.deepEqual(storage.reads, [WRITTEN_STORE_KEY]);
});

test('초기 평가 판정은 현재 통합 저장 키만 읽고 문제은행이나 기존 앱 기록을 요청하지 않는다', () => {
  const storage = storageFixture({
    commutenet_react_v3: JSON.stringify({ session: sessionFixture('exam') }),
    [WRITTEN_LEGACY_KEY]: JSON.stringify({ session: sessionFixture('exam') }),
  });
  assert.equal(readWrittenAssessmentState(storage), false);
  assert.deepEqual(storage.reads, [WRITTEN_STORE_KEY]);
  storage.values.set(WRITTEN_STORE_KEY, JSON.stringify({ session: sessionFixture('exam') }));
  assert.equal(readWrittenAssessmentState(storage), true);
  storage.values.set(WRITTEN_STORE_KEY, JSON.stringify({ session: sessionFixture('practice') }));
  assert.equal(readWrittenAssessmentState(storage), false);
  storage.values.set(WRITTEN_STORE_KEY, JSON.stringify({ session: null }));
  assert.equal(readWrittenAssessmentState(storage), false);
  assert.deepEqual(storage.writes, []);
});

test('일반 필기·공통 이론 왕복은 진행 세션을 다시 시작하지 않는다', () => {
  const session = sessionFixture();
  const before = structuredClone(session);
  const known = new Set(session.ids);
  for (const route of ['/written', '/theory/tcp-ip', '/written', '/cabling', '/written']) {
    assert.deepEqual(writtenRouteAction(route, session, known), { kind: 'preserve' });
    assert.deepEqual(session, before);
  }
});

test('문항 딥링크는 기존 연습을 이어가며 다른 세션이나 진행 시험은 교체 확인을 요구한다', () => {
  const session = sessionFixture();
  const before = structuredClone(session);
  const known = new Set(['Q-1', 'Q-2', 'Q-3']);
  assert.deepEqual(writtenRouteAction('/written/question/Q-1', session, known), { kind: 'resume', id: 'Q-1', index: 0 });
  assert.deepEqual(writtenRouteAction('/written/question/Q-3', session, known), { kind: 'confirm', id: 'Q-3' });
  assert.deepEqual(writtenRouteAction('/written/question/Q-1', sessionFixture('exam'), known), { kind: 'confirm', id: 'Q-1' });
  assert.deepEqual(writtenRouteAction('/written/question/Q-3', null, known), { kind: 'start', id: 'Q-3' });
  assert.deepEqual(writtenRouteAction('/written/question/UNKNOWN', session, known), { kind: 'missing', id: 'UNKNOWN' });
  assert.deepEqual(session, before);
  assert.equal(questionIdFromWrittenRoute('/written/question/Q%2D1'), 'Q-1');
  assert.equal(questionIdFromWrittenRoute('/written/question/%E0%A4%A'), null);
});

test('이론 추천은 확인한 연습 또는 완료 결과에만 허용하며 진행 시험에서는 숨긴다', () => {
  assert.equal(mayShowWrittenTheory({ mode: 'practice', checked: false }), false);
  assert.equal(mayShowWrittenTheory({ mode: 'practice', checked: true }), true);
  assert.equal(mayShowWrittenTheory({ mode: 'exam', checked: false }), false);
  assert.equal(mayShowWrittenTheory({ mode: 'exam', checked: true }), false);
  assert.equal(mayShowWrittenTheory({ mode: 'exam', completed: true }), true);
  assert.deepEqual(writtenTheoryTopics({ 'Q-1': [
    { id: 'tcp-ip', title: 'TCP/IP' }, { id: 'tcp-ip', title: '중복' },
    null, { id: 'bad', title: '' }, { id: 'subnet', title: '서브넷' },
  ] }, 'Q-1'), [{ id: 'tcp-ip', title: 'TCP/IP' }, { id: 'subnet', title: '서브넷' }]);
  assert.deepEqual(writtenTheoryTopics({}, 'Q-1'), []);
});
