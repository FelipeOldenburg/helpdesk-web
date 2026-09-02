const fs = require('node:fs');
const path = require('node:path');

const output = path.join(__dirname, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const file of ['index.html', 'app.js', 'styles.css']) fs.copyFileSync(path.join(__dirname, file), path.join(output, file));
fs.writeFileSync(path.join(output, 'config.js'), `window.HELPDESK_API_URL = ${JSON.stringify(process.env.FRONTEND_API_URL || '')};\n`);
