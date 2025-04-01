"use client";

import AdditionalFilesUpload from "@/components/additional-files-upload";
import SingleFileUpload from "@/components/single-file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseAssessmentData } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentStatus, UploadedFile, UserType } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

/**
 * We need a matching SingleFile interface for returning from uploadSingleFile
 */
export interface SingleFile {
  assessmentId?: string;
  category?: string;
  createdAt?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  id?: string;
  isPublic?: false;
  mimeType?: string;
  updatedAt?: string;
  uploadedById?: string;
}

const defaultValues = {
  title: "",
  certificate: null,
  executiveReport: null,
  technicalReport: null,
  additionalFiles: [],
  clientId: "",
  status: AssessmentStatus.PROGRAMMED,
  deadline: format(new Date(), "yyyy-MM-dd"),
};

// Optional custom PDF preview
function customPreview(file: File) {
  if (file.type === "application/pdf") {
    return (
      <div className="flex items-center space-x-2">
        <PdfIcon size={24} />
        <span>{file.name}</span>
      </div>
    );
  }
  return (
    <img
      src={URL.createObjectURL(file)}
      alt={file.name}
      className="w-16 h-16 object-cover"
    />
  );
}

export default function AssessmentForm({
  initialData,
  pageTitle,
  readOnly = false,
}: {
  initialData: any | null; // The raw data from the server
  pageTitle: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isClientUser = session?.user?.userType === UserType.CLIENT;
  const defaultClientId = isClientUser ? session?.user?.clientId : "";
  const userId = session?.user?.id;

  // 1) Transform initialData to separate out single vs. multiple files
  const parsedData = initialData ? parseAssessmentData(initialData) : null;

  // 2) Create merged defaults
  const mergedDefaults = {
    ...defaultValues,
    ...parsedData,
    clientId: parsedData?.clientId || defaultClientId,
    deadline: parsedData?.deadline
      ? format(new Date(parsedData.deadline), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  };

  // 3) Initialize form with merged defaults
  const form = useForm({ defaultValues: mergedDefaults });
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients);
        } else {
          toast.error("Failed to load clients");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error fetching clients");
      }
    }
    fetchClients();
  }, []);

  /**
   * SINGLE-FILE UPLOAD
   * Matches the signature used by SingleFileUpload:
   * (file, userId, assessmentId, onProgress) => Promise<SingleFile | null>
   *
   * We now return a SingleFile object, not just a string.
   */
  async function uploadSingleFile(
    file: File,
    userId: string,
    assessmentId: string,
    category: string,
    onProgress: (p: number) => void
  ): Promise<SingleFile | null> {
    if (!userId || !initialData?.id) {
      toast.error("User ID or Assessment ID not found");
      return null;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("assessmentId", assessmentId);
    formData.append("file", file);
    formData.append("category", category); // <--- pass the category to backend

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
          );
          onProgress(progress);
        },
      });

      // Server response: { files: [ UploadedFileRecord ] }
      const newFiles = response.data.files;
      if (!newFiles || !newFiles[0]) {
        toast.error("Upload returned no file data");
        return null;
      }

      const firstFile = newFiles[0];
      // Construct a SingleFile object:
      const singleFile: SingleFile = {
        id: firstFile.id,
        fileName: firstFile.fileName,
        fileSize: firstFile.fileSize || 0,
        isPublic: firstFile.isPublic,
        category,
      };

      return singleFile;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
      return null;
    }
  }

  /**
   * MULTIPLE-FILES UPLOAD
   * Matches AdditionalFilesUpload:
   * (files) => Promise<{ name: string; size: number; url: string }[]>
   */
  /**
   * MULTIPLE-FILES UPLOAD
   * (files, userId, assessmentId) => Promise<UploadedFile[]>
   */
  async function uploadMultipleFiles(
    files: File[],
    userId: string,
    assessmentId: string
  ): Promise<UploadedFile[]> {
    if (!userId || !assessmentId) {
      toast.error("User ID or Assessment ID not found");
      return [];
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("assessmentId", assessmentId);
    // If needed, also append category here if the backend expects it:
    // formData.append("category", "ADDITIONAL_FILE");

    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Failed to upload files");
        return [];
      }

      const data = await res.json();
      const newFiles = data.files;
      if (!Array.isArray(newFiles)) {
        toast.error("Files upload did not return an array");
        return [];
      }
      return newFiles.map((f: any) => ({
        id: f.id,
        name: f.fileName, // Map fileName to name
        size: f.fileSize || 0, // Map fileSize to size (default to 0 if null)
        url: `/api/upload/${f.id}`, // Generate a URL based on the file id
        isPublic: f.isPublic,
        category: f.category,
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
      return [];
    }
  }

  /**
   * SUBMIT FORM
   */
  async function onSubmit(values: any) {
    if (readOnly) return;
    try {
      const dataToSubmit = {
        ...values,
        deadline: new Date(values.deadline).toISOString(),
      };

      // If there's no "id" in initialData, we're creating a new assessment
      const endpoint = initialData
        ? `/api/assessments/${initialData.id}`
        : "/api/assessments";

      const res = await fetch(endpoint, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!res.ok) {
        await res.json();
        toast.error("Error submitting assessment.");
        return;
      }

      await res.json();
      toast.success("Assessment submitted successfully!");
      router.push("/dashboard/assessment");
    } catch (error) {
      console.error("Error while submitting assessment:", error);
      toast.error("An unexpected error occurred.");
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Assessment Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter assessment title"
                      {...field}
                      disabled={readOnly || isClientUser}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Dropdown */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AssessmentStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline Date Picker */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Client Selection */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value: string) => field.onChange(value)}
                      value={field.value || defaultClientId}
                      disabled={isClientUser || readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certificate SingleFileUpload */}
            <SingleFileUpload
              form={form}
              name="certificate"
              label="Certificate"
              category="CERTIFICATE" // <--- NEW
              readOnly={readOnly || isClientUser}
              uploadSingleFile={uploadSingleFile}
              userId={userId || ""}
              assessmentId={initialData?.id || ""}
              customPreview={customPreview}
            />

            {/* Executive Report SingleFileUpload */}
            <SingleFileUpload
              form={form}
              name="executiveReport"
              label="Executive Report"
              category="EXECUTIVE_REPORT" // <--- NEW
              readOnly={readOnly || isClientUser}
              uploadSingleFile={uploadSingleFile}
              userId={userId || ""}
              assessmentId={initialData?.id || ""}
              customPreview={customPreview}
            />

            {/* Technical Report SingleFileUpload */}
            <SingleFileUpload
              form={form}
              name="technicalReport"
              label="Technical Report"
              category="TECHNICAL_REPORT" // <--- NEW
              readOnly={readOnly || isClientUser}
              uploadSingleFile={uploadSingleFile}
              userId={userId || ""}
              assessmentId={initialData?.id || ""}
              customPreview={customPreview}
            />

            {/* Additional Files */}
            <AdditionalFilesUpload
              form={form}
              readOnly={readOnly}
              category="ADDITIONAL_FILE" // <--- NEW
              uploadMultipleFiles={uploadMultipleFiles}
              userId={userId || ""}
              assessmentId={initialData?.id || ""}
            />

            {/* Submit Button */}
            {!readOnly && (
              <Button asChild className="mt-3">
                <button type="submit">{pageTitle}</button>
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// (Optional) Your inline PDF icon, same as before:
function PdfIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 2v6h6"
      />
    </svg>
  );
}
