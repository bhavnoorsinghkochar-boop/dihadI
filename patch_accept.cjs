const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const acceptTarget = `    if (updatedAcceptedJob) {
      syncJobToFirestore(updatedAcceptedJob);
      dispatchJobStartOtp(updatedAcceptedJob);
    }`;

const acceptReplacement = `    if (updatedAcceptedJob) {
      syncJobToFirestore(updatedAcceptedJob);
    }`;

if (code.includes(acceptTarget)) {
    code = code.replace(acceptTarget, acceptReplacement);
    console.log("Patched acceptJobByWorker");
} else {
    console.log("Could not find acceptTarget");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
