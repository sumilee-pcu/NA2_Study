import { mkdirSync, writeFileSync } from 'node:fs';
import { STANDARDS, WIRES } from '../src/modules/cabling/content.mjs';

// These are original instructional vectors, generated from the same reviewed
// pin data used by the practice module. No source-slide bitmap is republished.
const output = new URL('../src/assets/theory/', import.meta.url);
mkdirSync(output, { recursive: true });
const text = (x, y, value, size = 22, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${value}</text>`;
const start = (title, desc, height = 520) => `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="${height}" viewBox="0 0 760 ${height}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${desc}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#087a61" stroke-width="1.5"/></marker>${Object.values(WIRES).filter(w => w.striped).map(w => `<pattern id="${w.id}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="white"/><rect width="5" height="12" fill="${w.color}"/></pattern>`).join('')}</defs><rect width="760" height="${height}" rx="12" fill="#fff"/><g font-family="Malgun Gothic,system-ui,sans-serif" fill="#192d33">${text(28, 40, title, 27, 'font-weight="700"')}`;
const end = '</g></svg>\n';
function save(name, svg) { writeFileSync(new URL(name, output), svg + end); }

let orientation = start('접점 면을 보고 1번부터 읽기', '금속 접점 면이 앞, 클립은 뒤, 케이블은 아래인 관찰 기준. 접점 번호는 왼쪽부터 1에서 8이다.');
orientation += text(28, 76, '8P8C 플러그 · 일반적으로 RJ-45라고 부르는 형태', 21);
orientation += '<rect x="96" y="144" width="300" height="230" rx="18" fill="#edf6f2" stroke="#103b37" stroke-width="3"/><path d="M122 374V400H370V374" fill="#edf6f2" stroke="#103b37" stroke-width="3"/><path d="M214 400V472H278V400" fill="#dce4df" stroke="#103b37" stroke-width="3"/>';
orientation += '<path d="M220 205H272V338L260 361H232L220 338Z" fill="none" stroke="#687779" stroke-width="2" stroke-dasharray="7 5"/>';
for (let i = 0; i < 8; i++) {
  const x = 115 + i * 34;
  orientation += `<g data-pin="${i + 1}">${text(x + 11, 129, i + 1, 23, 'text-anchor="middle" font-weight="700"')}<rect x="${x}" y="149" width="22" height="65" rx="3" fill="#c99127" stroke="#785615"/><path d="M${x + 11} 219V329" stroke="#b4c8be" stroke-width="4"/></g>`;
}
orientation += '<path d="M133 97H376" fill="none" stroke="#087a61" stroke-width="2" marker-end="url(#arrow)"/>';
orientation += '<path d="M396 177H440" stroke="#087a61" stroke-width="2"/><path d="M272 289H440" stroke="#687779" stroke-width="2" stroke-dasharray="6 5"/><path d="M278 438H440" stroke="#087a61" stroke-width="2"/>';
orientation += text(458, 170, '금속 접점이 보이는 면', 22, 'font-weight="700"') + text(458, 201, '접점이 있는 끝은 위쪽', 20);
orientation += text(458, 284, '고정 클립은 뒷면', 22, 'font-weight="700"') + text(458, 316, '점선 = 반대쪽의 위치', 20);
orientation += text(458, 435, '케이블은 아래쪽', 22, 'font-weight="700"');
orientation += text(28, 505, '관찰 방향을 바꾸면 화면의 좌우만으로 핀 번호를 판단하지 않습니다.', 20);
save('cabling-orientation.svg', orientation);

let pinout = start('T568A와 T568B의 핀 배열', 'T568A: 흰초 초 흰주 파 흰파 주 흰갈 갈. T568B: 흰주 주 흰초 파 흰파 초 흰갈 갈. 두 배열에서 주황 쌍과 초록 쌍이 바뀐다.');
pinout += text(28, 76, '접점 면이 앞 · 클립은 뒤 · 케이블은 아래', 21);
Object.entries(STANDARDS).forEach(([name, wires], row) => {
  const y = 117 + row * 177;
  pinout += text(28, y + 63, name, 23, 'font-weight="700"');
  wires.forEach((id, i) => {
    const w = WIRES[id], x = 165 + i * 70;
    pinout += `<g data-standard="${name}" data-pin="${i + 1}" data-wire="${id}"><title>${i + 1}번 ${w.label}</title>${text(x + 16, y, i + 1, 22, 'text-anchor="middle"')}<rect x="${x}" y="${y + 12}" width="32" height="84" rx="4" fill="${w.striped ? `url(#${id})` : w.color}" stroke="#687779"/><rect x="${x}" y="${y + 12}" width="32" height="10" fill="#c99127"/>${text(x + 16, y + 125, w.short, 21, 'text-anchor="middle" font-weight="700"')}</g>`;
  });
});
pinout += '<rect x="28" y="450" width="704" height="49" rx="8" fill="#edf6f2"/>';
pinout += text(43, 481, '변경: 주황·초록 쌍     공통: 파랑 4·5번 / 갈색 7·8번', 21);
save('cabling-t568.svg', pinout);

let map = start('직결과 두 쌍 교차의 연결 관계', '직결은 같은 핀끼리 연결한다. T568A와 T568B의 두 쌍 교차는 1-3, 2-6, 3-1, 6-2이며 4,5,7,8번은 같은 핀끼리 연결한다.', 560);
map += text(28, 78, '선의 교차점은 접속점이 아닙니다. 양 끝의 번호를 따라갑니다.', 20);
[['직결 · A–A 또는 B–B', [1,2,3,4,5,6,7,8]], ['두 쌍 교차 · A–B', [3,6,1,4,5,2,7,8]]].forEach(([title, targets], panel) => {
  const offset = panel * 370;
  map += `<rect x="${24 + offset}" y="102" width="342" height="343" rx="10" fill="#f3f7f4" stroke="#dce4df"/>` + text(42 + offset, 137, title, 22, 'font-weight="700"');
  map += text(65 + offset, 172, '끝 1', 18) + text(279 + offset, 172, '끝 2', 18);
  targets.forEach((target, i) => {
    const pin = i + 1, y1 = 199 + i * 31, y2 = 199 + (target - 1) * 31;
    const color = pin === target ? '#687779' : pin === 1 || pin === 3 ? '#087a61' : '#a75a16';
    map += `<g data-map="${panel ? 'crossover' : 'straight'}" data-from="${pin}" data-to="${target}"><path d="M${102 + offset} ${y1}L${275 + offset} ${y2}" fill="none" stroke="${color}" stroke-width="${pin === target ? 2 : 3}" ${pin === target && panel ? 'stroke-dasharray="5 5"' : ''}/>${text(77 + offset, y1 + 7, pin, 21, 'text-anchor="middle"')}${text(299 + offset, y1 + 7, pin, 21, 'text-anchor="middle"')}</g>`;
  });
});
map += text(28, 482, '두 쌍 교차: 1 ↔ 3, 2 ↔ 6  /  10BASE-T·100BASE-TX 기준', 21, 'font-weight="700"');
map += text(28, 515, '1000BASE-T는 네 쌍을 사용합니다. 포트의 Auto-MDI-X 지원도 확인합니다.', 19);
map += text(28, 545, '배열 확인 후에는 시험기로 단선·접촉·압착 상태를 별도로 점검합니다.', 19);
save('cabling-wiremap.svg', map);
console.log('Created 3 cabling SVG figures from reviewed practice data.');
