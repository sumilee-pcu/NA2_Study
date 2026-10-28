import { readFileSync, writeFileSync } from 'node:fs';
const bank = JSON.parse(readFileSync('public/data/bank.json','utf8'));
console.log(Object.keys(bank));
writeFileSync('src/content/written-index.json', JSON.stringify(bank.questions.map(({id,subject,number,exam})=>({id,subject,number,exam}))));
