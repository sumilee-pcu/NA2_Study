import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LABS, labFromPath } from '../src/content/practical-labs.mjs';
import { practicalSection } from '../src/content/practical.mjs';
import { LAB_VERIFICATION, LAB_VERIFICATION_PATH } from '../src/content/lab-verification.mjs';
import { documentSummary, renderVerificationSummary, REPORT_URL } from '../scripts/sync-lab-verification.mjs';

// 상태값마다 화면 배지 스타일과 배지 문구에 들어가야 하는 말
const STATE_TEXT = { confirmed: '통과', partial: '부분 확인', preparation: '준비', 'not-tested': '미실시' };

test('verification covers exactly the existing labs without becoming a scored lab', () => {
  const ids = LAB_VERIFICATION.rows.map(row => row.labId);
  assert.deepEqual(ids, LABS.map(lab => lab.id));
  assert.equal(new Set(ids).size, 8);
  assert.equal(LABS.flatMap(lab => lab.checks).length, 44);
  for (const row of LAB_VERIFICATION.rows) {
    assert.ok(labFromPath(`/practical/lab/${row.labId}`));
    assert.ok(row.title && row.icqa.label && row.icqa.detail && row.packetTracer.label && row.packetTracer.detail && row.limit);
  }
  assert.equal(practicalSection(LAB_VERIFICATION_PATH), 'lab');
  assert.equal(labFromPath(LAB_VERIFICATION_PATH), null);
});

test('Packet Tracer states follow the recorded evidence', () => {
  const byState = state => LAB_VERIFICATION.rows.filter(row => row.packetTracer.state === state).map(row => row.labId);
  assert.deepEqual(byState('confirmed'), ['windows-ipv4', 'router-basics', 'router-interface', 'router-route', 'router-access']);
  assert.deepEqual(byState('partial'), ['windows-dhcp', 'windows-dns-records', 'windows-dns-soa']);
  assert.deepEqual(byState('preparation'), []);
  assert.deepEqual(byState('not-tested'), []);
  assert.ok(LAB_VERIFICATION.rows.every(row => row.icqa.state === 'confirmed'));
});

test('every state is valid, styled and readable without color', () => {
  const css = readFileSync(new URL('../src/lab-verification.css', import.meta.url), 'utf8');
  for (const row of LAB_VERIFICATION.rows) {
    for (const value of [row.icqa, row.packetTracer]) {
      assert.ok(Object.hasOwn(STATE_TEXT, value.state), `${row.labId}: ${value.state}`);
      assert.ok(css.includes(`.lab-verification-status.is-${value.state}`), `${row.labId}: ${value.state} style`);
      assert.ok(value.label.includes(STATE_TEXT[value.state]), `${row.labId}: ${value.label}`);
    }
  }
});

test('published Markdown summary matches the content rendered by the site', () => {
  assert.equal(documentSummary(readFileSync(REPORT_URL, 'utf8')), renderVerificationSummary());
});

test('existing ICQA and VTY limits stay in the verification table', () => {
  const text = JSON.stringify(LAB_VERIFICATION);
  for (const fragment of ['330.4초 초과~344.2초 이하', '정확히 330초에 종료됐다는 검증은 아닙니다', '관리자 권한 런처', 'startup-config is not present', '새 시험으로 초기화', 'ipconfig /all은 설정과 무관한 고정 출력', 'nslookup은 고정 출력', 'VTY 원격 접속은 미지원']) {
    assert.ok(text.includes(fragment), fragment);
  }
  const environments = LAB_VERIFICATION.environments.map(item => item.description).join(' ');
  assert.match(environments, /1941 모델로 VTY/);
  assert.match(environments, /1841 모델과 PC-PT·Server-PT/);
});

test('follow-up rows keep their evidence limits', () => {
  const row = id => LAB_VERIFICATION.rows.find(item => item.labId === id);
  const all = id => JSON.stringify(row(id));
  assert.match(all('windows-dns-soa'), /600·700·600/);
  for (const fragment of ['일련번호와 SOA 레코드 자체 TTL 입력 칸', '-type= 옵션이 지원되지 않아', '표준 부정 응답 캐시', '보조 서버 설정 방법을 찾지 못했습니다']) assert.ok(all('windows-dns-soa').includes(fragment), fragment);
  assert.ok(all('windows-dns-records').includes('TYPE 5(CNAME) 레코드는 확인하지 못했습니다'));
  for (const fragment of ['자동 갱신·만료', '116개 전체 할당', '/renew 순간의 패킷', '집계 의미를 확인하지 못했습니다', 'Windows 제외 목록 기능 자체의 검증이 아니며']) assert.ok(all('windows-dhcp').includes(fragment), fragment);
  assert.ok(!all('windows-dhcp').includes('자동 갱신 성공'));
  assert.ok(all('windows-ipv4').includes('Windows 설정 화면 검증은 아닙니다'));
  assert.ok(all('windows-ipv4').includes('PC 값은 조회하지 않았습니다'));
  assert.ok(all('router-basics').includes('파일 보존 동작'));
  assert.ok(all('router-interface').includes('192.168.10.1 255.255.255.192'));
  assert.ok(all('router-route').includes('경로를 지우면 실패하고 복원하면 다시 성공'));
});
