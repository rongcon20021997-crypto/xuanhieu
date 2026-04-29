const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/win10/Downloads/project-bolt-sb1-mq5es2dt/project/src/ipad';

const replaceMap = {
  'bg-[#122040]': 'bg-white shadow-sm border border-gray-100',
  'bg-[#0a1628]': 'bg-gray-50'
};

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const entries = Object.entries(replaceMap).sort((a, b) => b[0].length - a[0].length);
      for (const [key, value] of entries) {
        let regexStr = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(regexStr, 'g');
        content = content.replace(regex, value);
      }
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Done additional replace!');
