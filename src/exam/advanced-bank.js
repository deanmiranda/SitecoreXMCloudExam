// Keep the original definitions immutable so in-progress v1 attempts remain valid.
const LEGACY_BANK = BANK.map(q=>({...q,options:[...q.options],correct:[...q.correct],sources:[...q.sources]}));
function revise(id, options, explanation, changes={}) {
 const i=BANK.findIndex(q=>q.id===id);
 if(i<0)throw new Error('Unknown question '+id);
 BANK[i]={...BANK[i],level:'Applied',options,explanation,...changes};
}
revise('G01',[
 'One item with its own name and the names in its first page of direct children',
 'One item with its own name and the names of every descendant',
 'The names of child items, with the root item excluded from the response',
 'The root item and exactly two children, even if fewer children exist'
],'There are two selection levels: the root name and children.results[].name. first is a maximum for that connection, and no grandchildren are selected.',{
 prompt:'Assume the item exists and has five direct children, each with descendants. Which interpretation is justified by this query?',
 code:`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    name
    children(first: 2) { results { name } }
  }
}`,level:'Challenge'});
revise('G02',['data.page.heading.value','data.PageSummary.page.heading.value','data.page.Title.value','data.item.field.value'],
 'Neither the operation name nor the field argument creates a response key. Follow the two aliases, then value.',{
 prompt:'A successful response contains a non-null item and title field. Which JavaScript access path retrieves the title?',
 code:`query PageSummary {
  page: item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    heading: field(name: "Title") { value }
  }
}`});
revise('G03',[
 'Omitting language uses en; explicitly passing null fails variable coercion',
 'Omitting language and explicitly passing null both use en',
 'Both variables must be provided because both types have an exclamation mark',
 'Omitting language is valid, but an explicit empty string is rejected by String!'
],'A default handles omission, not explicit null. String! prohibits null, but does not prohibit an empty string.',{
 prompt:'Which statement about these input variables is correct?',
 code:`query Page($path: String!, $language: String! = "en") {
  item(path: $path, language: $language) { name }
}`,level:'Challenge'});
revise('G04',[
 '{"path":"/sitecore/content/Acme/Travel/Home","language":"en"}',
 '{"$path":"/sitecore/content/Acme/Travel/Home","$language":"en"}',
 '{"path":{"value":"/sitecore/content/Acme/Travel/Home"},"language":"en"}',
 '{"path":"/sitecore/content/Acme/Travel/Home","language":["en"]}'
],'Variable names in the separate JSON dictionary omit $. String inputs are scalar strings, not field-value objects or lists.');
revise('G05',[
 'The operation name; changing it alone leaves the selected response keys unchanged',
 'A root response key wrapping the item object',
 'A projected template type that constrains the item lookup',
 'A resolver argument used to select the page layout'
],'The operation name identifies the operation. Aliases and selected fields determine response keys; arguments and type conditions have separate syntax.');
revise('G06',[
 'They permit different arguments on item while keeping distinct response keys',
 'They are required because an operation may contain only one root field name',
 'They force both results to resolve to the same published language version',
 'They create two operations that the client must select using operationName'
],'Both selections are in one operation. Aliases avoid the response-key conflict caused by differing arguments; they do not alter language resolution.');
revise('G07',[
 'id remains selected, but headline is absent when the runtime type does not match Article',
 'The entire item is null when its runtime type does not match Article',
 'headline is always present with null when the runtime type does not match Article',
 'The query fails validation whenever the returned item is not an Article'
],'A valid type condition controls which fields apply at runtime. A nonmatching fragment neither filters out the item nor inserts a null key.',{
 prompt:'Article is a valid possible type, but this lookup returns a different template type that does not match Article. What should you expect?',level:'Challenge'});
