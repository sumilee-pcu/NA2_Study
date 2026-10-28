import { LAB_VERIFICATION, LAB_VERIFICATION_REPORT } from './content/lab-verification.mjs';
import './lab-verification.css';

function Observation({ value }) {
  return <><strong className={`lab-verification-status is-${value.state}`}>{value.label}</strong>{value.detail && <p>{value.detail}</p>}</>;
}

export default function LabVerification() {
  const { date, title, summary, boundary, environments, rows, limitations } = LAB_VERIFICATION;
  return <article className="lab-verification">
    <div className="labs-breadcrumb"><a href="#/practical/lab">← 실습 자료 목록</a><span>검증 기준일 · <time dateTime={date}>{date}</time></span></div>
    <header className="hub-page-title"><span className="hub-eyebrow">실습 자료 / 검증 결과</span><h1>{title}</h1><p>{summary}</p></header>
    <section className="lab-verification-environments" aria-label="검증 환경">{environments.map(environment => <div key={environment.title}><h2>{environment.title}</h2><p>{environment.description}</p></div>)}</section>
    <p className="lab-verification-boundary" id="lab-verification-boundary">{boundary}</p>
    <table className="lab-verification-table" aria-describedby="lab-verification-boundary" role="table">
      <caption>환경별 확인 범위와 남은 한계</caption>
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">과제</th><th scope="col" role="columnheader">ICQA 에뮬레이터·데모</th><th scope="col" role="columnheader">Packet Tracer</th><th scope="col" role="columnheader">남은 한계</th></tr></thead>
      <tbody role="rowgroup">{rows.map((row, index) => <tr key={row.labId} role="row">
        <th scope="row" role="rowheader"><span className="lab-verification-number">{String(index + 1).padStart(2, '0')}</span><a href={`#/practical/lab/${row.labId}`}>{row.title}<span className="hub-sr-only"> 과제 열기</span></a></th>
        <td role="cell"><span className="lab-verification-mobile-label" aria-hidden="true">ICQA 에뮬레이터·데모</span><Observation value={row.icqa}/></td>
        <td role="cell"><span className="lab-verification-mobile-label" aria-hidden="true">Packet Tracer</span><Observation value={row.packetTracer}/></td>
        <td className="lab-verification-limit" role="cell"><span className="lab-verification-mobile-label" aria-hidden="true">남은 한계</span><p>{row.limit}</p></td>
      </tr>)}</tbody>
    </table>
    <section className="lab-verification-common" aria-labelledby="lab-verification-limit-title"><h2 id="lab-verification-limit-title">공통 한계</h2><dl>{limitations.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.detail}</dd></div>)}</dl></section>
    <footer className="lab-verification-footer"><p>개별 과제의 출처와 검토 범위에서 실행 결과를 확인할 수 있습니다. 상세 기록에는 실행 조건·화면 증거 목록·측정 오차를 구분해 두었습니다.</p><a href={LAB_VERIFICATION_REPORT} target="_blank" rel="noopener noreferrer">상세 검증 기록 (GitHub)<span aria-hidden="true"> ↗</span><span className="hub-sr-only"> (새 탭)</span></a><div className="labs-bottom"><a className="hub-button" href="#/practical/lab">실습 자료 목록</a></div></footer>
  </article>;
}
