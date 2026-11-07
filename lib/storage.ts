import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

function configureCloudinary() {
  if (!env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is required for cloud storage");
  }
  cloudinary.config({ cloudinary_url: env.CLOUDINARY_URL });
}

function localRoot() {
  return path.join(process.cwd(), ".quill-uploads");
}

/** True when originals go to Cloudinary; otherwise local disk under .quill-uploads. */
export function usesCloudinaryStorage() {
  return Boolean(env.CLOUDINARY_URL);
}

export async function storeOriginal(input: {
  bytes: Buffer;
  filename: string;
  resourceType?: "raw" | "auto" | "image";
}): Promise<{ storageKey: string; storageUrl: string }> {
  if (!usesCloudinaryStorage()) {
    const id = randomUUID();
    const safe = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
    const rel = path.join(id, safe || "upload.bin");
    const abs = path.join(localRoot(), rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, input.bytes);
    return {
      storageKey: `local:${rel}`,
      storageUrl: `file://${abs}`,
    };
  }

  configureCloudinary();
  const uploaded = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "quill",
        resource_type: input.resourceType ?? "raw",
        filename_override: input.filename,
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err || !result) reject(err || new Error("Cloudinary upload failed"));
        else resolve({ public_id: result.public_id, secure_url: result.secure_url });
      },
    );
    stream.end(input.bytes);
  });
  return { storageKey: uploaded.public_id, storageUrl: uploaded.secure_url };
}

export async function downloadOriginal(storageUrl: string): Promise<Buffer> {
  if (storageUrl.startsWith("file://")) {
    return readFile(storageUrl.replace("file://", ""));
  }
  const response = await fetch(storageUrl);
  if (!response.ok) throw new Error(`Failed to download stored file (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}
