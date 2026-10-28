import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { WIRES, STANDARDS, SOURCES, LESSONS, QUESTIONS } from './content.mjs';
import { PracticalFigures } from '../../PracticalFigures.jsx';
import { TheoryFigures } from '../../TheoryFigures.jsx';
import { STORE_KEY, LEGACY_KEY, MAX_IMPORT_BYTES, loadState, saveState, makeSession, reducer, stats, pinDiagnostics, exportBackup, validateBackup } from './model.mjs';
import './styles.css';

const NAV = [['home', '대시보드'], ['learn', '개념 학습'], ['train', '케이블링 훈련'], ['pins', '핀별 진단 · 복습'], ['correction', '배열 교정'], ['wrong', '오답 복습'], ['practical', '제작 연습'], ['stats', '학습 기록'], ['about', '자료 · 설정']];
const TITLES = Object.fromEntries(NAV);
const KINDS = { pin: '핀 · 색상', order: '배열 완성', type: '유형 판별' };
const MODES = { practice: '연습', assessment: '평가', review: '오답 복습' };
const BY_ID = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const CHECKS = ['문제에서 요구한 양 끝 결선 규격 확인', '핀 번호와 전선 색상 순서 확인', '전선 끝을 같은 길이로 정렬', '각 전선이 커넥터 끝까지 삽입됐는지 확인', '외피 고정과 압착 상태 확인', '케이블 테스터로 결선 상태 확인'];
const pct = n => n === null || n === undefined ? '—' : `${n}%`;
const stamp = value => new Date(value).toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const secondsLabel = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;
const iso = () => new Date().toISOString();

function storage() { try { return window.localStorage; } catch { return { getItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); }, setItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); } }; } }
function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Icon({ name }) {
  const shapes = {
    home: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    learn: <><path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3Z" /><path d="M12 6v15M6 8h3m-3 4h3m6-4h3m-3 4h3" /></>,
    train: <><rect x="5" y="3" width="14" height="14" rx="2" /><path d="M8 6v5m4-5v5m4-5v5M9 17v4m6-4v4" /></>,
    wrong: <><path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M9 12l2 2 5-5" /></>,
    practical: <><circle cx="12" cy="13" r="8" /><path d="M9 2h6m-3 3V2m0 7v5l3 2" /></>,
    stats: <><path d="M4 3v18h17M8 16v-5m5 5V7m5 9V4" /></>,
    about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-11v2" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.train}</svg>;
}

function Wire({ id, compact = false }) {
  const wire = WIRES[id];
  if (!wire) return <span className="wire-empty">?</span>;
  return <span className={`wire-label ${compact ? 'compact' : ''}`}><span className={`wire-swatch ${wire.striped ? 'striped' : ''}`} style={{ '--wire': wire.color }} aria-hidden="true" /><span>{compact ? wire.short : wire.label}</span></span>;
}

function Connector({ standard, title, values, hidden = false, targetPin, compare }) {
  const ids = values || (hidden ? Array(8).fill(null) : STANDARDS[standard]);
  return <figure className="connector">
    <figcaption>{title || standard}<span>금속 접점이 보이는 면</span></figcaption>
    <div className="plug-body">
      <div className="clip-note">클립은 뒤쪽</div>
      <div className="pin-row">{Array.from({ length: 8 }, (_, index) => <div key={index} className={`pin-cell ${targetPin === index + 1 ? 'target-pin' : ''} ${compare && ids[index] !== compare[index] ? 'pin-error' : ''}`}>
        <span className="contact" aria-hidden="true" /><strong className="pin-number">{index + 1}</strong>
        {ids[index] ? <Wire id={ids[index]} compact /> : <span className="wire-empty">{targetPin === index + 1 ? '?' : '·'}</span>}
      </div>)}</div>
    </div>
    <div className="cable-tail" aria-hidden="true" /><p className="orientation">금속 접점이 보이는 면 · 클립은 뒤쪽 · 케이블은 아래</p>
  </figure>;
}

function WireMap({ left = 'T568A', right = 'T568B' }) {
  const from = STANDARDS[left], to = STANDARDS[right];
  return <div className="wiremap"><div className="wiremap-head"><strong>왼쪽 {left}</strong><strong>오른쪽 {right}</strong></div>
    <svg viewBox="0 0 420 238" role="img" aria-label={from.map((id, i) => `${i + 1}번에서 ${to.indexOf(id) + 1}번`).join(', ')}>
      {from.map((id, i) => { const j = to.indexOf(id), wire = WIRES[id], y1 = 24 + i * 27, y2 = 24 + j * 27; return <g key={id}><text x="12" y={y1 + 5}>{i + 1}</text><text x="391" y={y2 + 5}>{j + 1}</text><path d={`M38 ${y1} C145 ${y1},275 ${y2},382 ${y2}`} stroke={wire.color} strokeWidth="5" fill="none" />{wire.striped && <path d={`M38 ${y1} C145 ${y1},275 ${y2},382 ${y2}`} stroke="#fff" strokeWidth="3" strokeDasharray="7 7" fill="none" />}</g>; })}
    </svg><p>두 커넥터를 각각 같은 관찰 방향으로 비교합니다.</p></div>;
}

function Sources({ ids }) {
  const list = ids ? SOURCES.filter(s => ids.includes(s.id)) : SOURCES;
  return <ul className="source-list">{list.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>{!ids && <small>확인일 {s.checkedAt}</small>}</li>)}</ul>;
}
function Metric({ title, value, detail }) { return <div className="metric"><small>{title}</small><strong>{value}</strong>{detail && <span>{detail}</span>}</div>; }

function ConfirmDialog({ config, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (config && !ref.current.open) ref.current.showModal(); }, [config]);
  if (!config) return null;
  return <dialog className="confirm-dialog" ref={ref} aria-labelledby="dialog-title" onCancel={onClose} onClose={onClose}>
    <h2 id="dialog-title">{config.title}</h2><p>{config.message}</p>
    <div className="actions"><button autoFocus onClick={onClose}>취소</button><button className={config.danger ? 'danger-button' : 'primary'} onClick={() => { const fn = config.onConfirm; onClose(); fn(); }}>{config.label || '확인'}</button></div>
  </dialog>;
}

