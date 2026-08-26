const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target1 = `                  {job.status === 'completed_pending_payment' && (
                    currentCustomer?.isPremiumCustomer ? (
                      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/10 p-4 rounded-2xl border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                            <h5 className="text-xs font-black text-slate-950">Work Completed • Covered by Gold Membership</h5>
                          </div>
                          <p className="text-[11px] text-slate-700 mt-0.5">
                            Worker wage of ₹{job.workerPayout} will be disbursed directly from Admin Treasury. <strong>₹0 charged to your account.</strong><br/>
                            <strong className="text-amber-800">The worker has completed the job. Please leave a rating and review for your experience!</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              releasePaymentByCustomer(job.id);
                              setRatingJob(job);
                            }}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                          >
                            <Star className="w-4 h-4" />
                            Rate & Finalize
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <h5 className="text-xs font-black text-slate-900">Work Completed • Payment Due</h5>
                          <p className="text-[11px] text-slate-600 mt-0.5">The worker has finished the job. Release the final wage (₹{job.workerPayout}) to finalize.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => {
                            if (job.isEscrowPrepaid) {
                              releasePaymentByCustomer(job.id);
                              setRatingJob(job);
                            } else {
                              setRatingJob(job);
                            }
                          }} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                            Release Escrow & Rate
                          </button>
                        </div>
                      </div>
                    )
                  )}`;

const replacement1 = `                  {job.status === 'completed_pending_payment' && (
                      <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <h5 className="text-xs font-black text-slate-900">Work Completed • Payment Due</h5>
                          <p className="text-[11px] text-slate-600 mt-0.5">The worker has finished the job. Release the final wage (₹{job.workerPayout}) to finalize.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => {
                            if (job.isEscrowPrepaid) {
                              releasePaymentByCustomer(job.id);
                              setRatingJob(job);
                            } else {
                              setRatingJob(job);
                            }
                          }} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                            Release Escrow & Rate
                          </button>
                        </div>
                      </div>
                  )}`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log("Replaced target1 successfully!");
} else {
  console.log("Could not find target1");
}

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
