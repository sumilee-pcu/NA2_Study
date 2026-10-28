import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { LABS } from '../src/content/practical-labs.mjs';
import { PRACTICAL_FIGURES, LAB_VISUALS, QUIZ_VISUALS } from '../src/content/practical-figures.mjs';
import { THEORY_FIGURES } from '../src/content/theory-figures.mjs';

const asset = name => readFileSync(new URL(`../src/assets/practical/${name}`, import.meta.url));

test('all eight labs have a matching original capture and a sourced visual explanation', () => {
  assert.deepEqual(Object.keys(LAB_VISUALS).sort(), LABS.map(lab => lab.id).sort());
  for (const lab of LABS) {
    const figures = LAB_VISUALS[lab.id].map(id => PRACTICAL_FIGURES[id]);
    assert.ok(figures.some(f => f.kind === 'diagram'));
    assert.ok(figures.some(f => f.kind === 'screenshot' && f.labId === lab.id));
    assert.ok(figures.every(f => f.sources.length && f.alt.length > 20 && f.caption.length > 30));
  }
});

test('published capture bytes retain the audited source fingerprints', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/PRACTICAL_SCREEN_SOURCES.json', import.meta.url), 'utf8'));
  for (const screen of manifest.screens) {
    assert.equal(createHash('sha256').update(asset(screen.file)).digest('hex'), screen.sha256);
    assert.equal(PRACTICAL_FIGURES[screen.id].sha256, screen.sha256);
  }
  assert.equal(manifest.screens.length, 14);
});

test('all mapped quiz explanations resolve to described safe SVG assets', () => {
  const bank = JSON.parse(readFileSync(new URL('../src/content/practical-questions.json', import.meta.url), 'utf8'));
  for (const [id, visual] of Object.entries(QUIZ_VISUALS)) {
    assert.ok(bank.questions.some(question => question.id === id));
    for (const figureId of visual.ids || []) assert.ok(PRACTICAL_FIGURES[figureId]);
    if (visual.theory) assert.ok(THEORY_FIGURES[visual.theory.topic].some(f => f.section === visual.theory.section));
  }
  for (const figure of Object.values(PRACTICAL_FIGURES).filter(f => f.kind === 'diagram')) {
    const svg = asset(figure.file).toString('utf8');
    assert.match(svg, /<title[^>]*>.+<\/title>/);
    assert.match(svg, /<desc[^>]*>.+<\/desc>/);
    assert.doesNotMatch(svg, /<script|<foreignObject|onload=|<image\b/i);
  }
});

test('subnet, DHCP and permissions diagrams match the independent worked answers', () => {
  const text = id => asset(`${id}.svg`).toString('utf8').replace(/<[^>]*>/g, '').replace(/\s/g, '');
  const values = {
    'lab-ipv4': ['255.255.255.248', '.16', '.17', '.18', '.19', '.22', '.23'],
    'lab-dhcp': ['.1', '.10', '.11', '.126', '116'],
    'subnet-18': ['128.148.192.0', '11010010', '11000000', '16384'],
    'subnet-split': ['172.16.0.0/16', '32', '64', '96', '128', '160', '192', '224'],
    'prefix-24': ['11111111', '00000000', '255.255.255.0'],
    'linux-755': ['755', 'rwx', 'r-x'],
  };
  for (const [id, expected] of Object.entries(values)) for (const value of expected) assert.ok(text(id).includes(value), `${id} missing ${value}`);
});
