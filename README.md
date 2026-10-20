# XM Cloud Developer Practice Studio

Open **XM-Cloud-Practice-Exam.html** in Edge, Chrome, or Firefox. The entire exam is inside that single file; it does not need installation, a server, or an internet connection. Documentation links need internet access.

- The default **weighted mock** contains 50 questions, following the supplied screenshot: architecture 6, deployment 8, renderings/layouts 7, serialization 7, APIs/webhooks 5, Pages 5, security 5, data modeling 7. Its default timer is 100 minutes; you can choose untimed practice.
- The separate **GraphQL drill** contains 36 questions. The entire learning bank contains 86 questions. GraphQL is not an extra weighted competency in the mock.
- **GraphQL primer** in the header provides line-by-line query explanations, a worked response, types/defaults/fragments/directives, filtering/pagination, troubleshooting, a searchable glossary, and six ungraded self-checks. You can open it from inside a quiz and resume; an active timer continues.
- Select all topics, GraphQL, foundations, or one individual topic.
- Choose the entire selected bank or a random subset of up to 10, 20, or 50 questions.
- Select an answer and click **Check answer** to reveal the correct answer, explanation, and reference.
- Final results include a percentage, topic breakdown, and full answer review.
- Retake the same questions with shuffled order, or drill only missed/unanswered questions. Full attempts snapshot their question definitions, so later edits cannot reinterpret their answers.
- The question grid shows green ✓ for correct, red × for incorrect, and white for unanswered. Gold dots mark flagged questions.
- New sessions use the revised challenge bank with closer distractors and scenario-based reasoning. Saved original attempts retain their original questions and answers; an exact retake uses those saved definitions.
- Optional time limits continue while the page is closed. Retake buttons start untimed sessions; choose a new session to configure a new timer.
- **Quiz history** retains completed attempts with selected choices, correct choices, explanations, and code. Review all answers or just missed/unanswered questions, retake an old quiz, and compare scores on the same question set. Weighted mocks also have a chronological score trend.
- There is no ten-attempt cutoff for new history. Records remain subject to the browser's storage capacity. Use **Download history backup** and **Restore backup** to keep a portable copy. Older score summaries remain, but their missing answer details cannot be reconstructed. A completed attempt still in the current saved slot is upgraded to a full record.
- Progress and history are stored in the current browser when local storage is available. Different browsers, copies of the file, or file-versus-preview URLs may have separate storage. Clearing browser storage removes progress. If storage is blocked or full, the exam displays a warning and remains usable for the session.
- **Download results** saves a JSON report containing answers, explanations, and references.

This is independent practice material, not official exam content or a confirmed current certification blueprint. The 80% target is a practice setting. The provided 2023 community guide informed coverage; technical explanations link to Sitecore and GraphQL documentation. Newer Sitecore documentation uses SitecoreAI terminology. Example IDs, paths, site names, and template names must be replaced for a real environment.

## Source files

The HTML file is all you need to take the exam. The other files are included for maintenance:

- `bank.js`: questions and source links.
- `advanced-bank.js`: revised questions; the original bank is retained for saved-attempt compatibility.
- `exam-bank.js`: additional competency questions and the supplied weighted blueprint.
- `app.js`: exam behavior.
- `study-features.js`: primer, full attempt archive, history review, exact retakes, comparison, backup/restore.
- `study-styles.css`: styles embedded into the finished HTML during the build.
- `exam-template.html`: layout and styling.
- `build.js`: embeds everything into the standalone HTML.
- `verify.js`: scoring, state, and question-bank checks.

To regenerate after editing: `node build.js`

To run checks: `node verify.js`
