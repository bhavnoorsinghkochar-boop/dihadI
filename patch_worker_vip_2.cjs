const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target2 = `            {/* VIP Zero-Commission Feature Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                    <Crown className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-full">
                        Worker VIP Subscription
                      </span>
                      {(currentWorker.zeroCommissionJobsRemaining || 0) > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full">
                          Active Pass
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      0% Commission VIP Pass (₹2,000)
                    </h3>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Get <strong>6 jobs with 0% platform commission</strong> (keep 100% of employer wage). The ₹2,000 fee can be <strong>directly deducted from your wallet balance</strong>!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">VIP Status:</span>
                    <span className="text-sm font-black text-slate-900">
                      {(currentWorker.zeroCommissionJobsRemaining || 0) > 0
                        ? \`🌟 \${currentWorker.zeroCommissionJobsRemaining} of 6 Jobs Remaining\`
                        : 'Not Active'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playSound('click');
                      setShowSubscriptionModal(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {(currentWorker.zeroCommissionJobsRemaining || 0) > 0
                        ? 'Manage / Top-up VIP Pass'
                        : 'Activate Pass (Pay ₹2,000)'}
                    </span>
                  </button>
                </div>
              </div>
              {(currentWorker.commissionSavedTotal || 0) > 0 && (
                <div className="mt-4 pt-3 border-t border-amber-300/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total Platform Fees Saved:</span>
                  <span className="font-black text-amber-700 font-mono">
                    🎉 ₹{currentWorker.commissionSavedTotal} Saved in Platform Fees
                  </span>
                </div>
              )}
            </div>`;

if (code.includes(target2)) {
  code = code.replace(target2, "");
  console.log("Replaced target2");
} else {
  console.log("Could not find target2");
}

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
