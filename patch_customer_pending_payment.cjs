const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const paymentTarget = '<p className="text-xs text-slate-600 mt-1">The worker entered the OTP. Deposit the daily wage into escrow to officially start the job.</p>';
const paymentReplacement = '<p className="text-xs text-slate-600 mt-1">Please complete the prepaid payment for the job.</p>';

code = code.replace(paymentTarget, paymentReplacement);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
