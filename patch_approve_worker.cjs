const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const approveTarget = `  const approveWorker = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updated = { ...job, status: 'approved' as const };
        syncJobToFirestore(updated);
        return updated;
      }
      return job;
    }));
    playSound("success");
    showNotification("Worker Approved", "Worker approved! OTP automatically sent to in-app chat.");
  };`;

const approveReplacement = `  const approveWorker = (jobId: string) => {
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
          text: \`SYSTEM: Customer approved! Your secure Start OTP is \${jobOtp}\`,
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
    showNotification("Worker Approved", "Worker approved! OTP automatically sent to in-app chat.");
  };`;

code = code.replace(approveTarget, approveReplacement);

fs.writeFileSync('src/context/AppContext.tsx', code);
