const Portfolio = lazy(() => import('./Portfolio.jsx'));
const Analytics = lazy(() => import('./Analytics.jsx'));
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TOPICS, FAQS, TOOLS, GUIDES } from './content/learning.mjs';
import { LEARNING_KEY, loadLearning, saveLearning, validateLearning, parseRoute, safeReturnPath, readAssessmentState } from './learning-model.mjs';
import PracticalPage from './Practical.jsx';
import { ToolHeading, ToolPhotoSources } from './ToolPhotos.jsx';
import { TheoryPreview, TheoryFigures, TheoryFigureSources } from './TheoryFigures.jsx';
import { PRACTICAL_NAV, practicalSection } from './content/practical.mjs';

const Written = lazy(() => import('./modules/written/WrittenApp.jsx'));
const Cabling = lazy(() => import('./modules/cabling/App.jsx'));
const PracticalQuiz = lazy(() => import('./PracticalQuiz.jsx'));
const PracticalLabs = lazy(() => import('./PracticalLabs.jsx'));
const SUBJECTS = ['전체', '네트워크일반', 'TCP/IP', 'NOS', '네트워크운용기기', '실기 케이블링'];
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(topic => [topic.id, topic]));
const MODULE_PATHS = { dashboard: '/learn/analytics', learn: '/learn/theory', written: '/written', practical: '/practical', review: '/learn/review', records: '/learn/history' };
const now = () => new Date().toISOString();
const storage = () => { try { return window.localStorage; } catch { return { getItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); }, setItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); } }; } };
const href = path => `#${path}`;
function navigate(path) { window.location.hash = path; }
function dateText(value) { return new Date(value).toLocaleDateString('ko-KR'); }
function download(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Icon({ name, size = 22 }) {
  const paths = {
    book: <><path d="M3 4h6a4 4 0 0 1 3 1.5A4 4 0 0 1 15 4h6v16h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3Z"/><path d="M12 6v15"/></>,
    pen: <><path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/><path d="M14 21h7"/></>,
    cable: <><path d="M8 2v5M16 2v5M6 7h12v5a6 6 0 0 1-12 0ZM12 18v4"/><path d="M9 11h6"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    tool: <><path d="M14 3a6 6 0 0 0-7 8L2 16l6 6 5-5a6 6 0 0 0 8-7l-4 4-5-5 4-4Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.book}</svg>;
}
function Loading() { return <div className="hub-loading" role="status">학습 화면을 준비하고 있습니다…</div>; }

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const active = route.path.startsWith('/written') ? 'written' : route.path.startsWith('/cabling') ? 'cabling' : route.path.startsWith('/practical') ? 'practical' : 'learn';
  const isHub = active === 'learn' || active === 'practical';
  const isPractical = active === 'practical' || active === 'cabling';
  const productArea = route.path === '/learn/analytics' ? 'dashboard' : route.path === '/learn/review' ? 'review' : route.path === '/learn/history' ? 'records' : isPractical ? 'practical' : active;
  const isQuestions = route.path === '/practical/questions';
  const isLabs = active === 'practical' && practicalSection(route.path) === 'lab';
  const [visited, setVisited] = useState(() => ({ written: active === 'written', cabling: active === 'cabling', questions: isQuestions, labs: isLabs }));
  const [moduleRoutes, setModuleRoutes] = useState(() => ({ written: active === 'written' ? route.path : '/written', cabling: active === 'cabling' ? route.path : '/cabling' }));
  const [initial] = useState(() => loadLearning(storage()));
  const [learning, setLearning] = useState(initial.state);
  const [canSave, setCanSave] = useState(initial.canSave);
  const [warning, setWarning] = useState(initial.warning);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('전체');
  const [pendingImport, setPendingImport] = useState(null);
  const [assessment, setAssessment] = useState(() => readAssessmentState(storage()));
  const writtenAssessment = useCallback(running => setAssessment(s => s.written === running ? s : { ...s, written: running }), []);
  const cablingAssessment = useCallback(running => setAssessment(s => s.cabling === running ? s : { ...s, cabling: running }), []);
  const assessmentGate = assessment.written || assessment.cabling;
  const fileRef = useRef(null);
  const observed = useRef(undefined);
  if (observed.current === undefined) { try { observed.current = storage().getItem(LEARNING_KEY); } catch { observed.current = null; } }

  useEffect(() => {
    const change = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (route.path === '/practical/questions') setVisited(value => value.questions ? value : { ...value, questions: true });
    if (active === 'practical' && practicalSection(route.path) === 'lab') setVisited(value => value.labs ? value : { ...value, labs: true });
    if (active === 'written' || active === 'cabling') {
      setVisited(value => ({ ...value, [active]: true }));
      setModuleRoutes(value => ({ ...value, [active]: route.path }));
    } else window.scrollTo({ top: 0 });
  }, [active, route.path]);
  useEffect(() => {
    if (!canSave) return;
    try {
      const current = storage().getItem(LEARNING_KEY);
      if (current !== observed.current) { setCanSave(false); setWarning('다른 탭에서 학습센터 기록이 변경되었습니다. 현재 기록을 백업한 뒤 새로고침해 주세요.'); return; }
      const result = saveLearning(storage(), learning);
      if (!result.ok) { setCanSave(false); setWarning(result.warning); }
      else observed.current = JSON.stringify(learning);
    } catch (error) { setCanSave(false); setWarning(`학습센터 기록 저장을 중단했습니다. ${error.message}`); }
  }, [learning, canSave]);
  useEffect(() => {
    const changed = event => {
      if (event.key === null || event.key === 'na2_study_written_v1' || event.key === 'na2_study_cabling_v1') setAssessment(readAssessmentState(storage()));
      if ((event.key === LEARNING_KEY || event.key === null) && event.newValue !== observed.current) { setCanSave(false); setWarning('다른 탭에서 학습센터 기록이 변경되었습니다. 현재 기록을 백업한 뒤 새로고침해 주세요.'); }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  useEffect(() => { if (!message) return; const id = setTimeout(() => setMessage(''), 4500); return () => clearTimeout(id); }, [message]);
  const questionTopics = useMemo(() => {
    const map = {};
    for (const topic of TOPICS) for (const id of topic.relatedQuestions || []) (map[id] ||= []).push({ id: topic.id, title: topic.title });
    return map;
  }, []);
  const openTheory = (id, from) => navigate(`/learn/theory/${encodeURIComponent(id)}?from=${encodeURIComponent(from)}`);
  const readCount = TOPICS.filter(topic => learning.read[topic.id]).length;
  const backup = () => download(learning, `NA2-study-학습센터-${new Date().toLocaleDateString('sv-SE')}.json`);
  async function importLearning(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('학습센터 백업은 1 MiB 이하여야 합니다.');
      const incoming = validateLearning(JSON.parse(await file.text()));
      const checks = new Map(TOPICS.flatMap(t => t.checks.map(c => [`${t.id}/${c.id}`, c])));
      if (Object.keys(incoming.read).some(id => !TOPIC_BY_ID[id]) || Object.keys(incoming.tools).some(id => !TOOLS.some(t => t.id === id))) throw new Error('현재 콘텐츠에 없는 항목이 포함되어 있습니다.');
      for (const [id, result] of Object.entries(incoming.checks)) {
        const check = checks.get(id);
        if (!check || !check.choices[result.answer] || result.correct !== (result.answer === check.answer)) throw new Error('개념 확인 답안과 정오 정보가 맞지 않습니다.');
      }
      setPendingImport(incoming);
    } catch (error) { setMessage(`가져오지 못했습니다. ${error.message}`); }
  }
  const subNav = [['/learn','학습 홈'],['/learn/theory','이론'],['/learn/guide','학습 안내'],['/learn/faq','FAQ'],['/learn/tools','준비물'],['/learn/records','학습센터 기록'],['/learn/analytics','학습 분석·오답']];
  const topicId = route.path.startsWith('/learn/theory/') ? route.path.slice('/learn/theory/'.length) : null;
  const topic = topicId ? TOPIC_BY_ID[topicId] : null;
  const isTheory = route.path === '/learn/theory';
  const matching = TOPICS.filter(t => (subject === '전체' || t.subject === subject) && `${t.title} ${t.summary} ${t.subject}`.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className="study-root">
    <a className="hub-skip" href="#hub-content" onClick={event => { event.preventDefault(); document.getElementById(isHub ? 'hub-content' : `hub-${active}-module`)?.focus(); }}>본문으로 이동</a>
    <header className="hub-header"><a className="hub-brand" href="#/learn/analytics"><span className="hub-brand-symbol">N<span>2</span></span><span>NA2 <b>PCU</b><small>네트워크관리사 2급</small></span></a><nav className="hub-product-nav" aria-label="통합 학습 메뉴">{[['dashboard','학습 현황','check'],['learn','이론','book'],['written','필기','pen'],['practical','실기','tool'],['review','오답 노트','pen'],['records','학습 기록','book']].map(([key,label,icon]) => <a key={key} href={href(MODULE_PATHS[key])} className={productArea === key ? 'hub-selected' : ''} aria-current={productArea === key ? 'page' : undefined}><Icon name={icon} size={18}/><span>{label}</span></a>)}</nav><span className="hub-edition">통합 학습판 <b>02</b></span></header>
    {active === 'learn' && <nav className="hub-subnav" aria-label="학습센터 메뉴">{subNav.map(([path,label]) => <a key={path} href={href(path)} className={(path === '/learn' ? route.path === path : route.path.startsWith(path)) ? 'hub-selected' : ''}>{label}</a>)}</nav>}
    {isPractical && <nav className="hub-subnav" aria-label="실기 영역 메뉴">{PRACTICAL_NAV.map(item => <a key={item.id} href={href(item.path)} className={practicalSection(route.path) === item.id ? 'hub-selected' : ''} aria-current={practicalSection(route.path) === item.id ? 'page' : undefined}>{item.label}</a>)}</nav>}
    {warning && isHub && <div className="hub-warning" role="alert"><p>{warning}</p><button onClick={backup}>현재 기록 백업</button><button onClick={() => window.location.reload()}>새로고침</button></div>}
    {message && <div className="hub-toast" role="status">{message}</div>}
    <main id="hub-content" className="hub-content" hidden={!isHub} tabIndex={-1}>
      {assessmentGate && <div className="hub-empty"><h1>진행 중 평가</h1><p>평가를 마친 뒤 이론·실기 안내·개념 확인을 이용할 수 있습니다.<br/>현재 답안은 보존되며 필기 실전 시험의 제한시간은 계속 흐릅니다.</p><div className="hub-actions" style={{justifyContent:'center'}}>{assessment.written && <a className="hub-button primary" href="#/written">필기 평가로 돌아가기</a>}{assessment.cabling && <a className="hub-button primary" href="#/cabling">케이블링 평가로 돌아가기</a>}</div></div>}
      <div hidden={assessmentGate}>
      {!assessmentGate && active === 'practical' && !isQuestions && !isLabs && <PracticalPage path={route.path}/>}
      {visited.labs && <Suspense fallback={isLabs && !assessmentGate ? <Loading/> : null}><PracticalLabs path={route.path} visible={isLabs && !assessmentGate}/></Suspense>}
      {visited.questions && <Suspense fallback={isQuestions && !assessmentGate ? <Loading/> : null}><PracticalQuiz visible={isQuestions && !assessmentGate}/></Suspense>}
      {['/learn/review','/learn/history'].includes(route.path) && !assessmentGate && <Suspense fallback={<Loading/>}><Portfolio key={route.path} view={route.path.endsWith('/review')?'review':'records'}/></Suspense>}
      {route.path === '/learn/analytics' && !assessmentGate && <Suspense fallback={<Loading/>}><Analytics/></Suspense>}
      {route.path === '/learn' && <>
        <section className="hub-hero"><div><span className="hub-eyebrow">NETWORK ADMINISTRATOR / LEVEL 2</span><h1>네트워크관리사 2급<br/><span>통합 학습센터</span></h1><p>핵심 개념을 이해하고, 필기 문제풀이와 실기 세 영역으로 준비하세요.<br className="hub-desktop-break"/> 학습 안내부터 오답 교정까지 한곳에서 이어집니다.</p><div className="hub-actions"><a className="hub-button primary" href="#/learn/theory">이론 학습 시작 <Icon name="arrow" size={17}/></a><a className="hub-button" href="#/learn/guide">처음 이용하시나요?</a><a className="hub-button" href="#/learn/analytics">학습 분석·통합 오답 →</a></div></div><div className="hub-path-card"><span className="hub-eyebrow">나의 학습 순서</span><ol><li><span>01</span><div><b>개념 이해</b><small>설명 · 도해 · 개념 확인</small></div><Icon name="book"/></li><li><span>02</span><div><b>문제와 실습</b><small>필기 문제풀이 · 실기 영역별 준비</small></div><Icon name="pen"/></li><li><span>03</span><div><b>오답 복습</b><small>핀별 복습 · 배열 교정 · 재확인</small></div><Icon name="check"/></li></ol><div className="hub-read-progress"><span>읽은 이론 <b>{readCount} / {TOPICS.length}</b></span><progress max={TOPICS.length} value={readCount}/><small>읽음 표시는 학습 확인용이며 평가 점수에 포함되지 않습니다.</small></div></div></section>
        <section className="hub-course-grid" aria-label="학습 영역"><Course icon="book" number="01" title="핵심 이론" text={`${TOPICS.length}개 주제의 설명·예제·개념 확인으로 기초를 정리합니다.`} path="/learn/theory" action="이론 둘러보기"/><Course icon="pen" number="02" title="필기 문제풀이" text="과년도 900문항을 연습하고 오답과 북마크로 다시 확인합니다." path="/written" action="문제은행 열기"/><Course icon="tool" number="03" title="실기" text="작업형·실습형·단답형/객관식으로 나누어 학습 방법과 이용 가능한 기능을 확인합니다." path="/practical" action="실기 세 영역 보기"/></section>
        <section className="hub-home-bottom"><div className="hub-panel"><div className="hub-section-heading"><div><span className="hub-eyebrow">QUICK START</span><h2>학습 바로가기</h2></div></div><div className="hub-quick-list">{[['/cabling/pins','핀별 복습','T568A/B에서 자주 틀린 핀 확인'],['/cabling/correction','배열 교정','뒤바뀐 위치를 직접 수정'],['/practical','실기 세 영역','작업형 · 실습형 · 단답형/객관식'],['/learn/faq','자주 묻는 질문','시험 안내 · 학습 내용 · 앱 사용']].map(([path,title,text]) => <a key={path} href={href(path)}><span><b>{title}</b><small>{text}</small></span><Icon name="arrow" size={18}/></a>)}</div></div><aside className="hub-note-panel"><span className="hub-eyebrow">학습 자료 안내</span><h2>학습 자료 출처와 수록 범위</h2><p>이론에는 출처와 검토일을, 문제에는 원문과 답안 근거를 제공합니다.</p><p>현재 이론은 핵심 주제를 선정한 초기 수록분입니다. 필기·실기 전체 범위를 모두 다룬 요약집은 아닙니다.</p><a href="#/learn/records">내 기록과 백업 안내 <Icon name="arrow" size={17}/></a></aside></section>
      </>}
      {isTheory && <><PageTitle eyebrow="CONCEPT LIBRARY" title="이론 학습" text="설명과 예제로 이해한 뒤, 개념 확인과 관련 문제로 점검하세요."/><div className="hub-filters"><label>이론 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="예: 서브넷, VLAN, Linux"/></label><label>과목<select value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></label><span>{matching.length}개 주제</span></div><div className="hub-topic-grid">{matching.map(t => <a className="hub-topic-card" href={href(`/learn/theory/${t.id}`)} key={t.id}><div><span className="hub-tag">{t.subject}</span>{learning.read[t.id] && <span className="hub-read-tag">읽음</span>}</div><TheoryPreview topicId={t.id}/><h2>{t.title}</h2><p>{t.summary}</p><span className="hub-card-bottom">개념 확인 {t.checks.length}문항 <Icon name="arrow" size={18}/></span></a>)}</div>{!matching.length && <p className="hub-empty">검색 조건에 맞는 이론이 없습니다.</p>}</>}
      {topic && !assessmentGate && <TopicPage topic={topic} learning={learning} onRead={() => { setLearning(s => ({ ...s, read: { ...s.read, [topic.id]: now() } })); setMessage('읽음으로 표시했습니다.'); }} onAnswer={(check,answer) => setLearning(s => ({ ...s, checks: { ...s.checks, [`${topic.id}/${check.id}`]: { answer, correct: answer === check.answer, at: now() } } }))} returnPath={safeReturnPath(route.params.get('from'))}/>}
      {topicId && !topic && <EmptyPage title="이론 페이지 없음"/>}
      {route.path === '/learn/guide' && <><PageTitle eyebrow="START HERE" title="학습 안내" text="지금 준비하는 단계에 맞춰 시작하세요. 학습 순서는 상황에 맞게 바꿀 수 있습니다."/><div className="hub-guide-grid">{GUIDES.map((guide,i) => <article className="hub-panel" key={guide.id}><span className="hub-step-number">0{i+1}</span><small className="hub-muted">{guide.audience}</small><h2>{guide.title}</h2><ol className="hub-guide-steps">{guide.steps.map((step,j) => <li key={j}>{step}</li>)}</ol><a className="hub-button primary" href={href(guide.startPath)}>학습 시작 <Icon name="arrow" size={17}/></a></article>)}</div><div className="hub-inline-note">학습 기록은 사용 중인 브라우저에 저장됩니다. 기존 독립 필기·실기 앱과 통합 앱은 서로 다른 기록을 사용하며, 기기 사이에서 자동 동기화되지 않습니다.</div></>}
      {route.path.startsWith('/learn/faq') && <FaqPage path={route.path}/>}
      {route.path === '/learn/tools' && <><PageTitle eyebrow="PRACTICE PREPARATION" title="케이블 제작 준비물" text="아래는 케이블 제작 연습을 위한 준비 목록입니다. 시험장 반입 가능 여부는 해당 회차의 공식 안내에서 확인하세요."/><div className="hub-tools-heading"><p>준비 확인 <b>{TOOLS.filter(t => learning.tools[t.id]).length} / {TOOLS.length}</b></p><a className="hub-button" href="#/cabling">케이블링 훈련 열기 <Icon name="arrow" size={17}/></a></div><div className="hub-tools-grid">{TOOLS.map(tool => <article className={`hub-panel hub-tool-card ${learning.tools[tool.id] ? 'is-ready' : ''}`} key={tool.id}><div className="hub-section-heading"><span className="hub-tag">{tool.requirement}</span></div><ToolHeading tool={tool}/><p>{tool.role}</p><dl><dt>규격·호환 확인</dt><dd>{tool.compatibility}</dd><dt>사용 안내</dt><dd>{tool.note}</dd></dl><label className="hub-checkbox"><input type="checkbox" checked={Boolean(learning.tools[tool.id])} onChange={e => setLearning(s => ({ ...s, tools: { ...s.tools, [tool.id]: e.target.checked } }))}/><span>이 준비물을 확인했습니다</span></label></article>)}</div><ToolPhotoSources tools={TOOLS}/></>}
      {route.path === '/learn/records' && <><PageTitle eyebrow="LEARNING RECORDS" title="학습센터 기록" text="이론 읽음, 개념 확인, 준비물 확인을 기록합니다. 필기·실기 평가 점수와 구분합니다."/><div className="hub-record-metrics"><div><span>읽은 이론</span><b>{readCount}<small> / {TOPICS.length}</small></b></div><div><span>개념 확인 응답</span><b>{Object.keys(learning.checks).length}<small>문항</small></b></div><div><span>준비물 확인</span><b>{TOOLS.filter(t => learning.tools[t.id]).length}<small>개</small></b></div></div><section className="hub-panel"><h2>이론별 기록</h2><div className="hub-record-list">{TOPICS.map(t => { const answered=t.checks.map(c => learning.checks[`${t.id}/${c.id}`]).filter(Boolean); return <a href={href(`/learn/theory/${t.id}`)} key={t.id}><span><b>{t.title}</b><small>{learning.read[t.id] ? `${dateText(learning.read[t.id])} 읽음` : '읽음 표시 없음'}</small></span><span>개념 확인 {answered.filter(c => c.correct).length} / {answered.length} 정답</span></a>; })}</div></section><section className="hub-panel hub-backup"><h2>학습센터 기록 백업</h2><p>이 파일에는 이론·개념 확인·준비물 기록이 포함됩니다. 필기와 케이블링 기록은 각 학습 화면의 기록 메뉴에서 별도로 백업합니다.</p><div className="hub-actions"><button className="hub-button primary" onClick={backup}>백업 내보내기</button><button className="hub-button" onClick={() => fileRef.current.click()}>백업 가져오기</button><a className="hub-button" href="#/written">필기 기록으로</a><a className="hub-button" href="#/cabling">케이블링 기록으로</a></div><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importLearning}/></section></>}
      {active === 'learn' && !['/learn','/learn/theory','/learn/guide','/learn/tools','/learn/records'].includes(route.path) && !route.path.startsWith('/learn/theory/') && !route.path.startsWith('/learn/faq') && <EmptyPage title="페이지 없음"/>}
      </div>
    </main>
    {visited.written && <section id="hub-written-module" tabIndex={-1} hidden={active !== 'written'} aria-label="필기 학습 모듈"><Suspense fallback={<Loading/>}><Written onTheory={id => openTheory(id, '/written')} questionTopics={questionTopics} route={moduleRoutes.written} onAssessmentState={writtenAssessment}/></Suspense></section>}
    {visited.cabling && <section id="hub-cabling-module" tabIndex={-1} hidden={active !== 'cabling'} aria-label="작업형 케이블링 학습 모듈"><Suspense fallback={<Loading/>}><Cabling showReferenceFigures={active === 'cabling' && !assessmentGate} onTheory={id => openTheory(id, moduleRoutes.cabling)} route={moduleRoutes.cabling} onAssessmentState={cablingAssessment}/></Suspense></section>}
    {isHub && <footer className="hub-footer"><span>NA2 Study · 네트워크관리사 2급 통합 학습센터</span><span>개념 이해 · 문제풀이 · 실습과 교정</span></footer>}
    {pendingImport && <div className="hub-modal-backdrop"><section className="hub-modal" role="dialog" aria-modal="true" aria-labelledby="hub-import-title"><h2 id="hub-import-title">학습센터 기록 복원 확인</h2><p>현재 학습센터 기록을 선택한 백업으로 교체합니다. 필기·실기 기록에는 영향을 주지 않습니다. 필요한 현재 기록은 먼저 백업해 주세요.</p><div className="hub-actions"><button className="hub-button" onClick={() => setPendingImport(null)}>취소</button><button className="hub-button" onClick={backup}>현재 기록 백업</button><button className="hub-button primary" onClick={() => { setLearning(pendingImport); setPendingImport(null); setMessage(canSave ? '기록을 가져왔습니다.' : '기록을 화면에 불러왔습니다. 자동 저장 중단 상태이므로 백업으로 보관해 주세요.'); }}>가져오기</button></div></section></div>}
  </div>;
}

function PageTitle({eyebrow,title,text}) { return <header className="hub-page-title"><span className="hub-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></header>; }
function EmptyPage({title}) { return <div className="hub-empty"><h1>{title}</h1><a className="hub-button" href="#/learn">학습센터 홈</a></div>; }
function Course({icon,number,title,text,path,action}) { return <article className="hub-course"><div className="hub-course-top"><span className="hub-course-icon"><Icon name={icon} size={24}/></span><small>{number}</small></div><h2>{title}</h2><p>{text}</p><a href={href(path)}>{action}<Icon name="arrow" size={18}/></a></article>; }
function TopicPage({topic,learning,onRead,onAnswer,returnPath}) {
  return <article className="hub-topic-detail"><div className="hub-topic-back"><a href="#/learn/theory">← 이론 목록</a>{returnPath !== '/learn' && <a className="hub-button" href={href(returnPath)}>학습 화면으로 돌아가기</a>}</div><PageTitle eyebrow={topic.subject} title={topic.title} text={topic.summary}/><div className="hub-topic-meta"><span>검토일 {topic.checkedAt}</span><span>개념 확인 {topic.checks.length}문항</span><span>{learning.read[topic.id] ? '읽음' : '학습 전'}</span></div><div className="hub-topic-layout"><div className="hub-topic-main"><section className="hub-objectives"><h2>학습 목표</h2><ul>{topic.objectives.map((s,i) => <li key={i}>{s}</li>)}</ul>{topic.prerequisites.length > 0 && <p><b>선수 학습</b> · {topic.prerequisites.join(' · ')}</p>}</section>{topic.sections.map((section,i) => <section className="hub-prose-section" key={i}><h2>{section.title}</h2><TheoryFigures topicId={topic.id} section={i}/>{section.paragraphs.map((p,j) => <p key={j}>{p}</p>)}{section.table && <div className="hub-table-wrap"><table><thead><tr>{section.table.headers.map((h,j) => <th key={j} scope="col">{h}</th>)}</tr></thead><tbody>{section.table.rows.map((row,j) => <tr key={j}>{row.map((cell,k) => <td key={k}>{cell}</td>)}</tr>)}</tbody></table></div>}</section>)}<section className="hub-example"><span className="hub-eyebrow">WORKED EXAMPLE</span><h2>{topic.example.title}</h2><ol>{topic.example.steps.map((s,i) => <li key={i}>{s}</li>)}</ol></section><section className="hub-prose-section"><h2>주요 혼동 사항</h2><ul>{topic.pitfalls.map((s,i) => <li key={i}>{s}</li>)}</ul></section><section className="hub-check-section"><h2>개념 확인</h2><p>자체 제작한 학습용 문항입니다. 필기·실기 평가 점수에 포함되지 않습니다.</p>{topic.checks.map((check,i) => <ConceptCheck key={`${topic.id}/${check.id}`} check={check} index={i} previous={learning.checks[`${topic.id}/${check.id}`]} onAnswer={answer => onAnswer(check,answer)}/>)}</section><section className="hub-source-list"><h2>출처와 검토</h2><ul>{topic.sources.map((s,i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></li>)}</ul><p>검토일 {topic.checkedAt}. 적용 환경과 버전이 다른 경우 해당 제품의 현재 공식 안내를 함께 확인하세요.</p><TheoryFigureSources topicId={topic.id}/></section></div><aside className="hub-topic-aside"><div className="hub-panel"><h2>관련 학습</h2><button className="hub-button primary" onClick={onRead}><Icon name="check" size={17}/>{learning.read[topic.id] ? '읽음 표시됨' : '읽음으로 표시'}</button>{topic.practicePath && <a className="hub-button" href={href(topic.practicePath)}>관련 실기 훈련 <Icon name="arrow" size={17}/></a>}{topic.relatedQuestions.length > 0 ? <><h3>관련 기출문제</h3><p>원문을 확인해 연결한 문제입니다. 채점은 기존 문제은행의 가채점 답안표를 따릅니다.</p>{topic.relatedQuestions.map(id => <a className="hub-question-link" href={href(`/written/question/${id}`)} key={id}>{id}<Icon name="arrow" size={15}/></a>)}</> : <p>이 주제는 개념 확인과 관련 실습으로 점검하세요.</p>}<a href="#/learn/faq">관련 질문 찾아보기 →</a></div></aside></div></article>;
}
function ConceptCheck({check,index,previous,onAnswer}) {
  const [answer,setAnswer] = useState(previous?.answer ?? null);
  const [submitted,setSubmitted] = useState(Boolean(previous));
  return <div className="hub-concept-check"><h3>{index+1}. {check.prompt}</h3><div className="hub-check-choices">{check.choices.map((choice,i) => <button key={i} className={`${answer === i ? 'is-selected' : ''} ${submitted && i === check.answer ? 'is-correct' : ''}`} disabled={submitted} aria-pressed={answer === i} onClick={() => setAnswer(i)}><span>{i+1}</span>{choice}</button>)}</div>{submitted ? <><p className={`hub-check-feedback ${answer === check.answer ? '' : 'needs-review'}`}><b>{answer === check.answer ? '정답입니다.' : '설명을 다시 확인해 보세요.'}</b> {check.explanation}</p><button className="hub-text-button" onClick={() => { setAnswer(null); setSubmitted(false); }}>다시 확인</button></> : <button className="hub-button primary" disabled={answer === null} onClick={() => { onAnswer(answer); setSubmitted(true); }}>답안 확인</button>}</div>;
}
function FaqPage({path}) {
  const [query,setQuery] = useState(''); const [category,setCategory] = useState('전체');
  const focused = path.slice('/learn/faq/'.length);
  const categories = ['전체', ...new Set(FAQS.map(item => item.category))];
  const found = FAQS.filter(item => (category === '전체' || item.category === category) && `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle eyebrow="QUESTIONS & ANSWERS" title="자주 묻는 질문" text="시험 안내와 기술 개념, 앱 사용법을 구분해 확인하세요."/><div className="hub-filters"><label>질문 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="예: 기록, 케이블, 힌트"/></label><label>분류<select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><span>{found.length}개 질문</span></div><div className="hub-faq-list">{found.map(item => <details key={`${item.id}/${focused}`} open={focused === item.id || undefined}><summary><span className="hub-tag">{item.category}</span><b>{item.question}</b><span>+</span></summary><div><p>{item.answer}</p><div className="hub-faq-source"><a href={href(`/learn/faq/${item.id}`)}>이 질문 바로가기</a>{item.source && <a href={item.source.url} target="_blank" rel="noopener noreferrer">{item.source.title} ↗</a>}<small>검토일 {item.checkedAt}</small></div></div></details>)}</div>{!found.length && <p className="hub-empty">검색 조건에 맞는 질문이 없습니다.</p>}</>;
}


