const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/win10/Downloads/project-bolt-sb1-mq5es2dt/project/src/admin';

const replaceMap = {
  'bg-slate-950': 'bg-slate-50',
  'bg-slate-900': 'bg-white shadow-sm',
  'bg-slate-800/50': 'bg-slate-50',
  'bg-slate-800/30': 'bg-slate-50',
  'bg-slate-800': 'bg-white',
  'bg-slate-700': 'bg-slate-100',
  
  'border-slate-800/50': 'border-slate-200',
  'border-slate-800': 'border-slate-200',
  'border-slate-700': 'border-slate-300',
  
  'text-slate-400': 'text-slate-500',
  'text-slate-300': 'text-slate-600',
  'text-white': 'text-slate-800',
  
  'hover:bg-slate-800/30': 'hover:bg-slate-50',
  'hover:bg-slate-800': 'hover:bg-slate-50',
  'hover:bg-slate-700': 'hover:bg-slate-100',
  'hover:text-slate-200': 'hover:text-slate-700',
  
  'text-emerald-400': 'text-emerald-600',
  'bg-emerald-500/10': 'bg-emerald-100',
  'text-amber-400': 'text-amber-600',
  'bg-amber-500/10': 'bg-amber-100'
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
      
      // Specifically fix AdminLayout.tsx text-white replacing text-slate-800 bg-emerald-600
      content = content.replace(/text-slate-800 bg-emerald-600/g, 'text-white bg-emerald-600');
      content = content.replace(/text-slate-800 bg-amber-600/g, 'text-white bg-amber-600');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Done admin replace!');
