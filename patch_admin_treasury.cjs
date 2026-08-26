const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

const target1 = `            {/* Treasury Highlight Banner */}
            <div className="bg-linear-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      Admin Subscription & Auto-Payout Treasury
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Customer ₹15,000 Gold Memberships & Worker VIP subscriptions flow into Admin Account.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mechanism Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Customer ₹15,000 Inflow</span>
                  </div>
                  <p className="text-slate-300">
                    Customers pay ₹15,000 for Gold Membership (1 month free service & zero commission). 100% of this money is received in the Admin Account.
                  </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Automatic Worker Payouts</span>
                  </div>
                  <p className="text-slate-300">
                    When a Gold Customer hires a worker, the Admin Treasury automatically sends the worker's daily wage directly into their digital wallet.
                  </p>
                </div>
              </div>
            </div>`;

const replacement1 = `            {/* Treasury Highlight Banner */}
            <div className="bg-linear-to-r from-amber-500/10 via-slate-800 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      Admin Master Escrow Treasury
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      All prepaid wages flow into escrow before disbursement. Platform commissions are retained here.
                    </p>
                  </div>
                </div>
              </div>
            </div>`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log("Replaced target1");
}

fs.writeFileSync('src/components/admin/AdminDashboard.tsx', code);
