const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target = `<button
                          onClick={() => {
                            acceptJobByWorker(job.id);
                            setActiveTab('active_work');
                            playSound('success');
                          }}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{getT(currentLanguage, 'worker_accept')}</span>
                        </button>`;

const replacement = `<button
                          onClick={() => {
                            setDeclinedJobIds(prev => new Set(prev).add(job.id));
                            playSound('click');
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                          title="Decline Job"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => {
                            acceptJobByWorker(job.id);
                            setActiveTab('active_work');
                            playSound('success');
                          }}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{getT(currentLanguage, 'worker_accept')}</span>
                        </button>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
