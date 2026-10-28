import {TOPICS} from './content/learning.mjs';
import {LABS} from './content/practical-labs.mjs';
import {QUESTIONS} from './modules/cabling/content.mjs';
import {validateLearning} from './learning-model.mjs';
import {validateLabState,gradeLab} from './practical-lab-model.mjs';
import {validateBackup} from './modules/cabling/model.mjs';
import {prepareBank,validatePractical} from './practical-model.mjs';
import {validateWrittenAnalytics,analyze,percent,RECORD_KEYS} from './analytics-model.mjs';
export const REVIEW_KEY='na2_pcu_review_v1';
export const ALL_KEYS=[...RECORD_KEYS,REVIEW_KEY];
export function validateReview(v){if(!v||v.version!==1||!v.items||typeof v.items!=='object'||Array.isArray(v.items))throw Error('오답 메모 형식 오류');for(const x of Object.values(v.items))if(!x||typeof x.note!=='string'||x.note.length>2000||typeof x.checked!=='boolean')throw Error('오답 메모 내용 오류');return v;}
export function validateRecords(records,questionData,index){
 if(!records||typeof records!=='object'||Array.isArray(records)||Object.keys(records).some(k=>!ALL_KEYS.includes(k)))throw Error('알 수 없는 기록 항목입니다.');
 const result={};for(const [key,value] of Object.entries(records)){
 const name=key.replace('na2_study_','').replace('_v1','');
 if(key===REVIEW_KEY){result[key]=validateReview(value);continue;}
 if(name==='learning')result[key]=validateLearning(value);
 if(name==='labs')result[key]=validateLabState(value);
 if(name==='cabling')result[key]=validateBackup(value);
 if(name==='practical')result[key]=validatePractical(value,prepareBank(questionData));
 if(name==='written'){
 validateWrittenAnalytics(value);
 if(value.session)throw Error('필기 진행 중 백업은 먼저 해당 풀이를 제출한 뒤 내보내 주세요.');
 if(!Array.isArray(value.bookmarks)||value.bookmarks.some(id=>!index.some(q=>q.id===id))||!Array.isArray(value.days)||value.days.some(d=>typeof d!=='string')||!value.notes||typeof value.notes!=='object'||Object.values(value.notes).some(n=>typeof n!=='string')||Object.keys(value.progress).some(id=>!index.some(q=>q.id===id)))throw Error('필기 기록 형식이 올바르지 않습니다.');
 result[key]=value;
 }
 }
 return result;
}
export function restoreRecords(storage,records,expected){
 const keys=Object.keys(records);for(const key of keys)if(storage.getItem(key)!==expected[key])throw Error('다른 탭에서 기록이 변경되었습니다. 다시 가져오세요.');
 const written=[];try{for(const key of keys){storage.setItem(key,JSON.stringify(records[key]));written.push(key);}}catch(e){let failed=false;for(const key of written.reverse()){try{if(expected[key]===null)storage.removeItem(key);else storage.setItem(key,expected[key]);}catch{failed=true;}}throw Error(failed?'복원과 되돌리기에 실패했습니다. 안전 백업 파일을 보관하고 저장 공간을 확보하세요.':'저장 공간 오류로 복원을 취소하고 이전 기록을 되돌렸습니다.');}
}
export function extendedAnalysis(states,index,data){
 const result=analyze(states,index,TOPICS,data.questions);
 const latest=Object.fromEntries((states.cabling?.events||[]).map(e=>[e.questionId,e]));
 const cableDone=QUESTIONS.filter(q=>latest[q.id]);const cableCorrect=cableDone.filter(q=>latest[q.id].correct);
 const labs=LABS.filter(l=>states.labs?.entries[l.id]?.checked).map(l=>({lab:l,grade:gradeLab(l,states.labs.entries[l.id].answers)}));
 for(const r of [{label:'실기 케이블링',done:cableDone.length,correct:cableCorrect.length,total:QUESTIONS.length,href:'#/cabling'},{label:'Windows·라우터 실습',done:labs.length,correct:labs.filter(x=>x.grade.passed).length,total:LABS.length,href:'#/practical/lab'}])result.rows.push({...r,coverage:percent(r.done,r.total),mastery:percent(r.correct,r.total),accuracy:percent(r.correct,r.done)});
 result.wrong.push(...cableDone.filter(q=>!latest[q.id].correct).map(q=>({id:q.id,area:'케이블링',title:q.prompt||q.title||q.id,href:'#/cabling'})),...labs.filter(x=>!x.grade.passed).map(x=>({id:x.lab.id,area:'실습',title:x.lab.title,href:`#/practical/lab/${x.lab.id}`})));
 const events=[...result.history.map(h=>({...h,kind:'필기'})),...Object.entries(states.learning?.checks||{}).map(([id,c])=>({date:c.at,score:c.correct?100:0,title:TOPICS.find(t=>id.startsWith(t.id+'/'))?.title||id,kind:'이론'})),...(states.practical?.attempts||[]).map(a=>({date:a.at,score:a.status==='correct'?100:0,title:a.questionId,kind:'실기 문제'})),...(states.cabling?.events||[]).map(e=>({date:e.submittedAt,score:e.correct?100:0,title:e.questionId,kind:'케이블링'}))].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 return {...result,events};
}
