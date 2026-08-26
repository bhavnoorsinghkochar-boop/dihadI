const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `  const approveAndFundEscrow = (jobId: string) => {
    let jobOtp = '';
    let customerId = '';
    let workerId = '';
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        jobOtp = job.otpCode || '';
        customerId = job.customerId;
        workerId = job.assignedWorkerId || '';
        const updated = {
          ...job,
          status: 'approved' as const,
          isEscrowPrepaid: true,
          escrowStatus: "held_in_escrow" as const,
          escrowPrepaidAt: new Date().toISOString()
        };
        syncJobToFirestore(updated);
        
        // Dispatch OTP now that worker is approved
        setTimeout(() => dispatchJobStartOtp(updated), 500);
        return updated;
      }
      return job;
    }));
        
    // Auto-inject OTP into in-app chat`;

const replacement = `  const approveAndFundEscrow = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    let jobOtp = job.otpCode || '';
    let customerId = job.customerId;
    let workerId = job.assignedWorkerId || '';
    
    const updated = {
      ...job,
      status: 'approved' as const,
      isEscrowPrepaid: true,
      escrowStatus: "held_in_escrow" as const,
      escrowPrepaidAt: new Date().toISOString()
    };
    
    setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
    syncJobToFirestore(updated);
    
    // Dispatch OTP now that worker is approved
    setTimeout(() => dispatchJobStartOtp(updated), 500);
        
    // Auto-inject OTP into in-app chat`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched approveAndFundEscrow");
} else {
    console.log("Could not find approveAndFundEscrow target block");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
