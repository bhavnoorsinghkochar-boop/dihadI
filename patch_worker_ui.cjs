const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const startStr = "{/* Step Actions */}";
const endStr = "</div>\n                  </div>\n                ))}\n              </div>\n            )}";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find start or end bounds');
  process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const newMiddle = `                    {/* Step Actions */}
                    <div className="pt-3 border-t border-amber-200/80">
                      {job.status === 'accepted' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for Employer Approval</h4>
                          <p className="text-xs text-amber-800">The employer is reviewing your profile. Please wait for them to approve you before proceeding.</p>
                        </div>
                      ) : job.status === 'pending_payment' ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
                          <h4 className="font-black text-amber-950 text-sm">Waiting for Employer to Post Money</h4>
                          <p className="text-xs text-amber-800">You verified the OTP! The employer now needs to deposit the daily wage into escrow before you can start the job.</p>
                        </div>
                      ) : job.status === 'approved' ? (
                        <div className="space-y-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300/80">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-amber-950 font-black flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-800" />
                                <span>Start-of-Work OTP Verification</span>
                              </span>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Ask the customer at the site for their 4-digit passcode to unlock the work clock.
                              </p>
                            </div>
                            {job.otpCode && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpInput({ ...otpInput, [job.id]: job.otpCode });
                                  playSound('click');
                                }}
                                className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-lg font-bold transition border border-amber-400/50 cursor-pointer"
                                title="Auto-fill OTP for test simulation"
                              >
                                Test Auto-fill (#{job.otpCode})
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Enter 4-digit Start OTP"
                              value={otpInput[job.id] || ''}
                              onChange={(e) => setOtpInput({ ...otpInput, [job.id]: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                              className="bg-white border-2 border-amber-300 rounded-xl px-4 py-2.5 text-base font-mono font-black text-slate-900 flex-1 focus:outline-amber-500 text-center sm:text-left tracking-widest"
                              maxLength={4}
                            />
                            <button
                              type="button"
                              onClick={() => handleOtpSubmit(job.id)}
                              disabled={!(otpInput[job.id] && otpInput[job.id].length === 4)}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Start Work</span>
                            </button>
                          </div>

                          {/* Quick Request Toolbar */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                            <span className="text-[10px] text-amber-900 font-bold uppercase mr-1">Request OTP:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveChatJob(job);
                                setShowChatModal(true);
                                playSound('click');
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-amber-300/80 font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-600" />
                              <span>Ask on Chat</span>
                            </button>
                            <a
                              href={\`https://api.whatsapp.com/send?phone=\${job.customerPhone.replace(/[^0-9]/g, '')}&text=\${encodeURIComponent(\`Hello \${job.customerName}, I have reached the work location for "\${job.title}". Please share the 4-digit start OTP.\`)}\`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              <MessageCircle className="w-3 h-3 text-amber-600" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => startCall(
                                { name: currentWorker.name, role: 'worker', phone: currentWorker.phone },
                                { name: job.customerName, role: 'customer', phone: job.customerPhone },
                                job.title
                              )}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              <Phone className="w-3 h-3 text-amber-600" />
                              <span>Call Employer</span>
                            </button>
                          </div>
                        </div>
                      ) : job.status === 'in_progress' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Mark this job as completed? Customer will be notified to release payment.')) {
                              finishJobByWorker(job.id);
                            }
                          }}
                          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCheck className="w-5 h-5" />
                          <span>Mark Work as Completed</span>
                        </button>
                      ) : (
                        <div className="bg-amber-100 p-3 rounded-2xl text-center text-xs font-bold text-amber-900">
                          Job completed. Pending employer payment and rating.
                        </div>
                      )}
                    </div>
                  `;

const newCode = before + newMiddle + after;
fs.writeFileSync('src/components/worker/WorkerApp.tsx', newCode);
console.log('Worker UI updated!');
