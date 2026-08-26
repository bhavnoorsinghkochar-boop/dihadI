const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const approveFn = `
  const approveWorker = (jobId: string) => {
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
  };
`;

code = code.replace('approveAndFundEscrow: (jobId: string) => void;', 'approveAndFundEscrow: (jobId: string) => void;\n  approveWorker: (jobId: string) => void;');
code = code.replace('const approveAndFundEscrow = (jobId: string) => {', approveFn + '\n  const approveAndFundEscrow = (jobId: string) => {');
code = code.replace('approveAndFundEscrow,', 'approveAndFundEscrow,\n        approveWorker,');

fs.writeFileSync('src/context/AppContext.tsx', code);
