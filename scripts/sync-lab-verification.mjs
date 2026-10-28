import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LAB_VERIFICATION } from '../src/content/lab-verification.mjs';

export const SUMMARY_START = '<!-- lab-verification-summary:start -->';
export const SUMMARY_END = '<!-- lab-verification-summary:end -->';
export const REPORT_URL = new URL('../docs/PRACTICAL_LABS_VERIFICATION.md', import.meta.url);
const cell = text => text.replaceAll('|', '\\|').replaceAll('\n', ' ');
const observation = value => `**${cell(value.label)}.**${value.detail ? ` ${cell(value.detail)}` : ''}`;

export function renderVerificationSummary() {
  const summary = LAB_VERIFICATION;
  return [
    SUMMARY_START,
    `## ${summary.title} · ${summary.date}`,
    '',
    summary.summary,
    '',
    summary.boundary,
    '',
    '| 번호 | 과제 | ICQA 에뮬레이터·데모 검증 결과 | Packet Tracer 검증 결과 | 남은 한계 |',
    '|---:|---|---|---|---|',
    ...summary.rows.map((row, index) => `| ${index + 1} | **${cell(row.title)}** | ${observation(row.icqa)} | ${observation(row.packetTracer)} | ${cell(row.limit)} |`),
    '',
    '### 공통 한계',
    '',
    ...summary.limitations.map(item => `- **${item.title}:** ${item.detail}`),
    '',
    '검증 환경:',
    '',
    ...summary.environments.map(item => `- **${item.title}:** ${item.description}`),
    '',
    '[사이트에서 최종 검증표 보기](https://sumilee-phd.github.io/NA2-study/#/practical/lab/verification)',
    '',
    '이 요약은 `src/content/lab-verification.mjs`와 동기화한다. 내용을 수정한 뒤 `node scripts/sync-lab-verification.mjs --write`로 갱신하고, `--check` 또는 `npm test`로 일치 여부를 확인한다. 아래의 날짜별 실행·구현 기록은 그대로 보존한다.',
    SUMMARY_END,
  ].join('\n');
}

export function documentSummary(text) {
  const normalized = text.replaceAll('\r\n', '\n');
  const start = normalized.indexOf(SUMMARY_START);
  const end = normalized.indexOf(SUMMARY_END);
  if (start === -1 || end < start) return null;
  return normalized.slice(start, end + SUMMARY_END.length);
}

function main() {
  const text = readFileSync(REPORT_URL, 'utf8').replaceAll('\r\n', '\n');
  const current = documentSummary(text);
  const expected = renderVerificationSummary();
  if (process.argv.includes('--write')) {
    const target = current || '## 제공 범위';
    if (!text.includes(target)) throw new Error('검증표 삽입 위치를 찾지 못했습니다. 문서 구조를 확인하세요.');
    const replacement = current ? expected : `${expected}\n\n${target}`;
    writeFileSync(REPORT_URL, text.replace(target, replacement), 'utf8');
    console.log('최종 검증표를 문서와 동기화했습니다.');
  } else {
    if (current !== expected) throw new Error('문서와 사이트의 최종 검증표가 다릅니다. node scripts/sync-lab-verification.mjs --write를 실행하세요.');
    console.log('문서와 사이트의 최종 검증표가 일치합니다.');
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
