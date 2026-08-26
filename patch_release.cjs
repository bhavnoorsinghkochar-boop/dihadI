const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `    const updatedJob: Job = {
      ...job,
      platformFee: actualPlatformFee,
      workerPayout: payout,
      zeroCommissionApplied: zeroCommissionUsed,
      status: 'paid_and_closed',
      isPaid: true,
      rating: rating,
      review: review,`;

const replacement = `    const updatedJob: Job = {
      ...job,
      platformFee: actualPlatformFee,
      workerPayout: payout,
      zeroCommissionApplied: zeroCommissionUsed,
      status: 'paid_and_closed',
      escrowStatus: 'released_to_worker',
      isPaid: true,
      rating: rating,
      review: review,`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched releasePaymentByCustomer");
} else {
    console.log("Could not find releasePaymentByCustomer target block");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
