"use client";

import { FileUploader } from "./file-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import React from "react";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  url: string;
  isPublic?: boolean;
  category: string; // <-- required in single-file-upload.tsx
};

type AdditionalFilesUploadProps = {
  form: any;
  readOnly: boolean;
  category: string; // <-- ADD THIS
  uploadMultipleFiles: (
    files: File[],
    userId: string,
    assessmentId: string
  ) => Promise<UploadedFile[]>;
  userId: string;
  assessmentId: string;
};

export default function AdditionalFilesUpload({
  form,
  readOnly,
  category, // <-- PULL IT IN
  uploadMultipleFiles,
  userId,
  assessmentId,
}: AdditionalFilesUploadProps) {
  return (
    <FormField
      control={form.control}
      name="additionalFiles"
      render={({ field }) => (
        <FormItem id="form-item-fultiple" className="w-full relative h-full">
          <FormControl className="w-full">
            <div className="w-full">
              <Card className="mt-4 w-full mx-auto">
                <CardHeader>
                  <FormLabel>Additional Files</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Click a file to view, make it public, or remove it.
                  </div>
                </CardHeader>

                {/* 
                  The FileUploader to handle multi-file selection
                */}
                <FileUploader
                  accept={{ "application/pdf": [] }}
                  multiple
                  maxFiles={10}
                  onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const fileList = e.target.files;
                    if (!fileList) return;
                    const files = Array.from(fileList);

                    // 1) Post to /api/uploads with userId & assessmentId
                    const newUploads = await uploadMultipleFiles(
                      files,
                      userId,
                      assessmentId
                    );

                    // Merge with existing form field array
                    if (newUploads.length > 0) {
                      const currentFiles = field.value || [];
                      field.onChange([...currentFiles, ...newUploads]);
                    }
                  }}
                  className="w-3/4 mx-auto mb-2"
                  disabled={readOnly}
                />

                {/* 
                  Display uploaded files
                */}
                {field.value && field.value.length > 0 && (
                  <>
                    <CardContent className="flex flex-wrap mt-2 gap-2">
                      {field.value.map((file: UploadedFile, index: number) => (
                        <div
                          key={index}
                          className="border-dashed border rounded-lg p-2 flex w-64 items-center justify-between gap-2"
                        >
                          {/* Left Icon */}
                          <div className="flex-shrink-0">
                            <FileIcon className="h-6 w-6" />
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            {/* If isPublic, link to file */}
                            {file.isPublic ? (
                              <Link
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate"
                                title={file.name}
                              >
                                {file.name}
                              </Link>
                            ) : (
                              <span
                                className="block truncate"
                                title={file.name}
                              >
                                {file.name} (private)
                              </span>
                            )}
                            <div className="text-xs">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {!readOnly && (
                            <div className="flex flex-col gap-1 items-end">
                              {/* Toggle Public */}
                              {file.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const newPublicValue = !file.isPublic;
                                      const res = await fetch(
                                        `/api/upload/${file.id}`,
                                        {
                                          method: "PUT",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            isPublic: newPublicValue,
                                          }),
                                        }
                                      );
                                      if (res.ok) {
                                        const updatedData = await res.json();
                                        const updatedFile = updatedData.file;

                                        // Replace item in array
                                        const updatedFiles = [...field.value];
                                        updatedFiles[index] = {
                                          ...file,
                                          isPublic: updatedFile.isPublic,
                                        };
                                        field.onChange(updatedFiles);
                                      } else {
                                        console.error(
                                          "Error toggling public",
                                          await res.text()
                                        );
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Error toggling public",
                                        err
                                      );
                                    }
                                  }}
                                >
                                  {file.isPublic
                                    ? "Make Private"
                                    : "Make Public"}
                                </Button>
                              )}

                              {/* Remove / Delete */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={async () => {
                                  // If there's an id, call DELETE from DB
                                  if (file.id) {
                                    try {
                                      const res = await fetch(
                                        `/api/upload/${file.id}`,
                                        { method: "DELETE" }
                                      );
                                      if (!res.ok) {
                                        console.error(
                                          "Failed to delete file from server"
                                        );
                                        return;
                                      }
                                    } catch (err) {
                                      console.error(
                                        "Error deleting file from server:",
                                        err
                                      );
                                    }
                                  }

                                  // Remove from local state
                                  const updatedFiles = field.value.filter(
                                    (_: any, i: number) => i !== index
                                  );
                                  field.onChange(updatedFiles);
                                }}
                              >
                                <XIcon size={16} />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>

                    {!readOnly ? (
                      <CardFooter>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Clear all from local state
                              field.onChange([]);
                            }}
                          >
                            Clear All
                          </Button>
                        </div>
                      </CardFooter>
                    ) : null}
                  </>
                )}
              </Card>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
