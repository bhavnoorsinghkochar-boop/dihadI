const fs = require('fs');
let code = fs.readFileSync('src/components/RoleSelectScreen.tsx', 'utf8');

if (!code.includes("import { Logo } from './common/Logo';")) {
  code = code.replace(
    "import { getT } from '../utils/translations';",
    "import { getT } from '../utils/translations';\nimport { Logo } from './common/Logo';"
  );
}

const target = `        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Kaam<span className="text-amber-500">zo</span>
          <span className="block text-xl sm:text-2xl font-bold text-slate-700 mt-2">
            {getT(currentLanguage, 'choose_portal_title')}
          </span>
        </h1>`;

const replacement = `        <div className="flex flex-col items-center">
          <Logo className="scale-[1.3] sm:scale-[1.7] origin-center mb-6 mt-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mt-4 text-center">
            {getT(currentLanguage, 'choose_portal_title')}
          </h2>
        </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  console.log("Patched RoleSelectScreen.tsx");
} else {
  console.log("Could not find target in RoleSelectScreen");
}

fs.writeFileSync('src/components/RoleSelectScreen.tsx', code);