revise('G08',[
 'Both objects receive the id and name selection, but their values can differ',
 'The parent inherits the root item’s values because both use the same fragment',
 'The parent is returned only if its id equals the root id',
 'Identity becomes a nested response object beneath both item and parent'
],'A fragment contributes fields to each selection set. It does not copy result values, compare objects, or create an Identity response key.');
revise('G09',[
 'name is omitted because @skip evaluates to true',
 'name is included because @include evaluates to true',
 'name is returned as null because the directives cancel each other',
 'The document is invalid because these two directives cannot share a field'
],'A field must pass both conditions: include must be true and skip must be false. Here skip wins by excluding the field.',{
 prompt:'Both supplied variables are true. What happens to name?',
 code:`query Page($details: Boolean!, $compact: Boolean!) {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    id
    name @include(if: $details) @skip(if: $compact)
  }
}`,level:'Challenge'});
revise('G10',[
 'The query fails validation because the unknown field is still part of the document',
 'The query succeeds because the invalid selection is skipped at execution',
 'The query returns id plus imaginaryScore: null and no errors',
 'The query returns partial data and a field-resolution error for imaginaryScore'
],'Directives do not bypass validation. An unknown field is a request error before resolver execution, even when it would be skipped.',{
 prompt:'The Item type has no imaginaryScore field. What happens to this request?',
 code:`query {
  item(path: "/sitecore/content/Acme/Travel/Home", language: "en") {
    id
    imaginaryScore @skip(if: true)
  }
}`,sources:['validation','spec'],level:'Challenge'});
revise('G11',[
 'Layout Service JSON, including component placement and the data needed for rendering',
 'Only the route item’s content fields, excluding component and placeholder information',
 'The final HTML for the route, already rendered by the public rendering host',
 'A GraphQL selection set that the client must execute as a second query'
],'rendered carries page-layout data. A front-end application still resolves components and renders the user interface.');
revise('G12',[
 '"/about", resolved within the site named travel',
 '"/sitecore/content/Acme/Travel/Home/About", resolved as a CMS item path',
 '"https://travel.example/about", resolved as the public URL including hostname',
 '"/en/about", required even when language is supplied separately'
],'routePath is a route within the selected site. CMS item paths and absolute public URLs are different identifiers; a language prefix is not universally required.');
revise('G13',[
 'The root item’s name plus the immediate parent’s id and name',
 'The root item’s name plus a list of all ancestors with id and name',
 'The immediate parent’s id and name, with the root name replaced',
 'The root item’s name plus all sibling names through the parent relationship'
],'Each nested relationship must be selected explicitly. parent does not implicitly request ancestors, siblings, or children.');
revise('G14',[
 'At most five direct children with layout, with only name and url.path requested',
 'The first five direct children, with layout-less items returned as null entries',
 'At most five descendants at any depth, sorted by public URL',
 'All direct children with layout, with first limiting the number of fields'
],'The filter applies to the child connection. The limit is on returned items, not fields; the query specifies neither recursion nor a URL sort.',{
 prompt:'Which statement is guaranteed by the query’s structure, assuming a valid request?'});
