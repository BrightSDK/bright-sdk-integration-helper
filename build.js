// LICENSE_CODE ZON

/**
* Build script for Bright SDK Helper
* - Reads version from package.json
* - Minifies the source file using Terser
* - Outputs to releases/[version]/bright-sdk-helper.min.js
*/

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Load version from package.json
const pkg = require('./package.json');
const version = pkg.version;

// Define input and output paths
const inputFile = path.resolve(__dirname, 'src/brd_api.helper.js');
const outputDir = path.resolve(__dirname, `releases/${version}`);
const outputFile = path.join(outputDir, 'brd_api.helper.min.js');

// Ensure the output directory exists
fs.mkdirSync(outputDir, { recursive: true });

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

        // Write the minified code to the output file
        fs.writeFileSync(outputFile, result.code, 'utf8');
        console.log(`✅ Minified file written to: ${outputFile}`);
    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
})();