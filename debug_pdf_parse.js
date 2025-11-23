const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse || pdfModule.default || pdfModule;

async function test() {
    // We need a real PDF buffer to test getText properly, but let's try with dummy and see if it fails gracefully or what
    // Actually, I can't easily generate a valid PDF buffer here.
    // But I can check if getText returns a promise.

    try {
        const buffer = Buffer.from('dummy pdf content');
        const parser = new PDFParse(buffer);
        console.log('Parser created.');

        // Try calling getText
        const textPromise = parser.getText();
        console.log('getText returned:', textPromise);
        if (textPromise instanceof Promise) {
            console.log('Awaiting text promise...');
            try {
                const text = await textPromise;
                console.log('Text:', text);
            } catch (e) {
                console.log('Error awaiting text (expected for dummy):', e.message);
            }
        }
    } catch (e) {
        console.log('Error:', e);
    }
}

test();
