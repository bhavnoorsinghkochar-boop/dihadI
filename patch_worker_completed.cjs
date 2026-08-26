const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target = `                        <div className="bg-amber-100 p-3 rounded-2xl text-center text-xs font-bold text-amber-900">
                          Job completed. Pending employer payment and rating.
                        </div>`;

const replacement = `                        <div className="bg-amber-100 p-3 rounded-2xl text-center space-y-1">
                          <div className="text-xs font-black text-amber-950 uppercase tracking-wide">Work Completed!</div>
                          <div className="text-[11px] font-medium text-amber-900">You have completed the job. The customer has been prompted to leave a rating and review for your experience!</div>
                        </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
