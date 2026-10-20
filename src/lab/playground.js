import {buildSchema, graphqlSync} from 'graphql';

// Deliberately small teaching schema, not a replica of Experience Edge.
export const schemaText = `
type Query {
  item(path: String!, language: String! = "en"): Item
  search(where: ItemSearchPredicateInput, first: Int = 2, after: String): SearchResult!
}
type Item { id: ID!, name: String!, displayName: String!, path: String!, language: String!, field(name: String!): Field }
type Field { value: String }
input ItemSearchPredicateInput { AND: [ItemSearchPredicateInput!], OR: [ItemSearchPredicateInput!], name: String, value: String, operator: Operator = EQ }
enum Operator { EQ CONTAINS }
type SearchResult { total: Int!, results: [Item!]!, pageInfo: PageInfo! }
type PageInfo { endCursor: String, hasNext: Boolean! }
`;
export const data = [
  {id:'home-en',name:'Home',displayName:'Welcome',path:'/sitecore/content/Acme/Home',language:'en',fields:{Title:'Welcome home'}},
  {id:'home-fr',name:'Home',displayName:'Bienvenue',path:'/sitecore/content/Acme/Home',language:'fr',fields:{Title:'Bienvenue chez nous'}},
  {id:'news-en',name:'News',displayName:'Latest news',path:'/sitecore/content/Acme/Home/News',language:'en',fields:{Title:'Our news'}},
  {id:'about-en',name:'About',displayName:'About us',path:'/sitecore/content/Acme/Home/About',language:'en',fields:{Title:'Meet the team'}}
];
const schema = buildSchema(schemaText);
const asItem = row => row && ({...row,field:({name})=>Object.hasOwn(row.fields,name)?{value:row.fields[name]}:null});
function matches(row,where){
  if(!where) return true;
  if(where.AND && !where.AND.every(p=>matches(row,p))) return false;
  if(where.OR && !where.OR.some(p=>matches(row,p))) return false;
  if(where.name){
    const keys={_name:'name',_language:'language'};
    if(!keys[where.name]) throw new Error('This teaching dataset supports only _name and _language search properties.');
    if(where.value == null) throw new Error('Supply a value for the search property.');
    const value=row[keys[where.name]];
    if(!(where.operator==='CONTAINS'?value.includes(where.value):value===where.value)) return false;
  }
  return true;
}
const rootValue={
  item:({path,language})=>asItem(data.find(row=>row.path===path&&row.language===language)),
  search:({where,first=2,after})=>{
    if(first===null||first<1||first>20) throw new Error('For this playground, first must be between 1 and 20.');
    const rows=data.filter(row=>matches(row,where));
    const tokens=rows.map((_,i)=>`practice-bookmark-${i+1}`);
    const start=after==null?0:tokens.indexOf(after)+1;
    if(after!=null&&start===0) throw new Error('Copy an endCursor from this search response into after.');
    const selected=rows.slice(start,start+first);
    return {total:rows.length,results:selected.map(asItem),pageInfo:{endCursor:selected.length?tokens[start+selected.length-1]:null,hasNext:start+selected.length<rows.length}};
  }
};
export function execute(source,variableValues={}){
  return graphqlSync({schema,source,rootValue,variableValues});
}
export const examples=[
  {title:'1. Ask for one value',tip:'The source has lots of information. Ask for name and only name comes back. Try adding displayName on the next line.',query:'query {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    name\n  }\n}',variables:{}},
  {title:'2. Open a field and rename the answer',tip:'field is like a box. value opens the box. heading is a label we chose; field and value belong to the API. Try replacing Title with Missing.',query:'query {\n  item(path: "/sitecore/content/Acme/Home") {\n    heading: field(name: "Title") { value }\n  }\n}',variables:{}},
  {title:'3. Defaults and switches',tip:'With empty variables, lang defaults to en. Set lang to fr. Set showName to false to leave name out. Set lang to null to see why String! rejects it.',query:'query Read($lang: String! = "en", $showName: Boolean! = true) {\n  item(path: "/sitecore/content/Acme/Home", language: $lang) {\n    name @include(if: $showName)\n    displayName\n  }\n}',variables:{}},
  {title:'4. Filter, then choose fields',tip:'where chooses the rows. results { name } chooses what to say about each row. Change en to fr, or add id beside name.',query:'query {\n  search(where: { name: "_language", value: "en", operator: EQ }, first: 2) {\n    total\n    results { name }\n    pageInfo { endCursor hasNext }\n  }\n}',variables:{}},
  {title:'5. Turn the page',tip:'Run once. Copy endCursor from the response into the cursor variable, then Run again. Keep the filter unchanged. These bookmarks belong to this small practice dataset.',query:'query More($cursor: String) {\n  search(where: { name: "_language", value: "en", operator: EQ }, first: 2, after: $cursor) {\n    results { name }\n    pageInfo { endCursor hasNext }\n  }\n}',variables:{cursor:null}},
  {title:'6. Reuse a shopping list',tip:'Identity is our name for a reusable list of fields. Both items use that list, but their values differ. Try adding displayName inside the fragment.',query:'fragment Identity on Item { id name }\nquery {\n  english: item(path: "/sitecore/content/Acme/Home", language: "en") { ...Identity }\n  french: item(path: "/sitecore/content/Acme/Home", language: "fr") { ...Identity }\n}',variables:{}}
];
if(typeof document!=='undefined' && document.getElementById('liveQuery')){
  const el=id=>document.getElementById(id);
  el('liveData').textContent=JSON.stringify(data,null,2);
  el('liveSchema').textContent=schemaText;
  examples.forEach((example,i)=>{const option=document.createElement('option');option.value=i;option.textContent=example.title;el('liveExample').append(option);});
  function run(){
    try{
      const vars=JSON.parse(el('liveVariables').value);
      if(!vars||Array.isArray(vars)||typeof vars!=='object') throw new Error('Variables must be a JSON object, such as {}.');
      const result=execute(el('liveQuery').value,vars);
      el('liveResponse').textContent=JSON.stringify(result,null,2);
      el('liveStatus').textContent=result.errors?'GraphQL found an error. Read its message below; your edits are still here.':'Query ran. Compare the requested fields with data below.';
    }catch(error){el('liveResponse').textContent=JSON.stringify({errors:[{message:error.message}]},null,2);el('liveStatus').textContent='Check your variables JSON.';}
  }
  function choose(){
    const example=examples[Number(el('liveExample').value)||0];
    el('liveQuery').value=example.query;el('liveVariables').value=JSON.stringify(example.variables,null,2);
    el('liveTip').textContent=example.tip;run();
  }
  el('liveExample').onchange=choose;el('liveReset').onclick=choose;el('liveRun').onclick=run;
  el('liveQuery').oninput=el('liveVariables').oninput=()=>{el('liveStatus').textContent='Edited — click Run query to update the response.';};
  choose();
}
