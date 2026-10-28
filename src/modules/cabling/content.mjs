// Educational content checked against the linked manufacturers' documentation.
// This is wiring practice, not an assertion about an examination's marking rules.
export const WIRES = Object.freeze({
  wo: Object.freeze({ id: 'wo', label: '흰색/주황 줄무늬', short: '흰주', color: '#f97316', striped: true }),
  o: Object.freeze({ id: 'o', label: '주황 단색', short: '주', color: '#f97316', striped: false }),
  wg: Object.freeze({ id: 'wg', label: '흰색/초록 줄무늬', short: '흰초', color: '#16a34a', striped: true }),
  b: Object.freeze({ id: 'b', label: '파랑 단색', short: '파', color: '#2563eb', striped: false }),
  wb: Object.freeze({ id: 'wb', label: '흰색/파랑 줄무늬', short: '흰파', color: '#2563eb', striped: true }),
  g: Object.freeze({ id: 'g', label: '초록 단색', short: '초', color: '#16a34a', striped: false }),
  wbr: Object.freeze({ id: 'wbr', label: '흰색/갈색 줄무늬', short: '흰갈', color: '#92400e', striped: true }),
  br: Object.freeze({ id: 'br', label: '갈색 단색', short: '갈', color: '#92400e', striped: false }),
});

export const WIRE_IDS = Object.freeze(Object.keys(WIRES));
export const STANDARDS = Object.freeze({
  T568A: Object.freeze(['wg', 'g', 'wo', 'b', 'wb', 'o', 'wbr', 'br']),
  T568B: Object.freeze(['wo', 'o', 'wg', 'b', 'wb', 'g', 'wbr', 'br']),
});

export const SOURCES = Object.freeze([
  { id: 'h3c-wiring', title: 'H3C 설치 가이드 — Appendix C 배선 순서와 MDI/MDI-X 표', url: 'https://www.h3c.com/en/Support/Resource_Center/EN/Security/Catalog/F5000/F5000/Technical_Documents/Install___Upgrade/Installation_Guides/H3C_F5000-AI-20%5B40%5D_IG/202211/1715517_294551_0.htm', checkedAt: '2026-10-22' },
  { id: 'icc-pin1', title: 'ICC — RJ-45 플러그와 잭의 1번 핀 위치', url: 'https://icc.com/help/position-1-located-rj-45-modular-plug-jack/', checkedAt: '2026-10-22' },
  { id: 'fluke-t568', title: 'Fluke Networks — T568A와 T568B의 차이', url: 'https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs', checkedAt: '2026-10-22' },
  { id: 'fluke-crossover', title: 'Fluke Networks — 크로스 케이블 시험과 1000BASE-T 구분', url: 'https://www.flukenetworks.com/knowledge-base/dsx-cableanalyzer-series/crossover-cable-testing-dsx-cable-analyzer', checkedAt: '2026-10-22' },
  { id: 'cisco-mdix', title: 'Cisco — Ethernet 직결·크로스와 Auto-MDI-X', url: 'https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/10561-3.html', checkedAt: '2026-10-22' },
  { id: 'aruba-pairs', title: 'HPE Aruba — 1000BASE-T 네 쌍과 자동 포트 전환', url: 'https://arubanetworking.hpe.com/techdocs/Switches/Aruba_6200/5200-6885/v34011710.html', checkedAt: '2026-10-22' },
  { id: 'icqa-faq', title: 'ICQA — 네트워크관리사 실기 공식 FAQ', url: 'https://www.icqa.or.kr/cn/faq?fm_id=2', checkedAt: '2026-10-22' },
  { id: 'icqa-practical-guide', title: 'ICQA — 공개 실기 안내표: 케이블 작업 10분·6.5점', url: 'https://www.icqa.or.kr/cn/data/editor/2507/9c400cf94ec15d6f33d6546a80c7e60f_1751934566_3098.jpg', checkedAt: '2026-10-22' },
].map(Object.freeze));

