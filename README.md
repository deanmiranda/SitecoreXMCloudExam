# XM Cloud Practice Studio

An independent study website for Sitecore XM Cloud developers, combining a weighted practice exam, a GraphQL primer, quiz history, and a query-building game.

## Run locally

Install Node.js 22 or newer, then run these commands from the project folder:

```sh
npm ci
npm start
```

Open **http://127.0.0.1:3000**. On the main page, choose **GraphQL game — additional query practice** to open the hands-on query builder at `/lab/`.

`npm ci` installs the pinned GraphQL engine and esbuild browser bundler. `npm start` builds the site before starting the local preview server. The built site runs offline without a CDN or API connection.

For a double-click version, open [XM-Cloud-Practice-Exam.html](XM-Cloud-Practice-Exam.html). Its game link opens [GraphQL-Lab.html](GraphQL-Lab.html). Both are generated convenience copies; edit the source files rather than these HTML copies.

## Project layout

```text
src/
  exam/                 Question banks, exam, primer, history, styles
  lab/                  GraphQL query-building game and lessons
scripts/
  build.cjs             Builds the site and standalone copies
  serve.cjs             Serves only the generated website
tests/                  Exam, game, and HTTP checks
docs/
  development.md        Source and Git workflow
  hosting.md            Publish at a URL
  user-guide.md         Practice modes and saved progress
  images/               UI previews
dist/                   Generated website (ignored by Git)
archive/                Original local artifacts (ignored by Git)
package.json            Build, test, and preview commands
package-lock.json       Reproducible package metadata
```

## Build, test, and deploy

```sh
npm run build
npm test
```

Publish the **contents of `dist/`** to a static web host:

- `dist/index.html` → the main practice site.
- `dist/lab/` → the GraphQL game and its assets.

A host with build settings should use `npm run build` and publish directory `dist`. The hosted page needs no Node process or database. See [hosting instructions](docs/hosting.md) for URL paths and progress migration.

## GraphQL Playground:

<img width="3842" height="6419" alt="GraphQlPlayGround" src="https://github.com/user-attachments/assets/a6625d29-7569-4e2e-8728-bd57c74d6ea8" />

## Sitecore Exam Practice:

<img width="3842" height="3986" alt="SiteCoreExamPractice" src="https://github.com/user-attachments/assets/607334d0-2a12-4d4e-a09e-f15a57b3dbba" />

## Study features

- **Weighted mock:** 50 questions with the supplied competency split of **6 / 8 / 7 / 7 / 5 / 5 / 5 / 7**; default 100-minute timer, optional untimed mode.
- **GraphQL drill:** 36 additional interpretation questions, separate from the exam weights.
- **Primer:** explained query anatomy, worked responses, searchable terminology, and self-checks.
- **Quiz history:** full answer reviews, exact retakes, missed-question practice, score comparisons, and JSON backup/restore.
- **GraphQL game:** 18 hands-on query-building challenges, linked from the main page.

Progress is saved in each visitor's browser, not on a shared server. Moving from a local file to a hosted URL creates a different storage area; export quiz history from the old page and restore it on the new URL. Game progress has its own local storage. See the [user guide](docs/user-guide.md).

## Contribute and share

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Git workflow](docs/development.md#git-workflow). The existing Git repository has been preserved. The original nested game repository is retained locally under ignored `archive/`; the shareable source is included directly in `src/lab/`.

This project uses original study material and is not an official certification exam or a guarantee of exam performance. Competency weights follow the supplied study screenshot. Documentation links and optional game fonts require internet access.
