const { extractPdfText } = require('./app/lib/documentProcessor');
const fs = require('fs');

async function test() {
    console.log('Testing extractPdfText...');
    // Create a dummy buffer (not a real PDF, so it should fail pdf-parse and fallback to pdf.js, or just fail gracefully)
    // Actually, let's just check if the function is callable and doesn't crash immediately on import
    try {
        const buffer = Buffer.from('dummy pdf content');
        const result = await extractPdfText(buffer);
        console.log('Result:', result);
    } catch (e) {
        console.log('Error during execution (expected for dummy content):', e.message);
        if (e.message.includes('pdf-parse is not callable')) {
            console.error('FAIL: pdf-parse is still not callable');
            process.exit(1);
        }
    }
    console.log('Import seems correct.');
}

test();
