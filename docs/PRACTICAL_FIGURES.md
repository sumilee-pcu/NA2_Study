# 실기 페이지 시각자료 보강

검토일: 2026-10-24. 실기 홈·작업형, 케이블링 9개 메뉴, Windows 4과제·라우터 4과제, 단답형·객관식 24문항과 결과·복습·기록 화면을 점검했습니다.

## 반영 내용

- 신규 SVG 도해 17개, ICQA 실제 실습 화면 14개. 기존 이론 도해도 관련 개념·문제 해설에서 재사용합니다.
- 8개 실습 모두 풀이에 개념도와 해당 과제의 실제 화면을 연결했습니다. 학생이 풀이를 열면 기존 `usedSolution` 기록이 유지됩니다.
- 24문항 중 17문항에 제출 후 시각 해설을 연결했습니다. 목록·미제출 문제에는 답을 알려주는 그림을 렌더링하지 않습니다.
- 모든 그림과 화면에 제목·대체 설명·캡션·근거를 제공하며, 크게 보기·1200px 확대·키보드 닫기를 지원합니다.
- 원본 캡처를 자르거나 내용을 바꾸지 않고 복사했습니다. 14개 파일의 원본·배포본 SHA-256 일치를 확인했으며 `PRACTICAL_SCREEN_SOURCES.json`에 기록했습니다.

## 전체 페이지별 판단

| 범위 | 반영 또는 유지 이유 |
|---|---|
| 실기 홈 | 기존 세 영역 아이콘·카드는 탐색 목적에 적합하여 유지 |
| 작업형 소개 | 기존 순서 5단계 아래 삽입 품질 비교와 시험기 오류 도해 추가. 공구별로 달라지는 탈피·절단 길이는 임의의 공통 수치로 제시하지 않음 |
| 케이블링 대시보드 | 기존 훈련 카드·진행 지표 유지 |
| 케이블링 개념 학습 | 핀·색상·줄무늬·직결/크로스 도해 유지. 관찰 방향 탭에 접점 면과 1~8번 핀 도해 연결 |
| 케이블링 훈련 | 기존 문제별 커넥터·선택 배열 유지. 평가에 정답 그림을 추가하지 않음 |
| 핀별 진단·배열 교정 | 기존 핀 상태·선택·교환 시각화가 충분하여 유지 |
| 오답 복습·학습 기록·자료/설정 | 기존 실제 기록과 표 유지. 학습 내용과 무관한 장식 이미지 추가 없음 |
| 케이블 제작 연습 | 타이머와 점검표를 먼저 유지하고 아래에 품질·시험기 그림 재사용 |
| Windows·라우터 목록 | 기존 8과제 카드·진행률 유지. 정답을 보여주는 완료 화면을 목록에 배치하지 않음 |
| 실습 상세 8개 | 풀이를 연 뒤 개념도와 실제 입력·조회 화면 제공 |
| 단답형·객관식 목록/미제출 | 문항·정답·채점 기준 유지. 새 해설 이미지 없음 |
| 제출 후·결과·오답·학습 기록 | 기존 Explanation에서 같은 시각 해설 재사용 |

## 실습 자료 연결

| 과제 | 도해 | 실제 화면 수 | 읽을 부분 |
|---|---|---:|---|
| windows-ipv4 | /29 주소 블록 | 1 | 서버·마스크·게이트웨이·DNS 입력칸 |
| windows-dhcp | 범위·제외·후보 수 | 3 | /25 범위, 제외 목록, 0일 6시간 0분 |
| windows-dns-records | CNAME → A → IPv4 | 2 | A의 IPv4와 CNAME의 대상 FQDN |
| windows-dns-soa | 시간 단위 환산 | 1 | 60분·15분·1일·10분, 별도 SOA TTL |
| router-basics | 모드와 저장 방향 | 2 | hostname 변경, copy와 startup-config 조회 |
| router-interface | 모드와 저장 방향 | 2 | 주소·마스크·no shutdown, up와 protocol down 구분 |
| router-route | 목적지·다음 홉 | 1 | 실행 설정의 ip route 행 |
| router-access | 모드·라인 선택 | 2 | 콘솔/VTY 설정과 실제 콘솔 인증 |

## 문제 해설 연결

| 문항 | 시각 설명 |
|---|---|
| PRAC-001 | /24의 비트와 10진수 마스크 |
| PRAC-002·009 | /18 비트 AND와 전체 주소 16384개 |
| PRAC-004·005·024 | ARP 주소 해석, ICMP Echo·도달 불가 구분 |
| PRAC-006 | 기존 DHCP·DNS 흐름도 |
| PRAC-008·022 | 755와 -rwxr-xr-x의 대응 |
| PRAC-010 | /16에서 /19 여덟 블록으로 분할 |
| PRAC-011·023 | TCP 바이트 스트림·양방향과 메시지 경계 |
| PRAC-012 | 기존 TCP·UDP 비교 |
| PRAC-015·016 | services·passwd·shadow 역할 |
| PRAC-017 | IPv6 unicast·anycast·multicast |
| PRAC-020 | df의 파일시스템 관점과 du의 파일/디렉터리 관점 |
| PRAC-003·007·013·014·018·019·021 | 짧은 정의·수치·명령 기능은 기존 지문과 해설로 충분해 유지 |

