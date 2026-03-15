import * as pdfjsLib from "pdfjs-dist";

// Use the CDN for the worker to avoid complex Vite/webpack configurations.
// Make sure to match the exact version of the installed pdfjs-dist.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts all text from a given PDF File object.
 * Returns a consolidated string of all pages.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
    const pdfDocument = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .filter((item) => "str" in item)
            .map((item) => (item as any).str)
            .join(" ");

        fullText += pageText + "\n";
    }

    return fullText.trim();
}
