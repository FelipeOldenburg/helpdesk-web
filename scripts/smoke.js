const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('app.js', 'utf8');
assert.doesNotMatch(source, /\|\| window\.location\.origin/);
assert.match(source, /Informe a URL publica da API/);
assert.match(source, /Informe uma URL publica valida para a API/);
console.log('smoke ok');
