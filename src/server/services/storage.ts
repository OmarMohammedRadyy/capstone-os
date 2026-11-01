import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/server/config/env";
import { AppError } from "@/server/lib/errors";
import { sha256 } from "@/server/lib/crypto";

export interface StoredFileMetadata {
  storageKey: string;
  byteSize: number;
  checksumSha256: string;
  mimeType: string;
  originalName: string;
}

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "text/plain",
  "text/markdown",
  "application/json",
]);

export async function storeFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  destinationPrefix: string
): Promise<StoredFileMetadata> {
  const byteSize = buffer.length;
  const maxBytes = env.UPLOAD_MAX_MB * 1024 * 1024;

  if (byteSize > maxBytes) {
    throw AppError.badRequest(`File exceeds maximum size of ${env.UPLOAD_MAX_MB}MB.`, "FILE_TOO_LARGE");
  }

  // Sanitize filename and extract safe extension
  const ext = path.extname(originalName).toLowerCase().slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const safeFilename = `${Date.now()}_${randomSuffix}${ext}`;
  const storageKey = `${destinationPrefix}/${safeFilename}`.replace(/\\/g, "/");

  const checksumSha256 = sha256(buffer);

  if (env.STORAGE_DRIVER === "local") {
    const fullPath = path.join(process.cwd(), env.STORAGE_LOCAL_DIR, storageKey);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
  } else {
    // S3 driver hook for remote storage
    // Local driver is active for dev parity, S3 client can be connected when AWS/MinIO credentials exist
  }

  return {
    storageKey,
    byteSize,
    checksumSha256,
    mimeType,
    originalName: path.basename(originalName).slice(0, 255),
  };
}

export async function getFileBuffer(storageKey: string): Promise<Buffer> {
  if (env.STORAGE_DRIVER === "local") {
    const fullPath = path.join(process.cwd(), env.STORAGE_LOCAL_DIR, storageKey);
    try {
      return await fs.readFile(fullPath);
    } catch {
      throw AppError.notFound("File not found in storage.");
    }
  }
  throw AppError.internal("Remote storage retrieval not implemented in this mode.");
}

