import { useEffect, useRef, useState } from 'react';
import { LABS, LAB_GROUPS, labFromPath } from './content/practical-labs.mjs';
import { PRACTICAL_SOURCES } from './content/practical.mjs';
import { TOPICS } from './content/learning.mjs';
import { LAB_STORAGE_KEY, loadLabState, persistLabState, updateLabEntry, freshLabEntry, gradeLab, completedLabs } from './practical-lab-model.mjs';
import './practical-labs.css';
import { LabFigures } from './PracticalFigures.jsx';
import LabVerification from './LabVerification.jsx';
import { LAB_VERIFICATION_PATH } from './content/lab-verification.mjs';

const storage = () => { try { return window.localStorage; } catch { return { getItem() { throw new Error('브라우저 저장소 접근이 제한되어 있습니다.'); } }; } };
const labHref = lab => `#/practical/lab/${lab.id}`;
function External({ source, children }) {
  return <a href={source.url} target="_blank" rel="noopener noreferrer">{children || source.title}<span aria-hidden="true"> ↗</span><span className="hub-sr-only"> (새 탭)</span></a>;
}
function backup(state) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `NA2-study-실습자료-${new Date().toLocaleDateString('sv-SE')}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Commands({ commands }) {
  return commands?.length ? <pre className="labs-commands" tabIndex={0} aria-label="입력 명령"><code>{commands.join('\n')}</code></pre> : null;
}
function Index({ state }) {
  const completed = completedLabs(state).length;
  return <>
    <header className="hub-page-title"><span className="hub-eyebrow">실기 학습 / 02</span><h1>Windows·라우터 실습 자료</h1><p>조건을 읽고 설정값을 점검한 뒤, 공식 실습 프로그램에서 직접 수행하세요.</p></header>
    <div className="labs-intro"><div><strong>출제 OS · Windows Server 2022</strong><p>2025년 8월 1일부터 적용되며, 실기 에뮬레이터는 기존 방식을 사용합니다. <External source={PRACTICAL_SOURCES.examStandard}>공식 변경 안내</External></p></div><div className="labs-progress"><span>입력값 확인</span><b>{completed}<small> / {LABS.length}</small></b><progress value={completed} max={LABS.length} aria-label="실습 자료 입력값 확인 완료"/></div></div>
    <p className="labs-boundary">이곳의 점검 결과는 설정값을 이해했는지 확인하는 학습 기록입니다. 실제 프로그램의 실행 결과와 시험 점수는 별도로 확인합니다.</p>
    <section className="labs-verification-entry" aria-label="실습 자료 검증 결과"><div><h2>실습 자료 검증 결과</h2><p>ICQA와 Packet Tracer에서 확인한 내용과 남은 한계를 비교합니다.</p></div><a className="hub-button" href={`#${LAB_VERIFICATION_PATH}`}>8개 과제 최종 검증표 <span aria-hidden="true">→</span></a></section>
    {LAB_GROUPS.map(group => <section className="labs-group" key={group.id} aria-labelledby={`labs-group-${group.id}`}>
      <div className="labs-group-title"><div><h2 id={`labs-group-${group.id}`}>{group.title}</h2><p>{group.description}</p></div><span>{LABS.filter(lab => lab.group === group.id).length}개 과제</span></div>
      <div className="labs-grid">{LABS.filter(lab => lab.group === group.id).map((lab, i) => {
        const entry = state.entries[lab.id];
        const passed = entry?.checked && gradeLab(lab, entry.answers).passed;
        return <a className="labs-card" key={lab.id} href={labHref(lab)}><div className="labs-card-top"><span className="labs-number">0{i + 1}</span><span className={`labs-badge ${passed ? 'is-done' : ''}`}>{passed ? (entry.usedSolution ? '해설 참고 후 확인' : '입력값 확인 완료') : entry ? '학습 중' : `약 ${lab.minutes}분`}</span></div><h3>{lab.title}</h3><p>{lab.summary}</p><span className="labs-card-action">과제 열기 <span aria-hidden="true">→</span></span></a>;
      })}</div>
    </section>)}
    <section className="hub-panel labs-official"><h2>공식 프로그램에서 이어서 실습</h2><p>실습용 프로그램에서 개별 설정을 연습하고, 모의고사 예제로 문제 이동과 제출 절차를 확인하세요. 실행 조건은 각 안내를 따릅니다.</p><div className="labs-official-links"><External source={PRACTICAL_SOURCES.windows64}/><External source={PRACTICAL_SOURCES.router}/><External source={PRACTICAL_SOURCES.mock64}/></div></section>
    <p className="labs-boundary">입력값과 확인 결과는 이 브라우저에 저장됩니다. 기존 필기·케이블링·단답형 학습 기록과 별도로 관리합니다.</p>
  </>;
}
function Field({ check, value, result, onChange }) {
  const inputId = `lab-input-${check.id}`;
  const helpId = `${inputId}-help`;
  const feedbackId = `${inputId}-feedback`;
  const props = { id: inputId, value, onChange: event => onChange(event.target.value), 'aria-describedby': `${helpId}${result ? ` ${feedbackId}` : ''}`, 'aria-invalid': result && !result.correct ? true : undefined };
  const expectedLabel = check.options?.find(option => option.value === check.expected)?.label || check.expected;
  return <div className={`labs-field ${result ? result.correct ? 'is-correct' : 'needs-review' : ''}`}>
    <label htmlFor={inputId}>{check.label}</label>
    {check.kind === 'choice' ? <select {...props}><option value="">선택하세요</option>{check.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input {...props} type="text" maxLength={240} autoComplete="off" spellCheck={false} inputMode={check.kind === 'integer' ? 'numeric' : 'text'}/>}
    <small id={helpId}>{check.hint || (check.kind === 'mask' ? '서브넷마스크 또는 /접두 길이로 입력하세요.' : check.kind === 'dns-name' ? '대소문자와 맨 끝의 점은 구분하지 않습니다.' : check.kind === 'integer' ? '단위를 제외한 정수를 입력하세요.' : '문제 조건에 맞는 값을 입력하세요.')}</small>
    {result && <div className="labs-field-feedback" id={feedbackId}><b>{result.correct ? '일치합니다.' : result.blank ? '입력이 필요합니다.' : '다시 확인하세요.'}</b>{!result.correct && <span> 기준값: <code>{expectedLabel}</code></span>}<p>{check.explanation}</p></div>}
  </div>;
}
function Detail({ lab, entry, change }) {
  const [solutionOpen, setSolutionOpen] = useState(false);
  const summaryRef = useRef(null);
  const result = entry.checked ? gradeLab(lab, entry.answers) : null;
  const nextLab = LABS[LABS.indexOf(lab) + 1];
  const openSolution = () => { setSolutionOpen(open => !open); if (!solutionOpen) change(current => ({ ...current, usedSolution: true })); };
  const submit = event => { event.preventDefault(); change(current => ({ ...current, checked: true, usedSolution: current.usedSolution || !gradeLab(lab, current.answers).passed })); requestAnimationFrame(() => summaryRef.current?.focus()); };
  return <article className="labs-detail">
    <div className="labs-breadcrumb"><a href="#/practical/lab">← 실습 자료 목록</a><span>{lab.group === 'windows' ? 'Windows Server' : '라우터'} · 약 {lab.minutes}분</span></div>
    <header className="hub-page-title"><span className="hub-eyebrow">설정 연습</span><h1>{lab.title}</h1><p>{lab.summary}</p></header>
    <div className="labs-layout"><div className="labs-main">
      <section className="hub-panel labs-task"><span className="hub-tag">문제 조건</span><h2>설정할 내용</h2><p>{lab.scenario}</p><dl>{lab.requirements.map((item, i) => <div key={i}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
      <section className="labs-section"><h2>설정 절차</h2><ol className="labs-steps">{lab.steps.map((step, i) => <li key={i}><h3>{step.title}</h3><p>{step.body}</p><Commands commands={step.commands}/>{step.check && <p className="labs-step-check"><b>확인</b> {step.check}</p>}</li>)}</ol></section>
      <section className="labs-section labs-practice" aria-labelledby="labs-check-title"><h2 id="labs-check-title">입력값 점검</h2><p>조건과 절차를 참고해 값을 입력하세요. 답안을 수정하면 이전 판정은 해제됩니다.</p><form onSubmit={submit} noValidate><div className="labs-fields">{lab.checks.map((check, i) => <Field key={check.id} check={check} value={entry.answers[check.id] || ''} result={result?.fields[i]} onChange={value => change(current => ({ ...current, answers: { ...current.answers, [check.id]: value }, checked: false }))}/>)}</div><button className="hub-button primary" type="submit">입력값 확인</button></form>
        {result && <div className={`labs-result ${result.passed ? 'is-passed' : ''}`} role="status" tabIndex={-1} ref={summaryRef}><strong>{result.passed ? '모든 입력값을 확인했습니다.' : `${result.total}개 중 ${result.correct}개가 일치합니다.`}</strong><p>{result.passed ? '이제 공식 프로그램에서 설정하고, 과제의 확인 방법에 따라 실제 결과를 점검하세요.' : '각 항목의 기준값과 풀이를 확인한 뒤 수정해 보세요.'}</p>{entry.usedSolution && <small>해설을 참고한 학습으로 기록됩니다.</small>}</div>}
      </section>
      <section className="labs-section labs-solution"><button type="button" className="labs-disclosure" aria-expanded={solutionOpen} aria-controls="labs-solution-body" onClick={openSolution}>풀이와 확인 방법 <span aria-hidden="true">{solutionOpen ? '−' : '+'}</span></button>{solutionOpen && <div id="labs-solution-body">{lab.solution.map((step, i) => <div className="labs-solution-step" key={i}><h3>{step.title}</h3><p>{step.body}</p><Commands commands={step.commands}/></div>)}<LabFigures labId={lab.id}/></div>}</section>
      <section className="labs-section"><h2>자주 틀리는 부분</h2><div className="labs-pitfalls">{lab.pitfalls.map((item, i) => <div key={i}><h3>{item.title}</h3><p>{item.body}</p></div>)}</div></section>
      <section className="labs-section labs-sources"><h2>출처와 검토 범위</h2><p>검토일: 2026-10-23 · {LAB_GROUPS.find(group => group.id === lab.group).reviewNote}</p><ul>{lab.sources.map((source, i) => <li key={i}><External source={source}/>{source.section && <small>{source.section}</small>}</li>)}</ul><details><summary>교재 참고 위치와 교정 내용</summary><p>『2024 최적합 네트워크관리사 1·2급 필기+실기』 PDF {lab.sourcePages.join(', ')}쪽을 참고했습니다. 쪽수는 표지 포함 PDF 기준입니다.</p><ul>{lab.sourceNotes.map((note, i) => <li key={i}>{note}</li>)}</ul></details></section>
      <a className="labs-verification-detail-link" href={`#${LAB_VERIFICATION_PATH}`}>8개 과제 최종 검증표와 남은 한계 →</a>
      <div className="labs-bottom"><a className="hub-button" href="#/practical/lab">실습 자료 목록</a>{nextLab && <a className="hub-button primary" href={labHref(nextLab)}>다음: {nextLab.title} →</a>}</div>
    </div><aside className="labs-aside"><section className="hub-panel"><h2>학습 목표</h2><ul>{lab.objectives.map((objective, i) => <li key={i}>{objective}</li>)}</ul><h3>실습 환경</h3><p>{lab.environment}</p><External source={lab.group === 'windows' ? PRACTICAL_SOURCES.windows64 : PRACTICAL_SOURCES.router}>공식 실습 도구 안내</External><h3>관련 이론</h3><div className="labs-theory-links">{lab.relatedTheory.map(id => { const topic = TOPICS.find(item => item.id === id); return topic ? <a key={id} href={`#/learn/theory/${id}`}>{topic.title} →</a> : null; })}</div></section></aside></div>
  </article>;
}

export default function PracticalLabs({ path, visible = true }) {
  const [initial] = useState(() => loadLabState(storage()));
  const [state, setState] = useState(initial.state);
  const [canSave, setCanSave] = useState(initial.canSave);
  const [warning, setWarning] = useState(initial.warning);
  const observed = useRef(initial.observed);
  useEffect(() => {
    if (!canSave || state === initial.state) return;
    const result = persistLabState(storage(), state, observed.current);
    if (!result.ok) { setCanSave(false); setWarning(result.warning); }
    else observed.current = result.observed;
  }, [state, canSave, initial]);
  useEffect(() => {
    const changed = event => {
      if ((event.key === LAB_STORAGE_KEY || event.key === null) && event.newValue !== observed.current) {
        setCanSave(false);
        setWarning('다른 탭에서 실습 자료 기록이 바뀌었습니다. 현재 입력을 백업한 뒤 새로고침해 주세요.');
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  useEffect(() => {
    if (canSave || state === initial.state) return;
    const leave = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [canSave, state, initial]);
  const change = (id, action) => setState(current => updateLabEntry(current, id, action(current.entries[id] || freshLabEntry())));
  const lab = labFromPath(path);
  if (!visible) return null;
  return <div className="labs-root">{warning && <div className="labs-warning" role="alert"><p>{warning}</p><button type="button" className="hub-button" onClick={() => backup(state)}>현재 입력 백업</button><button type="button" className="hub-button" onClick={() => window.location.reload()}>새로고침</button></div>}{path === LAB_VERIFICATION_PATH ? <LabVerification/> : path === '/practical/lab' ? <Index state={state}/> : lab ? <Detail key={lab.id} lab={lab} entry={state.entries[lab.id] || freshLabEntry()} change={action => change(lab.id, action)}/> : <div className="hub-empty"><h1>실습 과제를 찾을 수 없습니다</h1><p>목록에서 학습할 과제를 선택해 주세요.</p><a className="hub-button" href="#/practical/lab">실습 자료 목록</a></div>}</div>;
}
