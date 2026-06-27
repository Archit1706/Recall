/**
 * Fetches a PDF URL and extracts plain text via `unpdf`. `unpdf` is edge-safe,
 * unlike `pdf-parse`, and runs fine in Node serverless runtimes.
 */
import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n\n") : text;
  } catch {
    return null;
  }
}
