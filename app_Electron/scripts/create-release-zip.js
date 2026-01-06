#!/usr/bin/env node

/**
 * Post-build script that creates a ZIP file of the installer for GitHub Releases
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const releaseDir = path.join(__dirname, '..', 'release');

/**
 * Find the latest installer file
 */
function findInstallerFile() {
  const files = fs.readdirSync(releaseDir);
  
  // Look for .exe files (Windows installer)
  const exeFiles = files.filter(f => f.endsWith('.exe') && !f.includes('blockmap'));
  
  if (exeFiles.length === 0) {
    console.warn('⚠️  No installer files found in release directory');
    return null;
  }
  
  // Sort by modification time and get the most recent
  const sorted = exeFiles.map(f => ({
    file: f,
    time: fs.statSync(path.join(releaseDir, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time);
  
  return sorted[0].file;
}

/**
 * Create a zip file from the installer
 */
async function createZip(installerFile) {
  const sourceFile = path.join(releaseDir, installerFile);
  const zipFile = path.join(releaseDir, 'Snipt-Setup.zip');
  
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`✅ Created ZIP: ${zipFile} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      resolve(zipFile);
    });
    
    archive.on('error', (err) => {
      console.error(`❌ Error creating ZIP: ${err.message}`);
      reject(err);
    });
    
    archive.pipe(output);
    archive.file(sourceFile, { name: installerFile });
    archive.finalize();
  });
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🔄 Creating ZIP for release...\n');
    
    const installerFile = findInstallerFile();
    if (!installerFile) {
      console.log('⏭️  Skipping ZIP creation - no installer found');
      return;
    }
    
    console.log(`📦 Found installer: ${installerFile}`);
    
    const zipPath = await createZip(installerFile);
    console.log(`\n✨ ZIP ready for GitHub release: release/Snipt-Setup.zip`);
    
  } catch (error) {
    console.error('❌ Error in release script:', error.message);
    process.exit(1);
  }
}

main();
