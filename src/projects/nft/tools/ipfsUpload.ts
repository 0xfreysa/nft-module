import { PinataSDK } from "pinata-web3";
import path from "path";
import fs from "fs";

async function getFilesFromDirectory(dirPath: string): Promise<File[]> {
  const files: File[] = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      const buffer = await fs.promises.readFile(fullPath);
      const file = new File([buffer], entry.name, {
        type: getContentType(entry.name),
      });
      files.push(file);
    }
  }
  return files;
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    // Add more types as needed
  };
  return contentTypes[ext] || "application/octet-stream";
}

export async function uploadDirectory(directory: string) {
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT environment variable is not set in .env file");
  }

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
  });

  try {
    const files = await getFilesFromDirectory(directory);
    if (files.length === 0) {
      console.log("No files found in directory");
      return;
    }

    const res = await pinata.upload.fileArray(files);
    return res.IpfsHash;
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
