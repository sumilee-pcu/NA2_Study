import {createServer} from 'vite';
import {renderToString} from 'react-dom/server';
import React from 'react';
const vite=await createServer({server:{middlewareMode:true}});
try{globalThis.localStorage={getItem:()=>null};globalThis.window={localStorage};const {default:P}=await vite.ssrLoadModule('/src/Portfolio.jsx');for(const view of ['review','records']){const html=renderToString(React.createElement(P,{view}));if(!html.includes(view==='review'?'오답 노트':'브라우저 학습 기록'))throw Error('Render failed');console.log(view+' render passed');}}finally{await vite.close();}
