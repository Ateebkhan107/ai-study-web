import fs from 'fs';
let code = fs.readFileSync('./src/components/Navbar.jsx', 'utf8');

code = code.replace(
  'export default function Navbar({',
  'export default function Navbar({\n  plan,'
);

code = code.replace(
  '<ProfileMenu />',
  '<ProfileMenu plan={plan} />'
);

fs.writeFileSync('./src/components/Navbar.jsx', code);
