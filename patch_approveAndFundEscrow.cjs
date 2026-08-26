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
    }));`;

const replacement = `  const approveAndFundEscrow = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const updated = {
      ...targetJob,
      status: 'approved' as const,
      isEscrowPrepaid: true,
      escrowStatus: "held_in_escrow" as const,
      escrowPrepaidAt: new Date().toISOString()
    };

    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    
    syncJobToFirestore(updated);
    setTimeout(() => dispatchJobStartOtp(updated), 500);
    
    let jobOtp = updated.otpCode || '';
    let customerId = updated.customerId;
    let workerId = updated.assignedWorkerId || '';`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched approveAndFundEscrow");
} else {
    console.log("Could not find approveAndFundEscrow target block");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