revise('G15',[
 'Direct children of the specified parent, including different templates unless further filtered',
 'All descendants of the specified parent, including grandchildren',
 'Only the specified parent, provided it has at least one child',
 'Direct children using the same template as the specified parent'
],'_parent restricts the immediate parent ID. It supplies neither a recursive branch test nor a template constraint.');
revise('G16',[
 'The identified root and matching descendants; this alone does not restrict results to pages',
 'Only descendants with layout; the root is always excluded',
 'Only direct children; the value is treated as an immediate-parent ID',
 'Any item whose public URL contains the textual GUID'
],'_path expresses ancestry by item ID. Add presentation-related conditions if the requirement is specifically navigable pages.');
revise('G17',[
 'It can match items through an inherited base template, not just their concrete template',
 'It matches only items whose concrete template ID equals the supplied ID',
 'It matches template-definition items whose names contain the supplied ID',
 'It follows references stored in multilist fields to find related items'
],'The special field includes template inheritance IDs. It is not a relationship-field traversal or a template-name search.');
revise('G18',[
 'English items whose immediate parent is the supplied item',
 'English descendants of the supplied item at any depth',
 'All English items, combined with direct children in every language',
 'The supplied parent’s English version and all its direct children'
],'Both clauses must be true for each returned record. Neither clause says to include the parent or traverse every depth.');
revise('G19',[
 'Records satisfying either language condition; no automatic grouping by item ID is implied',
 'One record per item ID, preferring en when both language versions exist',
 'Only items that have both an English and a French language version',
 'English records with French field values merged in through fallback'
],'OR filters records. Deduplication across language variants and language fallback are separate behaviors, not consequences of OR.');
revise('G20',[
 'The first root and its branch, minus any records that also belong to the second branch',
 'Only direct children of the first root, excluding the second root itself',
 'Both branches, excluding only records whose own IDs equal the two supplied IDs',
 'The first branch, retaining descendants of the excluded root as long as their IDs differ'
],'NCONTAINS on _path excludes membership in the second branch, including its descendants. If the branches do not overlap, the exclusion removes nothing.');
revise('G21',[
 'Keep the search constraints and pass the returned endCursor as after',
 'Keep the search constraints and pass results.length as after',
 'Keep after unchanged and increase first by the previous page size',
 'Remove the language filter and use the cursor to continue across every language'
],'A cursor continues the same filtered connection. An item count is not a cursor; changing constraints changes the result set being paginated.');
revise('G22',[
 'There are 31 matches; eight were returned on this page, so further pages must be considered',
 'There are 31 matches, and the API has already returned all 31 in results',
 'There are eight matching records; total counts fields across those records',
 'There are 31 matches, but only eight are accessible because first is a permission limit'
],'first controls a page size. total is not the number of fields or an access-control setting; pageInfo determines continuation.');
revise('G23',[
 'Stop this traversal because hasNext is false, even though endCursor is populated',
 'Continue until the API returns an empty cursor',
 'Continue until a repeated cursor causes a validation error',
 'Send one more request because the last page might be exactly the page size'
],'hasNext is the continuation signal. A nonempty final cursor does not require a speculative extra page.');
revise('G24',[
 'Limit nested collections and paginate them while retaining the fields the feature requires',
 'Add aliases to the nested fields so each alias receives a separate complexity budget',
 'Increase first so that fewer HTTP requests necessarily mean lower per-query complexity',
 'Replace variables with literals so the server no longer counts the nested selections'
],'Aliases and literals do not remove requested work. Fewer HTTP requests can mean a more expensive individual query; bound the fan-out.');
revise('G25',[
 'It returns the field representation expected by SDK field components',
 'It returns exactly the same scalar string as value for every field type',
 'It returns layout JSON for every rendering that references the item',
 'It ensures the field is editable even if the component ignores SDK editing support'
],'Structured field data and editing-aware rendering are related but distinct. jsonValue alone cannot make arbitrary UI support inline editing.');
revise('G26',[
 'Remove the sub-selection from name; keep sub-selections on object-valued fields',
 'Replace value with jsonValue under name to support the Sitecore SDK',
 'Add an alias to name so the scalar is treated as an object',
 'Move name into a fragment without changing its sub-selection'
],'Aliases and fragments cannot change a field’s declared type. A String remains a leaf selection.');
revise('G27',[
 'The document fails validation before resolver execution',
 'The server returns item with all valid fields and an error only for the unknown field',
 'The unknown field returns null if the item itself is nullable',
 'The field is accepted if an item contains a stored content field with that exact name'
],'A GraphQL field must exist on the selected schema type. A stored Sitecore field does not automatically become a directly selectable property in every context.');
revise('G28',[
 'Execution returned usable data for at least part of the request',
 'The error path identifies heading within the aliased page response',
 'The response demonstrates a document-validation failure before any fields executed',
 'Every selected field resolved successfully; null simply means the title was empty'
],'data.page.name survived while an error points to page.heading. This is partial execution, not pre-execution validation failure or evidence of a merely empty authored field.',{
 prompt:'page and heading are aliases in the request. Which TWO statements are supported by this response?',level:'Challenge'});
