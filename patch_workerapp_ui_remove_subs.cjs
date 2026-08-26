const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target1 = `          {/* Zero Commission VIP Pass Badge / Button */}
          <button
            onClick={() => {
              playSound('click');
              setShowSubscriptionModal(true);
            }}
            className={\`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer \${
              (currentWorker.zeroCommissionJobsRemaining || 0) > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-90 shadow-sm'
            }\`}
            title="Get 6 Jobs with 0% Platform Commission"
          >
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>
              {(currentWorker.zeroCommissionJobsRemaining || 0) > 0
                ? \`\${currentWorker.zeroCommissionJobsRemaining}/6 Zero-Fee\`
                : '0% Fee Pass'}
            </span>
          </button>`;

code = code.replace(target1, "");

const target2 = `            {/* A. 0% Commission VIP Pass Promo */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-5 border-2 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Crown className="w-32 h-32 text-amber-900" transform="rotate(15)" />
              </div>
              
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
            </div>`;

code = code.replace(target2, "");

const target3 = `      {/* 0% Commission VIP Pass Subscription Modal */}
      <WorkerSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        workerId={currentWorker.id}
      />`;

code = code.replace(target3, "");

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
