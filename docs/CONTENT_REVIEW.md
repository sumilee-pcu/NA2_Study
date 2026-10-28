# 학습 콘텐츠 검토 기록

검토일: 2026-10-22

## 작성 범위

`src/content/learning.mjs`에 이론 10개, 자체 개념확인 20개, FAQ 12개, 개인 연습 준비물 8개, 대상별 안내 4개를 작성했습니다. 네트워크일반·TCP/IP·NOS·네트워크운용기기에서 각각 2개, 실기 케이블링에서 2개 주제를 제공합니다. 전체 시험 범위나 출제 빈도를 대표하는 목록은 아닙니다.

기존 NA2-com과 NA2-cabling은 읽기만 수행했습니다. 기존 답안표·문제 원문·공개 앱은 변경하지 않았습니다. 학습 문단과 자체 확인 문항은 이번 통합 앱을 위해 작성했습니다. 특정 교육 사이트의 카드나 문구를 복제하지 않았습니다.

교재 문체는 본진 `C:\Users\user\.claude\skills\ko-textbook-style\SKILL.md`를 적용했습니다. 개념은 표준 전문용어로 표기하고 소제목은 명사구로 구성했습니다.

## 데이터 계약

- `TOPICS`: `id`, `subject`, `title`, `summary`, `objectives`, `prerequisites`, `sections`, `example`, `pitfalls`, `checks`, `sources`, `checkedAt`, `relatedQuestions`, 선택적 `practicePath`.
- `sections`: 제목과 문단 배열. 비교표는 `table.headers`와 `table.rows`.
- `checks`: 4개 선택지를 가진 자체 문항 2개씩. `answer`는 **0부터 시작**하는 선택지 인덱스.
- `FAQS`: `id`, `category`, `question`, `answer`, 선택적 `source`, `checkedAt`.
- `TOOLS`: `id`, `name`, `role`, `requirement`, `compatibility`, `note`.
- `GUIDES`: `id`, `title`, `audience`, `steps`, `startPath`.
- 모든 주제·FAQ의 `checkedAt`은 `2026-10-22`입니다. 기술 출처는 HTTPS 1차 자료만 포함했습니다.

## 주제별 1차 근거와 적용 한계

