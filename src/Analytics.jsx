import {useEffect,useState} from 'react';
import {TOPICS} from './content/learning.mjs';
import questions from './content/practical-questions.json';
import index from './content/written-index.json';
import {LABS} from './content/practical-labs.mjs';
import {gradeLab,validateLabState} from './practical-lab-model.mjs';
import {validateLearning} from './learning-model.mjs';
import {prepareBank,validatePractical} from './practical-model.mjs';
import {validateBackup,stats as cableStats} from './modules/cabling/model.mjs';
import {snapshot,analyze,percent} from './analytics-model.mjs';
import './analytics.css';
const bank=prepareBank(questions);
const fmt=v=>v===null?'—':`${v}%`;
function read(){try{return snapshot(window.localStorage);}catch{return {records:{},warnings:['브라우저 저장소에 접근할 수 없습니다.']};}}
function exportRecords(records){const url=URL.createObjectURL(new Blob([JSON.stringify({format:'NA2-record-bundle',version:1,exportedAt:new Date().toISOString(),records},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='NA2-전체기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export default function Analytics(){
 const [data,setData]=useState(read);const [filter,setFilter]=useState('전체');const [page,setPage]=useState(1);
 useEffect(()=>{const refresh=()=>setData(read());window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh);};},[]);
 const warnings=[...data.warnings], states={};
 for(const name of ['learning','written','practical','labs','cabling']){const value=data.records[`na2_study_${name}_v1`];if(!value)continue;try{states[name]=name==='learning'?validateLearning(value):name==='practical'?validatePractical(value,bank):name==='labs'?validateLabState(value):name==='cabling'?validateBackup(value):(()=>{if(!value.progress||!Array.isArray(value.history))throw Error();return value;})();}catch{warnings.push(`${name}: 유효하지 않은 기록은 통계에서 제외했습니다.`);}}
 const result=analyze(states,index,TOPICS,questions.questions);
 const labs=LABS.filter(l=>states.labs?.entries[l.id]?.checked).map(l=>({lab:l,result:gradeLab(l,states.labs.entries[l.id].answers),help:states.labs.entries[l.id].usedSolution}));
 const cable=states.cabling?cableStats(states.cabling):null;
 const wrong=result.wrong.filter(w=>filter==='전체'||w.area===filter);const pages=Math.max(1,Math.ceil(wrong.length/15));const current=Math.min(page,pages);
 return <div className="analytics"><section className="analytics-hero"><div><span className="hub-eyebrow">MY LEARNING / LOCAL RECORDS</span><h1>나의 학습 분석</h1><p>공부한 범위와 실제 이해도를 따로 확인하고,<br/>틀린 문제부터 다음 학습을 이어가세요.</p></div><div className="analytics-actions"><button onClick={()=>setData(read())}>기록 새로고침</button><button onClick={()=>exportRecords(data.records)}>전체 기록 내보내기</button></div></section>
 {warnings.map(w=><p role="alert" className="hub-warning" key={w}>{w}</p>)}
 <div className="analytics-cards"><article><span>이론 읽기</span><strong>{result.theoryDone}<small> / {result.theoryTotal}</small></strong><p>읽음 표시한 주제</p></article><article><span>남은 오답·미응답</span><strong>{result.wrong.length}<small>문항</small></strong><p>이론·필기·실기 최신 결과</p></article><article><span>최근 필기 평균</span><strong>{result.recentAverage??'—'}<small>점</small></strong><p>최근 최대 5회 제출</p></article><article><span>이전 5회 대비</span><strong>{result.change===null?'—':`${result.change>0?'+':''}${result.change}`}<small>점</small></strong><p>비교 기록이 없으면 — 표시</p></article></div>
 <section className="analytics-panel"><h2>영역별 학습률</h2><p>학습률 = 풀이한 고유 문항 / 전체 문항 · 정답 달성률 = 최신 정답 문항 / 전체 문항</p>{result.rows.map(r=><div className="analytics-progress" key={r.label}><a href={r.href}>{r.label}</a><div><progress max="100" value={r.coverage??0}/><small>{r.done} / {r.total}문항</small></div><span>학습 {fmt(r.coverage)}<br/>정답 달성 {fmt(r.mastery)}<br/>풀이 정답률 {fmt(r.accuracy)}</span></div>)}<p className="analytics-note">영역별 문항 수와 난도가 달라 단순 평균을 합격률로 표시하지 않습니다. 이론 읽기와 개념 점수는 별개입니다.</p></section>
 <div className="analytics-columns"><section className="analytics-panel"><h2>필기 과목별 누적 정답률</h2>{result.subjects.map(s=><div className="analytics-subject" key={s.subject}><span>{s.subject}</span><strong>{fmt(s.accuracy)}</strong><progress max="100" value={s.accuracy??0}/><small>{s.attempts}회 응답 · 재풀이 포함</small></div>)}</section><section className="analytics-panel"><h2>실습·케이블링 기록</h2><p>Windows·라우터 확인 {labs.length} / {LABS.length}개</p><p>모든 입력 정답 {labs.filter(l=>l.result.passed).length}개 · 풀이 참고 {labs.filter(l=>l.help).length}개</p><p>케이블링 {result.cablingAttempts}회 · 정답률 {cable?fmt(cable.accuracy):'—'}</p><a href="#/practical/lab">실습 이어하기 →</a><br/><a href="#/cabling">케이블링 복습 →</a><p className="analytics-note">실습은 현재 입력 확인 결과입니다. 실제 장비 동작 점수나 공식 시험 점수가 아닙니다.</p></section></div>
 <section className="analytics-panel"><h2>필기 점수 추이</h2>{result.history.length?<><div className="analytics-chart" aria-label="최근 12회 필기 제출 점수">{result.history.slice(-12).map((h,i)=><div key={i}><span>{h.score}</span><div className="analytics-bar" style={{height:`${Math.max(2,h.score)}px`}}/><small>{new Date(h.date).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})}</small></div>)}</div><div className="analytics-table"><table><thead><tr><th>제출일</th><th>학습</th><th>점수</th></tr></thead><tbody>{result.history.slice(-12).reverse().map((h,i)=><tr key={i}><td>{new Date(h.date).toLocaleString('ko-KR')}</td><td>{h.title}</td><td>{h.score}점</td></tr>)}</tbody></table></div></>:<p>필기 문제를 풀고 제출하면 점수 추이가 표시됩니다.</p>}</section>
 <section className="analytics-panel"><h2>통합 오답 체크</h2><div className="analytics-actions">{['전체','이론','필기','실기'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);setPage(1);}}>{f}</button>)}</div><p>재풀이에서 맞히면 자동으로 해결됩니다. 실기 링크에서는 ‘오답 복습’을 선택하세요.</p>{wrong.slice((current-1)*15,current*15).map(w=><div className="analytics-wrong" key={`${w.area}-${w.id}`}><span>{w.area}</span><a href={w.href}>{w.title}</a><b>다시 풀기 →</b></div>)}{!wrong.length&&<p>이 영역에 남은 오답이 없습니다. 새로운 문제에 도전해 보세요.</p>}<div className="analytics-actions"><button disabled={current<=1} onClick={()=>setPage(current-1)}>이전</button><span>{current} / {pages}</span><button disabled={current>=pages} onClick={()=>setPage(current+1)}>다음</button></div></section>
 <p className="analytics-note">기록은 현재 브라우저·사이트 주소별로 저장됩니다. 브라우저 데이터 삭제 시 사라질 수 있으므로 백업하세요. 전체 내보내기는 보관용이며, 가져오기는 각 영역의 지원 메뉴를 이용하세요. 저장이 중단된 풀이 기록은 해당 학습 화면에서 별도로 백업하세요.</p></div>;
}