## 근거와 재생성

- 기존 과제의 공식 Microsoft·Cisco·IETF 근거와 실제 에뮬레이터 검증 기록(`PRACTICAL_LABS_VERIFICATION.md`)을 대조했습니다. 화면은 2026-10-23~24 촬영본입니다.
- 케이블 품질은 [IDEAL 제작 안내](https://www.idealind.com/content/dam/electrical/assets/DataComm/Modular%20Plugs/ModularPlug%20Solutions.pdf)와 [Klein Tools 플러그 조립 지침](https://data.kleintools.com/sites/all/product_assets/documents/instructions/klein/VDV826_ModularDataPlug_Instructions.pdf), 시험기는 [Fluke split pair 설명](https://www.flukenetworks.com/support/knowledge-base/linkiq/split-pair-identification)과 [와이어맵 설명](https://www.flukenetworks.com/blog/cabling-chronicles/wire-map-testing-it-s-not-all-about-color)을 참고했습니다.
- TCP 메시지 경계는 [RFC 9293 §3.7](https://www.rfc-editor.org/rfc/rfc9293#section-3.7), IPv6 유형은 [RFC 4291 §2](https://www.rfc-editor.org/rfc/rfc4291#section-2), 권한·용량은 GNU Coreutils 문서를 대조했습니다. 그림별 링크는 화면의 ‘이 그림의 근거’에도 표시합니다.
- `scripts/build-practical-figures.mjs`는 케이블·실습·서브넷 등 13개 SVG를 재생성합니다. 나머지 `prefix-24`, `arp-icmp`, `linux-755`, `tcp-stream` 4개는 직접 작성한 SVG입니다.
- 공개 참고자료의 사진을 옮기거나 실제 화면을 합성하지 않았습니다. 개념도와 ICQA 프로그램 캡처를 명확히 구분합니다.

## 검증

- 전체 자동 테스트 106개 통과. 신규 검사는 실습/문항 매핑, SVG 안전성, 독립 계산값 대조, 캡처 14개 해시를 확인합니다.
- 기존 독립 앱 원본 42개 추적 파일 SHA-256 검증 통과. 문제·답안·학습 기록 모델과 저장 키 변경 없음.
- 별도 ASCII 경로에서 정식 배포 설정으로 빌드 성공. 한글 경로의 로컬 Vite 문제를 피하기 위한 검수 사본이며 원본 폴더는 보존했습니다.
- 1440px 브라우저에서 8과제 전체의 풀이 전 이미지 0개, 풀이 후 22개 그림 배치와 이미지 로딩 확인. 14개 실제 화면 전체를 원본과 대조했습니다.
- 24문항 전체에서 미제출 이미지 0개, 제출 후 대상 17문항의 이미지 로딩·확대 확인.
- 360×800에서 실기 홈·작업형·실습 목록·상세 8개 모두 페이지 가로 넘침 없음. 확대 시 그림 영역만 가로 스크롤하고 Escape로 닫으면 버튼 포커스·본문 스크롤 복원.
- 실습 입력·판정 새로고침 복원, 답안 수정 시 이전 판정 해제 확인. 풀이 참고 기록 유지.
- 케이블링 관찰 방향·제작 연습 그림 표시, 다른 경로로 이동 시 열린 대화상자 제거 확인.
- 별도 탭에서 케이블링 평가 시작 시 열린 그림·본문 스크롤 잠금 해제 및 작업형·실습·문제풀이의 새 해설 그림 0개 확인. 검수는 localhost에만 수행했습니다.

## 검증 범위의 한계

캡처는 ICQA 실습용 프로그램이며 실제 Windows Server 2022 화면이 아닙니다. 정적 경로의 전달 성공, VTY 원격 인증·330초 유휴 종료, 실제 시험 채점은 확인되지 않았습니다. 콘솔 인증 성공과 설정 저장·재조회 등 확인된 범위만 캡션에 기재했습니다. 화면 자료가 실물 케이블 품질이나 실제 서버·네트워크 동작을 대신 검증하지 않습니다.

## 공개 배포 확인

- 기능 커밋: `1c4e636b302e6cf444cbd2f16d65a50d36843943`.
- [자동 검사 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40048552845), [Pages 배포 성공](https://github.com/sumilee-phd/NA2-study/actions/runs/40048552851).
- 공개 [작업형 페이지](https://sumilee-phd.github.io/NA2-study/#/practical/work)에서 새 번들 `index-DBsw-IcB.js`와 두 도해를 확인했습니다. 1440×1000 및 360×800 확대 보기·가로 넘침·오류/경고 0건을 확인했습니다.
- 외부 파일로 배포된 이미지 23개(실제 화면 14개 포함)와 새 JavaScript를 HTTP 200 및 검수 빌드 SHA-256 일치로 확인했습니다. 작은 도해 8개는 검증한 동일 JavaScript 안에 포함됩니다.
- 공개 확인에서는 실습 답안 제출이나 풀이 열람 기록을 새로 만들지 않았습니다. 저장·채점·평가 가드 시험은 localhost에서 수행했습니다.