export default function App({ onTheory, onAssessmentState, route = '/cabling', showReferenceFigures = true }) {
  const [loaded] = useState(() => loadState(storage()));
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const [view, setView] = useState(route === '/cabling/pins' ? 'pins' : route === '/cabling/correction' ? 'correction' : loaded.state.session && !loaded.state.session.completedAt ? 'train' : 'home');
  const generalView = useRef(loaded.state.session && !loaded.state.session.completedAt ? 'train' : 'home');
  const [lesson, setLesson] = useState(0);
  const [mode, setMode] = useState(loaded.state.session?.mode === 'assessment' ? 'assessment' : 'practice');
  const [dialog, setDialog] = useState(null);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveAllowed, setSaveAllowed] = useState(!loaded.warning);
  const [recoveryCopied, setRecoveryCopied] = useState(false);
  const [externalChange, setExternalChange] = useState(false);
  const [clock, setClock] = useState(Date.now());
  const importRef = useRef(null);
  const observedStore = useRef();
  const externalLock = useRef(false);
  if (observedStore.current === undefined) { try { observedStore.current = storage().getItem(STORE_KEY); } catch { observedStore.current = null; } }
  const session = state.session;
  const assessmentInProgress = session?.mode === 'assessment' && !session.completedAt;
  const displayState = useMemo(() => assessmentInProgress ? { ...state, events: state.events.filter(event => event.sessionId !== session.id) } : state, [state, assessmentInProgress, session?.id]);
  const summary = useMemo(() => stats(displayState, new Date(clock).toISOString()), [displayState, clock]);
  const question = session && BY_ID[session.ids[session.index]];

  useEffect(() => { onAssessmentState?.(Boolean(assessmentInProgress)); }, [assessmentInProgress, onAssessmentState]);
  useEffect(() => {
    if (route === '/cabling/pins') setView('pins');
    else if (route === '/cabling/correction') setView('correction');
    else if (route === '/cabling') setView(generalView.current);
  }, [route]);

  useEffect(() => {
    if (!saveAllowed || externalLock.current) return;
    try {
      if (storage().getItem(STORE_KEY) !== observedStore.current) {
        externalLock.current = true; setExternalChange(true); return;
      }
    } catch { /* saveState provides the user-facing error. */ }
    const result = saveState(storage(), state);
    if (result.ok) { try { observedStore.current = storage().getItem(STORE_KEY); } catch { /* The saved value is still retained. */ } }
    setSaveError(result.ok ? '' : result.error || '기록을 저장하지 못했습니다. 백업을 내려받아 주세요.');
  }, [state, saveAllowed]);
  useEffect(() => {
    const tick = () => setClock(Date.now()); tick();
    const handle = setInterval(tick, state.practical?.active ? 1000 : 30000);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(handle); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, [state.practical?.active?.id]);
  useEffect(() => {
    const changed = event => {
      if ((event.key === STORE_KEY || event.key === null) && event.newValue !== observedStore.current) {
        externalLock.current = true; setExternalChange(true);
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  useEffect(() => {
    const active = state.practical?.active;
    if (active && clock >= new Date(active.deadlineAt).getTime()) dispatch({ type: 'PRACTICAL_FINISH', at: new Date(clock).toISOString() });
  }, [clock, state.practical?.active]);
  useEffect(() => {
    if (!state.settings.autoNext || !session?.submitted || session.completedAt || view !== 'train' || !route.startsWith('/cabling')) return;
    const handle = setTimeout(() => dispatch({ type: 'NEXT', at: iso() }), 2500);
    return () => clearTimeout(handle);
  }, [state.settings.autoNext, session?.id, session?.index, session?.submitted, session?.completedAt, view, route]);

  const navigate = target => {
    if (!['pins', 'correction'].includes(target)) generalView.current = target;
    setView(target); setMessage('');
    const targetRoute = ['pins', 'correction'].includes(target) ? `/cabling/${target}` : '/cabling';
    if (window.location.hash !== `#${targetRoute}`) window.location.hash = targetRoute;
    window.scrollTo({ top: 0 });
  };
  const theory = topic => {
    if (assessmentInProgress) return;
    if (onTheory) onTheory(topic);
    else { setLesson(topic === 'cabling-orientation' ? 0 : 1); navigate('learn'); }
  };
  function begin(kind = 'mixed', selectedMode = mode, questionIds) {
    const start = () => {
      const count = questionIds?.length || ({ mixed: 10, pin: 8, order: 2, type: 4 }[kind]);
      dispatch({ type: 'START', session: makeSession({ kind, mode: selectedMode, count, questionIds, now: iso() }) });
      navigate('train');
    };
    if (session && !session.completedAt) setDialog({ title: '훈련 전환', message: '이미 제출한 기록은 유지됩니다. 현재 문항의 미제출 답안은 새 훈련으로 바뀝니다.', label: '새 훈련 시작', onConfirm: start }); else start();
  }
  function exportData() { download(exportBackup(state), `NA2-study-실기학습기록-${new Date().toISOString().slice(0, 10)}.json`); setMessage('현재 기록의 백업을 내려받았습니다.'); }
  async function importData(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('64 MiB 이하의 백업 파일을 선택해 주세요.');
      const incoming = validateBackup(JSON.parse(await file.text()));
      setDialog({ title: '백업 기록 적용', message: `현재 기록을 가져온 백업으로 교체합니다. 가져올 제출 기록: ${incoming.events.length}건. 필요한 현재 기록은 먼저 백업해 주세요. 기존 앱 원본 저장 키는 변경하지 않습니다.`, label: '기록 가져오기', onConfirm: () => { dispatch({ type: 'IMPORT', state: incoming }); setMessage('백업 기록을 가져왔습니다.'); } });
    } catch (error) { setMessage(`가져오기 실패: ${error.message}`); }
  }
  function reset() {
    setDialog({ title: '학습 기록 초기화', message: '통합 앱의 실기 응답, 오답, 진행 중인 훈련, 배열 교정과 제작 연습을 초기화합니다. 필기와 기존 독립 앱의 기록은 유지됩니다. 필요한 기록은 먼저 백업해 주세요.', danger: true, label: '초기화', onConfirm: () => { dispatch({ type: 'RESET' }); setMessage('통합 앱의 실기 학습 기록을 초기화했습니다.'); } });
  }
  function rawBackup() {
    try { download(JSON.stringify({ saved: storage().getItem(STORE_KEY), legacy: storage().getItem(LEGACY_KEY) }, null, 2), 'NA2-cabling-복구용원본.json'); setRecoveryCopied(true); } catch { setMessage('브라우저 저장소 원본을 읽을 수 없습니다. 현재 화면의 기록 백업을 이용해 주세요.'); }
  }

  return <div className="cabling-module"><div className={`shell ${state.settings.motion ? '' : 'reduced-motion'}`}>
    <button className="skip-link" onClick={() => document.getElementById('cabling-main-content')?.focus()}>본문으로 이동</button>
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span>NA2 Study</div><p className="aside-sub">네트워크관리사 2급 · 실기 케이블링</p>
      <nav aria-label="주 메뉴">{NAV.map(([id, label]) => <button key={id} className={`nav-button ${view === id ? 'active' : ''}`} aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon name={id} /><span>{label}</span>{id === 'wrong' && summary.wrongIds.length > 0 && <small>{summary.wrongIds.length}</small>}</button>)}</nav>
      <a className="series-link" href="#/written"><span>필기 문제은행 바로가기</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4 10 14M10 4H4v16h16v-6" /></svg></a>
      <div className="sidebar-note"><strong>필기·실기 통합 학습</strong><p>표준 배열 학습부터 제작 연습까지</p></div>
    </aside>
    <main className="main-content" id="cabling-main-content" tabIndex="-1">
      <header className="page-header"><div><span className="eyebrow">NETWORK CABLING</span><h1>{TITLES[view]}</h1></div><span className="streak-pill">학습일 {summary.studyDays}일</span></header>
      {!saveAllowed && <section className="notice warning" role="alert"><strong>저장 기록 확인 필요</strong><p>{loaded.warning} 원본 보호를 위해 자동 저장을 멈췄습니다.</p><div className="actions"><button onClick={rawBackup}>복구용 원본 내려받기</button><button disabled={!recoveryCopied} onClick={() => setDialog({ title: '새 학습 기록 저장', message: '내려받은 복구용 원본을 보관해 주세요. 새 앱 저장 키를 현재 화면의 기록으로 교체합니다. 이전 앱 저장 키는 유지됩니다.', label: '저장 시작', onConfirm: () => setSaveAllowed(true) })}>새 기록 저장 시작</button></div></section>}
      {saveError && <div className="notice warning" role="alert">{saveError} <button onClick={exportData}>기록 백업</button></div>}
      {externalChange && <section className="notice warning" role="alert"><strong>다른 탭의 학습 기록 변경</strong><p>기록을 덮어쓰지 않도록 이 탭의 자동 저장을 멈췄습니다. 현재 탭의 미저장 답안이 필요하면 먼저 백업한 뒤 최신 기록을 불러오세요.</p><div className="actions"><button onClick={exportData}>현재 탭 기록 백업</button><button className="primary" onClick={() => location.reload()}>최신 기록 불러오기</button></div></section>}
      {message && <div className="notice" role="status">{message}<button className="text-button" aria-label="안내 닫기" onClick={() => setMessage('')}>닫기</button></div>}
      {assessmentInProgress && <div className="notice">진행 중인 평가의 답안은 저장되며, 오답 목록과 통계에는 회차 종료 후 표시됩니다.</div>}
      {view === 'home' && <div className="stack">
        <section className="hero"><div><span className="eyebrow">네트워크관리사 2급 실기</span><h2>케이블링</h2><p>T568A/B 핀 배열 · 직결과 크로스 결선<br />표준을 확인하고, 직접 배열하며 연습하세요.</p><button className="primary" onClick={() => begin('mixed', 'practice')}>혼합 훈련 시작</button></div><div className="hero-illustration" aria-hidden="true"><div className="mini-plug">{STANDARDS.T568B.map(id => <span key={id} className={WIRES[id].striped ? 'striped' : ''} style={{ '--wire': WIRES[id].color }} />)}</div><span>T568A / T568B</span></div></section>
        {session && !session.completedAt && <div className="session-banner"><div><strong>진행 중인 {MODES[session.mode]}</strong><span>{session.index + 1} / {session.ids.length}문항 · 제출한 답안과 현재 배열을 저장했습니다.</span></div><button onClick={() => navigate('train')}>이어서 풀기</button></div>}
        <section className="metrics" aria-label="학습 요약"><Metric title="누적 제출" value={`${summary.total}건`} detail="제출 1회당 1건" /><Metric title="평가 첫 응답 정답률" value={pct(summary.assessmentFirstAccuracy)} detail="평가에서 문항별 최초 응답" /><Metric title="복습할 문항" value={`${summary.wrongIds.length}개`} detail="가장 최근 응답이 오답인 문항" /><Metric title="학습한 날짜" value={`${summary.studyDays}일`} detail="실제 응답이 있는 날짜" /></section>
        <div className="section-heading"><div><h2>학습 과정</h2><p>개념을 확인한 뒤 유형별로 훈련합니다.</p></div><button className="text-button" onClick={() => navigate('learn')}>개념 학습 열기 →</button></div>
        <section className="course-grid">{[['pin', '01', '핀과 색상', '핀 번호와 색상 이름을 연결합니다.', '8문항'], ['order', '02', '배열 완성', '8개 전선을 목표 표준에 맞게 배열합니다.', 'A/B 2문항'], ['type', '03', '양 끝 결선', '두 배열을 비교하고 케이블 유형을 판별합니다.', '4문항']].map(([kind, n, title, detail, count]) => <article className="course-card" key={kind}><span className="course-number">{n}</span><h3>{title}</h3><p>{detail}</p><small>{count} · {KINDS[kind]}</small><button onClick={() => begin(kind, 'practice')}>연습 시작</button></article>)}</section>
        <section className="split-panel"><div><span className="eyebrow">제작 연습</span><h2>케이블 작업 10분</h2><p>실제 케이블을 제작하며 시간을 확인하고 점검 항목을 기록합니다.</p><small>배열 퀴즈의 점수와 실물 케이블 검사 결과는 별도로 관리합니다.</small></div><button className="primary" onClick={() => navigate('practical')}>제작 연습 열기</button></section>
      </div>}
      {view === 'learn' && (assessmentInProgress ? <AssessmentGate onReturn={() => navigate('train')} /> : <><div className="actions theory-actions"><button onClick={() => theory('cabling-t568')}>통합 이론 · T568A/B</button><button onClick={() => theory('cabling-orientation')}>통합 이론 · 관찰 방향</button></div><Learn showFigures={showReferenceFigures && !assessmentInProgress} selected={lesson} onSelect={setLesson} onTrain={() => begin('mixed', 'practice')} /></>)}
      {view === 'pins' && <PinDiagnosis state={state} blocked={assessmentInProgress} onReview={ids => begin('pin', 'review', ids)} onTheory={theory} onReturn={() => navigate('train')} />}
      {view === 'correction' && (assessmentInProgress ? <AssessmentGate onReturn={() => navigate('train')} /> : <Correction state={state} dispatch={dispatch} confirm={setDialog} onTheory={theory} onRecheck={standard => begin('order', 'assessment', [`order-${standard.at(-1)}`])} />)}
      {view === 'train' && <div className="stack"><section className="content-panel"><div className="section-heading"><div><h2>훈련 선택</h2><p>연습은 힌트를 볼 수 있으며, 평가는 힌트 없이 풉니다.</p></div><div className="tabs" role="group" aria-label="훈련 방식">{['practice', 'assessment'].map(m => <button key={m} className={mode === m ? 'selected' : ''} aria-pressed={mode === m} onClick={() => setMode(m)}>{MODES[m]}</button>)}</div></div><div className="training-choices">{[['mixed', '혼합 10문항'], ['pin', '핀 · 색상 8문항'], ['order', '배열 A/B 2문항'], ['type', '유형 판별 4문항']].map(([kind, label]) => <button key={kind} onClick={() => begin(kind)}>{label} 시작</button>)}</div></section>
        {session ? session.completedAt ? <Result session={session} events={state.events} onRetry={ids => begin('mixed', 'review', ids)} onHome={() => navigate('home')} /> : <Training session={session} question={question} dispatch={dispatch} autoNext={state.settings.autoNext} /> : <div className="empty-state"><Icon name="train" /><h2>훈련 유형 선택</h2><p>핀 · 색상 확인, 배열 완성, 유형 판별을 선택할 수 있습니다.</p></div>}
      </div>}
      {view === 'wrong' && <div className="stack"><section className="split-panel"><div><h2>오답 복습</h2><p>각 문항의 가장 최근 응답을 기준으로 표시합니다. 다시 맞히면 목록에서 빠지며 과거 기록은 유지됩니다.</p></div><button className="primary" disabled={!summary.wrongIds.length} onClick={() => begin('mixed', 'review', summary.wrongIds)}>오답 {summary.wrongIds.length}개 복습</button></section>{summary.wrongIds.length ? summary.wrongIds.map(id => <article className="question-row" key={id}><div><small>{KINDS[BY_ID[id].kind]}</small><h3>{BY_ID[id].prompt}</h3></div><button onClick={() => begin('mixed', 'review', [id])}>다시 풀기</button></article>) : <div className="empty-state"><h2>오답 복습 대상 없음</h2><p>훈련 중 틀린 문항이 생기면 이곳에 모입니다.</p></div>}</div>}
      {view === 'practical' && <Practical showFigures={showReferenceFigures && !assessmentInProgress} practical={state.practical} clock={clock} dispatch={dispatch} confirm={setDialog} />}
      {view === 'stats' && <Records state={displayState} summary={summary} onExport={exportData} onImport={() => importRef.current.click()} onReset={reset} />}
      {view === 'about' && <div className="stack"><section className="content-panel"><h2>학습 범위와 이용 안내</h2><p>네트워크관리사 2급 실기의 케이블링 학습을 지원합니다. 표준 배열과 결선 관계를 연습하고, 실제 제작 연습 시간을 기록합니다.</p><p>앱에서 맞힌 배열은 실물 케이블의 압착·접촉·통신 성능을 검증하지 않습니다. 제작한 케이블은 실제 테스터와 실습 지도로 확인해 주세요.</p><p>학습 기록은 이 브라우저에 저장됩니다. 다른 기기와 자동 동기화되지 않으며, 브라우저 데이터 삭제에 대비해 백업을 내려받을 수 있습니다.</p><p>화면에 제공되는 문제는 학습용 자체 제작 문항입니다. 공식 기출문제나 합격 예측 점수로 표시하지 않습니다.</p></section>
        <section className="content-panel"><h2>설정</h2><label className="setting-row"><span><strong>문제 자동 진행</strong><small>제출 후 2.5초 뒤 다음 문항으로 이동합니다. 기본은 수동 진행입니다.</small></span><input type="checkbox" checked={state.settings.autoNext} onChange={e => dispatch({ type: 'SETTINGS', settings: { autoNext: e.target.checked } })} /></label><label className="setting-row"><span><strong>선택 효과</strong><small>운영체제의 동작 감소 설정도 함께 적용합니다.</small></span><input type="checkbox" checked={state.settings.motion} onChange={e => dispatch({ type: 'SETTINGS', settings: { motion: e.target.checked } })} /></label></section>
        <section className="content-panel"><h2>내용 검토에 사용한 자료</h2><p>시험 안내는 현재 공개된 ICQA 안내 기준입니다. 응시 회차의 최신 안내를 함께 확인해 주세요.</p><Sources /></section>
      </div>}
      <footer className="footer">네트워크관리사 2급 학습 시리즈 <span>실기 · 케이블링</span></footer>
    </main><input ref={importRef} className="visually-hidden" tabIndex="-1" type="file" accept="application/json,.json" aria-label="학습 기록 백업 파일" onChange={importData} /><ConfirmDialog config={dialog} onClose={() => setDialog(null)} />
  </div></div>;
}

function AssessmentGate({ onReturn }) {
  return <section className="content-panel"><h2>평가 중 개념·교정 열람 제한</h2><p>진행 중인 평가의 정답이 드러나지 않도록 개념 설명과 배열 교정을 잠시 닫았습니다. 현재 답안은 저장되어 있습니다.</p><button className="primary" onClick={onReturn}>진행 중인 평가로 돌아가기</button></section>;
}

function PinDiagnosis({ state, blocked, onReview, onTheory, onReturn }) {
  const diagnosis = useMemo(() => pinDiagnostics(state), [state]);
  const [selected, setSelected] = useState([]);
  return <div className="stack"><section className="content-panel"><h2>핀별 오답 진단과 복습</h2><p>핀 하나의 색상을 고른 기록과 배열 문항에서 해당 위치를 맞힌 기록을 각각 표시합니다. 배열 제출 1건은 누적 제출에서도 1건입니다.</p>
    <div className="diagnosis-totals"><span>핀 단독 제출 <strong>{diagnosis.pinSubmissions}건</strong></span><span>배열 제출 <strong>{diagnosis.orderSubmissions}건</strong></span></div>
    {blocked && <p className="note">진행 중인 평가의 응답은 아래 진단에서 제외했습니다. 평가를 마친 뒤 복습과 이론을 열 수 있습니다.</p>}
    <div className="actions"><button disabled={blocked || !selected.length} className="primary" onClick={() => onReview(selected)}>선택한 핀 {selected.length}개 복습</button><button disabled={blocked || !diagnosis.reviewIds.length} onClick={() => onReview(diagnosis.reviewIds)}>최근 오답 위치 {diagnosis.reviewIds.length}개 복습</button><button disabled={blocked} onClick={() => onTheory('cabling-t568')}>T568A/B 이론 보기</button>{blocked && <button onClick={onReturn}>평가 이어서 풀기</button>}</div></section>
    {Object.keys(STANDARDS).map(standard => <section className="content-panel" key={standard}><h2>{standard} 핀별 진단</h2><div className="diagnosis-grid">{diagnosis.rows.filter(row => row.standard === standard).map(row => {
      const choose = selected.includes(row.questionId);
      const latestWrong = row.standalone.lastCorrect === false || row.position.lastCorrect === false;
      return <article className={`diagnosis-card ${latestWrong ? 'needs-review' : ''}`} key={row.questionId}><label><input type="checkbox" disabled={blocked} checked={choose} onChange={() => setSelected(ids => choose ? ids.filter(id => id !== row.questionId) : [...ids, row.questionId])} /><strong>{row.pin}번 핀</strong></label>
        <dl><div><dt>핀 단독 정답</dt><dd>{row.standalone.correct} / {row.standalone.total}건 <span>{pct(row.standalone.accuracy)}</span></dd></div><div><dt>배열 내 위치 정답</dt><dd>{row.position.correct} / {row.position.total}회 <span>{pct(row.position.accuracy)}</span></dd></div></dl>
        <small>{latestWrong ? '최근 응답에 오답이 있어 복습을 권합니다.' : row.standalone.total || row.position.total ? '최근 응답이 정답입니다.' : '아직 응답 기록이 없습니다.'}</small><button disabled={blocked} onClick={() => onReview([row.questionId])}>{row.pin}번 핀 복습</button></article>;
    })}</div><p className="note">각 비율은 해당 기록의 정답 수 / 응답 수입니다. 핀 복습을 맞혀도 과거 배열 진단과 원본 답안은 바뀌지 않습니다.</p></section>)}
  </div>;
}

function Correction({ state, dispatch, confirm, onTheory, onRecheck }) {
  const active = state.corrections.active;
  const records = state.corrections.records;
  const latestWrong = [...state.events].reverse().find(event => event.kind === 'order' && !event.correct);
  const buttons = useRef([]);
  function start(standard, sourceEventId = null) {
    const run = () => {
      const first = Math.floor(Math.random() * 8), second = (first + 1 + Math.floor(Math.random() * 7)) % 8;
      dispatch({ type: 'CORRECTION_START', standard, sourceEventId, pair: [first, second], at: iso() });
    };
    if (active && !active.completedAt) confirm({ title: '새 배열 교정 시작', message: '진행 중인 교정 배열을 바꿉니다. 퀴즈 원본 답안과 이미 완료한 교정 기록은 유지됩니다.', label: '새 교정 시작', onConfirm: run }); else run();
  }
  const mismatch = active ? active.draft.filter((id, index) => id !== STANDARDS[active.standard][index]).length : 0;
  return <div className="stack"><section className="content-panel"><h2>전선 배열 오류 교정</h2><p>두 핀을 차례로 선택하면 전선 위치가 바뀝니다. 교정은 힌트를 보며 익히는 연습이며, 퀴즈 점수와 오답 목록을 변경하지 않습니다.</p><div className="actions"><button onClick={() => start('T568A')}>T568A 두 핀 교환 연습</button><button onClick={() => start('T568B')}>T568B 두 핀 교환 연습</button><button disabled={!latestWrong} onClick={() => latestWrong && start(BY_ID[latestWrong.questionId].standard, latestWrong.id)}>최근 배열 오답으로 교정</button></div></section>
    {active ? <section className="content-panel"><div className="section-heading"><div><span className="eyebrow">{active.sourceEventId ? '실제 제출한 오답에서 시작' : '두 핀의 위치를 바꾼 연습 배열'}</span><h2>{active.standard} 배열 교정</h2></div><strong>교환 {active.swaps}회</strong></div><p className="note">금속 접점이 보이는 면 · 클립은 뒤쪽 · 케이블은 아래. Tab 또는 화살표로 이동하고 Enter·Space로 두 핀을 선택할 수 있습니다.</p>
      <div className="correction-pins" role="group" aria-label={`${active.standard} 교정 배열`}>{active.draft.map((id, index) => <button key={index} ref={node => { buttons.current[index] = node; }} disabled={Boolean(active.completedAt)} className={`correction-pin ${active.selectedPin === index ? 'chosen' : ''}`} aria-pressed={active.selectedPin === index} aria-label={`${index + 1}번 핀 ${WIRES[id].label}${active.selectedPin === index ? ' 선택됨' : ''}`} onClick={() => dispatch({ type: 'CORRECTION_SELECT', pin: index })} onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        buttons.current[event.key === 'Home' ? 0 : event.key === 'End' ? 7 : (index + (event.key === 'ArrowRight' ? 1 : 7)) % 8]?.focus();
      }}><strong>{index + 1}번</strong><Wire id={id} /></button>)}</div>
      <p className="correction-status" role="status">{active.completedAt ? '교정을 완료했습니다. 기존 퀴즈 답안과 점수는 그대로 보존했습니다.' : active.selectedPin === null ? mismatch ? `표준과 다른 위치 ${mismatch}개 · 바꿀 첫 번째 핀을 선택하세요.` : '표준 배열과 일치합니다. 교정 완료를 눌러 기록하세요.' : `${active.selectedPin + 1}번 핀 선택 · 바꿀 두 번째 핀을 선택하세요. 같은 핀을 누르면 선택을 취소합니다.`}</p>
      <div className="actions"><button className="primary" disabled={Boolean(active.completedAt) || mismatch !== 0} onClick={() => dispatch({ type: 'CORRECTION_FINISH', at: iso() })}>{active.completedAt ? '교정 완료됨' : '교정 완료'}</button><button onClick={() => onTheory('cabling-t568')}>T568A/B 이론 보기</button><button onClick={() => onTheory('cabling-orientation')}>관찰 방향 확인</button></div>
      {active.completedAt && <div className="actions"><button className="primary" onClick={() => onRecheck(active.standard)}>힌트 없이 새 평가로 재확인</button></div>}
      <details className="hint"><summary>표준 배열 참고</summary><Connector standard={active.standard} /></details><details className="hint"><summary>교정 전 원본 배열</summary><Connector values={active.original} title="보존된 원본 배열" /><p>{active.sourceEventId ? `제출 기록 ${active.sourceEventId}` : '연습 시작 시 생성한 배열입니다.'}</p></details>
    </section> : <div className="empty-state"><h2>교정 대상 배열 선택</h2><p>생성한 두 핀 오배열이나 실제 제출한 최근 배열 오답을 사용할 수 있습니다.</p></div>}
    <section className="content-panel"><h2>배열 교정 기록 {records.length}건</h2><p>교정 완료 횟수는 누적 퀴즈 제출과 정답률에 합산하지 않습니다. 학습 기록 백업에 함께 저장됩니다.</p>{records.length ? <div className="practical-records">{[...records].reverse().slice(0, 20).map(item => <details key={item.id}><summary><span>{stamp(item.completedAt)} · {item.standard}</span><strong>교환 {item.swaps}회 · 교정 완료</strong></summary><p>{item.sourceEventId ? '실제 오답에서 시작' : '생성한 두 핀 오배열에서 시작'}</p><p>원본: <Answer question={{ kind: 'order' }} answer={item.original} /></p><p>교정: <Answer question={{ kind: 'order' }} answer={item.answer} /></p><button onClick={() => onRecheck(item.standard)}>힌트 없이 새 평가로 재확인</button></details>)}</div> : <p className="empty-copy">아직 완료한 교정이 없습니다.</p>}</section>
  </div>;
}

function Learn({ selected, onSelect, onTrain, showFigures }) {
  const active = LESSONS[selected] || LESSONS[0];
  return <div className="stack"><div className="lesson-tabs" role="group" aria-label="개념 선택">{LESSONS.map((item, index) => <button key={item.id} className={selected === index ? 'selected' : ''} aria-pressed={selected === index} onClick={() => onSelect(index)}>{item.title}</button>)}</div>
    <section className="content-panel"><span className="eyebrow">개념 확인</span><h2>{active.title}</h2>{active.paragraphs.map((p, i) => <p key={i}>{p}</p>)}<Sources ids={active.sourceIds} /></section>
    <section className="content-panel"><div className="section-heading"><div><h2>T568A와 T568B</h2><p>1·2번과 3·6번에 배치되는 초록·주황 쌍이 서로 바뀝니다.</p></div></div><div className="connector-pair"><Connector standard="T568A" /><Connector standard="T568B" /></div><div className="wire-legend">{Object.keys(WIRES).map(id => <Wire key={id} id={id} />)}</div></section>
    <section className="content-panel"><h2>양 끝 결선 비교</h2><div className="map-grid"><div><h3>직결 · A–A 또는 B–B</h3><WireMap left="T568B" right="T568B" /></div><div><h3>크로스 · A–B 또는 B–A</h3><WireMap left="T568A" right="T568B" /></div></div><p className="note">오른쪽 그림은 10BASE-T·100BASE-TX의 두 쌍 교차 구성입니다. 1↔3, 2↔6이 바뀌며 4·5·7·8번은 같은 핀으로 이어집니다. 1000BASE-T의 네 쌍 교차 구성과 구분합니다.</p></section>
    {showFigures && active.id === 'orientation' && <TheoryFigures topicId="cabling-orientation" section={0}/>}
    <div className="actions"><button className="primary" onClick={onTrain}>개념을 확인했어요 · 연습 시작</button></div>
  </div>;
}

function Training({ session, question, dispatch, autoNext }) {
  const feedbackRef = useRef(null);
  useEffect(() => { if (session.submitted) feedbackRef.current?.focus(); }, [session.index, session.submitted]);
  const locked = Boolean(session.submitted);
  const answer = session.draft;
  const sequence = Array.isArray(answer) ? answer : [];
  const valid = question.kind === 'order' ? sequence.length === 8 : typeof answer === 'string' && answer.length > 0;
  return <section className="question-panel" aria-label="현재 문제"><div className="question-top"><span className="year-tag">{MODES[session.mode]} · {KINDS[question.kind]}</span><strong>{session.index + 1} / {session.ids.length}</strong></div><div className="progress"><span style={{ width: `${session.index / session.ids.length * 100}%` }} /></div><h2>{question.prompt}</h2>{session.mode === 'assessment' && <p className="note">평가는 회차를 마친 뒤 정답과 해설을 제공합니다.</p>}
    {question.kind === 'type' && <div className="connector-pair"><Connector standard={question.left} title={`왼쪽 ${question.left}`} /><Connector standard={question.right} title={`오른쪽 ${question.right}`} /></div>}
    {question.kind === 'pin' && <div className="single-connector"><Connector hidden standard={question.standard} title={`${question.standard} · ${question.pin}번 핀`} targetPin={question.pin} /></div>}
    {question.kind === 'order' && <><p className="note">전선 8개를 한 번씩 선택해 1번부터 채우세요. 선택한 전선은 다시 사용할 수 없습니다.</p><div className="single-connector"><Connector values={Array.from({ length: 8 }, (_, i) => sequence[i] || null)} title={`${question.standard} 배열`} compare={locked && session.mode !== 'assessment' ? question.answer : null} /></div></>}
    <fieldset disabled={locked} className="answer-field"><legend className="visually-hidden">답안 선택</legend>
      {question.kind === 'type' ? <div className="answer-types">{[['straight', '직결 케이블'], ['crossover', '크로스 케이블']].map(([id, label]) => <button key={id} className={answer === id ? 'chosen' : ''} aria-pressed={answer === id} onClick={() => dispatch({ type: 'ANSWER', answer: id })}>{label}</button>)}</div> : <div className="wire-palette">{session.palette.map(id => <button key={id} aria-label={WIRES[id].label} className={question.kind === 'pin' && answer === id ? 'chosen' : ''} aria-pressed={question.kind === 'pin' ? answer === id : undefined} disabled={locked || (question.kind === 'order' && sequence.includes(id))} onClick={() => dispatch({ type: 'ANSWER', answer: question.kind === 'order' ? [...sequence, id] : id })}><Wire id={id} /></button>)}</div>}
    </fieldset>
    {question.kind === 'order' && <div className="actions"><button disabled={locked || !sequence.length} onClick={() => dispatch({ type: 'ANSWER', answer: sequence.slice(0, -1) })}>한 칸 지우기</button><button disabled={locked || !sequence.length} onClick={() => dispatch({ type: 'ANSWER', answer: [] })}>배열 비우기</button></div>}
    {!locked && session.mode !== 'assessment' && <details className="hint"><summary>힌트 확인</summary>{question.kind === 'type' ? <p>같은 표준끼리는 직결, A와 B를 조합하면 10/100Mbps의 두 쌍 교차 구성입니다.</p> : <p>{STANDARDS[question.standard].map((id, i) => `${i + 1}번 ${WIRES[id].label}`).join(' / ')}</p>}</details>}
    {locked ? <div ref={feedbackRef} tabIndex="-1" className={`feedback ${session.mode === 'assessment' ? 'neutral' : session.submitted.correct ? 'correct' : 'incorrect'}`} role="status">{session.mode === 'assessment' ? <><strong>답안 제출 완료</strong><p>정답과 해설은 회차 종료 후 확인할 수 있습니다.</p></> : <><strong>{session.submitted.correct ? '정답' : '오답'}</strong><p>{question.explanation}</p><p className="answer-text">정답: <Answer question={question} answer={question.answer} /></p>{question.kind === 'order' && !session.submitted.correct && <p>다른 핀: {question.answer.map((id, i) => sequence[i] !== id ? `${i + 1}번` : null).filter(Boolean).join(', ')}</p>}<Sources ids={question.sourceIds} /></>}{autoNext && <small>자동 진행이 켜져 있습니다. 2.5초 뒤 이동합니다.</small>}</div> : null}
    <div className="question-actions">{locked ? <button className="primary" onClick={() => dispatch({ type: 'NEXT', at: iso() })}>{session.index === session.ids.length - 1 ? '결과 보기' : '다음 문제'}</button> : <button className="primary" disabled={!valid} onClick={() => dispatch({ type: 'SUBMIT', at: iso() })}>답안 제출</button>}<span>{locked ? '제출된 답안은 기록에 한 번만 반영됩니다.' : '답안 제출 전에는 선택을 바꿀 수 있습니다.'}</span></div>
  </section>;
}

function Answer({ question, answer }) {
  if (question.kind === 'order') return <>{(answer || []).map(id => WIRES[id]?.short || '?').join(' → ')}</>;
  if (question.kind === 'pin') return <>{WIRES[answer]?.label || '미응답'}</>;
  return <>{answer === 'straight' ? '직결 케이블' : answer === 'crossover' ? '크로스 케이블' : '미응답'}</>;
}
function Result({ session, events, onRetry, onHome }) {
  const answered = events.filter(e => e.sessionId === session.id);
  const correct = answered.filter(e => e.correct).length;
  const wrong = [...new Set(answered.filter(e => !e.correct).map(e => e.questionId))];
  return <section className="content-panel"><span className="eyebrow">훈련 완료</span><h2>{MODES[session.mode]} 결과</h2><div className="result-overview"><strong>{answered.length ? Math.round(correct / answered.length * 100) : 0}<small>%</small></strong><div><p>정답 {correct} / {answered.length}문항</p><p>학습용 정답률이며 실제 실기시험 점수와 다릅니다.</p></div></div><div className="actions"><button onClick={onHome}>대시보드</button><button className="primary" disabled={!wrong.length} onClick={() => onRetry(wrong)}>오답 {wrong.length}개 다시 풀기</button></div><div className="result-list">{answered.map((event, i) => <details key={event.id}><summary><span>{i + 1}. {BY_ID[event.questionId].prompt}</span><strong className={event.correct ? 'success-text' : 'error-text'}>{event.correct ? '정답' : '오답'}</strong></summary><p>내 답: <Answer question={BY_ID[event.questionId]} answer={event.answer} /></p><p>정답: <Answer question={BY_ID[event.questionId]} answer={BY_ID[event.questionId].answer} /></p><p>{BY_ID[event.questionId].explanation}</p></details>)}</div></section>;
}

function Practical({ practical, clock, dispatch, confirm, showFigures }) {
  const active = practical?.active;
  const records = practical?.records || [];
  const remaining = active ? Math.max(0, Math.ceil((new Date(active.deadlineAt).getTime() - clock) / 1000)) : 600;
  return <div className="stack"><section className="content-panel"><span className="eyebrow">실물 케이블 제작</span><h2>10분 제작 연습</h2><p>실제 케이블과 작업 도구를 준비한 뒤 시작하세요. 타이머는 다른 화면으로 이동하거나 새로고침해도 시작 시각을 기준으로 이어집니다.</p><p className="note">현재 공개된 ICQA 안내의 케이블 작업 시간은 10분, 배점은 6.5점입니다. 이 화면은 시간과 자기점검을 기록하며, 실제 케이블의 합격 여부를 판정하지 않습니다. <a href="https://www.icqa.or.kr/cn/faq?fm_id=2" target="_blank" rel="noreferrer">공식 안내</a></p>
      <div className={`timer ${remaining < 60 && active ? 'timer-warning' : ''}`} role="timer" aria-label={`남은 시간 ${Math.floor(remaining / 60)}분 ${remaining % 60}초`}>{secondsLabel(remaining)}</div><p className="center">{active ? '제작 중 · 점검한 항목을 선택하세요.' : '준비되면 타이머를 시작하세요.'}</p>
      <div className="checklist">{CHECKS.map((label, index) => <label key={label}><input type="checkbox" disabled={!active} checked={active?.checks[index] || false} onChange={e => dispatch({ type: 'PRACTICAL_CHECK', index, checked: e.target.checked })} /><span>{index + 1}. {label}</span></label>)}</div>
      <div className="actions center-actions">{active ? <button className="primary" onClick={() => confirm({ title: '제작 연습 종료', message: '현재까지의 시간과 자기점검 항목을 저장합니다. 미확인 항목은 미확인 상태로 남습니다.', label: '연습 완료', onConfirm: () => dispatch({ type: 'PRACTICAL_FINISH', at: iso() }) })}>연습 완료</button> : <button className="primary" onClick={() => dispatch({ type: 'PRACTICAL_START', at: iso() })}>10분 타이머 시작</button>}</div></section>
      <section className="content-panel"><h2>제작 연습 기록</h2>{records.length ? <div className="practical-records">{[...records].reverse().slice(0, 20).map(record => <details key={record.id}><summary><span>{stamp(record.startedAt)}</span><strong>{secondsLabel(record.elapsedSeconds)} · {record.expired ? '시간 종료' : '직접 완료'}</strong></summary><p>자기점검 {record.checks.filter(Boolean).length} / {CHECKS.length}개 · 실물 판정 아님</p><ul>{CHECKS.map((check, i) => <li key={check}>{record.checks[i] ? '확인' : '미확인'} · {check}</li>)}</ul></details>)}</div> : <p className="empty-copy">아직 제작 연습 기록이 없습니다.</p>}</section>
      {showFigures && <section className="content-panel"><h2>제작 자기점검 그림</h2><PracticalFigures ids={['cable-quality', 'cable-tester']}/></section>}
    </div>;
}

function Records({ state, summary, onExport, onImport, onReset }) {
  const days = summary.daily;
  const recent = [...state.events].sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt)).slice(0, 30);
  return <div className="stack"><div className="metrics"><Metric title="누적 제출" value={`${summary.total}건`} /><Metric title="전체 제출 정답률" value={pct(summary.accuracy)} /><Metric title="평가 첫 응답 정답률" value={pct(summary.assessmentFirstAccuracy)} /><Metric title="학습한 날짜" value={`${summary.studyDays}일`} /></div>
    <section className="content-panel"><div className="section-heading"><div><h2>최근 7일 학습</h2><p>이 브라우저의 날짜를 기준으로 실제 제출한 건수를 표시합니다.</p></div></div><div className="activity-chart">{days.map(day => <div className="chart-day" key={day.date}><strong>{day.total}</strong><div className="bar-space"><span style={{ height: `${day.total ? day.total / Math.max(...days.map(d => d.total), 1) * 100 : 0}%` }} /></div><span>{day.date.slice(5).replace('-', '/')}</span><small>{pct(day.accuracy)}</small></div>)}</div><p className="note">막대: 제출 건수 / 아래 비율: 해당 날짜의 정답률. 제출이 없는 날은 정답률을 표시하지 않습니다.</p></section>
    <section className="content-panel"><h2>유형별 학습</h2><div className="kind-stats">{Object.entries(KINDS).map(([kind, label]) => <Metric key={kind} title={label} value={pct(summary.byKind[kind]?.accuracy)} detail={`${summary.byKind[kind]?.correct || 0} / ${summary.byKind[kind]?.total || 0}건 정답`} />)}</div><p className="note">평가 첫 응답 정답률은 평가 모드에서 문항별 최초 제출만 계산합니다. 연습과 오답 복습의 힌트 사용 기록은 이 지표에 포함하지 않습니다.</p></section>
    <section className="content-panel"><div className="section-heading"><div><h2>기록 백업</h2><p>내보낸 JSON 파일로 다른 브라우저에서도 기록을 가져올 수 있습니다.</p></div></div><div className="actions"><button className="primary" onClick={onExport}>기록 내보내기</button><button onClick={onImport}>백업 가져오기</button><button className="text-button danger-text" onClick={onReset}>학습 기록 초기화</button></div></section>
    {state.legacy && <section className="content-panel"><h2>이전 앱 기록 보존</h2><p>이전 앱의 원본 기록을 별도로 보관했습니다. 과거 기록은 최근 활동 8건만 남고 날짜 정보가 불완전하므로 새 앱의 누적 통계에 합산하지 않습니다.</p><p>전체 기록 내보내기에 보존된 원문도 포함됩니다.</p></section>}
    <section className="content-panel"><h2>최근 응답 {recent.length}건</h2>{recent.length ? <div className="history-list">{recent.map(event => <article key={event.id}><div><small>{stamp(event.submittedAt)} · {MODES[event.mode]}</small><p>{BY_ID[event.questionId].prompt}</p></div><strong className={event.correct ? 'success-text' : 'error-text'}>{event.correct ? '정답' : '오답'}</strong></article>)}</div> : <p className="empty-copy">아직 제출한 답안이 없습니다.</p>}</section>
  </div>;
}
