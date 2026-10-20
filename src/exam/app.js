'use strict';
const VERSION=1, KEY='xm-cloud-practice-v1', HISTORY_KEY=KEY+'-history';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BANKS={
 1:Object.fromEntries(LEGACY_BANK.map(q=>[q.id,q])),
 2:Object.fromEntries(REVISION2_BANK.map(q=>[q.id,q])),
 3:Object.fromEntries(BANK.map(q=>[q.id,q]))
};
let byId=BANKS[3];
const topics=[...new Set(BANK.map(q=>q.topic))];
const main=$('#main');
let session=null, history=[], screen='setup', reviewFilter='missed', storageOK=true;
function storageRead(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{storageOK=false;return null}}
function storageWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{storageOK=false}storageStatus()}
function storageStatus(){$('#storage-warning').classList.toggle('hidden',storageOK)}
function validSession(s){
 return s&&s.version===VERSION&&Array.isArray(s.ids)&&s.ids.length>0&&new Set(s.ids).size===s.ids.length&&s.ids.every(id=>byId[id])&&
 Number.isInteger(s.position)&&s.position>=0&&s.position<s.ids.length&&s.answers&&s.drafts&&s.order&&Array.isArray(s.flags)&&
 s.ids.every(id=>Array.isArray(s.order[id])&&s.order[id].length===byId[id].options.length&&new Set(s.order[id]).size===byId[id].options.length&&s.order[id].every(n=>Number.isInteger(n)&&n>=0&&n<byId[id].options.length))&&
 Object.entries(s.answers).every(([id,a])=>s.ids.includes(id)&&Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=0&&n<byId[id].options.length))&&
 Number.isFinite(s.started)&&(!s.deadline||Number.isFinite(s.deadline));
}
session=storageRead(KEY);
if(session){
 const revision=session.bankRevision||1;
 if(BANKS[revision]){byId=session.questions||BANKS[revision];session.bankRevision=revision}
 else session=null;
}
if(!validSession(session))session=null;
if(!session)byId=BANKS[3];
history=storageRead(HISTORY_KEY); if(!Array.isArray(history))history=[];
history=history.filter(h=>h&&typeof h.label==='string'&&Number.isFinite(h.percent)&&Number.isFinite(h.at)&&Number.isFinite(h.total)&&Number.isFinite(h.correct));
storageStatus();
function save(){if(session)storageWrite(KEY,session)}
function shuffle(input){const a=[...input];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function equalSet(a,b){return a.length===b.length&&[...a].sort((x,y)=>x-y).every((v,i)=>v===[...b].sort((x,y)=>x-y)[i])}
function isCorrect(id){return session.answers[id]!==undefined&&equalSet(session.answers[id],byId[id].correct)}
function navigationState(id){
 if(session.answers[id]===undefined)return{className:'unanswered',label:'unanswered',symbol:''};
 return isCorrect(id)?{className:'nav-correct',label:'correct',symbol:'✓'}:{className:'nav-incorrect',label:'incorrect',symbol:'×'};
}
function navigationButton(id,i){
 const status=navigationState(id),flagged=session.flags.includes(id),current=i===session.position;
 return `<button data-jump="${i}" class="${status.className}${current?' current':''}${flagged?' flagged':''}" title="Question ${i+1}: ${status.label}${flagged?', flagged':''}" aria-label="Question ${i+1}, ${status.label}${flagged?', flagged':''}" ${current?'aria-current="step"':''}><span>${i+1}</span>${status.symbol?`<span class="nav-mark" aria-hidden="true">${status.symbol}</span>`:''}</button>`;
}
function stats(){const total=session.ids.length, answered=session.ids.filter(id=>session.answers[id]!==undefined).length,correct=session.ids.filter(isCorrect).length;return{total,answered,correct,percent:Math.round(correct/total*100),missed:total-correct,unanswered:total-answered}}
function refs(q){return `<div class="refs">${q.sources.map(k=>`<a href="${esc(SOURCES[k][1])}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[k][0])} ↗</a>`).join('')}</div>`}
function highlight(code){
 const re=/(#[^\n]*|"(?:\\.|[^"\\])*"|\$[A-Za-z_]\w*|\b(?:query|mutation|subscription|fragment|on|true|false|null|AND|OR|EQ|CONTAINS|NCONTAINS|String|Boolean|Int|Float|ID)\b)/g;
 let out='',last=0;
 for(const m of code.matchAll(re)){
  out+=esc(code.slice(last,m.index));
  const token=m[0];
  const cls=token.startsWith('#')?'comment':token.startsWith('"')?'string':token.startsWith('$')?'var':['String','Boolean','Int','Float','ID'].includes(token)?'builtin':['AND','OR','EQ','CONTAINS','NCONTAINS'].includes(token)?'api':'key';
  out+=`<span class="tok-${cls}">${esc(token)}</span>`;
  last=m.index+token.length;
 }
 return out+esc(code.slice(last));
}
function codeView(q){return q.code?`<pre class="code-block" tabindex="0" aria-label="Code or response to interpret"><code>${highlight(q.code)}</code></pre>`:''}
function focusMain(){main.focus();window.scrollTo({top:0,behavior:'instant'})}
function announce(message){$('#live').textContent=message}
function ask(title,text,label,fn){$('#dialog-title').textContent=title;$('#dialog-text').textContent=text;$('#dialog-confirm').textContent=label;$('#dialog-confirm').onclick=()=>{$('#confirm-dialog').close();fn()};$('#confirm-dialog').showModal()}
$('#dialog-cancel').onclick=()=>$('#confirm-dialog').close();
$('#home-button').onclick=()=>{save();renderSetup();focusMain()};
function renderSetup(){
 screen='setup';
 main.innerHTML=`
 <section class="hero"><div><div class="eyebrow">Understand the query. Know the platform.</div><h1>Your next step<br>toward XM Cloud.</h1><p class="lead">Read real-shaped GraphQL. Practice the developer foundations. Learn why each answer is right, then go again.</p><div class="tags"><span class="pill">Instant explanations</span><span class="pill">Unlimited retakes</span><span class="pill">No account required</span></div></div>
 <div class="hero-code" aria-hidden="true"><div class="code-heading"><span>QUERY / READ THE SHAPE</span><span>● ● ●</span></div><pre><code>${highlight(`query GetPage($path: String!) {
  page: item(path: $path, language: "en") {
    name
    heading: field(name: "Title") {
      value
    }
  }
}`)}</code></pre><p class="note">Trace the response → data.page.heading.value</p></div></section>
 <div class="stats"><div class="stat"><strong>50</strong><span>Questions in the weighted mock</span></div><div class="stat"><strong>36</strong><span>Separate GraphQL drill questions</span></div><div class="stat"><strong>8</strong><span>Competencies with your supplied weights</span></div></div><div class="actions" style="margin-bottom:24px"><button id="setup-primer">Learn GraphQL first</button><button id="setup-history">Review quiz history</button><a class="button" href="__LAB_URL__">GraphQL game — additional query practice →</a></div>
 ${session?`<div class="resume"><div><strong>${session.finished?'Your last result is ready.':'Pick up where you left off.'}</strong><div class="session-meta">${esc(session.label)} · ${stats().answered} of ${session.ids.length} submitted${session.finished?` · ${stats().percent}%`:''}</div>${session.bankRevision<3?'<small>This saved attempt keeps its original questions and topic mix. Start a new weighted mock below for the 50-question blueprint.</small>':''}</div><button id="resume" class="dark">${session.finished?'View result':'Resume practice'} →</button></div>`:''}
 <div class="setup-grid"><section class="panel"><div class="eyebrow">01 / Set your session</div><h2>Make this practice yours.</h2>
 <div class="control-row"><label class="control">Focus<select id="scope"><option value="weighted">Weighted mock · 50 questions</option><option value="all">Entire learning bank</option><option value="graphql">GraphQL only</option><option value="foundations">XM Cloud foundations only</option>${topics.filter(t=>t!==G).map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label>
 <label class="control">Question count<select id="count"><option value="all">Entire selected bank</option><option value="50">Up to 50 questions</option><option value="20">Up to 20 questions</option><option value="10">Up to 10 questions</option></select></label></div>
 <div class="control-row"><label class="control">Time limit<select id="duration"><option value="0">Untimed · learn at your pace</option><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="100" selected>100 minutes</option><option value="144">144 minutes</option></select></label><div><label class="control" style="margin-bottom:10px">Practice target</label><strong>80%</strong><div><small>A study target, not an official pass guarantee.</small></div></div></div>
 <p class="scope-note"><strong>Revised challenge bank:</strong> closer alternatives, multi-step query interpretation, and practical troubleshooting. Original practice material; difficulty is not calibrated against the live certification exam.</p>
 <p class="scope-note" id="session-note"></p>
 <button class="primary" id="start">Start practice →</button>
 <p style="margin-top:14px;margin-bottom:0"><small>Questions and choices shuffle each attempt. Progress stays in this browser when storage is available.</small></p>
 <details><summary>How scoring and retakes work</summary><ul class="checklist"><li>Choose your answer, then select <strong>Check answer</strong>. Correct answers and explanations appear immediately.</li><li>One point per question. For multiple-answer questions, select exactly the stated number; all correct selections are required. No partial credit or negative marks.</li><li>Submitted answers lock for the attempt. You can navigate, flag questions, and review explanations.</li><li>Unsubmitted questions count as incorrect if you finish early. Selecting an option without checking it does not submit it.</li><li>Retakes reset answers and shuffle order. You can retry just the questions you missed or left unanswered.</li><li>A timed session uses wall-clock time, including time on explanations or with the page closed. It finishes at the deadline when the page is running or next opened.</li></ul></details>
 </section><aside class="panel"><div class="eyebrow">02 / Weighted mock blueprint</div><h2>50 questions. Eight competencies.</h2><ul class="list-clean">${BLUEPRINT.map((b,i)=>`<li><span class="tiny-num">${b.count}</span>${i+1}. ${esc(b.name)} <small>· ${b.count*2}%</small></li>`).join('')}</ul><p class="scope-note">These counts follow the screenshot you supplied. GraphQL is covered within APIs where relevant; the separate 36-question drill is extra study, not a ninth weighted competency.</p><p><small>The foundation pool currently contains exactly 50 questions. Repeated weighted mocks reuse these questions with shuffled order and choices.</small></p></aside></div>
 <div class="notice"><strong>Scope & version note.</strong> This is an independent learning exam, not a replica of Sitecore’s certification or a verified current exam blueprint. The weighted mock follows your supplied 50-question split (6/8/7/7/5/5/5/7), not an independently verified current certification blueprint. Current documentation calls XM Cloud <strong>SitecoreAI</strong> and Pages <strong>Page builder</strong>. Older JSS/Headless Services references support established concepts; verify SDK-specific instructions against your course version. Sample paths, IDs and template names are fictional. No queries are sent to Sitecore.</div>
 <details class="panel sources"><summary>References & a quick way to read GraphQL</summary><p style="margin-top:16px">First identify the endpoint and operation, then the root field. Read arguments in parentheses, selected fields in braces, aliases before colons, and variables beginning with $. Trace nested results, type conditions, and pagination before deciding what a query returns.</p><p>Question explanations link directly to the relevant reference. Snippets labeled as fragments or containing comments in place of arguments are interpretation exercises, not ready-to-run queries.</p><ul>${Object.values(SOURCES).map(([title,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a></li>`).join('')}</ul></details>
 <section style="margin-top:28px"><div class="section-title"><h2>Saved practice</h2><button id="all-history">Open all history (${history.length})</button></div><p class="muted">Full attempts now retain your selected answers, explanations, and question definitions. Open history to review failures, retake a quiz, and compare scores.</p>${history.slice(0,3).map(h=>`<div class="history-row"><span>${esc(new Date(h.at).toLocaleString())} · ${esc(h.label)}</span><strong>${h.correct}/${h.total} · ${h.percent}%</strong></div>`).join('')}</section>`;
 $('#setup-primer').onclick=()=>{renderPrimer();focusMain()};
 $('#setup-history').onclick=$('#all-history').onclick=()=>{renderHistory();focusMain()};
 $('#scope').onchange=updateSessionNote;$('#count').onchange=updateSessionNote;$('#duration').onchange=updateSessionNote;updateSessionNote();
 $('#start').onclick=()=>{
  const scope=$('#scope').value,pool=poolFor(scope),count=$('#count').value==='all'?pool.length:Math.min(+$('#count').value,pool.length),minutes=+$('#duration').value;
  const begin=()=>startSession(scope==='weighted'?selectWeightedExam():shuffle(pool.map(q=>q.id)).slice(0,count),`${scope==='weighted'?'Weighted mock':scope==='all'?'Entire learning bank':scope==='graphql'?'GraphQL':scope==='foundations'?'XM Cloud foundations':scope} · ${scope==='weighted'?50:count} questions`,minutes,{kind:scope==='weighted'?'weighted':scope==='graphql'?'graphql':'custom'});
  if(session&&!session.finished)ask('Start a new attempt?','This replaces your current saved attempt. Completed history is retained.','Start new attempt',begin);else begin();
 };
 if($('#resume'))$('#resume').onclick=()=>{if(!expire())session.finished?renderResults():renderExam();focusMain()};
 if($('#clear-history'))$('#clear-history').onclick=()=>ask('Clear practice history?','This removes completed-attempt summaries from this browser. Your current saved attempt remains.','Clear history',()=>{history=[];storageWrite(HISTORY_KEY,history);renderSetup()});
}
function poolFor(scope){return BANK.filter(q=>(scope==='weighted'?BLUEPRINT.some(b=>b.topic===q.topic):scope==='all')||(scope==='graphql'?q.topic===G:scope==='foundations'?q.topic!==G:q.topic===scope))}
function updateSessionNote(){const scope=$('#scope').value,weighted=scope==='weighted';$('#count').disabled=weighted;const count=$('#count').value,pool=poolFor(scope),n=weighted?50:count==='all'?pool.length:Math.min(+count,pool.length);$('#session-note').textContent=weighted?'50 questions: 6 architecture, 8 deployment, 7 layouts, 7 serialization, 5 APIs, 5 Pages, 5 security, 7 modeling. Immediate feedback stays on.':`${n} questions selected${n<pool.length?' randomly from '+pool.length:''}. This drill does not use the exam weights.`;}

function startSession(ids,label,minutes=0,config={}){
 if(session?.finished)archiveAttempt(session);
 byId=config.questions||BANKS[3];
 session={version:VERSION,bankRevision:3,uid:Date.now()+'-'+Math.random().toString(36).slice(2),ids:shuffle(ids),label,kind:config.kind||'custom',parentUid:config.parentUid||null,position:0,answers:{},drafts:{},flags:[],order:{},started:Date.now(),deadline:minutes?Date.now()+minutes*60000:null,finished:false};
 session.questions=Object.fromEntries(session.ids.map(id=>[id,JSON.parse(JSON.stringify(byId[id]))]));byId=session.questions;session.setKey=signature(session);
 for(const id of session.ids)session.order[id]=shuffle(byId[id].options.map((_,i)=>i));
 save();renderExam();focusMain();
}
function renderExam(){
 screen='exam';const s=stats(),q=byId[session.ids[session.position]],answered=session.answers[q.id]!==undefined,selected=answered?session.answers[q.id]:(session.drafts[q.id]||[]);
 main.innerHTML=`<div class="exam-layout"><aside class="sidebar"><div class="panel"><div class="eyebrow">Your session</div><strong>${esc(session.label)}</strong><div class="session-meta">${s.answered} of ${s.total} submitted</div><div class="progress" role="progressbar" aria-label="Questions submitted" aria-valuemin="0" aria-valuemax="${s.total}" aria-valuenow="${s.answered}"><span style="width:${s.answered/s.total*100}%"></span></div><div id="clock" class="timer"></div><details id="question-map" ${innerWidth>680?'open':''}><summary style="font-size:13px">Question navigator</summary><nav class="map" aria-label="Questions">${session.ids.map(navigationButton).join('')}</nav><p class="legend">Green ✓ = correct · Red × = incorrect<br>White = unanswered · Gold dot = flagged<br>Outline = current question</p></details><button id="question-primer" style="width:100%;margin-top:15px">GraphQL primer / glossary</button><button id="finish" style="width:100%;margin-top:15px">Finish & see score</button><p class="legend" style="margin:12px 0 0">Answers lock when checked. Your progress is saved automatically when storage is available.</p></div></aside>
 <section class="panel question-card"><div class="question-top"><div><span class="pill">${esc(q.topic)}</span> <span class="pill">${q.level}</span></div><button class="textbtn" id="flag" aria-pressed="${session.flags.includes(q.id)}">${session.flags.includes(q.id)?'★ Flagged':'☆ Flag for review'}</button></div>
 ${session.bankRevision<3?'<p class="scope-note">Earlier question bank · This saved attempt retains its original topic mix. Start a new weighted mock from Study desk to use the 50-question blueprint.</p>':''}<div class="question-id">QUESTION ${session.position+1} OF ${s.total} · ${q.id}</div><h2 class="question-stem" id="stem" tabindex="-1">${esc(q.prompt)}</h2>${codeView(q)}
 <fieldset ${answered?'disabled':''}><legend>${q.correct.length>1?`Select exactly ${q.correct.length} answers.`:'Select one answer.'}</legend><div class="options">${session.order[q.id].map((oi,i)=>{const correct=answered&&q.correct.includes(oi),wrong=answered&&selected.includes(oi)&&!q.correct.includes(oi);return `<label class="option ${correct?'correct':wrong?'wrong':''}"><input type="${q.correct.length>1?'checkbox':'radio'}" name="answer" value="${oi}" ${selected.includes(oi)?'checked':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(q.options[oi])}${answered?`<span class="answer-tag">${correct?(selected.includes(oi)?'✓ Correct · You selected this':'✓ Correct answer · Not selected'):wrong?'✕ Your selection':''}</span>`:''}</span></label>`}).join('')}</div></fieldset>
 ${answered?`<section class="feedback ${isCorrect(q.id)?'':'miss'}" id="feedback" tabindex="-1"><h3>${isCorrect(q.id)?'✓ Correct.':'Let’s work through it.'}</h3><p><strong>Correct answer${q.correct.length>1?'s':''}:</strong> ${q.correct.map(i=>esc(q.options[i])).join(' • ')}</p><p>${esc(q.explanation)}</p>${refs(q)}</section>`:''}
 <div class="question-actions"><button id="prev" ${session.position===0?'disabled':''}>← Previous</button><div class="actions">${!answered?`<button id="check" class="primary" disabled>Check answer</button>`:''}<button id="next" class="${answered?'primary':''}">${session.position===s.total-1?'Finish & see score':answered?'Next question →':'Skip for now →'}</button></div></div></section></div>`;
 $('[data-jump]');document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>go(+b.dataset.jump));
 $('#flag').onclick=()=>{session.flags=session.flags.includes(q.id)?session.flags.filter(id=>id!==q.id):[...session.flags,q.id];save();renderExam();$('#flag').focus()};
 $('#prev').onclick=()=>go(session.position-1);
 $('#next').onclick=()=>session.position===s.total-1?requestFinish():go(session.position+1);
 $('#finish').onclick=requestFinish;$('#question-primer').onclick=()=>{save();renderPrimer();focusMain()};
 if(!answered){
  document.querySelectorAll('input[name=answer]').forEach(el=>el.onchange=()=>{session.drafts[q.id]=[...document.querySelectorAll('input[name=answer]:checked')].map(el=>+el.value);save();updateCheck(q)});
  updateCheck(q);
  $('#check').onclick=()=>{if(expire())return;const a=session.drafts[q.id]||[];if(a.length!==q.correct.length)return;session.answers[q.id]=[...a];save();renderExam();$('#feedback').focus();announce(isCorrect(q.id)?'Correct. Explanation is available.':'Incorrect. Correct answer and explanation are available.')};
 }
 updateClock();
}
function updateCheck(q){$('#check').disabled=(session.drafts[q.id]||[]).length!==q.correct.length}
function go(index){if(expire())return;session.position=index;save();renderExam();$('#stem').focus();window.scrollTo({top:0,behavior:'instant'})}
function requestFinish(){
 if(expire())return;const s=stats();
 ask('Finish this attempt?',`${s.answered} of ${s.total} questions submitted. ${s.unanswered?`${s.unanswered} unsubmitted question${s.unanswered===1?'':'s'} will count as incorrect, including any selections you have not checked.`:'Your final score and topic breakdown are ready.'}`,'Finish attempt',()=>finish('manual'));
}
function finish(reason){
 if(!session||session.finished)return;
 session.finished=true;session.ended=Date.now();session.finishReason=reason;const s=stats();
 archiveAttempt(session);
 save();reviewFilter='missed';if($('#confirm-dialog').open)$('#confirm-dialog').close();renderResults();focusMain();announce(reason==='timer'?'Time is up. Your final score is ready.':'Your final score is ready.');
}
function expire(){if(session&&!session.finished&&session.deadline&&Date.now()>=session.deadline){finish('timer');return true}return false}
function updateClock(){const el=$('#clock');if(!el||!session)return;if(!session.deadline){el.innerHTML='<span style="font:13px system-ui;color:var(--muted)">Untimed practice</span>';return}const secs=Math.max(0,Math.ceil((session.deadline-Date.now())/1000));el.textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')} left`;el.classList.toggle('urgent',secs<300)}
function topicStats(){return topics.map(topic=>{const ids=session.ids.filter(id=>byId[id].topic===topic);return{topic,total:ids.length,correct:ids.filter(isCorrect).length}}).filter(t=>t.total)}
function renderResults(){
 screen='results';const s=stats(),breakdown=topicStats(),weak=[...breakdown].filter(t=>t.correct<t.total).sort((a,b)=>a.correct/a.total-b.correct/b.total);
 main.innerHTML=`<section class="panel"><div class="eyebrow">Session complete / Your results</div><div class="score-hero"><div class="score-ring" style="--score:${s.percent}"><div>${s.percent}%<small>${s.correct} / ${s.total} correct</small></div></div><div><h1 style="font-size:36px;margin-bottom:10px">${s.correct/s.total>=.8?'Practice target reached.':'A clear next step.'}</h1><p class="muted" style="margin-bottom:0">${s.correct/s.total>=.8?'Build consistency with another shuffled attempt.':'Use the explanations below, then retry your missed questions.'}<br>${s.answered} submitted · ${s.unanswered} unanswered · ${session.finishReason==='timer'?'Time limit reached':'Attempt finished'}</p></div></div><div class="actions"><button id="retake" class="primary">Retake these ${s.total} questions ↻</button><button id="retry" ${s.missed?'':'disabled'}>Practice ${s.missed} missed / unanswered</button><button id="new-session">Choose a new session</button><button id="export">Download results</button><button id="results-history">All quiz history</button><button id="results-primer">Study the GraphQL primer</button></div><p style="margin-top:15px;margin-bottom:0"><small>Target: 80% for this practice tool. This score does not predict an official certification result. Retakes reuse this question bank with shuffled order and choices.</small></p></section>
 <section class="panel learning-section"><h2>Score comparison</h2>${comparisonMarkup(snapshotAttempt(session))}</section><div class="result-grid"><section class="panel"><h2>Performance by topic</h2>${breakdown.map(t=>`<div class="topic-row"><div class="topic-line"><span>${esc(t.topic)}</span><strong>${t.correct}/${t.total} · ${Math.round(t.correct/t.total*100)}%</strong></div><div class="progress"><span style="width:${t.correct/t.total*100}%"></span></div></div>`).join('')}</section><section class="panel"><h2>Where to focus next</h2>${weak.length?`<p class="muted">Start with your lowest-scoring topics from this attempt.</p><ol class="checklist">${weak.slice(0,3).map(t=>`<li><strong>${esc(t.topic)}</strong><br>${t.total-t.correct} missed or unsubmitted. Review the linked explanations, then use a focused session from the study desk.</li>`).join('')}</ol>`:'<p>You answered every question correctly. Try a different selection or explain the query results aloud without looking at the choices.</p>'}<div class="notice">A missed-question drill measures improvement on that subset. Its score is separate from a complete exam attempt.</div><p><small>First checked answers determine the score. Multiple-answer questions use exact-match scoring; skipped questions earn zero points.</small></p></section></div>
 <section><div class="section-title" id="review-controls"><h2>Answer review</h2><label class="control">Show<select id="review-filter"><option value="missed">Missed & unanswered (${s.missed})</option><option value="flagged">Flagged (${session.flags.length})</option><option value="all">All questions (${s.total})</option></select></label></div><div id="review"></div></section>`;
 $('#retake').onclick=()=>beginHistoricalRetake(snapshotAttempt(session));
 $('#retry').onclick=()=>beginHistoricalRetake(snapshotAttempt(session),true);
 $('#new-session').onclick=()=>{renderSetup();focusMain()};
 $('#export').onclick=exportResults;$('#results-history').onclick=()=>{renderHistory();focusMain()};$('#results-primer').onclick=()=>{renderPrimer();focusMain()};
 $('#review-filter').value=reviewFilter;$('#review-filter').onchange=()=>{reviewFilter=$('#review-filter').value;renderReview()};
 renderReview();
}
function renderReview(){
 const ids=session.ids.filter(id=>reviewFilter==='all'||(reviewFilter==='flagged'?session.flags.includes(id):!isCorrect(id)));
 $('#review').innerHTML=ids.length?ids.map(id=>{const q=byId[id],a=session.answers[id],correct=isCorrect(id);return `<details class="review-card" ${correct?'':'open'}><summary>${correct?'✓':'○'} ${id} · ${esc(q.topic)} · ${correct?'Correct':a===undefined?'Unanswered':'Incorrect'}${session.flags.includes(id)?' · ★ Flagged':''}</summary><p><strong>${esc(q.prompt)}</strong></p>${codeView(q)}<p><strong>Your submitted answer:</strong> ${a===undefined?'None':a.map(i=>esc(q.options[i])).join(' • ')}</p><p><strong>Correct answer${q.correct.length>1?'s':''}:</strong> ${q.correct.map(i=>esc(q.options[i])).join(' • ')}</p><p>${esc(q.explanation)}</p>${refs(q)}</details>`}).join(''):'<div class="panel"><p style="margin:0">No questions in this review filter. Choose “All questions” to revisit every explanation.</p></div>';
}
function exportResults(){
 const s=stats(),report={title:'XM Cloud Developer Practice Results',completed:new Date(session.ended).toISOString(),session:session.label,score:s,topics:topicStats(),questions:session.ids.map(id=>{const q=byId[id];return{id,topic:q.topic,question:q.prompt,code:q.code,selected:session.answers[id]?.map(i=>q.options[i])||[],correct:q.correct.map(i=>q.options[i]),earned:isCorrect(id)?1:0,explanation:q.explanation,sources:q.sources.map(k=>SOURCES[k][1])}})};
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`xm-cloud-results-${new Date(session.ended).toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Results downloaded as JSON.');
}
setInterval(()=>{if(!expire()&&screen==='exam')updateClock()},1000);

