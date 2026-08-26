const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const startStr = '<span className="text-lg font-black text-slate-900">₹{job.dailyWage}</span>';
const endStr = '{/* Disputed Job Status Banner */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find start or end bounds');
  process.exit(1);
}

const before = code.substring(0, startIndex + startStr.length);
const after = code.substring(endIndex);

const newMiddle = `
                      {job.escrowStatus === 'pending' ? (
                        <span className="text-[10px] text-red-600 font-bold block">Payment Pending</span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold block">100% Escrow Held</span>
                      )}
                      {job.status !== 'paid_and_closed' && job.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Worker did not arrive or wish to cancel? You will receive an immediate 100% refund.')) {
                              refundEscrowToCustomer(job.id);
                            }
                          }}
                          className="mt-1 text-[10px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                        >
                          Worker Absent? Claim Refund
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Worker Assignment Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center">
                        {job.assignedWorkerName ? job.assignedWorkerName.charAt(0) : 'W'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {job.assignedWorkerName || 'Waiting for Nearest Worker to Accept'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {job.assignedWorkerPhone || 'Broadcasting across strict 10km radius...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTop5Shortlist(job)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition border border-amber-200 flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Top-5 Shortlist</span>
                      </button>
                    </div>
                  </div>

                  {/* Start-of-Work OTP Verification Hub or Payment Escrow */}
                  {job.escrowStatus === 'pending' ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Approve & Fund Escrow</h4>
                        <p className="text-xs text-slate-600 mt-1">Worker is waiting for your approval. Deposit the daily wage into escrow to generate the start OTP.</p>
                      </div>
                      <button type="button" onClick={() => setPrepayBooking({ type: 'approve_escrow', jobId: job.id, amount: job.dailyWage * job.durationDays, workerName: job.assignedWorkerName || 'Worker' })} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer">
                        Pay ₹{job.dailyWage * job.durationDays} to Escrow
                      </button>
                    </div>
                  ) : (job.status === 'accepted' || job.status === 'broadcast' || job.status === 'in_progress') ? (
                    <div className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-300/80 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                              Worker Verification Start-Passcode (OTP)
                            </span>
                            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase">
                              {job.status === 'in_progress' ? 'Verified & In-Progress' : 'Ready to Share'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Share this 4-digit code with the worker upon doorstep arrival. The worker enters it to begin the verified work clock.
                          </p>
                        </div>

                        {/* Large High-Contrast 4-Digit Display */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 text-amber-400 px-4 py-2 rounded-xl shadow-md border border-slate-800">
                          {job.otpCode.split('').map((digit, i) => (
                            <span key={i} className="font-mono font-black text-lg tracking-widest px-1">
                              {digit}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Channel 1-Tap OTP Dispatch Controls */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSendOtpEmail(job)}
                          disabled={isDispatchingOtp[job.id]}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                          title="Dispatch OTP confirmation to your registered email"
                        >
                          {isDispatchingOtp[job.id] ? (
                            <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                          ) : dispatchedEmailOtpJobs[job.id] ? (
                            <Check className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>
                            {dispatchedEmailOtpJobs[job.id] ? 'Sent to Email (Gmail)' : 'Send to my Email'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareOtpWhatsApp(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Share OTP directly via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Share on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendOtpSms(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Send OTP via SMS text"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          <span>Send via SMS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatJob(job);
                            setActiveChatTarget(null);
                            setShowChatModal(true);
                            playSound('click');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Open In-App Chat & Send OTP"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat & Share OTP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyOtp(job)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                          title="Copy 4-digit code"
                        >
                          {copiedOtpJobId === job.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Passcode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Raise Complaint Action Banner for Active Jobs */}
                  {(job.status === 'accepted' || job.status === 'in_progress' || job.status === 'broadcast') && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-4">
                      <span className="text-[11px] text-slate-600 font-medium">Worker not arrived or left site?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintJob(job);
                          playSound('click');
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Raise Complaint for Refund</span>
                      </button>
                    </div>
                  )}

                  `;

const newCode = before + newMiddle + after;
fs.writeFileSync('src/components/customer/CustomerApp.tsx', newCode);
console.log('Successfully rewrote the block!');
