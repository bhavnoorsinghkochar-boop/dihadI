const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const approveFundTarget = `  const approveAndFundEscrow = (jobId: string) => {
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
    
    // Auto-inject OTP into in-app chat
    if (jobOtp && customerId && workerId) {`;

const approveFundReplacement = `  const approveAndFundEscrow = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

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

    // Auto-inject OTP into in-app chat
    if (updated.otpCode && updated.customerId && updated.assignedWorkerId) {
      let customerId = updated.customerId;
      let workerId = updated.assignedWorkerId;
      let jobOtp = updated.otpCode;`;

if (code.includes(approveFundTarget)) {
    code = code.replace(approveFundTarget, approveFundReplacement);
    console.log("Patched approveAndFundEscrow");
} else {
    console.log("Could not find approveAndFundEscrow target");
}


const approveWorkerTarget = `  const approveWorker = (jobId: string) => {
    let jobOtp = '';
    let customerId = '';
    let workerId = '';
    
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        jobOtp = job.otpCode || '';
        customerId = job.customerId;
        workerId = job.assignedWorkerId || '';
        const updated = { ...job, status: 'approved' as const };
        syncJobToFirestore(updated);
        
        // Dispatch OTP now that worker is approved
        setTimeout(() => dispatchJobStartOtp(updated), 500);
        return updated;
      }
      return job;
    }));
    
    // Auto-inject OTP into in-app chat
    if (jobOtp && customerId && workerId) {`;

const approveWorkerReplacement = `  const approveWorker = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updated = { ...job, status: 'approved' as const };
    setJobs(prev => prev.map(j => j.id === jobId ? updated : j));
    syncJobToFirestore(updated);
    
    // Dispatch OTP now that worker is approved
    setTimeout(() => dispatchJobStartOtp(updated), 500);

    // Auto-inject OTP into in-app chat
    if (updated.otpCode && updated.customerId && updated.assignedWorkerId) {
      let customerId = updated.customerId;
      let workerId = updated.assignedWorkerId;
      let jobOtp = updated.otpCode;`;

if (code.includes(approveWorkerTarget)) {
    code = code.replace(approveWorkerTarget, approveWorkerReplacement);
    console.log("Patched approveWorker");
} else {
    console.log("Could not find approveWorker target");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
