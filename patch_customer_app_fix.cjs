const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = `                  <span className="bg-slate-9          {/* A. Customer Promo Banner Removed */}      <Crown className="w-4 h-4" />
              <span>
                {currentCustomer?.isPremiumCustomer
                  ? 'Manage Gold Membership'
                  : 'Get 1 Month Free Pass (₹1,500)'}
              </span>
            </button>
          </div>`;

const replacement = `                  <span className="bg-slate-900/80 px-2 py-1 rounded-lg font-mono text-[11px] text-slate-300">
                    Aadhaar KYC Verified
                  </span>
                </div>
              </div>
            </div>
          </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log("Replaced successfully");
} else {
  console.log("Could not find target");
}

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
