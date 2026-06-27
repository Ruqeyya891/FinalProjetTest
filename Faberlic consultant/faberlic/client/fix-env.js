
const fs = require('fs');
const path = require('path');

// Directory to scan
const srcDir = path.join(__dirname, 'src');

// Function to recursively process files
function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Replace single quoted strings
      if (content.includes("'import.meta.env.VITE_API_URL'")) {
        content = content.replaceAll("'import.meta.env.VITE_API_URL'", 'import.meta.env.VITE_API_URL');
        changed = true;
      }
      
      // Replace template literal parts
      if (content.includes('`import.meta.env.VITE_API_URL')) {
        content = content.replaceAll('`import.meta.env.VITE_API_URL', '`${import.meta.env.VITE_API_URL}');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  });
}

processDir(srcDir);
console.log('Done!');
