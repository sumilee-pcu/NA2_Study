import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../src/modules/cabling/content.mjs';
import {
  STORE_KEY, LEGACY_KEY, MAX_IMPORT_BYTES, freshState, validateBackup,
  saveState, loadState, exportBackup,
} from '../src/modules/cabling/model.mjs';

const STORAGE_LIMIT = 5 * 1024 * 1024;
const bytes = (value) => Buffer.byteLength(value, 'utf8');

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const writes = [];
  return {
    data, writes,
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, value); writes.push({ key, value }); },
  };
}

test('24,000건의 저장 가능한 응답을 간결한 JSON으로 내보내고 그대로 복원한다', () => {
  const state = freshState();
  const question = QUESTIONS[0];
  state.events = Array.from({ length: 24000 }, (_, index) => ({
    id: `s_${index}:0`, sessionId: `s_${index}`, questionId: question.id,
    kind: question.kind, mode: 'practice', answer: question.answer, correct: true,
    submittedAt: '2026-10-01T00:00:00.000Z',
  }));
  const storage = memoryStorage();
  assert.deepEqual(saveState(storage, state), { ok: true });
  const exported = exportBackup(state);
  assert.ok(bytes(JSON.stringify(state, null, 2)) > STORAGE_LIMIT, '기존 들여쓰기 백업의 한도 초과를 재현해야 한다');
  assert.ok(bytes(exported) <= STORAGE_LIMIT);
  assert.ok(bytes(exported) <= MAX_IMPORT_BYTES);
  assert.equal(exported, storage.getItem(STORE_KEY));
  assert.deepEqual(validateBackup(JSON.parse(exported)), state);
  assert.deepEqual(loadState(memoryStorage({ [STORE_KEY]: exported })).state, state);
  assert.equal(MAX_IMPORT_BYTES, 64 * 1024 * 1024);
});

test('이전 앱 원문의 한글 UTF-8 바이트가 5 MiB를 넘으면 읽기와 저장을 거부한다', () => {
  const raw = '가'.repeat(Math.floor(STORAGE_LIMIT / 3) + 1);
  assert.ok(raw.length < STORAGE_LIMIT);
  assert.ok(bytes(raw) > STORAGE_LIMIT);
  const state = { ...freshState(), legacy: { raw } };
  assert.throws(() => validateBackup(state), /이전 앱 원문 크기/);
  const storage = memoryStorage();
  assert.equal(saveState(storage, state).ok, false);
  assert.equal(storage.writes.length, 0);
  const legacyStorage = memoryStorage({ [LEGACY_KEY]: raw });
  const loaded = loadState(legacyStorage);
  assert.equal(loaded.canSave, false);
  assert.match(loaded.warning, /이전 앱 기록의 크기/);
  assert.equal(legacyStorage.getItem(LEGACY_KEY), raw);
  assert.equal(legacyStorage.writes.length, 0);
});

test('저장 JSON의 UTF-8 5 MiB 경계를 지키며 초과 상태도 복구용 백업으로 왕복한다', () => {
  const state = { ...freshState(), legacy: { raw: '' } };
  const overhead = bytes(JSON.stringify(state));
  const available = STORAGE_LIMIT - overhead;
  state.legacy.raw = '가'.repeat(Math.floor(available / 3)) + 'a'.repeat(available % 3);
  assert.equal(bytes(JSON.stringify(state)), STORAGE_LIMIT);
  const storage = memoryStorage();
  assert.deepEqual(saveState(storage, state), { ok: true });
  assert.equal(loadState(storage).canSave, true);
  const saved = storage.getItem(STORE_KEY);

  state.legacy.raw += 'a';
  const exported = exportBackup(state);
  assert.equal(bytes(exported), STORAGE_LIMIT + 1);
  assert.ok(bytes(exported) < MAX_IMPORT_BYTES);
  assert.deepEqual(validateBackup(JSON.parse(exported)), state);
  assert.equal(saveState(storage, state).ok, false);
  assert.equal(storage.getItem(STORE_KEY), saved);
  assert.equal(storage.writes.length, 1);
  const tooLarge = loadState(memoryStorage({ [STORE_KEY]: exported }));
  assert.equal(tooLarge.canSave, false);
  assert.match(tooLarge.warning, /저장 기록의 크기/);
  assert.equal(tooLarge.raw, exported);
});
