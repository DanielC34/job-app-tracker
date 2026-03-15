/**
 * Temporarily disabled for debugging
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  console.log("PDF extraction disabled", file.name);
  return "";
}
