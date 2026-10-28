import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WRITTEN_BANK_CACHE as BANK_CACHE, createWrittenState as fresh,
  readWrittenProgress as readProgress, writeWrittenProgress,
  writtenRouteAction, mayShowWrittenTheory, writtenTheoryTopics,
} from './integration.mjs';
import { displayWrittenTitle } from './display-title.mjs';
import './styles.css';

const SUBJECTS = ['TCP/IP', '네트워크일반', 'NOS', '네트워크운용기기'];
const NAV = [['home', '▦', '대시보드'], ['bank', '▤', '문제은행'], ['wrong', '↻', '오답 · 북마크'], ['stats', '◷', '학습 기록'], ['about', 'ⓘ', '자료 안내']];
const today = () => new Date().toLocaleDateString('sv-SE');
const formatTime = (n) => {
  const hours = Math.floor(n / 3600); const clock = `${String(Math.floor(n % 3600 / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  return hours ? `${hours}:${clock}` : clock;
};

// 문제은행(약 24MB)은 처음 한 번만 내려받고 브라우저 Cache Storage에 보관한다.
// 파일이 바뀌면 빌드 때 계산한 __BANK_VERSION__이 달라져 새로 받는다.
async function loadBank(onProgress) {
  const url = new URL(`${import.meta.env.BASE_URL}data/bank.json?v=${__BANK_VERSION__}`, window.location.href).href;
  let cache = null;
  try { cache = await window.caches.open(BANK_CACHE); } catch { cache = null; }
  if (cache) {
    try { const hit = await cache.match(url); if (hit) return await hit.json(); } catch { await cache.delete(url).catch(() => {}); }
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('문제은행 파일을 찾을 수 없습니다.');
  let text;
  if (response.body && __BANK_BYTES__) {
    const reader = response.body.getReader(); const chunks = []; let received = 0;
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      chunks.push(value); received += value.length; onProgress(Math.min(99, Math.floor(received / __BANK_BYTES__ * 100)));
    }
    text = await new Blob(chunks).text();
  } else text = await response.text();
  const bank = JSON.parse(text);
  if (cache) {
    try {
      for (const request of await cache.keys()) if (request.url !== url) await cache.delete(request);
      await cache.put(url, new Response(text, { headers: { 'Content-Type': 'application/json' } }));
    } catch { /* 저장 공간이 부족하면 다음 접속 때 다시 내려받는다. */ }
  }
  onProgress(100);
  return bank;
}

export default function WrittenApp({ onTheory, questionTopics = {}, route = '/written', onAssessmentState }) {
  const [bank, setBank] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loadPercent, setLoadPercent] = useState(0);
  const [state, setState] = useState(readProgress);
  const [view, setView] = useState('home');
  const [year, setYear] = useState('all');
  const [filters, setFilters] = useState({ year: 'all', exam: 'all', subject: 'all', status: 'all', text: '' });
  const [review, setReview] = useState('wrong');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(null);
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const completedSessionId = useRef(null);
  const handledRoute = useRef(null);
  const assessmentActive = state.session?.mode === 'exam';

  useEffect(() => {
    if (typeof onAssessmentState === 'function') onAssessmentState(assessmentActive);
  }, [assessmentActive, onAssessmentState]);
  useEffect(() => {
    loadBank(setLoadPercent).then(setBank).catch((error) => setLoadError(error.message));
  }, []);
  useEffect(() => { try { writeWrittenProgress(localStorage, state); } catch { setToast('저장 공간이 부족합니다. 기록 메뉴에서 백업하세요.'); } }, [state]);
  useEffect(() => { if (!toast) return undefined; const id = setTimeout(() => setToast(''), 3200); return () => clearTimeout(id); }, [toast]);

  const exams = bank?.exams ?? [];
  const questions = bank?.questions ?? [];
  const examsById = useMemo(() => new Map(exams.map((exam) => [exam.id, exam])), [exams]);
  const questionsById = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);
  // 답을 고른 적이 있는 문항만 오답으로 센다(이전 버전에서 미응답으로 기록된 항목 제외).
  const wrongIds = questions.filter((question) => state.progress[question.id]?.attempts && state.progress[question.id].lastCorrect === false).map((question) => question.id);
  const attempts = Object.values(state.progress).reduce((sum, item) => sum + item.attempts, 0);
  const correct = Object.values(state.progress).reduce((sum, item) => sum + item.correct, 0);
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;

  function navigate(next) { setView(next); setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function confirm(title, message, action) { setDialog({ title, message, action }); }
  // 제한시간은 실전 시험에만 둔다. 연습은 시간 제한 없이 이어 풀 수 있다.
  function start(ids, mode, title, seconds = 0) {
    if (!ids.length) { setToast('학습할 문제가 없습니다.'); return; }
    const begin = () => {
      const started = Date.now(); setResult(null); const timed = mode === 'exam';
      setState((current) => ({ ...current, session: { id: `s${started}`, ids, mode, title, index: 0, answers: {}, checked: [], flags: [], started, deadline: timed ? started + seconds * 1000 : null, duration: timed ? seconds : null } }));
      navigate('quiz');
    };
    if (state.session) confirm('새 학습 시작 확인', '진행 중인 세션의 미채점 답안은 버려집니다.', begin); else begin();
  }
  function startExam(id, mode = 'practice') {
    const exam = examsById.get(id); if (!exam) return;
    start(questions.filter((question) => question.exam === id).map((question) => question.id), mode, `${exam.year}년 ${exam.round}회 · ${mode === 'exam' ? '실전 시험' : '회차 연습'}`, 3000);
  }
  function daily() {
    const unseen = questions.filter((question) => !state.progress[question.id]?.attempts);
    const seen = questions.filter((question) => state.progress[question.id]?.attempts);
    const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
    start([...shuffle(unseen), ...shuffle(seen)].slice(0, 10).map((question) => question.id), 'practice', '미풀이 우선 10문항');
  }
  function record(id, choice) {
    const answer = questionsById.get(id)?.answer;
    setState((current) => {
      const previous = current.progress[id] ?? { attempts: 0, correct: 0 };
      return { ...current, progress: { ...current.progress, [id]: { attempts: previous.attempts + (choice ? 1 : 0), correct: previous.correct + (choice === answer ? 1 : 0), lastCorrect: choice === answer, lastChoice: choice || null } }, days: choice && !current.days.includes(today()) ? [...current.days, today()] : current.days };
    });
  }
  function choose(number) {
    setState((current) => {
      const session = current.session; if (!session || session.checked.includes(session.ids[session.index])) return current;
      return { ...current, session: { ...session, answers: { ...session.answers, [session.ids[session.index]]: number } } };
    });
  }
  function checkAnswer() {
    const session = state.session; if (!session || session.mode !== 'practice') return;
    const id = session.ids[session.index]; if (!session.answers[id] || session.checked.includes(id)) return;
    record(id, session.answers[id]);
    setState((current) => ({ ...current, session: { ...current.session, checked: [...current.session.checked, id] } }));
  }
  function finish(expired = false) {
    const session = state.session; if (!session || completedSessionId.current === session.id) return;
    completedSessionId.current = session.id;
    setDialog(null);
    const score = session.ids.reduce((sum, id) => sum + (session.answers[id] === questionsById.get(id)?.answer ? 1 : 0), 0);
    const unanswered = session.ids.filter((id) => !session.answers[id]).length;
    const elapsed = Math.max(0, Math.round((Date.now() - session.started) / 1000));
    const completed = { ...session, correct: score, unanswered, seconds: session.mode === 'exam' && session.duration ? Math.min(session.duration, elapsed) : elapsed, expired };
    setResult(completed);
    setState((current) => {
      const progress = { ...current.progress };
      // 풀지 않은 문항은 기록하지 않아 미풀이로 남긴다(오답 목록에 넣지 않음).
      session.ids.filter((id) => !session.checked.includes(id) && session.answers[id]).forEach((id) => {
        const previous = progress[id] ?? { attempts: 0, correct: 0 }; const choice = session.answers[id]; const answer = questionsById.get(id)?.answer;
        progress[id] = { attempts: previous.attempts + 1, correct: previous.correct + (choice === answer ? 1 : 0), lastCorrect: choice === answer, lastChoice: choice };
      });
      const history = [{ id: session.id, title: session.title, date: new Date().toISOString(), total: session.ids.length, correct: score, unanswered, seconds: completed.seconds }, ...current.history.filter((item) => item.id !== session.id)].slice(0, 200);
      return { ...current, progress, history, days: Object.keys(session.answers).length && !current.days.includes(today()) ? [...current.days, today()] : current.days, session: null };
    });
    navigate('result');
  }
  function toggleBookmark(id) { setState((current) => ({ ...current, bookmarks: current.bookmarks.includes(id) ? current.bookmarks.filter((item) => item !== id) : [...current.bookmarks, id] })); }
  function resume() { if (!state.session) return; if (state.session.mode === 'exam' && Date.now() >= state.session.deadline) finish(true); else navigate('quiz'); }
  function filteredQuestions() {
    const status = view === 'wrong' ? review : filters.status; const query = filters.text.trim().toLowerCase().replace(/\s/g, '');
    return questions.filter((question) => {
      const exam = examsById.get(question.exam); const progress = state.progress[question.id];
      return (filters.year === 'all' || exam?.year === Number(filters.year)) && (filters.exam === 'all' || question.exam === filters.exam) && (filters.subject === 'all' || question.subject === filters.subject)
        && (status === 'all' || (status === 'wrong' && progress?.attempts && progress.lastCorrect === false) || (status === 'bookmark' && state.bookmarks.includes(question.id)) || (status === 'unseen' && !progress?.attempts) || (status === 'correct' && progress?.lastCorrect === true))
        && (!query || question.text.toLowerCase().replace(/\s/g, '').includes(query) || question.id.toLowerCase().includes(query));
    });
  }
  function exportBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = `NA2-Study_필기_${today()}.json`; link.click(); URL.revokeObjectURL(url);
  }
  async function importBackup(event) {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('백업 파일은 5MB 이하만 가져올 수 있습니다.');
      const value = JSON.parse(await file.text()); if (!value.progress || !Array.isArray(value.bookmarks) || !Array.isArray(value.history)) throw new Error('지원하지 않는 백업 형식입니다.');
      confirm('학습 기록 복원 확인', '현재 학습 기록을 백업 파일의 기록으로 대체합니다.', () => { setState({ ...fresh(), ...value, session: null }); setToast('백업 기록을 복원했습니다.'); });
    } catch (error) { setToast(error.message || '백업 파일을 읽지 못했습니다.'); }
  }

  useEffect(() => {
    if (!bank || state.session?.mode !== 'exam') return undefined;
    const tick = () => { const left = Math.max(0, Math.ceil((state.session.deadline - Date.now()) / 1000)); setRemaining(left); if (!left) finish(true); };
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [bank, state.session]);

  useEffect(() => {
    if (!bank || handledRoute.current === route) return;
    handledRoute.current = route;
    const action = writtenRouteAction(route, state.session, questionsById);
    if (action.kind === 'preserve') return;
    if (action.kind === 'missing') {
      setToast('문제은행에 없는 문항입니다. 현재 학습은 그대로 유지됩니다.');
      return;
    }
    if (action.kind === 'resume') {
      setState((current) => ({ ...current, session: { ...current.session, index: action.index } }));
      navigate('quiz');
      return;
    }
    // start() keeps an existing session intact until its confirmation is accepted.
    start([action.id], 'practice', `${action.id} · 개별 학습`);
  }, [route, bank, questionsById, state.session]);

  const studyDate = today();
  const session = state.session; const question = session ? questionsById.get(session.ids[session.index]) : null;
  const titles = { home: '학습 대시보드', bank: '전체 문제은행', wrong: '오답 · 북마크', stats: '학습 기록', about: '자료 · 이용 안내', quiz: '기출문제 풀이', result: '학습 결과' };
  if (loadError) return <div className="written-module"><main className="load-error"><h1>문제은행 로딩 실패</h1><p>{loadError}</p><p>네트워크 연결을 확인한 뒤 다시 열어 주세요. 다른 학습 메뉴는 계속 이용할 수 있습니다.</p></main></div>;
  if (!bank) return <div className="written-module"><main className="loading"><section className="load-card" aria-live="polite"><span className="year-tag">공지사항</span><h1>문제은행 로딩</h1><div className="progress" role="progressbar" aria-label="문제은행 내려받기" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadPercent}><span style={{ width: `${loadPercent}%` }} /></div><strong className="load-percent">{loadPercent}%</strong><ul className="load-notes"><li>처음 접속할 때만 문제 데이터(약 20MB)를 내려받음. 와이파이 환경에서 접속할 것</li><li>통신 상태에 따라 20~30초 걸릴 수 있음. 창을 닫지 말고 기다릴 것</li><li>한 번 받은 뒤에는 기기에 저장된 데이터로 바로 열림</li><li>학습 기록은 접속한 기기의 브라우저에만 저장됨. 카카오톡 안에서 열지 말고 크롬·사파리로 열어 같은 브라우저에서 계속 풀 것</li><li>연습 모드는 시간 제한 없음. 실전 시험만 50분 제한</li></ul></section></main></div>;

  return <div className="written-module"><div className="shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span>NA2 Study</div><p className="aside-sub">네트워크관리사 2급 · 기출문제은행</p><nav aria-label="필기 메뉴">{NAV.map(([id, icon, label]) => <button key={id} className={`nav-button ${view === id ? 'active' : ''}`} onClick={() => { if (id === 'wrong') setReview('wrong'); navigate(id); }}><span>{icon}</span>{label}</button>)}</nav><a className="series-link" href="#/cabling" title="통합 앱에서 실기 케이블링 열기"><span>실기 케이블링 바로가기</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4 10 14M10 4H4v16h16v-6" /></svg></a><div className="sidebar-note"><strong>기출문제 원문·답안표</strong><p>2022–2026 · 18회 · 900문항<br />원본 문제와 답안표 내장<br />학습 기록은 자동 저장돼요.</p></div></aside>
    <main className="main-content"><header className="page-header"><div><div className="eyebrow">NETWORK ADMINISTRATOR / LEVEL 2</div><h1>{titles[view]}</h1></div><span className="streak-pill">{state.days.includes(studyDate) ? `${studyDate} 채점 기록 있음` : `${studyDate} 채점 기록 없음`}</span></header>
      {session && view !== 'quiz' && <div className="session-banner"><div><strong>진행 중 학습</strong><span>{displayWrittenTitle(session.title)} · {session.index + 1}/{session.ids.length}번{session.mode === 'exam' ? ' · 타이머 진행 중' : ''}</span></div><button onClick={resume}>이어 풀기 →</button></div>}
      {view === 'home' && <Home exams={exams} questions={questions} state={state} year={year} setYear={setYear} accuracy={accuracy} wrongCount={wrongIds.length} onDaily={daily} onExam={startExam} />}
      {(view === 'bank' || view === 'wrong') && <QuestionBank view={view} questions={filteredQuestions()} filters={filters} setFilters={setFilters} exams={exams} state={state} page={page} setPage={setPage} review={review} setReview={setReview} wrongCount={wrongIds.length} onStart={(ids, count) => start(ids, 'practice', `조건별 학습 · ${count}문항`)} onBookmark={toggleBookmark} onSingle={(id) => start([id], 'practice', `${id} · 개별 학습`)} />}
      {view === 'quiz' && session && question && <Quiz questionTopics={questionTopics} onTheory={onTheory} session={session} question={question} exam={examsById.get(question.exam)} remaining={remaining} bookmarked={state.bookmarks.includes(question.id)} onBookmark={() => toggleBookmark(question.id)} onChoose={choose} onCheck={checkAnswer} onJump={(index) => setState((current) => ({ ...current, session: { ...current.session, index } }))} onFlag={() => setState((current) => ({ ...current, session: { ...current.session, flags: current.session.flags.includes(question.id) ? current.session.flags.filter((id) => id !== question.id) : [...current.session.flags, question.id] } }))} onFinish={() => confirm('학습 답안 제출 확인', '미응답 문항은 0점으로 반영합니다.', () => finish(false))} onHome={() => navigate('home')} />}
      {view === 'result' && result && <Result questionTopics={questionTopics} onTheory={onTheory} result={result} questionById={questionsById} examById={examsById} onHome={() => navigate('home')} onRetry={() => { const ids = result.ids.filter((id) => result.answers[id] !== questionsById.get(id)?.answer); start(ids, 'practice', `오답·미응답 복습 · ${ids.length}문항`); }} />}
      {view === 'stats' && <Stats questions={questions} state={state} attempts={attempts} correct={correct} onExport={exportBackup} onImport={importBackup} onReset={() => confirm('학습 기록 초기화 확인', '오답, 북마크, 학습 이력과 진행 중인 세션을 삭제합니다.', () => { setState(fresh()); setResult(null); })} />}
      {view === 'about' && <About exams={exams} />}
      <footer className="footer">NA2 Study · 필기 · 제공된 PDF의 문제와 가채점 답안표 기준 · 원문의 표기와 문항 순서를 보존합니다.</footer>
    </main>
    {toast && <div className="toast" role="status">{toast}</div>}
    {dialog && <div className="dialog-backdrop"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="written-dialog-title"><h2 id="written-dialog-title">{displayWrittenTitle(dialog.title)}</h2><p>{dialog.message}</p><div className="dialog-actions"><button onClick={() => setDialog(null)}>취소</button><button className="primary" onClick={() => { const action = dialog.action; setDialog(null); action(); }}>확인</button></div></section></div>}
  </div></div>;
}

function RelatedTheory({ questionId, questionTopics, onTheory, available }) {
  if (!available || typeof onTheory !== 'function') return null;
  const topics = writtenTheoryTopics(questionTopics, questionId);
  if (!topics.length) return null;
  return <section className="related-theory" aria-label="관련 이론"><h3>관련 이론</h3><div>{topics.map(topic => <button key={topic.id} onClick={() => onTheory(topic.id)}>{topic.title} <span aria-hidden="true">→</span></button>)}</div><small>이론을 확인하고 돌아와도 현재 학습 화면은 유지됩니다.</small></section>;
}

function Metric({ label, value, suffix = '' }) { return <div className="metric"><small>{label}</small><strong>{Number(value).toLocaleString()}<small>{suffix}</small></strong></div>; }

function Home({ exams, questions, state, year, setYear, accuracy, wrongCount, onDaily, onExam }) {
  return <section className="stack"><div className="hero"><div><span className="eyebrow">필기 기출문제</span><h2>네트워크관리사 2급 필기</h2><p>원문으로 풀고, 답안표로 확인하세요.<br />미풀이 문제부터 10문항을 골라드립니다.</p><button className="primary" onClick={onDaily}>미풀이 우선 10문항 시작 <span>→</span></button></div><div className="hero-count">900<small>18회 기출문제 · 4개 과목</small></div></div><div className="metrics"><Metric label="풀이 문항 수(중복 제외)" value={Object.values(state.progress).filter((item) => item.attempts).length} suffix="/ 900" /><Metric label="누적 정답률" value={accuracy} suffix="%" /><Metric label="오답 문항" value={wrongCount} suffix="문항" /><Metric label="북마크 문항" value={state.bookmarks.length} suffix="문항" /></div><div className="section-heading"><div><h2>연도·회차별 기출</h2><p>연습은 즉시 채점 · 실전은 50분 후 일괄 채점</p></div><div className="tabs">{['all', 2026, 2025, 2024, 2023, 2022].map((item) => <button key={item} className={String(year) === String(item) ? 'selected' : ''} onClick={() => setYear(item)}>{item === 'all' ? '전체' : item}</button>)}</div></div><div className="exam-grid">{[...exams].reverse().filter((exam) => year === 'all' || exam.year === Number(year)).map((exam) => { const solved = questions.filter((question) => question.exam === exam.id && state.progress[question.id]?.attempts).length; return <article className="exam-card" key={exam.id}><span className="year-tag">{exam.year}년</span><h3>제 {exam.round}회 기출문제</h3><p>{exam.date} · 50문항 · PDF {exam.startPage}–{exam.endPage}쪽</p><div className="progress"><span style={{ width: `${solved * 2}%` }} /></div><small>{solved}/50문항 학습</small><div className="exam-actions"><button onClick={() => onExam(exam.id)}>회차 연습</button><button className="primary" onClick={() => onExam(exam.id, 'exam')}>실전 시험</button></div></article>; })}</div></section>;
}

function QuestionBank({ view, questions, filters, setFilters, exams, state, page, setPage, review, setReview, wrongCount, onStart, onBookmark, onSingle }) {
  const [studyCount, setStudyCount] = useState('10');
  const pages = Math.max(1, Math.ceil(questions.length / 20)); const visible = questions.slice((page - 1) * 20, page * 20);
  const change = (key, value) => { setFilters((current) => ({ ...current, [key]: value, ...(key === 'year' ? { exam: 'all' } : {}) })); setPage(1); };
  const yearExams = exams.filter((exam) => filters.year === 'all' || exam.year === Number(filters.year));
  return <section className="stack">{view === 'wrong' && <div className="tabs"><button className={review === 'wrong' ? 'selected' : ''} onClick={() => { setReview('wrong'); setPage(1); }}>오답 {wrongCount}</button><button className={review === 'bookmark' ? 'selected' : ''} onClick={() => { setReview('bookmark'); setPage(1); }}>북마크 {state.bookmarks.length}</button></div>}<div className="filter-panel"><label>검색어<input value={filters.text} placeholder="예: DNS, 서브넷, Linux" onChange={(event) => change('text', event.target.value)} /></label><label>연도<select value={filters.year} onChange={(event) => change('year', event.target.value)}><option value="all">모든 연도</option>{[2026, 2025, 2024, 2023, 2022].map((item) => <option key={item}>{item}</option>)}</select></label><label>회차<select value={filters.exam} onChange={(event) => change('exam', event.target.value)}><option value="all">모든 회차</option>{yearExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.year}년 {exam.round}회</option>)}</select></label><label>과목<select value={filters.subject} onChange={(event) => change('subject', event.target.value)}><option value="all">모든 과목</option>{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>{view === 'bank' && <label>학습 상태<select value={filters.status} onChange={(event) => change('status', event.target.value)}><option value="all">모든 상태</option><option value="unseen">미풀이</option><option value="wrong">오답</option><option value="bookmark">북마크</option><option value="correct">최근 정답</option></select></label>}<button className="text-button clear-filter" onClick={() => { setFilters({ year: 'all', exam: 'all', subject: 'all', status: 'all', text: '' }); setPage(1); }}>필터 초기화</button></div><div className="bank-toolbar"><strong>{questions.length.toLocaleString()}문항</strong><div><select value={studyCount} onChange={event => setStudyCount(event.target.value)} aria-label="학습 문항 수"><option value="10">10문항</option><option value="20">20문항</option><option value="50">50문항</option><option value="all">전체</option></select><button className="primary" disabled={!questions.length} onClick={() => { const value = studyCount; const count = value === 'all' ? questions.length : Math.min(Number(value), questions.length); const shuffled = [...questions].sort(() => Math.random() - 0.5); onStart(shuffled.slice(0, count).map((question) => question.id), count); }}>조건별 학습 시작</button></div></div>{visible.length ? <div className="question-list">{visible.map((question) => { const exam = exams.find((item) => item.id === question.exam); const progress = state.progress[question.id]; const title = question.title || question.text; return <article className="question-row" key={question.id}><div><small>{exam?.year}년 제{exam?.round}회 · {question.subject} · {question.number}번</small><p>{title}</p><small>{progress?.attempts ? `최근 ${progress.lastCorrect ? '정답' : '오답'} · ${progress.attempts}회 풀이` : '미풀이'}{state.bookmarks.includes(question.id) ? ' · 북마크' : ''}</small></div><div className="row-actions"><button aria-label="북마크" aria-pressed={state.bookmarks.includes(question.id)} onClick={() => onBookmark(question.id)}>{state.bookmarks.includes(question.id) ? '★' : '☆'}</button><button className="primary" onClick={() => onSingle(question.id)}>풀기</button></div></article>; })}</div> : <div className="empty">조건에 맞는 문제가 없습니다.</div>}<div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>다음</button></div></section>;
}

function Quiz({ session, question, exam, remaining, bookmarked, onBookmark, onChoose, onCheck, onJump, onFlag, onFinish, onHome, questionTopics, onTheory }) {
  const answer = session.answers[question.id]; const checked = session.checked.includes(question.id); const correct = answer === question.answer;
  return <section className="stack"><div className="quiz-heading"><div><h2>{displayWrittenTitle(session.title)}</h2><p>{session.mode === 'exam' ? '실전 모드 · 제출 전까지 정답 비공개 · 제한시간 50분' : '연습 모드 · 문항별 정답 확인 · 시간 제한 없음'}</p></div><div className="quiz-tools">{session.mode === 'exam' && <strong className="timer">{formatTime(remaining)}</strong>}<button onClick={onHome}>저장 후 홈</button></div></div><div className="quiz-layout"><article className="question-panel"><div className="panel-top"><span className="year-tag">{session.index + 1} / {session.ids.length} · {question.subject}</span><button aria-pressed={bookmarked} onClick={onBookmark}>{bookmarked ? '★ 북마크' : '☆ 북마크'}</button></div><h2>{exam?.year}년 제{exam?.round}회 · {question.number}번</h2><div className="source-meta">PDF {question.pages?.join(', ')}쪽 · 원문 이미지</div><div className="source-paper">{question.images.map((image, index) => <img key={index} src={image} alt={`${question.exam} ${question.number}번 문제 원문 ${index + 1}`} />)}</div><div className="choices">{[1, 2, 3, 4].map((number) => <button key={number} className={`choice ${answer === number ? 'selected' : ''} ${checked && number === question.answer ? 'correct' : ''} ${checked && answer === number && !correct ? 'incorrect' : ''}`} disabled={checked} aria-pressed={answer === number} onClick={() => onChoose(number)}>{['①', '②', '③', '④'][number - 1]}</button>)}</div>{checked ? <div className={correct ? 'feedback' : 'feedback bad'}><strong>{correct ? `정답 · ${question.answer}번` : `오답 · 정답 ${question.answer}번`}</strong><p>내 답안 {answer}번 · 가채점 답안표 기준</p><details><summary>원본 답안표 보기</summary><img className="answer-image" src={exam?.answerImage} alt={`${exam?.year}년 ${exam?.round}회 답안표`} /></details><RelatedTheory questionId={question.id} questionTopics={questionTopics} onTheory={onTheory} available={mayShowWrittenTheory({ mode: session.mode, checked })} /></div> : session.mode === 'practice' ? <button className="primary full-button" disabled={!answer} onClick={onCheck}>정답 확인</button> : <p className="notice">{answer ? `${answer}번 답안이 저장되었습니다.` : '보기를 읽고 답안을 선택하세요.'}</p>}<div className="quiz-bottom"><button onClick={onFlag}>{session.flags.includes(question.id) ? '검토 표시 해제' : '나중에 검토 표시'}</button><div><button disabled={session.index === 0} onClick={() => onJump(session.index - 1)}>이전</button><button disabled={session.index === session.ids.length - 1} onClick={() => onJump(session.index + 1)}>다음</button></div></div></article><aside className="navigator"><strong>문항 이동</strong><div className="question-nav">{session.ids.map((id, index) => <button key={id} className={`${index === session.index ? 'current ' : ''}${session.answers[id] ? 'answered ' : ''}${session.flags.includes(id) ? 'flagged' : ''}`} onClick={() => onJump(index)}>{index + 1}</button>)}</div><button className="primary full-button" onClick={onFinish}>제출하고 채점</button></aside></div></section>;
}

function Result({ result, questionById, examById, onHome, onRetry, questionTopics, onTheory }) {
  const missed = result.ids.filter((id) => result.answers[id] !== questionById.get(id)?.answer);
  return <section className="stack"><div className="result-panel"><div><span className="year-tag">{result.expired ? '시간 종료 · 자동 제출' : '학습 완료'}</span><h2>{displayWrittenTitle(result.title)}</h2><div className="result-score">{Math.round(result.correct / result.ids.length * 100)}<small>점</small></div></div><div className="result-meta"><p>정답 <strong>{result.correct}</strong> / {result.ids.length}문항</p><p>오답 {result.ids.length - result.correct - result.unanswered} · 미응답 {result.unanswered}</p><p>소요 시간 {formatTime(result.seconds)}</p></div><div className="result-actions"><button onClick={onHome}>대시보드로</button><button className="primary" disabled={!missed.length} onClick={onRetry}>오답·미응답 {missed.length}문항 다시 풀기</button></div></div><div className="review-panel"><h2>문항별 채점</h2>{result.ids.map((id, index) => { const question = questionById.get(id); const exam = examById.get(question?.exam); const answer = result.answers[id]; return <details className="review-item" key={id}><summary>{index + 1}. {question?.exam} · {question?.number}번 · {answer === question?.answer ? '정답' : answer ? '오답' : '미응답'} <span>내 답 {answer || '—'} / 정답 {question?.answer}</span></summary><div className="source-paper">{question?.images.map((image, imageIndex) => <img key={imageIndex} src={image} alt={`${id} 원문 ${imageIndex + 1}`} />)}</div><img className="answer-image" src={exam?.answerImage} alt="회차 답안표" /><RelatedTheory questionId={id} questionTopics={questionTopics} onTheory={onTheory} available={mayShowWrittenTheory({ completed: true })} /></details>; })}</div></section>;
}

function Stats({ questions, state, attempts, correct, onExport, onImport, onReset }) {
  const solved = Object.values(state.progress).filter((item) => item.attempts).length;
  return <section className="stack"><div className="metrics"><Metric label="풀이 문항 수(중복 제외)" value={solved} /><Metric label="총 응답 횟수" value={attempts} /><Metric label="누적 정답률" value={attempts ? Math.round(correct / attempts * 100) : 0} suffix="%" /><Metric label="학습 일수" value={state.days.length} suffix="일" /></div><div className="content-panel"><h2>과목별 정답률</h2>{SUBJECTS.map((subject) => { const items = questions.filter((question) => question.subject === subject).map((question) => state.progress[question.id]).filter(Boolean); const total = items.reduce((sum, item) => sum + item.attempts, 0); const wins = items.reduce((sum, item) => sum + item.correct, 0); return <div className="stats-row" key={subject}><span>{subject}</span><div className="progress"><span style={{ width: `${total ? wins / total * 100 : 0}%` }} /></div><small>{total ? Math.round(wins / total * 100) : 0}% ({wins}/{total})</small></div>; })}</div><div className="content-panel"><div className="section-heading"><h2>최근 학습 이력</h2><small>최대 200개 세션</small></div>{state.history.length ? state.history.map((item) => <div className="history-row" key={item.id}><div><strong>{displayWrittenTitle(item.title)}</strong><small>{new Date(item.date).toLocaleString('ko-KR')} · {formatTime(item.seconds)}</small></div><strong>{Math.round(item.correct / item.total * 100)}점 <small>{item.correct}/{item.total}</small></strong></div>) : <p className="empty">학습을 마치면 이곳에 결과가 쌓입니다.</p>}</div><div className="content-panel"><h2>학습 기록 백업</h2><p>기록은 이 브라우저에 자동 저장됩니다. 다른 기기에서 이어가려면 백업을 내보내고 가져오세요.</p><div className="backup-actions"><button onClick={onExport}>백업 내보내기</button><label className="button-label">백업 가져오기<input type="file" accept="application/json,.json" onChange={onImport} /></label><button className="danger" onClick={onReset}>기록 초기화</button></div></div></section>;
}

function About({ exams }) {
  return <section className="stack"><div className="content-panel"><span className="year-tag">PDF 기반 자료 안내</span><h2>기출문제 900문항과 답안표</h2><p>제공된 네트워크관리사 2급 필기 과년도 문제 PDF를 기준으로 구성했습니다.</p><ul><li>2022–2025년 각 4회, 2026년 2회: 총 {exams.length}회 × 50문항.</li><li>문제·보기·표·그림은 PDF에서 분리한 원본 이미지입니다.</li><li>정답은 각 회차 하단의 가채점 답안표를 기준으로 합니다.</li><li>제공 자료에는 별도 해설이 없어 답안표 근거만 제공합니다.</li><li>과년도 PDF는 응시자 안내 노션 페이지에서 받을 수 있습니다.</li></ul></div><div className="content-panel"><h2>학습 방식</h2><ul><li><strong>회차 연습:</strong> 문항별 정답을 확인합니다. 시간 제한이 없습니다.</li><li><strong>실전 시험:</strong> 50분 제한, 제출 전 정답 비공개입니다. 중간에 나가도 제한시간은 계속 흐릅니다.</li><li><strong>미풀이 우선 10문항:</strong> 미풀이 문항을 우선해 10개를 선택합니다. 시간 제한이 없습니다.</li><li><strong>학습 재개:</strong> 답안과 위치를 자동 저장합니다.</li><li><strong>오답 목록:</strong> 답을 고른 문항만 채점해 담습니다. 풀지 않은 문항은 미풀이로 남습니다.</li></ul><p className="notice">확정 답안이나 최신 개정 여부를 외부에서 확인한 자료는 아닙니다. 채점 기준은 제공된 PDF의 가채점 답안표입니다.</p></div></section>;
}
