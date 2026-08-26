const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const target = `  return (
    <header className="relative h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs shrink-0 z-30 sticky top-0">
      {/* Absolute Centered Logo for all screens */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0">
        <div className="pointer-events-auto">
          <Logo 
            onClick={() => setCurrentRole('select_role')} 
            className="shrink-0 scale-[0.7] sm:scale-90 origin-center" 
          />
        </div>
      </div>

      {/* Brand & Active Role Status */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="hidden sm:block">`;

const replacement = `  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs shrink-0 z-30 sticky top-0">
      {/* Brand & Active Role Status */}
      <div className="flex items-center gap-3">
        <Logo 
          onClick={() => setCurrentRole('select_role')} 
          className="shrink-0 scale-[0.7] sm:scale-90 origin-left" 
        />
        <div className="hidden sm:block">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Reverted header alignment");
}

fs.writeFileSync('src/components/Header.tsx', code);
