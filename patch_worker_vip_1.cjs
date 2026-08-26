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
                ? \`0% VIP (\${currentWorker.zeroCommissionJobsRemaining} Left)\`
                : '0% Comm. Pass'}
            </span>
          </button>`;

if (code.includes(target1)) {
  code = code.replace(target1, "");
  console.log("Replaced target1");
} else {
  console.log("Could not find target1");
}

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
