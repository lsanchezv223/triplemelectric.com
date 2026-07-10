import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import heicConvert from "heic-convert";
import sharp from "sharp";

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string | null;
};

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getR2Config(): R2Config | null {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim() || null;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    endpoint: normalizeBaseUrl(endpoint),
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: publicBaseUrl ? normalizeBaseUrl(publicBaseUrl) : null
  };
}

function createR2Client(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    },
    forcePathStyle: true
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120) || "file";
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

function isHeicFile(file: File) {
  return /\.(heic|heif)$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";
}

function replaceFileExtension(fileName: string, extension: string) {
  const safeExtension = extension.replace(/^\.+/, "");
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName}.${safeExtension}`;
}

export function buildAttachmentStorageKey(entryId: string, fileName: string) {
  const prefix = `work-entries/${entryId}`;
  const safeName = sanitizeFileName(fileName);
  return `${prefix}/${Date.now()}-${randomUUID()}-${safeName}`;
}

async function optimizeImageAttachment(file: File) {
  const sourceBuffer = Buffer.from(await file.arrayBuffer());
  try {
    const imageBuffer = isHeicFile(file)
      ? Buffer.from(
          await heicConvert({
            buffer: sourceBuffer,
            format: "JPEG",
            quality: 0.92
          })
        )
      : sourceBuffer;

    const outputBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({
        quality: 80,
        effort: 4
      })
      .toBuffer();

    const finalFileName = replaceFileExtension(file.name, "webp");

    return {
      buffer: outputBuffer,
      fileName: finalFileName,
      mimeType: "image/webp",
      sizeBytes: outputBuffer.byteLength,
      originalName: file.name
    };
  } catch (error) {
    console.warn("Image optimization failed, uploading original file instead.", {
      fileName: file.name,
      mimeType: file.type,
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      buffer: sourceBuffer,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: sourceBuffer.byteLength,
      originalName: file.name
    };
  }
}

export type PreparedAttachmentFile = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

export async function prepareAttachmentFile(file: File): Promise<PreparedAttachmentFile> {
  if (isImageFile(file)) {
    return optimizeImageAttachment(file);
  }

  return {
    buffer: Buffer.from(await file.arrayBuffer()),
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    originalName: file.name
  };
}

export async function uploadPreparedAttachmentToR2({
  entryId,
  attachment
}: {
  entryId: string;
  attachment: PreparedAttachmentFile;
}) {
  const config = getR2Config();

  if (!config) {
    throw new Error("R2 configuration is incomplete.");
  }

  const client = createR2Client(config);
  const storageKey = buildAttachmentStorageKey(entryId, attachment.fileName);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Body: attachment.buffer,
      ContentType: attachment.mimeType,
      ContentLength: attachment.sizeBytes,
      Metadata: {
        originalName: attachment.originalName
      }
    })
  );

  return {
    storageKey,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes
  };
}

export async function uploadAttachmentToR2({
  entryId,
  file
}: {
  entryId: string;
  file: File;
}) {
  const attachment = await prepareAttachmentFile(file);
  return uploadPreparedAttachmentToR2({ entryId, attachment });
}

export async function getAttachmentUrl(storageKey: string) {
  const config = getR2Config();

  if (!config) {
    throw new Error("R2 configuration is incomplete.");
  }

  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${storageKey}`;
  }

  const client = createR2Client(config);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey
    }),
    { expiresIn: 60 * 60 }
  );
}

export async function deleteAttachmentFromR2(storageKey: string) {
  const config = getR2Config();

  if (!config) {
    return;
  }

  const client = createR2Client(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: storageKey
    })
  );
}
