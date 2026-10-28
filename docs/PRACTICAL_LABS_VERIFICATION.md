# Windows·라우터 실습 자료 검수

최종 종합 기준일: 2026-10-24. 최초 추가 검수일은 2026-10-23이며 당시 기준 커밋은 `3327f7b`이다. 아래에 최신 종합표와 날짜별 실행·구현 기록을 함께 보존한다. 공개 배포 결과는 `DEPLOYMENT.md`에 별도로 기록한다.

<!-- lab-verification-summary:start -->
## 8개 과제 최종 검증표 · 2026-10-24

8개 과제의 설정·저장 절차를 ICQA 도구에서 확인했습니다. Packet Tracer 시뮬레이션에서는 VTY 원격 인증·유휴 종료와 함께 인터페이스·정적 경로·저장 후 재부팅 복원, IPv4·DNS·DHCP 보완 실험을 추가로 확인했으며, DNS·DHCP의 일부 항목은 부분 확인으로 남았습니다.

통과와 부분 확인은 각 항목에 적힌 관찰 범위에 한정합니다. 이 표는 실습 자료의 검증 결과이며, 학습자의 완료 기록이나 시험 점수가 아닙니다.

| 번호 | 과제 | ICQA 에뮬레이터·데모 검증 결과 | Packet Tracer 검증 결과 | 남은 한계 |
|---:|---|---|---|---|
| 1 | **IPv4 주소·서브넷 설정** | **입력·저장·재확인 통과.** /29 주소·마스크·게이트웨이·DNS를 입력하고 속성을 다시 열어 값 유지를 확인했습니다. | **보완 실험 통과.** PC-PT에 같은 /29 주소·게이트웨이·DNS를 넣고 같은 망 장치와의 통신, 게이트웨이를 거친 다른 망 통신, 지정 DNS 서버의 이름 조회를 확인했습니다. Windows 설정 화면 검증은 아닙니다. | 실제 Windows의 설정 화면과 통신은 미검증입니다. ICQA의 ipconfig /all은 설정과 무관한 고정 출력이므로 검증 근거로 사용할 수 없습니다. Packet Tracer 실험은 게이트웨이 라우터·DNS 서버·시험 이름을 추가한 구성이며, 파일을 다시 연 뒤의 PC 값은 조회하지 않았습니다. |
| 2 | **DHCP 범위·임대 기간** | **비활성 범위 생성·설정 확인 통과.** 주소 범위, /25 마스크, 제외 범위, 6시간 임대를 속성과 주소 풀에서 확인했습니다. | **할당 후속 실험 부분 확인.** 1841 라우터 DHCP로 .1~.10 제외와 /25 풀을 만들고 클라이언트 3대가 .11~.13을 받는 것, 해제 후 같은 주소의 재할당을 확인했습니다. 이 모델에서 임대 기간 지정 명령은 거부되었습니다. | ICQA에서는 범위 활성화와 실제 임대·갱신을 실행하지 않았습니다. 라우터 DHCP 실험은 Windows 제외 목록 기능 자체의 검증이 아니며, 6시간 임대의 실제 부여·자동 갱신·만료, 116개 전체 할당, /renew 순간의 패킷은 미검증입니다. 풀 표시의 Excluded addresses : 1은 집계 의미를 확인하지 못했습니다. |
| 3 | **DNS A·CNAME 레코드** | **생성·보존 확인 통과.** lab.example 영역에 A·CNAME을 생성하고 목록·속성에서 값을 확인했습니다. | **A 조회 통과·CNAME 구조 부분 확인.** Server-PT에 A·CNAME을 만들고 A 이름 조회와 별칭 이름의 192.168.60.20 해석을 확인했습니다. 응답 패킷에서 TYPE 5(CNAME) 레코드는 확인하지 못했습니다. | 에뮬레이터의 nslookup은 고정 출력이므로 생성한 레코드의 응답 확인에 사용할 수 없습니다. Packet Tracer에서도 응답 안의 CNAME 레코드 구조는 미확인이며, 사용한 PC-PT nslookup은 -type= 옵션을 지원하지 않았습니다. 실제 Windows DNS 서버는 미검증입니다. |
| 4 | **DNS SOA 관리 정보·시간** | **입력·저장·재확인 통과.** 일련번호, 주 서버, 책임자, 갱신·재시도·만료·TTL 값과 단위를 확인했습니다. | **일부 필드 저장·TTL 비교 부분 확인.** Server-PT의 SOA 입력 칸 6개 저장과 다시 열기를 확인했습니다. 같은 조건에서 Minimum TTL을 600·700·600으로 바꾸자 관찰한 A 응답 TTL도 600·700·600으로 달라졌습니다. | 확인한 Server-PT 화면에는 일련번호와 SOA 레코드 자체 TTL 입력 칸이 없었습니다. 사용한 PC-PT nslookup의 -type= 옵션이 지원되지 않아 SOA 유형을 지정한 질의·응답은 확인하지 못했습니다. TTL 감소, 표준 부정 응답 캐시, 보조 서버의 Refresh·Retry·Expire 동작은 미검증이며, 사용한 화면과 도움말에서 보조 서버 설정 방법을 찾지 못했습니다. ICQA에서는 레코드 추가 후 일련번호 자동 증가가 관찰되지 않았습니다. |
| 5 | **라우터 모드·호스트 이름·저장** | **명령·저장 통과.** 모드 전환, hostname LAB-R1, 저장 [OK], running-config·startup-config의 이름 일치를 확인했습니다. | **저장 후 재부팅 복원 통과.** 1841에서 LAB-R1을 저장한 뒤 reload하자 이름·주소·경로가 복원되었고, 저장하지 않은 LAB-TEMP는 reload 후 사라졌습니다. .pkt 저장 후 다시 열기는 저장하지 않은 실행 설정까지 되살리는 파일 보존 동작이었습니다. | ICQA 데모는 프로그램 재실행 후 새 시험으로 초기화됩니다. 실행 중 저장 성공과 재실행 간 보존을 구분해야 하며, Packet Tracer의 .pkt 재열기 보존을 같은 의미로 보지 않습니다. 실제 장비의 NVRAM 동작은 미검증입니다. |
| 6 | **인터페이스 IPv4·마스크·활성화** | **설정·저장 통과.** FastEthernet0/0의 주소·마스크와 관리상 활성화를 확인했습니다. 상태는 up / protocol down입니다. | **원래 조건 통과.** 1841의 FastEthernet0/0에 192.168.10.1 255.255.255.192를 넣어 up/up, PC와의 ping 4/4, 시작 설정 저장, reload 후 복원을 확인했습니다. | ICQA 데모의 링크는 protocol down이어서 통신을 확인할 수 없었습니다. Packet Tracer 결과는 소프트웨어 시뮬레이션이며 실제 장비·실제 IOS 이미지는 미검증입니다. |
| 7 | **정적 경로 설정** | **명령 수락·설정 저장 통과.** ip route 행이 running-config·startup-config에 유지되는 것을 확인했습니다. | **경로 등록·전달 통과.** S 192.168.20.0/24 via 10.0.12.2가 라우팅 표에 등록되고 서로 다른 망의 PC 사이 왕복 통신과 tracert 경로를 확인했습니다. 경로를 지우면 실패하고 복원하면 다시 성공했습니다. | ICQA 데모에서는 연결 구간이 down이라 경로 등록·패킷 전달을 확인할 수 없었습니다. Packet Tracer 실험은 R2 반환 경로를 준비하고 R1 LAN을 router-interface 조건(/26)으로 둔 구성이며, 동일 서브넷 ping은 정적 경로 검증으로 쓰지 않았습니다. |
| 8 | **콘솔·VTY 인증·유휴 시간** | **설정·저장 및 콘솔 인증 통과.** 두 라인의 비밀번호·login, VTY exec-timeout 5 30 저장을 확인했습니다. 콘솔 재접속 시 오답 거부·정답 접속을 확인했습니다. VTY 원격 접속은 도구 미지원입니다. | **VTY 인증·유휴 종료 관찰 통과.** 라인 비밀번호 + login으로 오답 거부·정답 접속 및 vty 0을 확인했습니다. 입력 없는 대기 후 330.4초 초과~344.2초 이하에 종료되고 VTY 목록에서 사라졌습니다. | 소프트웨어 시뮬레이션 1회 결과입니다. 정확히 330초에 종료됐다는 검증은 아닙니다. 실제 장비·다른 IOS 버전은 미검증입니다. |

### 공통 한계