revise('G29',[
 'Confirm the requested item and language were published to the Delivery environment being queried',
 'Move the same request to the authoring endpoint without changing its schema-specific arguments',
 'Assume the operation name must match the Sitecore item name',
 'Treat null without errors as proof that the API token was rejected'
],'Content availability, target environment, and identifier selection explain a missing result without requiring a syntax or authentication failure.');
revise('G30',[
 'Omitting lang uses en, but explicitly passing null does not',
 'If Promo does not match, id remains selected and title is omitted',
 'The alias card changes which Sitecore item is selected by id',
 'If Promo does not match, title is required to appear as null'
],'Defaults apply to omitted variables; the non-null type rejects explicit null. A nonmatching fragment omits its fields and does not null the whole item.',{
 prompt:'Promo is a valid possible type. Which TWO statements hold for this operation?',level:'Challenge'});
revise('G31',[
 'Give the two field selections different aliases, retaining their arguments and subfields',
 'Put each conflicting field selection in a different named fragment without aliases',
 'Add an operation name so the server can distinguish the two field arguments',
 'Rename the variables supplied to field while leaving both response keys as field'
],'Conflicts concern response keys and arguments, including selections introduced through fragments. Operation names and variable spelling do not distinguish result keys.');
revise('G32',[
 'The request’s operationName must identify one of the named operations',
 'The client must rename each root item field to match its operation name',
 'The server executes both operations and merges their data objects',
 'The server executes whichever operation appears first in the document'
],'A multi-operation document needs explicit operation selection. Aliases operate within a selected operation and do not choose it.');
revise('G33',[
 'Compare the actual projected type and field names against the target endpoint schema',
 'Keep the fragment unchanged and replace the operation name with the template ID',
 'Assume publishing the page alone will create any fragment type named in the query',
 'Move the same template-specific field directly onto Item to avoid type validation'
],'Projection depends on the target content model. Verify schema types rather than removing the type condition or changing an unrelated operation label.');
revise('G34',[
 'No; select the authoring endpoint and use its mutation schema and authorization',
 'Yes; a management token enables mutation fields on the Delivery schema',
 'Yes; POST enables writes while GET is limited to read operations',
 'No; use Preview instead because its unpublished content support includes mutations'
],'Endpoint capability is not determined by HTTP method or a stronger credential. Preview and Delivery are read-only content APIs.');
revise('G35',[
 'Investigate tokenization and documented operator semantics on each endpoint',
 'Assume EQ means substring matching on Delivery whenever Preview returned extra matches',
 'Assume equal query shapes imply that any difference must be a publishing failure',
 'Replace the filter with aliases, since aliases enforce exact text comparison'
],'Shared shapes do not imply identical search indexes. Operator behavior needs to be tested in the endpoint where the query will run.');
revise('G36',[
 'The root name and each child name occupy different nesting levels',
 'Three is an upper bound for the returned child page, not a required count',
 'The limit applies to the total number of selected name fields, including the root',
 'A child with its own children automatically includes those grandchildren'
],'The connection limit applies to child results. Only the explicitly selected relationship depth appears.');

revise('A01',[
 'CM handles authoring; Experience Edge supplies published data; a separate application renders the public site',
 'CM handles authoring and renders every public request; Edge caches the resulting HTML',
 'The public application reads authoring data directly; publishing updates its React source files',
 'Experience Edge hosts the public application code as well as the published content schema'
],'Separate content authoring, content delivery, and front-end execution. Edge delivers content and layout data; it does not replace the application host.',{
 prompt:'A team is drawing the request path for its public Next.js site. Which allocation of responsibilities is accurate?'});
