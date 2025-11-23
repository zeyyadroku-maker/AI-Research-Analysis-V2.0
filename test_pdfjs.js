(async () => {
    try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        console.log('pdfjs-dist legacy loaded via import');
        console.log('Keys:', Object.keys(pdfjs));

        // Check if we can load a document (mock)
        // We need to set up a worker?
        // pdfjs.GlobalWorkerOptions.workerSrc = ...

        console.log('GlobalWorkerOptions:', pdfjs.GlobalWorkerOptions);
    } catch (e) {
        console.error('Failed to import pdfjs-dist legacy:', e);
    }
})();
