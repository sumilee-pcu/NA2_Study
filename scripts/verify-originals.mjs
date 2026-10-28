import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const baselines = JSON.parse(readFileSync(resolve(root, 'docs/BASELINES.json'), 'utf8').replace(/^\uFEFF/, ''));
let checked = 0;
for (const repo of baselines.repositories) {
  const directory = resolve(root, '..', repo.name);
  const head = execFileSync('git', ['-C', directory, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (head !== repo.commit) throw new Error(`${repo.name}: 기준 커밋이 변경되었습니다.`);
  const status = execFileSync('git', ['-C', directory, 'status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (status) throw new Error(`${repo.name}: 작업 트리에 변경 사항이 있습니다.`);
  for (const file of repo.files) {
    const hash = createHash('sha256').update(readFileSync(resolve(directory, file.path))).digest('hex');
    if (hash !== file.sha256) throw new Error(`${repo.name}/${file.path}: 원본 해시가 변경되었습니다.`);
    checked++;
  }
  console.log(`${repo.name} ${head.slice(0, 7)}: 원본 보존 확인`);
}
console.log(`${checked}개 추적 파일의 SHA-256 검증 통과`);
