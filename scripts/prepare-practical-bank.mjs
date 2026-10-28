import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { prepareBank } from '../src/practical-model.mjs';

const SOURCE = new URL('../content-review/practical-bank.v1.json', import.meta.url);
const OUTPUT = new URL('../src/content/practical-questions.json', import.meta.url);
const select = (value, keys) => Object.fromEntries(keys.map(key => [key, value[key]]));
const clone = value => JSON.parse(JSON.stringify(value));

/** Explicit projection: review notes and excluded items never enter the app. */
export function projectPracticalBank(reviewed) {
  if (!reviewed || !Array.isArray(reviewed.questions)) throw new Error('검수 원본의 문항 목록이 없습니다.');
  const questions = reviewed.questions.filter(question => question.reviewStatus === 'approved').map(question => {
    const fields = ['id', 'type', 'topic', 'prompt', 'answer', 'explanation', 'pdfPage',
      'sourceAnchor', 'evidenceIds', 'reviewStatus'];
    const result = select(question, fields);
    if (question.type === 'short') {
      result.acceptedAnswers = question.acceptedAnswers;
      result.normalization = select(question.normalization,
        ['caseSensitive', 'trim', 'collapseWhitespace', 'ignoreWhitespace']);
    } else result.options = question.options.map(option => select(option, ['id', 'text']));
    return result;
  });
  const used = [...new Set(questions.flatMap(question => question.evidenceIds))].sort();
  const evidence = Object.fromEntries(used.map(id => {
    if (!reviewed.evidence?.[id]) throw new Error('검수 문항의 근거를 찾지 못했습니다: ' + id);
    return [id, select(reviewed.evidence[id], ['title', 'url', 'locator', 'verifiedAt'])];
  }));
  const projected = clone({
    version: reviewed.version, title: reviewed.title,
    source: select(reviewed.source, ['filename', 'pages']), evidence, questions,
  });
  prepareBank(projected);
  return projected;
}
export const serializePracticalBank = reviewed => JSON.stringify(projectPracticalBank(reviewed), null, 2) + '\n';

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check') || args.length > 1) throw new Error('사용법: node scripts/prepare-practical-bank.mjs [--check]');
  const expected = serializePracticalBank(JSON.parse(await readFile(SOURCE, 'utf8')));
  if (args.includes('--check')) {
    let actual;
    try { actual = await readFile(OUTPUT, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (actual !== expected) throw new Error('배포용 실기 문제은행이 검수 원본과 다릅니다. 생성 명령을 실행해 주세요.');
    console.log('실기 배포 문제은행 일치 확인 완료');
  } else {
    await mkdir(dirname(fileURLToPath(OUTPUT)), { recursive: true });
    await writeFile(OUTPUT, expected, 'utf8');
    console.log('실기 배포 문제은행 생성 완료: ' + fileURLToPath(OUTPUT));
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
