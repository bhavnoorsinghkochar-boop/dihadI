const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const interfaceTarget = 'approveWorker: (jobId: string) => void;';
code = code.replace(interfaceTarget, interfaceTarget + '\n  rejectWorker: (jobId: string) => void;');

const funcTarget = `  const approveWorker = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updated = { ...job, status: 'approved' as const };
        syncJobToFirestore(updated);
        return updated;
      }
      return job;
    }));
    playSound("success");
    showNotification("Worker Approved", "Please share the start OTP with the worker.");
  };`;

const replacement = `  const approveWorker = (jobId: string) => {
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
  };

  const rejectWorker = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updated = { 
          ...job, 
          status: 'broadcast' as const,
          assignedWorkerId: null,
          assignedWorkerName: null,
          assignedWorkerPhone: null
        };
        syncJobToFirestore(updated);
        return updated;
      }
      return job;
    }));
    playSound("alert");
    showNotification("Worker Rejected", "Job has been re-broadcasted to other workers.");
  };`;

code = code.replace(funcTarget, replacement);
code = code.replace('approveWorker,\n', 'approveWorker,\n        rejectWorker,\n');

fs.writeFileSync('src/context/AppContext.tsx', code);
