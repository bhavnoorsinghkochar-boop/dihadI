const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const escrowTarget = `        const updated = {
          ...job,
          status: 'approved' as const,
          isEscrowPrepaid: true,
          escrowStatus: "held_in_escrow" as const,
          escrowPrepaidAt: new Date().toISOString()
        };
        syncJobToFirestore(updated);
        return updated;`;

const escrowReplacement = `        const updated = {
          ...job,
          status: 'approved' as const,
          isEscrowPrepaid: true,
          escrowStatus: "held_in_escrow" as const,
          escrowPrepaidAt: new Date().toISOString()
        };
        syncJobToFirestore(updated);
        
        // Dispatch OTP now that worker is approved
        setTimeout(() => dispatchJobStartOtp(updated), 500);
        return updated;`;

const approveWorkerTarget = `        const updated = { ...job, status: 'approved' as const };
        syncJobToFirestore(updated);
        return updated;`;

const approveWorkerReplacement = `        const updated = { ...job, status: 'approved' as const };
        syncJobToFirestore(updated);
        
        // Dispatch OTP now that worker is approved
        setTimeout(() => dispatchJobStartOtp(updated), 500);
        return updated;`;

if (code.includes(escrowTarget)) {
    code = code.replace(escrowTarget, escrowReplacement);
    console.log("Patched approveAndFundEscrow");
}

if (code.includes(approveWorkerTarget)) {
    code = code.replace(approveWorkerTarget, approveWorkerReplacement);
    console.log("Patched approveWorker");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
