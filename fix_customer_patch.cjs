const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');

code = code.replace(
    /area: currentCity\?\.defaultArea \|\| 'City',/g,
    "area: currentCity?.defaultArea || 'City',\n          address: 'Google Sign In User',"
);

fs.writeFileSync('src/components/customer/CustomerApp.tsx', code);
console.log("Fixed CustomerApp address issue");
