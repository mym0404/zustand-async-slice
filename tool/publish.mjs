#!/usr/bin/env zx

await $`yarn t`;
const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));

let [a, b, c] = pkg.version.split('.');
c = Number(c) + 1 + '';
const newVersion = `${a}.${b}.${c}`
pkg.version = newVersion;
await fs.writeFile('package.json', JSON.stringify(pkg, null, 2));

const v = pkg.version;

await $`yarn build`;
await $`git add . && git commit -m "chore: publish ${v} [skip ci]"`;
await $`npm publish --access public`;
await $`git tag ${newVersion}`
await $`git push && git push origin ${newVersion}`;
