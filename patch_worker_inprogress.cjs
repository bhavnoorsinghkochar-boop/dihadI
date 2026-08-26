const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target1 = `                      ) : job.status === 'in_progress' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Mark this job as completed? Customer will be notified to release payment.')) {
                              finishJobByWorker(job.id);
                            }
                          }}
                          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCheck className="w-5 h-5" />
                          <span>Mark Work as Completed</span>
                        </button>`;

const replacement1 = `                      ) : job.status === 'in_progress' ? (
                        <div className="space-y-3">
                          <div className="bg-amber-100 p-3 rounded-xl border border-amber-300 text-center text-xs font-black text-amber-950 uppercase tracking-wide">
                            Job Started
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Mark this job as finished? Customer will be notified to release payment.')) {
                                finishJobByWorker(job.id);
                              }
                            }}
                            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCheck className="w-5 h-5" />
                            <span>Mark Job Finished</span>
                          </button>
                        </div>`;

code = code.replace(target1, replacement1);

const target2 = `                      ) : job.status === 'in_progress' ? (
                        <button
                          onClick={() => {
                            completeJobByWorker(job.id);
                            playSound('success');
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Job Finished (Request Payment Release)</span>
                        </button>`;

const replacement2 = `                      ) : job.status === 'in_progress' ? (
                        <div className="space-y-3">
                          <div className="bg-amber-100 p-3 rounded-xl border border-amber-300 text-center text-xs font-black text-amber-950 uppercase tracking-wide">
                            Job Started
                          </div>
                          <button
                            onClick={() => {
                              completeJobByWorker(job.id);
                              playSound('success');
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark Job Finished</span>
                          </button>
                        </div>`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