| 주제 ID | 주요 근거 | 확인·반영한 범위 |
|---|---|---|
| `network-osi` | [Oracle OSI Reference Model](https://docs.oracle.com/cd/E19504-01/802-5886/intro-45828/index.html), [RFC 1122 §1.1.3](https://www.rfc-editor.org/rfc/rfc1122#section-1.1.3), [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293) | OSI 7계층과 Internet 계층 모델. 참조 모델과 실제 구현을 구분했습니다. |
| `network-ethernet` | [Cisco Troubleshooting Ethernet](https://www.cisco.com/en/US/docs/internetworking/troubleshooting/guide/tr1904.html) | Ethernet and IEEE 802.3, Full-Duplex Operation, Frame Formats 절. 반이중 CSMA/CD와 전이중을 구분했습니다. 문서의 오래된 장비·거리·대중성 서술을 일반화하지 않았습니다. |
| `tcpip-subnetting` | [RFC 4632 §3.1·§5.1](https://www.rfc-editor.org/rfc/rfc4632), [RFC 1122 §3.2.1.3](https://www.rfc-editor.org/rfc/rfc1122#section-3.2.1.3) | 접두 길이·주소 블록·최장 접두부. /31·/32에 일반 LAN의 전체 주소 수−2를 기계적으로 적용하지 않도록 명시했습니다. 예제의 64~127 범위와 62개 호스트는 직접 계산했습니다. |
| `tcpip-transport` | [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293), [RFC 768](https://www.rfc-editor.org/rfc/rfc768) | 바이트 스트림·데이터그램, 순서·재전송·흐름 제어, 헤더 구조. UDP 위의 모든 응용이 신뢰성을 제공할 수 없다는 식의 확대는 피했습니다. |
| `nos-linux` | [Red Hat RHEL 9 권한 관리 §9.1](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-file-system-permissions_configuring-basic-system-settings), [Red Hat 기본 명령](https://www.redhat.com/en/blog/basic-linux-commands) | 기본 권한과 기호식·8진수, 조회 명령. ACL·SELinux와 파일 삭제 권한을 기본 파일 쓰기 비트와 구분했습니다. GNU 공식 문서는 일부 원문 조회가 시간 초과되어 최종 근거로 사용하지 않고 직접 읽은 Red Hat 공식 자료로 대체했습니다. |
| `nos-windows-services` | [Microsoft DHCP](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top), [Microsoft DNS](https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-overview), [ICQA FAQ B-3](https://www.icqa.or.kr/cn/faq?fm_id=2) | DHCP의 임대·옵션과 DNS 이름 해석. 실제 운영체제와 시험 에뮬레이터의 차이를 명시했습니다. |
| `devices-switch-router` | [Cisco CBS350 MAC Address Tables 1~2쪽](https://www.cisco.com/c/en/us/td/docs/switches/lan/csbms/CBS_250_350/Administration-Guide/cbs-350/mac-address-tables.pdf), [Cisco Unicast Flooding](https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6000-series-switches/23563-143.html), [Cisco Ethernet Frame Formats](https://www.cisco.com/en/US/docs/internetworking/troubleshooting/guide/tr1904.html), [RFC 4632 §5.1](https://www.rfc-editor.org/rfc/rfc4632#section-5.1) | 출발지 MAC 학습·목적지 MAC 조회·같은 VLAN 내 플러딩·일반 Ethernet 주소 6바이트·라우팅. 정책에 따른 플러딩 제한을 명시했습니다. |
| `devices-vlan` | [Cisco VLAN access·trunk](https://www.cisco.com/c/en/us/support/docs/smb/switches/cisco-small-business-300-series-managed-switches/smb5653-configure-port-to-vlan-interface-settings-on-a-switch-throug.html), [Cisco VLAN 간 전달 예](https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6000-series-switches/23563-143.html) | 브로드캐스트 영역 분리, access·trunk의 일반 용도. 장비별 기본값을 일반화하지 않았고 음성·네이티브 VLAN 예외를 표시했습니다. |
| `cabling-orientation` | [ICC 1번 핀 위치](https://icc.com/help/position-1-located-rj-45-modular-plug-jack/), [Fluke T568A/B](https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs) | 플러그의 클립 반대쪽 관찰과 왼쪽 1번, 잭 후면 제조사별 결선 차이. 앱에서는 접점 끝 위·케이블 아래 방향을 추가로 고정했습니다. |
| `cabling-t568` | [H3C Appendix C](https://www.h3c.com/en/Support/Resource_Center/EN/Security/Catalog/F5000/F5000/Technical_Documents/Install___Upgrade/Installation_Guides/H3C_F5000-AI-20%5B40%5D_IG/202211/1715517_294551_0.htm), [Fluke T568A/B](https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs), [Fluke Crossover](https://www.flukenetworks.com/knowledge-base/dsx-cableanalyzer-series/crossover-cable-testing-dsx-cable-analyzer), [HPE Aruba 네 쌍 사용](https://arubanetworking.hpe.com/techdocs/Switches/Aruba_6200/5200-6885/v34011710.html) | 양 표준 8개 핀, 직결, 10/100 두 쌍 교차, 1000BASE-T의 네 쌍·별도 교차 구분. H3C의 장비 이름만으로 연결을 단정하는 예시는 채택하지 않았습니다. |

준비물의 역할은 H3C Appendix C의 제작 절차와 [Fluke 시험 결과 안내](https://www.flukenetworks.com/knowledge-base/microscanner2/twisted-pair-test-results-microscanner2)를 참조했습니다. 특정 제품을 추천하거나 구매 링크를 제공하지 않았습니다. 플러그·공구·케이블 간 호환성은 사용 제품의 설명서를 확인하도록 구성했습니다. 연습 준비물 목록은 시험장 반입 허용 목록이 아닙니다.

시험 안내는 [ICQA 검정 안내](https://www.icqa.or.kr/cn/page/network)와 [시험 FAQ](https://www.icqa.or.kr/cn/faq?fm_id=2)를 직접 확인했습니다. FAQ B-2의 2급 50문항·50분, B-3의 에뮬레이터와 실제 Windows 차이만 반영했습니다. 시험장 도구별 반입 여부는 확정하지 않았습니다.

## 원문 이미지 대조를 완료한 문항 연결

`public/data/bank.json`의 텍스트와 `images[0]`을 함께 확인했습니다. 추출 이미지는 `verification/content/문항ID.webp`입니다. 아래 정답 번호는 보존된 **1부터 시작하는 기존 가채점 답안 값**입니다. 이론의 자체 확인 `answer`와 인덱스 방식이 다릅니다.

검토 당시 문항 텍스트·이미지의 SHA-256, 쪽수, 가채점 답안을 `CONTENT_EVIDENCE.json`에 보관했습니다. 자동 테스트는 저장소에 포함된 문제은행을 이 기록과 직접 비교하므로 로컬 검토용 이미지 파일 없이도 동일한 검증을 수행합니다.

| 주제 ID | 문항 ID / 합본 PDF 쪽 | 기존 답안 | 연결 근거와 검토 한계 |
|---|---|---|---|
| `network-osi` | `2022-01-Q18` / 2쪽 | 3 | 데이터링크 기능이 아닌 텍스트 압축·암호 기능을 묻는 보기까지 확인. OSI 개념적 분류와 실제 암호화 구현의 차이를 이론에 명시했습니다. |
| `network-ethernet` | `2022-01-Q22` / 3쪽 | 3 | 공유 채널 검사·충돌·대기 후 재전송 설명과 CSMA/CD 보기를 확인. 전이중 Ethernet에 일반화하지 않도록 했습니다. |
| `tcpip-subnetting` | `2022-03-Q03` / 11쪽 | 3 | C Class에서 6개 서브넷 요구, 마스크 보기 0·192·224·240 확인. 기존 /24를 동일 크기로 분할한다는 전통적 문제 조건에 대응하며 현재 CIDR에서는 주소만으로 마스크를 추정하지 않도록 설명했습니다. |
| `tcpip-transport` | `2022-03-Q07` / 11쪽 | 3 | UDP의 특징 중 Dynamic Sliding Window 흐름 제어를 잘못 제시한 보기 확인. 영상 서비스가 항상 UDP라는 주장은 학습 문장에 채택하지 않았습니다. |
| `nos-linux` | `2023-01-Q34` / 24쪽 | 1 | 모든 사용자 쓰기 권한 제거와 `chmod a-w sample` 보기 확인. a·-·w를 분리해 설명했습니다. |
| `nos-windows-services` | `2022-02-Q28` / 8쪽 | 1 | 부팅 시 IP 자동 할당과 DHCP 보기 확인. DHCP와 DNS의 역할 비교에 직접 연결했습니다. |
| `devices-switch-router` | `2022-01-Q46` / 5쪽 | 2 | LAN 카드 MAC 주소 비트 수와 48비트 보기 확인. 이 문항은 주제 중 MAC 주소 길이에 연결되며 라우팅 전체를 평가하는 문항은 아닙니다. |
| `devices-vlan` | `2022-01-Q49` / 5쪽 | 2 | 하나의 LAN을 논리적으로 분할한다는 지문과 VLAN 보기 확인. 지문의 보안 관련 표현을 VLAN만으로 보안이 완성된다는 주장으로 확대하지 않았습니다. |

연결은 900문항 중 이 8문항에 한정했습니다. 키워드만으로 나머지 문항을 자동 연결하지 않았습니다. 이는 연결 적합성 검토이며 900문항의 정답키 전체 감사나 출제기관의 최종 정답 인증이 아닙니다. 케이블링 2개 주제는 필기 문항을 억지로 연결하지 않고 핀 복습으로 연결합니다.

## 검증 결과

`node --check src/content/learning.mjs` 통과. `node --test tests/content.test.mjs`의 8개 테스트 모두 통과했습니다.

- 5개 분류별 2개 주제, 총 10개 주제 확인.
- 주제·자체 문항·FAQ·준비물·안내 ID 중복 없음.
- 자체 확인 20개의 정답 인덱스와 해설 필수값 확인.
- 모든 공개 주제의 출처·검토일·목표·비교표·예제·혼동 주의 항목 확인.
- 연결한 8문항의 ID 존재와 원문 이미지 보존 확인.
- T568A/B의 8핀 표를 명시된 배열과 대조.
- 안내의 시작 경로를 콘텐츠 계약과 대조.

이 검증은 콘텐츠와 데이터 계약을 대상으로 합니다. 브라우저의 실제 상세 화면·주소 이동·접근성·채점 상태·기록 이관은 통합 앱 검증에서 별도로 확인해야 합니다. Linux 명령과 네트워크 장비 설정을 실제 운영체제·실물 장비에 실행한 검증은 수행하지 않았습니다.
