# Hosting the practice studio

This is a static website. The quiz and the GraphQL game run in the visitor's browser; there is no database, account system, or required backend service.

## Build and publish

1. Use Node.js 22 or newer on the build machine.
2. Run `npm ci` and `npm run build` from the repository root. The build bundles the GraphQL engine locally; the hosted site needs no Node server or external API.
3. Upload the **contents of `dist/`** to your site's document root, or configure your static hosting service to publish `dist`.

The resulting routes are:

- `/` — Practice Studio, weighted mock, GraphQL primer, quiz history.
- `/lab/` — the GraphQL query-building game, linked from the main page.

For a host with a build configuration, use build command `npm run build` and output directory `dist`. The generated files can also be served by IIS, Nginx, Apache, or another static file server. Node is needed for building, not for serving the generated site.

The site uses relative navigation and can be deployed under a path such as `/training/`: the exam is at `/training/` and the game at `/training/lab/`. Serve directory URLs with their trailing slash so relative assets resolve correctly. No SPA catch-all rewrite is required; unknown files should remain 404 responses.

The included `npm start` command is for a local preview at `http://127.0.0.1:3000`. For production, publish the generated static files using your chosen web host.

## Progress when moving to a URL

Quiz history and game progress are saved per browser origin. Moving from a local file to a web URL, changing the domain, or using another browser starts a separate storage area.

Before moving your existing quiz history, use **Quiz history → Download history backup** in the original page. On the hosted site, choose **Restore backup**. Quiz history is not committed to Git and is not shared with other visitors. The game's existing browser-local progress is separate from quiz history backups.

Documentation links and the game's optional Google Fonts stylesheet need an internet connection. Neither exercise engine sends queries to a real Sitecore environment.

## What to publish

Publish only `dist/`. Source, tests, screenshots, archives, and `.git` do not belong in the web document root. You can distribute the two root HTML files separately if someone prefers a double-click version.
