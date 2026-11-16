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
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: { message: "No file provided" } }, { status: 400 });
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: { message: "Invalid file type. Please upload a JPG, PNG, or WEBP." } }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filepath = path.join(uploadDir, filename);

  try {
    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;
    return NextResponse.json({ data: { url } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: { message: "Failed to save file" } }, { status: 500 });
  }
}