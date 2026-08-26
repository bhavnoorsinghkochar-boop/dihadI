const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = `                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-black text-amber-950">Work Completed Successfully!</h5>
                          <p className="text-[11px] text-amber-800">Worker has requested wage release of ₹{job.workerPayout}.</p>
                        </div>
                        <div className="flex items-center gap-2">`;

const replacement = `                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-black text-amber-950">Work Completed Successfully!</h5>
                          <p className="text-[11px] text-amber-800 font-bold mt-1">The worker has completed the job. Please leave a rating and review for your experience!</p>
                        </div>
                        <div className="flex items-center gap-2">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