revise('A02',[
 'Investigate editing-host connectivity and configuration while retaining the working public rendering host',
 'Point the visual editor at the Delivery API only, because the public site already renders',
 'Republish the site before checking editing-host configuration, since saved drafts are on Edge',
 'Move the production domain to the editing host so both audiences share one endpoint'
],'A working public site does not prove the editing integration is healthy. Draft visualization requires the authoring/editing path.',{
 prompt:'The public site is healthy, but authors cannot load a saved, unpublished page in the visual editor. Which is the best initial direction?'});
revise('A03',[
 'Deploy the front-end implementation and its environment configuration',
 'Deploy the structural Sitecore items required by the implementation',
 'Assume publishing the page also deploys the new React implementation',
 'Assume a new component file automatically creates its data-template fields'
],'Code deployment and structural item deployment are both implementation concerns. Content publishing does not substitute for either.',{
 prompt:'A new component depends on a new content field. Which TWO tasks must the implementation team account for before release?'});
revise('A04',[
 'Check that the new field definition is serialized, included, and pushed to QA with the release',
 'Republish the existing page repeatedly until GraphQL infers the missing field from React',
 'Clear the QA Delivery cache before changing structural items, because schema projection alone creates fields',
 'Rebuild only the front-end component map, because the missing field is a rendering-registration issue'
],'Confirm deployment of the structural dependency. Credentials and publishing content do not invent missing item definitions.',{
 prompt:'React code reads a new field successfully in development. In QA the field definition is absent from the template, although the code deployment succeeded. What is the targeted fix?'});
revise('D01',[
 'Use the Deploy REST API for project and environment deployment operations',
 'Use the Sitecore CLI XM Cloud plugin for supported deployment operations',
 'Use Experience Edge Admin REST operations to compile and release CM changes',
 'Use Authoring GraphQL item mutations as a replacement for environment deployment'
],'The deployment interfaces manage releases. Edge administration and authoring CRUD are separate responsibilities.',{
 prompt:'A CI pipeline must automate deployment management. Which TWO interfaces are appropriate?'});
revise('D02',[
 'Check the watched branch, trigger setting, and whether the commit reached that branch',
 'Inspect only the public hosting provider’s branch binding; the XM Cloud environment binding is irrelevant',
 'Trigger content publication from main, because it is the step that starts a code deployment',
 'Enable the repository connection again without checking which branch the environment watches'
],'A feature-branch commit will not trigger a main-bound environment unless it reaches main and the trigger is enabled.');
revise('D03',[
 'The project’s XM Cloud build/deployment configuration, including supported host and action settings',
 'The environment’s entire runtime secret store, serialized into the repository',
 'The list of every content item and field value to be published on a release',
 'The module include rules that exclusively govern all serialization paths'
],'Build configuration, environment values, serialized item data, and module include rules are distinct configuration layers.');
revise('D04',[
 'Inspect the failing stage’s logs and the configuration used for the affected commit',
 'Roll back content to the last published version, because build failures establish that item data is incompatible',
 'Rotate the Delivery token first, because an unchanged public site implies a failed Edge connection',
 'Run the post-deployment item synchronization manually, despite the build not having completed'
],'Investigate evidence from the failed stage before altering other systems. Content publication and delivery caches do not repair a build dependency failure.',{
 prompt:'A release fails before the deployment stage; the previous public site still works. What should you do first?'});
revise('D05',[
 'Verify which environment supplies the value and whether it is read at build time or runtime',
 'Update only the CM environment setting, without checking which application consumes the value',
 'Invalidate only the content CDN, assuming the application’s build-time configuration will change',
 'Restart the public application without checking whether the value was embedded into the build'
],'The consuming host and the timing of configuration reads matter. Environment changes may need a rebuild or redeploy depending on how the application uses them.',{
 prompt:'A public application still calls the QA service after a production configuration change. Which investigation best targets the problem?'});
