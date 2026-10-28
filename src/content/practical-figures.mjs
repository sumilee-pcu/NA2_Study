import screens from './practical-screens.json' with { type: 'json' };
import { LABS } from './practical-labs.mjs';

const source = (title, url) => ({ title, url });
const rfc = (number, section = '') => source(`IETF RFC ${number}${section ? ` §${section}` : ''}`, `https://www.rfc-editor.org/rfc/rfc${number}${section ? `#section-${section}` : ''}`);
const labSources = id => LABS.find(lab => lab.id === id).sources;
const coreutils = source('GNU Coreutils 공식 설명서', 'https://www.gnu.org/software/coreutils/manual/coreutils.html');
const diagram = (id, title, alt, caption, sources) => ({ id, file: `${id}.svg`, kind: 'diagram', title, alt, caption, sources });

const diagrams = [
  diagram('cable-quality', '압착 전에 확인하는 삽입 상태', '플러그 옆모습에서 도체가 끝까지 들어간 상태와 외피가 고정부 안으로 들어간 상태를, 도체가 짧거나 외피가 밖에 남은 상태와 비교합니다.', '배열을 맞춘 뒤에도 도체 끝과 외피 위치를 확인해야 합니다. 플러그 구조와 공구마다 준비 길이가 다르므로 사용하는 제품의 지침을 따르세요.', [source('IDEAL — 플러그 외피 고정과 제작 안내', 'https://www.idealind.com/content/dam/electrical/assets/DataComm/Modular%20Plugs/ModularPlug%20Solutions.pdf'), source('Klein Tools — 모듈러 플러그 조립 지침', 'https://data.kleintools.com/sites/all/product_assets/documents/instructions/klein/VDV826_ModularDataPlug_Instructions.pdf')]),
  diagram('cable-tester', '와이어맵에서 정상과 오류 읽기', '다이렉트의 1대1 연결, 3번 단선, 1번과 2번 뒤바뀜을 비교합니다. 번호가 맞아도 서로 다른 꼬임쌍을 연결한 split pair는 단순 도통 검사에서 놓칠 수 있습니다.', '먼저 요구한 결선 기준과 비교하세요. 의도한 크로스와 잘못된 교차를 구분하고, 시험기의 지원 항목을 확인하세요. 와이어맵만으로 전송 성능 전체를 판정하지 않습니다.', [source('Fluke Networks — Split Pair Identification', 'https://www.flukenetworks.com/support/knowledge-base/linkiq/split-pair-identification'), source('Fluke Networks — Wire Map Testing', 'https://www.flukenetworks.com/blog/cabling-chronicles/wire-map-testing-it-s-not-all-about-color')]),
  diagram('lab-ipv4', '/29 블록 안에서 서버·게이트웨이·DNS 찾기', '192.168.50.16부터 .23까지 8개 주소 중 .16은 네트워크, .23은 브로드캐스트입니다. .17은 게이트웨이, .18은 서버, .19는 DNS이며 마스크는 255.255.255.248입니다.', '서버에 입력할 값과 계산으로 구할 경계 주소를 구분하세요. 일반 호스트 주소는 .17부터 .22까지입니다.', labSources('windows-ipv4')),
  diagram('lab-dhcp', '배포 범위에서 제외 주소 빼기', '192.168.100.1부터 .126까지 126개 주소 중 .1부터 .10까지 10개를 제외하면 .11부터 .126까지 116개 후보가 남습니다.', '양 끝을 포함하므로 마지막 주소에서 첫 주소를 뺀 뒤 1을 더합니다. 후보 수는 실제 임대 수와 다르며, 이번 과제는 범위를 비활성 상태로 둡니다.', labSources('windows-dhcp')),
  diagram('lab-dns', '별칭 → 호스트 이름 → IPv4 주소', 'www.lab.example의 CNAME 대상은 web01.lab.example이고, web01의 A 레코드 값은 192.168.60.20입니다. 질의할 DNS 서버 주소 192.168.60.2는 별도입니다.', 'CNAME 칸에는 대상 이름, A 칸에는 호스트의 IPv4 주소를 넣습니다. 조회 대상 DNS 서버 주소를 웹 서버 주소와 혼동하지 마세요.', labSources('windows-dns-records')),
  diagram('lab-soa', 'SOA에서 숫자와 시간 단위를 함께 읽기', 'Refresh 3600초는 60분, Retry 900초는 15분, Expire 86400초는 1일, MINIMUM 600초는 10분입니다. SOA 레코드 자체의 TTL 3600초는 별도 항목입니다.', '값과 단위를 한 쌍으로 대조하세요. SOA MINIMUM을 모든 레코드에 공통 적용하는 TTL로 해석하지 않습니다.', labSources('windows-dns-soa')),
  diagram('router-modes', '명령을 입력할 모드와 저장 방향', '사용자 EXEC에서 enable로 특권 EXEC, configure terminal로 전역 설정, interface와 line으로 하위 설정 모드에 들어갑니다. 현재 실행 설정을 startup-config로 복사합니다.', '프롬프트 끝의 >, #, (config)#를 먼저 확인하세요. Router는 모드 비교용 이름입니다. hostname 적용 후 프롬프트 이름이 바뀌며, 현재 설정의 저장은 별도 단계입니다. 프로그램 재실행 시 유지 여부는 각 실습의 검토 범위를 확인하세요.', labSources('router-basics')),
  diagram('router-route', '정적 경로의 목적지와 다음 홉', 'R1의 10.0.12.1과 R2의 10.0.12.2는 10.0.12.0/30으로 연결됩니다. R1에서 목적지 192.168.20.0/24로 가는 다음 홉은 R2의 10.0.12.2입니다.', '설정할 경로를 해석하는 개념도입니다. 화살표는 실습에서 패킷 전달에 성공했다는 뜻이 아닙니다. 실제 화면에서는 설정 행과 경로 사용 여부를 구분합니다.', labSources('router-route')),
  diagram('subnet-18', '/18 네트워크 주소를 AND로 계산하기', '128.148.210.12와 마스크 255.255.192.0을 AND하면 128.148.192.0입니다. 셋째 옥텟의 210 AND 192는 192이고, 전체 주소 수는 2의 14제곱인 16384개입니다.', '셋째 옥텟의 블록 간격 64와 전체 주소 수 16384를 구분하세요. 네트워크 주소와 브로드캐스트 주소를 포함한 수입니다.', [rfc(4632,'3.1')]),
  diagram('subnet-split', '/16을 같은 크기의 /19 여덟 개로 나누기', '172.16.0.0/16에서 접두 길이를 3비트 늘리면 8개 블록입니다. 각 /19의 셋째 옥텟 시작값은 0, 32, 64, 96, 128, 160, 192, 224입니다.', '원래 블록의 접두 길이와 나눈 뒤의 접두 길이를 비교합니다. /19 블록마다 전체 주소는 8192개입니다.', [rfc(4632,'3.1')]),
  diagram('ipv6-types', 'IPv6의 세 가지 목적지 지정 방식', '유니캐스트는 한 인터페이스, 멀티캐스트는 그룹의 모든 인터페이스, 애니캐스트는 라우팅상 가장 가까운 그룹 구성원 하나로 전달합니다.', '애니캐스트의 가까움은 물리적 거리를 뜻하지 않습니다. IPv6에는 브로드캐스트 주소가 없습니다.', [rfc(4291,'2')]),
  diagram('linux-storage', 'df와 du가 바라보는 범위', 'df는 파일시스템 전체의 공간 정보를 보고, du는 선택한 파일과 디렉터리의 사용량을 따라갑니다. 같은 위치에서 실행해도 집계 관점이 다릅니다.', '어떤 단위의 사용량을 묻는지 먼저 확인하세요. 두 출력의 수치가 항상 같아야 하는 것은 아닙니다.', [coreutils]),
  diagram('linux-files', 'Linux 정보 파일의 역할 구분', '/etc/services는 서비스 이름과 포트·프로토콜, /etc/passwd는 계정 정보, shadow 방식의 /etc/shadow는 암호 해시 등 인증 관련 정보를 담습니다.', 'services에 이름이 있다고 실행 중인 서비스가 되는 것은 아닙니다. shadow 방식의 passwd 암호 필드와 shadow에 저장되는 정보를 구분하세요.', [source('Linux man-pages — services(5)', 'https://man7.org/linux/man-pages/man5/services.5.html'), source('Linux man-pages — passwd(5)', 'https://man7.org/linux/man-pages/man5/passwd.5.html')]),
  diagram('prefix-24', '/24를 32비트 마스크로 바꾸기', '첫 세 옥텟은 각각 11111111로 255이고, 마지막 옥텟은 00000000으로 0입니다. 앞의 24비트가 1인 마스크는 255.255.255.0입니다.', '한 옥텟은 8비트입니다. 접두 길이는 왼쪽부터 연속한 1의 개수이며 주소 전체 길이는 32비트입니다.', [rfc(4632,'3.1')]),
  diagram('arp-icmp', '주소 해석과 제어 메시지 구분', 'ARP는 같은 링크의 IPv4 이웃 주소에 대응하는 MAC 주소를 알아냅니다. ICMPv4에는 Echo 요청·응답과 목적지 도달 불가 같은 제어 메시지가 있습니다.', 'ARP의 주소 해석과 ICMP의 제어 메시지를 구분하세요. Echo 응답과 오류 메시지가 언제나 도착한다고 보장되는 것은 아닙니다.', [rfc(826), rfc(792)]),
  diagram('linux-755', '755를 소유자·그룹·기타 권한으로 읽기', '일반 파일 -rwxr-xr-x는 소유자 읽기·쓰기·실행 7, 그룹 읽기·실행 5, 기타 사용자 읽기·실행 5입니다. 맨 앞의 -는 일반 파일을 뜻합니다.', '권한 자리에 있는 -는 해당 권한이 없다는 뜻입니다. 기본 권한 비트의 해석이며 ACL 등 다른 조건을 포함한 실제 접근 결과를 보장하지 않습니다.', [coreutils]),
  diagram('tcp-stream', 'TCP는 바이트 순서를 전달합니다', '응용이 AB와 CD를 나누어 보냈어도 수신 응용은 A와 BCD처럼 다른 단위로 읽을 수 있습니다. TCP는 순서 있는 바이트 스트림이며 응용 메시지 경계를 보존하지 않습니다.', '송신 호출의 경계와 수신 호출의 경계는 다를 수 있습니다. TCP 연결과 ACK만으로 사용자 신원 인증이나 암호화가 제공되지는 않습니다.', [rfc(9293,'3.7')]),
];

export const PRACTICAL_FIGURES = Object.fromEntries([...diagrams, ...screens.map(screen => ({ ...screen, sources: labSources(screen.labId).filter(s => /ICQA/.test(s.title)) }))].map(figure => [figure.id, figure]));

const screensFor = id => screens.filter(screen => screen.labId === id).map(screen => screen.id);
export const LAB_VISUALS = {
  'windows-ipv4': ['lab-ipv4', ...screensFor('windows-ipv4')],
  'windows-dhcp': ['lab-dhcp', ...screensFor('windows-dhcp')],
  'windows-dns-records': ['lab-dns', ...screensFor('windows-dns-records')],
  'windows-dns-soa': ['lab-soa', ...screensFor('windows-dns-soa')],
  'router-basics': ['router-modes', ...screensFor('router-basics')],
  'router-interface': ['router-modes', ...screensFor('router-interface')],
  'router-route': ['router-route', ...screensFor('router-route')],
  'router-access': ['router-modes', ...screensFor('router-access').reverse()],
};

export const QUIZ_VISUALS = {
  'PRAC-001': { ids: ['prefix-24'] },
  'PRAC-002': { ids: ['subnet-18'] },
  'PRAC-004': { ids: ['arp-icmp'] },
  'PRAC-005': { ids: ['arp-icmp'] },
  'PRAC-006': { theory: { topic: 'nos-windows-services', section: 0 } },
  'PRAC-008': { ids: ['linux-755'] },
  'PRAC-009': { ids: ['subnet-18'] },
  'PRAC-010': { ids: ['subnet-split'] },
  'PRAC-011': { ids: ['tcp-stream'] },
  'PRAC-012': { theory: { topic: 'tcpip-transport', section: 0 } },
  'PRAC-015': { ids: ['linux-files'] },
  'PRAC-016': { ids: ['linux-files'] },
  'PRAC-017': { ids: ['ipv6-types'] },
  'PRAC-020': { ids: ['linux-storage'] },
  'PRAC-022': { ids: ['linux-755'] },
  'PRAC-023': { ids: ['tcp-stream'] },
  'PRAC-024': { ids: ['arp-icmp'] },
};
