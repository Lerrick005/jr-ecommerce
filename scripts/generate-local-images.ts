import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

const PALETTES = [
  { bg: "#F5EFE5", fg: "#2B1A10", accent: "#C45A3B" },
  { bg: "#2B1A10", fg: "#F5EFE5", accent: "#C99B3F" },
  { bg: "#E5DACB", fg: "#2B1A10", accent: "#5A2225" },
  { bg: "#FBF7F0", fg: "#C45A3B", accent: "#2B1A10" },
  { bg: "#43533A", fg: "#FBF7F0", accent: "#E5DACB" },
];

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text: string, maxCharsPerLine = 18): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function generateSvg(name: string, categorySlug: string, price: string, index: number, variant: number): string {
  const palette = PALETTES[index % PALETTES.length]!;
  const lines = wrapText(name, 16);
  const lineHeight = 60;
  const startY = 460 - (lines.length - 1) * lineHeight / 2;

  const textLines = lines
    .map((line, i) => `<text x="400" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="${palette.fg}">${escapeXml(line)}</text>`)
    .join("\n  ");

  // Different background patterns based on variant and index
  let bgShape = "";
  if (variant === 0) {
    bgShape = `<rect width="800" height="1000" fill="${palette.bg}"/>
      <circle cx="400" cy="500" r="300" fill="${palette.accent}" opacity="0.1"/>`;
  } else {
    // Polka dots pattern for secondary images
    bgShape = `<rect width="800" height="1000" fill="${palette.bg}"/>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle fill="${palette.accent}" cx="20" cy="20" r="3" opacity="0.2"></circle>
      </pattern>
      <rect width="800" height="1000" fill="url(#dots)"/>`;
  }

  // Add varied geometric shapes based on product index
  const shape = index % 3 === 0 ? `<rect x="100" y="100" width="600" height="800" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.2"/>` :
                index % 3 === 1 ? `<circle cx="400" cy="500" r="350" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.2"/>` :
                `<polygon points="400,150 650,850 150,850" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.2"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  ${bgShape}
  ${shape}
  <text x="400" y="380" text-anchor="middle" font-family="Inter, sans-serif" font-size="24" fill="${palette.accent}" letter-spacing="8">${escapeXml(categorySlug.toUpperCase())}</text>
  ${textLines}
  <text x="400" y="850" text-anchor="middle" font-family="Inter, sans-serif" font-size="32" font-weight="600" fill="${palette.fg}">${escapeXml(price)}</text>
  <text x="400" y="920" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="${palette.fg}" opacity="0.5">J&amp;R ECOMMERCE</text>
</svg>`;
}

async function main() {
  console.log("Generating unique product images...");

  const outDir = path.join(process.cwd(), "public", "images", "products");
  fs.mkdirSync(outDir, { recursive: true });

  const products = await prisma.product.findMany({
    include: { category: { select: { slug: true } } }
  });

  let generated = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i]!;
    const priceKes = Math.round(p.basePriceCents / 100).toLocaleString("en-KE");
    const price = `KSh ${priceKes}`;

    for (let v = 0; v < 2; v++) {
      const filename = v === 0 ? `${p.slug}.svg` : `${p.slug}-alt.svg`;
      const filepath = path.join(outDir, filename);
      fs.writeFileSync(filepath, generateSvg(p.name, p.category.slug, price, i, v), "utf8");
    }
    generated++;
  }

  console.log(`Generated ${generated} products x 2 variants = ${generated * 2} unique images.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });