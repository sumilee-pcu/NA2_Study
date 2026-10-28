// Original vectors based on the reviewed lesson concepts. The source-slide
// mapping and preservation evidence are recorded in docs/THEORY_FIGURES.md.
const figure = (id, section, title, alt, caption) => ({
  id, section, title, alt, caption,
  file: `${id}.svg`,
  checkedAt: '2026-10-24',
});

export const THEORY_REFERENCES = {
  'network-osi': 'itgo K010130 · PART2-1 강의자료 5·20번 슬라이드의 캡슐화·계층 대응 그림',
  'network-ethernet': 'itgo K010128 · PART1-1 강의자료 33·34번 슬라이드의 Ethernet 통신 설명',
  'tcpip-subnetting': 'itgo K010131 · PART2-2 강의자료 10번 슬라이드의 서브넷 그림',
  'tcpip-transport': 'itgo K010130 · PART2-1 강의자료 27·33·38번 슬라이드의 TCP·UDP 설명',
  'nos-linux': 'itgo K020329 · NOS Linux-1 강의자료 27번 슬라이드의 권한 그림',
  'nos-windows-services': 'itgo K010132 · PART2-3 강의자료 17번 슬라이드, 성안당 3과목 23·28번 슬라이드의 DHCP·DNS 설명',
  'devices-switch-router': 'itgo K020331 · 네트워크 운용기기 강의자료 19·20번 슬라이드의 스위치·라우터 설명',
  'devices-vlan': '성안당 네트워크관리사 1·2급 4과목 강의자료 5번 슬라이드의 VLAN 그림',
  'cabling-orientation': 'itgo K010128 · PART1-1 강의자료 37번 슬라이드의 T568B 배열·플러그 사진',
  'cabling-t568': '성안당 네트워크관리사 1·2급 실기_2 강의자료 5·6번 슬라이드의 직결·교차 그림, itgo K010128 37번 슬라이드',
};

export const FIGURE_TECHNICAL_SOURCES = {
  'network-ethernet': [{ title: 'IBM — Ethernet II 프레임의 필드와 바이트 수', url: 'https://www.ibm.com/docs/en/i/7.6.0?topic=support-ethernet-frame-format' }],
  'nos-windows-services': [{ title: 'IETF RFC 2131 §3.1 — DHCP 신규 임대 절차', url: 'https://www.rfc-editor.org/rfc/rfc2131#section-3.1' }],
};

