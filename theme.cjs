const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/win10/Downloads/project-bolt-sb1-mq5es2dt/project/src/ipad';

const replaceMap = {
  'bg-[#0d1b3e]': 'bg-[#f8f9fa]',
  'text-white': 'text-gray-800',
  'text-white/10': 'text-gray-200',
  'text-white/20': 'text-gray-300',
  'text-white/30': 'text-gray-400',
  'text-white/40': 'text-gray-500',
  'text-white/50': 'text-gray-500',
  'text-white/60': 'text-gray-600',
  'text-white/70': 'text-gray-600',
  'text-white/80': 'text-gray-700',
  'text-white/90': 'text-gray-700',
  'border-white/10': 'border-gray-200',
  'border-white/20': 'border-gray-300',
  'border-white/30': 'border-gray-300',
  'hover:bg-white/5': 'hover:bg-gray-100',
  'bg-white/10': 'bg-white',
  'bg-white/5': 'bg-gray-50',
  'bg-white/30': 'bg-gray-300',
  'bg-[#c9a84c]/20': 'bg-[#c9a84c]/20', // keep as is or make lighter
  'bg-black/40': 'bg-white/80 text-gray-800',
  'bg-black/50': 'bg-white/80 text-gray-800',
  'bg-black/60': 'bg-white/80 text-gray-800',
  'hover:bg-black/70': 'hover:bg-white',
  'text-[#0d1b3e]': 'text-white',
  'text-[#c9a84c]': 'text-[#b08d3a]' // slightly darker gold for better contrast on white
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
        if (!key.includes('/')) {
           regexStr += '(?![\\/a-zA-Z0-9\\-])'; // avoid matching text-white when it's text-white-something (not common but safe)
        }
        const regex = new RegExp(regexStr, 'g');
        content = content.replace(regex, value);
      }
      
      content = content.replace(/text-gray-800 bg-red-500/g, 'text-white bg-red-500');
      
      // For placeholder-white/40
      content = content.replace(/placeholder-white\/40/g, 'placeholder-gray-400');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Done!');
