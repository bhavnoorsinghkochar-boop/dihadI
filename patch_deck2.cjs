const fs = require('fs');
let code = fs.readFileSync('src/components/deck/PitchDeckViewer.tsx', 'utf8');

if (!code.includes("import { Logo }")) {
  code = code.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { Logo } from '../common/Logo';"
  );
}

fs.writeFileSync('src/components/deck/PitchDeckViewer.tsx', code);
