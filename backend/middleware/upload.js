// Shared multer upload configuration.
//
// Assignment, material, and submission routes previously each defined an
// identical multer storage/limits/fileFilter block plus a removeUploadedFile
// helper. They now share this factory; the only per-route difference is the
// stored-filename prefix.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");

// Reject obviously executable/script payloads regardless of declared MIME type.
const BLOCKED_EXTENSIONS = /\.(exe|bat|cmd|sh|php|jar|msi)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function createUploader(prefix) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
      cb(null, `${Date.now()}-${prefix}-${safeName}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      if (BLOCKED_EXTENSIONS.test(file.originalname)) {
        return cb(new Error("This file type is not allowed."), false);
      }
      cb(null, true);
    }
  });
}

function removeUploadedFile(file) {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

module.exports = { createUploader, removeUploadedFile, uploadsDir };
