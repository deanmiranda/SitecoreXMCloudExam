// Learning views, weighted selection, and durable full-attempt history.
const TERMS = [
 ['GraphQL','A typed language for requesting data from an API. Read a request as a description of the result you want.','queries'],
 ['Endpoint','The API address receiving the request. Its schema and permissions determine what you can do.','apis'],
 ['Schema','The API contract: available fields, their types, arguments, and supported operations.','types'],
 ['Operation / query','One executable request. A query reads data; its operation name is a label for debugging, not a response wrapper.','queries'],
 ['Mutation','An operation intended for changes. Only use mutations exposed by the target API; Edge Delivery and Preview are read-only.','author'],
 ['Subscription','An operation for ongoing event results when an API supports it. Do not assume a Sitecore endpoint supports subscriptions.','types'],
 ['Root field / entry point','The first field inside an operation, such as item, layout, search, or site on the relevant Edge schema.','schema'],
 ['Field','A requested property. A GraphQL field such as name is different from a named Sitecore content field such as Title.','schema'],
 ['Selection set / braces { }','The fields requested at one object level. Indentation helps you follow which object owns each selection.','queries'],
 ['Argument / parentheses ( )','An input to a field: path: "/about" or language: "en". Arguments influence selection; they do not add response keys.','queries'],
 ['Alias / colon :','A response-key nickname: heading: field(name: "Title"). The result key is heading. It does not rename stored content.','queries'],
 ['Variable / $','A named input declared in the operation, then supplied separately. JSON variable keys omit the $ prefix.','queries'],
 ['Default / =','A fallback for an omitted input. A default does not replace an explicitly supplied null.','types'],
 ['Scalar / leaf','One simple value such as a string or number. Select a scalar directly; it has no nested selection set.','types'],
 ['Object / list','An object has selectable fields. A list contains multiple values; check the schema rather than guessing cardinality from braces.','types'],
 ['String, Int, Boolean, ID','Common scalar types: text, integer, true/false, and identifier. Use the exact type required by the endpoint.','types'],
 ['Enum','One value from a defined set. In GraphQL, EQ is an enum value and is normally written without string quotes.','types'],
 ['Non-null / !','A value cannot be null. String! allows an empty string unless another rule forbids it. Non-null does not mean an item exists.','types'],
 ['List modifiers / [T!]!','The outer ! forbids a null list; the inner ! forbids null entries. An empty list can still be valid.','types'],
 ['Named fragment / ...Name','A reusable field selection. It shares the selection instructions, not the returned values or an extra response wrapper.','queries'],
 ['Inline fragment / ... on Type','A conditional selection for a matching runtime type. A valid fragment that does not match omits its selected fields.','types'],
 ['Projected template type','A GraphQL type derived from Sitecore template definitions. Example template names are not universal across projects.','schema'],
 ['Directive / @include, @skip','A conditional selection instruction. Include needs true; skip needs false for a field to remain selected. Validation still applies.','spec'],
 ['Resolver / execution','The server behavior that produces a field value after the request has passed validation.','response'],
 ['Validation / coercion','Checking that a document fits the schema, and that input values fit the declared types. Failures can prevent execution.','validation'],
 ['data, errors, error path','data contains results; errors describes problems. A field error can coexist with partial data. Error paths follow response keys, including aliases.','response'],
 ['null / omitted','null means a key has a null value. Omitted means the key is absent, for example because a directive excluded it.','response'],
 ['Item ID / GUID / path','A Sitecore item can be identified by its GUID or CMS tree path. A public route path is a different kind of address.','schema'],
 ['layout / rendered','layout selects page data using site, route path, and language; rendered contains Layout Service JSON for the front end.','hd'],
 ['value / jsonValue','value is a field value representation. jsonValue provides a representation intended for Sitecore SDK field helpers, including complex fields.','hd'],
 ['parent / children / ancestors','Relationships in the item tree: immediate parent, immediate children, or ancestors. Selecting children does not recurse automatically.','hd'],
 ['where / AND / OR','Filter input and Boolean combinations: every AND condition must match; at least one OR condition must match.','examples'],
 ['_parent / _path / _templates','Special search fields: immediate-parent ID, hierarchy IDs, and template IDs including inherited templates.','schema'],
 ['EQ / CONTAINS / NCONTAINS','Equality, contains, and does-not-contain operators. Interpretation depends on the field and endpoint; text tokenization can differ.','differences'],
 ['first / results / total','A maximum page size, the returned page of records, and the matching count. A requested limit does not guarantee that many records.','examples'],
 ['Cursor / after / pageInfo','Cursor = continuation token. Pass endCursor as after for the same filter; stop when hasNext is false. Treat tokens as opaque.','examples'],
 ['Query complexity','A measure of requested work. Deeply nested lists can be expensive; use bounded selections and pagination.','best'],
 ['Preview / Delivery / Authoring','Preview reads drafts from CM; Delivery reads published content from Edge; the authoring API exposes supported content changes.','apis']
];

