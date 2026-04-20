import fs from "fs";
import path from "path";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");

export function getDataDir() {
  const configuredDir = process.env.DATA_DIR?.trim();

  if (!configuredDir) {
    return DEFAULT_DATA_DIR;
  }

  return path.isAbsolute(configuredDir)
    ? configuredDir
    : path.join(process.cwd(), configuredDir);
}

export function getDataFilePath(fileName: string) {
  return path.join(getDataDir(), fileName);
}

export function ensureDataDirSync() {
  fs.mkdirSync(getDataDir(), { recursive: true });
}
