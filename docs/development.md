# Development guide

## Layout

- `src/exam/`: question banks, exam behavior, primer/history features, template, and styles.
- `src/lab/`: the query-building game's HTML, styles, lessons, and browser behavior.
- `scripts/`: build and local static preview server.
- `tests/`: exam state/scoring/history checks, game checks, and HTTP delivery checks.
- `docs/`: contributor and hosting guidance; `docs/images/` contains earlier UI previews.
- `dist/`: generated hosting output, ignored by Git.
- `archive/`: local copies of the original nested game repository and old bundle, ignored by Git.

The root `XM-Cloud-Practice-Exam.html` and `GraphQL-Lab.html` are generated convenience copies. They stay at their existing filenames to preserve local file URLs. Edit `src/`, then build; do not edit those generated copies directly.

## Commands

```sh
npm ci
npm run build
npm test
npm start
```

`npm start` builds and serves the generated website. `npm run preview` serves an existing build. The default preview address is `http://127.0.0.1:3000`; set `PORT` to choose another port. Build and test file paths are resolved from their scripts, so the scripts themselves also work when called by absolute path from another directory.

## Changing exam questions

Teaching examples and assessment questions must be independently authored. Teach the same concepts using different situations and reasoning tasks; do not copy lesson questions into exams. The playground duplication check catches exact query/request copies, but editorial review is still needed for paraphrases. A repeat attempt on the existing finite question bank is not an unseen assessment.

`src/lab/playground.js` contains the local sample data, deliberately limited schema, resolvers and six editable experiments. GraphQL.js validates and executes requests; esbuild bundles it into both the hosted and standalone outputs. Unsupported Sitecore features must be labeled as such, not silently simulated. Playground activity does not change exam or game scores.

`bank.js` contains the original definitions; `advanced-bank.js` preserves the original bank and applies the challenge revision; `exam-bank.js` preserves revision 2, adds the weighted competency questions, and defines the 50-question blueprint. Their load order is deliberate.

Keep old definitions available for saved attempts. New completed attempts snapshot their question definitions, so exact retakes retain their original meaning. When making incompatible changes to questions used by older saved sessions, preserve the prior bank and introduce a new revision rather than silently reinterpreting an answer index.

Weighted mock counts are 6/8/7/7/5/5/5/7; the 36-question GraphQL drill is separate. Run `npm test` after content or behavior changes. The checks cover the distribution, exact-match scoring, history migration, immutable prior answers, retakes, import validation, game lesson scoring, and generated-site delivery.

## Git workflow

The folder already has a Git repository. Reorganization changes paths, so review both staged and unstaged changes before the first commit:

```sh
git status
git add -A
git diff --cached --stat
git commit -m "Organize practice studio as a static web project"
```

The original embedded game repository was moved into ignored `archive/`; its actual source is now under `src/lab/`. Staging all reviewed changes removes the old repository-pointer entry and includes the real game files. Do not add `archive/` or `dist/` with `--force`.

Add your chosen remote after creating the hosted Git repository. No remote, commit, or public deployment is created by these project scripts.

Before making a public repository, choose a license and add a `LICENSE` file. No reuse license has been selected on your behalf. Keep personal quiz-history exports out of commits.
