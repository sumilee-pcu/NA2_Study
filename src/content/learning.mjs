// Initial, source-reviewed learning units. Self-checks are authored for this app.
// Related bank questions retain their original provisional marking basis.
const checkedAt = '2026-10-22';
const source = (title, url) => ({ title, url });
const S = {
  osi: source('Oracle — OSI Reference Model', 'https://docs.oracle.com/cd/E19504-01/802-5886/intro-45828/index.html'),
  internet: source('IETF RFC 1122 — Internet Protocol Suite, 1.1.3', 'https://www.rfc-editor.org/rfc/rfc1122#section-1.1.3'),
  ethernet: source('Cisco — Troubleshooting Ethernet: 반이중·전이중과 프레임', 'https://www.cisco.com/en/US/docs/internetworking/troubleshooting/guide/tr1904.html'),
  cidr: source('IETF RFC 4632 — CIDR 접두 길이와 주소 블록', 'https://www.rfc-editor.org/rfc/rfc4632#section-3.1'),
  tcp: source('IETF RFC 9293 — TCP 명세', 'https://www.rfc-editor.org/rfc/rfc9293'),
  udp: source('IETF RFC 768 — UDP 명세', 'https://www.rfc-editor.org/rfc/rfc768'),
  linuxPermissions: source('Red Hat — RHEL 9 파일 권한 관리', 'https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-file-system-permissions_configuring-basic-system-settings'),
  linuxCommands: source('Red Hat — 기본 Linux 명령어', 'https://www.redhat.com/en/blog/basic-linux-commands'),
  dhcp: source('Microsoft Learn — Windows Server DHCP', 'https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top'),
  dns: source('Microsoft Learn — Windows Server DNS', 'https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-overview'),
  mac: source('Cisco CBS 350 — MAC Address Tables, 1–2쪽', 'https://www.cisco.com/c/en/us/td/docs/switches/lan/csbms/CBS_250_350/Administration-Guide/cbs-350/mac-address-tables.pdf'),
  flooding: source('Cisco — Unicast Flooding in Switched Campus Networks', 'https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6000-series-switches/23563-143.html'),
  vlan: source('Cisco — VLAN access·trunk 인터페이스', 'https://www.cisco.com/c/en/us/support/docs/smb/switches/cisco-small-business-300-series-managed-switches/smb5653-configure-port-to-vlan-interface-settings-on-a-switch-throug.html'),
  pin: source('ICC — RJ-45 플러그의 1번 핀 위치', 'https://icc.com/help/position-1-located-rj-45-modular-plug-jack/'),
  t568: source('Fluke Networks — T568A와 T568B 비교', 'https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs'),
  wiremap: source('Fluke Networks — 단선·교차·스플릿 페어 점검', 'https://www.flukenetworks.com/knowledge-base/microscanner2/twisted-pair-test-results-microscanner2'),
  crossover: source('Fluke Networks — Crossover Cable Testing', 'https://www.flukenetworks.com/knowledge-base/dsx-cableanalyzer-series/crossover-cable-testing-dsx-cable-analyzer'),
  mdix: source('Cisco — Ethernet 자동 협상과 Auto-MDI-X', 'https://www.cisco.com/c/en/us/support/docs/lan-switching/ethernet/10561-3.html'),
  aruba: source('HPE Aruba — 1000BASE-T의 네 쌍과 Auto-MDI-X', 'https://arubanetworking.hpe.com/techdocs/Switches/Aruba_6200/5200-6885/v34011710.html'),
  h3c: source('H3C — 설치 가이드 Appendix C 케이블 결선', 'https://www.h3c.com/en/Support/Resource_Center/EN/Security/Catalog/F5000/F5000/Technical_Documents/Install___Upgrade/Installation_Guides/H3C_F5000-AI-20%5B40%5D_IG/202211/1715517_294551_0.htm'),
  icqa: source('한국정보통신자격협회 — 네트워크관리사 검정 안내', 'https://www.icqa.or.kr/cn/page/network'),
  icqaFaq: source('한국정보통신자격협회 — 시험 FAQ', 'https://www.icqa.or.kr/cn/faq?fm_id=2'),
};

