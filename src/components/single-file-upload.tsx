"use client";

import { FileUploader } from "@/components/file-uploader";
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
import { Progress } from "@/components/ui/progress";
import { SingleFile } from "@/features/assessments/components/assessment-form";
import Link from "next/link";
import { useState } from "react";

/**
 * The SingleFile interface must match what we return from 'uploadSingleFile'.
 */

type Props = {
  form: any;
  name: string;
  label: string;
  readOnly: boolean;
  category: string; // <-- NEW
  // The function that does the actual upload:
  // Must return Promise<SingleFile | null>
  uploadSingleFile: (
    file: File,
    userId: string,
    assessmentId: string,
    category: string,
    onProgress: (p: number) => void
  ) => Promise<SingleFile | null>;

  // We also pass these so the component can call uploadSingleFile properly
  userId: string;
  assessmentId: string;

  // If you have a customPreview for the file while uploading
  customPreview?: (file: File) => React.ReactNode;
};

export default function SingleFileUpload({
  form,
  name,
  label,
  readOnly,
  uploadSingleFile,
  userId,
  assessmentId,
  category,
  customPreview,
}: Props) {
  // Track the upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // The field value is either a single-file object or null
        const existingFile = field.value as SingleFile | null;

        return (
          <FormItem className="w-full relative">
            <FormLabel>{label}</FormLabel>
            <FormControl className="w-full">
              <div className="w-full mt-2">
                <Card>
                  <CardHeader className="pb-2" />

                  {/* 
                    A) If there's NO existing file, and not readOnly:
                       => show the file uploader
                  */}
                  {!readOnly && !existingFile && (
                    <CardContent>
                      <FileUploader
                        accept={{ "application/pdf": [] }}
                        multiple={false}
                        maxFiles={1}
                        disabled={readOnly}
                        onChange={async (
                          e: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const fileList = e.target.files;
                          if (!fileList?.length) return;
                          const file = fileList[0];
                          setUploadProgress(0);

                          // Call your custom uploadSingleFile(...)
                          const uploaded = await uploadSingleFile(
                            file,
                            userId,
                            assessmentId,
                            category,
                            (progress: any) => setUploadProgress(progress)
                          );

                          if (uploaded) {
                            // Save it in the form field
                            field.onChange(uploaded);
                          }
                        }}
                        className="w-3/4 mx-auto mb-2"
                      />

                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} className="mt-2" />
                      )}
                    </CardContent>
                  )}

                  {/* 
                    B) If we DO have an existingFile, show a "file card"
                  */}
                  {existingFile && (
                    <>
                      <CardContent>
                        <div className="border-dashed border rounded-lg p-2 flex w-80 items-center justify-between gap-2">
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            <FileIcon className="h-6 w-6" />
                          </div>

                          {/* Filename + size (truncated) */}
                          <div className="flex-1 min-w-0">
                            {existingFile.isPublic ? (
                              <Link
                                href={`/api/upload/${existingFile.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate"
                                title={existingFile.fileName}
                              >
                                {existingFile.fileName}
                              </Link>
                            ) : (
                              <span
                                className="block truncate"
                                title={existingFile.fileName}
                              >
                                {existingFile.fileName} (private)
                              </span>
                            )}
                            <div className="text-xs">
                              {(existingFile.fileSize / (1024 * 1024)).toFixed(
                                1
                              )}{" "}
                              MB
                            </div>
                          </div>

                          {/* Buttons (only if not readOnly) */}
                          {!readOnly && (
                            <div className="flex flex-col gap-1 items-end">
                              {/* Toggle public */}
                              {existingFile.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button" // <--- ADD THIS
                                  onClick={async () => {
                                    console.log("HERE HERE");
                                    try {
                                      const newPublicValue =
                                        !existingFile.isPublic;
                                      const res = await fetch(
                                        `/api/upload/${existingFile.id}`,
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
                                    } catch (err) {
                                      console.error(
                                        "Error toggling public",
                                        err
                                      );
                                    }
                                  }}
                                >
                                  {existingFile.isPublic
                                    ? "Make Private"
                                    : "Make Public"}
                                </Button>
                              )}

                              {/* Remove button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button" // <--- ADD THIS
                                onClick={async () => {
                                  // If there's an ID, delete from DB
                                  if (existingFile.id) {
                                    try {
                                      const res = await fetch(
                                        `/api/upload/${existingFile.id}`,
                                        { method: "DELETE" }
                                      );
                                      if (!res.ok) {
                                        console.error(
                                          "Error deleting file from server"
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
                                  // Then remove from local form
                                  field.onChange(null);
                                  setUploadProgress(0);
                                }}
                              >
                                <XIcon size={16} />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Show progress if currently uploading */}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <CardFooter>
                          <Progress value={uploadProgress} className="w-full" />
                        </CardFooter>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
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
