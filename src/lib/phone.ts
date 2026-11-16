/**
 * Normalise Kenyan phone numbers to E.164 +2547xxxxxxxx or +2541xxxxxxxx.
 * Accepts: "0712345678", "0112345678", "254712345678", "+254712345678",
 *          "712345678", "07 12 345 678" (spaces stripped).
 * Returns null on invalid input.
 */
export function normaliseKenyanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).trim().replace(/[\s\-().]/g, "");
  if (s.startsWith("+254")) s = "0" + s.slice(4);
  else if (s.startsWith("254")) s = "0" + s.slice(3);
  if (!s.startsWith("0")) {
    // Bare 9-digit like "712345678" â€" prefix 0
    if (/^[17]\d{8}$/.test(s)) s = "0" + s;
    else return null;
  }
  if (!/^0[17]\d{8}$/.test(s)) return null;
  return "+254" + s.slice(1);
}

export function isValidKenyanPhone(raw: string): boolean {
  return normaliseKenyanPhone(raw) !== null;
}

/** For display: +254712345678 -> 0712 345 678 */
export function formatPhoneForDisplay(e164: string): string {
  const m = e164.match(/^\+254(\d)(\d{3})(\d{3})(\d{3})$/);
  if (!m) return e164;
  return `0${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
}