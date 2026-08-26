const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = 'acceptJobByWorker,';
const replacement = 'acceptJobByWorker,\n    approveWorker,\n    rejectWorker,';

code = code.replace(target, replacement);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