revise('L01',[
 'It identifies the component insertion location that the layout data and front-end placeholder must agree on',
 'It selects the content item that supplies the rendering’s text and images',
 'It defines the data template inherited by every component in that region',
 'It sets the language version independently of the layout request'
],'A placeholder is a placement contract. The data source, template, and language serve different roles.',{
 prompt:'A component appears in layout data but not in the intended region of the page. Why is the placeholder key relevant?'});
revise('L02',[
 'Configure allowed renderings on the placeholder settings used by that region',
 'Set the data-source template on the page’s data item',
 'Set compatible renderings on an unrelated component definition',
 'Remove write rights from every component data-source item'
],'Allowed controls target insertion into a placeholder. Data-source restrictions and compatible renderings address other authoring decisions.');
revise('L03',[
 'Page designs assemble reusable partial designs; partial designs contain presentation elements',
 'Partial designs select the page data template; page designs store field values for components',
 'Page designs and partial designs are interchangeable; either can serve as the same composition level',
 'Page designs must duplicate partial-design renderings to propagate changes to their pages'
],'Page and partial designs organize presentation reuse. They do not replace the content model or require independent copies.');
revise('L04',[
 'Reference a common header partial design from the relevant page designs',
 'Copy the same renderings into each page and share only their placeholder keys',
 'Create independent header partial designs with identical display names',
 'Use one shared text field but keep the header’s component structure duplicated'
],'Sharing content alone does not centralize the header’s layout. Reusing the presentation definition centralizes structural changes.');
revise('L05',[
 'Use separate rendering-parameter values for each instance while referencing the same data-source item',
 'Duplicate the data-source item whenever a different display variant is needed',
 'Change a shared content field to alter only one rendering instance’s appearance',
 'Change the data-source template so its fields become rendering parameters automatically'
],'Instance-specific display configuration can differ while content is reused. Duplicating content introduces unnecessary divergence.',{
 prompt:'Two cards need identical title/image content but different display options. The component supports those options as rendering parameters. Which configuration best fits?'});
revise('S01',[
 'pull, after verifying the target environment and inclusion configuration',
 'push, because local YAML must be overwritten by the remote definitions',
 'package install, because it always downloads the instance’s latest items',
 'validate, because it refreshes serialized fields from the environment'
],'pull reads the configured instance into local files. push and package installation apply local artifacts to an instance; validation is not a refresh.',{
 prompt:'A developer made a template change in CM and wants its YAML representation in a code review. Which subcommand fills the blank?'});
revise('S02',[
 'Version structural items with the code and deliberately scope which author-owned content is deployed',
 'Include the author-owned content subtree with CreateUpdateAndDelete to keep it identical to local development',
 'Use CreateOnly for every structural item so later field-definition changes never overwrite deployed items',
 'Keep structural items outside source control and recreate them manually after each code deployment'
],'Structural items should travel with dependent code. Broadly synchronizing author-owned production content can overwrite or remove work.',{
 prompt:'Which serialization strategy best supports repeatable releases without treating all production-authored content as developer-owned?'});
revise('S03',[
 'Travel and its immediate children; deeper section/field descendants may be omitted',
 'Travel and every descendant, because the path is under templates',
 'Only immediate children; Travel itself is excluded',
 'Every descendant except immediate children, which are inferred on push'
],'Scope behavior does not change for template paths. Template structures often span multiple levels, so a shallow include may be incomplete.',{
 prompt:'Travel contains template items, which in turn contain sections and fields. What is the important implication of this include?',level:'Challenge'});
revise('S04',[
 'An item present locally but absent remotely can be created',
 'An item present in both locations can be updated',
 'An in-scope remote item absent locally is deleted to match source control',
 'Existing remote items are preserved unchanged even when local files differ'
],'CreateAndUpdate permits both additions and updates. It excludes deletion; CreateOnly is the mode that avoids updating existing items.',{
 prompt:'Assume this is the effective rule and no narrower rule overrides it. Which TWO outcomes are allowed?',level:'Challenge'});
