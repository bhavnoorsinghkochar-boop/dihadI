const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target1 = `                    <div className="pt-3 border-t border-amber-200/80">
                      {job.status === 'accepted' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for Employer Approval</h4>
                          <p className="text-xs text-amber-800">The employer is reviewing your profile. Please wait for them to approve you before proceeding.</p>
                        </div>
                      ) : job.status === 'pending_payment' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for customer payment...</h4>
                          <p className="text-xs text-amber-800">You verified the OTP! The employer now needs to deposit the daily wage into escrow before you can start the job.</p>
                        </div>
                      ) : job.status === 'approved' ? (`;

const replacement1 = `                    <div className="pt-3 border-t border-amber-200/80">
                      {job.status === 'accepted' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for Employer to Approve & Pay</h4>
                          <p className="text-xs text-amber-800">The customer must complete the prepaid payment to approve you. Once paid, your Start OTP will be sent to the chat.</p>
                        </div>
                      ) : job.status === 'approved' ? (`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log("Replaced target1");
}

const target2 = `                    {/* Step Actions */}
                    <div className="pt-3 border-t border-amber-200/80">
                      {job.status === 'accepted' && job.escrowStatus === 'pending' ? (<div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2"><Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" /><h4 className="font-black text-amber-950 text-sm">Waiting for customer payment...</h4><p className="text-xs text-amber-800">The employer is reviewing your profile and needs to deposit the daily wage into escrow before you can start the job.</p></div>) : job.status === 'accepted' ? (
                        <div className="space-y-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300/80">`;

const replacement2 = `                    {/* Step Actions */}
                    <div className="pt-3 border-t border-amber-200/80">
                      {job.status === 'accepted' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for Employer to Approve & Pay</h4>
                          <p className="text-xs text-amber-800">The customer must complete the prepaid payment to approve you. Once paid, your Start OTP will be sent to the chat.</p>
                        </div>
                      ) : job.status === 'approved' ? (
                        <div className="space-y-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300/80">`;

if (code.includes(target2)) {
  code = code.replace(target2, replacement2);
  console.log("Replaced target2");
}

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