function latestQuestions(){return Object.fromEntries(BANK.map(q=>[q.id,q]))}
function questionsFor(attempt){return attempt.questions||BANKS[attempt.bankRevision||1]||BANKS[3]}
function attemptStats(attempt){
 const qs=questionsFor(attempt),total=attempt.ids.length;
 const answered=attempt.ids.filter(id=>attempt.answers[id]!==undefined).length;
 const correct=attempt.ids.filter(id=>attempt.answers[id]!==undefined&&equalSet(attempt.answers[id],qs[id].correct)).length;
 return{total,answered,correct,percent:Math.round(correct/total*100),missed:total-correct,unanswered:total-answered};
}
function signature(attempt){
 const qs=questionsFor(attempt),text=JSON.stringify([...attempt.ids].sort().map(id=>[id,qs[id].prompt,qs[id].code,qs[id].options,qs[id].correct]));
 let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return `${attempt.ids.length}-${(h>>>0).toString(16)}`;
}
function snapshotAttempt(attempt){
 const copy=JSON.parse(JSON.stringify(attempt)),qs=questionsFor(attempt);
 copy.questions=Object.fromEntries(copy.ids.map(id=>[id,JSON.parse(JSON.stringify(qs[id]))]));
 copy.uid=copy.uid||`recovered-${copy.started}`;copy.setKey=signature(copy);return copy;
}
function archiveAttempt(attempt){
 if(!attempt||!attempt.finished)return;
 const copy=snapshotAttempt(attempt),s=attemptStats(copy);
 const record={uid:copy.uid,at:copy.ended||copy.started,label:copy.label,correct:s.correct,total:s.total,percent:s.percent,attempt:copy};
 const index=history.findIndex(h=>h.uid===record.uid||(!h.uid&&h.at===record.at&&h.label===record.label));
 if(index>=0)history[index]=record;else history.unshift(record);
 history.sort((a,b)=>b.at-a.at);storageWrite(HISTORY_KEY,history);
}
function selectWeightedExam(){
 return BLUEPRINT.flatMap(b=>{const candidates=BANK.filter(q=>q.topic===b.topic);if(candidates.length<b.count)throw new Error(`Insufficient questions for ${b.topic}`);return shuffle(candidates).slice(0,b.count).map(q=>q.id)});
}
function previousComparable(attempt){
 const key=signature(attempt);return history.filter(h=>h.attempt&&h.uid!==attempt.uid&&h.at<=(attempt.ended||Date.now())&&signature(h.attempt)===key).sort((a,b)=>b.at-a.at)[0];
}
function comparisonMarkup(attempt){
 const previous=previousComparable(attempt);if(!previous)return '<p class="muted">Complete another attempt on these same questions to compare like-for-like scores.</p>';
 const now=attemptStats(attempt),delta=now.percent-previous.percent;
 return `<p><strong>${delta>0?'+':''}${delta} percentage points</strong> versus your previous attempt on the same question set (${previous.percent}% → ${now.percent}%).</p><small>Identical questions and answer definitions; order may differ. Timed and untimed attempts can appear in this comparison.</small>`;
}
function beginHistoricalRetake(attempt,missedOnly=false){
 const qs=questionsFor(attempt),ids=attempt.ids.filter(id=>!missedOnly||attempt.answers[id]===undefined||!equalSet(attempt.answers[id],qs[id].correct));
 if(!ids.length)return;
 const begin=()=>startSession(ids,missedOnly?`Missed-question drill · ${ids.length} questions`:attempt.label,0,{questions:qs,parentUid:attempt.uid,kind:missedOnly?'missed':attempt.kind||'custom'});
 if(session&&!session.finished)ask('Start this retake?','Your active attempt will be replaced. Completed attempts remain in history.','Start retake',begin);else begin();
}

