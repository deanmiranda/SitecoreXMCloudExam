// Deterministic checks for scoring and persistence; browser interactions are tested separately.
const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const elements = new Map();
function element(key) {
 if (!elements.has(key)) elements.set(key, {innerHTML:'',textContent:'',value:'',open:false,classList:{toggle(){}},focus(){},close(){this.open=false}});
 return elements.get(key);
}
const memory = new Map();
const context=vm.createContext({
 console, Date, Math, JSON, Object, Array, String, Number, Set, Blob, URL, innerWidth:1200,
 document:{querySelector:element,querySelectorAll:()=>[]},
 localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},
 window:{scrollTo(){}},setInterval(){},setTimeout(){},assert
});
const app=fs.readFileSync('app.js','utf8')+'\n'+fs.readFileSync('study-features.js','utf8').replace('if(!expire())renderSetup();','');
vm.runInContext(fs.readFileSync('bank.js','utf8')+'\n'+fs.readFileSync('advanced-bank.js','utf8')+'\n'+fs.readFileSync('exam-bank.js','utf8')+'\n'+app,context);
vm.runInContext(`
assert.equal(BANK.length,86);
assert.equal(new Set(BANK.map(q=>q.id)).size,86);
assert.equal(LEGACY_BANK.length,72);
for(let i=0;i<LEGACY_BANK.length;i++){
 assert.equal(BANK[i].id,LEGACY_BANK[i].id);
 assert.notEqual(BANK[i].options.join('|'),LEGACY_BANK[i].options.join('|'),'Every option set revised');
}
assert.equal(poolFor('graphql').length,36);
assert.equal(poolFor('foundations').length,50);
for(const q of BANK){
 assert.equal(q.options.length,4,q.id);
 assert.equal(new Set(q.options).size,4,q.id);
 assert.ok(q.correct.length>0 && q.correct.length<4,q.id);
 assert.equal(new Set(q.correct).size,q.correct.length,q.id);
 for(const i of q.correct) assert.ok(Number.isInteger(i)&&i>=0&&i<4,q.id);
 assert.ok(q.explanation.length>20,q.id);
 for(const key of q.sources) assert.ok(SOURCES[key]&&SOURCES[key][1].startsWith('https://'),q.id);
}
renderExam=()=>{};renderResults=()=>{};renderSetup=()=>{};focusMain=()=>{};
startSession(['G01','G28','M05'],'Test');
assert.ok(validSession(session));
assert.equal(stats().correct,0);
assert.equal(stats().unanswered,3);
assert.equal(session.bankRevision,3);
assert.equal(navigationState('G01').className,'unanswered');
session.answers.G01=[0];
assert.equal(navigationState('G01').className,'nav-correct');
assert.ok(navigationButton('G01',0).includes('aria-label="Question 1, correct"'));
session.answers.G28=[1,0];
assert.equal(stats().correct,2);
assert.equal(stats().percent,67);
session.answers.G28=[0];
assert.equal(stats().correct,1,'No partial credit');
assert.equal(navigationState('G28').className,'nav-incorrect');
assert.ok(navigationButton('G28',1).includes('aria-label="Question 2, incorrect"'));
session.answers.G28=[0,1,2];
assert.equal(stats().correct,1,'Extra selections fail');
session.answers.G28=[0,1];
session.drafts.M05=[0];
assert.equal(stats().unanswered,1,'Drafts are not submissions');
save();
const restored=storageRead(KEY);
assert.ok(validSession(restored));
assert.equal(restored.answers.G01[0],0);
const corrupted=JSON.parse(JSON.stringify(restored));
corrupted.order.G01=[0,0,2,3];
assert.equal(validSession(corrupted),false);
finish('manual');
assert.equal(history.length,1);
assert.equal(history[0].correct,2);
finish('manual');
assert.equal(history.length,1,'Finishing twice does not duplicate history');
const missed=session.ids.filter(id=>!isCorrect(id));
assert.equal(missed.length,1);
assert.equal(missed[0],'M05');
startSession(missed,'Missed');
assert.equal(stats().answered,0);
assert.equal(session.flags.length,0);
assert.equal(session.ids.length,1);
assert.equal(session.deadline,null);
session.answers.M05=[0];finish('manual');
assert.equal(stats().percent,100);
startSession(BANK.map(q=>q.id),'Full');
for(const id of session.ids)session.answers[id]=[...byId[id].correct];
assert.equal(stats().correct,86);
assert.equal(stats().percent,100);
assert.equal(topicStats().reduce((n,t)=>n+t.total,0),86);
for(const id of session.ids)assert.equal(new Set(session.order[id]).size,4);
startSession(['G01'],'Timer',1);
session.deadline=Date.now()-1;
assert.equal(expire(),true);
assert.equal(session.finishReason,'timer');
assert.equal(stats().percent,0);
assert.equal(expire(),false);

for(let run=0;run<20;run++){
 const weighted=selectWeightedExam();assert.equal(weighted.length,50);assert.equal(new Set(weighted).size,50);
 for(const b of BLUEPRINT)assert.equal(weighted.filter(id=>BANKS[3][id].topic===b.topic).length,b.count,b.topic);
 assert.equal(weighted.filter(id=>BANKS[3][id].topic===G).length,0);
}
assert.equal(TERMS.length>=35,true);
startSession(['G01','G28'],'History test',0,{kind:'custom'});
session.answers.G01=[0];session.answers.G28=[0];finish('manual');
const firstRecord=history.find(h=>h.uid===session.uid);
assert.ok(firstRecord.attempt.questions.G01);
assert.equal(firstRecord.attempt.answers.G28.length,1);
assert.equal(firstRecord.percent,50);
const frozen=JSON.stringify(firstRecord);
const savedQuestion=firstRecord.attempt.questions.G01.prompt;
// Retake from a snapshot must not reinterpret old answers against revised definitions.
beginHistoricalRetake(firstRecord.attempt);
assert.equal(session.parentUid,firstRecord.uid);
assert.equal(session.questions.G01.prompt,savedQuestion);
assert.equal(stats().answered,0);
session.answers.G01=[0];session.answers.G28=[0,1];finish('manual');
assert.equal(stats().percent,100);
assert.equal(previousComparable(snapshotAttempt(session)).uid,firstRecord.uid);
assert.ok(comparisonMarkup(snapshotAttempt(session)).includes('+50 percentage points'));
assert.equal(JSON.stringify(firstRecord),frozen,'Retakes do not mutate history');
const active=JSON.stringify(session);
renderHistoryDetail(firstRecord);
assert.equal(JSON.stringify(session),active,'Reviewing history does not replace the current session');
assert.ok(historyReviewMarkup(firstRecord.attempt,'missed').includes('Your selection'));
assert.ok(!historyReviewMarkup(firstRecord.attempt,'missed').includes(savedQuestion));
const n=history.length;
mergeHistoryBackup({format:'xm-cloud-history',version:1,history:JSON.parse(JSON.stringify(history))});
assert.equal(history.length,n,'Import deduplicates full attempts');
const bad=JSON.parse(JSON.stringify(firstRecord));bad.attempt.questions.G01.correct=[9];
assert.throws(()=>mergeHistoryBackup({format:'xm-cloud-history',version:1,history:[bad]}));
assert.equal(history.length,n,'Invalid imports do not mutate history');
for(let i=0;i<12;i++){
 startSession(['G01'],'Retention '+i);session.answers.G01=[0];finish('manual');
}
assert.ok(history.length>10,'History is not truncated to ten attempts');
localStorage.setItem=()=>{throw new Error('blocked')};
startSession(['G01'],'Storage unavailable');
assert.equal(storageOK,false);
assert.equal(session.ids.length,1);
console.log('PASS: 86-question integrity, filters, shuffled answer mapping, exact multi-select scoring, draft handling, saved-session validation, history deduplication, retakes, all-correct score, expiry, and unavailable-storage fallback.');
`,context);
const html=fs.readFileSync('XM-Cloud-Practice-Exam.html','utf8');
assert.ok(!html.includes('BANK_PLACEHOLDER'));
assert.ok(!html.includes('APP_PLACEHOLDER'));
assert.equal((html.match(/<script>/g)||[]).length,2);
assert.ok(!/<script[^>]+src=/.test(html));
assert.ok(!/<link[^>]+stylesheet/.test(html));
console.log('PASS: standalone output embeds both scripts and has no external runtime dependencies.');

