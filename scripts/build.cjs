const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const examSource = file => read(`src/exam/${file}`);
const output = path.join(root, 'dist');
fs.mkdirSync(path.join(output, 'lab'), { recursive: true });
require('esbuild').buildSync({entryPoints:[path.join(root,'src/lab/playground.js')],bundle:true,format:'iife',platform:'browser',minify:true,legalComments:'inline',outfile:path.join(output,'lab/playground.js')});
const template = examSource('exam-template.html').replace('</style>', `${examSource('study-styles.css')}\n</style>`);
const bank = ['bank.js', 'advanced-bank.js', 'exam-bank.js'].map(examSource).join('\n');
const app = ['app.js', 'study-features.js'].map(examSource).join('\n');
for (const [name, code] of [['bank', bank], ['app', app]]) {
  if (/<\/script/i.test(code)) throw new Error(`Unexpected closing script tag in ${name}`);
  new Function(code);
}
const exam = template.replace('/* BANK_PLACEHOLDER */', () => bank).replace('/* APP_PLACEHOLDER */', () => app);
const addLabLink = (html, href) => html.replaceAll('__LAB_URL__', href).replace('<div class="toplinks">', `<div class="toplinks"><a class="textbtn" href="${href}">GraphQL game</a>`);
fs.writeFileSync(path.join(output, 'index.html'), addLabLink(exam, './lab/'));
// Keep the original file URLs and their browser-local progress usable.
fs.writeFileSync(path.join(root, 'XM-Cloud-Practice-Exam.html'), addLabLink(exam, './GraphQL-Lab.html'));
for (const file of ['index.html', 'style.css', 'lessons.js', 'app.js']) {
  fs.copyFileSync(path.join(root, 'src', 'lab', file), path.join(output, 'lab', file));
}
const lab = read('src/lab/index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${read('src/lab/style.css')}</style>`)
  .replace('<script src="lessons.js"></script>', () => `<script>${read('src/lab/lessons.js')}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>${read('src/lab/app.js')}</script>`);
const standaloneLab=lab.replace('<script src="playground.js"></script>',()=>`<script>${read('dist/lab/playground.js').replace(/<\/script/gi,'<\\/script')}</script>`);
if (/<script[^>]+src=/.test(standaloneLab)) throw new Error('Lab standalone build still has external scripts.');
fs.writeFileSync(path.join(root, 'GraphQL-Lab.html'), standaloneLab);
console.log('Built dist/index.html and dist/lab/ for hosting.');
console.log('Updated the two root HTML files for double-click use.');
