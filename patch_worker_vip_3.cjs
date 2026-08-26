const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const startStr = `            {/* VIP Zero-Commission Feature Card */}`;
const endStr = `            {/* Financial Overview Cards */}`;

if (code.includes(startStr) && code.includes(endStr)) {
  const startIndex = code.indexOf(startStr);
  const endIndex = code.indexOf(endStr);
  
  if (startIndex < endIndex) {
    const toRemove = code.substring(startIndex, endIndex);
    code = code.replace(toRemove, "");
    console.log("Replaced block");
  }
}

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
