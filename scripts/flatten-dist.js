const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'rajmines-vts');
const browserPath = path.join(distPath, 'browser');

if (!fs.existsSync(browserPath)) {
  console.log('Browser folder not found. Build may have failed.');
  process.exit(1);
}

// Move all files from browser folder to dist root
const files = fs.readdirSync(browserPath);

files.forEach(file => {
  const sourcePath = path.join(browserPath, file);
  const destPath = path.join(distPath, file);
  
  if (fs.statSync(sourcePath).isDirectory()) {
    // If it's a directory, copy recursively
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    fs.cpSync(sourcePath, destPath, { recursive: true });
  } else {
    // If it's a file, move it
    fs.renameSync(sourcePath, destPath);
  }
});

// Remove the now-empty browser folder
fs.rmSync(browserPath, { recursive: true, force: true });

console.log('✓ Dist structure flattened successfully!');
console.log(`✓ Files are now in: ${distPath}`);

