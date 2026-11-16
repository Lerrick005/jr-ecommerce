import { prisma } from "@/lib/db";

/**
 * Read a content value from the Setting table with a fallback default.
 * Shape: { text: string }
 */
export async function getContent(key: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row && typeof row.valueJson === "object" && row.valueJson !== null) {
      const v = row.valueJson as { text?: string };
      if (typeof v.text === "string" && v.text.length > 0) return v.text;
    }
  } catch {
    // ignore
  }
  return fallback;
}