export const TOPICS = [
  {
    id: 'network-osi', subject: '네트워크일반', title: 'OSI 계층과 캡슐화',
    summary: '통신 기능을 계층별로 구분하고, TCP/IP의 데이터 전달 과정을 설명합니다.',
    objectives: ['OSI 7계층의 대표 기능을 구분합니다.', 'TCP/IP의 계층과 캡슐화 순서를 설명합니다.'],
    prerequisites: ['호스트와 네트워크의 의미', '비트와 바이트의 구분'],
    sections: [
      { title: '계층별 역할', paragraphs: ['OSI는 통신 기능을 7개 계층으로 설명하는 참조 모델입니다. 각 계층은 아래 계층의 서비스를 사용하고 위 계층에 서비스를 제공합니다. 실제 구현에서 기능의 경계는 모델과 정확히 일치하지 않을 수 있습니다.'], table: { headers: ['계층', '대표 기능'], rows: [['7 응용', '응용 프로그램에 필요한 통신 서비스'], ['6 표현', '데이터 표현 형식 변환·압축·암호화의 개념적 분류'], ['5 세션', '응용 간 세션 관리'], ['4 전송', '종단 간 전송 서비스'], ['3 네트워크', '논리 주소와 경로에 따른 패킷 전달'], ['2 데이터링크', '인접한 통신 구간의 프레임 전달'], ['1 물리', '매체를 통한 비트 전송']] } },
      { title: 'TCP/IP와 캡슐화', paragraphs: ['TCP/IP는 응용·전송·인터넷·링크 계층으로 설명할 수 있습니다. TCP와 UDP는 전송 계층, IP는 인터넷 계층의 프로토콜입니다. OSI와 비교할 때는 번호보다 기능을 기준으로 대응합니다.', 'Ethernet에서 TCP로 전송하는 예에서는 응용 데이터에 TCP 헤더, IP 헤더, Ethernet 헤더와 검사 정보를 차례로 추가합니다. 수신 측에서는 각 계층의 정보를 해석하여 상위 계층에 데이터를 전달합니다. 이것을 각각 캡슐화와 역캡슐화라고 합니다.'] },
    ],
    example: { title: 'TCP를 사용하는 데이터 전송', steps: ['응용 프로그램이 전송할 데이터를 준비합니다.', 'TCP는 포트 번호와 순서 제어 정보를 포함하여 전송 단위를 구성합니다.', 'IP는 목적지 IP 주소를 포함하여 패킷을 구성합니다.', 'Ethernet 링크에서는 해당 구간의 MAC 주소를 포함한 프레임을 전송합니다.'] },
    pitfalls: ['전송 계층 전체가 항상 신뢰성을 보장하는 것은 아닙니다. TCP와 UDP의 제공 기능을 구분합니다.', '암호화가 실제 구현에서 반드시 OSI 표현 계층에만 존재한다고 단정하지 않도록 합니다.'],
    checks: [
      { id: 'osi-1', prompt: '목적지 논리 주소와 경로를 기준으로 패킷을 전달하는 OSI 계층은?', choices: ['물리 계층', '네트워크 계층', '세션 계층', '표현 계층'], answer: 1, explanation: '네트워크 계층은 논리 주소와 경로 선택을 통한 패킷 전달을 담당합니다.' },
      { id: 'osi-2', prompt: 'TCP/IP의 전송 계층에 해당하는 프로토콜 조합은?', choices: ['IP와 Ethernet', 'DNS와 HTTP', 'TCP와 UDP', 'ARP와 ICMP'], answer: 2, explanation: 'TCP와 UDP는 응용 간 통신을 위한 전송 계층 프로토콜입니다.' },
    ], sources: [S.osi, S.internet, S.tcp, S.udp], checkedAt, relatedQuestions: ['2022-01-Q18'],
  },
  {
    id: 'network-ethernet', subject: '네트워크일반', title: 'Ethernet 프레임과 전이중 통신',
    summary: '프레임의 역할과 CSMA/CD의 적용 조건을 구분합니다.',
    objectives: ['MAC 주소와 프레임 검사 정보의 역할을 설명합니다.', '반이중과 전이중에서 충돌 처리의 차이를 구분합니다.'],
    prerequisites: ['OSI 물리·데이터링크 계층', '송신과 수신의 의미'],
    sections: [
      { title: '프레임의 구성', paragraphs: ['Ethernet은 링크에서 프레임을 사용하여 데이터를 전달합니다. 프레임에는 목적지·출발지 MAC 주소, 상위 프로토콜 등을 나타내는 정보, 데이터, 오류 검출을 위한 FCS가 포함됩니다.', 'FCS 검사는 전송 중 발생한 비트 오류를 검출하는 데 사용됩니다. 오류 검출만으로 데이터의 자동 복구나 응용 데이터의 완전성이 보장되지는 않습니다.'] },
      { title: '통신 방식의 비교', paragraphs: ['공유 매체를 사용하는 전통적인 반이중 Ethernet에서는 CSMA/CD로 매체 사용 여부를 확인하고 충돌을 처리합니다. 동시에 전송하여 충돌하면 전송을 중단하고 대기 후 재시도합니다.', '정상적인 지점 간 전이중 Ethernet 링크에서는 양쪽이 동시에 송수신하며 CSMA/CD를 사용하지 않습니다. 따라서 모든 Ethernet 연결에서 충돌이 발생한다고 해석하지 않도록 합니다.'], table: { headers: ['구분', '반이중', '전이중'], rows: [['동시 송수신', '불가', '가능'], ['공유 매체의 충돌', '발생 가능', '정상적인 링크에서 없음'], ['CSMA/CD', '전통적 공유 Ethernet에서 사용', '사용하지 않음']] } },
    ],
    example: { title: '설명문에서 조건 판별', steps: ['여러 노드가 하나의 매체를 공유하는지 확인합니다.', '매체 사용 여부 검사·충돌 검출·대기 후 재전송이 제시되면 CSMA/CD 동작과 비교합니다.', '전이중 링크가 명시되면 충돌 검출 방식의 적용 설명과 구분합니다.'] },
    pitfalls: ['CSMA/CD의 CD는 충돌 검출입니다. 무선 LAN의 충돌 회피 방식과 구분합니다.', '전이중 연결에서도 케이블 손상이나 설정 문제로 프레임 오류가 발생할 수 있습니다.'],
    checks: [
      { id: 'ethernet-1', prompt: '정상적인 전이중 Ethernet 링크의 설명으로 적절한 것은?', choices: ['충돌 후에만 송신 가능', '송신 또는 수신 중 하나만 가능', '모든 프레임을 반드시 재전송', '동시 송수신이 가능하고 CSMA/CD를 사용하지 않음'], answer: 3, explanation: '전이중 지점 간 링크는 동시 송수신을 지원하며 공유 매체의 충돌 제어가 필요하지 않습니다.' },
      { id: 'ethernet-2', prompt: '프레임의 FCS가 주로 지원하는 기능은?', choices: ['오류 검출', 'IP 주소 자동 할당', '사용자 인증', '경로 선택'], answer: 0, explanation: 'FCS는 프레임 비트 오류의 검출에 사용되는 검사 정보입니다.' },
    ], sources: [S.ethernet], checkedAt, relatedQuestions: ['2022-01-Q22'],
  },
  {
    id: 'tcpip-subnetting', subject: 'TCP/IP', title: 'IPv4 서브넷과 주소 범위',
    summary: '접두 길이로 마스크·네트워크 주소·호스트 범위를 계산합니다.',
    objectives: ['/24·/26·/27의 마스크와 주소 수를 계산합니다.', '주어진 IPv4 주소가 포함된 서브넷을 판별합니다.'],
    prerequisites: ['8비트 이진수와 십진수 변환', 'IPv4의 32비트 구조'],
    sections: [
      { title: '접두 길이와 마스크', paragraphs: ['IPv4의 /n은 왼쪽 n비트가 네트워크 접두부임을 나타냅니다. 마스크는 이 구간을 1, 나머지를 0으로 표시합니다. /26이면 호스트 부분은 6비트이므로 전체 주소 수는 2의 6제곱인 64개입니다.', '기존 /24 블록을 /27로 분할하면 접두 길이가 3비트 증가하므로 동일 크기의 서브넷은 8개입니다. 필요한 서브넷 수를 만족하는 가장 작은 추가 비트 수를 먼저 결정합니다.'], table: { headers: ['접두 길이', '마스크', '전체 주소 수', '일반 LAN의 호스트 주소 수'], rows: [['/24', '255.255.255.0', '256', '254'], ['/26', '255.255.255.192', '64', '62'], ['/27', '255.255.255.224', '32', '30']] } },
      { title: '주소 범위 산출', paragraphs: ['일반적인 IPv4 LAN 서브넷에서는 호스트 비트가 모두 0인 주소를 네트워크 주소, 모두 1인 주소를 브로드캐스트 주소로 사용합니다. 이 두 주소를 제외한 범위를 호스트에 할당합니다.', '주소만으로 마스크를 추정하지 않도록 합니다. CIDR에서는 접두 길이를 함께 확인해야 합니다. /31 지점 간 링크와 /32 호스트 경로에는 위의 호스트 수 계산을 그대로 적용하지 않습니다.'] },
    ],
    example: { title: '192.168.10.77/26의 주소 범위', steps: ['마스크는 255.255.255.192이며 마지막 옥텟의 블록 크기는 64입니다.', '블록 시작값은 0·64·128·192입니다. 77은 64 이상 128 미만입니다.', '네트워크 주소는 192.168.10.64, 브로드캐스트 주소는 192.168.10.127입니다.', '일반 LAN에서 할당 가능한 범위는 192.168.10.65~192.168.10.126이며 62개입니다.'] },
    pitfalls: ['전체 주소 수와 할당 가능한 호스트 수를 구분합니다.', '서브넷 수를 셀 때와 호스트 수를 계산할 때 무조건 2를 빼는 규칙을 혼용하지 않도록 합니다.'],
    checks: [
      { id: 'subnet-1', prompt: '192.168.10.77/26이 포함된 네트워크 주소는?', choices: ['192.168.10.0', '192.168.10.64', '192.168.10.77', '192.168.10.128'], answer: 1, explanation: '/26의 블록 크기는 64입니다. 77은 64~127 구간에 포함됩니다.' },
      { id: 'subnet-2', prompt: '하나의 /24 블록을 동일 크기의 /27 서브넷으로 분할하면 몇 개인가요?', choices: ['2개', '4개', '8개', '30개'], answer: 2, explanation: '접두부에 3비트를 추가하므로 2의 3제곱인 8개로 분할됩니다.' },
    ], sources: [S.cidr, S.internet], checkedAt, relatedQuestions: ['2022-03-Q03'],
  },
  {
    id: 'tcpip-transport', subject: 'TCP/IP', title: 'TCP와 UDP의 전달 특성',
    summary: '신뢰성·순서·메시지 경계·흐름 제어를 기준으로 두 프로토콜을 비교합니다.',
    objectives: ['TCP와 UDP의 제공 기능을 구분합니다.', '응용의 요구에 따라 필요한 전송 특성을 설명합니다.'],
    prerequisites: ['IP 패킷과 전송 계층', '포트 번호의 의미'],
    sections: [
      { title: '전송 서비스의 비교', paragraphs: ['TCP는 연결을 설정하고 순서가 있는 바이트 스트림을 제공합니다. 순서 번호와 확인 응답, 재전송 등의 절차로 손실을 처리하며 수신 측의 처리 여유를 반영하는 흐름 제어를 수행합니다.', 'UDP는 데이터그램 단위로 전송합니다. UDP 자체는 도착·중복 제거·순서를 보장하지 않으며 TCP와 같은 연결 설정과 재전송 절차를 제공하지 않습니다. 필요한 추가 기능은 응용이나 상위 프로토콜에서 구현할 수 있습니다.'], table: { headers: ['항목', 'TCP', 'UDP'], rows: [['전달 단위', '바이트 스트림', '데이터그램'], ['연결 설정', '필요', 'UDP 자체의 설정 절차 없음'], ['순서·재전송', '제공', 'UDP 자체는 제공하지 않음'], ['수신 흐름 제어', '제공', 'UDP 자체는 제공하지 않음'], ['기본 헤더', '최소 20바이트', '8바이트']] } },
      { title: '요구사항과 선택', paragraphs: ['파일 전송처럼 순서와 완전성이 필요한 경우 신뢰성 있는 전달이 중요합니다. 실시간 응용에서는 지연·손실 허용 범위도 함께 검토합니다. UDP라는 이유만으로 항상 빠르거나, TCP라는 이유만으로 응용 처리가 반드시 성공한다고 단정하지 않도록 합니다.', 'TCP는 응용에서 전송한 메시지의 경계를 보존하지 않습니다. 수신 데이터의 구분 방식은 응용 프로토콜에서 정해야 합니다.'] },
    ],
    example: { title: '연속된 데이터 일부의 손실', steps: ['전송 중 데이터 일부가 손실되었다고 가정합니다.', 'TCP는 확인 응답과 순서 정보를 이용하여 필요한 데이터를 재전송하고 순서대로 전달합니다.', 'UDP 자체에는 재전송 절차가 없으므로 응용의 손실 처리 방식을 확인합니다.', '신뢰성·지연·메시지 경계를 나누어 요구사항과 비교합니다.'] },
    pitfalls: ['UDP의 체크섬과 재전송 보장을 같은 기능으로 해석하지 않도록 합니다.', '프로토콜 이름만으로 모든 서비스의 구현을 단정하지 않도록 합니다.'],
    checks: [
      { id: 'transport-1', prompt: 'TCP가 응용에 제공하는 데이터 형태는?', choices: ['항상 1개의 Ethernet 프레임', '경계가 보존되는 독립 메시지만', '암호화된 파일만', '순서가 있는 바이트 스트림'], answer: 3, explanation: 'TCP는 바이트 스트림을 제공합니다. 응용 메시지의 경계는 별도로 정의해야 합니다.' },
      { id: 'transport-2', prompt: 'UDP 자체의 기능에 포함되지 않는 것은?', choices: ['포트 번호 사용', '데이터그램 전송', '손실 데이터의 재전송 보장', '길이 정보 포함'], answer: 2, explanation: 'UDP 자체는 손실 데이터의 재전송을 보장하지 않습니다.' },
    ], sources: [S.tcp, S.udp], checkedAt, relatedQuestions: ['2022-03-Q07'],
  },
  {
    id: 'nos-linux', subject: 'NOS', title: 'Linux 기본 명령과 파일 권한',
    summary: '조회 명령을 구분하고 rwx·8진수·기호식 권한을 해석합니다.',
    objectives: ['pwd·ls·cat의 조회 대상을 구분합니다.', '일반 파일의 640 권한과 chmod 기호식을 해석합니다.'],
    prerequisites: ['파일과 디렉터리', '사용자와 그룹'],
    sections: [
      { title: '상태 조회 명령', paragraphs: ['명령을 실행하기 전에는 현재 위치와 대상을 확인합니다. pwd는 현재 작업 디렉터리 경로를 출력하며, ls는 디렉터리 항목을 조회합니다. ls -l은 권한·소유자 등 상세 정보를, ls -a는 점으로 시작하는 숨김 항목까지 표시합니다. cat은 파일 내용을 표준 출력으로 확인할 때 사용할 수 있습니다.'] },
      { title: '기본 권한의 해석', paragraphs: ['일반 파일의 기본 권한은 소유자(u)·그룹(g)·그 밖의 사용자(o)별로 읽기(r)·쓰기(w)·실행(x)을 구분합니다. 8진수 표기에서는 r=4, w=2, x=1을 합산합니다. 640은 소유자 읽기·쓰기, 그룹 읽기, 그 밖의 사용자 권한 없음입니다.', '기호식에서 a는 ugo 전체, +는 권한 추가, -는 제거, =는 지정한 권한으로 설정을 의미합니다. 디렉터리의 x는 경로 탐색 권한이므로 일반 파일의 실행과 구분합니다. ACL·SELinux 등 추가 접근 제어는 이 주제의 범위 밖입니다.'], table: { headers: ['표현', '일반 파일의 의미'], rows: [['r / 4', '내용 읽기'], ['w / 2', '내용 수정'], ['x / 1', '실행'], ['chmod a-w sample', '모든 사용자 범주의 쓰기 비트 제거'], ['chmod u+x sample', '소유자의 실행 비트 추가']] } },
    ],
    example: { title: '가상 파일 sample의 권한 해석', steps: ['초기 권한을 -rw-r--r--로 가정합니다. 숫자 표기는 644입니다.', 'chmod a-w sample을 적용하면 u·g·o에서 쓰기 비트를 제거합니다.', '나머지 읽기 권한은 유지되어 -r--r--r--, 즉 444가 됩니다.', '이 예제는 명령의 결과를 해석하는 활동입니다. 실제 실습 시에는 본인이 소유한 연습 파일만 대상으로 확인합니다.'] },
    pitfalls: ['a-w는 모든 권한 삭제가 아니라 쓰기 비트 제거입니다.', 'chmod로 파일 소유자를 변경하지 않습니다. 파일의 쓰기 권한과 부모 디렉터리에서 파일명을 삭제할 권한도 구분합니다.'],
    checks: [
      { id: 'linux-1', prompt: '일반 파일의 권한 640에서 그룹에 부여된 기본 권한은?', choices: ['읽기', '읽기와 쓰기', '실행만', '모든 권한'], answer: 0, explanation: '가운데 숫자 4는 그룹의 읽기 권한을 의미합니다.' },
      { id: 'linux-2', prompt: '다른 권한을 유지하면서 모든 사용자 범주의 쓰기 비트만 제거하는 명령은?', choices: ['chmod u-w sample', 'chmod a-w sample', 'chmod a-r sample', 'chmod a=w sample'], answer: 1, explanation: 'a는 ugo 전체, -w는 쓰기 비트 제거입니다. =w는 쓰기 권한으로 설정하므로 의미가 다릅니다.' },
    ], sources: [S.linuxPermissions, S.linuxCommands], checkedAt, relatedQuestions: ['2023-01-Q34'],
  },
  {
    id: 'nos-windows-services', subject: 'NOS', title: 'Windows Server의 DHCP와 DNS',
    summary: '주소 설정과 이름 해석의 역할을 구분하고 장애 확인 순서를 구성합니다.',
    objectives: ['DHCP와 DNS의 역할을 구분합니다.', '서버 역할과 클라이언트 기능의 차이를 설명합니다.'],
    prerequisites: ['IP 주소·서브넷 마스크·기본 게이트웨이', '클라이언트와 서버'],
    sections: [
      { title: '주소 구성과 이름 해석', paragraphs: ['DHCP 서버는 클라이언트에 IP 주소를 임대하고 서브넷 마스크·기본 게이트웨이·DNS 서버 등의 구성 정보를 제공할 수 있습니다. 범위와 제외 주소, 예약, 임대 기간을 관리합니다.', 'DNS는 이름과 IP 주소 등의 자원 레코드를 조회하는 서비스입니다. Windows Server에서는 DNS 서버 역할을 설치하여 운영할 수 있으며, 클라이언트의 DNS 질의 기능과 서버 역할은 구분됩니다.'], table: { headers: ['항목', 'DHCP', 'DNS'], rows: [['주요 목적', 'IP 구성 자동 제공', '이름 해석과 자원 레코드 조회'], ['확인 대상', '임대·주소 범위·옵션', '질의·레코드·영역·캐시'], ['예시', '클라이언트에 192.168.10.20 임대', 'server.example 이름에 대한 주소 조회']] } },
      { title: '문제 진단의 구분', paragraphs: ['주소가 정상 할당되어도 DNS 설정 오류 때문에 이름으로 접속하지 못할 수 있습니다. 반대로 DNS 서버 정보가 올바르더라도 주소·마스크·경로·방화벽 문제로 통신이 실패할 수 있습니다. 한 증상만으로 원인을 확정하지 않도록 합니다.', 'Windows Server의 실제 관리 화면과 자격시험 에뮬레이터는 동일하지 않을 수 있습니다. 여기서는 역할과 구성 항목을 학습하며, 특정 시험 화면의 조작을 재현했다고 보장하지 않습니다.'] },
    ],
    example: { title: '이름으로 서버에 접속하지 못한 상황', steps: ['현재 IP 주소·마스크·게이트웨이·DNS 서버 구성을 확인합니다.', '주소 할당 문제라면 DHCP 임대와 범위·옵션을 점검합니다.', '이름 조회 결과를 확인하여 DNS 레코드와 질의 경로를 점검합니다.', '이름 조회가 성공하면 해당 서비스의 포트·방화벽·서버 동작 상태를 추가로 확인합니다.'] },
    pitfalls: ['DHCP 서버 주소와 DNS 서버 주소가 반드시 같아야 하는 것은 아닙니다.', 'DNS의 이름 해석 성공을 해당 서비스 접속 성공과 동일하게 판단하지 않도록 합니다.'],
    checks: [
      { id: 'windows-1', prompt: '클라이언트에 IP 주소를 자동으로 임대하는 서버 역할은?', choices: ['DNS', '파일 공유', 'DHCP', '인쇄 서버'], answer: 2, explanation: 'DHCP는 클라이언트의 IP 주소와 관련 네트워크 구성 정보를 임대 형태로 제공합니다.' },
      { id: 'windows-2', prompt: 'IP 주소가 할당된 상태에서 이름 조회가 실패할 때 우선 구분해서 확인할 항목은?', choices: ['케이블 색상만', 'DNS 서버 설정과 질의 결과', '모니터 해상도', '모든 파일의 실행 권한'], answer: 1, explanation: '주소 할당과 이름 해석은 서로 다른 기능입니다. DNS 설정·질의 결과를 확인하되 연결 경로 문제도 배제하지 않습니다.' },
    ], sources: [S.dhcp, S.dns, S.icqaFaq], checkedAt, relatedQuestions: ['2022-02-Q28'],
  },
  {
    id: 'devices-switch-router', subject: '네트워크운용기기', title: '스위치와 라우터의 전달 기준',
    summary: 'MAC 주소 학습과 IP 경로 선택을 구분합니다.',
    objectives: ['스위치의 학습 주소와 전달 기준 주소를 구분합니다.', 'L2 스위칭과 IP 라우팅의 역할을 설명합니다.'],
    prerequisites: ['OSI 2·3계층', 'MAC 주소와 IP 주소'],
    sections: [
      { title: 'L2 스위치의 주소 학습', paragraphs: ['일반적인 Ethernet MAC 주소는 48비트이며 6바이트입니다. L2 스위치는 수신 프레임의 출발지 MAC 주소와 수신 포트·VLAN을 이용하여 동적 MAC 주소 테이블을 학습합니다.', '프레임을 전달할 때는 목적지 MAC 주소를 조회합니다. 목적지를 학습한 포트로 전달하고, 목적지가 알려지지 않은 유니캐스트는 일반적인 L2 스위칭에서 수신 포트를 제외한 같은 VLAN의 전달 가능한 포트로 플러딩합니다. 보안 정책에 따라 이 동작이 제한될 수 있습니다.'] },
      { title: '라우터의 경로 선택', paragraphs: ['IP 라우팅은 목적지 IP 주소와 라우팅 정보를 기준으로 다음 홉과 출력 인터페이스를 선택합니다. 여러 접두부가 목적지와 일치하면 가장 긴 접두부가 일치하는 경로를 우선합니다.', '하나의 장비가 여러 계층의 기능을 수행할 수 있습니다. L3 스위치는 라우팅 기능도 지원하므로 장비 이름만으로 모든 처리 계층을 제한하지 않도록 합니다.'], table: { headers: ['비교 항목', 'L2 스위칭', 'IP 라우팅'], rows: [['기본 전달 기준', 'VLAN과 목적지 MAC 주소', '목적지 IP 주소와 경로'], ['대표 정보', 'MAC 주소 테이블', '라우팅 테이블'], ['학습·설정 예', '출발지 MAC 주소의 동적 학습', '직접 연결·정적·동적 경로']] } },
    ],
    example: { title: '출발지 학습과 목적지 조회', steps: ['포트 1에서 출발지 MAC A, 목적지 MAC B인 프레임을 수신했다고 가정합니다.', '스위치는 MAC A가 포트 1 쪽에 있음을 학습합니다.', '같은 VLAN의 MAC B가 포트 3에 등록되어 있으면 포트 3으로 전달합니다.', '다른 IP 네트워크의 목적지로 전달할 때는 라우팅 기능과 경로가 필요합니다.'] },
    pitfalls: ['스위치가 학습하는 출발지 MAC 주소와 전달 시 조회하는 목적지 MAC 주소를 뒤바꾸지 않도록 합니다.', '스위치의 포트 수만으로 브로드캐스트 도메인 수를 결정하지 않습니다. VLAN 구성을 확인합니다.'],
    checks: [
      { id: 'devices-1', prompt: '스위치의 동적 MAC 주소 학습에 직접 사용하는 정보는?', choices: ['목적지 TCP 포트만', '출발지 MAC 주소와 수신 포트', '파일 이름', '목적지 응용의 암호'], answer: 1, explanation: '동적 학습은 수신 프레임의 출발지 MAC 주소와 수신 포트·VLAN을 연결합니다.' },
      { id: 'devices-2', prompt: '일반적인 Ethernet MAC 주소의 길이는?', choices: ['16비트', '32비트', '48비트', '128비트'], answer: 2, explanation: '일반적인 Ethernet MAC 주소는 6바이트, 즉 48비트입니다.' },
    ], sources: [S.mac, S.flooding, S.ethernet, S.cidr], checkedAt, relatedQuestions: ['2022-01-Q46'],
  },
  {
    id: 'devices-vlan', subject: '네트워크운용기기', title: 'VLAN과 access·trunk 포트',
    summary: '브로드캐스트 도메인 분리와 여러 VLAN의 링크 전달을 구분합니다.',
    objectives: ['VLAN의 논리적 분리 기능을 설명합니다.', '일반적인 access와 trunk 포트의 용도를 구분합니다.'],
    prerequisites: ['L2 스위칭', '브로드캐스트와 IP 서브넷'],
    sections: [
      { title: '논리적 네트워크 분리', paragraphs: ['VLAN은 스위치 기반 LAN을 논리적으로 나누어 별도의 브로드캐스트 도메인을 구성하는 기능입니다. 동일한 물리 스위치에 연결되어 있어도 서로 다른 VLAN의 단말은 기본 L2 스위칭만으로 통신하지 않습니다.', 'VLAN 사이의 IP 통신에는 라우터나 L3 스위치 등의 라우팅 기능이 필요합니다. 접근 통제는 ACL·방화벽 정책 등과 함께 설계합니다. VLAN을 생성한 것만으로 모든 보안 요구가 충족되지는 않습니다.'] },
      { title: '포트 역할의 비교', paragraphs: ['일반적인 데이터 단말용 access 포트는 하나의 데이터 VLAN에 연결합니다. trunk는 여러 VLAN의 트래픽을 한 링크로 전달하며 802.1Q 태그로 VLAN을 식별할 수 있습니다.', '네이티브 VLAN의 비태그 처리, 음성 VLAN, 허용 VLAN 목록은 장비와 설정에 따라 확인해야 합니다. trunk 설정만으로 서로 다른 VLAN의 통신이 허용되는 것은 아닙니다.'], table: { headers: ['항목', 'access', 'trunk'], rows: [['대표 연결 대상', '일반 데이터 단말', '스위치·라우터 등 네트워크 장비'], ['VLAN 전달', '일반적으로 하나의 데이터 VLAN', '허용한 여러 VLAN'], ['태그 처리', '일반 단말의 비태그 프레임 수용', '802.1Q 태그 등으로 VLAN 식별']] } },
    ],
    example: { title: '교실 VLAN 10과 관리 VLAN 20', steps: ['교실 단말의 포트를 VLAN 10, 관리 단말의 포트를 VLAN 20에 배정합니다.', '두 스위치 사이에서 두 VLAN을 전달하려면 해당 VLAN을 허용한 trunk를 구성합니다.', 'VLAN 10의 브로드캐스트를 VLAN 20으로 단순 전달하지 않습니다.', '두 VLAN 간 필요한 서비스만 통신하도록 라우팅과 접근 정책을 별도로 구성합니다.'] },
    pitfalls: ['VLAN 번호와 IP 서브넷 주소는 서로 다른 정보입니다.', 'trunk는 VLAN 사이의 라우팅 기능을 의미하지 않습니다.'],
    checks: [
      { id: 'vlan-1', prompt: 'VLAN으로 직접 구분하는 논리적 영역은?', choices: ['파일 확장자', 'CPU 코어', '브로드캐스트 도메인', '모니터 출력'], answer: 2, explanation: 'VLAN은 LAN을 논리적인 브로드캐스트 도메인으로 분리합니다.' },
      { id: 'vlan-2', prompt: '여러 VLAN을 스위치 사이의 한 링크로 전달할 때 일반적으로 사용하는 포트 방식은?', choices: ['trunk', '일반 access만', '직렬 콘솔 전용', '전원 입력'], answer: 0, explanation: 'trunk는 허용한 여러 VLAN의 트래픽을 하나의 링크에서 전달할 수 있습니다.' },
    ], sources: [S.vlan, S.flooding], checkedAt, relatedQuestions: ['2022-01-Q49'],
  },
  {
    id: 'cabling-orientation', subject: '실기 케이블링', title: '커넥터 관찰 방향과 핀 번호',
    summary: '접점 면·클립·케이블 방향을 확인한 뒤 1~8번 핀을 읽습니다.',
    objectives: ['앱의 관찰 기준에 따라 1번과 8번 핀을 구분합니다.', '플러그와 잭 후면의 결선 표시를 구분합니다.'],
    prerequisites: ['8개 접점을 가진 모듈러 플러그의 외형'],
    sections: [
      { title: '이 앱의 관찰 기준', paragraphs: ['이 앱은 일반적으로 RJ-45라고 부르는 8P8C 플러그의 금속 접점이 보이는 넓은 면을 기준으로 합니다. 고정 클립은 관찰자의 반대쪽에, 접점이 있는 끝은 위쪽에, 케이블은 아래쪽에 둡니다. 이 상태에서 왼쪽이 1번, 오른쪽이 8번입니다.', '그림을 회전하거나 플러그를 뒤집으면 화면의 좌우만으로 번호를 판별할 수 없습니다. 배열을 암기하기 전에 금속 접점·고정 클립·케이블 위치를 먼저 확인합니다.'], table: { headers: ['확인 요소', '앱의 표시 기준'], rows: [['금속 접점', '관찰자에게 보이는 면'], ['고정 클립', '관찰자 반대쪽'], ['접점 끝 / 케이블', '위쪽 / 아래쪽'], ['핀 번호', '왼쪽 1번 → 오른쪽 8번']] } },
      { title: '색상과 실제 단자', paragraphs: ['흰주·흰초·흰파·흰갈은 흰색 바탕에 주황·초록·파랑·갈색 줄무늬가 있는 선을 뜻합니다. 명도 차이만으로 판단하지 않고 색상명과 줄무늬를 함께 확인합니다.', '잭 후면의 압입 단자는 제조사 내부 연결 구조에 따라 플러그 전면과 다른 순서로 배열될 수 있습니다. 실제 잭 작업에서는 제조사의 핀 번호와 A/B 색상 표시를 적용합니다.'] },
    ],
    example: { title: '배열 문제 시작 전의 방향 확인', steps: ['금속 접점이 보이는지 확인합니다.', '고정 클립이 반대쪽, 케이블이 아래쪽인지 확인합니다.', '왼쪽 1번부터 오른쪽 8번까지 위치를 확인합니다.', '문제에서 지정한 T568A 또는 T568B에 맞춰 색상을 배치합니다.'] },
    pitfalls: ['클립이 보이는 뒷면에서 같은 좌우 순서를 그대로 적용하지 않도록 합니다.', '잭 후면의 단자 배열을 플러그 핀 순서와 동일하게 간주하지 않도록 합니다.'],
    checks: [
      { id: 'orientation-1', prompt: '이 앱의 기준에서 금속 접점 면이 보이고 클립은 뒤쪽, 케이블은 아래쪽입니다. 1번 핀의 위치는?', choices: ['왼쪽 끝', '오른쪽 끝', '항상 중앙', '색상과 무관하게 파랑 위치'], answer: 0, explanation: '명시한 관찰 방향에서는 왼쪽이 1번이며 오른쪽으로 8번까지 읽습니다.' },
      { id: 'orientation-2', prompt: '잭 후면의 압입 단자를 결선할 때 우선 확인할 정보는?', choices: ['화면의 왼쪽부터 무조건 1~8번', '제조사의 핀 번호와 A/B 표시', '단자 사이 거리만', '선의 밝기만'], answer: 1, explanation: '잭 후면의 배치는 제조사에 따라 다르므로 표시된 번호와 결선 색상을 확인합니다.' },
    ], sources: [S.pin, S.t568], checkedAt, relatedQuestions: [], practicePath: '/cabling/pins',
  },
  {
    id: 'cabling-t568', subject: '실기 케이블링', title: 'T568A·T568B와 직결·교차 결선',
    summary: '네 쌍의 위치를 비교하고, 양 끝의 결선 관계를 판별합니다.',
    objectives: ['T568A와 T568B의 8개 핀 배열을 구성합니다.', '직결과 10/100Mbps용 두 쌍 교차의 적용 범위를 구분합니다.'],
    prerequisites: ['커넥터 관찰 방향과 핀 번호', '단색 선과 흰색 줄무늬 선의 구분'],
    sections: [
      { title: '핀별 배열 비교', paragraphs: ['T568A와 T568B는 주황 쌍과 초록 쌍의 위치가 서로 다릅니다. 파랑 쌍은 4·5번, 갈색 쌍은 7·8번으로 같습니다. 같은 색 쌍이라고 해서 모든 쌍이 연속 번호에 배치되는 것은 아닙니다. 3·6번도 하나의 쌍입니다.'], table: { headers: ['핀', 'T568A', 'T568B'], rows: [['1', '흰색/초록', '흰색/주황'], ['2', '초록', '주황'], ['3', '흰색/주황', '흰색/초록'], ['4', '파랑', '파랑'], ['5', '흰색/파랑', '흰색/파랑'], ['6', '주황', '초록'], ['7', '흰색/갈색', '흰색/갈색'], ['8', '갈색', '갈색']] } },
      { title: '양 끝의 결선 관계', paragraphs: ['양 끝을 A–A 또는 B–B로 결선하면 같은 핀 번호끼리 연결되는 직결 케이블입니다. 한쪽 A, 다른 쪽 B는 1↔3·2↔6을 교차하는 10BASE-T·100BASE-TX용 두 쌍 교차 결선입니다.', '1000BASE-T는 네 쌍 모두를 사용합니다. A–B를 모든 속도와 장비에 적용하는 교차 규칙으로 확대하지 않도록 합니다. Auto-MDI-X를 지원하고 활성화한 포트는 직결·교차 연결을 자동으로 처리할 수 있으므로 실제 포트 사양과 설정을 확인합니다.', '배열 정답은 실제 케이블의 접촉·단선·압착 품질을 증명하지 않습니다. 제작한 케이블은 적합한 시험기로 별도 점검합니다.'] },
    ],
    example: { title: 'T568B 배열의 두 위치 교정', steps: ['B 배열의 3번은 흰색/초록, 6번은 초록임을 확인합니다.', '이 두 선이 서로 뒤바뀌었다면 3번과 6번의 위치를 교환합니다.', '1·2번의 주황 쌍과 4·5번의 파랑 쌍, 7·8번의 갈색 쌍도 확인합니다.', '정답 배열을 숨긴 후 1번부터 8번까지 다시 구성합니다.'] },
    pitfalls: ['A와 B의 차이는 주황·초록 쌍입니다. 전체 8개 선을 역순으로 전환하지 않도록 합니다.', '화면의 교정 완료와 무힌트 재확인 통과, 실물 케이블 점검을 구분합니다.'],
    checks: [
      { id: 't568-1', prompt: 'T568B의 3번과 6번에 연결하는 쌍은?', choices: ['파랑 쌍', '갈색 쌍', '초록 쌍', '주황 쌍'], answer: 2, explanation: 'T568B는 3번 흰색/초록, 6번 초록입니다. T568A에서는 이 위치가 주황 쌍입니다.' },
      { id: 't568-2', prompt: '직결 케이블에 해당하는 양 끝의 결선 조합은?', choices: ['A–B만', 'A–A 또는 B–B', '항상 전체 역순', '4번과 5번만 교환'], answer: 1, explanation: '양 끝에서 같은 표준을 적용한 A–A와 B–B는 같은 번호끼리 연결되는 직결 결선입니다.' },
    ], sources: [S.t568, S.h3c, S.crossover, S.mdix, S.aruba, S.wiremap], checkedAt, relatedQuestions: [], practicePath: '/cabling/pins',
  },
];

