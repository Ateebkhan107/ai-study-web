const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function replaceImport(oldPath, newPath) {
  const files = execSync('find src -type f \\( -name "*.js" -o -name "*.jsx" \\)').toString().trim().split('\n');
  files.forEach(f => {
    if (!f) return;
    let content = fs.readFileSync(f, 'utf8');
    const oldImportRegex = new RegExp(`@/lib/${oldPath}`, 'g');
    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, `@/${newPath}/${oldPath}`);
      fs.writeFileSync(f, content, 'utf8');
//       console.log(`Updated ${f}`);
    }
  });
}

const moves = {
  'examConfig': 'constants',
  'analyticsData': 'constants',
  'badgeEngine': 'utils',
  'levelEngine': 'utils',
  'streak': 'utils',
  'xp': 'utils',
  'updateGoalProgress': 'utils',
  'goals': 'utils',
  'leaderboard': 'utils',
  'profile': 'utils',
  'userProfile': 'utils',
  'bookmarks': 'utils',
};

for (const [file, dest] of Object.entries(moves)) {
  const oldFile = `src/lib/${file}.js`;
  const newDir = `src/${dest}`;
  const newFile = `${newDir}/${file}.js`;
  if (fs.existsSync(oldFile)) {
    if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
    fs.renameSync(oldFile, newFile);
//     console.log(`Moved ${oldFile} to ${newFile}`);
    replaceImport(file, dest);
  }
}
