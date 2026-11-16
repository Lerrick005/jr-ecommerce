import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: { message: "No files provided" } }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const results = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);
    results.push({ originalName: file.name, url: `/uploads/products/${filename}` });
  }

  return NextResponse.json({ data: results });
}