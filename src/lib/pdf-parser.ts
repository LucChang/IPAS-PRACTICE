import pdf from 'pdf-parse';

export async function parsePdf(fileBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (e: any) {
    console.error('Error parsing PDF with pdf-parse');
    console.error(e);
    throw new Error(`Failed to parse PDF with pdf-parse: ${e.message}`);
  }
}