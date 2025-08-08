import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";

// Configure worker from CDN to avoid bundling issues in Vite
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js";

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => (item.str as string) ?? "");
    fullText += strings.join(" ") + "\n";
  }
  return fullText.trim();
}
