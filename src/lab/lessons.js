const docs = {
  examples: 'https://doc.sitecore.com/xp/en/developers/hd/22/sitecore-headless-development/query-examples-for-the-delivery-api.html',
  schema: 'https://doc.sitecore.com/sai/en/developers/sitecoreai/experience-edge/experience-edge-apis/the-experience-edge-schema.html',
  preview: 'https://doc.sitecore.com/xmc/en/developers/xm-cloud/set-up-the-graphql-playgrounds-to-test-content.html',
  graphql: 'https://graphql.org/learn/queries/'
};
// Each gap has an exact, task-specific target; punctuation and nesting are supplied.
const lessons = [];
function lesson(level,title,request,concept,template,answers,wrong,explanation,variables=null,source='examples'){
  lessons.push({level,title,request,concept,template,answers,wrong,explanation,variables,source});
}
lesson(0,'Hello, content','Read the English home item at /sitecore/content/Acme/Home. Return only its name.',
'A query reads data. Arguments identify the item; the selection set specifies what comes back.',
'§ {\n  §(path: §, language: "en") {\n    §\n  }\n}',
['query','item','"/sitecore/content/Acme/Home"','name'],
['mutation','layout','"/"','title'],
'item accepts a content-tree path or an item GUID. name is a scalar: it does not need nested braces. Experience Edge delivery is read-only.',null,'schema');
lesson(0,'Choose your fields','Read the English home item. Return its ID, display name, and content-tree path, in the marked gaps.',
'GraphQL returns the fields you select. A display name is not necessarily the same as the underlying item name.',
'query {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    §\n    §\n    §\n  }\n}',
['id','displayName','path'],['itemId','display_name','routePath'],
'The gaps are ID, display name, then path. This game uses those positions for feedback; GraphQL itself allows sibling fields in any order.',null,'schema');
lesson(0,'Open a field','Read the Title field on the English home item and return its raw value.',
'Sitecore content fields are objects. Select a property inside the field rather than treating it as a scalar.',
'query {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    §(name: §) {\n      §\n    }\n  }\n}',
['field','"Title"','value'],['fields','Title','rendered'],
'field(name: "Title") selects the named content field; value reads its raw value. The field must exist in your content template.');
lesson(0,'Speak another language','Read the French home item and return its displayName.',
'The language argument selects the content language. It is a quoted string, not an enum.',
'query {\n  §(path: "/sitecore/content/Acme/Home", §: §) {\n    displayName\n  }\n}',
['item','language','"fr"'],['layout','locale','fr'],
'Use language: "fr". A syntactically correct query does not guarantee that a French published item exists; publishing and fallback settings still matter.',null,'preview');
lesson(0,'Give it a name','Create a named read operation called HomeSummary, and alias displayName to label.',
'An operation name identifies the query for tooling. An alias changes a response key without changing the underlying field.',
'§ § {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    §: §\n  }\n}',
['query','HomeSummary','label','displayName'],['mutation','"HomeSummary"','display_name'],
'query HomeSummary names the operation. label: displayName returns the displayName value under the response key label.',null,'graphql');
lesson(0,'Render the home page','Retrieve layout JSON for site acme, route /, and language en.',
'A content-tree path identifies an item; a route path identifies a page URL within a site.',
'query {\n  §(site: "acme", §: "/", language: "en") {\n    § {\n      §\n    }\n  }\n}',
['layout','routePath','item','rendered'],['item(path: "/")','path','results','jsonValue'],
'layout resolves the route. item.rendered contains the layout payload used by a rendering application, including component and placeholder information.');
lesson(1,'Make it reusable','Declare required String variables path and language, then use them to read an item name.',
'$ introduces a variable. String! means a non-null string is required. Variable values travel separately as JSON.',
'query ReadItem($path: §, $language: §) {\n  item(path: §, language: §) {\n    name\n  }\n}',
['String!','String!','$path','$language'],['String','"$path"','"$language"','Int!'],
'Both declarations are required strings. "$path" would be literal text, not a variable. Repeated String! chunks are interchangeable.',
{path:'/sitecore/content/Acme/Home',language:'en'},'graphql');
lesson(1,'Two items, one request','Use home and settings as aliases to retrieve two different items in the same operation.',
'When the same field has different arguments, aliases keep the response keys distinct.',
'query {\n  §: item(path: "/sitecore/content/Acme/Home", language: "en") { name }\n  §: item(path: "/sitecore/content/Acme/Settings", language: "en") { name }\n}',
['home','settings'],['item','"home"','"settings"'],
'The response has data.home and data.settings. Aliases also avoid a field conflict caused by calling item twice with different paths.',null,'graphql');
lesson(1,'Fields for components','Get the HeroImage field in the format suitable for a Sitecore SDK field component.',
'SDK field components use structured field data, especially for images and links.',
'query {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    §(name: §) {\n      §\n    }\n  }\n}',
['field','"HeroImage"','jsonValue'],['"hero-image"','value','rendered'],
'jsonValue returns SDK-compatible field data. Raw value and layout rendered serve different purposes. Assume HeroImage exists on this item.');
lesson(1,'Find direct children','Search for items whose immediate parent ID is AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA. Return their names.',
'search filters indexed properties. _parent matches an immediate parent; _path is used for an ancestor scope.',
'query {\n  search(where: { name: §, value: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", operator: § }) {\n    § {\n      name\n    }\n  }\n}',
['"_parent"','EQ','results'],['"_path"','CONTAINS','items'],
'_parent with EQ targets direct children. search returns a result wrapper, so select fields inside results. IDs in this game are illustrative.',null,'schema');
lesson(1,'Narrow the results','Find English items based on template BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB. Both conditions must match. Return total and item names.',
'AND requires every predicate to match. _templates contains template IDs, including inherited base templates.',
'query {\n  search(where: { §: [\n    { name: §, value: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", operator: § }\n    { name: "_language", value: "en", operator: § }\n  ] }) {\n    total\n    results { name }\n  }\n}',
['AND','"_templates"','CONTAINS','EQ'],['OR','"_template"','NCONTAINS'],
'Use AND to combine the template and language predicates. CONTAINS checks membership in _templates; EQ matches the language.',null,'schema');
lesson(1,'First page of results','Get the first five items named Article. Include total, names, and the cursor metadata needed to continue.',
'Pagination metadata tells the client whether another page exists and where to continue.',
'query {\n  search(where: { name: "_name", value: "Article", operator: EQ }, §: 5) {\n    total\n    results { name }\n    § {\n      §\n      §\n    }\n  }\n}',
['first','pageInfo','endCursor','hasNext'],['limit','pagination','cursor','hasNextPage'],
'Experience Edge uses first and pageInfo { endCursor hasNext }. hasNextPage is common in other GraphQL APIs but is not the property used here.');
lesson(2,'Continue with a cursor','Build the next-page query with the supplied variables. Select names and both pagination fields.',
'A cursor is opaque: pass the previous endCursor to after. Do not invent, increment, or decode cursors.',
'query More($where: ItemSearchPredicateInput!, $count: Int!, $cursor: String) {\n  search(where: §, first: §, §: §) {\n    results { name }\n    pageInfo { endCursor § }\n  }\n}',
['$where','$count','after','$cursor','hasNext'],['before','"$cursor"','hasNextPage','offset'],
'The optional String cursor can be null for the first page. Continue while hasNext is true, using each response’s endCursor. Confirm input types against your endpoint schema.',
{where:{name:'_language',value:'en',operator:'EQ'},count:5,cursor:null});
lesson(2,'Project a template type','Assume the published schema includes an Article template type with a headline field. Read headline.value via an inline fragment.',
'Template projection exposes typed fields. Only select type-specific fields within the matching fragment.',
'query {\n  item(path: "/sitecore/content/Acme/Home/News/Launch", language: "en") {\n    § § {\n      § { § }\n    }\n  }\n}',
['... on','Article','headline','value'],['...','"Article"','Title','rendered'],
'... on Article conditionally selects fields for that type. Projected type and field names depend on your templates and naming collisions; inspect the schema.',null,'schema');
lesson(2,'Reuse a selection','Define a fragment called ItemLink on Item. Use it for the home item and its direct children.',
'A named fragment keeps repeated field selections consistent. A fragment spread starts with three dots.',
'fragment ItemLink on § {\n  displayName\n  url { path }\n}\nquery {\n  item(path: "/sitecore/content/Acme/Home", language: "en") {\n    §\n    children {\n      § {\n        §\n      }\n    }\n  }\n}',
['Item','...ItemLink','results','...ItemLink'],['item','ItemLink','items','... on ItemLink'],
'The ItemLink fragment is shared by the parent and children.results. This requests one child page; production navigation may need pagination.');
lesson(2,'Build a breadcrumb','Read the current item and its ancestors that have layout. Use displayName and url.path for each ancestor.',
'Traversing item relationships can replace separate round trips. Ancestors are a list, unlike children’s results wrapper.',
'query {\n  item(path: "/sitecore/content/Acme/Home/News/Launch", language: "en") {\n    displayName\n    §(§: §) {\n      displayName\n      § { § }\n    }\n  }\n}',
['ancestors','hasLayout','true','url','path'],['parent','"true"','rendered','routePath'],
'ancestors(hasLayout: true) selects ancestor items with presentation details. It returns items directly; there is no results wrapper here.');
lesson(2,'Compose a listing','Find English pages in the subtree of AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA with layout. Return total and names. Use all three filters.',
'A listing often combines scope, language, and page eligibility. _path includes the root itself as well as descendants.',
'query {\n  search(where: { §: [\n    { name: §, value: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", operator: § }\n    { name: "_language", value: "en", operator: EQ }\n    { name: §, value: §, operator: EQ }\n  ] }, first: 10) {\n    total\n    results { name }\n  }\n}',
['AND','"_path"','CONTAINS','"_hasLayout"','"true"'],['OR','"_parent"','true','"_layout"'],
'Search predicate values are strings, including "true". This differs from Boolean arguments such as hasLayout: true. This query retrieves only the first ten matches.',null,'schema');
lesson(2,'Route discovery','List English routes for the acme site, returning each route path and ID, total, and pagination metadata.',
'Route discovery supports generating page paths. This exercise assumes an endpoint exposing site.siteInfo.routes.',
'query {\n  § {\n    §(site: "acme") {\n      §(language: "en") {\n        results {\n          §\n          route { § }\n        }\n        total\n        pageInfo { endCursor hasNext }\n      }\n    }\n  }\n}',
['site','siteInfo','routes','routePath','id'],['layout','item','children','path','itemId'],
'Use the site entry point for site route information. Inspect your schema for availability and use first/after for subsequent route pages. This is not a query for arbitrary content-tree roots.');
if(typeof module !== 'undefined') module.exports = {lessons,docs};
