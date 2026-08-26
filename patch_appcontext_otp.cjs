const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldStartJob = `  // Worker starts work by entering OTP
  const startJobWithOtp = (jobId: string, inputOtp: string): boolean => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return false;

    if (targetJob.otpCode === inputOtp.trim()) {
      const updated = { ...targetJob, status: 'in_progress' as const };
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? updated : j))
      );
      syncJobToFirestore(updated);
      playSound('success');
      showNotification('OTP Verified! Work status: In Progress.');
      return true;
    } else {
      playSound('alert');
      showNotification('Invalid OTP. Please check with employer.');
      return false;
    }
  };`;

const newStartJob = `  // Worker starts work by entering OTP
  const startJobWithOtp = (jobId: string, inputOtp: string): boolean => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return false;

    if (targetJob.otpCode === inputOtp.trim()) {
      const updated = { ...targetJob, status: 'pending_payment' as const };
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? updated : j))
      );
      syncJobToFirestore(updated);
      playSound('success');
      showNotification('OTP Verified! Waiting for customer to pay.');
      return true;
    } else {
      playSound('alert');
      showNotification('Invalid OTP. Please check with employer.');
      return false;
    }
  };`;

code = code.replace(oldStartJob, newStartJob);

const oldApprove = `  const approveAndFundEscrow = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updated = {
          ...job,
          isEscrowPrepaid: true,
          escrowStatus: "held_in_escrow" as const,
          escrowPrepaidAt: new Date().toISOString()
        };
        syncJobToFirestore(updated);
        return updated;
      }
      return job;
    }));
    playSound("success");
    showNotification("Escrow Funded", "Worker approved! Start OTP generated.");
  };`;

const newApprove = `  const approveAndFundEscrow = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updated = {
          ...job,
          status: 'in_progress' as const,
          isEscrowPrepaid: true,
          escrowStatus: "held_in_escrow" as const,
          escrowPrepaidAt: new Date().toISOString()
        };
        syncJobToFirestore(updated);
        return updated;
      }
      return job;
    }));
    playSound("success");
    showNotification("Escrow Funded", "Job Started! Escrow deposited.");
  };`;

code = code.replace(oldApprove, newApprove);
fs.writeFileSync('src/context/AppContext.tsx', code);
