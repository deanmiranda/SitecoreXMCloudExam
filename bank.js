// Original practice questions; source links explain the underlying concepts.
const base = 'https://doc.sitecore.com/sai/en/developers/sitecoreai/';
const edge = base + 'experience-edge/experience-edge-apis/';
const SOURCES = {
 overview: ['SitecoreAI / XM Cloud overview', base+'sitecoreai.html'],
 guide: ['2023 community study guide (historical scope)', 'https://navansitecorenotes.blogspot.com/2023/10/sitecore-xm-cloud-developer.html'],
 queries: ['GraphQL: queries', 'https://graphql.org/learn/queries/'],
 spec: ['GraphQL specification: executable documents', 'https://spec.graphql.org/September2025/'],
 types: ['GraphQL: schemas and types', 'https://graphql.org/learn/schema/'],
 response: ['GraphQL: responses and errors', 'https://graphql.org/learn/response/'],
 validation: ['GraphQL: validation', 'https://graphql.org/learn/validation/'],
 schema: ['Experience Edge schema', edge+'the-experience-edge-schema.html'],
 examples: ['Sitecore: Delivery GraphQL examples', edge+'query-examples-for-the-delivery-graphql-api.html'],
 hd: ['Headless Services 23.x: Delivery examples', 'https://doc.sitecore.com/xp/en/developers/hd/23/sitecore-headless-development/query-examples-for-the-delivery-api.html'],
 apis: ['Experience Edge APIs', edge+'experience-edge-apis.html'],
 differences: ['Preview and Delivery differences', edge+'differences-between-the-preview-and-the-delivery-graphql-apis.html'],
 best: ['Experience Edge best practices', base+'experience-edge/experience-edge-best-practices.html'],
 hosts: ['Authoring, editing and rendering hosts', base+'environment-editing-hosts-and-rendering-hosts.html'],
 deploy: ['Deployment options', base+'deploying-sitecoreai.html'],
 environment: ['Manage an environment', base+'deploying-sitecoreai/deploy-app/manage-an-environment.html'],
 build: ['Build configuration', base+'deploying-sitecoreai/the-sitecoreai-build-configuration.html'],
 modeling: ['Content modeling and presentation', base+'content-modeling-and-presentation.html'],
 pages: ['Structuring pages', base+'recommendations--structuring-pages.html'],
 placeholders: ['Placeholder restrictions', base+'set-placeholder-restrictions.html'],
 scs: ['Content Serialization', base+'sitecore-content-serialization.html'],
 module: ['Create a serialization module', base+'sitecore-content-serialization/create-a-sitecore-content-serialization-module.html'],
 scope: ['SCS configuration reference', 'https://doc.sitecore.com/xp/en/developers/100/developer-tools/sitecore-content-serialization-configuration-reference.html'],
 cli: ['CLI serialization commands', 'https://doc.sitecore.com/xp/en/developers/100/developer-tools/the-cli-serialization-command.html'],
 author: ['Authoring and Management GraphQL API', base+'content-modeling-and-presentation/sitecore-authoring-and-management-graphql-api.html'],
 workflow: ['Workflow', base+'content-modeling-and-presentation/workflow.html'],
 security: ['User security', base+'user-security.html'],
 rights: ['Access rights', base+'user-security/the-access-rights.html'],
 fields: ['Editing shared, unversioned and versioned fields', 'https://doc.sitecore.com/sai/en/users/sitecoreai/build-pages/creating-webpages/edit-a-page-s-content.html'],
 templates: ['Data definition and template overview', 'https://doc.sitecore.com/xp/en/developers/102/sitecore-experience-manager/data-definition-and-template-overview.html'],
 standard: ['Standard values and tokens', 'https://doc.sitecore.com/xp/en/developers/105/sitecore-experience-manager/standard-values-for-data-template-fields.html']
};
const BANK = [];
function add(id, topic, level, prompt, code, options, correct, explanation, sources) {
 BANK.push({id,topic,level,prompt,code,options,correct:Array.isArray(correct)?correct:[correct],explanation,sources:sources.split(',')});
}
const G='GraphQL reading';
add('G01',G,'Foundation','What does this request retrieve?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    id
    name
  }
}`,['The ID and name of one English item','Every field of all English items','The rendered HTML of the whole site','A new item named Home'],0,'Read from the outside in: item selects the content record; the braces select only id and name. This query does not create content.','schema');
add('G02',G,'Foundation','Where is the requested title value in a successful JSON response?',`query {
  page: item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    heading: field(name: "Title") { value }
  }
}`,['data.page.heading.value','data.item.Title','data.page.field.heading','data.heading.page'],0,'Follow the aliases and nesting: page → heading → value, inside data. An alias changes a response key.','response');
add('G03',G,'Foundation','What does the exclamation mark require?',`query Page($path: String!, $language: String!) {
  item(path: $path, language: $language) { name }
}`,['Both variables must receive non-null strings','Both strings must end in !','The server must publish the item first','Both variables are optional'],0,'String! is a non-null input type. With no defaults here, omitting either variable is invalid. It says nothing about whether an item exists.','types');
add('G04',G,'Applied','Which variables JSON fits this operation?',`query Page($path: String!, $language: String!) {
  item(path: $path, language: $language) { id }
}`,['{"path":"/sitecore/content/Acme/Travel/Home","language":"en"}','{"$path":"/sitecore/content/Acme/Travel/Home","$language":"en"}','{"path":42,"language":null}','{"variables":"en"}'],0,'The JSON keys omit the $ prefix. The values must satisfy the declared input types.','queries');
add('G05',G,'Foundation','What is PageSummary in this document?',`query PageSummary {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") { name }
}`,['The operation name','A Sitecore template name','A response alias for item','A field being returned'],0,'PageSummary names this operation for identification and debugging. It does not add a field to the response.','queries');
add('G06',G,'Applied','What is the purpose of the aliases here?',`query {
  english: item(path: "/sitecore/content/Acme/Travel/Home", language: "en") { name }
  french: item(path: "/sitecore/content/Acme/Travel/Home", language: "fr-FR") { name }
}`,['Separate the two results under different keys','Translate English automatically','Merge both records into one language version','Change the item names in Sitecore'],0,'english and french distinguish results for the same field with different arguments. They do not translate or modify content.','queries');
add('G07',G,'Applied','Assume Article is a valid projected template type. What does the inline fragment do?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home/News", language: "en") {
    id
    ... on Article { headline { value } }
  }
}`,['Selects headline when the returned object matches Article','Changes the item template to Article','Finds every Article in the tree','Renames id to headline'],0,'The type condition gates the template-specific selection. id is outside that condition; the fragment is not a search filter.','schema,types');
add('G08',G,'Applied','What is reused by ...Identity?',`fragment Identity on Item { id name }
query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    ...Identity
    parent { ...Identity }
  }
}`,['The id and name selection for both objects','The same returned item object','A server-side cache entry','A mutation that copies the parent'],0,'A fragment reuses a selection set, not a particular result. Each object supplies its own values.','queries');
add('G09',G,'Applied','With variables {"showName":false}, what happens to name?',`query Page($showName: Boolean!) {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    id
    name @include(if: $showName)
  }
}`,['It is omitted from the selected response','It is returned as false','It is always returned as null','It is erased from Sitecore'],0,'@include selects the field only when its condition is true. Omitted and null are different.','spec');
add('G10',G,'Applied','With variables {"hideName":true}, which field remains selected?',`query Page($hideName: Boolean!) {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    id
    name @skip(if: $hideName)
  }
}`,['id only','name only','Both id and name','Neither field'],0,'@skip removes its field when true. It does not affect the adjacent id field.','spec');
add('G11',G,'Foundation','What does rendered represent in this Experience Edge query?',`query {
  layout(site: "travel", routePath: "/destinations", language: "en") {
    item { rendered }
  }
}`,['Layout Service JSON describing the page','The complete browser HTML document','A list of deployment logs','A command that publishes the route'],0,'The front end uses this layout data to render components and placeholders. The API does not render the final browser page here.','hd');
add('G12',G,'Applied','Which value belongs in routePath for the About route in this layout query?',`layout(site: "travel", routePath: /* choose */, language: "en") {
  item { rendered }
}`,['"/about"','"/sitecore/content/Acme/Travel/Home/About"','"Title"','"master"'],0,'routePath identifies the route within the selected site. An item-tree path instead belongs in an item lookup.','examples');
add('G13',G,'Foundation','What is selected from the immediate parent?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home/About", language: "en") {
    name
    parent { id name }
  }
}`,['Its id and name','All ancestors recursively','All siblings and their descendants','Its complete layout automatically'],0,'The nested parent selection requests two properties of one parent. No recursive traversal is implied.','hd');
add('G14',G,'Applied','What is this query useful for?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    children(hasLayout: true, first: 5) {
      results { name url { path } }
    }
  }
}`,['A first batch of child-page navigation links','Every descendant without pagination','An XML sitemap returned as a string','Creating five page layouts'],0,'children traverses one level; hasLayout filters for presentation details. first caps this page of results.','examples');
add('G15',G,'Applied','What does this search condition select?',`search(where: {
  name: "_parent"
  value: "11111111111111111111111111111111"
  operator: EQ
}) { results { name } }`,['Items whose immediate parent has that ID','Only the item with that ID','Every ancestor of that item','Items whose names contain that ID'],0,'_parent is the immediate-parent ID, so this condition targets direct children.','schema');
add('G16',G,'Applied','Which interpretation of this _path filter is correct?',`search(where: {
  name: "_path"
  value: "22222222222222222222222222222222"
  operator: CONTAINS
}) { results { id name } }`,['Matches the identified item and its descendant branch','Matches only an exact URL string','Matches only immediate children','Searches the media filename'],0,'This special field contains hierarchy IDs. The filter can include the branch root itself, not just its descendants.','schema');
add('G17',G,'Applied','What is the role of _templates here?',`search(where: {
  name: "_templates"
  value: "33333333333333333333333333333333"
  operator: CONTAINS
}) { results { name } }`,['Matches a template ID including base-template inheritance','Finds only template definition items','Creates that template','Selects the newest item version'],0,'_templates includes the template inheritance chain. It is not a request to return template definitions.','schema');
add('G18',G,'Applied','Which items satisfy the complete filter?',`search(where: {
  AND: [
    { name: "_language", value: "en", operator: EQ }
    { name: "_parent", value: "44444444444444444444444444444444", operator: EQ }
  ]
}) { results { id } }`,['English items directly under the specified parent','All English items plus every child in any language','Only the parent itself in English','All descendants in all languages'],0,'AND requires both conditions at once. _parent constrains depth to direct children.','examples');
add('G19',G,'Applied','Assume this schema supports the shown OR input. Which languages match?',`search(where: {
  OR: [
    { name: "_language", value: "en", operator: EQ }
    { name: "_language", value: "fr-FR", operator: EQ }
  ]
}) { results { name } }`,['English or French (France)','Only items simultaneously in both languages','All languages except those two','Only a language literally named en,fr-FR'],0,'OR accepts either condition. This does not merge language variants into one record.','schema');
add('G20',G,'Challenge','What is the combined effect? Assume both values are valid item IDs.',`search(where: {
  AND: [
    { name: "_path", value: "55555555555555555555555555555555", operator: CONTAINS }
    { name: "_path", value: "66666666666666666666666666666666", operator: NCONTAINS }
  ]
}) { results { name } }`,['Include the first branch while excluding the second branch','Include the union of both branches','Exclude both branches','Return only the two root items'],0,'Both clauses must pass. NCONTAINS removes the excluded root and its descendants from the matching branch.','hd');
add('G21',G,'Applied','How do you request the next page of this same search?',`{
  "data": {
    "search": {
      "total": 23,
      "pageInfo": { "endCursor": "opaque-token", "hasNext": true },
      "results": [ /* 10 items */ ]
    }
  }
}`,['Keep the filter and pass after: "opaque-token"','Set first: 23 and delete the filter','Use page: 2 on every GraphQL API','Decode the cursor and increment it manually'],0,'Reuse the returned cursor as after. Treat cursors as opaque; their internal format is not your pagination contract.','examples');
add('G22',G,'Applied','The response has total: 31 and eight results. What does that mean?',`search(where: { name: "_language", value: "en", operator: EQ }, first: 8) {
  total
  results { id }
  pageInfo { endCursor hasNext }
}`,['31 matches overall; this page contains eight','Only eight items exist in the environment','31 fields exist on each item','The request failed because counts differ'],0,'total describes the matching set; results is the current page. Continue using pageInfo if more results are needed.','hd');
add('G23',G,'Foundation','When should a cursor-pagination loop stop?',`"pageInfo": { "endCursor": "last-token", "hasNext": false }`,['When hasNext is false','Only when total is zero','Whenever endCursor is nonempty','After exactly two requests'],0,'The API has indicated there is no following page. A nonempty last cursor is not a signal to continue.','examples');
add('G24',G,'Challenge','Why might a large, deeply nested query need restructuring?',null,['It can exceed query-complexity limits; request less per call','GraphQL permits only one field in a response','Every nested field is a mutation','Adding aliases always eliminates complexity'],0,'Bound nested collections, paginate, and remove unused selections. Test realistic queries against Delivery as well as Preview.','best,differences');
add('G25',G,'Foundation','Why request jsonValue for this field?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    field(name: "HeroImage") { jsonValue }
  }
}`,['To obtain field data compatible with Sitecore SDK field helpers','To fetch the image binary directly','To serialize the entire Sitecore database','To bypass all publishing restrictions'],0,'jsonValue provides a structured field representation for SDK rendering helpers, including complex fields.','hd');
add('G26',G,'Applied','What is wrong with the selection if name is a String scalar?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    name { value }
  }
}`,['A scalar cannot have a nested selection set','Every field must have value beneath it','The operation needs a mutation keyword','The item must be published twice'],0,'Leaf scalars are selected directly. Object-valued fields need subfields; scalars do not.','validation');
add('G27',G,'Applied','What happens if the active schema has no field called imaginaryScore?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    imaginaryScore
  }
}`,['Validation rejects the unknown field','The API automatically creates the field','The API guesses the closest field name','The field always resolves to zero'],0,'A request must agree with the endpoint schema before execution. Inspect schema documentation instead of assuming a field exists.','validation');
add('G28',G,'Applied','Which TWO conclusions are justified by this response?',`{
  "data": { "page": { "name": "Home", "heading": null } },
  "errors": [
    { "message": "Field resolution failed", "path": ["page", "heading"] }
  ]
}`,['Some requested data was returned','The client must inspect errors as well as data','The entire operation succeeded without errors','The server created a new item'],[0,1],'GraphQL can return partial data together with execution errors. The error path identifies the affected response position.','response');
add('G29',G,'Applied','A valid Delivery query returns item: null without errors. What is the best next investigation?',null,['Check the item identity, language, publishing state and target environment','Assume GraphQL syntax is invalid','Rename the operation to mutation','Assume every null means an expired credential'],0,'A missing result is distinct from a validation or authentication failure. Confirm that the requested content is actually available on that Delivery target.','apis,response');
add('G30',G,'Challenge','Which TWO statements correctly interpret this query? Assume Promo is a valid template type.',`query Campaign($id: String!, $lang: String! = "en") {
  card: item(path: $id, language: $lang) {
    id
    ... on Promo { title: field(name: "Title") { value } }
  }
}`,['lang defaults to en when omitted','card is the response key for the item','Promo is an alias for id','Explicit null is valid for lang because it has a default'],[0,1],'Omission uses the default; explicit null still violates String!. The Promo fragment adds a type condition.','types,spec');
add('G31',G,'Applied','Which change allows two different field(name: ...) selections to coexist?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    field(name: "Title") { value }
    field(name: "Summary") { value }
  }
}`,['Use title: field(...) and summary: field(...)','Rename query to mutation','Remove both value selections','Put the field names in comments'],0,'Different arguments conflict under the same response key. Distinct aliases resolve that conflict.','validation');
add('G32',G,'Challenge','The document contains two named queries. What identifies which one to execute in a GraphQL request?',`query Home { item(path: "/sitecore/content/Acme/Travel/Home", language: "en") { id } }
query About { item(path: "/sitecore/content/Acme/Travel/Home/About", language: "en") { id } }`,['An operationName such as "About"','The last query always runs','Both queries always run automatically','A field alias named operationName'],0,'When there are multiple operations, the request must select one by name. The document order does not choose it.','spec');
add('G33',G,'Applied','A query worked in a different Sitecore project but its template fragment fails here. What should you inspect first?',null,['The actual projected types and fields in this endpoint schema','The CSS class used for the component','The spelling of the operation name only','The number of browser tabs open'],0,'Template-derived type names depend on the content model. Sample template names are not universal API types.','schema');
add('G34',G,'Applied','Can this operation update an item through Experience Edge Delivery?',`mutation UpdateHeadline {
  updateItem(input: { /* authoring input */ }) { /* result */ }
}`,['No; use the appropriate Authoring and Management API instead','Yes, if the operation name includes Update','Yes, if the item is already published','Yes, if you add an alias'],0,'Delivery is read-only. A mutation keyword does not add unsupported operations to an endpoint. The shown input is deliberately schematic.','author');
add('G35',G,'Challenge','An exact text comparison behaves differently on Preview and Delivery. What is the best response?',null,['Check documented indexing/operator differences and test both endpoints','Assume identical query shapes guarantee identical indexing','Change every EQ into a mutation','Remove language constraints permanently'],0,'Preview uses a different search implementation. Tokenization can affect text matches even when the query shape is shared.','differences');
add('G36',G,'Challenge','Which TWO reading habits are sound for this snippet?',`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    name
    children(first: 3) { results { name } }
  }
}`,['Separate the root name from names inside children.results','Recognize that first limits a page of children','Assume grandchildren are included automatically','Assume first: 3 guarantees exactly three matches'],[0,1],'Trace each brace level. The root and children have separate name selections; a limit is a maximum, not a guarantee.','types,examples');

