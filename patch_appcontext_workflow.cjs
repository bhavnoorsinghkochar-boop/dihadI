const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target1 = `  const approveAndFundEscrow = (jobId: string) => {
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

const replacement1 = `  const approveAndFundEscrow = (jobId: string) => {
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
        return updated;
      }
      return job;
    }));
    
    // Auto-inject OTP into in-app chat
    if (jobOtp && customerId && workerId) {
      try {
        const conversationId = [customerId, workerId].sort().join('_');
        const storageKey = \`dihadi_chat_v7_\${conversationId}\`;
        const existingRaw = localStorage.getItem(storageKey);
        const history = existingRaw ? JSON.parse(existingRaw) : [];
        const newMessage = {
          id: \`msg_\${Date.now()}_\${Math.random().toString(36).substring(2,9)}\`,
          senderId: customerId,
          text: \`SYSTEM: Customer approved & paid escrow! Your secure Start OTP is \${jobOtp}\`,
          timestamp: Date.now()
        };
        history.push(newMessage);
        localStorage.setItem(storageKey, JSON.stringify(history));
        
        window.dispatchEvent(new CustomEvent('dihadi_chat_sync', { detail: { key: storageKey } }));
        window.dispatchEvent(new CustomEvent('dihadi_chat_message_event', {
          detail: {
            conversationId,
            senderId: customerId,
            senderName: "System",
            receiverId: workerId,
            text: newMessage.text,
            jobId: jobId
          }
        }));
      } catch (err) {
        console.warn('Could not inject OTP to chat', err);
      }
    }
    
    playSound("success");
    showNotification("Worker Approved & Escrow Funded", "Worker approved! OTP automatically sent to in-app chat.");
  };`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1);
  console.log('approveAndFundEscrow replaced successfully');
} else {
  console.log('COULD NOT FIND approveAndFundEscrow');
}

const target2 = `  // Worker starts work by entering OTP
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

const replacement2 = `  // Worker starts work by entering OTP
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
      showNotification('OTP Verified! Job officially started.');
      return true;
    } else {
      playSound('alert');
      showNotification('Invalid OTP. Please check with employer.');
      return false;
    }
  };`;

if (code.includes(target2)) {
  code = code.replace(target2, replacement2);
  console.log('startJobWithOtp replaced successfully');
} else {
  console.log('COULD NOT FIND startJobWithOtp');
}

fs.writeFileSync('src/context/AppContext.tsx', code);
