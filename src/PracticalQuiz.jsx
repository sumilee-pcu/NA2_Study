import { useEffect, useRef, useState } from 'react';
import questionData from './content/practical-questions.json';
import { PRACTICAL_KEY, prepareBank, loadPractical, savePractical, practicalReducer, wrongQuestionIds, getLatestAttempts } from './practical-model.mjs';
import './practical-quiz.css';
import { QuizFigures } from './PracticalFigures.jsx';

const bank = prepareBank(questionData);
const TYPES = { short: '단답형', single: '단일 선택', multiple: '복수 선택' };
const STATUS = { correct: '정답', incorrect: '오답', unanswered: '미응답' };
const date = value => new Date(value).toLocaleString('ko-KR');
const timestamp = () => new Date().toISOString();
const emptyAnswer = question => question.type === 'short' ? '' : [];
const storage = () => {
  try { return window.localStorage; }
  catch { return { getItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); }, setItem() { throw new Error('브라우저 저장소에 접근할 수 없습니다.'); } }; }
};
function download(text, name, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Answer({ question, answer }) {
  if (question.type === 'short') return <span className="hub-quiz-answer-text">{answer?.trim() ? answer : '미응답'}</span>;
  if (!answer?.length) return <span>미응답</span>;
  return <span>{question.options.filter(option => answer.includes(option.id)).map(option => `${option.id}. ${option.text}`).join(' / ')}</span>;
}
function Explanation({ question }) {
  return <div className="hub-quiz-explanation">
    <p><strong>정답</strong> <Answer question={question} answer={question.answer}/></p>
    <p>{question.explanation}</p>
    <QuizFigures questionId={question.id}/>
    <details className="hub-quiz-sources"><summary>출처와 근거 확인</summary>
      <p>{bank.source.filename} · PDF {question.pdfPage}쪽의 학습 주제를 재구성했습니다.</p>
      <ul>{question.evidenceIds.map(id => <li key={id}><a href={bank.evidence[id].url} target="_blank" rel="noopener noreferrer">{bank.evidence[id].title}<span className="hub-sr-only"> (새 탭)</span></a><small>{bank.evidence[id].locator}</small></li>)}</ul>
    </details>
  </div>;
}
function Status({ value }) { return <span className={`hub-quiz-status is-${value}`}>{STATUS[value]}</span>; }

export default function PracticalQuiz({ visible = true }) {
  const [initial] = useState(() => loadPractical(storage(), bank));
  const [state, setState] = useState(initial.state);
  const current = useRef(initial.state);
  const observed = useRef(initial.raw);
  const saving = useRef(initial.canSave);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState(initial.state.session ? 'practice' : 'catalog');
  const [type, setType] = useState('all');
  const [topic, setTopic] = useState('all');
  const [pendingStart, setPendingStart] = useState(null);
  const [historyLimit, setHistoryLimit] = useState(30);
  const dialog = useRef(null);
  const heading = useRef(null);
  const feedback = useRef(null);
  const latest = getLatestAttempts(state);
  const wrongIds = wrongQuestionIds(state);
  const session = state.session;
  const question = session && bank.byId[session.questionIds[session.index]];
  const submitted = session && state.attempts.find(attempt => attempt.id === session.submittedAttemptId);
  const filtered = bank.questions.filter(q => (type === 'all' || q.type === type) && (topic === 'all' || q.topic === topic));
  const sessionAttempts = session ? state.attempts.filter(a => a.sessionId === session.id) : [];
  const answeredCount = Object.keys(latest).length;
  const correctCount = Object.values(latest).filter(a => a.status === 'correct').length;

  function send(action) {
    try {
      const next = practicalReducer(current.current, action, bank);
      if (next === current.current) return;
      if (saving.current) {
        const result = savePractical(storage(), next, bank, observed.current);
        if (result.ok) observed.current = result.raw;
        else { saving.current = false; setWarning(result.warning); }
      }
      current.current = next; setState(next); setNotice('');
    } catch (error) { setNotice(error.message); }
  }
  useEffect(() => {
    const changed = event => {
      if ((event.key === PRACTICAL_KEY || event.key === null) && event.newValue !== observed.current) {
        saving.current = false;
        setWarning('다른 탭에서 실기 문제풀이 기록이 변경되었습니다. 현재 기록을 백업한 뒤 새로고침해 주세요. 자동 저장을 중단했습니다.');
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  useEffect(() => {
    if (pendingStart && visible) dialog.current?.showModal(); else dialog.current?.close();
  }, [pendingStart, visible]);
  useEffect(() => { if (visible && view === 'practice') heading.current?.focus({ preventScroll: true }); }, [session?.id, session?.index, session?.completedAt, view, visible]);
  useEffect(() => { if (visible && submitted && view === 'practice') feedback.current?.focus({ preventScroll: true }); }, [submitted?.id, view, visible]);

  function startRun(questionIds, mode) {
    send({ type: 'START', questionIds, mode, at: timestamp(), id: crypto.randomUUID() });
    setView('practice'); setPendingStart(null);
  }
  function begin(questionIds, mode = 'practice') {
    if (!questionIds.length) return;
    if (session && !session.completedAt) setPendingStart({ questionIds, mode });
    else startRun(questionIds, mode);
  }
  function backup() {
    download(JSON.stringify(current.current, null, 2), `NA2-실기문제풀이-${new Date().toLocaleDateString('sv-SE')}.json`);
  }
  function backupStored() {
    try {
      const raw = storage().getItem(PRACTICAL_KEY);
      if (raw === null) { setNotice('브라우저에 저장된 실기 문제풀이 원본이 없습니다. 현재 기록 백업을 이용해 주세요.'); return; }
      download(raw, `NA2-실기문제풀이-저장원본-${new Date().toLocaleDateString('sv-SE')}.txt`, 'text/plain');
    } catch (error) { setNotice(`저장 원본을 읽을 수 없습니다. ${error.message}`); }
  }
  function submit(event) { event.preventDefault(); send({ type: 'SUBMIT', at: timestamp() }); }
  function skip() {
    send({ type: 'DRAFT', answer: emptyAnswer(question) });
    send({ type: 'SUBMIT', at: timestamp() });
  }
  const hasAnswer = question && (question.type === 'short' ? Boolean(session.draft.trim()) : session.draft.length > 0);

  // Keep the current in-memory draft after storage failure, even across menus.
  // During existing written/cabling assessments no quiz/answer DOM is rendered.
  if (!visible) return null;

  return <section className="hub-quiz" aria-label="실기 단답형과 객관식 문제풀이">
    <header className="hub-page-title hub-practical-title hub-quiz-title"><span className="hub-eyebrow">실기 학습 / 03</span><h1>단답형·객관식 문제풀이</h1><p>24문항으로 개념을 확인하고, 틀린 문제는 다시 풀어 보세요. 제출하면 정답과 해설을 확인할 수 있습니다.</p></header>
    {warning && <div className="hub-quiz-warning" role="alert"><strong>자동 저장 중단</strong><p>{warning}</p><p>화면에서 계속 푼 내용은 새로고침하거나 탭을 닫기 전에 현재 기록 백업으로 보관하세요.</p><div className="hub-actions"><button className="hub-button" onClick={backup}>현재 기록 백업</button><button className="hub-button" onClick={backupStored}>저장된 원본 받기</button><button className="hub-button" onClick={() => window.location.reload()}>새로고침</button></div></div>}
    {notice && <p className="hub-quiz-notice" role="alert">{notice}</p>}
    <nav className="hub-quiz-tabs" aria-label="실기 문제풀이 메뉴">
      <button className={view === 'catalog' ? 'is-active' : ''} aria-current={view === 'catalog' ? 'page' : undefined} onClick={() => setView('catalog')}>문제 선택</button>
      {session && <button className={view === 'practice' ? 'is-active' : ''} aria-current={view === 'practice' ? 'page' : undefined} onClick={() => setView('practice')}>{session.completedAt ? '최근 풀이 결과' : '진행 중 풀이'}</button>}
      <button className={view === 'review' ? 'is-active' : ''} aria-current={view === 'review' ? 'page' : undefined} onClick={() => setView('review')}>오답 복습 <span>{wrongIds.length}</span></button>
      <button className={view === 'history' ? 'is-active' : ''} aria-current={view === 'history' ? 'page' : undefined} onClick={() => setView('history')}>학습 기록</button>
    </nav>

    {view === 'catalog' && <>
      <div className="hub-quiz-metrics"><div><span>풀이한 문항</span><strong>{answeredCount}<small> / {bank.questions.length}</small></strong></div><div><span>최근 답안이 정답</span><strong>{correctCount}<small>문항</small></strong></div><div><span>복습할 문항</span><strong>{wrongIds.length}<small>문항</small></strong></div></div>
      {session && !session.completedAt && <div className="hub-quiz-resume"><div><strong>진행 중 문제풀이</strong><p>{session.mode === 'review' ? '오답 복습' : '문제풀이'} · {session.index + 1} / {session.questionIds.length}문항{session.submittedAttemptId ? ' · 제출한 답안 있음' : ' · 작성 중인 답안 보관'}</p></div><button className="hub-button primary" onClick={() => setView('practice')}>풀이 이어가기</button></div>}
      <section className="hub-panel hub-quiz-picker"><h2>연습 문제 선택</h2><div className="hub-quiz-filters"><label>문제 유형<select value={type} onChange={e => setType(e.target.value)}><option value="all">모든 유형</option>{Object.entries(TYPES).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><label>학습 주제<select value={topic} onChange={e => setTopic(e.target.value)}><option value="all">모든 주제</option>{[...new Set(bank.questions.map(q => q.topic))].map(value => <option key={value}>{value}</option>)}</select></label><button className="hub-button primary" disabled={!filtered.length} onClick={() => begin(filtered.map(q => q.id))}>{filtered.length}문항 풀기</button></div><p className="hub-quiz-caption">단답형 8문항 · 단일 선택 8문항 · 복수 선택 8문항. 학습용 재구성 문제이며 실제 시험의 출제 비율을 뜻하지 않습니다.</p></section>
      <section className="hub-quiz-list" aria-label="선택 가능한 문항"><div className="hub-quiz-section-heading"><h2>문항 목록</h2><span>{filtered.length}문항</span></div>{filtered.length ? filtered.map(q => <article className="hub-quiz-row" key={q.id}><div><div className="hub-quiz-row-meta"><span>{q.id}</span><span>{TYPES[q.type]}</span><span>{q.topic}</span>{latest[q.id] && <Status value={latest[q.id].status}/>}</div><h3>{q.prompt}</h3></div><button className="hub-button" onClick={() => begin([q.id])} aria-label={`${q.id} 풀기`}>풀기 <span aria-hidden="true">→</span></button></article>) : <p className="hub-quiz-empty">선택한 조건에 맞는 문항이 없습니다. 유형이나 주제를 바꿔 주세요.</p>}</section>
    </>}

    {view === 'practice' && session && !session.completedAt && question && <div className="hub-quiz-workspace">
      <article className="hub-quiz-question"><div className="hub-quiz-question-meta"><span>{session.mode === 'review' ? '오답 복습' : '개념 확인'} · {TYPES[question.type]}</span><strong>{session.index + 1} / {session.questionIds.length}</strong></div><progress value={session.index + (submitted ? 1 : 0)} max={session.questionIds.length} aria-label="제출한 문항 수"/><span className="hub-quiz-topic">{question.topic} · {question.id}</span><h2 ref={heading} tabIndex={-1}>{question.prompt}</h2>
        <form onSubmit={submit}>
          {question.type === 'short' ? <div className="hub-quiz-short"><label htmlFor="practical-answer">답안 입력</label><input id="practical-answer" value={session.draft} onChange={e => send({ type: 'DRAFT', answer: e.target.value })} maxLength={500} readOnly={Boolean(submitted)} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-describedby="practical-answer-hint"/><p id="practical-answer-hint">문제에서 요구한 형식과 단위를 확인하세요. 명령 이름은 지시에 따라 입력하세요.</p></div> : <fieldset className="hub-quiz-options" disabled={Boolean(submitted)}><legend>{question.type === 'multiple' ? '해당하는 답을 모두 선택하세요.' : '답 하나를 선택하세요.'}</legend>{question.options.map(option => <label key={option.id} className={session.draft.includes(option.id) ? 'is-selected' : ''}><input type={question.type === 'single' ? 'radio' : 'checkbox'} name={`answer-${question.id}`} value={option.id} checked={session.draft.includes(option.id)} onChange={e => send({ type: 'DRAFT', answer: question.type === 'single' ? [option.id] : e.target.checked ? [...session.draft, option.id] : session.draft.filter(id => id !== option.id) })}/><span className="hub-quiz-option-id">{option.id}</span><span>{option.text}</span></label>)}</fieldset>}
          {!submitted && <div className="hub-quiz-submit"><button className="hub-button primary" type="submit" disabled={!hasAnswer}>채점하기</button><button className="hub-button" type="button" onClick={skip}>모르겠어요</button><p>모르겠어요를 선택하면 미응답으로 저장하고 해설을 보여드립니다.</p></div>}
        </form>
        {submitted && <section className={`hub-quiz-feedback is-${submitted.status}`} ref={feedback} tabIndex={-1} aria-label="채점 결과"><div role="status"><Status value={submitted.status}/><h3>채점 결과</h3></div><p className="hub-quiz-your-answer"><strong>내 답안</strong> <Answer question={question} answer={submitted.answer}/></p><Explanation question={question}/><button className="hub-button primary" onClick={() => send({ type: 'NEXT', at: timestamp() })}>{session.index + 1 === session.questionIds.length ? '풀이 결과 보기' : '다음 문제'}</button><p className="hub-quiz-caption">이번 제출 기록은 유지됩니다. 다시 풀면 새로운 시도로 기록합니다.</p></section>}
      </article>
      <aside className="hub-panel hub-quiz-progress"><h2>현재 풀이 현황</h2><p>{session.questionIds.length}문항 중 {sessionAttempts.length}문항 제출</p><ol>{session.questionIds.map((id, index) => { const entry = sessionAttempts.find(a => a.questionId === id); return <li key={id} aria-current={index === session.index ? 'step' : undefined}><span>{index + 1}. {bank.byId[id].topic}</span>{entry ? <Status value={entry.status}/> : <small>{index === session.index ? '현재 문항' : '대기'}</small>}</li>; })}</ol><button className="hub-button" onClick={() => setView('catalog')}>문제 선택으로</button><p className="hub-quiz-caption">{warning ? '현재 탭에만 보관 중입니다. 새로고침 전에 기록을 백업하세요.' : '작성한 답안은 이 브라우저에 저장됩니다.'}</p></aside>
    </div>}

    {view === 'practice' && session?.completedAt && <section className="hub-panel hub-quiz-result"><span className="hub-eyebrow">풀이 종료</span><h2 ref={heading} tabIndex={-1}>풀이 결과</h2><div className="hub-quiz-result-counts">{Object.entries(STATUS).map(([value, label]) => <div key={value}><strong>{sessionAttempts.filter(a => a.status === value).length}</strong><span>{label}</span></div>)}</div><p>총 {session.questionIds.length}문항 · {date(session.completedAt)}<br/>오답과 미응답은 복습할 문항에 포함됩니다.</p><div className="hub-actions"><button className="hub-button primary" disabled={!sessionAttempts.some(a => a.status !== 'correct')} onClick={() => begin(sessionAttempts.filter(a => a.status !== 'correct').map(a => a.questionId), 'review')}>이번 오답·미응답 다시 풀기</button><button className="hub-button" onClick={() => setView('catalog')}>다른 문제 선택</button></div><div className="hub-quiz-history-list">{sessionAttempts.map(a => <Attempt key={a.id} attempt={a}/>)}</div></section>}

    {view === 'review' && <section><div className="hub-quiz-section-heading"><div><h2>오답 복습</h2><p>가장 최근 답안이 오답·미응답인 문항입니다. 다시 풀어 맞히면 이 목록에서 빠지고 이전 기록은 남습니다.</p></div><button className="hub-button primary" disabled={!wrongIds.length} onClick={() => begin(wrongIds, 'review')}>복습 {wrongIds.length}문항 풀기</button></div>{wrongIds.length ? <div className="hub-quiz-list">{wrongIds.map(id => { const q = bank.byId[id]; const entry = latest[id]; return <article className="hub-quiz-row" key={id}><div><div className="hub-quiz-row-meta"><span>{id}</span><span>{TYPES[q.type]}</span><Status value={entry.status}/></div><h3>{q.prompt}</h3><p><strong>최근 답안</strong> <Answer question={q} answer={entry.answer}/></p><small>{date(entry.at)}</small></div><button className="hub-button" onClick={() => begin([id], 'review')} aria-label={`${id} 다시 풀기`}>다시 풀기</button></article>; })}</div> : <div className="hub-quiz-empty"><h3>복습 대상 없음</h3><p>문제를 풀고 오답이나 미응답이 생기면 여기에 모입니다.</p><button className="hub-button" onClick={() => setView('catalog')}>문제 선택</button></div>}</section>}

    {view === 'history' && <section><div className="hub-quiz-section-heading"><div><h2>학습 기록</h2><p>누적 제출 {state.attempts.length}회 · 재풀이도 각각의 시도로 보관합니다.</p></div><button className="hub-button" onClick={backup}>실기 기록 백업</button></div><p className="hub-quiz-caption">이 기록은 현재 브라우저에 저장되며 다른 기기와 자동으로 동기화되지 않습니다. 백업 파일 가져오기는 아직 제공하지 않습니다.</p>{state.attempts.length ? <><div className="hub-quiz-history-list">{[...state.attempts].reverse().slice(0, historyLimit).map(a => <Attempt key={a.id} attempt={a}/>)}</div>{historyLimit < state.attempts.length && <button className="hub-button" onClick={() => setHistoryLimit(n => n + 30)}>이전 기록 더 보기</button>}</> : <p className="hub-quiz-empty">아직 제출한 답안이 없습니다.</p>}</section>}
    <p className="hub-quiz-footnote">{warning ? '자동 저장 중단 · 백업이 필요합니다.' : '답안과 진행 상황은 이 브라우저에 자동 저장됩니다.'} 학습용 채점 기준이며 공식 시험의 점수·답안 인정 범위를 뜻하지 않습니다.</p>
    <dialog ref={dialog} className="hub-quiz-dialog" aria-labelledby="quiz-dialog-title" onCancel={() => setPendingStart(null)} onClose={() => setPendingStart(null)}><h2 id="quiz-dialog-title">새 문제풀이 시작 확인</h2><p>이미 제출한 답안과 오답 기록은 유지됩니다. 진행 중인 풀이와 미제출 답안은 새 문제로 바뀝니다.</p><div className="hub-actions"><button className="hub-button" autoFocus onClick={() => setPendingStart(null)}>취소</button><button className="hub-button primary" onClick={() => pendingStart && startRun(pendingStart.questionIds, pendingStart.mode)}>새 풀이 시작</button></div></dialog>
  </section>;
}

function Attempt({ attempt }) {
  const q = bank.byId[attempt.questionId];
  return <details className="hub-quiz-history"><summary><span><small>{date(attempt.at)} · {attempt.mode === 'review' ? '오답 복습' : '문제풀이'} · {q.id}</small><strong>{q.prompt}</strong></span><Status value={attempt.status}/></summary><div><p><strong>제출한 답안</strong> <Answer question={q} answer={attempt.answer}/></p><Explanation question={q}/></div></details>;
}
