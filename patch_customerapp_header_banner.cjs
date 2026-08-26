const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target1 = `          <button
            onClick={() => {
              playSound('click');
              setShowCustomerSubscriptionModal(true);
            }}
            className={\`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer \${
              currentCustomer?.isPremiumCustomer
                ? 'bg-amber-500/20 text-amber-800 border border-amber-400 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-90'
            }\`}
            title="Dihadi Gold: 1 Month Free Service"
          >
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentCustomer?.isPremiumCustomer
                ? 'Gold Member (1 Mo Free)'
                : 'Dihadi Gold (1 Mo Free)'}
            </span>
          </button>`;

code = code.replace(target1, "");

const target2 = `          {/* A. Customer Promo Banner (As shown in screenshot) */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Crown className="w-32 h-32 text-amber-900" transform="rotate(15)" />
            </div>
            
            <div className="flex gap-4 items-start relative z-10 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs border border-amber-300">
                <Crown className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-2.5 py-0.5 rounded-full">
                    Customer Gold Pass
                  </span>
                  {currentCustomer?.isPremiumCustomer && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-700 text-white px-2 py-0.5 rounded-full">
                      Active: 1 Month Free Service
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Dihadi Gold: Get 1 Month 100% Free Service & ₹0 Booking Fees
                </h3>
                <p className="text-xs text-slate-600">
                  Plan fee: <strong>₹1,500</strong> for 30 days of unlimited 0% platform surcharge bookings, priority radar dispatch & free KYC dossiers!
                </p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                playSound('click');
                setShowCustomerSubscriptionModal(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>
                {currentCustomer?.isPremiumCustomer
                  ? 'Manage Gold Membership'
                  : 'Get 1 Month Free Pass (₹1,500)'}
              </span>
            </button>
          </div>`;

code = code.replace(target2, "");

const target3 = `                  {job.status === 'completed_pending_payment' && (
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
                        <button type="button" onClick={() => setRatingJob(job)} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5">
                          <Star className="w-4 h-4" />
                          Rate & Finalize
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <h5 className="text-xs font-black text-slate-900">Work Completed • Payment Due</h5>
                          <p className="text-[11px] text-slate-600 mt-0.5">The worker has finished the job. Release the final wage (₹{job.workerPayout}) to finalize.</p>
                        </div>
                        <button type="button" onClick={() => setRatingJob(job)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Release ₹{job.workerPayout}
                        </button>
                      </div>
                    )
                  )}`;

const replacement3 = `                  {job.status === 'completed_pending_payment' && (
                      <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div>
                          <h5 className="text-xs font-black text-slate-900">Work Completed • Payment Due</h5>
                          <p className="text-[11px] text-slate-600 mt-0.5">The worker has finished the job. Release the final wage (₹{job.workerPayout}) to finalize.</p>
                        </div>
                        <button type="button" onClick={() => setRatingJob(job)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Release ₹{job.workerPayout}
                        </button>
                      </div>
                  )}`;

if (code.includes(target3)) {
  code = code.replace(target3, replacement3);
  console.log("Replaced target3");
} else {
  console.log("Could not find target3");
}

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