function installStudyNavigation(){
 const links=$('.toplinks');if(links&&!$('#primer-nav'))links.insertAdjacentHTML('afterbegin','<button class="textbtn" id="primer-nav">GraphQL primer</button><button class="textbtn" id="history-nav">Quiz history</button>');
 if($('#primer-nav'))$('#primer-nav').onclick=()=>{save();renderPrimer();focusMain()};
 if($('#history-nav'))$('#history-nav').onclick=()=>{save();renderHistory();focusMain()};
}
function primerCard(title,body){return `<section class="panel learning-section"><h2>${title}</h2>${body}</section>`}
function renderPrimer(){
 screen='primer';
 main.innerHTML=`<div class="eyebrow">Learn first / GraphQL primer</div><h1>Learn to read the shape.</h1><p class="lead">You do not have to memorize the whole language. Learn the symbols, trace the nesting, and separate what a query requests from what the server actually returns.</p><div class="actions"><button id="primer-back">← Study desk</button>${session&&!session.finished?'<button id="primer-resume">Resume saved quiz</button>':''}<button id="primer-drill" class="primary">Start GraphQL practice</button><a class="button" href="#glossary">Find a term</a></div><p class="scope-note">The worked examples below use fictional Sitecore content. They are local learning examples, not requests to your Sitecore environment. An active quiz timer continues while you read.</p>
 <nav class="lesson-nav" aria-label="Primer contents"><a href="#anatomy">1. Anatomy</a><a href="#trace">2. Trace a response</a><a href="#types">3. Types & conditions</a><a href="#filter">4. Search & pagination</a><a href="#troubles">5. Diagnose errors</a><a href="#glossary">6. Glossary</a><a href="#checks">7. Try it</a></nav>
 <div id="anatomy">${primerCard('1. Start with the punctuation',`<p>Click a line for its meaning. The numbered labels are teaching annotations, not part of the query.</p><div class="anatomy-lines">${[
 ['query ReadHome($path: String!, $lang: String! = "en") {','query reads data. ReadHome names this operation. $path and $lang are inputs. String! rejects null; lang has an omission default.'],
 ['  page: item(path: $path, language: $lang) {','item is the root field. Arguments choose an item and language. page is an alias, so the response uses page as its key.'],
 ['    name','Request a scalar directly: no braces or value beneath name.'],
 ['    heading: field(name: "Title") {','Request the content field named Title. heading is its response alias; the Title argument does not become a response key.'],
 ['      value','Request the value inside that field object.'],
 ['    }','Close the content-field selection. You are back at the page item level.'],
 ['  }','Close the item selection.'],
 ['}','Close the operation.']
 ].map(([line,note],i)=>`<button class="anatomy-line" data-anatomy="${i}" data-note="${esc(note)}"><span>${i+1}</span><code>${esc(line)}</code></button>`).join('')}</div><p id="anatomy-note" class="notice" aria-live="polite">Select a line above.</p><p>Braces choose output fields. Parentheses supply inputs. A colon can declare an argument, a variable type, or an alias: its location tells you which.</p>` )}</div>
 <div id="trace">${primerCard('2. Follow aliases into the response',`<div class="learn-grid"><div><h3>Variables JSON</h3>${codeView({code:'{"path":"/sitecore/content/Acme/Travel/Home"}'})}<p>There is no $ in the JSON key. We omitted lang, so the query default supplies en.</p></div><div><h3>One possible successful response</h3>${codeView({code:'{\n  "data": {\n    "page": {\n      "name": "Home",\n      "heading": { "value": "Plan your trip" }\n    }\n  }\n}'})}</div></div><p><strong>Read the title at data.page.heading.value.</strong> ReadHome, item, field, and Title do not appear as extra wrappers in this example. Only the selected aliases and fields shape this response.</p><p>For a list, include the element index: data.item.children.results[0].name. A selected connection can return fewer records than requested.</p>` )}</div>
 <div id="types">${primerCard('3. Types, defaults, fragments, directives',`<dl class="lesson-dl"><dt>Omitted versus explicit null</dt><dd>For $lang: String! = "en", leaving lang out uses en. Supplying {"lang":null} fails. Empty text is still a string; ! alone does not reject it.</dd><dt>Scalar versus object</dt><dd>name is a leaf. field(...) is an object, so select a subfield such as value. name { value } is invalid when name is a String.</dd><dt>Reusable selections</dt><dd>fragment Identity on Item { id name } lets ...Identity request the same fields at several locations. Each object has its own values.</dd><dt>Type conditions</dt><dd>... on Article { headline { value } } applies only to a matching type. A valid nonmatching condition omits headline. An unknown or impossible type condition can fail validation.</dd><dt>Conditional fields</dt><dd>@include(if: true) permits a selection; @skip(if: true) excludes it. If both occur, inclusion requires include=true and skip=false. An invalid field still fails validation when skipped.</dd><dt>Lists</dt><dd>[String!]! allows an empty list, prohibits a null list, and prohibits null entries. The two exclamation marks act at different levels.</dd></dl>` )}</div>
 <div id="filter">${primerCard('4. Distinguish filters from returned fields',`${codeView({code:'query {\n  search(\n    where: { AND: [\n      { name: "_parent", value: "11111111111111111111111111111111", operator: EQ }\n      { name: "_language", value: "en", operator: EQ }\n    ] }\n    first: 5\n  ) {\n    total\n    results { id name }\n    pageInfo { endCursor hasNext }\n  }\n}'})}<ol class="checklist"><li><strong>where is input:</strong> both conditions must match. This selects English records directly under the specified parent.</li><li><strong>_parent is one level:</strong> _path with a branch-root ID instead tests branch membership, which may include that root and deeper descendants. _templates includes inherited templates.</li><li><strong>results is output:</strong> each result requests only id and name here. first:5 is a cap, not a promise of five matches.</li><li><strong>total describes the matching set:</strong> it can exceed the number returned in this page.</li><li><strong>Continue the same search:</strong> if hasNext is true, reuse endCursor as after on the next request, keeping the filter. Stop when hasNext is false. Do not decode or increment the cursor yourself.</li></ol><p>EQ and CONTAINS on text can behave differently between Preview and Delivery because of indexing/tokenization. A search filter is not an automatic full-site search implementation.</p>` )}</div>
 <div id="troubles">${primerCard('5. Diagnose in the right order',`<ol class="checklist"><li><strong>Endpoint:</strong> Preview can read drafts from CM; Delivery reads published Edge content. Use the authoring API for supported mutations.</li><li><strong>Validation:</strong> unknown fields, conflicting selections, wrong types, or scalar sub-selections can prevent execution. Aliases fix response-key conflicts; they do not fix type errors.</li><li><strong>Execution:</strong> data plus errors can mean some fields worked and another failed. Follow the error path through aliases. Do not interpret every null as an empty authored value.</li><li><strong>Availability:</strong> item:null without errors warrants checking item identity, language, publication, and environment.</li><li><strong>Front-end freshness:</strong> new data in Delivery with stale generated HTML points to the application’s cache/build/revalidation path.</li></ol><p><strong>Before answering a question:</strong> state the endpoint, inputs, selected output, nesting depth, and conditions. Then eliminate options that add behavior the query never requested.</p>` )}</div>
 <section class="panel learning-section" id="glossary"><h2>6. A glossary for this question bank</h2><label class="control">Find a term<input type="search" id="term-search" placeholder="Try alias, cursor, scalar, _path…"></label><div id="term-list">${TERMS.map(([term,meaning,source])=>`<article class="term-row" data-term="${esc((term+' '+meaning).toLowerCase())}"><h3>${esc(term)}</h3><p>${esc(meaning)}</p><a href="${esc(SOURCES[source][1])}" target="_blank" rel="noopener noreferrer">Read the reference ↗</a></article>`).join('')}</div><p id="no-terms" class="hidden">No matching terms. Try a shorter word.</p></section>
 <section class="panel learning-section" id="checks"><h2>7. Try the reading steps</h2><p>These six checks do not affect quiz scores or history. Each answer explains the reasoning.</p>${[
 ['query Q { card: item(...) { title: field(...) { value } } } — where is the value?',['data.card.title.value','data.Q.item.field.value'],'The aliases card and title define the keys. The operation name Q does not wrap data.'],
 ['$lang: String! = "en" with {"lang":null}: use en or reject?',['Reject the explicit null','Use en because a default exists'],'Omission uses a default. Explicit null violates the non-null input type.'],
 ['first:5 returns three results. Must the response be invalid?',['No; five is the maximum','Yes; the server owes five records'],'There may be fewer matching records or fewer records remaining on this page.'],
 ['_parent equals Home’s GUID: direct children or every descendant?',['Direct children','Every descendant'],'For branch membership, examine the _path condition instead.'],
 ['A valid Article fragment does not match the returned runtime type. Is its headline key absent or necessarily null?',['Absent','Necessarily present as null'],'The fragment’s fields do not participate for a nonmatching runtime type.'],
 ['The response includes useful data and errors with a field path. Did validation necessarily prevent all execution?',['No; execution can return partial data','Yes; errors always means nothing executed'],'A field-resolution error can coexist with data from successful fields.']
 ].map(([prompt,options,reason],i)=>`<article class="self-check"><h3>${i+1}. ${esc(prompt)}</h3><div class="actions">${options.map((o,j)=>`<button data-check="${i}" data-choice="${j}">${esc(o)}</button>`).join('')}</div><p id="check-note-${i}" class="notice hidden" aria-live="polite" data-reason="${esc(reason)}"></p></article>`).join('')}</section>
 <p class="muted">Sources: ${['queries','types','response','schema','examples'].map(k=>`<a href="${esc(SOURCES[k][1])}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[k][0])}</a>`).join(' · ')}. Terminology is taught with original examples; projected Sitecore types vary by project.</p>`;
 $('#primer-back').onclick=()=>{renderSetup();focusMain()};
 if($('#primer-resume'))$('#primer-resume').onclick=()=>{if(!expire())renderExam();focusMain()};
 $('#primer-drill').onclick=()=>{const begin=()=>startSession(BANK.filter(q=>q.topic===G).map(q=>q.id),'GraphQL drill · 36 questions',0,{kind:'graphql'});if(session&&!session.finished)ask('Start a GraphQL drill?','This replaces the active attempt. Completed history remains available.','Start drill',begin);else begin()};
 document.querySelectorAll('[data-anatomy]').forEach(b=>b.onclick=()=>{$('#anatomy-note').textContent=b.dataset.note});
 $('#term-search').oninput=()=>{const term=$('#term-search').value.toLowerCase().trim();let visible=0;document.querySelectorAll('[data-term]').forEach(row=>{const match=row.dataset.term.includes(term);row.classList.toggle('hidden',!match);if(match)visible++});$('#no-terms').classList.toggle('hidden',visible>0)};
 document.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const note=$('#check-note-'+b.dataset.check);note.textContent=(b.dataset.choice==='0'?'Correct. ':'Try the other choice. ')+note.dataset.reason;note.classList.remove('hidden')});
}

