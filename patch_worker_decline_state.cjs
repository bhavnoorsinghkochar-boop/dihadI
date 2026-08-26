const fs = require('fs');
let code = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');

const target = 'const [showAllCityJobs, setShowAllCityJobs] = useState<boolean>(false);';
const replacement = 'const [showAllCityJobs, setShowAllCityJobs] = useState<boolean>(false);\n  const [declinedJobIds, setDeclinedJobIds] = useState<Set<string>>(new Set());';

code = code.replace(target, replacement);

const filterTarget = 'const allBroadcastWithDistance = jobs\n    .filter((j) => j.status === \'broadcast\')';
const filterReplacement = 'const allBroadcastWithDistance = jobs\n    .filter((j) => j.status === \'broadcast\' && !declinedJobIds.has(j.id))';

code = code.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/components/worker/WorkerApp.tsx', code);
