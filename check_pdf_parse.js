const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Keys of pdf:', Object.keys(pdf));
if (pdf.PDFParse) {
    console.log('Type of pdf.PDFParse:', typeof pdf.PDFParse);
}
try {
    const fs = require('fs');
    const path = require('path');
    const pkgPath = path.join('node_modules', 'pdf-parse', 'package.json');
    if (fs.existsSync(pkgPath)) {
        console.log('pdf-parse package.json:', fs.readFileSync(pkgPath, 'utf8'));
    } else {
        console.log('pdf-parse package.json not found at', pkgPath);
    }
} catch (e) {
    console.log('Error reading package.json:', e);
}