export const GUIDES = [
  { id: 'guide-first', title: '학습 시작 절차', audience: '네트워크 학습을 처음 시작하는 분', steps: ['OSI 계층에서 주소·프레임·패킷의 역할을 구분합니다.', 'Ethernet, IPv4 서브넷, TCP·UDP 순서로 이론과 자체 개념확인을 학습합니다.', '관련 필기 문제의 원문을 읽고 선택 근거를 설명합니다.', '틀린 개념으로 돌아가 예제를 다시 해석합니다.'], startPath: '/learn/theory/network-osi' },
  { id: 'guide-written', title: '필기 학습 절차', audience: '필기 시험을 준비하는 분', steps: ['네트워크일반·TCP/IP·NOS·네트워크운용기기 네 과목의 학습 범위를 확인합니다.', '한 주제를 학습한 뒤 연결된 문항을 풉니다.', '정답 번호와 함께 선택한 근거와 다른 보기의 오류를 확인합니다.', '가채점 기준의 문제은행 점수와 실제 시험 결과를 구분합니다. 이론 10개는 전체 시험 범위를 모두 다루지 않습니다.'], startPath: '/learn/theory' },
  { id: 'guide-practical', title: '실기 세 영역의 학습 순서', audience: '작업형·실습형·단답형/객관식을 준비하는 분', steps: ['실기 홈에서 세 영역의 학습 내용과 이용 가능한 기능을 확인합니다.', '작업형은 핀 배열을 익힌 뒤 실제 케이블을 제작하고 연결 상태를 점검합니다.', '실습형은 라우터·Windows Server의 공식 에뮬레이터 안내를 확인하고 조건에 맞게 설정합니다.', '단답형/객관식은 24문항을 풀고 채점과 해설을 확인합니다. 오답·미응답은 복습 목록에서 다시 풀어 보세요.'], startPath: '/practical' },
  { id: 'guide-review', title: '오답 복습 절차', audience: '비슷한 문제에서 오류가 반복되는 분', steps: ['원래 선택한 답과 정답의 차이를 확인합니다.', '해당 이론의 적용 조건·비교표·혼동 주의 항목을 학습합니다.', '케이블링은 취약 핀과 전체 배열을 구분하여 복습합니다.', '안내를 확인한 교정 활동 뒤에 힌트 없는 새 시도로 다시 확인합니다.'], startPath: '/cabling/pins' },
];

