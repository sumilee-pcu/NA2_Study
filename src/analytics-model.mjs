export const RECORD_KEYS = ['learning','written','practical','labs','cabling'].map(x => `na2_study_${x}_v1`);
export const percent = (n,d) => d > 0 ? Math.round(n/d*100) : null;
export function snapshot(storage) {
  const records = {}, warnings = [];
  for (const key of RECORD_KEYS) {
    try { const raw = storage.getItem(key); if (raw) { const value = JSON.parse(raw); if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('잘못된 형식'); records[key] = value; } }
    catch { warnings.push(`${key}: 기록을 읽을 수 없습니다. 원본은 변경하지 않았습니다.`); }
  }
  return {records,warnings};
}
export function analyze({learning={},written={},practical={},cabling={}}, index, topics, practicalQuestions) {
  const checks = topics.flatMap(t=>t.checks.map(c=>({id:`${t.id}/${c.id}`,topic:t.id,title:t.title})));
  const progress = written.progress || {};
  const known = index.filter(q=>Number.isInteger(progress[q.id]?.attempts) && progress[q.id].attempts>0);
  const latest = Object.fromEntries((practical.attempts || []).filter(a=>practicalQuestions.some(q=>q.id===a.questionId)).map(a=>[a.questionId,a]));
  const theoryDone = topics.filter(t=>learning.read?.[t.id]).length;
  const theoryCorrect = checks.filter(c=>learning.checks?.[c.id]?.correct===true).length;
  const writtenCorrect = known.filter(q=>progress[q.id].lastCorrect===true).length;
  const practicalCorrect = Object.values(latest).filter(a=>a.status==='correct').length;
  const rows = [
    {label:'이론 개념 확인',total:checks.length,done:checks.filter(c=>learning.checks?.[c.id]).length,correct:theoryCorrect,href:'#/learn/theory'},
    {label:'필기 문제',total:index.length,done:known.length,correct:writtenCorrect,href:'#/written'},
    {label:'실기 단답·객관식',total:practicalQuestions.length,done:Object.keys(latest).length,correct:practicalCorrect,href:'#/practical/questions'},
  ].map(r=>({...r,coverage:percent(r.done,r.total),mastery:percent(r.correct,r.total),accuracy:percent(r.correct,r.done)}));
  const wrong = [
    ...checks.filter(c=>learning.checks?.[c.id]?.correct===false).map(c=>({id:c.id,area:'이론',title:c.title,href:`#/learn/theory/${c.topic}`})),
    ...known.filter(q=>progress[q.id].lastCorrect===false).map(q=>({id:q.id,area:'필기',title:`${q.exam} · ${q.number}번 · ${q.subject}`,href:`#/written/question/${encodeURIComponent(q.id)}`})),
    ...Object.values(latest).filter(a=>a.status!=='correct').map(a=>({id:a.questionId,area:'실기',title:`${a.questionId} · ${a.status==='unanswered'?'미응답':'오답'}`,href:'#/practical/questions'})),
  ];
  const subjects = [...new Set(index.map(q=>q.subject))].map(subject=>{const items=known.filter(q=>q.subject===subject); const attempts=items.reduce((s,q)=>s+progress[q.id].attempts,0);const correct=items.reduce((s,q)=>s+(Number(progress[q.id].correct)||0),0);return {subject,attempts,accuracy:percent(correct,attempts)};});
  const history = (written.history||[]).filter(h=>h.total>0 && Number.isFinite(h.correct) && Number.isFinite(Date.parse(h.date))).map(h=>({date:h.date,score:percent(h.correct,h.total),title:h.title||'필기 학습',area:'필기'})).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
  const recent = history.slice(-5), prior=history.slice(-10,-5);
  const average = list=>list.length?Math.round(list.reduce((s,h)=>s+h.score,0)/list.length):null;
  return {rows,wrong,subjects,history,theoryDone,theoryTotal:topics.length,recentAverage:average(recent),change:prior.length?average(recent)-average(prior):null,cablingAttempts:(cabling.events||[]).length};
}

export function validateWrittenAnalytics(value) {
  if (!value || !value.progress || typeof value.progress !== 'object' || Array.isArray(value.progress) || !Array.isArray(value.history)) throw Error('Invalid written records');
  for (const p of Object.values(value.progress)) {
    if (!p || !Number.isInteger(p.attempts) || p.attempts < 0 || !Number.isInteger(p.correct) || p.correct < 0 || p.correct > p.attempts || typeof p.lastCorrect !== 'boolean') throw Error('Invalid written score');
  }
  for (const h of value.history) {
    if (!h || !Number.isInteger(h.total) || h.total <= 0 || !Number.isInteger(h.correct) || h.correct < 0 || h.correct > h.total || typeof h.date !== 'string' || !Number.isFinite(Date.parse(h.date)) || typeof h.title !== 'string') throw Error('Invalid written history');
  }
  return value;
}
