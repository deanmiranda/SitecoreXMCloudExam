// Preserve revision 2 for attempts saved before weighted exam mode was added.
const REVISION2_BANK = BANK.map(q=>JSON.parse(JSON.stringify(q)));
const BLUEPRINT = [
 {topic:'Architecture',name:'XM Cloud Architecture and Developer Workflow',count:6},
 {topic:'Deployment',name:'Deployment of XM Cloud Projects',count:8},
 {topic:'Renderings & layouts',name:'Renderings and Layout',count:7},
 {topic:'Serialization',name:'Sitecore Content Serialization',count:7},
 {topic:'APIs & webhooks',name:'Sitecore APIs & Webhooks',count:5},
 {topic:'Pages & authoring',name:'XM Cloud Pages',count:5},
 {topic:'Security',name:'Security for Developers',count:5},
 {topic:'Data modeling',name:'Data Modeling',count:7}
];
add('A05','Architecture','Applied','A site has its own languages, content, and presentation settings but belongs to a broader site collection. Which interpretation best fits this arrangement?',null,
 ['A collection groups related sites; a site remains a distinct configured experience','Every site in a collection must expose identical routes and content','A collection is a substitute for a deployment environment','Each collection must correspond to one public hostname'],0,
 'A collection organizes sites. It is a different concept from an environment, hostname, or shared route structure.','overview,modeling');
add('A06','Architecture','Applied','A developer chooses Sitecore-first development for a new component. Which sequence best describes that choice?',null,
 ['Define the Sitecore content and presentation contract, then implement the front end against it','Create a disconnected manifest and import it as the only possible first step','Publish a front-end bundle to Edge, then generate templates from that bundle','Build every page as static HTML before defining component content'],0,
 'Sitecore-first starts with the CMS model and presentation definitions. The application implements that contract; a disconnected code-first manifest is a different workflow.','modeling');
add('D06','Deployment','Applied','An environment deployment succeeds, but the public site still executes the previous component implementation. Which check most directly separates the deployment responsibilities?',null,
 ['Verify that the public rendering application was built and released from the intended commit','Republish every item because content publication replaces JavaScript bundles','Pull serialized templates locally because that updates the public host','Rotate the Preview key because it controls which JavaScript bundle is served'],0,
 'The CM release and the public application release are separate concerns. Confirm the actual host and commit serving the public application.','hosts,deploy');
add('D07','Deployment','Applied','An automated release must apply a new rendering definition before content that references it becomes available. What should the release design account for?',null,
 ['The structural item synchronization and its ordering relative to dependent operations','Only the public site build, since it reconstructs rendering definitions on first use','Only publishing, since rendering definition items do not belong in source control','The local developer database, since deployed environments share its item storage'],0,
 'Code and structural items need a coordinated release. Include the required serialized definitions and verify when they are applied.','scs,build');
add('D08','Deployment','Applied','A local front end can retrieve published content but authors cannot use it for visual editing. Which conclusion is sound?',null,
 ['Delivery access proves content retrieval; the editing integration still needs separate setup and validation','A successful Delivery query proves the editing host is configured correctly','The solution must use a different template for every editing session','Production must switch to the local host before editing can be tested'],0,
 'Reading published content does not exercise the authoring-to-editing-host integration. Validate that path independently.','hosts');
add('L06','Renderings & layouts','Applied','Authors should choose data sources only from a particular area and based on a particular content template. Which rendering-definition settings address this?',null,
 ['Data-source location and data-source template','Allowed controls and the placeholder key only','Compatible renderings and the page-design name only','The public hostname and default language'],0,
 'These settings constrain the content selection for a rendering. Placeholder restrictions constrain component placement, a separate task.','modeling,placeholders');
add('L07','Renderings & layouts','Applied','A component works with one data source but should offer two supported visual variants without duplicating the content. What must the front-end implementation do?',null,
 ['Recognize and implement the selected variant while consuming the same content contract','Assume creating a variant item also creates its front-end markup','Use a different item ID for each variant even when content is identical','Replace the data template with a page design for each variant'],0,
 'A presentation choice requires matching application behavior. A CMS configuration item alone does not implement new front-end markup.','modeling,pages');
