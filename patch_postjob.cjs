const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const postTarget = `      showNotification(\`New \${newJob.trade} job broadcasted. OTP: \${otpCode}\`);
    }

    // Auto-dispatch Start OTP to customer email & phone
    dispatchJobStartOtp(newJob);`;

const postReplacement = `      showNotification(\`New \${newJob.trade} job broadcasted.\`);
    }`;

if (code.includes(postTarget)) {
    code = code.replace(postTarget, postReplacement);
    console.log("Patched postJob");
} else {
    console.log("Could not find postTarget");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
