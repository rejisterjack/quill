import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

function configure() {
  if (!env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is required to store documents");
  }
  cloudinary.config({ cloudinary_url: env.CLOUDINARY_URL });
}

export async function storeOriginal(input: {
  bytes: Buffer;
  filename: string;
  resourceType?: "raw" | "auto" | "image";
}): Promise<{ storageKey: string; storageUrl: string }> {
  configure();
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
  const response = await fetch(storageUrl);
  if (!response.ok) throw new Error(`Failed to download stored file (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}
