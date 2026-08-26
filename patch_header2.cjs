const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

if (!code.includes("import { Logo } from './common/Logo';")) {
  code = code.replace(
    "import { getT } from '../utils/translations';",
    "import { getT } from '../utils/translations';\nimport { Logo } from './common/Logo';"
  );
}

const regex = /<div\s+onClick=\{\(\) => setCurrentRole\('select_role'\)\}\s+className="w-10 h-10 bg-slate-900 hover:bg-slate-800 transition rounded-xl flex items-center justify-center text-white font-black italic text-xl cursor-pointer shadow-xs select-none shrink-0"\s+title="Return to Role Selection"\s+>\s+K\s+<\/div>\s+<div>\s+<div className="flex items-center gap-2">\s+<h1\s+onClick=\{\(\) => setCurrentRole\('select_role'\)\}\s+className="text-base sm:text-lg font-black text-slate-900 tracking-tight cursor-pointer flex items-center gap-1"\s+>\s+Kaam<span className="text-amber-500 font-extrabold">zo<\/span>\s+<\/h1>/;

const replacement = `<Logo 
          onClick={() => setCurrentRole('select_role')} 
          className="shrink-0 scale-[0.7] sm:scale-90 origin-left" 
        />
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  console.log("Patched Header.tsx using regex");
} else {
  console.log("Could not find target block using regex");
}

fs.writeFileSync('src/components/Header.tsx', code);