// A persisted v1 answer must still refer to its original option, even after a bank update.
const legacyContext=vm.createContext({
 console, Date, Math, JSON, Object, Array, String, Number, Set, Blob, URL, innerWidth:1200,
 document:{querySelector:element,querySelectorAll:()=>[]},
 localStorage:{getItem:k=>k==='xm-cloud-practice-v1'?JSON.stringify({
 version:1,ids:['G28','G10'],position:0,answers:{G28:[0,1],G10:[1]},drafts:{},flags:[],
 order:{G28:[2,1,0,3],G10:[0,3,1,2]},started:1000,label:'Existing attempt'
 }):null,setItem(){}},
 window:{scrollTo(){}},setInterval(){},setTimeout(){},assert
});
vm.runInContext(fs.readFileSync('bank.js','utf8')+'\n'+fs.readFileSync('advanced-bank.js','utf8')+'\n'+fs.readFileSync('exam-bank.js','utf8')+'\n'+app,legacyContext);
vm.runInContext(`
assert.equal(session.bankRevision,1);
assert.equal(byId.G28.options[1],'The client must inspect errors as well as data');
assert.equal(isCorrect('G28'),true);
assert.equal(navigationState('G10').className,'nav-incorrect');
assert.equal(stats().percent,50);
assert.equal(session.position,0);
renderExam=()=>{};focusMain=()=>{};
startSession(['G28'],'New attempt');
assert.equal(session.bankRevision,3);
assert.equal(byId.G28.options[1],'The error path identifies heading within the aliased page response');
assert.equal(stats().answered,0);
console.log('PASS: old attempts preserve original question/answer meanings and scores; new attempts use the revised bank.');
`,legacyContext);

