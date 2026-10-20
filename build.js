const fs=require('fs');
const template=fs.readFileSync('exam-template.html','utf8').replace('</style>',fs.readFileSync('study-styles.css','utf8')+'\n</style>');
const bank=fs.readFileSync('bank.js','utf8')+'\n'+fs.readFileSync('advanced-bank.js','utf8')+'\n'+fs.readFileSync('exam-bank.js','utf8');
const app=fs.readFileSync('app.js','utf8')+'\n'+fs.readFileSync('study-features.js','utf8');
for(const [name,code] of [['bank',bank],['app',app]]) {
 if (/<\/script/i.test(code)) throw new Error('Unexpected closing script tag in '+name);
 new Function(code);
}
fs.writeFileSync('XM-Cloud-Practice-Exam.html',template.replace('/* BANK_PLACEHOLDER */',()=>bank).replace('/* APP_PLACEHOLDER */',()=>app));
console.log('Built standalone XM-Cloud-Practice-Exam.html');