revise('S05',[
 'Use ser explain for the item path to inspect the effective include/rule decision',
 'Use ser validate alone to determine which module’s scope selected the item',
 'Use ser push to force the item into scope regardless of module configuration',
 'Use ser info alone, without inspecting the affected path or the rule that matches it'
],'explain is designed to explain selection. Validation checks integrity, while synchronization still follows inclusion rules.');
revise('I01',[
 'Authoring and Management GraphQL with its supported mutation input and authorization',
 'Delivery GraphQL with a token that has broader management permissions',
 'Preview GraphQL because unpublished records are necessarily writable there',
 'Edge Admin REST because all APIs containing Admin expose item-field CRUD'
],'Choose the operation-specific API. Read access to unpublished data and administrative control over Edge are not item-authoring mutations.');
revise('I02',[
 'Confirm approval and publication of the correct language/version to the queried Edge target',
 'Switch production permanently to Preview so publication is no longer required',
 'Redeploy the React application first, even though its direct Delivery query lacks the update',
 'Invalidate the application cache before investigating publication, despite the direct API returning the old value'
],'The direct Delivery result isolates the issue upstream of front-end rendering. Check publication and target selection before the application.',{
 prompt:'Preview returns the edited title. A direct Delivery query returns its previous value, and production shows that same old value. What should you verify first?'});
revise('I03',[
 'Trigger the application’s rebuild or revalidation process through a publishing webhook',
 'Clear the Edge cache only, leaving the application’s previously generated HTML intact',
 'Republish the same items without triggering a rebuild or revalidation of application output',
 'Redeploy only CM, assuming it replaces HTML already generated by the external application host'
],'Edge publication and an application’s cached/generated output are separate stages. The receiver must perform the refresh action.',{
 prompt:'A direct Delivery query returns new content, but a statically generated site still serves old HTML. Which integration addresses this gap?'});
revise('I04',[
 'Experience Edge Admin REST API',
 'Experience Edge Delivery GraphQL API',
 'Sitecore Authoring and Management GraphQL API',
 'XM Cloud Deploy REST API'
],'The relevant resource is Edge configuration/webhooks. Item authoring and environment deployments use different management interfaces.',{
 prompt:'An integration needs to manage Experience Edge webhooks and settings rather than author items or deploy source code. Which API is intended for that resource?'});
revise('P01',[
 'Configure and validate the component’s Sitecore definition, placement, and editing integration',
 'Deploy the component implementation and rely on its public-site rendering as proof of editor compatibility',
 'Add its data-source template but omit rendering registration and placeholder configuration checks',
 'Configure the allowed rendering but omit the front-end implementation mapping and editing checks'
],'A front-end implementation and its authoring integration must agree. File presence alone is not the complete authoring contract.',{
 prompt:'A developer adds a component to the front-end project. What must be considered before authors can reliably insert and edit it in Pages?',sources:['modeling','placeholders']});
revise('P02',[
 'Create or select a separate data-source item for the page that must diverge',
 'Change only the rendering UID while keeping the shared data-source reference',
 'Change the placeholder key while keeping the shared data-source reference',
 'Set a different display parameter and expect it to create an independent title value'
],'A different rendering instance or placement does not duplicate its referenced content. Independent text requires independent content storage.',{
 prompt:'Two pages reference one data-source item. Authors now need different titles on those pages while keeping the same component implementation. What should change?'});
