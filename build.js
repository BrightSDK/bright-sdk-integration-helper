// LICENSE_CODE ZON

/**
* Build script for BrightSDK Integration Helper
* - Reads version from package.json
* - Minifies the source file using Terser
* - Uses Release Manager to organize outputs into versioned structure
*/

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const ReleaseManager = require('@bright-sdk/tool-release-manager');

// Define input and output paths
const inputFile = path.resolve(__dirname, 'src/brd_api.helper.js');
const distDir = path.resolve(__dirname, 'dist');
const outputFile = path.join(distDir, 'brd_api.helper.min.js');

// Ensure the dist directory exists
fs.mkdirSync(distDir, { recursive: true });

// Read the source file
const sourceCode = fs.readFileSync(inputFile, 'utf8');

console.log('🔨 Building BrightSDK Integration Helper...');

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

        // Write the minified code to dist directory
        fs.writeFileSync(outputFile, result.code, 'utf8');
        console.log('✅ Minification completed');

        // Use Release Manager to organize the build output
        console.log('📦 Organizing release artifacts...');
        const releaseConfig = require('./release.config.js');
        const releaseManager = new ReleaseManager(releaseConfig);
        await releaseManager.release();

        console.log('🎉 Build and release completed successfully!');

    } catch (err) {
        console.error('❌ Build failed:', err);
        process.exit(1);
    }
})();
