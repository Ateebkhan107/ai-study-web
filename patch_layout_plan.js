import fs from 'fs';
let code = fs.readFileSync('./src/app/(dashboard)/layout.js', 'utf8');

code = code.replace(
  '<Navbar\\n            accountType={accountType}\\n            institutes={activeInstitutes}\\n          />',
  '<Navbar\\n            accountType={accountType}\\n            institutes={activeInstitutes}\\n            plan={accessContext.plan}\\n          />'
);

// wait the regex for the replacement might fail due to exact whitespace, let's just do simple string replacement
code = code.replace(
  '          <Navbar\\n            accountType={accountType}\\n            institutes={activeInstitutes}\\n          />',
  '          <Navbar\\n            accountType={accountType}\\n            institutes={activeInstitutes}\\n            plan={accessContext.plan}\\n          />'
);

fs.writeFileSync('./src/app/(dashboard)/layout.js', code);