revise('P03',[
 'Advance the intended version through workflow as required, then publish and verify the target',
 'Publish the page’s parent only and assume the intended version’s workflow state is irrelevant',
 'Rebuild the front end against the same Delivery content without completing the content approval',
 'Verify the English version’s approval when the requested route uses a different language'
],'Presentation queries and application deployments do not replace content approval and publication.');
revise('P04',[
 'Versioned, because both language and numbered-version isolation are required',
 'Unversioned, because language isolation also isolates all numbered versions',
 'Shared, because each translated page maintains its own shared-field value',
 'A rendering parameter on the shared design, because it versions the page’s Title field'
],'Unversioned would affect every numbered version in French. Shared would also cross language boundaries; a display parameter is not the field’s storage behavior.');
revise('U01',[
 'Assign an appropriate role and evaluate its effective rights on the intended subtree',
 'Grant read access to the root and assume it also grants write access to descendants',
 'Assign an organization-level role and assume it resolves every item-level restriction',
 'Grant write on a parent and assume explicit restrictions below it cannot affect access'
],'Evaluate effective permissions at the content scope. Platform roles, read rights, and inherited grants do not make every downstream authorization equivalent.');
revise('U02',[
 'Inspect effective item/field write rights and the workflow or locking state',
 'Inspect only the organization role, assuming app and item rights cannot further restrict editing',
 'Check only the item’s Read right, assuming visible fields must also be writable',
 'Assign broad item Write permission without checking field restrictions, workflow, or locks'
],'Read, write, field access, workflow, and locking affect different parts of the editing decision.');
revise('U03',[
 'Platform authentication is established; app access and item-level authorization still need checking',
 'The problem must be a content lock; no further app or item authorization checks are needed',
 'The problem must be publication state, because portal authentication supplies item-write rights',
 'The user’s organization membership is sufficient; only the rendering-host configuration needs checking'
],'Authentication proves identity, not permission for every application or content operation.',{
 prompt:'A user can sign in to Cloud Portal but cannot edit the required content. What conclusion is warranted?'});
revise('U04',[
 'Authorize the integration only for the operations and resources it needs',
 'Keep its privileged management credential in trusted server-side configuration',
 'Rely on CORS alone to keep a credential embedded in browser JavaScript confidential',
 'Use a private operation name as the primary control for privileged mutations'
],'CORS does not hide a secret shipped to the browser. An operation name identifies a request; it is not an authorization mechanism.');
revise('M01',[
 'Move the common field definitions into a base template inherited by the page templates',
 'Create independent fields with the same names in each page template and assume they share identity',
 'Copy the standard-values item between unrelated templates without introducing a common base',
 'Use a branch template to duplicate the structures at creation time instead of establishing inheritance'
],'Base-template inheritance reuses definitions. Identical names, shared data items, and creation-time branch structures are different mechanisms.');
revise('M02',[
 'Shared: changes affect the field across languages and numbered versions',
 'Unversioned: changes affect all numbered versions and therefore all languages',
 'Versioned with the same standard value: later edits automatically propagate everywhere',
 'A base-template field: inheritance alone makes its values shared'
],'Field-definition inheritance and field-value storage are separate. Sharing a definition does not make every item/version share one value.');
revise('M03',[
 'Unversioned: one value per language across that language’s numbered versions',
 'Shared: one value per language across that language’s numbered versions',
 'Versioned: one value per language regardless of numbered version',
 'A standard value: edits to any item version always update all its language versions'
],'Only unversioned combines language-specific values with numbered-version sharing. Defaults do not change storage scope.');
revise('M04',[
 'Set the template’s Standard Values and confirm that the existing item has no explicit override',
 'Set Standard Values and expect them to overwrite all existing explicit item values',
 'Set the value on the template definition item’s display name',
 'Set a rendering parameter and expect it to become the stored field default'
],'Defaults and explicit item overrides are different. Changing a default is not a blanket replacement of every authored value.',{
 prompt:'A default should apply to new items and to existing items that still inherit that field’s default. Which approach fits?'});
revise('M05',[
 'It remains Beach because the token was resolved when the item was created',
 'It becomes Coast because standard-value tokens are re-evaluated on every read',
 'It becomes Coast only after publishing, because tokens are re-evaluated by Edge',
 'It becomes $name because renaming invalidates the prior standard-value substitution'
],'$name substitution happens at creation. A populated Title is not a live expression that tracks subsequent renames.');
