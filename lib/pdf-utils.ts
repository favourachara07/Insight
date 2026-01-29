// src/lib/pdf-utils.ts
import * as pdfjsLib from "pdfjs-dist";

// Configure the worker to use the local file from public folder
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";

    // Loop through pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them with spaces
      const pageText = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str)
        .join(" ");
        
      fullText += `${pageText}\n\n`;
    }

    return fullText.trim();
  } catch (error) {
    console.error("PDF Extraction Failed:", error);
    throw new Error("Could not parse PDF. Please ensure the file is a valid PDF.");
  }
};