const recoveredCurrent={version:1,uid:'old-finished',bankRevision:2,ids:['G28','G10'],position:1,answers:{G28:[0,1],G10:[1]},drafts:{},flags:[],order:{G28:[0,1,2,3],G10:[0,1,2,3]},started:1000,ended:2000,finished:true,label:'Earlier quiz'};
const recoveredHistory=[{uid:'old-finished',at:2000,label:'Earlier quiz',correct:1,total:2,percent:50},{uid:'summary-only',at:1500,label:'Old summary',correct:4,total:5,percent:80}];
const migrationMemory=new Map([['xm-cloud-practice-v1',JSON.stringify(recoveredCurrent)],['xm-cloud-practice-v1-history',JSON.stringify(recoveredHistory)]]);
const migrationContext=vm.createContext({console,Date,Math,JSON,Object,Array,String,Number,Set,Blob,URL,innerWidth:1200,document:{querySelector:element,querySelectorAll:()=>[]},localStorage:{getItem:k=>migrationMemory.get(k)||null,setItem:(k,v)=>migrationMemory.set(k,v)},window:{scrollTo(){}},setInterval(){},setTimeout(){},assert});
vm.runInContext(fs.readFileSync('bank.js','utf8')+'\n'+fs.readFileSync('advanced-bank.js','utf8')+'\n'+fs.readFileSync('exam-bank.js','utf8')+'\n'+app,migrationContext);
vm.runInContext(`
assert.equal(history.length,2);
assert.ok(history.find(h=>h.uid==='old-finished').attempt);
assert.equal(history.find(h=>h.uid==='old-finished').attempt.answers.G10[0],1);
assert.equal(history.find(h=>h.uid==='old-finished').percent,50);
assert.equal(history.find(h=>h.uid==='summary-only').attempt,undefined);
assert.equal(session.bankRevision,2);
console.log('PASS: completed current quiz upgrades its matching summary without losing answers; unavailable older answer details remain explicitly summary-only.');
`,migrationContext);
console.log('PASS: 50-question 6/8/7/7/5/5/5/7 blueprint; 36-question separate drill; complete history, exact retakes, score comparisons, immutable prior answers, backup validation/deduplication, and retention beyond ten attempts.');

