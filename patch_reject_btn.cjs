const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = `<button type="button" onClick={() => approveWorker(job.id)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                        Approve Worker
                      </button>`;

const replacement = `<div className="flex gap-2">
                        <button type="button" onClick={() => rejectWorker(job.id)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Reject
                        </button>
                        <button type="button" onClick={() => approveWorker(job.id)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Approve Worker
                        </button>
                      </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
