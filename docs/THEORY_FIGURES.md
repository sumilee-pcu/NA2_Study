# 이론 도해 보강 · 2026-10-24

기존 이론 10개에 본문 도해 12개와 목록 미리보기를 추가했다. 각 도해에는 대체 텍스트, 설명, 확대 창, 검토일을 제공한다. 출처 영역에서 참고 강의자료와 기술 문서를 확인할 수 있다. 기존 이론 범위·문항 정답·학습 저장 형식은 유지한다.

## 제공 자료의 사용

성안당 PPTX 7개와 itgo ZIP 11개를 읽기 전용으로 조사했다. ZIP 내부를 포함한 PPTX 18개·673개 슬라이드의 텍스트와 이미지 관계를 확인했고, 선별한 58개 이미지와 관련 설명을 검토했다. 673개 슬라이드를 모두 렌더하여 시각 검사한 것은 아니다.

원본 그림은 설명 구조와 기술 개념의 참고 자료로 사용했다. 저해상도 장표·구형 화면을 그대로 게시하지 않고 현재 본문에 맞는 SVG를 독자 구성했다. 원본 이미지의 공개 재배포 라이선스는 확인되지 않았으며 추출한 원본 비트맵은 배포에 포함하지 않는다.

슬라이드 번호는 파일 첫 장부터 세는 1 기반 순서다. 아래 성안당 파일의 공통 접두는 `네트워크관리사12급(성안당)_`이다. itgo 파일은 해당 ZIP 내부 PPTX다.

| 도해 | 참고 강의자료 | 반영·보정 |
|---|---|---|
| 커넥터 방향 | itgo K010128, PART1-1, 37번, `ppt/media/image35.png` | 접점 면 플러그 사진과 T568B 배열을 대조. 접점 위·클립 뒤·케이블 아래·왼쪽 1번을 표시 |
| T568A/B | 위 itgo 37번, 성안당 실기_2 5·6번 | 16핀 순서와 줄무늬를 기존 실기 모듈 데이터에서 생성 |
| 직결·교차 | 성안당 실기_2 5·6번, `image7.png`·`image8.png` | 358×148·354×149 흑백 그림 대신 8개 연결을 새로 표시. 두 쌍 교차의 속도 범위·Auto-MDI-X 구분 |
| OSI 계층 | itgo K010130, PART2-1, 20번, `image17.png`; 성안당 2과목 4번 | OSI/TCP-IP 기능 대응. 두 모델의 구현이 같다는 일반화 제외 |
| 캡슐화 | itgo K010130, 5번, `image6.png` | TCP·IP·Ethernet 헤더와 FCS가 붙는 구체적인 예 |
| Ethernet | itgo K010128 33·34번, 기존 본문·Cisco·IBM | 공유 매체와 전이중 구분. 태그 없는 Ethernet II 프레임 |
| IPv4 서브넷 | itgo K010131, PART2-2, 10번, `image13.png` | /26 접두부와 64개 주소 블록. 현재 본문의 192.168.10.77 예제로 재구성 |
| TCP/UDP | itgo K010130 27·33·38번, 특히 `image23.png` | TCP 연결 설정 방향과 UDP 데이터그램·손실 예 |
| Linux 권한 | itgo K020329, NOS Linux-1, 27번, `image31.png` | 640의 u/g/o 묶음. 첫 파일 종류 기호와 권한 자리의 -를 구분 |
| DHCP/DNS | itgo K010132, PART2-3, 17번, `image22.png`; 성안당 3과목 23·28번 | DORA와 DNS 질의·응답을 별도 흐름으로 표시. Windows UI를 재현하지 않음 |
| 스위치/라우터 | itgo K020331 운용기기 19·20번, 기존 본문 | 출발지 MAC 학습·목적지 MAC 전달·최장 접두부를 별도로 표현 |
| VLAN | 성안당 4과목 5번, `image6.png` | access와 하나의 trunk 링크에 두 VLAN을 전달하는 구조 |

구판의 IEEE 802.10 VLAN 표기, 클래스만으로 서브넷을 판단하는 설명, 모든 라우팅의 브로드캐스트 일반화, DNS를 IPv4로만 한정한 설명, UDP 단위를 TCP와 혼용한 표현은 적용하지 않았다.

## 기술 근거

각 주제의 기존 공식 문서 목록을 유지하고 그림 설명을 대조했다. 추가 근거는 다음과 같다.