export const FAQS = [
  { id: 'faq-scope', category: '학습 안내', question: '이론을 모두 읽으면 시험 범위를 전부 학습한 것인가요?', answer: '아닙니다. 초기 학습센터는 필기 네 과목에서 각 2개 주제와 케이블링 2개 주제를 제공합니다. 현재 공개한 10개 주제의 기초 개념을 다루며, 전체 출제 범위나 합격을 보장하지 않습니다. 시험 범위는 협회의 검정 안내에서 확인하세요.', source: S.icqa, checkedAt },
  { id: 'faq-exam', category: '시험 안내', question: '네트워크관리사 2급의 필기 과목과 시험시간은 어디서 확인하나요?', answer: '협회 검정 안내에서 네트워크일반·TCP/IP·NOS·네트워크운용기기 네 과목을 확인할 수 있습니다. 확인일 기준 공식 FAQ는 2급 필기를 50문항·50분으로 안내합니다. 응시할 회차의 공지와 수험표도 함께 확인하세요.', source: S.icqaFaq, checkedAt },
  { id: 'faq-equipment-exam', category: '시험 안내', question: '준비물 목록의 도구를 시험장에 모두 가져가면 되나요?', answer: '준비물 목록은 개인 연습용입니다. 시험장의 제공 물품·반입 허용 도구·금지 물품을 확정한 목록이 아닙니다. 응시 회차의 공식 안내와 수험표를 확인하고 불명확한 도구는 협회에 확인하세요.', source: S.icqaFaq, checkedAt },
  { id: 'faq-emulator', category: '학습 안내', question: '실기 세 영역에서 지금 어떤 기능을 이용할 수 있나요?', answer: '작업형에서는 기존 케이블링 연습·핀별 복습·배열 교정을 이용할 수 있습니다. 실습형은 라우터와 Windows Server의 공식 에뮬레이터 이용 안내를 제공합니다. 단답형/객관식은 24문항의 답안 입력·채점·해설·오답 복습과 학습 기록 저장을 제공합니다. 별도 웹 라우터 실습실도 준비 중입니다.', checkedAt: '2026-10-23' },
  { id: 'faq-answer-basis', category: '앱 사용', question: '자체 개념확인과 필기 문제은행의 답은 같은 기준인가요?', answer: '자체 개념확인은 링크된 기술 문서를 근거로 이 앱에서 작성한 학습 문항입니다. 필기 문제은행은 보존된 원문 문항과 기존 가채점 답안 기준을 사용합니다. 관련 문항 링크는 개념의 연관성을 검토한 것이며 공식 정답 확정이나 출제기관의 인증을 의미하지 않습니다.', checkedAt },
  { id: 'faq-repository', category: '앱 사용', question: '기존 필기·실기 앱과 어떤 관계인가요?', answer: '통합 앱은 별도 앱입니다. 기존 필기·실기 앱은 기준 버전으로 보존하고, 이론·안내·FAQ·준비물·핀 복습·배열 교정은 통합 앱에서 확장합니다. 기존 앱의 주소와 기록이 이 앱으로 자동 이전된다고 가정하지 마세요.', checkedAt },
  { id: 'faq-records', category: '앱 사용', question: '기기나 브라우저를 바꾸면 기록도 함께 이동하나요?', answer: '브라우저에 저장한 기록은 다른 기기·브라우저·사이트 주소로 자동 동기화되지 않습니다. 브라우저 데이터 삭제와 비공개 탐색 종료 시에도 기록이 사라질 수 있습니다. 중요한 학습 결과는 앱에서 제공하는 저장·백업 기능의 지원 범위를 먼저 확인하세요.', checkedAt },
  { id: 'faq-a-b', category: '케이블링', question: 'T568A와 T568B 중 어느 쪽이 더 빠른가요?', answer: '정상적으로 결선된 경우 A와 B의 선택 자체가 전송 성능 차이를 만드는 것은 아닙니다. 주황·초록 쌍의 위치가 다르며, 작업에서 요구한 표준과 양 끝의 연결 관계를 지키는 것이 중요합니다.', source: S.t568, checkedAt },
  { id: 'faq-pair36', category: '케이블링', question: '3번과 6번은 떨어져 있는데 왜 한 쌍인가요?', answer: '핀 번호의 인접 여부와 꼬임쌍의 구성은 다릅니다. T568A에서는 주황 쌍, T568B에서는 초록 쌍이 3번과 6번에 연결됩니다. 4번과 5번에는 파랑 쌍이 배치됩니다.', source: S.t568, checkedAt },
  { id: 'faq-crossover', category: '케이블링', question: '한쪽 A, 다른 쪽 B이면 모든 장비의 교차 케이블인가요?', answer: '이 앱의 A–B 판별은 10BASE-T·100BASE-TX용 두 쌍 교차 결선입니다. 1000BASE-T의 네 쌍 사용과 별도 교차 결선을 구분해야 합니다. 실제 장비에서는 Auto-MDI-X 지원 여부와 설정도 확인하세요.', source: S.h3c, checkedAt },
  { id: 'faq-wiremap', category: '케이블링', question: '시험기의 1~8 표시가 모두 켜지면 성능도 검증된 건가요?', answer: '단순 도통 확인과 케이블의 전송 성능 검증은 범위가 다릅니다. 스플릿 페어는 양 끝의 도통이 맞아도 서로 다른 꼬임쌍의 선을 혼용한 상태이며 누화를 유발할 수 있습니다. 시험기가 검출하는 항목과 성능 인증 범위를 확인하세요.', source: S.wiremap, checkedAt },
  { id: 'faq-correction', category: '앱 사용', question: '해설을 보고 배열을 고친 것도 바로 숙달로 판단하나요?', answer: '교정 완료와 무힌트 재확인은 구분합니다. 안내를 따라 배열을 수정한 뒤 정답 배열을 숨긴 새 시도로 확인하세요. 원래 평가 답안과 교정 과정을 별도로 보아야 오류가 해소되었는지 판단할 수 있습니다.', checkedAt },
];

