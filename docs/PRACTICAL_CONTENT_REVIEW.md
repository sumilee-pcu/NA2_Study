# 실기 초기 문제은행 검수 기록

검토일: 2026-10-23

상태: `reviewed-initial-not-exhaustive`
데이터: [practical-bank.v1.json](../content-review/practical-bank.v1.json)

## 결과와 적용 범위

사용자 제공 PDF의 학습 주제를 바탕으로 **교육용 재구성 문항 24개**를 작성했다. 단답형 8개, 단일선택형 8개, 복수선택형 8개이다. 유형별 같은 수량은 초기 화면·채점 경로를 고르게 확인하기 위한 구성이다. 공식 기출문제·공식 정답으로 표시하지 않으며, 전체 실기 범위나 실제 시험의 문항 비율을 대표하지 않는다.

문항은 `sourceDisposition` 기준으로 원문 취지 확인(`verified`) 8개, 조건·범위 명확화(`clarified`) 10개, 오류 교정(`corrected`) 6개이다. PDF 쪽별로 1쪽 4개, 2쪽 11개, 3쪽 9개를 연결했다. 26개 외부 근거 항목의 제목·URL·절 또는 표 위치·확인일을 JSON의 `evidence`에 기록했다. `reviewStatus=approved`는 이 초기 문항의 내용 검수를 뜻하며 출제기관 인증이나 실행 중인 앱의 검증을 뜻하지 않는다.

앱 화면·라우터 CLI·채점 엔진·Windows Server 실습 엔진을 이 검수에서 구현하지 않았다. 데이터에는 정답이 포함되므로 보안이 필요한 실제 평가의 비밀 정답 저장소로 사용하지 않는다.

## 원본과 확인 방법

| 항목 | 확인 내용 |
|---|---|
| 원본 파일 | `네트워크관리사실기단답형.pdf` |
| 파일 크기 | 194130바이트 |
| PDF 쪽수 | 3쪽; 파일의 첫 쪽을 1쪽으로 표기 |
| SHA-256 | `31B6F1FCB596EB3E6E60CFBC21DDD994A2C02425B0AFAD8E4D818C0F7A7B8D0E` |
| 출처 표시 | 하단에 `kkkkkky51.blog.me` 표기; 발행일·저작권 허락·출제기관 공식성은 확인하지 못함 |
| 판독 | 앞선 읽기 전용 검토의 텍스트와 3쪽 전체 렌더 확인 결과를 재사용 |
| 그림 자료 | 1쪽 왼쪽 아래 /24 마스크 표는 추출 텍스트에서 숫자가 누락되어 렌더로 대조 |
| 원본 보존 | 앞선 검토의 작업 전후 해시 일치; 이번 단계는 원본 재작성·재배포 없이 문항 데이터와 검수 기록만 생성 |

원문 전체, PDF 사본, 원문 페이지 이미지, 추출문 전체는 저장소에 넣지 않았다. 원문은 주제와 쪽수를 찾는 자료로 사용하고, 정답의 기술적 근거는 RFC·IANA·Linux man-pages 등에서 별도로 확인했다. 사용자 제공 라우터 스크린샷의 `ip add`, `copy r s`, `write` 미지원 안내는 이 PDF에 없는 자료이므로 이번 PDF 기반 문항의 근거로 섞지 않았다.

외부 자료는 해당 주장에 필요한 절을 직접 열어 대조했다. GNU 웹사이트의 일부 명령 매뉴얼 조회가 시간 초과되어 GNU coreutils에서 생성된 매뉴얼의 man7.org 재현본을 확인했다. 해당 항목의 제목에 재현본임을 표시했고, 문서의 COLOPHON에서 GNU 원본 프로젝트를 확인했다. 모든 문서의 최신 내용 전체나 후속 RFC를 전수 감사한 것은 아니다.

## 원문의 교정·제외·보류

아래는 이번 초기 문항 선정에 영향을 준 사항이다. 이 목록에 없는 PDF 서술까지 검증 완료로 보지 않는다.