export const LESSONS = Object.freeze([
  {
    id: 't568b', title: 'T568B 배열',
    paragraphs: [
      '핀 1번부터 8번까지 흰주–주–흰초–파–흰파–초–흰갈–갈 순서입니다.',
      '주황 쌍은 1·2번, 초록 쌍은 3·6번에 연결합니다. 흰주·흰초·흰파·흰갈은 각각 흰색 바탕에 해당 색의 줄무늬가 있는 선입니다.',
    ], sourceIds: ['h3c-wiring', 'fluke-t568'],
  },
  {
    id: 't568a', title: 'T568A 배열',
    paragraphs: [
      '핀 1번부터 8번까지 흰초–초–흰주–파–흰파–주–흰갈–갈 순서입니다.',
      'T568B와 비교하면 1·2번의 쌍과 3·6번의 쌍에 연결하는 주황·초록이 바뀝니다. 파랑 쌍 4·5번과 갈색 쌍 7·8번은 같습니다.',
    ], sourceIds: ['h3c-wiring', 'fluke-t568'],
  },
  {
    id: 'orientation', title: '플러그 관찰 방향',
    paragraphs: [
      '이 앱의 핀 배열은 RJ-45 플러그의 금속 접점이 보이는 면을 보고, 고정 클립은 관찰자 반대쪽에 둔 기준입니다. 그림의 왼쪽을 1번, 오른쪽을 8번으로 읽습니다.',
      '플러그를 뒤집거나 잭의 뒤쪽 결선 단자를 보면 좌우와 배치가 달라질 수 있습니다. 실제 작업에서는 커넥터의 번호와 제조사 결선 표시를 함께 확인하세요.',
      '색이 옅다는 이유로 흰색 선을 구분하지 않습니다. 색상명과 줄무늬를 함께 확인합니다.',
    ], sourceIds: ['icc-pin1', 'fluke-t568', 'h3c-wiring'],
  },
  {
    id: 'straight', title: '직결 케이블',
    paragraphs: [
      '양 끝을 모두 T568A 또는 모두 T568B로 결선하면 직결(Straight-through)입니다. 한쪽의 1번은 반대쪽 1번으로, 같은 번호끼리 연결됩니다.',
      '이 앱은 A–A와 B–B를 모두 직결로 판정합니다. 표준을 정한 뒤 양 끝의 각 핀과 색상이 일치하는지 확인하세요.',
    ], sourceIds: ['fluke-crossover', 'cisco-mdix'],
  },
  {
    id: 'crossover', title: '크로스 케이블의 적용 범위',
    paragraphs: [
      '이 앱의 크로스 판별은 10BASE-T·100BASE-TX용 두 쌍 교차 결선을 다룹니다. 한쪽 T568A, 다른 쪽 T568B이면 1↔3, 2↔6이 교차하고 4·5·7·8번은 같은 번호로 이어집니다.',
      '1000BASE-T는 네 쌍 모두를 데이터 통신에 사용하며, 별도의 1000BASE-T 크로스 결선과 구분해야 합니다. A–B 규칙을 모든 Ethernet 속도에 적용하지 않습니다.',
      '장비 이름만으로 필요한 케이블을 단정하지 않습니다. Auto-MDI-X가 활성화된 지원 장비는 직결·크로스 연결을 자동으로 처리할 수 있습니다.',
    ], sourceIds: ['h3c-wiring', 'fluke-crossover', 'aruba-pairs', 'cisco-mdix'],
  },
  {
    id: 'signals', title: '핀 쌍과 송수신',
    paragraphs: [
      '10BASE-T·100BASE-TX의 MDI 포트에서는 1·2번이 송신, 3·6번이 수신입니다. MDI-X 포트에서는 이 역할이 반대입니다.',
      'Auto-MDI-X를 사용하지 않는 10/100Mbps 연결에서는 같은 포트 유형끼리 크로스, 서로 다른 포트 유형끼리 직결을 사용합니다. PC·라우터는 보통 MDI, 스위치·허브는 보통 MDI-X이지만 실제 포트 사양과 설정을 확인해야 합니다.',
      '1000BASE-T에서는 1·2, 3·6, 4·5, 7·8의 네 쌍이 모두 양방향 데이터 통신에 사용됩니다.',
    ], sourceIds: ['h3c-wiring', 'cisco-mdix', 'aruba-pairs'],
  },
  {
    id: 'scope', title: '화면 연습과 실제 제작',
    paragraphs: [
      '화면 연습은 색상·핀 번호·결선 유형을 익히기 위한 것입니다. 배선 배열을 맞혔다고 실제 케이블의 접촉·단선·압착 품질까지 확인된 것은 아닙니다.',
      '실물 자기점검 기록은 본인이 확인한 항목과 시간을 보관합니다. 실제 케이블의 합격 여부나 자격시험 점수를 판정하지 않습니다.',
      '출처는 자료 안내에서 확인할 수 있습니다. 시험 범위와 채점 기준은 해당 시험기관의 현재 안내를 별도로 확인하세요.',
    ], sourceIds: ['fluke-crossover'],
  },
].map((lesson) => Object.freeze({ ...lesson, paragraphs: Object.freeze(lesson.paragraphs), sourceIds: Object.freeze(lesson.sourceIds) })));

