// or "fs" if you prefer sync operations
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Adjust to your prisma client import path

// -----------------------------------------
// GET /api/uploads/[fileId]
// -----------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // Find the record in the DB
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    // If not found, return 404
    if (!fileRecord) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    // Check if the file is public
    if (!fileRecord.isPublic) {
      // In a real app, you might check if the user is authorized, or just block.
      return NextResponse.json(
        { message: "File is not public." },
        { status: 403 }
      );
    }

    // The filePath in DB might look like "assets/uploads/1680034550000-myfile.pdf"
    const filePathOnDisk = path.join(process.cwd(), fileRecord.filePath);

    // Read the file from disk
    const fileBuffer = await fs.readFile(filePathOnDisk);

    // Return the file as a binary response
    return new NextResponse(fileBuffer, {
      headers: {
        // Use the stored mimeType or default to application/octet-stream
        "Content-Type": fileRecord.mimeType || "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// -----------------------------------------
// PUT /api/uploads/[fileId]
// -----------------------------------------
// Example JSON body: { "isPublic": true }
export async function PUT(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    // Attempt to parse JSON body
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // For this example, let's allow toggling isPublic
    // (You could allow other fields here, too)
    const { isPublic } = body as { isPublic?: boolean };

    // Find the record first
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });
    if (!fileRecord) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    // Update the record
    // NOTE: You could also check if the user is allowed to do this
    const updatedFile = await prisma.uploadedFile.update({
      where: { id: fileId },
      data: {
        // Only update if isPublic was provided
        ...(typeof isPublic === "boolean" && { isPublic }),
      },
    });

    return NextResponse.json({
      message: "File updated successfully",
      file: updatedFile,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// -----------------------------------------
// DELETE /api/uploads/[fileId]
// -----------------------------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;

    // Find the record so we know the path on disk
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!fileRecord) {
      return NextResponse.json({ message: "File not found." }, { status: 404 });
    }

    // Construct the physical path
    const filePathOnDisk = path.join(process.cwd(), fileRecord.filePath);

    // Remove the file from disk
    try {
      await fs.unlink(filePathOnDisk);
    } catch (err) {
      // If the file doesn't exist on disk, log it but continue
      console.warn("Could not delete file on disk:", err);
    }

    // Remove the record from DB
    await prisma.uploadedFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      message: "File deleted successfully",
      fileId,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
