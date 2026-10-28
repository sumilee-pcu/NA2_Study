import {createServer} from 'vite';
import {renderToString} from 'react-dom/server';
import React from 'react';
const vite=await createServer({server:{middlewareMode:true}});
try {
 const {default:Analytics}=await vite.ssrLoadModule('/src/Analytics.jsx');
 globalThis.window={localStorage:{getItem:()=>null}};
 const html=renderToString(React.createElement(Analytics));
 if(!html.includes('나의 학습 분석')||!html.includes('900')||!html.includes('통합 오답 체크'))throw Error('Missing dashboard content');
 console.log('Empty dashboard render passed');
 const values={na2_study_written_v1:{progress:{},history:[{date:'2026-10-28T00:00:00Z',total:10,correct:8,title:'검증용 회차'}]}};
 window.localStorage.getItem=k=>values[k]?JSON.stringify(values[k]):null;
 const populated=renderToString(React.createElement(Analytics));
 if(!populated.includes('80')||!populated.includes('검증용 회차'))throw Error('Missing score history');
 console.log('Populated dashboard render passed');
}finally{await vite.close();}
