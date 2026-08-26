const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const targetStr = `                  {job.status === 'accepted' ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Worker Assigned</h4>
                        <p className="text-xs text-slate-600 mt-1">Review the assigned worker and approve them to share the Start OTP.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => rejectWorker(job.id)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Reject
                        </button>
                        <button type="button" onClick={() => approveWorker(job.id)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Approve Worker
                        </button>
                      </div>
                    </div>
                  ) : job.status === 'pending_payment' ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> OTP Verified!</h4>
                        <p className="text-xs text-slate-600 mt-1">Please complete the prepaid payment for the job.</p>
                      </div>
                      <button type="button" onClick={() => setPrepayBooking({ type: 'approve_escrow', jobId: job.id, amount: job.dailyWage * job.durationDays, workerName: job.assignedWorkerName || 'Worker' })} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                        Pay ₹{job.dailyWage * job.durationDays} to Escrow
                      </button>
                    </div>
                  ) : (job.status === 'approved' || job.status === 'broadcast' || job.status === 'in_progress') ? (`;

const replacementStr = `                  {job.status === 'accepted' ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Worker Assigned</h4>
                        <p className="text-xs text-slate-600 mt-1">Please pay the prepaid amount into escrow to approve this worker and release the start OTP.</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => rejectWorker(job.id)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Reject
                        </button>
                        <button type="button" onClick={() => setPrepayBooking({ type: 'approve_escrow', jobId: job.id, amount: job.dailyWage * job.durationDays, workerName: job.assignedWorkerName || 'Worker' })} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                          Pay ₹{job.dailyWage * job.durationDays} to Approve
                        </button>
                      </div>
                    </div>
                  ) : (job.status === 'approved' || job.status === 'broadcast' || job.status === 'in_progress') ? (`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
  console.log('CustomerApp patched successfully.');
} else {
  console.log('Could not find target string in CustomerApp.tsx');
}
