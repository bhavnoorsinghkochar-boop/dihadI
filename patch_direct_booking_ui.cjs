const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target1 = `              {/* Upfront Prepaid Escrow Breakdown */}
              {currentCustomer.isPremiumCustomer ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-amber-500/10 border-2 border-amber-400 rounded-2xl space-y-2 text-slate-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-300">
                    <span className="text-[11px] font-black text-slate-950 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Dihadi Gold Plan Active (Covered by ₹15,000)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                      ₹0 (Free Service)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 leading-snug">
                    👑 <strong>Unlimited Free Booking:</strong> Worker daily wage of ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)} is covered by your Gold Subscription and will be disbursed directly from Admin Treasury upon confirmation.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl space-y-2 text-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                    <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Upfront Prepaid Escrow (Before Work)</span>
                    </span>
                    <span className="text-xs font-mono font-black text-amber-800">
                      ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    🛡️ <strong>100% Protected:</strong> Employer prepays wage before work starts. Funds remain locked in the Dihadi Escrow Vault and are only released when you confirm satisfactory work completion. <strong>100% refundable upon complaint review if worker is absent.</strong>
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookingWorker(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                {currentCustomer.isPremiumCustomer ? (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Use My Subscription (₹0 Free) & Book</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Prepay ₹{Number(bookingWorker.dailyRate) * (Number(directJobDuration) || 1)} & Book</span>
                  </button>
                )}
              </div>`;

const replacement1 = `              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookingWorker(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Direct Book Worker</span>
                </button>
              </div>`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log("Replaced target1");
} else {
  console.log("Could not find target1");
}

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