| PDF 쪽·위치 | 문제점 | 처리와 근거 |
|---|---|---|
| 2쪽 /18 계산 | 셋째 옥텟 증분 64와 전체 IP 주소 수를 혼동 | **교정**, PRAC-009. 전체 주소 수는 2^(32-18)=16384이며 64는 셋째 옥텟의 블록 증분이다. [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1). |
| 2쪽 /19 마스크의 서브넷 수 | 원래 주소 블록이 없어 8개로 확정할 수 없음 | **조건 추가**, PRAC-010. 172.16.0.0/16을 /19로 나누고 모든 블록을 포함한다는 조건을 명시했다. 2^(19-16)=8. [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1). |
| 3쪽 `/etc/passwd` 행 | 암호 저장 위치 설명에 shadow 방식 조건 누락 | **교정**, PRAC-016. 계정 정보 파일이며 일반적인 shadow 방식의 암호 해시 저장 위치는 `/etc/shadow`로 구분했다. [passwd(5) DESCRIPTION](https://man7.org/linux/man-pages/man5/passwd.5.html). |
| 3쪽 `/etc/services` 행 | 데이터 파일을 포트 출력 명령으로 분류 | **교정**, PRAC-015. 서비스 이름·포트·프로토콜 대응 파일이며 실행 중인 서비스 목록도 아니다. [services(5) DESCRIPTION](https://man7.org/linux/man-pages/man5/services.5.html). |
| 2쪽 TCP/UDP 비교표 | UDP를 단방향 전송으로 단정 | **교정**, PRAC-012. UDP 자체의 전달·순서 보장 부재를 평가한다. 송수신과 응답이 가능하다는 근거는 [RFC 768 Fields·User Interface](https://www.rfc-editor.org/rfc/rfc768.html)에 있다. |
| 2쪽 TCP/UDP 비교표 | TCP의 확인 응답·연결 기능을 수신자 인증과 혼동 | **교정**, PRAC-011·023. 기본 TCP에는 암호학적 신원 인증이 내장되어 있지 않다. [RFC 9293 §2.2·§7](https://www.rfc-editor.org/rfc/rfc9293.html#section-7). |
| 1·2쪽 ARP/RARP 계층 목록 | OSI와 TCP/IP 기준 없이 네트워크 계층으로 일괄 분류 | **제외**, EXC-001. RFC 1122는 ARP를 Link Layer 장에서 다룬다. 계층 단정은 쓰지 않고 PRAC-004에서 같은 링크의 주소 해석만 평가했다. RARP에 관한 별도 문항은 만들지 않았다. [RFC 1122 §2.3.2](https://www.rfc-editor.org/rfc/rfc1122.html#section-2.3.2). |
| 2쪽 RIP 계층 목록 | 라우팅 기능과 실제 캡슐화를 혼합 | **제외**, EXC-002. RIP의 계층 이름을 단독 정답으로 쓰지 않는다. RIPv2의 UDP 520 사용 및 메트릭 정의를 확인하고 PRAC-013에 메트릭만 반영했다. [RFC 2453 §3.2·§3.6](https://www.rfc-editor.org/rfc/rfc2453.html#section-3.6). |
| 2쪽 SSL 설명 | 현재 보안 권고와 구형 SSL 표현을 구분하지 않음 | **제외**, EXC-003. SSLv3는 사용 금지 대상이다. HTTPS/TLS의 별도 문항은 후속 규격을 추가 확인한 뒤 작성한다. [RFC 7568 §3](https://www.rfc-editor.org/rfc/rfc7568.html#section-3). |
| 3쪽 Pharming 설명 | 정상 도메인 탈취만으로 범위를 한정 | **제외**, EXC-004. 기술적 수단을 통한 위조 사이트로의 유도라는 범위를 확인했다. 공격 경로를 명시한 새 사례 없이는 피싱 등과 구별하는 문항으로 쓰지 않는다. [NIST Pharming 정의](https://csrc.nist.gov/glossary/term/pharming). |
| 3쪽 Spoofing 설명 | 위조 웹사이트의 정보 탈취에만 한정 | **제외**, EXC-005. 사칭 대상·수단을 명시해야 한다. [NIST spoofing 정의](https://csrc.nist.gov/glossary/term/spoofing). |
| 3쪽 WAF 설명 | 모든 미지 공격과 모든 호스트에 대한 보호로 확대될 수 있음 | **제외**, EXC-006. HTTP 애플리케이션에 적용하는 규칙과 보호 범위·유지관리 조건이 필요하다. [OWASP WAF Description](https://community.owasp.org/Web_Application_Firewall). |
| 1쪽 TCP/IP 계층 표 | 응용 계층을 OSI 세션 계층 하나에만 대응 | **보류**, EXC-007. 두 참조 모델의 기준을 구분하는 설명을 별도로 검토해야 한다. [RFC 1122 §1.1.3](https://www.rfc-editor.org/rfc/rfc1122.html#section-1.1.3). |
| 1쪽 클래스별 수량 | 전체 주소 조합·할당 가능 수·역사적 클래스 개념 혼재 | **보류**, EXC-008. CIDR와 예약 주소 조건을 명시한 재작성 전에는 정답화하지 않는다. [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1). |
| 1쪽 케이블제작 | 장비 이름만으로 연결을 단정하며 출제 빈도 근거 없음 | **보류**, EXC-009. 포트·속도·자동 교차 지원과 공식 시험 안내를 따로 확인해야 한다. 이번 문제은행의 검증된 사실로 수록하지 않았다. |
| 1쪽 IDS 설명 | 탐지 가능·불가능을 절대적으로 단정 | **보류**, EXC-010. 탐지 방식의 조건과 오탐·미탐 한계를 별도로 검수해야 한다. 이번 문제은행에는 포함하지 않았다. |

제외는 원문의 해당 표현을 출제 근거로 채택하지 않았다는 뜻이다. 보류는 추가 검수 전까지 문항에서 사용하지 않는다는 뜻이다. `excludedItems`에는 제외 6개와 보류 4개를 저장했다.

## 문항별 정답·출처 연결

`answer`의 선택지 값은 보기 순번이 아닌 고정 ID이다. 단일선택도 ID 배열 한 개로 저장했다. PDF 쪽은 주제를 찾는 위치이며, 설명에 보강한 사실은 외부 근거의 해당 절로 추적한다.

| ID | 유형 | 주제 | 정답 | PDF 쪽 | 처리 | 외부 근거 |
|---|---|---|---|---|---|---|
| PRAC-001 | 단답형 | IPv4 서브넷 | `255.255.255.0` | 1 | verified | [RFC4632](https://www.rfc-editor.org/rfc/rfc4632.html) |
| PRAC-002 | 단답형 | IPv4 서브넷 | `128.148.192.0` | 1 | verified | [RFC4632](https://www.rfc-editor.org/rfc/rfc4632.html) |
| PRAC-003 | 단답형 | IPv6 주소 | `128` | 1 | verified | [RFC4291](https://www.rfc-editor.org/rfc/rfc4291.html) |
| PRAC-004 | 단답형 | 주소 해석 | `ARP` | 2 | clarified | [RFC826](https://www.rfc-editor.org/rfc/rfc826.html) |
| PRAC-005 | 단답형 | ICMP | `ICMP` | 2 | clarified | [RFC792](https://www.rfc-editor.org/rfc/rfc792.html) |
| PRAC-006 | 단답형 | DHCP | `DHCP` | 3 | clarified | [RFC2131](https://www.rfc-editor.org/rfc/rfc2131.html) |
| PRAC-007 | 단답형 | Linux 명령 | `pwd` | 3 | verified | [GNU_PWD](https://man7.org/linux/man-pages/man1/pwd.1.html) |
| PRAC-008 | 단답형 | Linux 권한 | `chmod` | 3 | verified | [GNU_CHMOD](https://man7.org/linux/man-pages/man1/chmod.1.html) |
| PRAC-009 | 단일선택 | IPv4 서브넷 | `D` | 2 | corrected | [RFC4632](https://www.rfc-editor.org/rfc/rfc4632.html) |
| PRAC-010 | 단일선택 | IPv4 서브넷 | `C` | 2 | clarified | [RFC4632](https://www.rfc-editor.org/rfc/rfc4632.html) |
| PRAC-011 | 단일선택 | TCP | `B` | 2 | corrected | [RFC9293](https://www.rfc-editor.org/rfc/rfc9293.html), [RFC826](https://www.rfc-editor.org/rfc/rfc826.html) |
| PRAC-012 | 단일선택 | UDP | `A` | 2 | corrected | [RFC768](https://www.rfc-editor.org/rfc/rfc768.html) |
| PRAC-013 | 단일선택 | RIP | `B` | 3 | clarified | [RFC2453](https://www.rfc-editor.org/rfc/rfc2453.html) |
| PRAC-014 | 단일선택 | OSPF | `C` | 2 | verified | [RFC2328](https://www.rfc-editor.org/rfc/rfc2328.html) |
| PRAC-015 | 단일선택 | Linux 서비스 파일 | `B` | 3 | corrected | [LINUX_SERVICES](https://man7.org/linux/man-pages/man5/services.5.html) |
| PRAC-016 | 단일선택 | Linux 계정 파일 | `A` | 3 | corrected | [LINUX_PASSWD](https://man7.org/linux/man-pages/man5/passwd.5.html) |
| PRAC-017 | 복수선택 | IPv6 주소 | `A, B, D` | 1 | verified | [RFC4291](https://www.rfc-editor.org/rfc/rfc4291.html) |
| PRAC-018 | 복수선택 | 사설 IPv4 주소 | `A, C, D` | 2 | clarified | [RFC1918](https://www.rfc-editor.org/rfc/rfc1918.html) |
| PRAC-019 | 복수선택 | 서비스 포트 | `A, C, D` | 2 | clarified | [IANA_SSH](https://www.iana.org/assignments/service-names-port-numbers?search=ssh), [IANA_HTTPS](https://www.iana.org/assignments/service-names-port-numbers?search=https), [IANA_SNMP](https://www.iana.org/assignments/service-names-port-numbers?search=snmp) |
| PRAC-020 | 복수선택 | Linux 용량 조회 | `A, B` | 3 | clarified | [GNU_DF](https://man7.org/linux/man-pages/man1/df.1.html), [GNU_DU](https://man7.org/linux/man-pages/man1/du.1.html), [GNU_CHMOD](https://man7.org/linux/man-pages/man1/chmod.1.html) |
| PRAC-021 | 복수선택 | Linux 기본 명령 | `A, B, C` | 3 | verified | [GNU_CP](https://man7.org/linux/man-pages/man1/cp.1.html), [GNU_MV](https://man7.org/linux/man-pages/man1/mv.1.html), [GNU_PWD](https://man7.org/linux/man-pages/man1/pwd.1.html), [GNU_CHMOD](https://man7.org/linux/man-pages/man1/chmod.1.html) |
| PRAC-022 | 복수선택 | Linux 권한 | `A, B, C` | 3 | clarified | [GNU_CHMOD](https://man7.org/linux/man-pages/man1/chmod.1.html) |
| PRAC-023 | 복수선택 | TCP | `A, B` | 2 | corrected | [RFC9293](https://www.rfc-editor.org/rfc/rfc9293.html) |
| PRAC-024 | 복수선택 | ICMP | `A, B, C` | 2 | clarified | [RFC792](https://www.rfc-editor.org/rfc/rfc792.html), [RFC2131](https://www.rfc-editor.org/rfc/rfc2131.html) |

## 채점 계약

단답형의 정답 허용 범위는 `acceptedAnswers`에 열거한 문자열뿐이다. 각 문항의 정규화 설정을 입력과 정답 후보에 동일하게 적용한 뒤 정확히 비교한다. 현재 8문항은 각각 정답 후보를 한 개만 둔다. 영문 약어는 대소문자를 구분하지 않고, Linux 명령 `pwd`·`chmod`는 소문자를 요구한다.

1. `trim=true`: 입력 양끝 공백을 제거한다.
2. `collapseWhitespace=true`: 연속 공백을 한 칸으로 줄인다. `ignoreWhitespace=false`이므로 단어 내부 공백을 전부 없애지 않는다.
3. `caseSensitive=false`인 문항에서만 영문 대소문자를 무시한다.
4. 정규화 후 빈 문자열은 미응답(`unanswered`)이다. 부분 일치, 유사도, 임의 동의어, 단위·접미사·옵션 자동 제거, 전각 문자 자동 변환을 적용하지 않는다.

단일선택은 유효한 ID 하나만 제출해야 한다. 복수선택은 선택 순서와 관계없이 **정답 ID 집합과 정확히 일치**해야 하며 부분점수는 없다. 일부 정답 누락 또는 오답 추가는 오답이다. 선택이 전혀 없는 경우는 미응답(`unanswered`)이다. 알 수 없는 ID 또는 중복 ID를 가진 배열은 유효하지 않은 제출로 처리한다. UI가 보기 순서를 바꾸어도 ID와 정답 매핑을 유지해야 한다.

세 유형 모두 미응답은 정답이 아니며 과제를 완료하지 않는다. 학습 기록에서는 오답(`incorrect`)과 구분한다. 단답형의 정확 비교, 단일선택 한 개, 복수선택 완전 일치 규칙은 모호한 자동 인정을 줄이기 위해 정한 이 교육용 문제은행의 설계 규칙이다. ICQA 공식 채점 정책을 확인한 값으로 표시하지 않는다.

| 향후 채점 수용 검사 | 입력 예 | 기대 결과 |
|---|---|---|
| 모든 유형의 빈 답 | 공백만 입력 / 선택 없음 | 미응답; 정답 아님·과제 미완료 |
| PRAC-004 약어 대소문자·양끝 공백 | ` arp ` | 정답 |
| PRAC-004 내부 공백 | `A R P` | 오답 |
| PRAC-007 명령 이름 대소문자 | `PWD` | 오답 |
| PRAC-007 명령 이름 뒤 옵션 | `pwd -P` | 오답; 문항은 이름만 요구 |
| PRAC-003 정수 형식 | `128` / `128bit` | 정답 / 오답 |
| PRAC-002 네트워크 주소 형식 | `128.148.192.0/18` | 오답; 접미사 제외를 지문에 명시 |
| PRAC-018 복수선택 순서 | `[D, A, C]` | 정답 |
| PRAC-018 정답 누락 | `[A, C]` | 오답 |
| PRAC-018 오답 추가 | `[A, B, C, D]` | 오답 |
| PRAC-018 중복 ID | `[A, A, C, D]` | 유효하지 않은 제출 |
| PRAC-018 존재하지 않는 ID | `[A, C, D, Z]` | 유효하지 않은 제출 |

이 표는 구현 시 통과해야 할 조건이다. 실제 앱 채점 함수나 화면에 대한 실행 결과로 표시하지 않는다. 의미상 다른 정답 표기가 필요하면 해당 문항의 `acceptedAnswers`와 검수 기록을 함께 개정한다.

## 수행한 검증과 남은 한계

- JSON 파싱, 24개 고유 문항 ID, 세 유형 각 8개, PDF 쪽수 1~3, 검수 상태, 필수 정답 구조를 확인했다.
- 모든 문항의 근거 ID가 26개 근거 목록에 연결되며, 제외·보류 항목에 기재된 근거 ID도 존재한다.
- 단일선택은 정답 ID 한 개, 복수선택은 서로 다른 정답 ID 두 개 이상과 오답 보기 한 개 이상을 가진다. 정답 ID는 모두 해당 문항 보기에 존재한다.
- Python `ipaddress`로 /24 마스크, 128.148.210.12/18의 네트워크 주소, /18 전체 주소 16384개, /16을 /19로 나눈 8개 블록을 독립 계산해 대조했다.
- 24개 문항의 지문·정답·해설·근거 범위를 직접 검토했다. RIP 링크 비용, 전체 주소와 호스트 주소 구분, 파일과 명령 구분, 포트 등록과 실제 서비스 구분, 기본 권한 비트와 실제 접근 결과 구분을 지문 또는 해설에 명시했다.
- 원본 ZIP·PDF·기존 문제은행·앱 소스는 이 하위 작업에서 변경하지 않았다.

Linux 명령의 실제 운영체제 실행, 실제 라우터·ICQA 에뮬레이터 실행, 브라우저 문항 표시·키보드 조작·상태 보존·채점 동작은 이 검수의 수행 범위가 아니다. 초기 데이터의 통합 검증에서는 위 수용 검사, 긴 지문 줄바꿈, 복수선택 선택 개수, 정답 공개 시점, 오답 기록과 재시도 상태를 확인해야 한다. 보류 항목과 나머지 원문 전체는 추가 내용 검수가 필요하다.