export const TOOLS = [
  { id: 'tool-cable', name: '연습용 꼬임쌍 케이블', role: '피복 제거·쌍 구분·배열·삽입 연습', requirement: '실물 제작 시 필요', compatibility: '선택한 카테고리, 단선·연선, 도체 굵기와 플러그 규격 대조', note: '길이와 절단 위치는 연습 과제 및 제품 설명을 따릅니다. 시험장 제공·반입 여부는 별도 확인합니다.' },
  { id: 'tool-plug', name: '8P8C 모듈러 플러그', role: '8개 도체를 핀 위치에 연결', requirement: '실물 제작 시 필요', compatibility: '케이블 카테고리·도체 형태·외경·차폐와 제품 허용 규격 확인', note: '일반형과 관통형은 대응 압착 도구가 다를 수 있습니다. 소모품 수량은 연습 횟수에 맞춰 준비합니다.' },
  { id: 'tool-crimper', name: '호환 압착 공구', role: '플러그 접점과 케이블 고정부 압착', requirement: '압착형 플러그 사용 시 필요', compatibility: '플러그 형상·일반형/관통형·제조사 권장 공구 확인', note: '사용 전 제조사 설명서를 확인합니다. 시험장 반입 허용 도구로 확정한 항목이 아닙니다.' },
  { id: 'tool-stripper', name: '케이블 스트리퍼', role: '외피 제거', requirement: '대응 기능의 공구 필요', compatibility: '케이블 외경·피복 두께에 적합한 제품', note: '내부 도체의 절연 피복 손상 여부를 확인합니다. 압착 공구에 적합한 탈피 기능이 있으면 중복 준비 여부를 판단합니다.' },
  { id: 'tool-cutter', name: '케이블 커터', role: '케이블과 배열한 도체의 끝 절단', requirement: '대응 기능의 공구 필요', compatibility: '케이블·도체 절단용 공구, 플러그 삽입 길이와 제품 안내 확인', note: '절단면과 도체 길이를 확인합니다. 절단 조각을 정리하고 공구의 사용 지침을 준수합니다.' },
  { id: 'tool-tester', name: '케이블 시험기와 원격 장치', role: '와이어맵·단선·단락 등의 점검', requirement: '실물 제작 결과 점검용 권장', compatibility: '8P8C 케이블 지원, 원격 장치 포함 여부, 스플릿 페어 검출 기능 확인', note: '단순 LED 도통 시험기와 전송 성능 인증 시험기를 구분합니다. 시험기의 측정 범위 밖 품질은 확인했다고 기록하지 않습니다.' },
  { id: 'tool-label', name: '양 끝 표시용 레이블', role: 'A·B 표준, 제작 순서, 점검 결과 식별', requirement: '선택', compatibility: '케이블 외피에 적합한 크기와 접착 방식', note: '연습 결과를 구분하기 위한 선택 물품입니다. 시험장 사용 가능 여부는 별도로 확인합니다.' },
  { id: 'tool-screen', name: '화면 연습용 기기', role: '이론·핀별 복습·배열 교정', requirement: '화면 연습 시 필요', compatibility: '텍스트와 줄무늬를 구분할 수 있는 브라우저 화면', note: '화면 연습만 진행할 때는 제작 공구가 필요하지 않습니다. 실물 압착 품질을 화면 정답으로 대신 판단하지 않습니다.' },
];
