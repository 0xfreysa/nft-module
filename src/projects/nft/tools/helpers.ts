import path from "path";
import fs from "fs";

export async function saveUrlToFile(
  url: string,
  baseDirectory: string,
  filename: string
) {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const imagePath = path.join(baseDirectory, filename);
  fs.writeFileSync(imagePath, buffer);
  console.log(`Saved image to ${imagePath}`);
}