- **Windows 실행 방식:** ICQA 개별 화면 프로그램을 일반 권한으로 실행했습니다. 관리자 권한 런처를 통한 전체 실행 흐름과의 동일성은 확인하지 않았습니다.
- **저장과 재실행:** Windows 에뮬레이터의 실행 중 값 유지와 프로그램 재실행 후 초기화를 구분해야 합니다. 라우터 데모도 재실행하면 새 시험으로 시작하며 startup-config is not present가 확인됐습니다. Packet Tracer의 .pkt 다시 열기는 저장하지 않은 실행 설정까지 되살리는 파일 동작이므로 ICQA 재실행 결과나 장비 재부팅과 따로 봅니다.
- **도구 범위:** 확인한 Packet Tracer 9.0.0.0810의 화면·명령 범위에서 Server-PT SOA의 일련번호·레코드 TTL 입력 칸, PC-PT nslookup의 -type= 옵션, 1841 DHCP 풀의 임대 기간 명령을 사용할 수 없었습니다. 이 항목은 Windows Server나 실제 장비에서 따로 확인해야 합니다.
- **환경 구분:** Packet Tracer 검증은 9.0.0.0810의 1941 모델(VTY)과 1841 모델·PC-PT·Server-PT(후속 실험) 시뮬레이션입니다. 실제 Windows Server 2022, 실제 Cisco 장비 또는 실제 IOS 이미지에서 수행한 검증은 아닙니다.
- **시험 채점:** 자체 학습 과제의 실행 확인이며, 협회 시험의 채점 방식·점수와 일치하는지는 확인하지 못했습니다.

검증 환경:

- **ICQA Windows 실습용 에뮬레이터:** 개별 설정 화면에서 입력·저장·다시 열어 값 확인. 실제 Windows Server 동작과 구분합니다.
- **ICQA 라우터 시험 데모:** router.exe 1.0.0.0에서 명령·설정 저장·콘솔 인증 확인. VTY 원격 접속은 미지원입니다.
- **Cisco Packet Tracer:** 9.0.0.0810 소프트웨어 시뮬레이션입니다. 1941 모델로 VTY 원격 인증·유휴 종료를, 1841 모델과 PC-PT·Server-PT로 인터페이스·정적 경로·저장 복원과 IPv4·DNS·DHCP 후속 실험을 확인했습니다.

