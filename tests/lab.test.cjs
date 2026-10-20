const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const elements=new Map(),handlers={};
const el=id=>{if(!elements.has(id))elements.set(id,{style:{},textContent:'',innerHTML:'',setAttribute(){}});return elements.get(id)};
const ctx=vm.createContext({document:{getElementById:el,querySelector:el,addEventListener:(n,f)=>handlers[n]=f},localStorage:{getItem:()=>null,setItem(){}},navigator:{},console});
vm.runInContext(fs.readFileSync(path.join(ROOT,'dist/lab/lessons.js'),'utf8')+'\n'+fs.readFileSync(path.join(ROOT,'dist/lab/app.js'),'utf8'),ctx);
function run(code){return vm.runInContext(code,ctx)}
assert.equal(run('lessons.length'),18);
for(let i=0;i<18;i++){
 run(`load(${i})`);
 assert.equal(run('lessons[current].template.split("§").length-1'),run('slots.length'));
 assert.equal(run('measure(lessons[current].answers,slots,extras).correct'),0);
 run('slots=[...lessons[current].answers];render()');
 assert.equal(el('score').textContent,'100%');
 run('extras.push("wrong");render()');
 assert.equal(run('measure(lessons[current].answers,slots,extras).solved'),false);
 assert.match(el('feedback').textContent,/over the 100%/);
 assert.ok(parseFloat(el('overflow').style.width)>0);
 run('extras=[];slots[0]="not the answer";render()');
 assert.equal(run('measure(lessons[current].answers,slots,extras).wrong'),1);
 run('slots[0]=null;render()');
 assert.equal(run('measure(lessons[current].answers,slots,extras).missing'),1);
}
run('completed=[];load(0)');el('solution').onclick();
assert.equal(run('completed.length'),0);
assert.equal(run('assisted'),true);
el('clear').onclick();
assert.equal(run('assisted'),false);
run('slots=[...lessons[current].answers];render()');
assert.equal(run('completed.length'),1);
console.log('PASS: 18 lessons; empty, complete, wrong, missing, overflow, reveal and retry scoring.');
