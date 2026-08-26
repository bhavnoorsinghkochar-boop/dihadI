const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `  // Check if promo ad should be shown on app start/reopen
  useEffect(() => {
    const roleKey = currentRole === 'worker' ? 'worker' : 'customer';
    const hasSeenInSession = sessionStorage.getItem(\`dihadi_promo_shown_\${roleKey}_v6\`);
    if (!hasSeenInSession && (currentRole === 'customer' || currentRole === 'worker')) {
      const timer = setTimeout(() => {
        setPromoInitialRole(roleKey);
        setIsSubscriptionPromoOpen(true);
        sessionStorage.setItem(\`dihadi_promo_shown_\${roleKey}_v6\`, 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentRole]);`;

const replacement = `  // Subscription promo ad on app start/reopen is disabled as requested by the user
  /*
  useEffect(() => {
    // Promo logic removed
  }, [currentRole]);
  */`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    console.log("Patched AppContext to remove promo ads");
    fs.writeFileSync('src/context/AppContext.tsx', code);
} else {
    console.log("Target not found in AppContext");
}