function renderHistory(){
 screen='history';const detailed=history.filter(h=>h.attempt),weighted=history.filter(h=>h.attempt?.kind==='weighted').sort((a,b)=>a.at-b.at);
 main.innerHTML=`<div class="eyebrow">Your learning record</div><h1>Quiz history</h1><p class="lead">Review each saved attempt, inspect failed answers, and retake the same questions. Completed quizzes are kept in this browser until you clear its storage.</p><div class="actions"><button id="history-back">← Study desk</button><button id="history-backup" ${history.length?'':'disabled'}>Download history backup</button><label class="button" for="history-import">Restore backup</label><input id="history-import" type="file" accept="application/json,.json" class="hidden"></div><p id="import-status" aria-live="polite"></p><div class="notice">Older versions saved only ten score summaries. Those summaries remain, but their past answer choices cannot be reconstructed. A completed quiz still stored as your current attempt is recovered with full details. New completions save the questions and every submitted answer. History in another browser or a different copy of the file is separate.</div>
 ${weighted.length>1?`<section class="panel learning-section"><h2>Weighted mock score trend</h2><p class="muted">50-question blueprint · ${weighted.length} completed attempts · score as a percentage. Chronological order; date and score are listed below.</p><div class="score-trend" role="list" aria-label="Weighted mock attempt scores">${weighted.map((h,i)=>`<div role="listitem"><span>${h.percent}%</span><div class="trend-track"><div style="height:${h.percent}%"></div></div><small>${i+1}</small></div>`).join('')}</div><ol class="checklist">${weighted.map(h=>`<li>${esc(new Date(h.at).toLocaleString())}: ${h.correct}/${h.total} (${h.percent}%)</li>`).join('')}</ol></section>`:''}
 <section class="learning-section"><div class="section-title"><h2>All saved attempts (${history.length})</h2><label class="control">Show<select id="history-filter"><option value="all">All attempts</option><option value="weighted">Weighted mock exams</option><option value="graphql">GraphQL drills</option><option value="detailed">With answer details (${detailed.length})</option><option value="summary">Older summaries only</option></select></label></div><div id="history-list"></div></section>`;
 $('#history-back').onclick=()=>{renderSetup();focusMain()};$('#history-filter').onchange=renderHistoryRows;renderHistoryRows();
 $('#history-backup').onclick=()=>downloadJSON({format:'xm-cloud-history',version:1,exported:new Date().toISOString(),history},'xm-cloud-history-backup.json');
 $('#history-import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>25000000)throw new Error('This file is too large for a quiz-history backup.');const data=JSON.parse(await file.text());mergeHistoryBackup(data);renderHistory();$('#import-status').textContent='Backup restored. Duplicate attempts were merged.'}catch(error){$('#import-status').textContent='Could not restore backup: '+error.message}};
}
function renderHistoryRows(){
 const filter=$('#history-filter').value,rows=history.filter(h=>filter==='all'||(filter==='detailed'?!!h.attempt:filter==='summary'?!h.attempt:h.attempt?.kind===filter));
 $('#history-list').innerHTML=rows.length?rows.map(h=>`<article class="panel history-attempt"><div class="section-title"><div><h3>${esc(h.label)}</h3><small>${esc(new Date(h.at).toLocaleString())} · ${h.attempt?'Full answer record':'Score summary only'}</small></div><strong class="history-score">${h.percent}%<small>${h.correct}/${h.total}</small></strong></div>${h.attempt?`${comparisonMarkup(h.attempt)}<div class="actions"><button data-history-view="${esc(h.uid)}">Review answers</button><button data-history-retake="${esc(h.uid)}">Retake same questions</button><button data-history-missed="${esc(h.uid)}" ${h.correct<h.total?'':'disabled'}>Retry missed</button></div>`:'<p class="muted">This older record has no question or answer details. Start a new quiz to create a full record.</p>'}</article>`).join(''):'<p class="panel">No attempts in this view yet. Finish a quiz to add a record.</p>';
 document.querySelectorAll('[data-history-view]').forEach(b=>b.onclick=()=>{renderHistoryDetail(history.find(h=>h.uid===b.dataset.historyView));focusMain()});
 document.querySelectorAll('[data-history-retake]').forEach(b=>b.onclick=()=>beginHistoricalRetake(history.find(h=>h.uid===b.dataset.historyRetake).attempt));
 document.querySelectorAll('[data-history-missed]').forEach(b=>b.onclick=()=>beginHistoricalRetake(history.find(h=>h.uid===b.dataset.historyMissed).attempt,true));
}
function historyReviewMarkup(attempt,filter){
 const qs=questionsFor(attempt),ids=attempt.ids.filter(id=>filter==='all'||attempt.answers[id]===undefined||!equalSet(attempt.answers[id],qs[id].correct));
 return ids.length?ids.map(id=>{const q=qs[id],a=attempt.answers[id],ok=a!==undefined&&equalSet(a,q.correct);return `<details class="review-card" ${ok?'':'open'}><summary>${ok?'✓':'×'} ${id} · ${esc(q.topic)} · ${ok?'Correct':a===undefined?'Unanswered':'Incorrect'}</summary><h3>${esc(q.prompt)}</h3>${codeView(q)}<ul class="review-choices">${q.options.map((option,i)=>`<li class="${q.correct.includes(i)?'choice-correct':a?.includes(i)?'choice-incorrect':''}">${esc(option)} ${q.correct.includes(i)?'<strong>✓ Correct answer</strong>':''} ${a?.includes(i)?'<strong>• Your selection</strong>':''}</li>`).join('')}</ul>${a===undefined?'<p>No answer was submitted.</p>':''}<p>${esc(q.explanation)}</p>${refs(q)}</details>`}).join(''):'<p class="panel">No missed or unanswered questions in this attempt.</p>';
}
function renderHistoryDetail(record){
 screen='history-detail';const a=record.attempt,s=attemptStats(a);
 main.innerHTML=`<div class="eyebrow">Saved attempt / Read-only review</div><h1>${s.percent}% · ${s.correct}/${s.total}</h1><p class="lead">${esc(record.label)}</p><p>${esc(new Date(record.at).toLocaleString())} · ${s.unanswered} unanswered</p><div class="panel">${comparisonMarkup(a)}</div><div class="actions learning-section"><button id="history-detail-back">← All history</button><button id="history-detail-retake" class="primary">Retake same questions</button><button id="history-detail-missed" ${s.missed?'':'disabled'}>Retry ${s.missed} missed / unanswered</button><button id="history-detail-export">Download this attempt</button></div><label class="control">Answer review<select id="history-answer-filter"><option value="missed">Missed & unanswered</option><option value="all">All questions</option></select></label><div id="history-answer-list">${historyReviewMarkup(a,'missed')}</div>`;
 $('#history-detail-back').onclick=()=>{renderHistory();focusMain()};$('#history-detail-retake').onclick=()=>beginHistoricalRetake(a);$('#history-detail-missed').onclick=()=>beginHistoricalRetake(a,true);
 $('#history-detail-export').onclick=()=>downloadJSON({format:'xm-cloud-history',version:1,history:[record]},'xm-cloud-attempt.json');
 $('#history-answer-filter').onchange=()=>$('#history-answer-list').innerHTML=historyReviewMarkup(a,$('#history-answer-filter').value);
}
function downloadJSON(data,filename){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function validArchivedRecord(h){
 if(!h||typeof h.label!=='string'||!Number.isFinite(h.at)||!Number.isFinite(h.percent)||!Number.isFinite(h.correct)||!Number.isFinite(h.total)||h.total<=0||h.correct<0||h.correct>h.total)return false;
 if(!h.attempt)return true;
 const a=h.attempt,qs=a.questions;if(!qs||!Array.isArray(a.ids)||!a.ids.length||new Set(a.ids).size!==a.ids.length||!a.finished||!a.answers)return false;
 return a.ids.every(id=>{const q=qs[id],answer=a.answers[id];return q&&q.id===id&&typeof q.prompt==='string'&&typeof q.topic==='string'&&typeof q.explanation==='string'&&(q.code==null||typeof q.code==='string')&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>typeof o==='string')&&Array.isArray(q.correct)&&q.correct.length>0&&q.correct.length<4&&new Set(q.correct).size===q.correct.length&&q.correct.every(i=>Number.isInteger(i)&&i>=0&&i<4)&&Array.isArray(q.sources)&&q.sources.every(k=>SOURCES[k])&&(answer===undefined||(Array.isArray(answer)&&new Set(answer).size===answer.length&&answer.every(i=>Number.isInteger(i)&&i>=0&&i<4)))});
}
function mergeHistoryBackup(data){
 if(data?.format!=='xm-cloud-history'||data.version!==1||!Array.isArray(data.history)||!data.history.every(validArchivedRecord))throw new Error('Not a valid Practice Studio history backup.');
 const merged=[...history];for(const raw of data.history){const h=JSON.parse(JSON.stringify(raw));if(h.attempt){const s=attemptStats(h.attempt);h.correct=s.correct;h.total=s.total;h.percent=s.percent;h.uid=h.attempt.uid||h.uid||`import-${h.at}`;h.attempt.uid=h.uid}const i=merged.findIndex(row=>row.uid===h.uid&&h.uid);if(i<0)merged.push(h);else if(h.attempt)merged[i]=h}
 history=merged.sort((a,b)=>b.at-a.at);storageWrite(HISTORY_KEY,history);
}

installStudyNavigation();
if(session?.finished)archiveAttempt(session);
if(!expire())renderSetup();