const questions = [];
for (const suffix of ['A', 'B']) {
  const standard = `T568${suffix}`;
  STANDARDS[standard].forEach((wireId, index) => {
    const pin = index + 1;
    questions.push({
      id: `pin-${suffix}-${pin}`, kind: 'pin', standard, pin,
      prompt: `${standard}의 ${pin}번 핀에 연결하는 전선은 무엇인가요?`,
      answer: wireId,
      explanation: `${standard}의 ${pin}번 핀은 ${WIRES[wireId].label}(${WIRES[wireId].short})입니다. 번호는 앱에 표시된 플러그 관찰 방향을 기준으로 읽습니다.`,
      sourceIds: ['h3c-wiring', 'icc-pin1'],
    });
  });
  questions.push({
    id: `order-${suffix}`, kind: 'order', standard,
    prompt: `${standard} 전선을 1번부터 8번 핀 순서대로 배치하세요. 각 전선은 한 번씩 사용합니다.`,
    answer: [...STANDARDS[standard]],
    explanation: `${standard}의 1→8번 순서는 ${STANDARDS[standard].map((id) => WIRES[id].short).join('–')}입니다. 단색과 흰색 바탕 줄무늬를 구분하세요.`,
    sourceIds: ['h3c-wiring', 'fluke-t568'],
  });
}
for (const pair of ['AA', 'AB', 'BA', 'BB']) {
  const left = `T568${pair[0]}`;
  const right = `T568${pair[1]}`;
  const straight = left === right;
  questions.push({
    id: `type-${pair}`, kind: 'type', left, right,
    prompt: `10BASE-T·100BASE-TX 결선에서 왼쪽은 ${left}, 오른쪽은 ${right}입니다. 케이블 유형은 무엇인가요?`,
    answer: straight ? 'straight' : 'crossover',
    explanation: straight
      ? `양 끝이 ${left}로 같으므로 동일 번호끼리 연결되는 직결 케이블입니다.`
      : '양 끝의 표준이 달라 1↔3, 2↔6이 교차하는 두 쌍 크로스 케이블입니다. 1000BASE-T의 크로스 결선 및 Auto-MDI-X의 동작과는 구분합니다.',
    sourceIds: straight ? ['fluke-crossover', 'cisco-mdix'] : ['h3c-wiring', 'fluke-crossover', 'cisco-mdix'],
  });
}

export const QUESTIONS = Object.freeze(questions.map((question) => Object.freeze({
  ...question,
  answer: Array.isArray(question.answer) ? Object.freeze(question.answer) : question.answer,
  sourceIds: Object.freeze(question.sourceIds),
})));
export const QUESTION_BY_ID = Object.freeze(Object.fromEntries(QUESTIONS.map((question) => [question.id, question])));