add('S06','Serialization','Challenge','A module has an ItemAndDescendants include and a rule excluding a demo subtree. What should you verify before assuming a missing demo item will be recreated by push?',null,
 ['The effective inclusion rules; an excluded subtree is not synchronized by that include','Only the file extension, because every YAML file is always pushed','Only the target database, because rules affect pull but never push','The GraphQL type name, because projection overrides serialization rules'],0,
 'Selection rules control the synchronization scope. Inspect the effective path decision rather than assuming any local YAML file will be applied.','scope,cli');
add('S07','Serialization','Applied','A teammate changed templates in CM but committed only application files. What is the most useful addition to that change before another developer reproduces it?',null,
 ['Pull the in-scope template items and commit their serialized definitions with the code','Publish the templates and assume that stores their definitions in Git','Push the unchanged local files to overwrite CM before reading its changes','Commit only the rendered page HTML as a representation of the template'],0,
 'Pull captures the CMS-side definitions on disk; source control then carries both the implementation and its structural dependency.','scs,cli');
add('I05','APIs & webhooks','Challenge','A component needs page layout for /offers on travel in English. Which request selects the layout data instead of looking up a CMS item-tree path?',
 'A: layout(site: "travel", routePath: "/offers", language: "en") { item { rendered } }\nB: item(path: "/offers", language: "en") { name }\nC: search(where: { name: "_name", value: "offers", operator: EQ }) { results { name } }\nD: item(path: "/sitecore/content/Acme/Travel/Home/Offers", language: "en") { id }',
 ['A, because the site and route identify the page whose layout is requested','B, because every public route is also an absolute CMS item path','C, because finding an item name automatically selects its layout','D, because selecting an item ID automatically returns rendered layout'],0,
 'The layout entry point uses site, route path, and language. The other selections do not request layout JSON.','hd');
add('P05','Pages & authoring','Applied','A page uses a shared header partial design. An author wants to change only this page’s body content. Which action best preserves the intended reuse?',null,
 ['Edit the page-specific content or data source rather than the shared header design','Duplicate every partial design in the site before editing the body','Change the shared header source and expect it to affect only this page','Remove the page design so the body becomes independent of all templates'],0,
 'Identify what is shared and what is page-specific before editing. Updating shared presentation or content may affect multiple usages.','pages,modeling');
add('U05','Security','Applied','A user belongs to several roles. A role change appears correct, but the user still cannot perform the required item operation. What is the best verification?',null,
 ['Inspect the user’s effective access on the actual item, including other memberships and inheritance','Inspect only the most recently assigned role and ignore other memberships','Assume the public Delivery token controls the user’s Content Editor rights','Change the item display name to remove inherited security restrictions'],0,
 'Effective access depends on the applicable permissions, memberships, and inheritance. A single role viewed in isolation may not explain the result.','rights,security');
add('M06','Data modeling','Applied','Authors need to create a predefined group of items with initial values in one operation. The group should be copied at creation, rather than remain a live shared structure. Which mechanism fits?',null,
 ['A branch template','A base data template alone','A shared component data-source reference','A partial design alone'],0,
 'A branch template provides an item structure for creation. Template inheritance defines fields; shared references and partial designs express other kinds of reuse.','templates');
add('M07','Data modeling','Challenge','An item overrides a field that otherwise inherits a template standard value. The author wants to restore inheritance of that default. Which action expresses that intent?',null,
 ['Reset the field to its standard value rather than keep an explicit item override','Copy the current default text into the field and assume future default changes will flow through','Rename the field so its stored value is ignored','Mark the field Shared so the default becomes its only possible value'],0,
 'Restoring standard-value inheritance differs from explicitly storing identical text. An explicit copied value can remain an override when the default changes later.','standard,fields');
