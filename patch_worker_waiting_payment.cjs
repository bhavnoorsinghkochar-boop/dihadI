const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target = `Waiting for Employer to Post Money`;
const replacement = `Waiting for customer payment...`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
