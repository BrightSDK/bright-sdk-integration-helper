// LICENSE_CODE ZON

/**
* Build script for Bright SDK Helper
* - Reads version from package.json
* - Minifies the source file using Terser
* - Outputs to releases/[version]/brd_api.helper.min.js
* - Creates both minor version (x.y) and master version (x.y.z) folders
*/

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Load version from package.json
const pkg = require('./package.json');
const fullVersion = pkg.version; // e.g., "1.2.3"
const minorVersion = fullVersion.split('.').slice(0, 2).join('.'); // e.g., "1.2"
const masterVersion = fullVersion.split('.')[0]; // e.g., "1"

// Define input and output paths
const inputFile = path.resolve(__dirname, 'src/brd_api.helper.js');

// Create output directories for minor and master versions only
const minorOutputDir = path.resolve(__dirname, `releases/v${minorVersion}`);
const masterOutputDir = path.resolve(__dirname, `releases/v${masterVersion}`);
const releasesRootDir = path.resolve(__dirname, 'releases');

const minorOutputFile = path.join(minorOutputDir, 'brd_api.helper.min.js');
const masterOutputFile = path.join(masterOutputDir, 'brd_api.helper.min.js');

const rootVersionedFile = path.join(releasesRootDir, `brd_api.helper-${fullVersion}.min.js`);
const rootLatestFile = path.join(releasesRootDir, `brd_api.helper-latest.min.js`);

// Ensure the output directories exist
fs.mkdirSync(minorOutputDir, { recursive: true });
fs.mkdirSync(masterOutputDir, { recursive: true });

// Read the source file
const sourceCode = fs.readFileSync(inputFile, 'utf8');

// Minify the source code
(async () => {
    try {
        const result = await minify(sourceCode, {
            compress: true,
            mangle: true,
            format: {
                comments: false
            }
        });

        if (result.error) {
            console.error('❌ Minification error:', result.error);
            process.exit(1);
        }

        // Write the minified code to version directories
        fs.writeFileSync(minorOutputFile, result.code, 'utf8');
        fs.writeFileSync(masterOutputFile, result.code, 'utf8');

        // Write the versioned and latest files to releases root
        fs.writeFileSync(rootVersionedFile, result.code, 'utf8');
        fs.writeFileSync(rootLatestFile, result.code, 'utf8');

        console.log(`✅ Build completed successfully!`);
        console.log(`📁 Minor version (v${minorVersion}): ${minorOutputDir}`);
        console.log(`📁 Master version (v${masterVersion}): ${masterOutputDir}`);
        console.log(`📦 Files created:`);
        console.log(`   - brd_api.helper.min.js (in each version folder)`);
        console.log(`   - releases/brd_api.helper-${fullVersion}.min.js (specific version)`);
        console.log(`   - releases/brd_api.helper-latest.min.js (latest version)`);    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
})();