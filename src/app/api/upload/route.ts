import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// -----------------------------------------
// POST /api/uploads
// -----------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form-data.
    // Note: Next.js doesn’t parse multipart forms by default.
    // You might need a middleware or a helper library.
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isPublic = false;
    const category = formData.get("category")?.toString();
    const assessmentId = formData.get("assessmentId")?.toString();
    const uploadedById = formData.get("userId")?.toString();

    if (!file || !assessmentId || !uploadedById || !category) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Create a unique filename (for example, prefixing with a timestamp)
    const fileName = `${Date.now()}-${file.name}`;
    const relativeFilePath = path.join("assets", "uploads", fileName);
    const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

    // Read file data and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absoluteFilePath, buffer);

    // Create a new UploadedFile record in the DB
    const newFile = await prisma.uploadedFile.create({
      data: {
        filePath: relativeFilePath,
        fileName: file.name,
        mimeType: file.type,
        fileSize: buffer.length,
        isPublic,
        category: category as any, // ensure that the string value matches your UploadedFileCategory enum
        uploadedById,
        assessmentId,
      },
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
