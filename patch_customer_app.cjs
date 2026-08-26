const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

const target = `      {/* 1. Customer Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('find_workers')}
            className="flex items-center cursor-pointer group"
          >
            <Logo className="scale-[0.6] origin-left group-hover:scale-[0.65] transition-transform" />
          </div>`;

const replacement = `      {/* 1. Customer Navigation Bar */}
      <nav className="relative bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        
        {/* Absolute Centered Logo for all screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0">
          <div className="pointer-events-auto cursor-pointer group" onClick={() => setActiveTab('find_workers')}>
            <Logo className="scale-[0.6] origin-center group-hover:scale-[0.65] transition-transform" />
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 relative z-10">
          {/* Logo placeholder removed since it's centered above */}`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched CustomerApp logo");
}

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