export const THEORY_FIGURES = {
  'network-osi': [
    figure('network-osi', 0, 'OSI와 TCP/IP의 계층 대응', 'OSI의 응용·표현·세션은 TCP/IP 응용에, 전송은 전송에, 네트워크는 인터넷에, 데이터링크·물리는 링크에 기능상 대응합니다.', '두 모델은 계층 수가 다릅니다. 숫자보다 같은 높이에 놓인 기능을 비교하세요.'),
    figure('encapsulation', 1, '헤더가 추가되는 캡슐화 과정', '응용 데이터에 TCP 헤더, IP 헤더, Ethernet 헤더와 FCS가 차례로 붙습니다. 수신 측은 반대 순서로 해석합니다.', 'TCP를 Ethernet으로 전달하는 예입니다. 도형의 폭은 실제 바이트 수에 비례하지 않습니다.'),
  ],
  'network-ethernet': [figure('network-ethernet', 0, 'Ethernet 프레임과 동시 송수신', 'Ethernet II의 목적지 MAC, 출발지 MAC, 유형, 데이터와 FCS 순서 및 전이중의 양방향 전송을 표시합니다.', '태그가 없는 Ethernet II 프레임의 기본 예입니다. 프리앰블과 SFD는 생략했으며 필드 폭은 실제 길이에 비례하지 않습니다.')],
  'tcpip-subnetting': [figure('tcpip-subnetting', 1, '/26 주소 블록에서 77의 위치 찾기', '192.168.10.0/24를 /26 네 개로 나누면 마지막 옥텟은 0~63, 64~127, 128~191, 192~255입니다. 77은 두 번째 블록이고 일반 호스트 범위는 65~126입니다.', '네트워크 주소 64와 브로드캐스트 주소 127을 먼저 찾은 뒤, 두 주소 사이를 호스트 범위로 읽습니다.')],
  'tcpip-transport': [figure('tcpip-transport', 0, 'TCP 연결 설정과 UDP 데이터그램', 'TCP는 클라이언트 SYN, 서버 SYN과 ACK, 클라이언트 ACK로 연결을 설정합니다. UDP 자체에는 같은 연결 설정이나 손실 재전송 보장이 없습니다.', '화살표 방향과 순서를 따라 읽으세요. UDP 위에서 응용이 별도의 확인·재전송 기능을 구현할 수 있습니다.')],
  'nos-linux': [figure('nos-linux', 1, '권한 640을 세 묶음으로 해석하기', '일반 파일 -rw-r-----의 소유자는 읽기와 쓰기 6, 그룹은 읽기 4, 그 밖의 사용자는 권한 없음 0입니다.', '첫 기호는 파일 종류입니다. 뒤의 9개 권한 비트만 소유자·그룹·그 밖의 사용자로 나누어 계산합니다.')],
  'nos-windows-services': [figure('nos-windows-services', 0, 'DHCP 주소 구성과 DNS 이름 해석', 'DHCP의 Discover, Offer, Request, ACK로 주소 구성을 받고, DNS에 이름을 질의하여 IP 주소를 응답받는 흐름을 구분합니다.', '주소 설정을 받는 과정과 이름을 주소로 바꾸는 과정은 별개입니다. 실제 Windows 설정 창을 재현한 그림이 아닌 서비스 개념도입니다.')],
  'devices-switch-router': [figure('devices-switch-router', 0, '스위치의 MAC 전달과 라우터의 IP 경로 선택', 'L2 스위치는 출발지 MAC과 들어온 포트를 학습하고 목적지 MAC으로 전달합니다. 라우터는 목적지 IP에 가장 길게 일치하는 접두 경로를 선택합니다.', '주소를 학습할 때와 데이터를 전달할 때 참조하는 주소를 구분하세요. 라우터는 서로 다른 IP 네트워크를 연결합니다.')],
  'devices-vlan': [figure('devices-vlan', 1, '두 스위치 사이의 VLAN 전달', '각 스위치에 VLAN 10과 VLAN 20의 access 포트가 있고 두 스위치의 trunk가 두 VLAN을 전달합니다. 다른 VLAN 사이의 통신에는 L3 처리가 필요합니다.', '색과 VLAN 번호를 함께 따라가세요. trunk는 여러 VLAN을 전달하지만 VLAN 간 라우팅을 대신하지 않습니다.')],
  'cabling-orientation': [figure('cabling-orientation', 0, '플러그 관찰 기준과 1~8번 핀', '금속 접점 면을 앞에서 봅니다. 클립은 반대쪽, 접점 끝은 위쪽, 케이블은 아래쪽이며 왼쪽부터 1~8번입니다. 점선은 뒷면 클립 위치입니다.', '플러그의 넓은 접점 면을 보는 개념도입니다. 점선 클립은 뒷면에 있습니다. 잭 후면의 압입 단자에는 이 좌우 순서를 그대로 적용하지 않습니다.')],
  'cabling-t568': [
    figure('cabling-t568', 0, 'T568A·T568B의 색상과 줄무늬', '1~8번 순서로 T568A는 흰초·초·흰주·파·흰파·주·흰갈·갈, T568B는 흰주·주·흰초·파·흰파·초·흰갈·갈입니다.', '흰주·흰초·흰파·흰갈은 흰색 바탕에 해당 색 줄무늬가 있는 선입니다. 두 표준에서 바뀌는 것은 주황 쌍과 초록 쌍입니다.'),
    figure('cabling-wiremap', 1, '직결과 10/100Mbps용 두 쌍 교차', '직결은 1~8번 각각 같은 번호로 연결됩니다. A-B 두 쌍 교차는 1-3, 2-6, 3-1, 6-2이고 나머지는 같은 번호입니다.', '두 쌍 교차는 10BASE-T·100BASE-TX 기준입니다. 그림의 선이 교차하는 지점은 접속점이 아닙니다. 1000BASE-T와 Auto-MDI-X는 본문의 적용 조건을 확인하세요.'),
  ],
};
