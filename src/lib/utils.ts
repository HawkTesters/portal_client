import { type ClassValue, clsx } from "clsx";
import * as md5 from "md5";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {}
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`;
}

export function getGravatarUrl(email: string) {
  const base = "https://www.gravatar.com/avatar/";
  const hash = md5(email.trim().toLowerCase());
  // Use the 'd' parameter to pick a fallback (identicon, monsterid, wavatar, retro, robohash, etc.)
  return `${base}${hash}?d=identicon`;
}

export function parseAssessmentData(assessment: any) {
  if (!assessment) return null;

  // Create a clone so we don't mutate the original
  const result = { ...assessment };

  // Initialize the expected single fields to null, multiple to an empty array
  result.certificate = null;
  result.executiveReport = null;
  result.technicalReport = null;
  result.additionalFiles = [];

  if (assessment.uploadedFiles && Array.isArray(assessment.uploadedFiles)) {
    // Find one CERTIFICATE file
    result.certificate =
      assessment.uploadedFiles.find((f: any) => f.category === "CERTIFICATE") ||
      null;

    // One EXECUTIVE_REPORT
    result.executiveReport =
      assessment.uploadedFiles.find(
        (f: any) => f.category === "EXECUTIVE_REPORT"
      ) || null;

    // One TECHNICAL_REPORT
    result.technicalReport =
      assessment.uploadedFiles.find(
        (f: any) => f.category === "TECHNICAL_REPORT"
      ) || null;

    // Additional files
    result.additionalFiles = assessment.uploadedFiles.filter(
      (f: any) => f.category === "ADDITIONAL_FILE"
    );
  }

  // Remove the original array if you don't need it anymore
  delete result.uploadedFiles;

  return result;
}
