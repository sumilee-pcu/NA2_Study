import { PRACTICAL_AREAS, practicalSection } from './content/practical.mjs';
import { PracticalFigures } from './PracticalFigures.jsx';

function Title({ number, title, children }) {
  return <header className="hub-page-title hub-practical-title"><span className="hub-eyebrow">실기 학습 {number && ` / ${number}`}</span><h1>{title}</h1><p>{children}</p></header>;
}
function AreaIcon({ id }) {
  const drawing = id === 'work'
    ? <><path d="M7 3v5m10-5v5M5 8h14v5a7 7 0 0 1-14 0ZM12 20v3"/><path d="M8 12h8"/></>
    : id === 'lab'
      ? <><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4m-5-10 3 3-3 3m6 0h4"/></>
      : <><rect x="5" y="3" width="14" height="19" rx="2"/><path d="m8 9 1 1 2-2m2 1h3m-8 6 1 1 2-2m2 1h3"/></>;
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>;
}
function Home() {
  return <>
    <Title title="실기시험 3영역">작업형은 직접 만들고, 실습형은 설정하고, 단답형/객관식은 개념을 구분하는 연습입니다.</Title>
    <section className="hub-practical-grid" aria-label="실기 세 영역">
      {PRACTICAL_AREAS.map(area => <article className="hub-practical-card" key={area.id}>
        <div className="hub-practical-card-top"><span className="hub-course-icon"><AreaIcon id={area.id}/></span><span className="hub-practical-number">{area.number}</span></div>
        <h2>{area.title}</h2><p className="hub-practical-subtitle">{area.subtitle}</p><p>{area.description}</p>
        <ul className="hub-practical-tags">{area.subjects.map(subject => <li key={subject}>{subject}</li>)}</ul>
        <div className="hub-practical-card-bottom"><span className="hub-availability">{area.status}</span><a className="hub-button" href={`#${area.path}`}>{area.action}<span aria-hidden="true">→</span></a></div>
      </article>)}
    </section>
    <section className="hub-practical-next"><div><h2>케이블링 연습</h2><p>기존 핀별 복습, 배열 교정과 학습 기록을 그대로 이용하세요.</p></div><a className="hub-button primary" href="#/cabling">케이블링 연습 시작</a></section>
    <p className="hub-inline-note">이 학습센터는 시험 준비를 돕는 보조 도구입니다. 실제 시험의 출제 범위와 응시 안내는 해당 회차의 공식 공지를 확인하세요.</p>
  </>;
}
function Work() {
  return <>
    <Title number="01" title="작업형 · 케이블 제작·결선">화면에서 배열을 익힌 뒤, 실제 케이블과 공구로 제작하고 시험기로 연결 상태를 확인하세요.</Title>
    <div className="hub-practical-detail-grid"><section className="hub-panel"><h2>케이블 제작 절차</h2><ol className="hub-guide-steps">
      <li>문제에서 요구한 다이렉트 또는 크로스 결선을 확인합니다.</li>
      <li>커넥터를 보는 방향과 핀 번호를 확인하고, 양 끝에 적용할 배열을 정합니다.</li>
      <li>사용하는 공구·플러그의 설명에 따라 케이블을 준비하고 도체를 배열합니다.</li>
      <li>도체의 삽입 상태와 배열을 확인한 뒤 커넥터를 압착합니다.</li>
      <li>케이블 시험기로 와이어맵·단선·단락 등 지원하는 항목을 확인합니다.</li>
    </ol><a className="hub-button primary" href="#/cabling">케이블링 연습 시작</a></section>
    <aside className="hub-panel"><h2>관련 학습</h2><div className="hub-practical-links">
      <a href="#/learn/theory/cabling-orientation">커넥터 관찰 방향과 핀 번호<span aria-hidden="true">→</span></a>
      <a href="#/learn/theory/cabling-t568">T568A·T568B와 결선 원리<span aria-hidden="true">→</span></a>
      <a href="#/cabling/pins">핀별 복습<span aria-hidden="true">→</span></a>
      <a href="#/cabling/correction">틀린 배열 교정<span aria-hidden="true">→</span></a>
      <a href="#/learn/tools">케이블 제작 준비물<span aria-hidden="true">→</span></a>
    </div></aside></div>
    <section className="practical-visuals" aria-label="케이블 제작과 판별 도해"><h2>압착 전과 시험기 연결 후, 무엇을 볼까요?</h2><PracticalFigures ids={['cable-quality', 'cable-tester']}/></section>
    <p className="hub-inline-note">화면에서 배열을 맞힌 것과 실물 케이블의 제작 품질은 별도로 확인합니다. 단순 도통 시험기의 결과만으로 모든 전송 성능이 검증되는 것은 아닙니다.</p>
  </>;
}
export default function PracticalPage({ path }) {
  const section = practicalSection(path);
  if (section === 'home') return <Home/>;
  if (section === 'work') return <Work/>;
  return <div className="hub-empty"><h1>실기 페이지 없음</h1><a className="hub-button" href="#/practical">실기 홈으로</a></div>;
}
