import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replaceAll('Senior Fullstack Web & Mobile Developer & AI Systems Engineer', 'Senior Fullstack Web & Mobile Developer & AI Systems Engineer');
    content = content.replaceAll('Senior Fullstack Web &amp; Mobile Developer &amp; AI Systems Engineer', 'Senior Fullstack Web &amp; Mobile Developer &amp; AI Systems Engineer');
    content = content.replaceAll('Senior Fullstack Web & Mobile Developer & AI Systems Engineer', 'Senior Fullstack Web & Mobile Developer & AI Systems Engineer');
    content = content.replaceAll('Senior Fullstack Web &amp; Mobile Developer &amp; AI Systems Engineer', 'Senior Fullstack Web &amp; Mobile Developer &amp; AI Systems Engineer');
    content = content.replaceAll('Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer)', 'Eka Syarif Maulana, S.Kom (Senior Fullstack Web & Mobile Developer & AI Systems Engineer)');
    content = content.replaceAll('Senior Fullstack Developer & AI Systems Engineer', 'Senior Fullstack Developer & AI Systems Engineer');
    
    // Replace bio in HTML
    content = content.replace(/Eka Syarif Maulana adalah Founder Inka\.tech.*?@inka\.tech.*?<\/p>/gis, 
      'Eka Syarif Maulana, S.Kom adalah Senior Fullstack Web & Mobile Developer dan AI Systems Engineer lulusan Sarjana Komputer UMSU. Berfokus pada arsitektur perangkat lunak skala tinggi, kecerdasan buatan, dan riset keamanan siber.</p>'
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned:', filePath);
    }
  } catch (err) {
    console.error('Error in:', filePath, err.message);
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.cache') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(json|md|txt|tsx|ts|mjs|js)$/.test(entry.name)) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.resolve('.'));
console.log('Purge completed successfully!');
