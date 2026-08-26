const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = `                          <p className="text-[11px] text-slate-700 mt-0.5">
                            Worker wage of ₹{job.workerPayout} will be disbursed directly from Admin Treasury. <strong>₹0 charged to your account.</strong>
                          </p>`;

const replacement = `                          <p className="text-[11px] text-slate-700 mt-0.5">
                            Worker wage of ₹{job.workerPayout} will be disbursed directly from Admin Treasury. <strong>₹0 charged to your account.</strong><br/>
                            <strong className="text-amber-800">The worker has completed the job. Please leave a rating and review for your experience!</strong>
                          </p>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
