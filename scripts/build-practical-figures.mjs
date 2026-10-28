// Original, code-native instructional diagrams. No source screenshot is modified.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'src/assets/practical');
fs.mkdirSync(out, { recursive: true });
const C = { ink:'#192d33', navy:'#103b37', green:'#087a61', line:'#dce4df', soft:'#f3f5f2', pale:'#e7f3ec', muted:'#536b70', red:'#9b3c35', rose:'#fff1ed', blue:'#37658b' };
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,size=21,color=C.ink,weight=400,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const r=(x,y,w,h,fill=C.soft,stroke=C.line,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
const line=(x1,y1,x2,y2,c=C.green,width=3,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const a=(x1,y1,x2,y2,c=C.green,dash='')=>line(x1,y1,x2,y2,c,3,dash)+`<path d="M${x2-10*Math.cos(Math.atan2(y2-y1,x2-x1)-.45)},${y2-10*Math.sin(Math.atan2(y2-y1,x2-x1)-.45)} L${x2},${y2} L${x2-10*Math.cos(Math.atan2(y2-y1,x2-x1)+.45)},${y2-10*Math.sin(Math.atan2(y2-y1,x2-x1)+.45)}" fill="none" stroke="${c}" stroke-width="3"/>`;
const note=(y,s,s2)=>r(28,y,704,s2?76:52,C.pale)+t(46,y+32,s,20,C.navy,600)+(s2?t(46,y+60,s2,18,C.muted):'');
function save(id,title,desc,body,h=520){fs.writeFileSync(path.join(out,`${id}.svg`),`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${h}" viewBox="0 0 760 ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><rect width="760" height="${h}" fill="#fff"/><g font-family="Malgun Gothic, Apple SD Gothic Neo, system-ui, sans-serif">${t(28,45,title,27,C.navy,700)}${body}</g></svg>\n`);}

// Closed-end modular plug cross-section: one conductor represents the 8 conductors.
let b=t(28,80,'막힌 끝 플러그의 옆면 개념도 · 도체 1가닥으로 단순화',19,C.muted);
for(const [y,good] of [[120,true],[302,false]]){
  b+=t(28,y+10,good?'삽입 확인':'다시 준비',22,good?C.green:C.red,700)+r(210,y+30,480,100,'#f4f8f8',C.navy,12);
  b+=r(55,y+64,good?300:130,34,'#adc0c6','#adc0c6',3)+r(good?355:185,y+75,good?325:430,12,'#c77839','#c77839',2);
  b+=r(300,y+36,26,35,C.green,C.green,1)+r(650,y+35,22,33,'#d3ad53','#d3ad53',1);
  b+=t(42,y+150,'케이블 외피',18,C.muted)+t(552,y+150,'플러그 앞쪽 →',18,C.muted);
  b+=a(good?315:175,y+20,good?315:175,y+61,good?C.green:C.red);
  b+=t(365,y+13,good?'외피가 고정부 안쪽까지 들어감':'외피가 고정부에 닿지 않음',20,good?C.green:C.red,600);
  b+=a(good?680:616,y+160,good?680:616,y+94,good?C.green:C.red);
  if(!good)b+=t(28,y+177,'도체 끝이 앞쪽에 닿지 않음',20,C.red,600);
}
b+=note(496,'압착 전: 8가닥 배열 · 끝까지 삽입 · 외피 고정을 함께 확인','절단 길이와 통과형 플러그의 마무리는 해당 제품 설명을 따릅니다.');
save('cable-quality','압착하기 전에 확인할 세 곳','막힌 끝 플러그의 옆면 개념도. 정상은 도체 끝이 앞쪽 끝까지 닿고 케이블 외피가 고정부 아래에 들어간다. 불량은 도체가 덜 들어가거나 외피가 고정부 밖에 있다. 압착 전 8가닥 배열도 확인한다.',b,580);

b=t(28,80,'왼쪽 핀 → 오른쪽 핀 · 다이렉트 결선을 요구한 예',19,C.muted);
for(const [col,title,type] of [[0,'정상 연결','ok'],[1,'3번 단선','open'],[2,'1·2번 뒤바뀜','swap']]){
 const x=28+col*240;b+=r(x,101,224,295)+t(x+112,135,title,22,type==='ok'?C.green:C.red,700,'middle');
 for(let p=1;p<=8;p++){let y=158+p*26, end=type==='swap'?(p===1?2:p===2?1:p):p; b+=t(x+28,y+6,p,18,C.ink,600,'middle')+t(x+195,y+6,p,18,C.ink,600,'middle');if(type==='open'&&p===3){b+=line(x+48,y,x+99,y,C.red)+line(x+126,y,x+175,y,C.red)+t(x+112,y+7,'×',24,C.red,700,'middle');}else b+=line(x+48,y,x+175,158+end*26,type==='swap'&&p<3?C.red:C.green,2);}
}
b+=note(414,'1→1 도통이 맞아도 꼬임쌍이 잘못된 split pair는 남을 수 있음','쌍 검출 지원 여부와 전송 성능은 시험기 사양에 따라 확인합니다.');
b+=t(28,545,'의도한 크로스 결선은 해당 와이어맵을 기준으로 판정합니다.',20,C.muted);
save('cable-tester','시험기 결과를 핀 번호로 읽기','다이렉트 결선의 정상 1대1 연결, 3번 단선, 1번과 2번의 뒤바뀜을 비교한다. 단순 도통만으로 split pair와 전송 성능을 모두 확인할 수는 없다. 의도한 크로스 결선은 그 와이어맵과 비교한다.',b,580);

b=t(28,87,'서버 192.168.50.18/29',28,C.green,700)+t(28,124,'마스크 255.255.255.248 · 호스트 부분 3비트',22,C.muted);
b+=r(28,152,704,70,C.pale)+t(380,196,'192.168.50.16 ~ 192.168.50.23',27,C.navy,700,'middle');
const roles=['네트워크','GW','서버','DNS','호스트','호스트','호스트','브로드'];
for(let i=0;i<8;i++){const x=28+i*88;b+=r(x,256,82,116,(i===0||i===7)?'#edf1f3':C.pale)+t(x+41,296,`.${16+i}`,27,C.navy,700,'middle')+t(x+41,330,roles[i],18,C.ink,400,'middle')+(i===7?t(x+41,354,'캐스트',18,C.ink,400,'middle'):'');}
b+=line(121,390,640,390)+t(380,427,'호스트: .17 ~ .22 · GW = 기본 게이트웨이',21,C.green,600,'middle');
b+=note(452,'전체 8개 − 양 끝의 2개 = 호스트 주소 6개');
save('lab-ipv4','/29 블록에서 각 주소의 역할','서버 192.168.50.18/29의 네트워크 주소는 .16, 브로드캐스트는 .23, 호스트는 .17에서 .22까지이다. .17은 게이트웨이, .18은 서버, .19는 DNS로 지정한다.',b);

b=t(28,84,'범위 AI-LAB · 192.168.100.1 ~ 192.168.100.126',23,C.green,700)+t(28,121,'/25 → 255.255.255.128 · 범위 양 끝을 포함하여 계산',21,C.muted);
b+=r(28,156,704,85,C.soft)+t(380,190,'구성한 주소 풀',21,C.navy,600,'middle')+t(380,222,'.1 ~ .126 : 126개',25,C.navy,700,'middle');
b+=a(205,245,205,279)+a(520,245,520,279);
b+=r(28,292,260,112,C.rose)+t(158,329,'배포 제외',22,C.red,700,'middle')+t(158,368,'.1 ~ .10 : 10개',25,C.red,600,'middle');
b+=r(308,292,424,112,C.pale)+t(520,329,'제외 후 후보',22,C.green,700,'middle')+t(520,368,'.11 ~ .126 : 116개',25,C.green,700,'middle');
b+=note(429,'126 − 10 = 116개 · 임대 기간 0일 6시간 0분','이번 과제는 비활성 범위입니다. 후보 주소 수는 실제 임대 수가 아닙니다.');
save('lab-dhcp','주소 풀에서 제외 범위를 빼기','AI-LAB 주소 풀 .1에서 .126의 126개 중 .1에서 .10까지 10개를 제외한다. 후보는 .11에서 .126까지 116개이다. 임대 기간 0일 6시간 0분이며 이번 범위는 비활성 상태이다.',b);

b=t(28,83,'정방향 조회 영역: lab.example',23,C.muted);
for(const [y,label,value,color]of [[117,'별칭 이름','www.lab.example',C.green],[247,'정규 호스트 이름','web01.lab.example',C.navy],[377,'IPv4 주소','192.168.60.20',C.blue]]){b+=r(28,y,454,88,C.soft)+t(50,y+30,label,19,C.muted)+t(50,y+67,value,28,color,700);}
b+=a(255,211,255,241)+a(255,341,255,371)+t(284,235,'CNAME',21,C.green,700)+t(284,365,'A',21,C.blue,700);
b+=r(506,117,226,348,C.pale)+t(619,156,'조회할 DNS 서버',20,C.navy,600,'middle')+t(619,195,'192.168.60.2',22,C.green,700,'middle')+t(526,250,'레코드의 IP와',21)+t(526,280,'DNS 서버의 IP를',21)+t(526,310,'구분하세요.',21)+t(526,372,'CNAME 대상은',20,C.muted)+t(526,402,'IP가 아닌 이름',20,C.navy,700);
b+=t(28,507,'이름 사이의 참조 관계입니다. 실제 응답 성공을 나타내는 그림은 아닙니다.',18,C.muted);
save('lab-dns','CNAME에서 A 레코드로 이어지는 관계','www.lab.example 별칭이 CNAME으로 web01.lab.example를 가리키고, 그 호스트의 A 레코드가 192.168.60.20을 가리킨다. 조회할 DNS 서버 주소 192.168.60.2는 레코드 주소와 별개이다.',b);

b=t(28,84,'값을 환산한 뒤 입력 칸 옆의 단위도 함께 선택',22,C.muted);
const soa=[['Refresh','새로 고침','3600초','60분'],['Retry','다시 시도','900초','15분'],['Expire','만료','86400초','1일'],['MINIMUM','부정 응답 캐싱 관련','600초','10분']];
soa.forEach((q,i)=>{const y=110+i*77;b+=r(28,y,704,67,i%2?C.soft:C.pale)+t(45,y+28,q[0],21,C.navy,700)+t(45,y+53,q[1],18,C.muted)+t(365,y+42,q[2],24,C.ink,600,'middle')+a(440,y+34,508,y+34)+t(617,y+42,q[3],26,C.green,700,'middle');});
b+=r(28,431,704,65,'#edf1f3')+t(45,458,'SOA 레코드 자체의 TTL: 3600초 = 1시간',22,C.navy,700)+t(45,484,'MINIMUM과 별도 항목이며, 모든 레코드의 TTL을 뜻하지 않습니다.',18,C.muted);
save('lab-soa','SOA 시간: 숫자와 단위를 한 쌍으로','Refresh 3600초는 60분, Retry 900초는 15분, Expire 86400초는 1일, MINIMUM 600초는 10분이다. SOA 레코드 자체의 TTL 3600초는 별도 항목이다.',b);

b=t(28,82,'프롬프트의 괄호와 # 기호로 현재 모드를 확인',21,C.muted);
const modes=[[28,110,180,'Router>','사용자 EXEC'],[270,110,204,'Router#','특권 EXEC'],[534,110,198,'Router(config)#','전역 설정']];
for(const[x,y,w,p,l]of modes)b+=r(x,y,w,88,C.pale)+t(x+w/2,y+33,p,p.length>12?19:23,C.navy,700,'middle')+t(x+w/2,y+64,l,20,C.muted,400,'middle');
b+=a(213,153,261,153)+t(237,135,'enable',18,C.green,600,'middle')+a(480,153,527,153)+t(505,221,'configure terminal',18,C.green,600,'middle');
b+=t(28,250,'전역 설정 예: hostname LAB-R1',21,C.navy,600)+line(633,205,633,279)+line(230,279,633,279)+a(230,279,230,306)+a(591,279,591,306);
b+=r(28,317,333,83)+t(195,350,'Router(config-if)#',23,C.navy,700,'middle')+t(195,380,'interface FastEthernet0/0',18,C.green,600,'middle');
b+=r(382,317,350,83)+t(557,350,'Router(config-line)#',23,C.navy,700,'middle')+t(557,380,'line console 0 / line vty 0 4',18,C.green,600,'middle');
b+=t(28,437,'各 설정 모드에서 end → 특권 EXEC(#)로 복귀'.replace('各','각'),21,C.muted);
b+=note(461,'Router# copy running-config startup-config','현재 실행 설정 → 시작 설정으로 복사합니다.');
save('router-modes','라우터 모드 이동과 설정 저장','사용자 EXEC에서 enable로 특권 EXEC, configure terminal로 전역 설정에 들어간다. hostname은 전역 설정에서, interface와 line 명령으로 각 하위 설정에 진입한다. end로 특권 EXEC 복귀 후 running-config를 startup-config로 복사한다.',b,580);

b=t(28,83,'R1에서 원격 네트워크로 가는 정적 경로의 의미',22,C.muted);
b+=r(28,132,155,116,C.pale)+t(105,172,'R1',31,C.green,700,'middle')+t(105,218,'10.0.12.1',21,C.navy,600,'middle');
b+=r(327,132,155,116,C.pale)+t(405,172,'R2',31,C.green,700,'middle')+t(405,218,'10.0.12.2',21,C.navy,600,'middle');
b+=a(188,185,318,185)+t(253,151,'10.0.12.0/30',18,C.muted,400,'middle')+t(253,223,'연결망',19,C.muted,400,'middle');
b+=r(571,132,161,116,'#edf1f3')+t(651,170,'목적지 망',23,C.navy,700,'middle')+t(651,210,'192.168.20.0',18,C.blue,600,'middle')+t(651,237,'/24',21,C.blue,700,'middle')+a(488,185,561,185);
b+=t(28,300,'R1(config)#',22,C.navy,700)+r(28,318,704,68,C.soft)+t(45,361,'ip route',21,C.navy,600)+t(158,361,'192.168.20.0',21,C.blue,600)+t(370,361,'255.255.255.0',21,C.blue,600)+t(585,361,'10.0.12.2',21,C.green,600);
b+=t(229,420,'목적지',20,C.blue,700,'middle')+t(445,420,'목적지 마스크',20,C.blue,700,'middle')+t(635,420,'다음 홉',20,C.green,700,'middle');
b+=note(446,'다음 홉은 R1 자신이 아닌, 이웃 R2의 연결 주소','구성 개념도입니다. 에뮬레이터의 실제 통신 성공을 뜻하지 않습니다.');
save('router-route','목적지와 다음 홉을 구분하기','R1 10.0.12.1은 연결망 10.0.12.0/30의 이웃 R2 10.0.12.2를 다음 홉으로 삼아 192.168.20.0/24로 가는 정적 경로를 설정한다. 구성 개념이며 통신 검증 결과가 아니다.',b,580);

b=t(28,85,'128.148.210.12/18',29,C.green,700)+t(28,122,'마스크 255.255.192.0 · 셋째 옥텟에 경계',21,C.muted);
const bits=[['주소의 210','11010010'],['마스크 192','11000000'],['AND 결과 192','11000000']];
bits.forEach((q,i)=>{const y=170+i*66;b+=t(28,y+29,q[0],22,C.navy,i===2?700:400);for(let k=0;k<8;k++){const x=282+k*53;b+=r(x,y,46,44,k<2?C.pale:C.soft)+t(x+23,y+31,q[1][k],25,k<2?C.green:C.muted,600,'middle');}});
b+=t(328,158,'망',18,C.green,600,'middle')+t(558,158,'호스트',18,C.muted,600,'middle');
b+=r(28,378,704,64,C.pale)+t(380,420,'네트워크 주소 = 128.148.192.0',27,C.navy,700,'middle');
b+=t(28,480,'호스트 부분 14비트 → 전체 주소 2¹⁴ = 16384개',23,C.green,700)+t(28,521,'셋째 옥텟의 증분 64를 전체 주소 수로 읽지 않습니다.',20,C.muted);
save('subnet-18','/18: 비트 AND로 네트워크 주소 찾기','128.148.210.12/18의 셋째 옥텟 210은 11010010, 마스크 192는 11000000이다. AND 결과 192이고 호스트 부분을 0으로 만들면 네트워크 주소는 128.148.192.0이다. 호스트 14비트이므로 전체 주소는 16384개이다.',b,580);

b=t(28,86,'172.16.0.0/16 → 같은 크기의 /19 블록',26,C.green,700)+t(28,126,'추가한 네트워크 비트: 19 − 16 = 3비트',23,C.navy,600);
b+=r(28,152,704,57,C.pale)+t(380,190,'블록 수 2³ = 8개',27,C.navy,700,'middle');
for(let i=0;i<8;i++){const x=28+(i%4)*180,y=238+Math.floor(i/4)*110; b+=r(x,y,164,91)+t(x+82,y+31,`${i+1}번 블록`,18,C.muted,400,'middle')+t(x+82,y+61,`172.16.${i*32}.0`,19,C.navy,600,'middle')+t(x+82,y+84,'/19',18,C.green,600,'middle');}
b+=note(468,'각 /19 블록의 전체 주소: 2¹³ = 8192개','셋째 옥텟의 시작값은 0, 32, 64, …, 224입니다.');
save('subnet-split','/16을 /19로 나누면 몇 블록일까?','172.16.0.0/16을 /19로 나누면 3비트를 더 사용하므로 8개 블록이다. 셋째 옥텟 시작값은 0,32,64,96,128,160,192,224이며 각 블록의 전체 주소는 8192개이다.',b,580);

b=t(28,82,'주소 길이 128비트 · 수신 대상을 기준으로 구분',22,C.muted);
for(const [i,label,detail]of [[0,'유니캐스트','특정 인터페이스 하나'],[1,'애니캐스트','그룹 중 경로상 가까운 하나'],[2,'멀티캐스트','그룹에 속한 모든 대상']]){
 const y=112+i*110;b+=r(28,y,704,98,i===1?C.pale:C.soft)+t(45,y+31,label,23,C.navy,700)+t(45,y+63,detail,i===1?18:20,C.muted);
 b+=r(360,y+32,50,34,'#fff')+t(385,y+56,'송신',18,C.navy,400,'middle');
 for(let j=0;j<3;j++){const cy=y+18+j*31;b+=r(637,cy-9,65,27,(i===0&&j===0)||(i===1&&j===1)||i===2?C.green:'#fff')+t(669,cy+11,`대상 ${j+1}`,18,((i===0&&j===0)||(i===1&&j===1)||i===2)?'#fff':C.muted,400,'middle'); if((i===0&&j===0)||(i===1&&j===1)||i===2)b+=a(416,y+49,628,cy+4); else if(i===1)b+=line(416,y+49,628,cy+4,C.line,2,'4 5');}
}
b+=note(456,'IPv6에는 브로드캐스트 주소가 없습니다.','애니캐스트의 “가까움”은 지리적 거리가 아닌 라우팅 기준입니다.');
save('ipv6-types','IPv6 주소 유형: 하나 · 가까운 하나 · 모두','유니캐스트는 하나의 인터페이스, 애니캐스트는 그룹 중 라우팅 거리상 가장 가까운 하나, 멀티캐스트는 그룹의 모든 대상으로 전달한다. IPv6 주소는 128비트이며 브로드캐스트 주소는 없다.',b,580);

b=t(28,82,'같은 저장 공간을 서로 다른 기준으로 살펴봅니다.',22,C.muted);
b+=r(28,111,330,302,C.pale)+r(382,111,350,302,C.soft)+t(50,151,'df: 파일시스템',26,C.green,700)+t(404,151,'du: 파일·디렉터리',26,C.navy,700);
b+=r(65,185,256,84,'#fff')+r(65,185,164,84,C.green)+t(146,234,'사용 중',24,'#fff',700,'middle')+t(276,234,'가용',22,C.navy,600,'middle')+t(50,312,'마운트된 파일시스템의',22)+t(50,346,'공간 정보를 확인',22)+t(50,383,'전체 공간 관점',20,C.green,600);
b+=t(410,202,'project/',24,C.navy,700)+line(423,215,423,318,C.muted,2)+line(423,243,457,243,C.muted,2)+line(423,292,457,292,C.muted,2)+t(468,250,'data.csv',22)+t(468,300,'images/',22)+t(404,346,'파일과 하위 디렉터리의',22)+t(404,383,'사용량을 집계',22,C.navy,600);
b+=note(439,'df와 du 출력이 항상 같은 값일 필요는 없습니다.','이 그림은 관점 비교이며 실제 명령 실행 결과 화면은 아닙니다.');
save('linux-storage','df와 du가 바라보는 범위','df는 마운트된 파일시스템 단위의 공간 정보를 보여 준다. du는 파일과 디렉터리 트리의 공간 사용량을 집계한다. 서로 다른 관점이므로 출력이 반드시 같지 않다.',b);

b=t(28,82,'파일에 저장된 정보와 실제 서비스 동작은 별개',22,C.muted);
b+=r(28,111,704,136,C.pale)+t(48,148,'/etc/services',27,C.green,700)+t(48,186,'서비스 이름 ↔ 포트 번호 / 전송 프로토콜',24,C.navy,600)+t(48,222,'예: ssh  22/tcp  ·  항목 존재 ≠ 서비스 실행 중',21,C.muted);
b+=r(28,277,322,146,C.soft)+t(48,317,'/etc/passwd',26,C.navy,700)+t(48,354,'로그인 계정 정보',23)+t(48,392,'shadow 방식의 암호 칸: x',18,C.muted);
b+=a(358,347,398,347)+r(410,277,322,146,C.soft)+t(430,317,'/etc/shadow',26,C.navy,700)+t(430,354,'암호 해시 등',23)+t(430,392,'접근 권한이 제한된 파일',19,C.muted);
b+=note(449,'/etc/passwd의 역할을 “암호 해시 저장”으로 외우지 않기');
save('linux-files','Linux 설정 파일의 역할 구분','/etc/services는 서비스 이름과 포트 및 프로토콜을 대응시킨다. 등록 항목이 있어도 서비스 실행 중을 뜻하지 않는다. shadow 방식에서 /etc/passwd는 계정 정보를, /etc/shadow는 암호 해시 등을 보관한다.',b);
console.log(`Wrote 13 practical SVG diagrams to ${out}`);
