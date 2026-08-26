const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const acceptTarget = 'showNotification(`Job assigned to ${worker.name}! Start OTP: ${targetJob?.otpCode || updatedAcceptedJob?.otpCode}`);';
const acceptReplacement = 'showNotification(`Your job has been accepted by ${worker.name}. Do you want to approve or reject this worker?`);';

code = code.replace(acceptTarget, acceptReplacement);

fs.writeFileSync('src/context/AppContext.tsx', code);
