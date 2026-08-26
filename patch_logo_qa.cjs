const fs = require('fs');
let code = fs.readFileSync('src/components/common/Logo.tsx', 'utf8');

// Remove unused import
code = code.replace("import { HardHat } from 'lucide-react';\n", "");

// Add accessibility attributes to the clickable div
const targetDiv = `<div 
      onClick={onClick}
      className={\`relative flex items-center select-none \${onClick ? 'cursor-pointer' : ''} \${className}\`}
      title="Kaamzo"
    >`;

const replacementDiv = `<div 
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={\`relative flex items-center select-none \${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg' : ''} \${className}\`}
      title="Kaamzo"
      aria-label={onClick ? "Return to home" : undefined}
    >`;

if (code.includes(targetDiv)) {
    code = code.replace(targetDiv, replacementDiv);
    console.log("Patched Logo.tsx");
} else {
    console.log("Target not found");
}

fs.writeFileSync('src/components/common/Logo.tsx', code);
