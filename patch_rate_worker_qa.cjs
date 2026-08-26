const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `    if (job.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === job.assignedWorkerId) {
            const count = Math.max(1, w.reviewCount || 1);
            const updatedRating = Number((((w.rating * count) - (job.rating || 5.0) + rating) / count).toFixed(1));
            const updatedW: WorkerProfile = {
              ...w,
              rating: Math.min(5.0, Math.max(1.0, updatedRating)),
            };
            syncWorkerToFirestore(updatedW);
            return updatedW;
          }
          return w;
        })
      );
    }`;

const replacement = `    if (job.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === job.assignedWorkerId) {
            const count = w.reviewCount || 0;
            const isNewRating = job.rating === undefined;
            let newCount = count;
            let updatedRating = w.rating;

            if (isNewRating) {
              newCount = count + 1;
              updatedRating = count === 0 ? rating : Number((((w.rating * count) + rating) / newCount).toFixed(1));
            } else {
              const safeCount = Math.max(1, count);
              updatedRating = Number((((w.rating * safeCount) - (job.rating || 5.0) + rating) / safeCount).toFixed(1));
            }

            const updatedW: WorkerProfile = {
              ...w,
              rating: Math.min(5.0, Math.max(1.0, updatedRating)),
              reviewCount: newCount,
            };
            
            syncWorkerToFirestore(updatedW);
            
            // Fix: Sync the state if the currently logged-in worker is the one being updated
            if (currentWorker && currentWorker.id === updatedW.id) {
              setCurrentWorker(updatedW);
            }
            
            return updatedW;
          }
          return w;
        })
      );
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched rateWorkerJob");
} else {
    console.log("Target not found");
}

fs.writeFileSync('src/context/AppContext.tsx', code);
