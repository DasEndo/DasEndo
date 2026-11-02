// Generates this profile's artwork only. Run: node tools/build-menu.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const check = process.argv.includes('--check');
const root = new URL('../', import.meta.url);
const assets = new URL('../assets/', import.meta.url);
if (!check) await mkdir(assets, { recursive: true });
const generated = new Map();

const artwork = `
<defs>
  <radialGradient id="haze" cx="80%" cy="30%" r="80%">
    <stop stop-color="#191919"/><stop offset="1" stop-color="#080808"/>
  </radialGradient>
</defs>
<rect width="1600" height="1000" fill="url(#haze)"/>
<g font-family="Segoe UI, Arial, sans-serif">
  <text x="138" y="127" font-size="17" letter-spacing="5" fill="#949494">DASENDO</text>
  <text x="128" y="331" font-size="148" font-weight="300" letter-spacing="-7" fill="#e5e5e5">Endo<tspan fill="#747474">.</tspan></text>
  <text x="138" y="386" font-size="26" fill="#949494">Game development &amp; personal projects.</text>
  <g fill="#b0b0b0" font-size="35" font-weight="300" letter-spacing=".6">
    <text x="173" y="523">About me</text>
    <text x="173" y="623">Toolbox</text>
    <text x="173" y="723">Say hello</text>
  </g>
  <text x="138" y="885" fill="#949494" font-size="19">Germany</text>
</g>
<g fill="none" stroke="#777" stroke-width="2"><path d="M139 505l8 8-8 8M139 605l8 8-8 8M139 705l8 8-8 8"/></g>
`;

function svg(title, width, height, viewBox) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" role="img"><title>${title}</title>${artwork}</svg>\n`;
}
const slices = [
  ['header', 0, 454],
  ['about', 454, 100],
  ['toolbox', 554, 100],
  ['connect', 654, 100],
  ['footer', 754, 246],
];
for (const [name, y, height] of slices) {
  generated.set(`menu-${name}.svg`, svg(`Endo — ${name}`, 960, height * .6, `0 ${y} 1600 ${height}`));
  generated.set(`menu-${name}-mobile.svg`, svg(`Endo — ${name}`, 480, height * .6, `0 ${y} 800 ${height}`));
}
for (const [name, content] of generated) {
  const file = new URL(name, assets);
  if (check) {
    if (await readFile(file, 'utf8') !== content) throw new Error(`Outdated artwork: ${name}. Run node tools/build-menu.mjs.`);
  } else {
    await writeFile(file, content);
  }
}
if (check) {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const references = new Set([...readme.matchAll(/\b(?:src|srcset)="([^"]+)"/g)].map(match => match[1]));
  for (const name of generated.keys()) {
    if (!references.has(`assets/${name}`)) throw new Error(`Unused menu artwork: ${name}`);
  }
  for (const reference of references) {
    if (/^https?:\/\//.test(reference)) continue;
    const file = new URL(reference, root);
    if (!file.href.startsWith(root.href)) throw new Error(`Image outside this repository: ${reference}`);
    await readFile(file);
  }
}
console.log(check ? 'Profile artwork is reproducible and README image references resolve.' : 'Generated grayscale profile menu slices.');
