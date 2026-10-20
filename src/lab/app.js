const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const levelNames=['Fundamentals','Intermediate','Expert'];
let completed=[],revealed=[],current=0,level=0,slots=[],extras=[],selected=0,extraMode=false,assisted=false,bank=[],hintStep=0;
try{const saved=JSON.parse(localStorage.getItem('xm-graphql-v1')||'{}');completed=Array.isArray(saved.completed)?saved.completed.filter(i=>Number.isInteger(i)&&lessons[i]):[];revealed=Array.isArray(saved.revealed)?saved.revealed.filter(i=>Number.isInteger(i)&&lessons[i]):[];current=Number.isInteger(saved.current)&&lessons[saved.current]?saved.current:0;}catch{}
function save(){try{localStorage.setItem('xm-graphql-v1',JSON.stringify({completed,revealed,current}));}catch{}}
function measure(answers,values,extra){const correct=values.filter((v,i)=>v===answers[i]).length;const filled=values.filter(v=>v!==null).length;return {correct,missing:values.length-filled,wrong:filled-correct,extra:extra.length,placed:filled+extra.length,total:answers.length,solved:correct===answers.length&&!extra.length};}
function load(i){current=i;level=lessons[i].level;slots=lessons[i].answers.map(()=>null);extras=[];selected=0;extraMode=false;assisted=false;hintStep=0;bank=[...new Set([...lessons[i].answers,...lessons[i].wrong])];for(let j=bank.length-1;j>0;j--){let k=Math.floor(Math.random()*(j+1));[bank[j],bank[k]]=[bank[k],bank[j]];}
  $('title').textContent=lessons[i].title;$('request').textContent=lessons[i].request;$('concept').textContent=lessons[i].concept;
  $('challengeLabel').textContent=`${levelNames[level]} / CHALLENGE ${String(i+1).padStart(2,'0')}`;
  $('why').textContent=lessons[i].explanation;$('source').href=docs[lessons[i].source];$('explanation').open=false;$('message').textContent='';
  $('variablesPanel').hidden=!lessons[i].variables;$('variables').textContent=JSON.stringify(lessons[i].variables,null,2);
  $('chunks').innerHTML=bank.map((v,j)=>`<button class="chunk" data-bank="${j}">${esc(v)}</button>`).join('');save();render();
}
function render(){
 const l=lessons[current],m=measure(l.answers,slots,extras);
 if(m.solved&&!assisted&&!completed.includes(current)){completed.push(current);save();$('message').textContent='✓ Query complete! All required chunks are in place with no extras. Read the explanation, then try the next challenge.';$('explanation').open=true;}
 $('levels').innerHTML=levelNames.map((n,i)=>`<button class="${level===i?'active':''}" aria-pressed="${level===i}" data-level="${i}"><span>0${i+1}</span>${n}</button>`).join('');
 $('lessonList').innerHTML=lessons.map((x,i)=>x.level===level?`<button class="lesson ${i===current?'active':''} ${completed.includes(i)?'solved':''}" ${i===current?'aria-current="step"':''} data-lesson="${i}"><span class="number">${completed.includes(i)?'✓':String(i%6+1).padStart(2,'0')}</span><span>${esc(x.title)}${revealed.includes(i)&&!completed.includes(i)?' · viewed':''}</span></button>`:'').join('');
 $('levelCount').textContent=`${completed.filter(i=>lessons[i].level===level).length}/6`;
 $('progress').textContent=`${completed.length} / ${lessons.length}`;$('progressbar').style.width=`${completed.length/lessons.length*100}%`;
 let parts=l.template.split('§');$('query').innerHTML=parts.map((s,i)=>esc(s)+(i<slots.length?`<button class="slot ${selected===i?'selected':''} ${slots[i]===null?'':slots[i]===l.answers[i]?'correct':'incorrect'}" data-slot="${i}" aria-label="Gap ${i+1}: ${esc(slots[i]??'empty')}" aria-pressed="${selected===i}">${esc(slots[i]??`[ ${i+1} ]`)}</button>`:'')).join('');
 $('extras').innerHTML=extras.length?'<small>Extra chunks — click to remove</small>'+extras.map((v,i)=>`<button class="extra" data-extra="${i}" aria-label="Remove extra ${esc(v)}">${esc(v)} ×</button>`).join(''):'';
 const scale=Math.max(150,Math.ceil(m.placed/m.total*100/50)*50);$('green').style.width=`${m.correct/m.total*100/scale*100}%`;$('wrong').style.width=`${m.wrong/m.total*100/scale*100}%`;$('overflow').style.width=`${m.extra/m.total*100/scale*100}%`;
 document.querySelector('.target').style.left=`${100/scale*100}%`;document.querySelector('.ticks span:nth-child(2)').style.left=`${100/scale*100}%`;$('capacity').textContent=`${scale}%`;
 $('score').textContent=`${Math.round(m.correct/m.total*100)}%`;$('chunkCount').textContent=`${m.placed} / ${m.total} chunks · ${Math.round(m.placed/m.total*100)}% added`;
 $('feedback').textContent=`${m.correct} correct · ${m.missing} missing · ${m.wrong} incorrect · ${m.extra} extra${m.placed>m.total?' — over the 100% target':''}`;
 $('meter').setAttribute('aria-label',`${Math.round(m.correct/m.total*100)} percent correct; ${m.placed} of ${m.total} chunks added, ${m.extra} extra. Green is correct, amber is incorrect, red is extra.`);
 $('extraMode').setAttribute('aria-pressed',String(extraMode));$('remove').disabled=selected===null||slots[selected]===null;
 $('next').textContent=current===lessons.length-1?'Back to fundamentals ↺':'Next challenge →';
}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.level!==undefined){const n=+b.dataset.level;load(lessons.findIndex(x=>x.level===n));}
 if(b.dataset.lesson!==undefined)load(+b.dataset.lesson);
 if(b.dataset.slot!==undefined){selected=+b.dataset.slot;extraMode=false;render();}
 if(b.dataset.bank!==undefined){const value=bank[+b.dataset.bank];if(extraMode||selected===null){extras.push(value);}else{slots[selected]=value;selected=slots.findIndex(v=>v===null);if(selected<0)selected=null;}$('message').textContent='';render();}
 if(b.dataset.extra!==undefined){extras.splice(+b.dataset.extra,1);render();}
});
$('clear').onclick=()=>load(current);
$('remove').onclick=()=>{if(selected!==null){slots[selected]=null;render();}};
$('extraMode').onclick=()=>{extraMode=!extraMode;render();};
$('next').onclick=()=>load((current+1)%lessons.length);
$('hint').onclick=()=>{const i=slots.findIndex((v,j)=>v!==lessons[current].answers[j]);hintStep++;if(i<0){$('message').textContent=extras.length?'Your required chunks are correct. Remove the red extra chunks.':'All chunks are correct. You are ready for the next challenge.';}else{selected=i;$('message').textContent=hintStep===1?`Focus on gap ${i+1}. ${lessons[current].concept}`:`Gap ${i+1} needs ${lessons[current].answers[i]}. ${lessons[current].explanation}`;render();}};
$('solution').onclick=()=>{assisted=true;if(!revealed.includes(current))revealed.push(current);slots=[...lessons[current].answers];extras=[];selected=null;$('message').textContent='Solution shown — this does not count as an independent solve. Read the explanation, then use Clear query to practice again.';$('explanation').open=true;save();render();};
$('copy').onclick=async()=>{if(slots.some(v=>v===null)||extras.length){$('message').textContent='Fill every gap and remove extra chunks before copying.';return;}let i=0;const code=lessons[current].template.replace(/§/g,()=>slots[i++]);try{await navigator.clipboard.writeText(code);$('message').textContent='Query copied. Example paths and custom fields must be adapted to your Sitecore environment.';}catch{$('message').textContent='Clipboard unavailable here. Select and copy the query text from the builder.';}};
load(current);
