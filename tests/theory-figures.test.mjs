import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOPICS } from '../src/content/learning.mjs';
import { THEORY_FIGURES } from '../src/content/theory-figures.mjs';
import { STANDARDS } from '../src/modules/cabling/content.mjs';
const svg = name => readFileSync(new URL(`../src/assets/theory/${name}.svg`, import.meta.url), 'utf8');

test('every theory topic has a described, source-associated figure in a valid section', () => {
  assert.deepEqual(Object.keys(THEORY_FIGURES).sort(), TOPICS.map(t => t.id).sort());
  for (const topic of TOPICS) for (const f of THEORY_FIGURES[topic.id]) {
    assert.ok(topic.sections[f.section]);
    assert.ok(f.alt.length > 30 && f.caption.length > 20);
    assert.ok(topic.sources.length > 0);
    const content = svg(f.id);
    assert.match(content, /<title[^>]*>.+<\/title>/);
    assert.match(content, /<desc[^>]*>.+<\/desc>/);
    assert.doesNotMatch(content, /<script|<foreignObject|onload=|<image\b/i);
  }
});

test('visible wiring figure has all 16 numbered wires in the independent pin order', () => {
  const expected = {
    T568A: ['wg','g','wo','b','wb','o','wbr','br'],
    T568B: ['wo','o','wg','b','wb','g','wbr','br'],
  };
  const content = svg('cabling-t568');
  for (const [standard, sequence] of Object.entries(expected)) {
    const pins = [...content.matchAll(new RegExp(`data-standard="${standard}" data-pin="(\\d)" data-wire="([a-z]+)"`, 'g'))];
    assert.deepEqual(pins.map(p => Number(p[1])), [1,2,3,4,5,6,7,8]);
    assert.deepEqual(pins.map(p => p[2]), sequence);
    assert.deepEqual(STANDARDS[standard], sequence);
  }
});

test('wiremap SVG line endpoints agree with straight and two-pair crossover mappings', () => {
  const content = svg('cabling-wiremap');
  for (const [name, targets, offset] of [['straight', [1,2,3,4,5,6,7,8], 0], ['crossover', [3,6,1,4,5,2,7,8], 370]]) {
    const groups = [...content.matchAll(new RegExp(`data-map="${name}" data-from="(\\d)" data-to="(\\d)"><path d="M(\\d+) (\\d+)L(\\d+) (\\d+)"`, 'g'))];
    assert.equal(groups.length, 8);
    groups.forEach((g,i) => {
      assert.equal(Number(g[1]), i + 1);
      assert.equal(Number(g[2]), targets[i]);
      assert.equal(Number(g[3]), 102 + offset);
      assert.equal(Number(g[4]), 199 + i * 31);
      assert.equal(Number(g[5]), 275 + offset);
      assert.equal(Number(g[6]), 199 + (targets[i] - 1) * 31);
    });
  }
});
