import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { TOPICS, FAQS, TOOLS, GUIDES } from '../src/content/learning.mjs';

const bank = JSON.parse(readFileSync(new URL('../public/data/bank.json', import.meta.url), 'utf8'));
const byQuestion = new Map(bank.questions.map((q) => [q.id, q]));
const reviewed = JSON.parse(readFileSync(new URL('../docs/CONTENT_EVIDENCE.json', import.meta.url), 'utf8'));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const primaryHosts = new Set(['docs.oracle.com', 'www.rfc-editor.org', 'www.cisco.com', 'docs.redhat.com', 'www.redhat.com', 'learn.microsoft.com', 'icc.com', 'www.flukenetworks.com', 'www.h3c.com', 'arubanetworking.hpe.com', 'www.icqa.or.kr']);

test('initial topics cover four written subjects and cabling, two units each', () => {
  assert.equal(TOPICS.length, 10);
  for (const subject of ['네트워크일반', 'TCP/IP', 'NOS', '네트워크운용기기', '실기 케이블링']) {
    assert.equal(TOPICS.filter((t) => t.subject === subject).length, 2, subject);
  }
  assert.ok(TOPICS.some((t) => t.id === 'cabling-orientation'));
  assert.ok(TOPICS.some((t) => t.id === 'cabling-t568'));
});

test('all content and self-check identifiers are unique', () => {
  const records = [...TOPICS, ...TOPICS.flatMap((t) => t.checks), ...FAQS, ...TOOLS, ...GUIDES];
  assert.ok(records.every((entry) => nonempty(entry.id)));
  assert.equal(new Set(records.map((entry) => entry.id)).size, records.length);
});

test('each published topic includes objectives, teaching sequence, examples, and sources', () => {
  for (const topic of TOPICS) {
    assert.ok(nonempty(topic.title) && nonempty(topic.summary), topic.id);
    assert.ok(topic.objectives.length >= 2 && topic.objectives.every(nonempty), topic.id);
    assert.ok(topic.prerequisites.length >= 1 && topic.prerequisites.every(nonempty), topic.id);
    assert.ok(topic.sections.length >= 2, topic.id);
    for (const section of topic.sections) {
      assert.ok(nonempty(section.title) && section.paragraphs.length > 0, topic.id);
      assert.ok(section.paragraphs.every(nonempty), topic.id);
      if (section.table) {
        assert.ok(section.table.headers.length >= 2 && section.table.rows.length > 0, topic.id);
        assert.ok(section.table.rows.every((row) => row.length === section.table.headers.length && row.every(nonempty)), topic.id);
      }
    }
    assert.ok(topic.sections.some((s) => s.table), topic.id);
    assert.ok(nonempty(topic.example.title) && topic.example.steps.length >= 3 && topic.example.steps.every(nonempty), topic.id);
    assert.ok(topic.pitfalls.length >= 2 && topic.pitfalls.every(nonempty), topic.id);
    assert.ok(topic.sources.length > 0, topic.id);
    assert.equal(topic.checkedAt, '2026-10-22');
  }
});

test('self-check answers use valid zero-based choice indices with explanations', () => {
  for (const topic of TOPICS) {
    assert.equal(topic.checks.length, 2, topic.id);
    for (const check of topic.checks) {
      assert.ok(nonempty(check.prompt) && nonempty(check.explanation), check.id);
      assert.ok(check.choices.length >= 2 && check.choices.every(nonempty), check.id);
      assert.equal(new Set(check.choices).size, check.choices.length, check.id);
      assert.ok(Number.isInteger(check.answer) && check.answer >= 0 && check.answer < check.choices.length, check.id);
    }
  }
});

test('published sources are titled HTTPS primary references, not search-result URLs', () => {
  const sources = [...TOPICS.flatMap((t) => t.sources), ...FAQS.flatMap((f) => f.source ? [f.source] : [])];
  for (const item of sources) {
    assert.ok(nonempty(item.title));
    const url = new URL(item.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(primaryHosts.has(url.hostname), item.url);
    assert.ok(!url.pathname.includes('/search'), item.url);
  }
});

test('each related question matches the reviewed text, image, answer and page evidence', () => {
  const mapped = TOPICS.flatMap((t) => t.relatedQuestions);
  assert.equal(mapped.length, 8);
  assert.equal(new Set(mapped).size, 8);
  for (const topic of TOPICS) {
    for (const id of topic.relatedQuestions) {
      const q = byQuestion.get(id);
      assert.ok(q, `${topic.id}: missing ${id}`);
      assert.ok(nonempty(q.text) && q.images.length > 0, id);
      const evidence = reviewed.evidence.find(item => item.questionId === id && item.topicId === topic.id);
      assert.ok(evidence, `${id}: missing review evidence`);
      assert.match(q.images[0], /^data:image\/webp;base64,/, id);
      assert.equal(sha256(Buffer.from(q.images[0].split(',')[1], 'base64')), evidence.imageSha256, `${id}: image changed`);
      assert.equal(sha256(q.text), evidence.textSha256, `${id}: text changed`);
      assert.equal(q.answer, evidence.originalProvisionalAnswer, `${id}: answer changed`);
      assert.deepEqual(q.pages, evidence.pages, `${id}: pages changed`);
    }
  }
});

test('FAQ, tools and guides expose complete reading data and valid topic paths', () => {
  assert.equal(FAQS.length, 12);
  assert.equal(TOOLS.length, 8);
  assert.equal(GUIDES.length, 4);
  for (const faq of FAQS) {
    assert.ok([faq.category, faq.question, faq.answer].every(nonempty), faq.id);
    assert.equal(faq.checkedAt, faq.id === 'faq-emulator' ? '2026-10-23' : '2026-10-22');
  }
  for (const tool of TOOLS) assert.ok([tool.name, tool.role, tool.requirement, tool.compatibility, tool.note].every(nonempty), tool.id);
  const validPaths = new Set(['/learn/theory', '/practical', '/cabling/pins', ...TOPICS.map((t) => `/learn/theory/${t.id}`)]);
  for (const guide of GUIDES) {
    assert.ok([guide.title, guide.audience].every(nonempty), guide.id);
    assert.ok(guide.steps.length >= 3 && guide.steps.every(nonempty), guide.id);
    assert.ok(validPaths.has(guide.startPath), guide.id);
  }
});

test('T568A and T568B table agrees with each eight-pin wiring sequence', () => {
  const rows = TOPICS.find((t) => t.id === 'cabling-t568').sections[0].table.rows;
  assert.deepEqual(rows.map((row) => row[0]), ['1', '2', '3', '4', '5', '6', '7', '8']);
  assert.deepEqual(rows.map((row) => row[1]), ['흰색/초록', '초록', '흰색/주황', '파랑', '흰색/파랑', '주황', '흰색/갈색', '갈색']);
  assert.deepEqual(rows.map((row) => row[2]), ['흰색/주황', '주황', '흰색/초록', '파랑', '흰색/파랑', '초록', '흰색/갈색', '갈색']);
});
