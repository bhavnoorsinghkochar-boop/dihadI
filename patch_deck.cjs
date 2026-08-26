const fs = require('fs');
let code = fs.readFileSync('src/components/deck/PitchDeckViewer.tsx', 'utf8');

if (!code.includes("import { Logo } from '../common/Logo';")) {
  code = code.replace(
    "import { playSound } from '../../utils/audio';",
    "import { playSound } from '../../utils/audio';\nimport { Logo } from '../common/Logo';"
  );
}

const target = `            <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
              Kaam<span className="text-amber-500">zo</span>
            </h1>`;

const replacement = `            <div className="flex justify-center w-full">
              <Logo className="scale-[1.8] sm:scale-[2.2] origin-center my-6" />
            </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log("Patched PitchDeckViewer.tsx");
} else {
  console.log("Could not find target in PitchDeckViewer");
}

fs.writeFileSync('src/components/deck/PitchDeckViewer.tsx', code);