- [ICC 플러그 1번 핀](https://icc.com/help/position-1-located-rj-45-modular-plug-jack/), [Fluke T568A/B](https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs), [Fluke 교차 케이블 시험](https://www.flukenetworks.com/knowledge-base/dsx-cableanalyzer-series/crossover-cable-testing-dsx-cable-analyzer)
- [RFC 2131 §3.1 DHCP 신규 임대](https://www.rfc-editor.org/rfc/rfc2131#section-3.1)
- [RFC 9293 §3.5 TCP 연결 설정](https://www.rfc-editor.org/rfc/rfc9293#section-3.5)
- [RFC 4632 §5.1 최장 일치 접두부](https://www.rfc-editor.org/rfc/rfc4632#section-5.1)
- [IBM Ethernet II 프레임 형식](https://www.ibm.com/docs/en/i/7.6.0?topic=support-ethernet-frame-format)

## 구현과 검증

- 벡터 12개, 총 약 58 KB. 페이지에는 로컬 자산으로 포함하며 외부 이미지 서버에 의존하지 않는다.
- 확대 창은 네이티브 dialog를 사용한다. Escape·닫기로 복귀하고 원래 버튼에 포커스를 돌려준다. 확대 시 그림 영역만 스크롤한다.
- 다른 탭에서 평가를 시작하면 이론 상세와 확대 창을 해제하여 숨겨진 모달의 입력 잠금이 남지 않도록 했다.
- SVG 12개 XML 파싱 및 전체 렌더 컨택트시트 시각 검토 완료. T568A/B의 16핀과 직결·교차 실제 SVG 선 끝 좌표를 독립 기대값으로 검사했다.
- `npm test` 102개 통과, `npm run verify:originals` 기존 추적 원본 42개 일치. 제공 PPTX·ZIP 18개도 조사 전후 SHA-256 일치.
- 한글 작업 경로에서 Vite가 새 dist를 생성하지 않는 환경 문제를 확인해, 영문 임시 경로 사본에서 `/NA2-study/` 배포 경로로 빌드했다. 빌드 출력을 실제 미리보기로 검사한다.
- Windows Chromium 기반 브라우저의 1440×1000·360×800 화면에서 이론 10개의 도해 12개 로딩과 페이지 가로 넘침 없음을 확인했다. 도해 12개를 모바일에서 각각 열고 닫았고, 커넥터 그림의 확대·화면 맞춤·Escape·포커스 복귀를 확인했다.
- 읽음 표시의 새로고침 복원, 다른 탭 평가 시작 시 열린 확대 창 해제·스크롤 잠금 해제, 검수용 평가 4문항 완료 후 이론 복귀와 읽음 표시 유지 확인. 검수 탭 콘솔 오류·경고 없음.

원본 SHA-256 목록은 [THEORY_SOURCE_HASHES.json](THEORY_SOURCE_HASHES.json)에 기록한다. 검토 원본 비트맵·상세 카탈로그·컨택트시트·화면 증거는 Git 제외 경로 `verification/theory-images-20261024/`에 보관한다.

도해의 확인은 실물 케이블 측정이나 실제 스마트폰 검증을 대신하지 않으며, 이론 10개는 전체 검정 범위를 모두 수록한 상태가 아니다.

## 공개 배포 확인

- 앱 변경 커밋: `7887a170ce4f50b6339dd30e8f99d626ce6fbde1`
- [자동 검사 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40046187159)
- [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40046187201), 2026-10-24 09:41 KST 완료
- [공개 이론 목록](https://sumilee-phd.github.io/NA2-study/#/learn/theory)에서 미리보기 10개와 `index-CluHXHUG.js`를 확인했다.
- 공개 이론 10개에서 도해 12개를 각각 확대해 모두 로딩됨을 확인했다. 데스크톱 가로 넘침 없음, 커넥터 360px 모바일 확대창 가로 넘침 없음, 도해 참고자료 펼침 표시 확인, 공개 검수 탭 콘솔 오류·경고 없음.
- 공개 확인에서는 학생의 읽음 표시·문항 답안을 변경하지 않았다. 로컬 검수용 학습 기록과 구분한다.

증거: `verification/theory-images-20261024/public-audit.json`, `public-theory-list-desktop.png`, `public-orientation-desktop.png`, `public-orientation-mobile.png`. 이 기록의 후속 문서 커밋은 앱 코드를 바꾸지 않는다.