[사이트에서 최종 검증표 보기](https://sumilee-phd.github.io/NA2-study/#/practical/lab/verification)

이 요약은 `src/content/lab-verification.mjs`와 동기화한다. 내용을 수정한 뒤 `node scripts/sync-lab-verification.mjs --write`로 갱신하고, `--check` 또는 `npm test`로 일치 여부를 확인한다. 아래의 날짜별 실행·구현 기록은 그대로 보존한다.
<!-- lab-verification-summary:end -->

## 제공 범위

| 과제 ID | 학습 내용 | 입력값 점검 |
|---|---|---:|
| windows-ipv4 | IPv4·마스크·게이트웨이·DNS·네트워크/브로드캐스트 주소 | 6 |
| windows-dhcp | 주소 풀·제외 범위·6시간 임대·배포 후보 수 | 6 |
| windows-dns-records | A·CNAME·FQDN·별칭 대상 | 6 |
| windows-dns-soa | 주 서버·일련번호·갱신/재시도/만료/MINIMUM | 6 |
| router-basics | 명령 모드·hostname·현재/시작 설정 | 4 |
| router-interface | IPv4·/26·인터페이스 모드·no shutdown·저장 | 5 |
| router-route | 목적지 네트워크·마스크·다음 홉·모드·저장 | 5 |
| router-access | console·VTY·라인 수·유휴 시간·저장 | 6 |

8개 과제, 총 44개 입력값 점검이다. 각 과제는 조건, 단계별 절차, 풀이, 확인 명령, 혼동하기 쉬운 부분, 교재의 PDF 쪽수와 공식 문서 링크를 제공한다. 약 12분 표시는 설치를 제외한 학습 계획값이며 실제 학습자 소요시간을 측정한 결과가 아니다.

## 근거와 교정

사용자가 제공한 `2024네트워크관리사12급필기실기_opt.pdf`의 해당 원본 이미지를 확인했다. 교재 스캔이나 전체 본문은 앱·리포에 포함하지 않았으며 조건과 설명은 학습용으로 재구성했다. 파일의 `sourcePages`는 표지를 포함한 PDF 쪽수이다. 개별 기술 근거와 확인 절은 `windows-labs.mjs`, `router-labs.mjs`의 `sources`에 기록한다.

- [ICQA 출제기준 변경](https://www.icqa.or.kr/cn/board/notice/463): 2025-08-01부터 Windows Server 2022 출제, 기존 실기 에뮬레이터 유지. 2016 화면을 현재 OS 버전으로 표시하지 않는다.
- DHCP: PDF 253쪽의 임대 요구는 6시간이나 257쪽 완료 화면은 8시간이다. 요구 조건을 따라 **0일·6시간·0분**으로 교정했다. `.1~.126`에서 `.1~.10`을 제외한 후보 수는 **116개**이다. [Microsoft DHCP](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/quickstart-install-configure-dhcp-server)와 대조했다. 추가 옵션을 구성하지 않는 이 과제는 비활성 범위 확인까지이며 실제 임대를 성공했다고 표시하지 않는다.
- IPv4: 새 `/29` 예제를 비트 연산으로 검증했다. `192.168.50.18/29`의 네트워크는 `.16`, 브로드캐스트는 `.23`, 일반 LAN 호스트는 `.17~.22`이다. 오래된 all-zero/all-ones 서브넷 제외 계산을 적용하지 않는다.
- DNS: A는 IPv4 주소, CNAME은 대상 이름으로 구분했다. [Microsoft DNS 레코드 관리](https://learn.microsoft.com/en-us/windows-server/networking/dns/manage-resource-records)로 확인했다. SOA MINIMUM을 모든 레코드 TTL로 설명하지 않으며, [RFC 2308](https://www.rfc-editor.org/rfc/rfc2308.html#section-3)의 부정 응답 캐시 규칙으로 보완했다.
- 라우터: [Cisco 초기 설정](https://www.cisco.com/c/en/us/td/docs/routers/access/1900/software/configuration/guide/Software_Configuration/appendixAcli.html) 등을 근거로 모드·설정·조회·저장을 구분했다. `show`의 출력 결과와 `copy running-config startup-config`의 설정 복사를 혼동하지 않는다. `no shutdown` 후에도 실제 링크가 반드시 올라오는 것은 아니며, 정적 경로 저장과 패킷 전달 성공도 구분한다.
- VTY: `0 4`는 5개 라인, `exec-timeout 5 30`은 5분 30초이다. Telnet 유형의 시험 연습과 실제 운영에서의 SSH 권고를 구분하고 초기 인증·접속 조건을 명시했다.

이번 범위 밖의 교재 문항과 본문은 가져오지 않았다. 전체 474쪽의 오류를 모두 수정·인증했다는 의미가 아니다.

## 상태와 판정

`na2_study_labs_v1`에 과제별 초안·확인 여부·풀이 참고 여부만 저장한다. 기존 학습센터·필기·케이블링·단답형 저장 키와 점수를 변경하지 않는다. IPv4는 엄격한 4옥텟, 마스크는 연속 비트 또는 `/접두 길이`, DNS 이름은 대소문자·마지막 점 정규화, 정수는 안전한 정수, hostname은 과제에서 요구한 대소문자로 비교한다.

답안 수정 시 이전 판정을 해제한다. 오답 피드백의 기준값이나 풀이를 참고한 경우 해당 표시를 남긴다. 진행률은 실행 성공률이나 시험 점수가 아니라 모든 입력값이 일치한 과제 수이다. 과제 전환·메뉴 이동은 입력을 보존하며 새로고침 시 저장된 상태를 복원한다.

손상·빈 문자열 원문·미래 버전·저장 실패·다른 탭 변경은 기존 원문을 덮어쓰지 않고 저장을 중단한다. 미저장 입력은 메뉴 이동 중 메모리에 유지하며 현재 입력 백업과 새로고침/종료 전 경고를 제공한다. 비교 후 쓰기는 원자적 다중 탭 잠금이 아니다. 백업 가져오기는 제공하지 않는다.

필기·케이블링 평가 중에는 실습 목록·상세·풀이를 DOM에 렌더링하지 않는다. 이 기능은 기존 학습 흐름 차단을 유지하는 것으로 감독 시험의 보안을 뜻하지 않는다.

## 검증 결과

- Windows의 Node 24 환경: 기존 84개와 신규 12개, **총 96개 자동 테스트 통과**. 빈 답·오답·잘못된 주소/마스크·DNS 표기·정수·초안 왕복·손상·용량 실패·탭 충돌·기존 저장 키 보존을 검사했다.
- Vite 프로덕션 빌드 통과. `/NA2-study/` 배포 경로로 별도 빌드해 로컬 브라우저에서 확인했다. 새 실습 번들은 실습 진입 시 지연 로딩한다.
- 원본 검증: NA2-com `7e0c035`, NA2-cabling `8036a54`, 추적 파일 42개 SHA-256 일치. 원본 두 리포는 변경하지 않았다.
- 브라우저: Windows 4과제와 라우터 4과제의 입력 판정 44개, 목록 진행률 8/8 확인. IPv4에서 5/6 오답 → 수정 시 판정 해제 → 6/6 확인 → 새로고침 복원과 풀이 참고 표시를 확인했다. `/29`, `/25`, `/26`, `/24`, 대문자 FQDN과 마지막 점 입력을 확인했다. 최종 로컬 검수 탭의 error·warn 로그는 없었다.
- 기존 필기: 900문항 로딩, 2026년 2회 연습의 1번 답안 선택 후 실습 메뉴 왕복 시 문항과 선택 보존.
- 기존 케이블링: 유형 평가 4문항 제출·다음·결과 4/4 확인. 진행 중 실습/단답형 차단과 새로고침 차단 유지, 종료 후 해제 확인.
- 기존 실기 문제: PRAC-006의 `DHCP` 초안을 실습 메뉴 왕복 후 복원하고 정답·해설 표시 확인.
- 모바일: 브라우저 360×800 viewport에서 목록과 정적 경로 상세/입력 확인. 문서 폭 345px, scrollWidth 345px로 페이지 가로 넘침 없음. 실제 휴대전화 검사는 아님.
- 독립 소스 리뷰: 빈 답 44항목, 8개 상세 경로, 끝 슬래시, 잘못된 ID·상속 속성 이름·추가 하위 경로 거부 및 평가/저장 연결 확인. 해결되지 않은 결함을 발견하지 못했다.

로컬 화면 증거는 Git에서 제외하는 `verification/practical-labs-20261023/`에 보관한다. 위 결과는 웹앱·콘텐츠 검증이다. ICQA 라우터 시험 데모의 직접 검증은 아래 절에 따로 기록하며, 실제 Windows Server와 Cisco 장비는 실행하지 않았다.

## ICQA 에뮬레이터 직접 검증

검증일: 2026-10-23 (한국시간). 라우터 19:24~19:40, Windows 20:22~21:40. Windows 11 PC에서 Claude 데스크톱 앱의 화면 제어 도구로 실제 프로그램 창을 조작하고 출력을 읽었다. 앞 절의 웹앱 입력 판정은 이 검증으로 취급하지 않는다.

### 프로그램과 실행 방식

- 라우터: [ICQA 자료실 21](https://www.icqa.or.kr/cn/board/dataroom/21)의 `router.zip`(22,525,867바이트)에서 푼 `router.exe`. 파일 버전 1.0.0.0, 제품명 표기 없음. 창 제목은 "라우터 시뮬레이터"에서 시작 후 "라우터 실기"로 바뀐다. 시험 데모 1종(20분, 3문항, ROUTER1·ROUTER2 활성, ROUTER3·4 비활성)만 제공한다.
- 1차 실행에서는 앱의 4개 라우터 과제를 ROUTER1·ROUTER2 콘솔에서 시험했다. 앱 설정이 섞이지 않도록 프로그램을 다시 실행한 2차 실행에서 공식 3문항만 전체 명령으로 수행하고 답안을 제출했다.
- 데모 안내문은 "실제 라우터의 화면이나 구성요소가 다르거나 제한적"이라고 밝히고, startup-config 저장에는 `copy running-config startup-config` 또는 `copy r s`만 쓰며 `write`는 동작하지 않는다고 명시한다.
- Windows: 사용자 승인 후 [ICQA 자료실 18](https://www.icqa.or.kr/cn/board/dataroom/18)에서 `icqaControlSetup64.msi`(7,643,648바이트, SHA-256 `ee44e3b3a442cf1abcb65b859bb97c4bc005b9f295831c1a7eb1e24221a33e59`, 디지털 서명 없음, 제품 icqaControl 1.0.0, 제조사 ICQA)를 내려받아 기본 경로 `C:\Program Files\ICQA\icqaControl\`에 설치했다. .NET Framework 3.5 SP1은 이미 설치되어 있었다. 관리자 권한 확인 창은 사용자가 처리했다.
- 런처 `icqaControl.exe`(파일 버전 1.2.0.0)는 매니페스트가 `requireAdministrator`라 관리자 권한(High 무결성)으로 실행되고, 런처에서 연 화면도 관리자 권한을 물려받는다. 일반 권한의 화면 제어 입력은 Windows가 차단하여 런처 경로에서는 조작할 수 없었다. 사용자 선택에 따라 같은 설치 폴더의 개별 화면 프로그램 `pcNetworkC.exe`·`ntDHCPC.exe`·`ntDNSC.exe`·`CMDC.exe`(매니페스트 `asInvoker`)를 일반 권한으로 직접 실행해 검증했다. 런처를 거친 공식 실행 흐름과 동작이 다를 수 있다.
- 런처의 "네트워크관리사" 분류에는 컴퓨터(네트워크 속성·레지스트리 편집기·폴더 권한·프린터 및 팩스), 제어판(시스템 등록정보·인터넷 옵션·프로그램 및 기능), 관리도구(DHCP 등) 항목이 있다. 화면은 DHCP 범위 속성의 네트워크 액세스 보호 탭, 명령 프롬프트의 `Microsoft Windows [Version 6.2.9200]` 표시처럼 Windows Server 2022 이전 세대 구성을 따른다.
- 에뮬레이터 화면은 채점 결과를 표시하지 않는다. 입력값은 실행 중에만 유지되었고, 프로그램을 닫았다 다시 열면 초기값으로 돌아갔다. 설치 폴더의 XML 설정 파일 수정 시각은 바뀌지 않았다.
- [출제기준 변경 공지](https://www.icqa.or.kr/cn/board/notice/463)는 2026-10-23 재확인 결과 2025-01-13 게시 내용 그대로이다: 2025-08-01부터 Windows Server 2022 출제, 실기 에뮬레이터는 기존 방식 유지.

### 과제별 판정

| 과제 | 실제 조건과 앱 예제의 차이 | 관찰 결과 | 판정 |
|---|---|---|---|
| windows-ipv4 | 연습 문제 화면이 없어 앱 예제 값을 네트워크 속성 화면에 직접 입력 | 로컬 영역 연결 속성 → Internet Protocol Version 4 (TCP/IPv4) 속성. 다음 IP 주소 사용 선택 시 DNS도 수동 지정으로 전환. 192.168.50.18 / 255.255.255.248 / 192.168.50.17 / DNS 192.168.50.19 입력 → 확인 → 다시 열어 네 값 유지. 마스크 자동 채움 없음, 빈 보조 DNS는 `0.0.0.0` 표시, 프로그램 재실행 시 자동으로 받기로 초기화. 명령 프롬프트의 `ipconfig /all`은 고정 예시 값(192.168.66.5) 출력 | 통과(입력·저장·재확인). 네트워크·브로드캐스트 계산값은 화면 대상 아님 |
| windows-dhcp | 앱 예제 값 직접 입력 | IPv4 → 동작 → 새 범위 마법사. 이름 AI-LAB, 192.168.100.1~126, 기본 길이 24를 25로 올리자 마스크 255.255.255.128로 변경, 제외 .1~.10 추가, 임대 기본 8일·0시간·0분을 0일·6시간·0분으로 변경, 옵션 기본 선택 "예"를 "아니요, 나중에 구성"으로 변경. 완료 화면 요약 없음. 범위 `[192.168.100.1] AI-LAB` 상태 비활성, 범위 메뉴에 활성화 항목 존재. 범위 속성 0일·6시간·0분, 주소 풀에 배포 범위와 제외 범위 표시 | 통과(비활성 범위까지). 활성화·임대는 미실행 |
| windows-dns-records | 앱은 기존 영역을 가정하지만 에뮬레이터는 빈 정방향 조회 영역으로 시작 | 새 영역 마법사로 주 영역 lab.example(lab.example.dns, 동적 업데이트 허용 안 함) 생성. 영역 오른쪽 클릭 메뉴의 새 호스트에서 web01·192.168.60.20 → FQDN `web01.lab.example`, 생성 알림. 새 별칭에서 www·대상 `web01.lab.example` → FQDN `www.lab.example`. 목록과 www 속성에서 A·CNAME 확인. 명령 프롬프트의 `nslookup web01.lab.example 192.168.60.2`는 dns.icqa.or.kr·www.icqa.or.kr 고정 문구만 출력 | 통과(레코드 생성·보존). 이름 조회는 도구 미지원 |
| windows-dns-soa | 앱 예제 값 직접 입력 | SOA 탭 기본값: 일련번호 0, ICQAServer., hostmaster., 15분, 10분, 1일, 최소(기본값) TTL 1시간, 이 레코드의 TTL 0:1:0:0. 단위 목록 초·분·시간·일. 2026102301, ns1.lab.example, hostmaster.lab.example, 60분, 15분, 1일, 10분(단위를 시간→분으로 변경) 입력 → 확인 → 다시 열어 유지, 목록 SOA 데이터 `[2026102301]`. 이후 호스트 추가 시 일련번호 자동 증가 없음 | 통과 |
| router-basics | 공식 문제 1은 ROUTER2의 `ICQA`. 앱 예제 `LAB-R1`은 ROUTER1에 연습으로 설정 | 7개 명령 모두 수락. `LAB-R1(config)#`·`LAB-R1#` 프롬프트, `Destination filename [startup-config]?` 뒤 Enter로 `Building configuration...[OK]`, running·startup 모두 `hostname LAB-R1` | 통과 |
| router-interface | 공식 문제 3은 FastEthernet 0/0에 192.168.0.100/24. 앱 예제는 192.168.10.1/26 | 기본 설정 인터페이스는 Fa0/0·Fa1/0·S2/0·S3/0. `interface FastEthernet0/0`, `ip address 192.168.10.1 255.255.255.192`, `no shutdown`, 저장 수락, startup에 주소·마스크 유지. `show interfaces`는 `FastEthernet0/0 is up, line protocol is down (disabled)`. 앱 절차의 `show ip interface brief`는 Invalid input | 수정 후 통과(설정·저장). 링크 up/up은 데모에서 미성립 |
| router-route | 앱 전제(연결 구간 up, R2 반환 경로)가 데모에서 성립하지 않음 | 전역 설정에서 `ip route 192.168.20.0 255.255.255.0 10.0.12.2` 수락, running·startup에 같은 행. 두 라우터 Serial2/0에 10.0.12.1/30·10.0.12.2/30과 `no shutdown`을 넣어도 `changed state to down`. `show ip route`는 코드 범례와 `Gateway of last resort is not set`만 표시 | 수정 후 통과(설정·저장). 경로 등록·패킷 전달은 도구 미지원 |
| router-access | 앱은 VTY Telnet 허용과 IP 연결을 전제하지만 데모에서는 성립하지 않음 | 2026-10-23: 기본 설정에 `line con 0`, `line aux 0`, `login`이 있는 `line vty 0 4`. `line console 0`·`line vty 0 4`에서 `(config-line)#`, `password ?`는 `7`과 `LINE` 형식 표시. `exec-timeout 5 30` 수락, running·startup의 vty 아래 유지. 2026-10-24 재검증은 아래 두 절 참조 | 입력·저장 통과, 콘솔 인증 통과. VTY 인증·유휴 종료는 도구 미지원, 재실행 후 보존은 불일치(새 시험으로 초기화) |

공식 데모 3문항(2차 실행): ROUTER2 `enable` → `configure terminal` → `hostname ICQA` → `end` → `copy running-config startup-config`, ROUTER1 `enable` → `configure terminal` → `interface FastEthernet0/0` → `ip address 192.168.0.100 255.255.255.0` → `no shutdown` 1회 → `end` → `copy running-config startup-config`를 모두 `[OK]`까지 확인하고 제출했다. 제출 후 화면은 "수고하셨습니다."와 "처음으로"뿐이며 점수·문항별 정오를 표시하지 않는다. 따라서 **데모 자체 채점 결과는 확인할 수 없다(도구 미지원)**. 1차 실행에서는 ROUTER2의 `en`·`conf t`·`hostname ICQA`·`copy r s`·`sh start`로 시작 설정에 `hostname ICQA`가 저장되는 것을 따로 확인했다.

### router-access 콘솔·VTY 재검증 (2026-10-24)

2026-10-24 09:06~09:08 KST에 같은 `router.exe`(파일 버전 1.0.0.0, 561,152바이트, SHA-256 `08f679fd9b26d6a79bb0ccf2aca379e656196c37047a32a60ae6a65bd22f1d42`)를 새로 실행해 시험 데모의 ROUTER1 콘솔에서 확인했다. 실행 중인 다른 데모나 사용자 작업은 없었고, 답안은 제출하지 않았다. 입력한 비밀번호는 과제에 공개된 연습용 예제 문자열이며 실제 장비·계정 설정이 아니다.

입력 순서: `enable` → `configure terminal` → `line console 0` → `password ConsoleLab26` → `login` → `exit` → `line vty 0 4` → `password VtyLab26` → `login` → `exec-timeout 5 30` → `end` → `show running-config` → `copy running-config startup-config`(질문에 Enter) → `show startup-config`. 변경 전 running-config에는 `line con 0` 아래 설정이 없고 `line vty 0 4` 아래 `login`만 있었다.

| 통과 기준 | 관찰 결과 | 판정 |
|---|---|---|
| ① 콘솔 비밀번호·login 수락 | `Router(config-line)#`에서 `password ConsoleLab26`, `login`, `exit`가 오류 메시지 없이 다음 프롬프트로 진행 | 통과 |
| ② VTY 비밀번호·login 수락 | `line vty 0 4` 후 `password VtyLab26`, `login`, `exec-timeout 5 30`, `end`가 오류 없이 진행, `%SYS-5-CONFIG_I` 표시 | 통과 |
| ③ running-config 반영 | `no service password-encryption` 상태. `line con 0` 아래 `password ConsoleLab26`·`login`, `line vty 0 4` 아래 `exec-timeout 5 30`·`password VtyLab26`·`login`이 평문으로 표시 | 통과 |
| ④ VTY 유휴 시간 유지 | `line vty 0 4` 아래 `exec-timeout 5 30` | 통과 |
| ⑤ 저장 완료 | `Destination filename [startup-config]?` → Enter → `Building configuration...[OK]` | 통과 |
| ⑥ startup-config 반영 | `show startup-config`의 두 라인 설정이 running-config와 같음 | 통과 |

VTY의 `login`은 데모 기본 설정에도 있던 행이므로, 이번 입력이 수락된 사실은 명령 응답으로, 저장 결과는 두 설정 조회로 각각 확인했다. 설정 표시 순서는 `exec-timeout`, `password`, `login`이었다. 앱 내용의 오류는 없었으며, router-access의 확인 노트를 이 결과로 갱신하고 4단계 확인 문구에 데모의 평문 표시를 덧붙였다. 이 실행에서는 콘솔 재접속 시 비밀번호 확인, VTY 원격 접속 인증, 330초 유휴 종료, 프로그램 재실행 후 보존, 협회 채점을 실행하지 않았다. 앞의 네 항목은 같은 날 다음 절에서 따로 확인했다.

증거는 Git 제외 폴더 `verification/emulator-20261024/router-access/`(17장)와 `RUN.txt`, `SHA256SUMS.txt`에 보관한다. 갱신 후 `npm test`는 router-access 노트의 확인 범위와 미검증 범위를 검사하는 테스트 1개를 더해 99개 통과했다.

### router-access 인증·유휴 종료·재실행 검증 (2026-10-24)

2026-10-24 09:30~09:35 KST에 같은 `router.exe`(1.0.0.0, SHA-256 `08f679fd…1d42`)로 수행했다. 실행 전 다른 `router.exe`는 없었고, 답안은 제출하지 않았다. 1차 실행은 09:30:01에 시작했으며(데모 남은 시간 19:56) ROUTER1·ROUTER2 콘솔을 사용했다.

| 항목 | 실제 실행 방법 | 관찰 결과 | 판정 |
|---|---|---|---|
| A. 콘솔 재접속 인증 | ROUTER1에서 `line console 0` → `password ConsoleLab26` → `login` → `end` 후 `Router#`에서 `exit`로 EXEC 세션 종료, Enter로 새 세션 시작, 연습용 오답 1회, 정답 1회 | `Router con0 is now available`, `Press RETURN to get started.` → Enter 후 `User Access Verification`, `Password:` → 오답 입력 후 `Password:` 재요구(입력 문자 미표시) → `ConsoleLab26` 입력 후 `Router>` | 관찰 범위 내 통과 |
| B. VTY 원격 인증 | 대상 ROUTER1: `line vty 0 4`에 `password VtyLab26`·`login`·`exec-timeout 5 30`, `FastEthernet0/0`에 10.0.12.1/30·`no shutdown` 1회. 출발 ROUTER2: `FastEthernet0/0`에 10.0.12.2/30·`no shutdown` 1회 후 `show interfaces`, `ping 10.0.12.1`, `telnet 10.0.12.1`, `connect 10.0.12.1`, `telnet ?` | ROUTER2 `FastEthernet0/0 is up, line protocol is down (disabled)`, ping `.....` 0/5. `telnet`·`connect`는 `?` 도움말 목록에 있으나 실행하면 `% Unrecognized command` | 도구 미지원(원격 접속 명령 미구현, 연결 전제도 미충족). 인증은 미검증 |
| C. VTY 330초 유휴 종료 | B에서 VTY 세션을 열 수 없어 실행하지 않음. 로컬 콘솔 방치로 대신하지 않음 | — | 도구 미지원(전제 세션 없음). 미검증 |
| D. 프로그램 재실행 후 보존 | ROUTER1에서 콘솔·VTY 설정 후 `copy running-config startup-config` `[OK]`(남은 시간 17:18), 종료 직전 running·startup 캡처 → 창 닫기, 09:33:37 프로세스 종료 확인 → 09:33:47 같은 경로로 재실행, 시작 화면·안내 페이지의 정상 절차만 사용(불러오기 기능 없음) → 아무 설정 없이 조회 | 재실행 후 새 시험(남은 시간 19:57). 부팅 배너 뒤 비밀번호 요구 없이 `Router>`. running-config는 기본값(`line con 0` 하위 설정 없음, `line vty 0 4` 아래 `login`만), `show startup-config`는 `startup-config is not present` | 실행했으나 보존되지 않음(프로그램 재실행 시 새 시험으로 초기화) |

D는 데모 프로그램을 다시 실행할 때 새 시험을 시작하는 동작이다. 같은 실행 안에서의 `copy` 저장 성공(2026-10-24 앞 절)이나 실제 장비의 `reload` 후 NVRAM 동작과 같은 의미로 해석하지 않는다. `reload` 명령은 실행하지 않았다.

학습 자료 반영: router-access 2단계 확인 문구에 콘솔 재접속 시 비밀번호 요구를, 5단계와 환경 설명에 데모의 원격 접속 미지원을, 주의점에 "저장과 프로그램 재실행을 구분하세요"를 추가했다. 확인 노트의 미실행 문장은 위 결과로 바꾸었다. 과제 조건·명령·기준값과 점검 항목 ID는 바꾸지 않았다.

증거는 Git 제외 폴더 `verification/emulator-20261024-auth-restart/`(`run1/` 16장, `run2-after-restart/` 6장, `RUN.txt`, `SHA256SUMS.txt`)에 보관한다. `telnet`·`connect`가 도움말 목록에 있다는 근거는 `verification/emulator-20261023/router-run1/10-r1-exec-help-p1.jpg`이다.

### 발견한 데모 동작과 앱 수정

1. `show ip interface brief`와 `show ip interface ?`는 `% Invalid input detected`로 거부되었다. `show ip ?` 도움말에는 `interface`가 표시되지만 실행되지 않는다. → router-interface의 1·4단계와 풀이, router-route의 2단계와 풀이에서 `show running-config`·`show interfaces`로 교체했다. 수정 전 콘텐츠에는 이 명령이 6곳 있었다.
2. 시작 배너는 `CISCO1921/K9`, `2 Gigabit Ethernet interfaces`를 표시하지만 `interface GigabitEthernet0/0`은 거부되고 설정 목록은 FastEthernet·Serial이다. → 앱 예제의 FastEthernet0/0은 데모와 일치하므로 유지하고, 포트 이름은 배너가 아닌 설정 목록으로 확인하도록 환경 설명을 고쳤다.
3. 같은 인터페이스에 `no shutdown`을 반복하면 두 번째 입력이 메시지 없이 `administratively down`으로 되돌리고, 세 번째 입력은 다시 `changed state to up`을 표시했다(두 차례 재현). → 한 번만 입력하고 running-config에 `shutdown` 행이 없는지 확인하도록 절차·풀이·주의점에 추가했다. [참고 검수 문서](PRACTICAL_REFERENCE_REVIEW.md)의 확인 보류 항목도 갱신했다.
4. 연결 구간이 올라오지 않고 `show ip route`에 연결 경로도 나타나지 않는다. → router-route 환경·확인 문구에 데모에서는 설정 행과 저장까지만 확인한다고 명시했다.
5. 데모 안내의 저장 명령 제한(`write` 불가) → router-basics 주의점에 추가했다. `en`, `conf t`, `int fa0/0`, `copy r s`, `sh start` 축약형 수락은 풀이 설명과 출처 노트에 기록했다.
6. 모든 라우터 과제의 출처 노트에서 "ICQA 프로그램을 실행하지 않았다"는 문장을 실제 확인 범위로 바꾸고, 과제별 데모 확인 결과를 추가했다. 과제 상세의 검토 범위 문구는 Windows·라우터 묶음별로 나누었다. 점검 항목 ID와 기준값은 바꾸지 않아 기존 학습 기록과 호환된다.

### 발견한 Windows 에뮬레이터 동작과 앱 수정

Windows 4개 과제의 기준값과 계산값에는 오류가 없었다. 교재 PDF 257쪽 확대 이미지에서도 임대 기간이 0일·8시간·0분으로 보여, 6시간 교정 근거는 유지했다. 에뮬레이터 화면과 맞지 않던 안내를 다음과 같이 고쳤다.

1. IPv4: "자동으로 채워진 마스크를 확인"하라는 안내 → 에뮬레이터는 마스크를 채우지 않으므로 직접 입력하도록 절차와 주의점을 고쳤다. 화면에 없는 "적용" 대신 "확인"으로 저장하도록 바꾸고, 빈 보조 DNS의 `0.0.0.0` 표시와 재실행 시 초기화를 기록했다. 명령 프롬프트 에뮬레이터의 `ipconfig /all`이 고정 예시 값을 출력한다는 점도 명시했다.
2. DHCP: 길이 기본값 24와 길이·마스크 연동, 임대 기본값 8일·0시간·0분, 옵션 화면의 기본 선택이 "지금 구성"이라는 점, 범위가 시작 주소와 이름으로 표시된다는 점을 절차에 추가했다.
3. DNS 레코드: 에뮬레이터가 빈 정방향 조회 영역으로 시작하므로 주 영역 lab.example을 먼저 만들도록 환경 설명에 추가했다. 새 호스트·새 별칭은 동작 메뉴가 아니라 영역의 오른쪽 클릭 메뉴에 있다는 점과, `nslookup`이 고정 문구를 출력해 이름 조회 확인에 쓸 수 없다는 점을 명시했다.
4. SOA: 단위 목록(초·분·시간·일)과 기본값, 최소(기본값) TTL의 단위를 시간에서 분으로 바꿔야 한다는 점, 이 레코드의 TTL 형식(`DDDDD:HH.MM.SS`, 3600초 = `0:1:0:0`), 에뮬레이터는 레코드를 추가해도 일련번호를 자동으로 올리지 않는다는 점을 추가했다.
5. Windows 과제의 "ICQA 프로그램을 설치·실행하여 검증한 결과는 아니다"라는 노트를 실제 확인 범위로 바꾸고 과제별 에뮬레이터 확인 노트를 추가했다. 검토 범위 문구도 같은 내용으로 갱신했다. 점검 항목 ID와 기준값은 바꾸지 않았다.

기타 관찰(앱 수정 없음): `?` 도움말 뒤에도 입력 줄에 `?`가 남아 지우고 입력해야 한다. `-- MORE --`는 Space로 넘기고 `q`로 멈춘다. 설정을 바꿔도 `Current configuration : 547 bytes` 표시는 바뀌지 않았다. 자동 입력 도구가 보낸 붙여넣기 입력은 콘솔에 반영되지 않아 모든 명령을 한 단어씩 직접 입력했다.

### 수정 후 확인

- `npm test`: 기존 96개와 데모 제약 회귀 테스트 1개, **총 97개 통과**. 새 테스트는 라우터 과제 명령에 데모가 거부한 조회 명령·GigabitEthernet·`write`가 없는지, 명령 묶음마다 `no shutdown`이 한 번 이하인지, 저장 명령과 데모 확인 노트가 있는지 검사한다.
- `npm run verify:originals`: NA2-com `7e0c035`, NA2-cabling `8036a54`, 추적 파일 42개 SHA-256 일치.
- `npm run build`: 한글이 포함된 로컬 작업 경로에서는 오류 메시지 없이 `dist/`가 갱신되지 않았다. 추적 파일을 영문 임시 경로로 복사해 같은 명령으로 빌드하여 통과(종료 코드 0)했다. GitHub Actions 빌드는 이 경로 문제와 무관하다.
- 로컬 브라우저(영문 경로 빌드): router-interface 오답 4/5 → 수정 시 판정 해제 → 5/5 → 새로고침 복원, 라우터 과제 4개의 새 명령·데모 노트·검토 범위 표시, 목록 진행률 1/8, 필기 900문항 로딩과 2026년 2회 1번 선택 유지, 케이블링 유형 판별 평가 중 실습 자료 미표시와 4/4 완료 후 해제, 실기 단답형 PRAC-006 초안 복원·정답 확인, 360×800에서 라우터 상세 4개 가로 넘침 없음, 콘솔 로그 없음.

Windows 반영 후 `npm test`는 Windows 에뮬레이터 확인 노트와 주요 화면 기본값 안내를 검사하는 테스트 1개를 더해 **총 98개 통과**했다. 빌드·원본 보존·브라우저 회귀 결과는 [배포 검증](DEPLOYMENT.md)에 기록한다.

화면 증거는 Git에서 제외하는 `verification/emulator-20261023/`에 보관한다: `router-run1/`(48장), `router-run2-official/`(9장), `windows/`(62장), `local-regression/`, `public/`, `SHA256SUMS.txt`.

### 남은 한계

- Windows 에뮬레이터는 관리자 권한 런처를 거치지 않고 개별 화면 프로그램을 일반 권한으로 실행해 확인했다. 런처를 통한 실행과 저장·종료 동작이 같은지는 확인하지 못했다.
- Windows 에뮬레이터는 채점 기능이 없으므로 시험 채점 결과를 확인할 수 없다. DHCP 범위 활성화와 주소 임대, DNS 이름 조회, 실제 통신은 실행하지 않았다.
- 라우터 데모는 공식 데모 3문항만 내장하므로 앱 과제는 같은 콘솔에 연습 설정을 입력해 확인했다. 데모는 채점 결과를 표시하지 않아 협회 채점과의 일치는 확인할 수 없다.
- 라우터 연결 구간·경로 등록·패킷 전달, VTY 원격 접속 인증, `exec-timeout 5 30`에 의한 VTY 유휴 종료는 데모가 `telnet`·`connect`를 지원하지 않고 링크도 올라오지 않아 확인하지 못했다. 콘솔·VTY의 비밀번호와 `login` 입력·저장, 콘솔 재접속 시 비밀번호 인증은 2026-10-24에 확인했다. 데모는 재실행하면 새 시험으로 초기화되어 재실행 간 설정 보존은 제공하지 않는다. VTY 원격 인증과 유휴 종료는 ICQA 데모가 아닌 Cisco Packet Tracer 시뮬레이션에서 따로 확인했다(다음 절). 이 결과로 ICQA 데모의 미지원 판정을 바꾸지 않는다.
- 실제 Cisco 장비와 Windows Server에서의 동작은 이번 검증 범위가 아니다.

## Cisco Packet Tracer 시뮬레이션 검증: router-access VTY (2026-10-24)

ICQA `router.exe` 데모가 `telnet`·`connect`를 지원하지 않아 확인하지 못한 두 항목을, 원격 접속을 지원하는 다른 연습 환경에서 실행했다. ICQA 데모의 결과가 아니며 실제 장비 검증도 아니다.

### 환경

| 항목 | 값 |
|---|---|
| 도구 | Cisco Packet Tracer 9.0.0.0810(이미 설치된 프로그램, 이번 실행에서 내려받지 않음). `PacketTracer.exe` SHA-256 `c8d3ff71…98b5`, Cisco Systems 전자서명 유효. 로그인 요구 없이 실행 |
| 장비 모델 | Packet Tracer 내장 1941 라우터 모델(`CISCO1941/K9` 배너). `show version`은 `C1900 Software (C1900-UNIVERSALK9-M), Version 15.1(4)M4`를 표시한다. 이 값은 시뮬레이터가 보여 주는 모델 정보이며, IOS 이미지 파일을 추가하거나 불러오지 않았다 |
| 접속 출발지 | Packet Tracer PC 1대(`Cisco Packet Tracer PC Command Line 1.0`) |
| 연결 | Copper Cross-Over, 라우터 `GigabitEthernet0/0` ↔ PC `FastEthernet0`. 라우터 192.0.2.1/30, PC 192.0.2.2/30(RFC 5737 문서용 대역). `ping 192.0.2.1` 4/4 |
| 시간 | 실시간(Realtime) 모드만 사용. 시뮬레이션 모드·빨리 감기 사용 안 함 |
| 라우터 설정 | 콘솔에서 `line vty 0 4` → `password VtyLab26` → `login` → `exec-timeout 5 30` → `transport input telnet` → `end` → `copy run start`(`[OK]`). `show run \| begin line`에서 vty 아래 네 행 확인. `transport input telnet`은 앱 환경 설명의 "VTY Telnet 허용" 전제를 준비한 것이다. 콘솔 라인은 설정하지 않았다 |
| 인증 방식 | 라인 비밀번호 + `login`. SSH 사용자 계정 인증은 쓰지 않았다 |

### 판정

| 항목 | 사용 환경 | 실제 관찰 결과 | 판정 | 증거 |
|---|---|---|---|---|
| VTY 원격 인증 | Packet Tracer 9.0.0.0810, 1941 모델, PC → 라우터 Telnet | `telnet 192.0.2.1` → `Trying 192.0.2.1 ...Open` → `User Access Verification`, `Password:`. 오답 `WrongLab00` → `Password:` 재요구. `VtyLab26` → `Router>`. 이 세션의 `show users`에 `*134 vty 0 … 192.0.2.2`와 `0 con 0` 표시 | 관찰 범위 내 통과(시뮬레이션) | `screens/17`~`19` |
| 330초 유휴 종료 | 같은 환경, 위 VTY 세션 | 마지막 입력 후 330.4~332.7초 캡처까지 `Router>` 유지, 341.9~344.2초 캡처에 `[Connection to 192.0.2.1 closed by foreign host]`와 `C:\>`. 이후 라우터 콘솔 `show users`에 `con 0`만 남음. 재접속 시 같은 비밀번호 요구 | 관찰 범위 내 통과(시뮬레이션). 종료 시점은 마지막 입력 후 330.4초 초과 344.2초 이하 | `screens/19`~`32`, `RUN.txt` 시각표 |

### 유휴 종료 시간 측정

- 기준 시각(T0): VTY 세션의 마지막 입력인 `show users` 뒤 Enter. 자동 입력 도구 기록에서 이 묶음은 10:13:46.844에 시작해 마지막 1초 대기 후 10:13:51.580에 끝났으므로 T0는 10:13:48.8~10:13:50.6 KST이다.
- 대기: 25~30초 단위로 기다리며 매번 PC 화면을 캡처했다. 대기 중에는 화면 캡처와 시각 조회만 했고 PC·라우터에 키보드·마우스 입력을 보내지 않았다.
- 관찰: 10:18:49(298.1~300.4초), 10:19:06(315.5~317.8초), 10:19:21(330.4~332.7초)에 연결 유지, 10:19:33(341.9~344.2초)에 종료 표시. 300초 직후에도 연결이 유지되어 초 단위 30이 적용되었고, 기본값 10분보다 훨씬 이르게 종료되었다.
- 교차 확인: Packet Tracer 시계는 00:10:00 → 00:14:53의 293초 동안 캡처 시각이 294.4초 흘러 실시간과 같이 진행했다. 시계 기준으로도 연결 유지 화면(00:14:42)은 약 330~333초, 종료 화면(00:14:53)은 약 341~344초다.
- 오차: 마지막 두 캡처 간격 약 11초가 가장 크다. T0 범위 1.8초, 캡처와 기록 사이 최대 약 0.5초, Packet Tracer 시계 표시 단위 1초가 더해진다. 종료된 정확한 초는 330.4~344.2초 범위보다 좁혀지지 않았다.
- 판단 근거: `closed by foreign host`는 `exit`로 직접 끝낼 때도 같은 문구가 나오므로(재접속 후 `exit`로 확인), 입력이 없었다는 점, 경과 시간, 라우터 `show users`에서 VTY 세션이 사라진 점을 함께 근거로 삼았다.

### ICQA 데모와의 차이

| 구분 | ICQA `router.exe` 1.0.0.0 | Packet Tracer 9.0.0.0810 |
|---|---|---|
| 원격 접속 명령 | `telnet`·`connect`가 도움말에 있으나 `% Unrecognized command` | PC Command Prompt의 `telnet` 동작 |
| 링크 | 라우터 간 FastEthernet·Serial 회선 프로토콜 down, ping 0/5 | Gig0/0 up/up, ping 4/4 |
| VTY 원격 인증 | 도구 미지원 | 관찰 범위 내 통과 |
| 330초 유휴 종료 | 도구 미지원 | 330.4~344.2초 사이 종료 |
| 장비 표시 | `CISCO1921/K9` 배너, 실제 포트는 FastEthernet·Serial | 1941 모델, GigabitEthernet0/0·0/1 |

### 학습 자료 반영

router-access의 환경 설명과 5단계 본문에 Packet Tracer 시뮬레이션 결과를 한 문장씩 덧붙이고, ICQA 데모의 미지원 문장은 그대로 두었다. 출처 노트에는 `ICQA 라우터 시험 데모 확인` 접두어를 쓰지 않은 별도 노트(`Cisco Packet Tracer 9.0.0.0810 시뮬레이션 확인(2026-10-24, …)`)를 추가했다. 주의점에 "유휴 종료는 VTY 세션에서 확인하세요"를 추가했다. 과제 ID·점검 항목 ID·정답·저장 구조와 명령은 바꾸지 않았다. 새 테스트 1개가 이 노트의 접두어·관찰 문구·ICQA 미지원 문장 유지를 검사한다.

증거는 Git 제외 폴더 `verification/vty-lab-20261024-packet-tracer/`에 보관한다: `screens/`(43장), Packet Tracer 실습 파일 `vty-lab-20261024-pt.pkt`, `RUN.txt`, `SHA256SUMS.txt`. 연습용 문자열 외의 자격 증명, 운영망 정보, IOS 이미지 파일은 포함하지 않았다.

### 남은 한계

- 소프트웨어 시뮬레이션 1회 실행이다. 실제 1941 장비나 실제 IOS 이미지에서의 동작, 다른 IOS 버전의 동작은 확인하지 않았다.
- 유휴 종료의 정확한 초는 캡처 간격 때문에 330.4~344.2초 범위로만 확인했다.
- 콘솔 재접속 인증은 ICQA 데모 결과(2026-10-24)를 따른다. 이번 시뮬레이션에서는 VTY 라인만 확인했다.
- 협회 시험의 채점 방식이나 점수와의 관계는 확인할 수 없다.

## 최종 검증표 공개 화면 구현 검수 (2026-10-24)

- `src/content/lab-verification.mjs`의 8개 과제 결과를 문서 상단과 사이트 `#/practical/lab/verification`에서 함께 사용한다. 실습 목록과 각 과제의 출처 아래에 진입 링크를 추가했다. 과제 ID·44개 점검 기준·학습 기록 저장 구조는 변경하지 않았다.
- `npm test`: 109개 통과. 기존 107개 검사에 8개 과제의 누락·중복·경로 검사와 문서/사이트 검증표 동기화 검사를 추가했다. `node scripts/sync-lab-verification.mjs --check` 통과. 원본 보존 검사도 42개 파일 일치를 확인했다.
- 한글 작업 경로의 로컬 빌드는 116개 모듈 변환 뒤 종료되어, 같은 소스와 설치된 의존성을 영문 경로의 검수 사본에 복사했다. 그 사본에서 `BASE_PATH=/NA2-study/` 빌드에 성공했고 새 산출물로 아래 화면 검수를 수행했다.
- 데스크톱 비교표 8행과 과제 연결, 새로고침 후 표시를 확인했다. 360×800 뷰포트에서는 표가 과제별 카드로 표시되고 가로 넘침이 없으며, 과제 링크의 최소 높이는 44px이다. 실제 스마트폰 실기기 검증은 아니다.
- IPv4 과제에서 일부 값을 입력·제출한 뒤 검증표 왕복과 새로고침을 거쳐 입력·판정·해설 참고 상태가 유지됐다. 다른 탭에서 값을 바꾸면 검증표에서도 충돌 경고와 현재 입력 백업 버튼이 표시됐다.
- 케이블링 4문항 평가 중 검증표 직접 진입과 새로고침은 모두 `진행 중 평가` 안내를 표시했고 검증표 DOM은 없었다. 평가 종료 후에는 표가 다시 표시됐다. 필기 평가의 기존 공통 차단 코드는 유지했으며 이번에는 필기 평가를 별도로 실행하지 않았다.
- `#/practical/lab/verification/extra`는 과제를 찾을 수 없다는 화면을 표시했다. 검수 탭의 error·warn 로그는 없었다.
- 화면 증거: Git 제외 폴더 `verification/lab-verification-summary-20261024/`의 `local-desktop.png`, `local-mobile.png`, `local-assessment-gate.png`. 이 작업은 기존 실행 결과의 종합·게시이며 ICQA·Packet Tracer의 새 실행 검증이 아니다.

## Cisco Packet Tracer 후속 검증 (2026-10-24 15:00~16:04)

ICQA 도구로 확인하지 못한 네트워크 동작을 Cisco Packet Tracer 9.0.0.0810의 새 실습망에서 실행했다. 소프트웨어 시뮬레이션이며 실제 Cisco 장비·실제 IOS 이미지·Windows Server 검증이 아니다. 이 결과로 ICQA 관찰을 바꾸지 않는다.

### 환경

- 라우터: Packet Tracer 내장 1841. 부팅 문구는 `C1841-ADVIPSERVICESK9-M`, `Version 12.4(15)T1`, FastEthernet 2개를 표시했다. 원래 과제의 FastEthernet0/0을 그대로 쓰려고 골랐으며 IOS 이미지 파일은 불러오지 않았다.
- 그 밖의 장치: 2960 스위치, PC-PT, Server-PT. 장치 이름은 기본값을 썼다.
- 입력과 기록: 라우터 CLI의 Paste 버튼으로 명령을 넣었고 라우터가 각 행을 입력으로 표시했다. 서버·PC 설정 화면의 레이블이 이 테마에서 보이지 않아 Windows UI Automation으로 레이블·값을 읽어 텍스트로 남겼다.
- 저장소: HEAD `9306534`, 작업 트리 변경 없음. 실험 중에는 앱 코드와 문서를 수정하지 않았다.

### 과제별 판정

| 과제 | 원래 조건과의 관계 | 관찰 | 판정 |
|---|---|---|---|
| router-interface | 일치(FastEthernet0/0, `192.168.10.1 255.255.255.192`) | `show ip interface brief` `192.168.10.1 YES manual up up`, `show interfaces` up/up·`192.168.10.1/26`, PC-A→R1 첫 시도 4/4, startup-config에 주소 포함(shutdown 행 없음), reload 후 `NVRAM up up` | 통과 |
| router-route | `ip route 192.168.20.0 255.255.255.0 10.0.12.2` 일치. 추가 조건: R2 반환 경로, R1 LAN을 router-interface 조건(/26)으로 구성(과제 설명의 /24 가정과 다름) | 추가 전 PC-A→PC-B `Destination host unreachable` 0/4. 추가 후 `S 192.168.20.0/24 [1/0] via 10.0.12.2`, 첫 시도 3/4 → 재시험 4/4(TTL 126), 반대 방향 4/4, tracert `192.168.10.1 → 10.0.12.2 → 192.168.20.10`. 대조 사본에서 경로 제거 0/4 → 복원 4/4 | 통과 |
| router-basics | 일치(hostname LAB-R1) | copy 후 reload → 설정 대화 없이 `LAB-R1`, 인터페이스 `NVRAM`, 경로 유지, 통신 2/4 → 4/4. LAB-TEMP 대조: 저장 질문에 no → 재부팅 후 `LAB-R1`. `.pkt` 저장 → 프로세스 완전 종료 → 재실행 후 같은 파일 열기 → 설정·통신 유지. 추가 대조에서 저장하지 않은 `LAB-PKT`도 재열기 후 남음(startup은 `LAB-R1`) | reload 복원·LAB-TEMP 대조 통과. `.pkt` 재열기는 실행 상태를 되살리는 파일 동작으로 따로 기록 |
| windows-ipv4(보완) | 원래 값 일치. 게이트웨이 라우터·DNS 서버·다른 망 PC·시험 이름 `pc51.lab.test`는 추가 조건 | 같은 /29 서버 4/4, 다른 망 첫 시도 3/4 → 4/4, tracert `192.168.50.17 → 192.168.51.10`, `nslookup pc51.lab.test` → 지정 서버 192.168.50.19가 192.168.51.10 응답, 없는 이름은 `Non-existent domain` | 통과(PC-PT 보완 실험). 파일 재열기 후 PC 값은 조회하지 않음 |
| windows-dns-records(보완) | 레코드 값 일치. 서버 /24·클라이언트 2대는 추가 조건 | `web01.lab.example` → 192.168.60.20. 조회 이력 없는 클라이언트에서 `www.lab.example` → `Name: web01.lab.example`, `Address: 192.168.60.20`, `Aliases: web01.lab.example`. 별칭 응답 PDU는 `ANCOUNT:2`이나 표시된 응답 블록은 TYPE:1 하나였고 TYPE 5 블록은 나타나지 않음 | A 조회·CNAME 생성·별칭 이름 해석 통과. 응답 안의 CNAME 구조는 부분 확인 |
| windows-dhcp(후속 실습) | 범위·마스크·제외 일치. 원래 과제는 비활성 범위 생성까지이며 이 할당 실험은 별도 후속 실습. 라우터 DHCP 사용 | `ip dhcp excluded-address 192.168.100.1 192.168.100.10`, 풀 AI-LAB, 클라이언트 3대가 .11·.12·.13과 /25·게이트웨이·DNS 옵션 수신, binding 3건. `lease 0 6` → `% Invalid input detected`, `lease ?` → `% Unrecognized command`, `option 51 ?` → IP 값만. 해제 없이 `/renew` → .11 유지(패킷 미기록). `/release` 후 binding에서 .11 삭제, 다시 요청 → .11 재할당 | 할당 부분 확인. 임대 기간 지정은 이 모델에서 사용할 수 없음 |
| windows-dns-soa | 영역·주 서버·책임자·Refresh·Retry·Expire·MINIMUM 값 일치. 일련번호·SOA 레코드 TTL은 입력 칸 없음 | 입력 칸 6개(`Primary Server Name`, `Mail Box`, `Minimum TTL`, `Refresh Time`, `Retry Time`, `Expiry Time`) 입력·저장·재열기 유지. 단위 표시 없음 | 부분 확인. TTL 비교는 다음 절 |

관찰 사실로만 기록하는 항목: `show ip dhcp pool`의 `Excluded addresses : 1`(제외 10개를 설정했고 할당은 .11부터 시작했으며, 표시값의 집계 의미는 확인하지 못했다), `dhcp.pkt` 재열기 후 설정은 유지되었으나 `show ip dhcp binding`이 비어 있고 클라이언트는 .11을 보유한 상태. 두 항목의 원인은 확정하지 않는다. 해제 후 재할당은 자동 갱신의 근거로 쓰지 않는다.

증거: `verification/packet-tracer-followup-20261024-1500/` (README.md, RESULTS.md, RUN.txt, `.pkt` 10개, 화면 222장, UI Automation 텍스트 10개, SHA256SUMS 245개).

### 표현 보완

후속 증거 폴더의 RESULTS.md 일부 표현은 이 절과 최종 검증표에서 근거 범위에 맞게 좁혔다. 증거 폴더의 원문은 수정하지 않았다.

- SOA 질의: 사용한 PC-PT nslookup의 `-type=` 옵션이 지원되지 않아 SOA 유형을 지정한 질의·응답은 확인하지 못했다. Packet Tracer 전체의 SOA 질의 지원 여부를 판정한 것은 아니다.
- SOA 일련번호·레코드 TTL: 확인한 Server-PT DNS 화면에 입력 칸이 없었다.
- 보조 서버·영역 전송: 사용한 DNS 화면(레코드 표·On/Off·DNS Cache)과 설치 도움말 `config_servers.htm`에서 설정 방법을 찾지 못했다.
- CNAME: 생성과 별칭 이름 해석은 확인했고, 응답 안의 TYPE 5 레코드 구조는 확인하지 못했다. `ANCOUNT:2`만으로 구조 확인을 대신하지 않는다.
- MINIMUM 비교: 후속 실험의 비교는 질의 이름이 달라 동일 조건 비교가 아니었으므로 다음 절의 재검증 결과로 판단한다.

## SOA Minimum TTL 동일 조건 재검증 (2026-10-24 16:45~17:13)

- 원래 `services.pkt`의 복사본에 조회 이력 없는 검증용 PC(PC4, 192.168.60.12/24, DNS 192.168.60.2)를 추가해 `baseline.pkt`로 저장하고 읽기 전용으로 잠갔다. 세 실행은 각각 baseline 복사본에서 시작했다. 원래 `services.pkt`는 열지 않았다.
- 고정 조건: Packet Tracer 9.0.0.0810 같은 실행, Server-PT 192.168.60.2, A `web01.lab.example` → 192.168.60.20, CNAME과 SOA의 나머지 값(ns1.lab.example·hostmaster.lab.example·Refresh 3600·Retry 900·Expiry 86400), 질의 `nslookup web01.lab.example`(PDU에서 `TYPE:1`·`QDCOUNT:1` 확인), 같은 클라이언트 설정, 실시간 모드에서 링크가 모두 녹색이 된 뒤 Simulation 모드, 같은 이벤트 필터 순서, 매 실행 전 서버 DNS Cache 창 비어 있음.
- 변경 변수: Minimum TTL 600 → 700 → 600.

| 실행 | Minimum TTL | 서버가 보낸 응답 | 클라이언트가 받은 응답 | 응답 개수 | DNS Query 블록 TTL |
|---|---|---|---|---|---|
| 1 | 600 | 192.168.60.2:53 → 192.168.60.12:1025, `web01.lab.example` TYPE:1 CLASS:1 **TTL:600** 192.168.60.20 | 같은 응답, TTL:600 | ANCOUNT:1 | 86400 |
| 2 | 700 | 같은 출발지·이름·유형·주소, **TTL:700** | 같은 응답, TTL:700 | ANCOUNT:1 | 86400 |
| 3 | 600 | 같은 출발지·이름·유형·주소, **TTL:600** | 같은 응답, TTL:600 | ANCOUNT:1 | 86400 |

판정: 이 Packet Tracer 버전·구성에서 SOA Minimum TTL 설정 변화에 따라 관찰한 A 응답 TTL이 600 → 700 → 600으로 달라졌다. `DNS Query` 블록의 TTL 86400은 클라이언트가 보낸 질의 패킷에도 이미 표시되어 응답 TTL과 구분했다.

이 결과를 표준 DNS의 SOA MINIMUM, SOA 레코드 자체 TTL, TTL 감소, 부정 응답 캐시, 보조 서버 동작의 검증으로 확대하지 않는다. RFC 2308 4절은 SOA MINIMUM을 부정 응답 캐시 TTL로 정의하며(https://www.rfc-editor.org/rfc/rfc2308.html#section-4), 이번 관찰은 이 도구가 긍정 A 응답의 TTL에 그 칸의 값을 쓴 사실이다.

한계: Packet Tracer PC에는 DNS 캐시를 보여 주는 화면이 없어 클라이언트 쪽은 baseline 파일에 조회 이력이 없다는 점만 보장했다. 세 실행은 같은 Packet Tracer 실행 안에서 파일을 바꿔 열었다. 실행 1의 첫 시도는 재생 버튼 위치를 잘못 눌러 진행되지 않았고, 저장하지 않은 채 같은 사본으로 다시 수행했다(RUN.txt에 실패와 정정 기록).

증거: `verification/soa-ttl-recheck-20261024-1646/` (README.md, RESULTS.md, RUN.txt, `.pkt` 5개, 화면 90장, UI Automation 텍스트 22개, SHA256SUMS 120개).

### 학습 자료 반영

`src/content/lab-verification.mjs`의 Packet Tracer 환경 설명, 7개 과제의 결과·남은 한계, 공통 한계를 위 결과로 갱신하고 상단 종합표를 동기화했다. 부분 확인 상태(`partial`)의 배지 스타일을 추가했고 배지 문구에도 "부분 확인"을 넣었다. router-access 행과 ICQA 결과는 바꾸지 않았다. 과제 ID·44개 점검 기준·정답·저장 구조는 바꾸지 않았다. 개별 과제의 출처 노트는 모두 ICQA 데모 범위로 한정된 문장이어서 새 결과와 충돌하지 않아 수정하지 않았다.