add('A01','Architecture','Foundation','Which arrangement best fits XM Cloud headless delivery?',null,['Authors manage content in CM; a front end consumes published content from Experience Edge','Visitors connect directly to the authoring database','Experience Edge stores and executes your React components','Every visitor needs a Cloud Portal account'],0,'Content management and public rendering are separated. Experience Edge supplies published content for the front end.','overview');
add('A02','Architecture','Foundation','An author must preview an unpublished change in the visual editor. Which host has the relevant role?',null,['The editing host','The public DNS registrar','A Git package registry','An SMTP relay'],0,'An editing host supports the visual editing experience. The rendering host serves public visitors.','hosts');
add('A03','Architecture','Applied','Which TWO responsibilities belong to a typical developer team using XM Cloud?',null,['Implement and deploy the front-end application','Model content and integrate components','Manually patch the hosted CM operating system every month','Install a private copy of Experience Edge on each visitor device'],[0,1],'SaaS removes hosted-platform maintenance work, while implementation and content-model decisions remain part of the solution.','overview');
add('A04','Architecture','Applied','A new React component is deployed but its required template fields are missing in QA. Which gap best explains it?',null,['The associated Sitecore item definitions were not deployed with the code','GraphQL automatically deleted the template','Every component must use a separate CM database','The browser needs administrator rights'],0,'Front-end code alone does not create the structural Sitecore items it depends on. Version and deploy those definitions together.','scs');
add('D01','Deployment','Foundation','Which TWO interfaces support automating deployment management?',null,['The Deploy REST API','The Sitecore CLI XM Cloud plugin','A layout GraphQL query','A rendering parameter'],[0,1],'The API and CLI support deployment automation. Layout queries and rendering parameters serve different purposes.','deploy');
add('D02','Deployment','Applied','Commits to feature/menu do not deploy an environment configured to watch main. What should you check?',null,['The environment branch binding and automatic-deployment setting','The page title field','The media item alternate text','The GraphQL operation alias'],0,'Automatic deployment follows the configured branch and trigger settings. A commit to another branch need not trigger it.','environment');
add('D03','Deployment','Foundation','What is xmcloud.build.json used for in an XM Cloud solution?',null,['Configuring aspects of the XM Cloud build and deployment','Storing every author-edited item','Declaring the GraphQL language grammar','Replacing all front-end environment variables'],0,'This build configuration describes deployment-related settings such as rendering hosts and actions. It is not the content database.','build');
add('D04','Deployment','Applied','A deployment fails during its build stage. What is the most useful first evidence?',null,['The failed deployment logs for that stage and commit','The last visitor cookie','A random published page title','A screenshot of the source-control logo'],0,'Stage-specific logs help locate the actual failure before you change dependencies or configuration.','environment');
add('D05','Deployment','Applied','QA and production must use different service credentials. Where should you configure the appropriate values?',null,['Environment-specific settings with suitable secret handling','A public JavaScript file committed with production secrets','One shared page field editable by every author','The GraphQL operation name'],0,'Bind configuration to the target environment. Credentials should not become public application assets.','environment');
add('L01','Renderings & layouts','Foundation','What is a placeholder?',null,['A named location where components can be rendered','A template that stores every language version','An API token','A source-control branch'],0,'Placeholder keys connect layout structure to component placement.','modeling');
add('L02','Renderings & layouts','Applied','Authors should place only approved components in a specific region. What should you configure?',null,['Allowed controls in the relevant placeholder settings','The GraphQL query name','The item display name only','A new language for the site'],0,'Placeholder restrictions guide which renderings an author can insert there. They are separate from API access controls.','placeholders');
add('L03','Renderings & layouts','Foundation','Which relationship correctly describes SXA presentation reuse?',null,['A page design can combine partial designs, which contain renderings','A rendering always contains every page design','A partial design is an API credential','A data template is compiled CSS'],0,'Partial designs package reusable presentation; page designs assemble the page structure.','pages');
add('L04','Renderings & layouts','Applied','One header must be maintained centrally across many page designs. Which approach fits?',null,['Reuse a header partial design','Copy independent headers to every page','Store the header in the deployment logs','Create a new content language per page'],0,'Reusing a partial design centralizes changes across the places that use it.','pages');
add('L05','Renderings & layouts','Applied','Which pairing correctly separates a component’s content from presentation choices?',null,['A data source holds content; rendering parameters can hold display options','Rendering parameters are the public content database','A placeholder is the component image file','The data source always contains CSS compiled by Sitecore'],0,'A card can read its title and image from a data source while its rendering instance carries presentation options.','modeling');
add('S01','Serialization','Foundation','Which command brings configured Sitecore items onto disk?',`dotnet sitecore ser _____`,['pull','push','publish','login'],0,'pull reads Sitecore items into serialized files. push applies files in the opposite direction.','cli');
add('S02','Serialization','Foundation','What is the main purpose of storing serialized templates and rendering items in source control?',null,['Review and deploy item definitions alongside dependent code','Replace GraphQL with YAML in every browser','Publish all drafts automatically','Keep user passwords in the repository'],0,'Serialization makes structural item changes versionable and repeatable across environments.','scs');
add('S03','Serialization','Applied','What does this include scope cover?',`{
  "name": "feature-templates",
  "path": "/sitecore/templates/Feature/Travel",
  "scope": "ItemAndChildren"
}`,['The Travel item and its immediate children','Only Travel','Travel and every descendant at every depth','Every template in the database'],0,'ItemAndChildren stops after one child level. ItemAndDescendants would include deeper descendants.','scope');
add('S04','Serialization','Challenge','Which TWO statements match this setting for in-scope items?',`"allowedPushOperations": "CreateAndUpdate"`,['Missing target items can be created from local files','Existing target items can be updated from local files','Target items absent from local files are deleted by this setting','All push changes are forbidden'],[0,1],'CreateAndUpdate allows creation and updates, but excludes deletion. Review the effective include and rule configuration.','scope');
add('S05','Serialization','Applied','A specific item was unexpectedly excluded from serialization. Which command best explains its inclusion decision?',null,['dotnet sitecore ser explain --path "<item path>"','dotnet sitecore ser push','A Delivery layout query','A browser hard refresh'],0,'explain reports why a path is included or excluded. This is more targeted than pushing changes blindly.','cli');
add('I01','APIs & webhooks','Foundation','Which API should an integration use to create or edit Sitecore items?',null,['Authoring and Management GraphQL API','Experience Edge Delivery GraphQL API','A public media URL','The browser History API'],0,'Authoring operations belong to the authoring API, with appropriate authentication and permissions. Delivery retrieves content.','author');
add('I02','APIs & webhooks','Foundation','A saved draft is visible in Preview but absent from Delivery. What is the expected distinction?',null,['Preview can expose unpublished content; Delivery serves published content','Preview and Delivery must always return identical content','Delivery automatically publishes every save','Preview contains only production content'],0,'Saving and publishing are separate steps. Verify publishing eligibility and target when investigating this difference.','apis');
add('I03','APIs & webhooks','Applied','A front end needs to refresh after content is published to Edge. Which integration pattern fits?',null,['An Edge publishing webhook invokes a rebuild or revalidation receiver','A query alias invalidates every frontend cache','A field named Refresh forces all browsers to reload','A component parameter runs deployment scripts'],0,'A webhook can notify downstream systems; the receiver implements the rebuild or cache-refresh action. The event itself does not rebuild your app.','best');
add('I04','APIs & webhooks','Applied','Which API administers Experience Edge settings and webhooks?',null,['Experience Edge Admin REST API','The read-only item query','The CSS Object Model','A Sitecore template inline fragment'],0,'Administration is separate from delivery queries. Use the appropriate management interface and credentials.','apis');
add('P01','Pages & authoring','Foundation','What is the main purpose of XM Cloud Pages (called Page builder in newer documentation)?',null,['Visually compose and edit site pages','Manage Git merge conflicts','Replace the public front-end host','Patch the CM operating system'],0,'This visual authoring interface lets authors work with page content and presentation.','overview');
add('P02','Pages & authoring','Applied','Two pages use the same component data-source item. An author edits that item. What should they expect?',null,['Both usages can reflect the updated shared content after the relevant delivery updates','Sitecore automatically clones the data source first','Only the page URL changes','The second usage becomes permanently disconnected'],0,'A shared data source represents the same content item. Use independent items when the content must vary independently.','modeling');
add('P03','Pages & authoring','Applied','A page is still in a non-final workflow state. What should you check before expecting it on the public site?',null,['Approval and publishing eligibility, then publishing status','Whether its query uses an alias','Whether its React file has a short filename','Whether its template has exactly four fields'],0,'Workflow controls progression toward publishable content. Saving in an editor alone does not complete approval and publication.','workflow');
add('P04','Pages & authoring','Applied','A French title change must not alter the English title or older numbered versions. Which field behavior fits?',null,['Versioned','Shared','Unversioned across all languages','A rendering placeholder'],0,'A versioned field belongs to one numbered version in one language.','fields');
add('U01','Security','Foundation','What is the appropriate approach when an editor needs access to one content area?',null,['Grant the necessary role and item rights for that work','Make every editor an administrator','Share the organization owner account','Expose management credentials in page HTML'],0,'Role-based access and item rights let permissions match the job. Blanket administrator access is unnecessary.','security,rights');
add('U02','Security','Applied','An author can see an item but cannot edit it. Which distinction should you investigate?',null,['Read versus write rights, plus workflow and locking constraints','GraphQL aliases versus fragments','PNG versus JPEG image formats','The order of CSS imports'],0,'Visibility does not imply edit permission. Inspect effective access and the item’s editing state.','rights,workflow');
add('U03','Security','Applied','Who manages authentication and user onboarding for the hosted platform?',null,['Sitecore Cloud Portal','The public site’s anonymous visitor session','A GraphQL fragment','The component’s CSS module'],0,'Cloud Portal manages platform authentication and user creation. Item-level authorization is a separate concern.','security');
add('U04','Security','Challenge','Which TWO are sound controls for a privileged authoring integration?',null,['Use only the permissions the integration needs','Keep management secrets out of browser-delivered code','Rely on a difficult-to-guess operation name for authorization','Give anonymous visitors the integration’s management token'],[0,1],'A query name is not access control. Authenticate the integration and protect credentials that permit management operations.','author,security');
add('M01','Data modeling','Foundation','Several page types need SEO title and description fields. What avoids duplicating those field definitions?',null,['A shared base data template inherited by those page templates','Separate identical fields copied into every template','A GraphQL alias for each field','One deployment environment per field'],0,'Template inheritance reuses field definitions while concrete templates add their own fields.','templates');
add('M02','Data modeling','Applied','A product identifier must have one value across every language and numbered version. Which storage setting fits?',null,['Shared','Unversioned','Versioned','A fragment'],0,'Shared fields use one value across languages and versions.','fields');
add('M03','Data modeling','Applied','A label must be translated, but each language should share its value across all numbered versions. Which setting fits?',null,['Unversioned','Shared','Versioned','A layout key'],0,'Unversioned fields vary by language, but not by numbered version within that language.','fields');
add('M04','Data modeling','Applied','Where should a reusable default field value for a data template normally be defined?',null,['The template’s Standard Values item','Every component’s deployment log','The GraphQL operation name','The rendering host DNS record'],0,'Standard Values supply defaults for fields without their own values and support consistent template-based content.','standard');
add('M05','Data modeling','Challenge','A Title standard value uses $name. An item is created as Beach, then renamed Coast. What happens to the populated Title without further edits?',null,['It stays Beach','It automatically becomes Coast on every rename','It becomes the literal string $name','It is removed from all language versions'],0,'Creation-time token replacement is not a live binding to the item name. Renaming does not re-run the token.','standard');
