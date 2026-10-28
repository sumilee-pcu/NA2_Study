import { WINDOWS_LABS } from './windows-labs.mjs';
import { ROUTER_LABS } from './router-labs.mjs';

export const LABS = [...WINDOWS_LABS, ...ROUTER_LABS];
export const LAB_BY_ID = Object.assign(Object.create(null), Object.fromEntries(LABS.map(lab => [lab.id, lab])));
export const LAB_GROUPS = [
  { id: 'windows', title: 'Windows Server', description: 'IPv4 주소를 계산하고 DHCP·DNS의 설정값을 확인합니다.', reviewNote: '공식 기술 문서를 기준으로 재구성하고, 입력·저장·재확인은 ICQA Windows 실습용 에뮬레이터에서 확인한 학습 과제입니다. 에뮬레이터는 채점 결과를 표시하지 않으므로 시험 채점 결과를 보증하는 자료는 아닙니다.' },
  { id: 'router', title: '라우터', description: '명령 모드와 설정 대상을 구분하고 확인·저장 순서를 익힙니다.', reviewNote: '공식 기술 문서를 기준으로 재구성하고, 명령 수락·조회·저장은 ICQA 라우터 시험 데모에서 확인한 학습 과제입니다. 데모는 제출 후 점수를 표시하지 않으므로 채점 결과를 보증하는 자료는 아닙니다.' },
];

export function labFromPath(path) {
  const match = /^\/practical\/lab\/([a-z0-9-]+)$/.exec(path);
  return match ? LAB_BY_ID[match[1]] || null : null;
}
