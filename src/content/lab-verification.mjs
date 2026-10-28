export const LAB_VERIFICATION_PATH = '/practical/lab/verification';
export const LAB_VERIFICATION_REPORT = 'https://github.com/sumilee-phd/NA2-study/blob/main/docs/PRACTICAL_LABS_VERIFICATION.md';

// 문서와 공개 화면이 함께 사용하는 검증 결과. 학습자의 입력 판정·저장 기록과는 별개입니다.
export const LAB_VERIFICATION = {
  date: '2026-10-24',
  title: '8개 과제 최종 검증표',
  summary: '8개 과제의 설정·저장 절차를 ICQA 도구에서 확인했습니다. Packet Tracer 시뮬레이션에서는 VTY 원격 인증·유휴 종료와 함께 인터페이스·정적 경로·저장 후 재부팅 복원, IPv4·DNS·DHCP 보완 실험을 추가로 확인했으며, DNS·DHCP의 일부 항목은 부분 확인으로 남았습니다.',
  boundary: '통과와 부분 확인은 각 항목에 적힌 관찰 범위에 한정합니다. 이 표는 실습 자료의 검증 결과이며, 학습자의 완료 기록이나 시험 점수가 아닙니다.',
  environments: [
    { title: 'ICQA Windows 실습용 에뮬레이터', description: '개별 설정 화면에서 입력·저장·다시 열어 값 확인. 실제 Windows Server 동작과 구분합니다.' },
    { title: 'ICQA 라우터 시험 데모', description: 'router.exe 1.0.0.0에서 명령·설정 저장·콘솔 인증 확인. VTY 원격 접속은 미지원입니다.' },
    { title: 'Cisco Packet Tracer', description: '9.0.0.0810 소프트웨어 시뮬레이션입니다. 1941 모델로 VTY 원격 인증·유휴 종료를, 1841 모델과 PC-PT·Server-PT로 인터페이스·정적 경로·저장 복원과 IPv4·DNS·DHCP 후속 실험을 확인했습니다.' },
  ],
  rows: [
    {
      labId: 'windows-ipv4', title: 'IPv4 주소·서브넷 설정',
      icqa: { state: 'confirmed', label: '입력·저장·재확인 통과', detail: '/29 주소·마스크·게이트웨이·DNS를 입력하고 속성을 다시 열어 값 유지를 확인했습니다.' },
      packetTracer: { state: 'confirmed', label: '보완 실험 통과', detail: 'PC-PT에 같은 /29 주소·게이트웨이·DNS를 넣고 같은 망 장치와의 통신, 게이트웨이를 거친 다른 망 통신, 지정 DNS 서버의 이름 조회를 확인했습니다. Windows 설정 화면 검증은 아닙니다.' },
      limit: '실제 Windows의 설정 화면과 통신은 미검증입니다. ICQA의 ipconfig /all은 설정과 무관한 고정 출력이므로 검증 근거로 사용할 수 없습니다. Packet Tracer 실험은 게이트웨이 라우터·DNS 서버·시험 이름을 추가한 구성이며, 파일을 다시 연 뒤의 PC 값은 조회하지 않았습니다.',
    },
    {
      labId: 'windows-dhcp', title: 'DHCP 범위·임대 기간',
      icqa: { state: 'confirmed', label: '비활성 범위 생성·설정 확인 통과', detail: '주소 범위, /25 마스크, 제외 범위, 6시간 임대를 속성과 주소 풀에서 확인했습니다.' },
      packetTracer: { state: 'partial', label: '할당 후속 실험 부분 확인', detail: '1841 라우터 DHCP로 .1~.10 제외와 /25 풀을 만들고 클라이언트 3대가 .11~.13을 받는 것, 해제 후 같은 주소의 재할당을 확인했습니다. 이 모델에서 임대 기간 지정 명령은 거부되었습니다.' },
      limit: 'ICQA에서는 범위 활성화와 실제 임대·갱신을 실행하지 않았습니다. 라우터 DHCP 실험은 Windows 제외 목록 기능 자체의 검증이 아니며, 6시간 임대의 실제 부여·자동 갱신·만료, 116개 전체 할당, /renew 순간의 패킷은 미검증입니다. 풀 표시의 Excluded addresses : 1은 집계 의미를 확인하지 못했습니다.',
    },
    {
      labId: 'windows-dns-records', title: 'DNS A·CNAME 레코드',
      icqa: { state: 'confirmed', label: '생성·보존 확인 통과', detail: 'lab.example 영역에 A·CNAME을 생성하고 목록·속성에서 값을 확인했습니다.' },
      packetTracer: { state: 'partial', label: 'A 조회 통과·CNAME 구조 부분 확인', detail: 'Server-PT에 A·CNAME을 만들고 A 이름 조회와 별칭 이름의 192.168.60.20 해석을 확인했습니다. 응답 패킷에서 TYPE 5(CNAME) 레코드는 확인하지 못했습니다.' },
      limit: '에뮬레이터의 nslookup은 고정 출력이므로 생성한 레코드의 응답 확인에 사용할 수 없습니다. Packet Tracer에서도 응답 안의 CNAME 레코드 구조는 미확인이며, 사용한 PC-PT nslookup은 -type= 옵션을 지원하지 않았습니다. 실제 Windows DNS 서버는 미검증입니다.',
    },
    {
      labId: 'windows-dns-soa', title: 'DNS SOA 관리 정보·시간',
      icqa: { state: 'confirmed', label: '입력·저장·재확인 통과', detail: '일련번호, 주 서버, 책임자, 갱신·재시도·만료·TTL 값과 단위를 확인했습니다.' },
      packetTracer: { state: 'partial', label: '일부 필드 저장·TTL 비교 부분 확인', detail: 'Server-PT의 SOA 입력 칸 6개 저장과 다시 열기를 확인했습니다. 같은 조건에서 Minimum TTL을 600·700·600으로 바꾸자 관찰한 A 응답 TTL도 600·700·600으로 달라졌습니다.' },
      limit: '확인한 Server-PT 화면에는 일련번호와 SOA 레코드 자체 TTL 입력 칸이 없었습니다. 사용한 PC-PT nslookup의 -type= 옵션이 지원되지 않아 SOA 유형을 지정한 질의·응답은 확인하지 못했습니다. TTL 감소, 표준 부정 응답 캐시, 보조 서버의 Refresh·Retry·Expire 동작은 미검증이며, 사용한 화면과 도움말에서 보조 서버 설정 방법을 찾지 못했습니다. ICQA에서는 레코드 추가 후 일련번호 자동 증가가 관찰되지 않았습니다.',
    },
    {
      labId: 'router-basics', title: '라우터 모드·호스트 이름·저장',
      icqa: { state: 'confirmed', label: '명령·저장 통과', detail: '모드 전환, hostname LAB-R1, 저장 [OK], running-config·startup-config의 이름 일치를 확인했습니다.' },
      packetTracer: { state: 'confirmed', label: '저장 후 재부팅 복원 통과', detail: '1841에서 LAB-R1을 저장한 뒤 reload하자 이름·주소·경로가 복원되었고, 저장하지 않은 LAB-TEMP는 reload 후 사라졌습니다. .pkt 저장 후 다시 열기는 저장하지 않은 실행 설정까지 되살리는 파일 보존 동작이었습니다.' },
      limit: 'ICQA 데모는 프로그램 재실행 후 새 시험으로 초기화됩니다. 실행 중 저장 성공과 재실행 간 보존을 구분해야 하며, Packet Tracer의 .pkt 재열기 보존을 같은 의미로 보지 않습니다. 실제 장비의 NVRAM 동작은 미검증입니다.',
    },
    {
      labId: 'router-interface', title: '인터페이스 IPv4·마스크·활성화',
      icqa: { state: 'confirmed', label: '설정·저장 통과', detail: 'FastEthernet0/0의 주소·마스크와 관리상 활성화를 확인했습니다. 상태는 up / protocol down입니다.' },
      packetTracer: { state: 'confirmed', label: '원래 조건 통과', detail: '1841의 FastEthernet0/0에 192.168.10.1 255.255.255.192를 넣어 up/up, PC와의 ping 4/4, 시작 설정 저장, reload 후 복원을 확인했습니다.' },
      limit: 'ICQA 데모의 링크는 protocol down이어서 통신을 확인할 수 없었습니다. Packet Tracer 결과는 소프트웨어 시뮬레이션이며 실제 장비·실제 IOS 이미지는 미검증입니다.',
    },
    {
      labId: 'router-route', title: '정적 경로 설정',
      icqa: { state: 'confirmed', label: '명령 수락·설정 저장 통과', detail: 'ip route 행이 running-config·startup-config에 유지되는 것을 확인했습니다.' },
      packetTracer: { state: 'confirmed', label: '경로 등록·전달 통과', detail: 'S 192.168.20.0/24 via 10.0.12.2가 라우팅 표에 등록되고 서로 다른 망의 PC 사이 왕복 통신과 tracert 경로를 확인했습니다. 경로를 지우면 실패하고 복원하면 다시 성공했습니다.' },
      limit: 'ICQA 데모에서는 연결 구간이 down이라 경로 등록·패킷 전달을 확인할 수 없었습니다. Packet Tracer 실험은 R2 반환 경로를 준비하고 R1 LAN을 router-interface 조건(/26)으로 둔 구성이며, 동일 서브넷 ping은 정적 경로 검증으로 쓰지 않았습니다.',
    },
    {
      labId: 'router-access', title: '콘솔·VTY 인증·유휴 시간',
      icqa: { state: 'confirmed', label: '설정·저장 및 콘솔 인증 통과', detail: '두 라인의 비밀번호·login, VTY exec-timeout 5 30 저장을 확인했습니다. 콘솔 재접속 시 오답 거부·정답 접속을 확인했습니다. VTY 원격 접속은 도구 미지원입니다.' },
      packetTracer: { state: 'confirmed', label: 'VTY 인증·유휴 종료 관찰 통과', detail: '라인 비밀번호 + login으로 오답 거부·정답 접속 및 vty 0을 확인했습니다. 입력 없는 대기 후 330.4초 초과~344.2초 이하에 종료되고 VTY 목록에서 사라졌습니다.' },
      limit: '소프트웨어 시뮬레이션 1회 결과입니다. 정확히 330초에 종료됐다는 검증은 아닙니다. 실제 장비·다른 IOS 버전은 미검증입니다.',
    },
  ],
  limitations: [
    { title: 'Windows 실행 방식', detail: 'ICQA 개별 화면 프로그램을 일반 권한으로 실행했습니다. 관리자 권한 런처를 통한 전체 실행 흐름과의 동일성은 확인하지 않았습니다.' },
    { title: '저장과 재실행', detail: 'Windows 에뮬레이터의 실행 중 값 유지와 프로그램 재실행 후 초기화를 구분해야 합니다. 라우터 데모도 재실행하면 새 시험으로 시작하며 startup-config is not present가 확인됐습니다. Packet Tracer의 .pkt 다시 열기는 저장하지 않은 실행 설정까지 되살리는 파일 동작이므로 ICQA 재실행 결과나 장비 재부팅과 따로 봅니다.' },
    { title: '도구 범위', detail: '확인한 Packet Tracer 9.0.0.0810의 화면·명령 범위에서 Server-PT SOA의 일련번호·레코드 TTL 입력 칸, PC-PT nslookup의 -type= 옵션, 1841 DHCP 풀의 임대 기간 명령을 사용할 수 없었습니다. 이 항목은 Windows Server나 실제 장비에서 따로 확인해야 합니다.' },
    { title: '환경 구분', detail: 'Packet Tracer 검증은 9.0.0.0810의 1941 모델(VTY)과 1841 모델·PC-PT·Server-PT(후속 실험) 시뮬레이션입니다. 실제 Windows Server 2022, 실제 Cisco 장비 또는 실제 IOS 이미지에서 수행한 검증은 아닙니다.' },
    { title: '시험 채점', detail: '자체 학습 과제의 실행 확인이며, 협회 시험의 채점 방식·점수와 일치하는지는 확인하지 못했습니다.' },
  ],
};
